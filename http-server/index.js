const http = require("node:http"); // módulo nativo do node para lidar com requisições http
const fs = require("node:fs").promises; // módulo do node para trabalhar com arquivos
const { OK, CREATED, NO_CONTENT } = require("./httpStatus"); // importa as constantes com os status de código

const host = "localhost"; // endereço URL do servidor
const port = 3000; // porta que vai rodar o servidor

// Função para ouvir as requisições, chamado "listener"
// Determina o que acontece quando você acessa uma rota do servidor
const requestListener = (_req, res) => {
  // req é o objeto que vem de fora pra dentro da API
  // res é o objeto que sai da API pra fora
  res.writeHead(OK); // devolve no cabeçalho o status 200
  res.end("Meu primeiro servidor"); // finaliza a resposta devolvendo um conteúdo de texto
};

const helloWorld = (_req, res) => {
  let message = { message: "Hello, World " };
  message = JSON.stringify(message); // transforma o objeto em JSON

  res.setHeader("Content-Type", "application/json"); // define o retorno como conteúdo JSON
  res.writeHead(OK);

  res.end(message);
};

// Envia HTML através do endpoint
const sendHtmlPage = (_req, res) => {
  res.setHeader("Content-Type", "text/html"); // define o retorno como de tipo HTML
  res.writeHead(OK);

  res.end(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Teste</title>
  </head>
  <body>
    <h1>Página de Teste - Enviando HTML puro</h1>
  </body>
</html>
  `);
};

const sendHtmlFile = async (_req, res) => {
  // fs.readFile lê arquivos de maneira assíncrona (mais performático)
  const page = await fs.readFile(__dirname + "/index.html"); // caminho do arquivo HTML

  res.setHeader("Content-Type", "text/html");
  res.writeHead(OK); // igual a código de status 200

  res.end(page);
};

// Métodos para lidar com arquivos JSON
// CRUD = Create, Read, Update e Delete

// GET /todo
// R do CRUD = READ
const listTodo = async (_req, res) => {
  // Leitura de arquivo JSON
  const jsonFile = await fs.readFile(__dirname + "/todo.json");

  res.setHeader("Content-Type", "application/json");
  res.writeHead(OK);

  res.end(jsonFile);
};

// POST /todo
// C do CRUD = CREATE
const createTodo = async (req, res) => {
  let data = ""; // variável auxiliar para receber os dados da requisição
  const jsonFile = await fs.readFile(__dirname + "/todo.json");

  // recebe os dados da requisição, transforma em string e salva em data
  // "chunk" são os dados em formato binário, sem nenhuma formatação
  req.on("data", (chunk) => {
    data += chunk.toString();
  });

  req.on("end", async () => {
    const newTask = JSON.parse(data); // transforma os dados da requisição em um objeto, com os dados para criar uma nova tarefa
    const tasks = JSON.parse(jsonFile); // transformando o arquivo JSON original em array de objetos JavaScript

    newTask.id = tasks.length + 1; // lê a quantidade de tarefas nos arquivos e define o id como quantidade + 1
    tasks.push(newTask); // inclui a tarefa nova que veio da requisição no array de objetos

    // sobrescreve o arquivo original com o array atualizado
    await fs.writeFile(
      __dirname + "/todo.json",
      JSON.stringify(tasks),
      "utf-8",
      2
    ); // função para escrever os dados em um arquivo (path, dados, modo, formatação)

    res.setHeader("Content-Type", "application/json");
    res.writeHead(CREATED); // igual a código de status 201

    res.end(JSON.stringify(newTask)); // devolve o JSON da nova tarefa
  });
};

// PUT /todo
// U do CRUD = Update
const updateTodo = async (req, res) => {
  let data = "";
  const jsonFile = await fs.readFile(__dirname + "/todo.json");

  req.on("data", (chunk) => {
    data += chunk.toString();
  });

  req.on("end", async () => {
    const dataToUpdate = JSON.parse(data);
    // { id: 99, task: "Teste" }
    const tasks = JSON.parse(jsonFile);

    // Iterando sobre cada task do arquivo
    const updatedTasks = tasks.map((task) => {
      // se a task atual tiver id igual ao id passado na requisição
      if (task.id === dataToUpdate.id) {
        // salva os dados atualizados no lugar dela
        return dataToUpdate;
      } else {
        // se não, ele só retorna a task sem alterar nada
        return task;
      }
    });

    await fs.writeFile(
      __dirname + "/todo.json",
      JSON.stringify(updatedTasks),
      "utf-8",
      2
    );

    res.setHeader("Content-Type", "application/json");
    res.writeHead(OK);
    res.end(JSON.stringify(updatedTasks));
  });
};

// DELETE /todo
// D do CRUD = Delete
const deleteTask = async (req, res) => {
  let data = "";
  const jsonFile = await fs.readFile(__dirname + "/todo.json");

  req.on("data", (chunk) => {
    data += chunk.toString();
  });

  req.on("end", async () => {
    const idToDelete = JSON.parse(data);
    const tasks = JSON.parse(jsonFile);

    // Remover a tarefa do array
    const updatedTasks = tasks.filter((task) => task.id === idToDelete.id);

    await fs.writeFile(__dirname + "/todo.json", JSON.stringify(updatedTasks));

    res.setHeader("Content-Type", "application/json");
    res.writeHead(NO_CONTENT);
    res.end();
  });
};

// Cria o servidor HTTP
const server = http.createServer(async (req, res) => {
  if (req.url === "/" && req.method === "GET") {
    // se a url for "/" e o método for "GET" (deve estar maiúsculo)
    requestListener(req, res);
  }
  if (req.url === "/hello" && req.method === "GET") {
    helloWorld(req, res);
  }
  if (req.url === "/html" && req.method === "GET") {
    sendHtmlPage(req, res);
  }
  if (req.url === "/page" && req.method === "GET") {
    await sendHtmlFile(req, res);
  }
  if (req.url === "/todo" && req.method === "GET") {
    await listTodo(req, res);
  }
  if (req.url === "/todo" && req.method === "POST") {
    await createTodo(req, res);
  }
  if (req.url === "/todo" && req.method === "PUT") {
    await updateTodo(req, res);
  }
  if (req.url === "/todo" && req.method === "DELETE") {
    await deleteTask(req, res);
  }
});

// Inicia o servidor
server.listen(port, host, () => {
  console.log(`🚀 O servidor está rodando em http://${host}:${port}`);
});
