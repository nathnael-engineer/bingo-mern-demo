const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

let calledNumbers = [];

app.get("/number", (req, res) => {
  let num;
  
  do {
    num = Math.floor(Math.random() * 75) + 1;
  } while (calledNumbers.includes(num));

  calledNumbers.push(num);

  res.json({ number: num });
});

app.get("/reset", (req, res) => {
  calledNumbers = [];
  res.json({ message: "Game reset" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});