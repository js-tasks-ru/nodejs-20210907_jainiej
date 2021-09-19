/* eslint-disable quotes */
const url = require("url");
const fs = require("fs");
const http = require("http");
const path = require("path");

const server = new http.Server();

server.on("request", (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, "files", pathname);

  switch (req.method) {
    case "POST":
      const writeStream = req.pipe(fs.createWriteStream(filepath));

      writeStream.on("error", (e) => {
        console.log(e);
      });

      writeStream.on("finish", () => {
        res.statusCode = 200;
        res.end("success");
      });
      break;

    default:
      res.statusCode = 501;
      res.end("Not implemented");
  }
});

module.exports = server;
