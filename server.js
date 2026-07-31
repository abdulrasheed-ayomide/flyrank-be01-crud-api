const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
const express = require('express');
const Database = require('better-sqlite3');

const tasks = [
    {
        id: 1,
        title: "Learn Express",
        done: false
    },
    {
        id: 2,
        title: "Build CRUD API",
        done: false
    },
    {
        id: 3,
        title: "Push to Github",
        done: false
    },
];
const db = new Database("tasks.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL
  )
`).run();

const count = db.prepare("SELECT COUNT(*) AS total FROM tasks").get();

if (count.total === 0) {
    const insert = db.prepare(
        "INSERT INTO tasks (title, done) VALUES (?, ?)"
    );

    tasks.forEach((task) => {
        insert.run(task.title, task.done ? 1 : 0);
    });

    console.log("Database seeded successfully!");
}

const app = express();
app.use(express.json());

const PORT = 3000;



app.get("/", (req, res) => {
    res.json({
        "name": "Task API",
        "version": "1.0",
        "endpoints": ["/tasks"]
    })
})

app.get("/health", (req, res) => {
    res.json({
        "status": "ok"
    })
})

app.get("/tasks", (req, res) => {
    const rows = db.prepare("SELECT * FROM tasks").all();
    res.json(rows);
});

app.get("/tasks/:id", (req, res) => {
    const id = Number(req.params.id)
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

    if (!task) {
        return res.status(404).json({ error: `Task with ID ${id} not found` })
    }

    res.json(task)
})

app.post("/tasks", (req, res) => {
    const { title } = req.body;
    if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: "Title is required and must be a string" })
    }
    const newTask = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)").run(title, 0);
    res.status(201).json({ id: newTask.lastInsertRowid, title, done: false });
});

app.put("/tasks/:id", (req, res) => {
    const id = Number(req.params.id)
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

    if (!task) {
        return res.status(404).json({ error: `Task with ID ${id} not found` })
    }

    const { title, done } = req.body;
    if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: "Title is required and must be a string" })
    }

    task.title = title;
    task.done = done;
    res.json(task)
})

app.delete("/tasks/:id", (req, res) => {
    const id = Number(req.params.id)
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

    if (!task) {
        return res.status(404).json({ error: `Task with ID ${id} not found` })
    }

    tasks.splice(tasks.indexOf(task), 1)
    res.sendStatus(204)
})

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
