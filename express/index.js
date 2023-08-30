const express = require("express"); // importa o Express
const fs = require("node:fs").promises; // lê e escreve em arquivos assincronamente
const { OK, CREATED, NO_CONTENT } = require("./httpStatus");

// Inicia o Express
const app = express();

// Permite enviar JSON para a aplicação
app.use(express.json());

const readJson = async () => {
  let tasks = await fs.readFile(__dirname + "/todo.json");
  tasks = JSON.parse(tasks);
  return tasks;
};

const writeJson = async (data) => {
  await fs.writeFile(
    __dirname + "/todo.json",
    JSON.stringify(data),
    "utf-8",
    2
  );
};

// CRUD

// GET /todo
app.get("/todo", async (_req, res) => {
  const tasks = await readJson();
  res.status(OK).json(tasks); // devolve a resposta com status e conteúdo
});

// POST /todo
app.post("/todo", async (req, res) => {
  const { task } = req.body;

  const tasks = await readJson();
  const newTask = {
    task,
    id: tasks.length + 1,
  };

  await writeJson([...tasks, newTask]);
  res.status(CREATED).json(newTask);
});

// PUT /todo
app.put("/todo/:id", async (req, res) => {
  // http://localhost:3000/todo/1
  const { id } = req.params; // parâmetros de URL, sempre vem como string
  const { task } = req.body;

  const tasks = await readJson();
  const updatedTasks = tasks.map((curTask) => {
    if (curTask.id === +id) {
      // compara o id da task atual com o id que vem da requisição, já convertido em número
      return { id, task };
    } else {
      return curTask;
    }
  });

  await writeJson(updatedTasks);
  res.status(OK).json(updatedTasks);
});

// DELETE /todo
app.delete("/todo:id", async (req, res) => {
  const { id } = req.params;

  const tasks = await readJson();
  const updatedTasks = tasks.filter((task) => task.id !== +id);

  await writeJson(updatedTasks);
  res.status(NO_CONTENT).end();
});

const port = 3000; // define a porta

// Inicia o servidor
app.listen(port, () => {
  console.log(`Rodando na porta http://localhost:${port} 🚀`);
});
