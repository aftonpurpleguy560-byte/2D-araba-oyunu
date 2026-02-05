import React, { useState, useEffect, useCallback } from 'react';

const App = () => {
  const [carPos, setCarPos] = useState(50); // Arabanın yatay pozisyonu (%)
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Arabayı hareket ettir
  const moveCar = useCallback((e) => {
    if (gameOver) return;
    if (e.key === 'ArrowLeft' && carPos > 10) setCarPos(prev => prev - 10);
    if (e.key === 'ArrowRight' && carPos < 90) setCarPos(prev => prev + 10);
  }, [carPos, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', moveCar);
    return () => window.removeEventListener('keydown', moveCar);
  }, [moveCar]);

  // Oyun Döngüsü
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameInterval = setInterval(() => {
      setObstacles(prev => {
        const newObstacles = prev
          .map(obs => ({ ...obs, top: obs.top + 5 }))
          .filter(obs => obs.top < 110);

        // Çarpışma Kontrolü
        newObstacles.forEach(obs => {
          if (obs.top > 80 && obs.top < 95 && Math.abs(obs.left - carPos) < 15) {
            setGameOver(true);
          }
        });

        return newObstacles;
      });

      setScore(prev => prev + 1);
    }, 50);

    // Yeni engel oluşturma
    const obstacleInterval = setInterval(() => {
      setObstacles(prev => [...prev, { top: -10, left: Math.floor(Math.random() * 9) * 10 + 10 }]);
    }, 1500);

    return () => {
      clearInterval(gameInterval);
      clearInterval(obstacleInterval);
    };
  }, [gameStarted, gameOver, carPos]);

  const resetGame = () => {
    setCarPos(50);
    setObstacles([]);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white font-sans">
      <h1 className="text-4xl font-bold mb-4 text-yellow-400">NEON RACER</h1>
      
      <div className="relative w-80 h-[500px] bg-slate-800 border-x-4 border-dashed border-slate-600 overflow-hidden shadow-2xl">
        {/* Yol Çizgileri Animasyonu */}
        <div className="absolute inset-0 flex justify-center">
          <div className="w-1 bg-slate-700 h-full border-l-2 border-dashed border-slate-500 opacity-30"></div>
        </div>

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 text-center p-4">
            <button onClick={() => setGameStarted(true)} className="bg-yellow-500 hover:bg-yellow-400 px-6 py-2 rounded-full font-bold text-black transition">BAŞLAT</button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 z-20 text-center p-4">
            <h2 className="text-2xl font-bold mb-2">EYVAH! ÇARPTIN!</h2>
            <p className="mb-4">Skor: {score}</p>
            <button onClick={resetGame} className="bg-white text-red-900 px-6 py-2 rounded-full font-bold">TEKRAR DENE</button>
          </div>
        )}

        {/* Oyuncu Arabası */}
        <div 
          className="absolute bottom-10 transition-all duration-100 ease-out"
          style={{ left: `${carPos}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-10 h-16 bg-blue-500 rounded-md border-2 border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.8)] relative">
             <div className="absolute top-2 left-1 w-2 h-3 bg-cyan-200 rounded-sm"></div>
             <div className="absolute top-2 right-1 w-2 h-3 bg-cyan-200 rounded-sm"></div>
          </div>
        </div>

        {/* Engeller */}
        {obstacles.map((obs, index) => (
          <div 
            key={index}
            className="absolute w-10 h-14 bg-red-600 rounded-sm shadow-lg"
            style={{ top: `${obs.top}%`, left: `${obs.left}%`, transform: 'translateX(-50%)' }}
          >
            <div className="absolute bottom-1 left-1 w-2 h-1 bg-orange-400"></div>
            <div className="absolute bottom-1 right-1 w-2 h-1 bg-orange-400"></div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xl">Skor: <span className="font-mono font-bold text-yellow-400">{score}</span></p>
        <p className="text-sm text-slate-400 mt-2">Ok tuşlarını kullanarak hareket et!</p>
      </div>
    </div>
  );
};

export default App;

