const { EventEmitter } = require("events");

new EventEmitter().setMaxListeners(15);

const app = require("express")(),
  concat = require("./concat"),
  fs = require("fs");

Object.defineProperty(Array.prototype, "shuffle", {
  value: function shuffle() {
    for (let i = this.length - 1; i > 0; i--) {
      const a = Math.floor(Math.random() * (i + 1));
      [this[i], this[a]] = [this[a], this[i]];
    }
    return this;
  },
});

let streamOpts = fs
  .readdirSync(__dirname + "/music")
  .filter((x) => x.split(".")[1] === "mp3")
  .map((x) => __dirname + "/music/" + x);

function getStream() {
  let streams = streamOpts.shuffle();
  let arr = [];
  for (let i = 0; i < streams.length; i++) {
    arr[i] = fs.createReadStream(streams[i]);
  }
  return arr;
}

new concat(getStream()).pipe(fs.createWriteStream("./kek.mp3"));
app.get("/", (req, res) => {
  let stream = new concat(getStream());
  stream.pipe(res);
});

app.get("/infinite", (req, res) => {
  let connector = 0;
  fs.createReadStream("./jej.mp3").pipe(res);
  req.once("end", () => (connector += 1));
  req.once("close", () => (connector += 1));
  let inteval = setInterval(() => {
    if (connector === 2) return clearInterval(inteval);
    new concat(getStream()).pipe(res);
  }, 3300000);
});

const PORT = process.env.PORT || 3000;
app.listen(3000, console.log("Listening on Port " + PORT));
