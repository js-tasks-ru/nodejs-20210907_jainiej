/* eslint-disable comma-dangle */
/* eslint-disable indent */
/* eslint-disable object-curly-spacing */
/* eslint-disable quotes */
const fs = require("fs");
const http = require("http");
const path = require("path");
const LimitSizeStream = require("./LimitSizeStream");

const server = new http.Server();

server.on("request", (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, "files", pathname);

  if (pathname.includes("/")) {
    res.statusCode = 400;
    res.end("nested files are not allowed");
    return;
  }

  switch (req.method) {
    case "POST":
      const writeStream = fs.createWriteStream(filepath, { flags: "wx" });
      const limitStream = new LimitSizeStream({ limit: 10000 });

      req.pipe(limitStream).pipe(writeStream);

      limitStream.on("error", (e) => {
        if (e.code === "LIMIT_EXCEEDED") {
          res.statusCode = 413;
          res.end("max file size is exceeded");

          fs.unlink(filepath, (e) => {
            console.log(e);
          });

          writeStream.destroy();
        }
      });

      writeStream.on("error", (e) => {
        if (e.code === "EEXIST") {
          res.statusCode = 409;
          res.end("file already exists");
        } else {
          res.statusCode = 500;
          res.end("server error");
        }
        limitStream.destroy();
      });

      writeStream.on("finish", () => {
        res.statusCode = 201;
        res.end("success");
        return;
      });

      req.on("aborted", () => {
        limitStream.destroy();
        writeStream.destroy();
        fs.unlink(filepath, (e) => {
          console.log(e);
        });
      });
      break;

    default:
      res.statusCode = 501;
      res.end("Not implemented");
  }
});

module.exports = server;
