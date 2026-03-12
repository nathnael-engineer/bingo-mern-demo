import { useState, useEffect } from "react";
import axios from "axios";
import confetti from "canvas-confetti";

const API_URL = "https://bingo-mern-demo.onrender.com";
const WIN_SOUND = "/win.mp3";
const GAMEOVER_SOUND = "/gameover.mp3";

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

  // Rows
  for (let r = 0; r < 5; r++) {
    if (card.slice(r * 5, r * 5 + 5).every(isCalled)) return true;
  }
  // Columns
  for (let c = 0; c < 5; c++) {
    if ([0, 1, 2, 3, 4].map(i => card[c + i * 5]).every(isCalled)) return true;
  }
  // Diagonals
  if ([0, 6, 12, 18, 24].map(i => card[i]).every(isCalled)) return true;
  if ([4, 8, 12, 16, 20].map(i => card[i]).every(isCalled)) return true;

  return false;
}

// Voice announcement for called numbers
const announceNumber = (number) => {
  if (!window.speechSynthesis) return; // fallback if unsupported

  const utterance = new SpeechSynthesisUtterance(`Number ${number}`);
  utterance.lang = "en-US";         // English (US)
  utterance.pitch = 1;               // natural pitch
  utterance.rate = 0.9;              // slightly slower for clarity
  utterance.volume = 1;              // full volume

  window.speechSynthesis.speak(utterance);
};

const celebrateWin = () => {
  confetti({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.6 }
  });
};

function App() {
  const getLocalStorage = (key, fallback) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  };

  // State
  const [started, setStarted] = useState(false);
  const [card, setCard] = useState(() => getLocalStorage("card", generateCard()));
  const [called, setCalled] = useState(() => getLocalStorage("called", []));
  const [lastNumber, setLastNumber] = useState(() => getLocalStorage("lastNumber", null));
  const [gameOver, setGameOver] = useState(false);
  const [notification, setNotification] = useState("");

  const winAudio = new Audio(WIN_SOUND);
  const gameOverAudio = new Audio(GAMEOVER_SOUND);

  // Start game
  const handleStart = () => {
    const newCard = generateCard();
    setStarted(true);
    setCard(newCard);
    setCalled([]);
    setLastNumber(null);
    setGameOver(false);
    localStorage.setItem("card", JSON.stringify(newCard));
    localStorage.removeItem("called");
    localStorage.removeItem("lastNumber");
  };

  // Call number
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

      // Speak number
      announceNumber(number);  

      // Check win
      if (checkWin(card, newCalled)) {
        setNotification("🎉 Bingo! You won!");
        winAudio.play().catch(() => {});
        celebrateWin();
        setGameOver(true);
      } 
      else if (newCalled.length === 75) {
        setNotification("😢 All numbers called. Game over!");
        gameOverAudio.play().catch(() => {});
        setGameOver(true);
      }
    } catch (err) {
      console.error(err);
      setNotification("⚠️ Cannot reach backend API");
    }
  };

  // Reset game
  const resetGame = async () => {
    try {
      await axios.get(`${API_URL}/reset`);
      const newCard = generateCard();
      setCard(newCard);
      setCalled([]);
      setLastNumber(null);
      setGameOver(false);
      setNotification("");

      localStorage.setItem("card", JSON.stringify(newCard));
      localStorage.removeItem("called");
      localStorage.removeItem("lastNumber");
    } catch (err) {
      console.error(err);
      setNotification("⚠️ Cannot reach backend API");
    }
  };

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
          background: "linear-gradient(135deg, #111, #1a1a1a)",
          fontFamily: "Arial, sans-serif",
          color: "#fff",
        }}
      >
        <div
          style={{
            background: "#0d0d0d",
            padding: "50px 70px",
            borderRadius: "12px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.6)",
            textAlign: "center",
            border: "1px solid #333",
          }}
        >
          <h1 style={{ fontSize: "3rem", marginBottom: "15px", color: "#f0f0f0" }}>
            🎉 Bingo Demo
          </h1>
          <p style={{ fontSize: "1.2rem", marginBottom: "35px", color: "#ccc" }}>
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
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(255,65,108,0.6)";
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

  // Game UI
  return (
    <div style={{ textAlign: "center", position: "relative" }}>
      <h1>Bingo Demo</h1>

      <button onClick={callNumber} disabled={gameOver}>
        Call Number
      </button>
      <button onClick={resetGame} disabled={!gameOver} style={{ marginLeft: "10px" }}>
        Reset Game
      </button>

      <h2>
        Last Called Number:{" "}
        <span
          style={{
            background: "#ff416c",
            padding: "8px 16px",
            borderRadius: "8px",
            color: "white",
            marginLeft: "10px"
          }}
        > 
          {lastNumber ?? "None"}
        </span>
      </h2>

      {/* Notification Box */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: "50%",
            transform: "translateX(-50%) translateY(-100%)",
            background: "#111",
            color: "#fff",
            padding: "15px 25px",
            borderRadius: "10px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.5)",
            fontWeight: "bold",
            zIndex: 1000,
            transition: "transform 0.5s ease, opacity 0.5s ease",
            opacity: 0,
          }}
          ref={(el) => {
            if (el) {
              requestAnimationFrame(() => {
                el.style.transform = "translateX(-50%) translateY(20px)";
                el.style.opacity = "1";
              });
            }
          }}
        >
          {notification}
        </div>
      )}

      {/* Bingo card */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 60px)",
          gap: "10px",
          justifyContent: "center",
          marginTop: "20px",
          fontWeight: "bold",
          fontSize: "20px"
        }}
      >
        {["B","I","N","G","O"].map((letter) => (
          <div key={letter}>{letter}</div>
        ))}

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