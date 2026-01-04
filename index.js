const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const mongodbMemoryServer = require('mongodb-memory-server');
const path = require('path'); // Ensure path is at the top level

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
            .then(result => {
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
          .then(result => {
            if (!result.value) {
              return res.status(404).send({ error: 'Todo not found' });
            }
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
          .then(result => {
             if (result.deletedCount === 0) {
               return res.status(404).send({ error: 'Todo not found' });
             }
             res.status(200).send({ message: 'Todo deleted successfully' });
          })
          .catch(err => {
             console.error("Error deleting document:", err);
             res.status(500).send({ error: 'Failed to delete item' });
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
          // Check if the request is for an API endpoint (e.g., /list, or other future API routes)
          // Add all your API prefixes here
          if (req.path.startsWith('/list')) {
            return next(); // Pass to the next Express middleware (could be a 404 if no API route matches)
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
