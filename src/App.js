import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebase'; 
import { collection, addDoc, query, orderBy, limit, getDocs } from "firebase/firestore";

const App = () => {
  const [carPos, setCarPos] = useState(50);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  // Firebase'den Skorları Çekme
  const fetchScores = useCallback(async () => {
    try {
      const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(5));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data());
      setLeaderboard(data);
    } catch (e) {
      console.error("Skor çekme hatası:", e);
    }
  }, []);

  // Skoru Kaydetme
  const saveScore = async (finalScore) => {
    try {
      await addDoc(collection(db, "scores"), {
        player: "Efe",
        score: finalScore,
        date: new Date()
      });
      fetchScores();
    } catch (e) {
      console.error("Kayıt hatası:", e);
    }
  };

  // Hareket Kontrolü
  const moveCar = useCallback((e) => {
    if (gameOver) return;
    if (e.key === 'ArrowLeft' && carPos > 15) setCarPos(p => p - 15);
    if (e.key === 'ArrowRight' && carPos < 85) setCarPos(p => p + 15);
  }, [carPos, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', moveCar);
    return () => window.removeEventListener('keydown', moveCar);
  }, [moveCar]);

  // Oyun Döngüsü
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

    const spawnInterval = setInterval(() => {
      setObstacles(p => [...p, { top: -10, left: Math.floor(Math.random() * 5) * 15 + 20 }]);
    }, 1200);

    return () => { clearInterval(gameLoop); clearInterval(spawnInterval); };
  }, [gameStarted, gameOver, carPos, score]);

  useEffect(() => { 
    if (gameStarted) fetchScores(); 
  }, [gameStarted, fetchScores]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white font-sans">
      <div className="relative w-80 h-[550px] bg-zinc-900 border-4 border-blue-600 rounded-xl overflow-hidden">
        
        {/* Yol Efekti */}
        <div className="absolute inset-0 flex justify-center opacity-10">
          <div className="w-1 h-full border-r-4 border-dashed border-white"></div>
        </div>

        {/* Skor Tablosu */}
        <div className="absolute top-4 left-4 z-20 font-bold text-blue-400">
          SKOR: {score}
        </div>

        {/* Menü Ekranı */}
        {(!gameStarted || gameOver) && (
          <div className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-3xl font-black text-blue-500 mb-4 italic">NEON RACER</h1>
            
            {gameOver && (
              <div className="mb-4">
                <p className="text-red-500 font-bold">OYUN BİTTİ!</p>
                <p>Skorun: {score}</p>
              </div>
            )}

            <button 
              onClick={() => { setScore(0); setObstacles([]); setGameOver(false); setGameStarted(true); }}
              className="bg-blue-600 hover:bg-blue-500 px-10 py-3 rounded-full font-bold transition-all"
            >
              {gameOver ? "TEKRAR" : "BAŞLAT"}
            </button>

            <div className="mt-6 w-full text-xs">
              <p className="text-zinc-500 mb-2 underline">EN İYİLER</p>
              {leaderboard.map((s, i) => (
                <div key={i} className="flex justify-between border-b border-white/5 py-1">
                  <span>{i+1}. {s.player}</span>
                  <span className="text-blue-400">{s.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Araba */}
        <div className="absolute bottom-8 transition-all duration-75" style={{ left: `${carPos}%`, transform: 'translateX(-50%)' }}>
          <div className="w-10 h-16 bg-blue-500 rounded shadow-[0_0_15px_rgba(0,0,255,0.5)] border-t-2 border-cyan-300"></div>
        </div>

        {/* Engeller */}
        {obstacles.map((o, i) => (
          <div key={i} className="absolute w-10 h-14 bg-red-600 rounded" style={{ top: `${o.top}%`, left: `${o.left}%`, transform: 'translateX(-50%)' }}></div>
        ))}
      </div>
      <p className="mt-4 text-zinc-600 text-sm italic underline">Purpleguy © 2026 - tablet power</p>
    </div>
  );
};

export default App;
