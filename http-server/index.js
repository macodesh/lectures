const http = require("node:http"); // módulo nativo do node para lidar com requisições http
const fs = require("node:fs").promises; // módulo do node para trabalhar com arquivos

const host = "localhost"; // endereço URL do servidor
const port = 3000; // porta que vai rodar o servidor

// Função para ouvir as requisições, chamado "listener"
// Determina o que acontece quando você acessa uma rota do servidor
const requestListener = (_req, res) => {
  // req é o objeto que vem de fora pra dentro da API
  // res é objeto que sai da API pra fora
  res.writeHead(200); // devolve no cabeçalho o status 200
  res.end("Meu primeiro servidor"); // finaliza a resposta devolvendo um conteúdo de texto
};

const helloWorld = (_req, res) => {
  let message = { message: "Hello, World " };
  message = JSON.stringify(message); // transforma o objeto em JSON

  res.setHeader("Content-Type", "application/json"); // define o retorno como conteúdo JSON
  res.writeHead(200);
  res.end(message);
};

// Envia HTML através do endpoint
const sendHtmlPage = (_req, res) => {
  res.setHeader("Content-Type", "text/html"); //define o retorno como de tipo html
  res.writeHead(200);

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
  const page = await fs.readFile(__dirname + "/index.html"); // caminho do arquivo html

  res.setHeader("Content-Type", "text/html");
  res.writeHead(200); // OK

  res.end(page);
};

// Métodos para lidar com arquivos JSON

// Leitura de arquivo json
const jsonFile = await fs.readFile(__dirname + "/todo.json");

// GET /todo
const listTodo = async (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.writeHead(200);
  res.end(jsonFile);
};

// POST /todo
const createTodo = async (req, res) => {
  let data = ""; // variável auxiliar para receber os dados da requisição

  // recebe os dados da requisição, transforma em string e salva em data
  req.on("data", (chunk) => {
    data += chunk.toString();
  });

  req.on("end", async () => {
    const newTask = JSON.parse(data); // transforma os dados da requisição em um objeto, com os dados para criar uma nova tarefa
    const tasks = JSON.parse(jsonFile); // transformando o arquivo JSON original em array de objetos JavaScript

    newTask.id = tasks.length + 1; // lê os arquivos e define o id como quantidade + 1
    tasks.push(newTask); // inclui a tarefa nova que veio da requisição no array de objetos

    await fs.writeFile(__dirname + "/todo.json", JSON.stringify(tasks)); // sobrescreve o arquivo original com o array atualizado

    res.setHeader("Content-Type", "application/json");
    res.writeHead(201); // CREATED
    res.end(JSON.stringify(newTask)); // devolve o json da nova tarefa
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
});

// Inicia o servidor
server.listen(port, host, () => {
  console.log(`🚀 O servidor está rodando em http://${host}:${port}`);
});
