import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebase'; 
import { collection, addDoc, query, orderBy, limit, getDocs } from "firebase/firestore";

const App = () => {
  const [carPos, setCarPos] = useState(50);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Skoru Firebase'e Kaydet
  const saveScore = async (finalScore) => {
    try {
      await addDoc(collection(db, "scores"), {
        player: "Efe",
        score: finalScore,
        date: new Date()
      });
    } catch (e) { console.error("Firebase Hatası: ", e); }
  };

  const moveCar = useCallback((e) => {
    if (gameOver) return;
    if (e.key === 'ArrowLeft' && carPos > 15) setCarPos(p => p - 15);
    if (e.key === 'ArrowRight' && carPos < 85) setCarPos(p => p + 15);
  }, [carPos, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', moveCar);
    return () => window.removeEventListener('keydown', moveCar);
  }, [moveCar]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      setObstacles(prev => {
        const newObs = prev.map(o => ({ ...o, top: o.top + 5 })).filter(o => o.top < 110);
        newObs.forEach(o => {
          if (o.top > 80 && o.top < 95 && Math.abs(o.left - carPos) < 12) {
            setGameOver(true);
            saveScore(score);
          }
        });
        return newObs;
      });
      setScore(s => s + 1);
    }, 40);

    const spawnObs = setInterval(() => {
      setObstacles(p => [...p, { top: -10, left: Math.floor(Math.random() * 5) * 20 + 10 }]);
    }, 1200);

    return () => { clearInterval(gameLoop); clearInterval(spawnObs); };
  }, [gameStarted, gameOver, carPos, score]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-sans">
      <div className="relative w-80 h-[500px] bg-slate-800 border-4 border-yellow-500 overflow-hidden">
        {/* Yol */}
        <div className="absolute inset-0 border-x-2 border-dashed border-gray-600 opacity-50"></div>
        
        {/* Araba */}
        <div className="absolute bottom-5 transition-all" style={{ left: `${carPos}%`, transform: 'translateX(-50%)' }}>
          <div className="w-10 h-16 bg-blue-500 rounded shadow-[0_0_15px_cyan]"></div>
        </div>

        {/* Engeller */}
        {obstacles.map((o, i) => (
          <div key={i} className="absolute w-10 h-12 bg-red-600 rounded" style={{ top: `${o.top}%`, left: `${o.left}%`, transform: 'translateX(-50%)' }}></div>
        ))}

        {/* Menü */}
        {(!gameStarted || gameOver) && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-2xl font-bold text-yellow-500 mb-4">{gameOver ? "OYUN BİTTİ" : "2D NEON RACER"}</h1>
            {gameOver && <p className="mb-4 text-xl">Skor: {score}</p>}
            <button 
              onClick={() => {setScore(0); setObstacles([]); setGameOver(false); setGameStarted(true);}}
              className="bg-yellow-500 text-black px-6 py-2 rounded-full font-bold"
            >
              {gameOver ? "TEKRAR DENE" : "BAŞLA"}
            </button>
          </div>
        )}
      </div>
      <p className="mt-4">Skor: {score}</p>
    </div>
  );
};

export default App;
