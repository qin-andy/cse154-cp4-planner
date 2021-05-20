/**
 * Name: Andy Qin
 * Date: 5.5.2021
 * Section: CSE 154 AE
 *
 * The main javascript file for the plain and simple planner. Includes
 * functionality to add both custom and random tasks, with the random
 * tasks sourced from BoredAPI (see footer). Dynamically adjusts
 * the planner on the html page with tasks as specified by the user.
 */

"use strict";

(function () {
  window.addEventListener("load", init);
  let allTasks = [];

  /** Initilizes task manager event listesners and loads tasks from the server */
  function init() {
    id("task-submit").addEventListener("click", addTask);
    id("task-type").addEventListener("change", toggleTaskType);
    id("clear-all").addEventListener("click", clearServerTasks);
    refreshPlanner();
  }

  /** Toggles the type of task manager panel's task type, either custom or random */
  function toggleTaskType() {
    id("custom-add").classList.toggle("hidden");
    id("random-add").classList.toggle("hidden");
  }

  /**
   * Checks if the current task type selected is random or not
   * @returns {boolean} - whether or not the current selection is random, true if is
   */
  function isRandomTask() {
    return id("task-type").value === "random";
  }

  /**
   * Adds a new task using the task manager's text inputs as fields.
   */
  function addTask() {
    let name = id("task-name").value;
    if (!name && !isRandomTask()) {
      displayStatusBox("Task name cannot be empty!", 3000);
    } else if (isRandomTask()) {
      let maxDifficulty = id("difficulty-slider").value;
      let maxPrice = id("price-slider").value;
      let category = id("category").value;
      postRandomTask(category, maxDifficulty, maxPrice);
    } else {
      let desc = id("task-desc").value;
      let day = getDay();
      postCustomTask(name, desc, day);
    }
  }

  function clearServerTasks() {
    fetch("/tasks/clearall")
      .then(updateView)
      .catch(handleError);
  }

  function postCustomTask(name, desc, day) {
    let params = new FormData();
    params.append("name", name);
    params.append("desc", desc);
    params.append("day", day);

    fetch("/tasks/add", { method: "POST", body: params })
      .then(statusCheck)
      .then(res => res.json())
      .then(updateView)
      .catch(handleError);
  }

  function refreshPlanner() {
    fetch("/tasks/get")
      .then(statusCheck)
      .then(res => res.json())
      .then(updateView)
      .catch(handleError);
  }

  function updateView(json) {
    clearTaskView();
    for (let i = 0; i < json.tasks.length; i++) {
      let name = json.tasks[i].name;
      let desc = json.tasks[i].desc;
      let day = json.tasks[i].day;
      buildCustomTask(name, desc, day);
    }
  }

  function clearTaskView() {
    for (let i = 0; i < allTasks.length; i++) {
      allTasks[i].remove();
    }
  }


  /**
   * Builds the structure in the DOM for a new task in HTML.
   * @param {string} name - the name of the task
   * @param {string} desc - a short description of the task
   * @param {string} day - the day of week to add the task
   */
  function buildCustomTask(name, desc, day) {
    let newTask = gen("div");
    newTask.classList.add("task");

    let taskHeader = buildTaskHeader(name);
    newTask.appendChild(taskHeader);

    let taskDesc = gen("p");
    taskDesc.textContent = desc;
    id("task-desc").value = "";
    newTask.appendChild(taskDesc);

    let checkButton = gen("button");
    checkButton.textContent = "check";
    checkButton.addEventListener("click", toggleCheck);
    newTask.appendChild(checkButton);

    id(day).appendChild(newTask);
    allTasks.push(newTask);
  }

  /**
   * Constructs a header based on a task name
   * @param {*} taskName - the text content of the header
   * @returns {HTMLElement} - the constructed header
   */
  function buildTaskHeader(taskName) {
    let header = gen("h3");
    header.textContent = taskName;
    id("task-name").value = "";
    return header;
  }

  /**
   * Constructs a random task based on the user selections and adds it to the planner
   * @param {*} category - the type of task to fetch based on user selection
   * @param {*} maxDifficulty - the max difficulty factor for the task, from 1-10
   * @param {*} maxPrice - the max price range for the task, from 1-10
   */
  function postRandomTask(category, maxDifficulty, maxPrice) {
    maxDifficulty /= 10;
    maxPrice /= 10;
    if (category === "any") {
      category = "";
    }
    makeActivityRequest(category, maxDifficulty, maxPrice);
  }

  /**
   * Makes an API request from BoredAPI based on the random task settings. Displays an error if
   * the request fails in some way.
   * @param {string} category - the type of activity to fetch. If none is given, chooses randomly
   * @param {*} maxDifficulty - the max difficulty, selects an activity in the range of 0 to max
   * @param {*} maxPrice - the max price, selects an activity in the range of 0 to max
   */
  function makeActivityRequest(category, maxDifficulty, maxPrice) {
    const url = "http://www.boredapi.com/api/activity/" + // TOOD: constant this?
      "?minaccessibility=0" +
      "&maxaccessibility=" + maxDifficulty +
      "&type=" + category +
      "&minprice=0" +
      "&maxprice=" + maxPrice;
    fetch(url)
      .then(statusCheck)
      .then(res => res.json())
      .then(processActivityJson)
      .catch(handleError);
  }

  /**
   * Retrieves the currently selected day of week for the task from the DOM
   * @returns {string} - the day of week selected
   */
  function getDay() {
    return id("day-of-week").value;
  }

  /**
   * Takes a response JSON from the BoredAPI request and builds a new task
   * based on its contents.
   * @param {JSON} respJson - the reponse from the API
   */
  function processActivityJson(respJson) {
    let name = respJson.activity;
    let desc = respJson.type;
    postCustomTask(name, desc, getDay());
  }

  /**
   * Catches any errors thrown by statusCheck and displays them to the user
   * through a status box which appears under the task manager.
   * @param {error} err - the error thrown
   */
  function handleError(err) {
    displayStatusBox(err, 3000);
  }

  /**
   * Displays the status box with custom text for a certain amount of time
   * @param {string} text - the error message for the status box
   * @param {int} time - the number of milliseconds to display the status box
   */
  function displayStatusBox(text, time) {
    id("status-box").lastChild.textContent = text;
    toggleStatusBox();
    setTimeout(toggleStatusBox, time);
  }

  /** Toggles the status box visibility */
  function toggleStatusBox() {
    id("status-box").classList.toggle("hidden");
  }

  /** Toggles a task's "completed" status */
  function toggleCheck() {
    this.parentNode.classList.toggle("completed");
  }

  /**
   * Retrieves the DOM element node with the specified ID
   * @param {string} idName - the id of the DOM element node to retrieve
   * @returns {HTMLElement} - the HTMLElement with the specified ID
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Creates a new DOM element node of the given type.
   * @param {string} tagName - the type of tag to generate
   * @returns {HTMLElement} - the newly created tag
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * Asynchronous status check function to verify the success or failure of a response
   * from an API request. Throws an error if the response is not okay.
   * @param {http} response - the response from the webpage
   * @returns {http} response - the response from the webpage only returned if there are no errors
   */
  async function statusCheck(response) {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response;
  }
})();