"use strict";

const express = require('express');
const multer = require('multer');
const app = express();


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

app.use(express.static("public"));
const PORT = process.env.PORT || 8000;
app.listen(PORT);