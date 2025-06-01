const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const mongodbMemoryServer = require('mongodb-memory-server');

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
        const path = require('path'); // path is not used, can be removed

        // Middleware to attach db to req
        app.use((req, res, next) => {
          req.db = db;
          next();
        });

        app.use(bodyParser.json());

        // Serve static files from the 'static' directory
        app.use('/static', express.static(path.join(__dirname, 'static')));

        // Serve index.html for the root path
        app.get('/', (req, res) => {
          res.sendFile(path.join(__dirname, 'pages', 'index.html'));
        });

        app.post('/list', (req, res) => {
          const content = req.body.text;
          // Ensure content is provided
          if (!content) {
            return res.status(400).send({ error: 'Content cannot be empty' });
          }
          req.db.collection('list').insertOne({ content: content }) // Ensure content is correctly passed
            .then(result => {
              // Send back the inserted document, or at least its ID
              res.status(201).send({
                todo: { _id: result.insertedId, content: content },
              });
            })
            .catch(err => {
              console.error("Error inserting document:", err);
              res.status(500).send({ error: 'Failed to add item to list' });
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
