/* eslint-disable quotes */
const url = require("url");
const fs = require("fs");
const http = require("http");
const path = require("path");

const server = new http.Server();

server.on("request", (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname.slice(1);

    if (pathname.includes("/")) {
      throw new Error();
    }

    const filepath = path.join(__dirname, "files", pathname);
    const stream = fs.createReadStream(filepath);

    stream.on("error", (err) => {
      if (err.code === "ENOENT") {
        res.statusCode = 404;
        res.end("File not found");
        return;
      } else {
        res.statusCode = 500;
        res.end("Internal server error");
        return;
      }
    });

    req.on("aborted", () => {
      stream.destroy();
      return;
    });

    switch (req.method) {
      case "GET":
        res.statusCode = 200;
        stream.pipe(res);
        break;

      default:
        res.statusCode = 501;
        res.end("Not implemented");
    }
  } catch (e) {
    res.statusCode = 400;
    res.end("Nesting");
  }
});

module.exports = server;
