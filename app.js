"use strict";

const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const app = express();

const tasks = [];

app.use(multer().none());

/* Include middlewares for handling POST requests */
app.use(express.urlencoded({ extended: true })) // for application/x-www-form-urlencoded
app.use(express.json()); // for application/json
app.use(multer().none()); // for multipart/form-data (required with FormData)

app.get('/hello', (request, response) => {
  console.log("Accessed hello");
  let name = request.query['name'];

  response.type("text");
  response.send("Hello, " + name);
})

async function addTask(name, desc,)

app.use(express.static("public"));
const PORT = process.env.PORT || 8000;
app.listen(PORT);