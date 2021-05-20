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

app.get('/list', async (request, response) => {
  try {
    let planner = await readPlanner();
    let list = "";
    for (let i = 0; i < planner.tasks.length; i++) {
      list += planner.tasks[i].name + "\n";
    }
    return list;
  } catch (err) {
    console.log(err);
  }
})

app.get('/tasks/clear', async (request, response) => {
  try {
    let uid = request.query.uid * 1;
    console.log(uid);
    let planner = await readPlanner()
    let oldLength = planner.tasks.length;
    for (let i = 0; i < planner.tasks.length; i++) {
      if (planner.tasks[i].uid === uid) {
        console.log(planner.tasks[i]);
        planner.tasks.splice(i, 1);
        i -= 1;
      }
    }
    if (oldLength === planner.tasks.length) {
      response.status(400).send("Error: uid not found");
    } else {
      await writePlanner(planner);
      response.json(planner);
    }
  } catch (err) {
    console.log(err);
  }
})

app.get('/tasks/clearall', async (request, response) => {
  try {
    let planner = await readPlanner()
    planner.tasks = [];
    planner.idCounter = 0;
    await writePlanner(planner);
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

  if (!(name && desc && day)) {
    response.status(400).send("Error: missing name, desc, and/or day queries");
  } else {
    try {
      let planner = await addTask(name, desc, day);
      response.json(planner);
    } catch (err) {
      console.log(err);
    }
  }
})

async function addTask(name, desc, day) {
  let task = {};
  task['name'] = name;
  task['desc'] = desc;
  task['day'] = day;
  try {
    let planner = await readPlanner();
    task['uid'] = planner.idCounter;
    planner.idCounter = planner.idCounter + 1;
    planner.tasks.push(task);
    await writePlanner(planner);
    return planner;
  } catch (err) {
    console.log(err);
  }
}

async function readPlanner() {
  let planner = await fs.readFile("planner.txt", "utf-8");
  return JSON.parse(planner);
}

async function writePlanner(planner) {
  fs.writeFile("planner.txt", JSON.stringify(planner));
}

app.use(express.static("public"));
const PORT = process.env.PORT || 8000;
app.listen(PORT);