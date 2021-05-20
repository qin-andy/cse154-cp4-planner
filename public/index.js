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
   * Begins adding a new task using the task manager's text inputs as fields.
   * Will eventually make a request to the server to update the planner.
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

  /** Clears all stored tasks on the server by making a get request */
  function clearServerTasks() {
    fetch("/tasks/clearall")
      .then(res => res.json())
      .then(updateView)
      .catch(handleError);
  }

  /**
   * Posts a new task to the server planner, then updates the local view to match
   * @param {string} name - the name of the task
   * @param {string} desc - the task description
   * @param {string} day - the task day of the week
   */
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

  /** Refreshes and updates the local planner by fetching the stored tasks on the server */
  function refreshPlanner() {
    fetch("/tasks/get")
      .then(statusCheck)
      .then(res => res.json())
      .then(updateView)
      .catch(handleError);
  }

  /**
   * Updates the local planner view according to a given planner json wth task list
   * @param {json} json - the planner json conntaining the list of tasks
   */
  function updateView(json) {
    clearTaskView();
    console.log(json);
    for (let i = 0; i < json.tasks.length; i++) {
      let name = json.tasks[i].name;
      let desc = json.tasks[i].desc;
      let day = json.tasks[i].day;
      let uid = json.tasks[i].uid;
      buildCustomTask(name, desc, day, uid);
    }
  }

  /** Clears the local task view of all local tasks. Does not interact with server */
  function clearTaskView() {
    for (let i = 0; i < allTasks.length; i++) {
      allTasks[i].remove();
    }
    allTasks = [];
  }

  /**
   * Builds the structure in the DOM for a new task in HTML.
   * @param {string} name - the name of the task
   * @param {string} desc - a short description of the task
   * @param {string} day - the day of week to add the task
   * @param {int} uid - the uid of the task to add
   */
  function buildCustomTask(name, desc, day, uid) {
    let newTask = gen("div");
    newTask.id = uid;
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

    let clearButton = gen("button");
    clearButton.textContent = "clear";
    clearButton.addEventListener("click", clearTask);
    newTask.appendChild(clearButton);

    id(day).appendChild(newTask);
    allTasks.push(newTask);
  }

  /**
   * Constructs a header based on a task name
   * @param {string} taskName - the text content of the header
   * @returns {HTMLElement} - the constructed header
   */
  function buildTaskHeader(taskName) {
    let header = gen("h3");
    header.textContent = taskName;
    id("task-name").value = "";
    return header;
  }

  /** Removes a task from the task view and from the server tasks*/
  function clearTask() {
    let uid = this.parentNode.id;
    this.parentNode.remove();
    fetch("/tasks/clear?uid=" + uid)
      .then(statusCheck)
      .then(res => res.json())
      .then(updateView)
      .catch(handleError);
  }

  /**
   * Constructs a random task based on the user selections and adds it to the planner
   * @param {string} category - the type of task to fetch based on user selection
   * @param {int} maxDifficulty - the max difficulty factor for the task, from 1-10
   * @param {int} maxPrice - the max price range for the task, from 1-10
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
   * @param {int} maxDifficulty - the max difficulty, selects an activity in the range of 0 to max
   * @param {int} maxPrice - the max price, selects an activity in the range of 0 to max
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