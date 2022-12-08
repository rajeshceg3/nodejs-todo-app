const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const mongodbMemoryServer = require('mongodb-memory-server');

 function wrapper( async () =>{
  const mongoServer = new mongodbMemoryServer.MongoMemoryServer();
  await mongoServer.ensureInstance();                      
  const mongoUri = mongoServer.getUri();
})


mongodb.MongoClient.connect( mongoUri, { useNewUrlParser:true})
  .then( client => {
    global.client = client;    
    const app = express();
    const port = 3000;
    const path = require('path');
    
    app.use(bodyParser.json());
//    const todos = []
    
    app.post('/list', (req,res)=>{
      const content = req.body.text;
      client.db('prod').collection('list').insertOne({content,});
      res.status(201).send({
        todo : {content},
      });
    });
    
    
    app.get('/list', (req, res) => {
      client.db('prod').collection('list').find({}).toArray()
        .then( todos =>{
          res.status(200).send({
            todos,
          })
        })
    });
    
    app.listen(port, () => {
      console.log(` App listening at http://localhost:${port}`);
    });
    

  });
