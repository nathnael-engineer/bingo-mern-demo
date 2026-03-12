import { useState } from "react";
import axios from "axios";

const API_URL = "https://bingo-mern-demo.onrender.com";

// Generate a random Bingo card
function generateCard() {
  const numbers = [];
  while (numbers.length < 25) {
    const n = Math.floor(Math.random() * 75) + 1;
    if (!numbers.includes(n)) numbers.push(n);
  }
  return numbers;
}

// Check if the card has a winning row, column, or diagonal
function checkWin(card, called) {
  const isCalled = (num) => called.includes(num);

  // Check rows
  for (let r = 0; r < 5; r++) {
    if (card.slice(r * 5, r * 5 + 5).every(isCalled)) return true;
  }

  // Check columns
  for (let c = 0; c < 5; c++) {
    if ([0, 1, 2, 3, 4].map((i) => card[c + i * 5]).every(isCalled)) return true;
  }

  // Check diagonals
  if ([0, 6, 12, 18, 24].map((i) => card[i]).every(isCalled)) return true;
  if ([4, 8, 12, 16, 20].map((i) => card[i]).every(isCalled)) return true;

  return false;
}

function App() {
  // Helper for localStorage with fallback
  const getLocalStorage = (key, fallback) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  };

  // State initialization (prevents landing page flash)
  const [started, setStarted] = useState(() => localStorage.getItem("started") === "true");
  const [card, setCard] = useState(() => getLocalStorage("card", generateCard()));
  const [called, setCalled] = useState(() => getLocalStorage("called", []));
  const [lastNumber, setLastNumber] = useState(() => getLocalStorage("lastNumber", null));
  const [gameOver, setGameOver] = useState(false);

  // Start game handler
  const handleStart = () => {
    const newCard = generateCard();
    setStarted(true);
    setCard(newCard);
    localStorage.setItem("started", "true");
    localStorage.setItem("card", JSON.stringify(newCard));
  };

  // Call next Bingo number
  const callNumber = async () => {
    if (gameOver) return;

    try {
      const res = await axios.get(`${API_URL}/number`);
      const number = res.data.number;
      const newCalled = [...called, number];

      setLastNumber(number);
      setCalled(newCalled);

      localStorage.setItem("called", JSON.stringify(newCalled));
      localStorage.setItem("lastNumber", JSON.stringify(number));

      // Check for win
      if (checkWin(card, newCalled)) {
        alert("🎉 Bingo! You won!");
        setGameOver(true);
      }

      // Check if all numbers called and no Bingo
      if (newCalled.length === 75 && !checkWin(card, newCalled)) {
        alert("😢 All numbers called. Game over!");
        setGameOver(true);
      }
    } catch (err) {
      console.error("Error calling number:", err);
      alert("Cannot reach backend API 😢");
    }
  };

  // Reset game handler
  const resetGame = async () => {
    try {
      await axios.get(`${API_URL}/reset`);
      const newCard = generateCard();

      setCard(newCard);
      setCalled([]);
      setLastNumber(null);
      setGameOver(false);

      localStorage.setItem("card", JSON.stringify(newCard));
      localStorage.removeItem("called");
      localStorage.removeItem("lastNumber");
    } catch (err) {
      console.error("Error resetting game:", err);
      alert("Cannot reach backend API 😢");
    }
  };

  // Landing page
  if (!started) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #111111, #1a1a1a)",
          fontFamily: "Arial, sans-serif",
          color: "#fff",
        }}
      >
        <div
          style={{
            background: "#0d0d0d",
            padding: "50px 70px",
            borderRadius: "12px",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.6)",
            textAlign: "center",
            border: "1px solid #333",
          }}
        >
          <h1
            style={{
              fontSize: "3rem",
              marginBottom: "15px",
              color: "#f0f0f0",
            }}
          >
            🎉 Bingo Demo
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              marginBottom: "35px",
              color: "#ccc",
            }}
          >
            Play online Bingo instantly! Challenge yourself or friends.
          </p>
          <button
            onClick={handleStart}
            style={{
              padding: "14px 36px",
              fontSize: "1.3rem",
              fontWeight: "bold",
              color: "#fff",
              background: "linear-gradient(90deg, #ff416c, #ff4b2b)",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s, filter 0.2s",
              filter: "drop-shadow(0 0 5px #ff416c)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.08)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(255, 65, 108, 0.6)";
              e.currentTarget.style.filter = "drop-shadow(0 0 15px #ff416c)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.filter = "drop-shadow(0 0 5px #ff416c)";
            }}
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  // Bingo game UI
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Bingo Demo</h1>

      <button onClick={callNumber} disabled={gameOver}>
        Call Number
      </button>
      <button onClick={resetGame} style={{ marginLeft: "10px" }}>
        Reset Game
      </button>

      <h2>Last Called Number: {lastNumber ?? "None"}</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 60px)",
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
              borderRadius: "8px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
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