"use strict";

const express = require('express');
const app = express();

app.get('/hello', (request, response) => {
  console.log("Accessed hello");
  let name = request.query['name'];

  response.type("text");
  response.send("Hello, " + name);
})

app.use(express.static("public"));
const PORT = process.env.PORT || 8000;
app.listen(PORT);