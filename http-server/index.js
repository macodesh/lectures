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
});

// Inicia o servidor
server.listen(port, host, () => {
  console.log(`🚀 O servidor está rodando em http://${host}:${port}`);
});
