import { useState } from "react";
import axios from "axios";

function generateCard() {
  const numbers = [];
  while (numbers.length < 25) {
    const n = Math.floor(Math.random() * 75) + 1;
    if (!numbers.includes(n)) numbers.push(n);
  }
  return numbers;
}

function App() {
  const [card] = useState(generateCard());
  const [called, setCalled] = useState([]);
  const [lastNumber, setLastNumber] = useState(null);

  const callNumber = async () => {
    const res = await axios.get("http://localhost:5000/number");

    setLastNumber(res.data.number);
    setCalled([...called, res.data.number]);
  };

  const resetGame = async () => {
    await axios.get("http://localhost:5000/reset");
    setCalled([]);
    setLastNumber(null);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Bingo Demo</h1>

      <button onClick={callNumber}>Call Number</button>
      <button onClick={resetGame} style={{ marginLeft: "10px" }}>
        Reset Game
      </button>

      <h2>
        Last Called Number: {lastNumber ? lastNumber : "None"}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,60px)",
          gap: "10px",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        {card.map((num, i) => (
          <div
            key={i}
            style={{
              width: "60px",
              height: "60px",
              background: called.includes(num) ? "green" : "lightgray",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;