import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://bingo-mern-demo.onrender.com";

function generateCard() {
  const numbers = [];
  while (numbers.length < 25) {
    const n = Math.floor(Math.random() * 75) + 1;
    if (!numbers.includes(n)) numbers.push(n);
  }
  return numbers;
}

function App() {
  // Landing page state with localStorage
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("started");
    if (saved === "true") setStarted(true);
  }, []);

  const handleStart = () => {
    setStarted(true);
    localStorage.setItem("started", "true");
  };

  // Bingo game state
  const [card] = useState(generateCard());
  const [called, setCalled] = useState([]);
  const [lastNumber, setLastNumber] = useState(null);

  const callNumber = async () => {
    try {
      const res = await axios.get(`${API_URL}/number`);
      setLastNumber(res.data.number);
      setCalled([...called, res.data.number]);
    } catch (err) {
      console.error("Error calling number:", err);
      alert("Cannot reach backend API 😢");
    }
  };

   const resetGame = async () => {
    try {
      await axios.get(`${API_URL}/reset`);
      setCalled([]);
      setLastNumber(null);
    } catch (err) {
      console.error("Error resetting game:", err);
      alert("Cannot reach backend API 😢");
    }
  };

  // Landing page before starting game
  if (!started) {
    return (
      <div style={{ textAlign: "center", marginTop: "80px" }}>
        <h1 style={{ fontSize: "3rem" }}>🎉 Bingo Demo</h1>
        <p style={{ fontSize: "1.2rem" }}>
          Play online Bingo instantly! Challenge yourself or friends.
        </p>
        <button
          onClick={handleStart}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}
        >
          Start Game
        </button>
      </div>
    );
  }

   // Bingo game UI
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