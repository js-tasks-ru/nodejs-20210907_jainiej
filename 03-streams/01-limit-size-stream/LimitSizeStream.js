const stream = require("stream");
const LimitExceededError = require("./LimitExceededError");

class LimitSizeStream extends stream.Transform {
  constructor({ limit, ...options }) {
    super(options);
    this.limit = limit;
    this.accumulatedBytes = 0;
  }

  _transform(chunk, encoding, callback) {
    const length = chunk.byteLength;
    this.accumulatedBytes += length;

    if (this.accumulatedBytes > this.limit) {
      callback(new LimitExceededError());
    } else {
      callback(null, chunk);
    }
  }
}

module.exports = LimitSizeStream;
