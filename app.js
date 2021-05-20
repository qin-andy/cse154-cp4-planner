/**
 * Name: Andy Qin
 * Date: 5.20.2021
 * Section: CSE 154 AE
 *
 * The app.js file for the backend server to handling requests to interact with
 * tasks and store them persistently. Contains functionality to fetch entire planner,
 * clear specific tasks, clear the entire planner, add new tasks, and to list all tasks.
 */

"use strict";

const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const app = express();

/* Include middlewares for handling POST requests */
app.use(express.urlencoded({extended: true})); // for application/x-www-form-urlencoded
app.use(express.json()); // for application/json
app.use(multer().none()); // for multipart/form-data (required with FormData)

/** Endpoint to get the full planner file as a JSON */
app.get('/planner', async (request, response) => {
  try {
    let planner = await readPlanner();
    response.json(planner);
  } catch (err) {
    response.status(500).send(err);
  }
});

/** Endpoint to lists all current tasks in the planner as TEXT, one task on each line */
app.get('/list', async (request, response) => {
  try {
    let planner = await readPlanner();
    let list = "";
    for (let i = 0; i < planner.tasks.length; i++) {
      list += planner.tasks[i].name + "\n";
    }
    response.type("text").send(list);
  } catch (err) {
    response.status(500).send(err);
  }
});

/**
 * Endpoint to clear a specific task in the planner by uid
 * Error if the given uid is not found in the planner
 */
app.get('/tasks/clear/:uid', async (request, response) => {
  try {
    let uid = Number.parseInt(request.params.uid);
    let planner = await readPlanner();
    let oldLength = planner.tasks.length;
    for (let i = 0; i < planner.tasks.length; i++) {
      if (planner.tasks[i].uid === uid) {
        planner.tasks.splice(i, 1);
        i -= 1;
      }
    }
    if (oldLength === planner.tasks.length) {
      response.status(400).type("text")
        .send("Error: uid not found: " + uid);
    } else {
      await writePlanner(planner);
      response.json(planner);
    }
  } catch (err) {
    response.status(500).send(err);
  }
});

/** Endpoint to clears all tasks from the planner file */
app.get('/tasks/clearall', async (request, response) => {
  try {
    let planner = await readPlanner();
    planner.tasks = [];
    planner.idCounter = 0;
    await writePlanner(planner);
    response.json(planner);
  } catch (err) {
    response.status(500).send(err);
  }
});

/**
 * Endpoint to add a specific tsak with the name, desc, and day paramters in the body
 * Responds with an error if any of the paramters are missing or invalid
 */
app.post('/tasks/add', async (request, response) => {
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
      response.status(500).send(err);
    }
  }
});

/**
 * Reads and writes the planner file to include this new task, returns it as a JSON
 * @param {string} name - the task name
 * @param {string} desc - the task description
 * @param {string} day - the task day of week
 * @returns {json} - a json file of the updated planner
 */
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
    return "error";
  }
}

/**
 * Helper function to read the planner file into a JSON object
 * @returns {json} - a JSON object of the planner
 */
async function readPlanner() {
  let planner = await fs.readFile("planner.txt", "utf-8");
  return JSON.parse(planner);
}

/**
 * Helper function to overwrite the planner file with the given JSON object
 * @param {json} planner - the planner object to write to file
 */
async function writePlanner(planner) {
  await fs.writeFile("planner.txt", JSON.stringify(planner));
}

app.use(express.static("public"));
const PORT = process.env.PORT || 8000;
app.listen(PORT);