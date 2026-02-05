import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebase'; // Firebase bağlantısı
import { collection, addDoc, query, orderBy, limit, getDocs } from "firebase/firestore";
import { Trophy, Play, RotateCcw } from 'lucide-react';

const App = () => {
  const [carPos, setCarPos] = useState(50);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScores, setHighScores] = useState([]);

  // Firebase'den En Yüksek Skorları Çek
  const fetchHighScores = async () => {
    const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(5));
    const querySnapshot = await getDocs(q);
    const scores = [];
    querySnapshot.forEach((doc) => scores.push(doc.data()));
    setHighScores(scores);
  };

  // Skoru Firebase'e Kaydet
  const saveScore = async () => {
    try {
      await addDoc(collection(db, "scores"), {
        name: "Efe", // Burayı geliştirebilirsin
        score: score,
        date: new Date()
      });
      fetchHighScores();
    } catch (e) {
      console.error("Hata: ", e);
    }
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

    const gameInterval = setInterval(() => {
      setObstacles(prev => {
        const newObs = prev.map(o => ({ ...o, top: o.top + 6 })).filter(o => o.top < 110);
        newObs.forEach(o => {
          if (o.top > 80 && o.top < 95 && Math.abs(o.left - carPos) < 12) {
            setGameOver(true);
            saveScore();
          }
        });
        return newObs;
      });
      setScore(s => s + 1);
    }, 40);

    const obsInterval = setInterval(() => {
      setObstacles(prev => [...prev, { top: -10, left: Math.floor(Math.random() * 6) * 15 + 15 }]);
    }, 1200);

    return () => { clearInterval(gameInterval); clearInterval(obsInterval); };
  }, [gameStarted, gameOver, carPos]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="relative w-full max-w-md h-[600px] bg-slate-900 border-4 border-yellow-500 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.3)]">
        
        {/* Yol Efekti */}
        <div className="absolute inset-0 flex justify-around opacity-20">
          {[1,2,3].map(i => <div key={i} className="w-1 h-full border-l-2 border-dashed border-white"></div>)}
        </div>

        {/* Skor Tablosu */}
        <div className="absolute top-4 left-4 z-30 bg-black/50 p-2 rounded border border-yellow-500">
          <p className="text-yellow-400 font-mono text-xl">SKOR: {score}</p>
        </div>

        {/* Oyun Başlangıç / Bitiş Ekranı */}
        {(!gameStarted || gameOver) && (
          <div className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-6 text-center">
            <Trophy className="text-yellow-500 w-16 h-16 mb-4" />
            <h1 className="text-4xl font-black italic mb-2 tracking-tighter text-yellow-500">NEON DRIVER</h1>
            
            {gameOver && <p className="text-2xl text-red-500 font-bold mb-4">OYUN BİTTİ! SKOR: {score}</p>}
            
            <button 
              onClick={() => {setScore(0); setObstacles([]); setGameOver(false); setGameStarted(true);}}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 rounded-full font-black text-xl transition-all scale-100 hover:scale-110"
            >
              {gameOver ? <RotateCcw /> : <Play />} {gameOver ? "TEKRAR DENE" : "GAZA BAS!"}
            </button>

            <div className="mt-8 w-full">
              <p className="text-gray-400 mb-2 uppercase text-xs tracking-widest">Liderlik Tablosu</p>
              {highScores.map((s, i) => (
                <div key={i} className="flex justify-between border-b border-white/10 py-1 font-mono">
                  <span>{i+1}. {s.name}</span>
                  <span className="text-yellow-500">{s.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Oyuncu Arabası */}
        <div className="absolute bottom-10 transition-all duration-75" style={{ left: `${carPos}%`, transform: 'translateX(-50%)' }}>
          <div className="w-12 h-20 bg-gradient-to-t from-blue-700 to-cyan-400 rounded-lg shadow-[0_0_20px_#06b6d4] relative">
            <div className="absolute top-0 w-full h-4 bg-white/30 rounded-t-lg"></div> {/* Ön Cam */}
            <div className="absolute -bottom-1 -left-1 w-3 h-5 bg-red-600 blur-[2px]"></div> {/* Arka Far */}
            <div className="absolute -bottom-1 -right-1 w-3 h-5 bg-red-600 blur-[2px]"></div>
          </div>
        </div>

        {/* Engeller */}
        {obstacles.map((o, i) => (
          <div key={i} className="absolute w-12 h-16 bg-gradient-to-b from-red-600 to-orange-400 rounded shadow-lg" style={{ top: `${o.top}%`, left: `${o.left}%`, transform: 'translateX(-50%)' }}>
            <div className="w-full h-2 bg-black/20 mt-2"></div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-gray-500">Ok Tuşları ile Yönet</p>
    </div>
  );
};

export default App;

