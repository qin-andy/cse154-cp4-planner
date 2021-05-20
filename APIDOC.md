# Persistent Planner API Documentation
Interact with the persistent planner by adding or removing tasks, which reads and writes the local file accordingly.

## Get full planner object
**Request Format:** /planner

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Fetches all data stored in the local planner file as a JSON object

**Example Request:** /planner

**Example Response:**
```json
{
  "idCounter":2,
  "tasks":[
    {
      "name":"Be good",
      "desc":"Try to be a better person. Make the world a better place",
      "day":"monday",
      "uid":0
    },
    {
      "name":"Take a caffeine nap",
      "desc":"relaxation",
      "day":"tuesday",
      "uid":1
    }
  ]
}
```

**Error Handling:**
- Possible 500 errors (all text):
  - If there is an error reading or writing the planner.txt local file

## List all task names
**Request Format:** /list

**Request Type:** GET

**Returned Data Format**: TEXT

**Description:** Lists all task names

**Example Request:** /list

**Example Response:**
```text
Be good
Take a caffeine nap
```

**Error Handling:**
- Possible 500 errors (all text):
  - If there is an error reading or writing the planner.txt local file

## Clear a task by UID
**Request Format:** /tasks/clear/:uid

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Clears a task in the planner with the given valid uid, updating the local planner file accordingly. Supplies the newly updated planner as a JSON object

**Example Request:** /tasks/clear/0

**Example Response:**

```json
{
  "idCounter":2,
  "tasks":[
    {
      "name":"Take a caffeine nap",
      "desc":"relaxation",
      "day":"tuesday",
      "uid":1
    }
  ]
}
```

**Error Handling:**
- Possible 400 errors (all text):
  - If the uid does not exist in the planner, returns and error with the message: `Error: uid not found: {uid}`
- Possible 500 errors (all text):
  - If there is an error reading or writing the planner.txt local file

## Reset planner, clear all tasks
**Request Format:** /clearall

**Request Type:** get

**Returned Data Format**: JSON

**Description:** Clears all local tasks and resets the uid counter. Supplies newly emptied planner as a JSON object

**Example Request:** /clearall

**Example Response:**
```json
{
  "idCounter":0,
  "tasks":[]
}
```

**Error Handling:**
- Possible 500 errors (all text):
  - If there is an error reading or writing the planner.txt local file

## Add new task
**Request Format:** /tasks/add with POST parameters of `name`, `desc`, and `day`

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Adds a new task to the planner with the given name, description, and day, as well as with a unique id number for the task. Returns the newly updated planner as a JSON object.

**Example Request:** /tasks/add with POST parameters of `Do dishes`, `Wash dishes before dinner`, `thursday`

**Example Response:**
*Fill in example response in the {}*

```json
{
  "idCounter":1,
  "tasks":[
    {
      "name":"Wash Dishes",
      "desc":"Wash dishes before dinner",
      "day":"thursday",
      "uid":0
    }
  ]
}
```

**Error Handling:**
- Possible 400 errors (all text):
  - If the name, description, or day are invalid, responds with the message: "Error: missing or invalid name, desc, and/or day queries`
- Possible 500 errors (all text):
  - If there is an error reading or writing the planner.txt local file

