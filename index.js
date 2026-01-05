const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const mongodbMemoryServer = require('mongodb-memory-server');
const path = require('path'); // Ensure path is at the top level
const crypto = require('crypto');

async function createAuditLog(db, action, entityId, payload) {
  const auditCollection = db.collection('audit_log');
  // Simple "last one wins" approach for prototype.
  // In a real high-concurrency environment, we would use a queue or transaction
  // to ensure the chain is strictly linear without race conditions.
  const lastLog = await auditCollection.find().sort({ timestamp: -1 }).limit(1).toArray();
  const previousHash = lastLog.length > 0 ? lastLog[0].hash : 'GENESIS_HASH_0000000000000000000000000000';
  const timestamp = new Date();

  // Normalize payload to string for hashing to ensure consistency
  const payloadStr = JSON.stringify(payload);

  const dataToHash = timestamp.toISOString() + action + entityId + payloadStr + previousHash;
  const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

  const newLog = {
    action,
    entityId,
    payload, // Storing full payload for audit visibility
    timestamp,
    previousHash,
    hash
  };

  await auditCollection.insertOne(newLog);
}

async function wrapper() {
  const mongoServer = new mongodbMemoryServer.MongoMemoryServer();
  try {
    await mongoServer.ensureInstance();
    const mongoUri = await mongoServer.getUri();

    mongodb.MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(client => {
        const db = client.db('prod'); // Or get the default DB if you don't have a specific one

        const app = express();
        const port = 3000;
        // const path = require('path'); // Removed from here

        // Middleware to attach db to req
        app.use((req, res, next) => {
          req.db = db;
          next();
        });

        app.use(bodyParser.json());

        // Serve Angular static files
        app.use(express.static(path.join(__dirname, 'angular-ui', 'dist', 'angular-ui', 'browser')));

        // Serve static files from the 'static' directory (if still needed, ensure it doesn't conflict)
        // For now, assuming Angular handles all UI, so /static might be for other purposes or removable.
        // If Angular app also uses a /static path, this could conflict or need adjustment.
        // For this task, we are focusing on serving the Angular app.
        // Let's keep it but be mindful.
        app.use('/static', express.static(path.join(__dirname, 'static')));

        // Old route for serving pages/index.html is now removed.
        // The catch-all route below will handle serving Angular's index.html.

        app.post('/list', (req, res) => {
          const rawContent = req.body.text;
          // Ensure content is provided
          if (!rawContent) {
            return res.status(400).send({ error: 'Content cannot be empty' });
          }

          // Smart Parsing Logic
          const priorityRegex = /!(critical|high|medium|low)/i;
          const tagRegex = /#(\w+)/g;
          const dueDateRegex = /@(\d{4}-\d{2}-\d{2})/;

          let priority = 'medium';
          const priorityMatch = rawContent.match(priorityRegex);
          if (priorityMatch) {
            priority = priorityMatch[1].toLowerCase();
          }

          const tags = [];
          let tagMatch;
          while ((tagMatch = tagRegex.exec(rawContent)) !== null) {
            tags.push(tagMatch[1]);
          }

          let dueDate = null;
          const dateMatch = rawContent.match(dueDateRegex);
          if (dateMatch) {
            dueDate = new Date(dateMatch[1]);
          }

          // Clean content by removing metadata markers
          let content = rawContent
            .replace(priorityRegex, '')
            .replace(tagRegex, '')
            .replace(dueDateRegex, '')
            .replace(/\s+/g, ' ')
            .trim();

          // Fallback if cleaning removed everything
          if (!content) content = rawContent;

          const newTodo = {
            content,
            rawContent,
            priority,
            tags,
            dueDate,
            status: 'pending',
            createdAt: new Date()
          };

          req.db.collection('list').insertOne(newTodo)
            .then(async result => {
              // SOTL: Log the creation
              await createAuditLog(req.db, 'CREATE_TASK', result.insertedId.toString(), newTodo);

              res.status(201).send({
                todo: { ...newTodo, _id: result.insertedId },
              });
            })
            .catch(err => {
              console.error("Error inserting document:", err);
              res.status(500).send({ error: 'Failed to add item to list' });
            });
        });

        app.patch('/list/:id', (req, res) => {
          const id = req.params.id;
          const updates = req.body;

          if (!mongodb.ObjectId.isValid(id)) {
             return res.status(400).send({ error: 'Invalid ID format' });
          }

          delete updates._id; // Prevent updating _id

          req.db.collection('list').findOneAndUpdate(
            { _id: new mongodb.ObjectId(id) },
            { $set: updates },
            { returnDocument: 'after' }
          )
          .then(async result => {
            if (!result.value) {
              return res.status(404).send({ error: 'Todo not found' });
            }

            // SOTL: Log the update
            await createAuditLog(req.db, 'UPDATE_TASK', id, updates);

            res.status(200).send({ todo: result.value });
          })
          .catch(err => {
            console.error("Error updating document:", err);
            res.status(500).send({ error: 'Failed to update item' });
          });
        });

        app.delete('/list/:id', (req, res) => {
          const id = req.params.id;

          if (!mongodb.ObjectId.isValid(id)) {
             return res.status(400).send({ error: 'Invalid ID format' });
          }

          req.db.collection('list').deleteOne({ _id: new mongodb.ObjectId(id) })
          .then(async result => {
             if (result.deletedCount === 0) {
               return res.status(404).send({ error: 'Todo not found' });
             }

             // SOTL: Log the deletion
             await createAuditLog(req.db, 'DELETE_TASK', id, { deleted: true });

             res.status(200).send({ message: 'Todo deleted successfully' });
          })
          .catch(err => {
             console.error("Error deleting document:", err);
             res.status(500).send({ error: 'Failed to delete item' });
          });
        });

        // SOTL: Fetch Audit Logs
        app.get('/audit-logs', (req, res) => {
          req.db.collection('audit_log').find({}).sort({ timestamp: -1 }).toArray()
            .then(logs => {
              res.status(200).send({ logs });
            })
            .catch(err => {
              console.error("Error fetching audit logs:", err);
              res.status(500).send({ error: 'Failed to fetch audit logs' });
            });
        });

        // SOTL: Verify Integrity
        app.get('/audit-logs/verify', (req, res) => {
          req.db.collection('audit_log').find({}).sort({ timestamp: 1 }).toArray()
            .then(logs => {
              let isValid = true;
              let previousHash = 'GENESIS_HASH_0000000000000000000000000000';
              const brokenIndices = [];

              for (let i = 0; i < logs.length; i++) {
                const log = logs[i];
                const expectedPreviousHash = log.previousHash;

                // Check chain link
                if (expectedPreviousHash !== previousHash) {
                   isValid = false;
                   brokenIndices.push({ index: i, reason: 'Previous hash mismatch' });
                }

                // Re-calculate hash
                const payloadStr = JSON.stringify(log.payload);
                const dataToHash = new Date(log.timestamp).toISOString() + log.action + log.entityId + payloadStr + previousHash;
                const calculatedHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

                if (calculatedHash !== log.hash) {
                   isValid = false;
                   brokenIndices.push({ index: i, reason: 'Hash mismatch' });
                }

                previousHash = log.hash;
              }

              res.status(200).send({
                status: isValid ? 'INTEGRITY_VERIFIED' : 'INTEGRITY_COMPROMISED',
                count: logs.length,
                brokenIndices
              });
            })
            .catch(err => {
              console.error("Error verifying audit logs:", err);
              res.status(500).send({ error: 'Failed to verify logs' });
            });
        });

        app.get('/list', (req, res) => {
          req.db.collection('list').find({}).toArray()
            .then(todos => {
              res.status(200).send({
                todos,
              });
            })
            .catch(err => {
              console.error("Error fetching documents:", err);
              res.status(500).send({ error: 'Failed to fetch list' });
            });
        });

        // Handle all other routes by serving the Angular app
        app.get('*', (req, res, next) => {
          // Check if the request is for an API endpoint
          if (req.path.startsWith('/list') || req.path.startsWith('/audit-logs')) {
            return next();
          }
          // Serve Angular's index.html for UI routes
          res.sendFile(path.join(__dirname, 'angular-ui', 'dist', 'angular-ui', 'browser', 'index.html'));
        });

        app.listen(port, () => {
          console.log(`App listening at http://localhost:${port}`);
        });
      })
      .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1); // Exit if DB connection fails
      });
  } catch (err) {
    console.error('Error with MongoDB Memory Server:', err);
    process.exit(1); // Exit if server setup fails
  }
}

wrapper();
