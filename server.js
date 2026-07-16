const express =  require('express');

const app = express();
app.use(express.json());

const PORT = 3000;
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


app.get("/", (req, res)=>{
    res.json({
  "name": "Task API",
  "version": "1.0",
  "endpoints": ["/tasks"]
})
})

app.get("/health", (req, res)=>{
    res.json({
        "status": "ok"
    })
})

app.get("/tasks", (req, res)=> {
    res.json(tasks)
})

app.get("/tasks/:id", (req, res)=> {
    const id = Number(req.params.id)
    const task = tasks.find((item) => item.id === id)

    if (!task) {
        return res.status(404).json({ error: `Task with ID ${id} not found` })
    }

    res.json(task)
})

app.post("/tasks", (req, res)=> {
    const { title } = req.body;
        if(!title || typeof title !== 'string') {
            return res.status(400).json({ error: "Title is required and must be a string" })
        }
        const newTask = {
            id: tasks.length + 1,
            title,
            done: false
        }
        tasks.push(newTask)
        res.status(201).json(newTask)
})

app.put("/tasks/:id", (req, res)=> {
    const id = Number(req.params.id)
    const task = tasks.find((item) => item.id === id)

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

app.delete("/tasks/:id", (req, res)=> {
    const id = Number(req.params.id)
    const task = tasks.find((item) => item.id === id)

    if (!task) {
        return res.status(404).json({ error: `Task with ID ${id} not found` })
    }

    tasks.splice(tasks.indexOf(task), 1)
    res.sendStatus(204)
})

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})
