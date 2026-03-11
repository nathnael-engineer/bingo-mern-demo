const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Bingo API is running ...");
});

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});