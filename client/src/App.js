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
  const [started, setStarted] = useState(false);
  const [card, setCard] = useState([]);
  const [called, setCalled] = useState([]);
  const [lastNumber, setLastNumber] = useState(null);

  useEffect(() => {
    const savedStarted = localStorage.getItem("started");
    const savedCard = localStorage.getItem("card");
    const savedCalled = localStorage.getItem("called");
    const savedLast = localStorage.getItem("lastNumber");

    if (savedStarted === "true") setStarted(true);
    if (savedCard) setCard(JSON.parse(savedCard));
    
    if (savedCalled) setCalled(JSON.parse(savedCalled));
    if (savedLast) setLastNumber(JSON.parse(savedLast));
  }, []);

  const handleStart = () => {
    const newCard = generateCard();

    setStarted(true);
    setCard(newCard);

    localStorage.setItem("started", "true");
    localStorage.setItem("card", JSON.stringify(newCard));
  };
  

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

  const resetGame = async () => {
    try {
      await axios.get(`${API_URL}/reset`);

      const newCard = generateCard();

      setCalled([]);
      setLastNumber(null);
      setCard(newCard);

      localStorage.setItem("card", JSON.stringify(newCard));
      localStorage.removeItem("called");
      localStorage.removeItem("lastNumber");
    } catch (err) {
      console.error("Error resetting game:", err);
      alert("Cannot reach backend API 😢");
    }
  };

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