"use strict";

const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const app = express();

/* Include middlewares for handling POST requests */
app.use(express.urlencoded({ extended: true })) // for application/x-www-form-urlencoded
app.use(express.json()); // for application/json
app.use(multer().none()); // for multipart/form-data (required with FormData)

app.get('/tasks/get', async (request, response) => {
  try {
    let planner = await readPlanner();
    response.json(planner);
  } catch (err) {
    console.log(err);
  }
})

app.get('/tasks/clearall', async (request, response) => {
  try {
    let planner = await readPlanner()
    planner.tasks = [];
    await fs.writeFile("planner.txt", JSON.stringify(planner))
    response.json(planner);
  } catch (err) {
    console.log(err);
  }
})

app.post('/tasks/add', async (request, response) => {
  console.log(request.body);
  let name = request.body.name;
  let desc = request.body.desc;
  let day = request.body.day;
  try {
    let planner = await addTask(name, desc, day);
    response.json(planner);
  } catch (err) {
    console.log(err);
  }
})

async function addTask(name, desc, day) {
  let task = {};
  task['name'] = name;
  task['desc'] = desc;
  task['day'] = day;
  try {
    let planner = await readPlanner();
    planner.tasks.push(task);
    await fs.writeFile("planner.txt", JSON.stringify(planner));
    return planner;
  } catch (err) {
    console.log(err);
  }
}

async function readPlanner() {
  let planner = await fs.readFile("planner.txt", "utf-8");
  return JSON.parse(planner);
}


app.use(express.static("public"));
const PORT = process.env.PORT || 8000;
app.listen(PORT);