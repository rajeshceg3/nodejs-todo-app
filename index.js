const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const path = require('path');

app.use(bodyParser.json());
const todos = []

app.post('/list', (req,res)=>{
  const content = req.body.text;
  todos.push({content,});

  res.status(201).send({
    todo : todos[todos.length - 1]
  });
});


app.get('/list', (req, res) => {
 res.status(200).send({
   todos,
 })
});

app.listen(port, () => {
  console.log(` App listening at http://localhost:${port}`);
});
