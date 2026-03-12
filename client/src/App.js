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

function App() {
  // Helper to get localStorage with fallback
  const getLocalStorage = (key, fallback) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  };

  // State initialization with localStorage (prevents landing page flash)
  const [started, setStarted] = useState(
    () => localStorage.getItem("started") === "true"
  );
  const [card, setCard] = useState(() => getLocalStorage("card", generateCard()));
  const [called, setCalled] = useState(() => getLocalStorage("called", []));
  const [lastNumber, setLastNumber] = useState(() =>
    getLocalStorage("lastNumber", null)
  );

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
    try {
      const res = await axios.get(`${API_URL}/number`);
      const number = res.data.number;
      const newCalled = [...called, number];

      setLastNumber(number);
      setCalled(newCalled);

      localStorage.setItem("called", JSON.stringify(newCalled));
      localStorage.setItem("lastNumber", JSON.stringify(number));
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

      localStorage.setItem("card", JSON.stringify(newCard));
      localStorage.removeItem("called");
      localStorage.removeItem("lastNumber");
    } catch (err) {
      console.error("Error resetting game:", err);
      alert("Cannot reach backend API 😢");
    }
  };

  // Landing page before game starts
  if (!started) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f0f4ff, #dbeafe)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px 60px",
            borderRadius: "12px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "3rem", marginBottom: "10px" }}>🎉 Bingo Demo</h1>
          <p style={{ fontSize: "1.2rem", marginBottom: "30px", color: "#333" }}>
            Play online Bingo instantly! Challenge yourself or friends.
          </p>
          <button
            onClick={handleStart}
            style={{
              padding: "12px 30px",
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "white",
              background: "#4f46e5",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
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

      <button onClick={callNumber}>Call Number</button>
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