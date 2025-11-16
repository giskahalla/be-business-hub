import fetch from "node-fetch";

fetch("http://localhost:5050/update/project", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    "name": "Website redesign",
    "desc": "Develop New design",
    "priority": 2,
    "client": "CUS002",
    "assignee": "MEM001",
    "start_date": "2026-01-05",
    "due_date": "2026-04-30",
    "tasks": [
      {
        "title": "brainstorming idea"
      }
    ],
    "id": "PRJ001",
    "status": 1,
    "client_name": "Lany Terra",
    "assignee_name": "Emily Davis"
  })
})
.then(json => console.log(json))  
.catch(err => console.error("Error:", err)); 

