```react
import React, { useState, useMemo, useEffect } from 'react';

const LauhulMahfuz2D = () => {
  const [history, setHistory] = useState(['0-0']);
  const [showGuidance, setShowGuidance] = useState(false);
  const [avatarPos, setAvatarPos] = useState({ x: 500, y: 80 });

  // Konfigurasi - 7 Layer
  const layers = 7; 
  const width = 1000; 
  const height = 1200; 
  const nodeRadius = 6;
  const verticalGap = (height - 200) / layers;

  // Jalur melengkung organik
  const getCurvePath = (x1, y1, x2, y2) => {
    const midY = (y1 + y2) / 2;
    const seed = (Math.sin(x1 * 0.05) * 45) + (Math.cos(y2 * 0.05) * 35);
    return `M ${x1} ${y1} C ${x1 + seed} ${midY}, ${x2 - seed} ${midY}, ${x2} ${y2}`;
  };

  const network = useMemo(() => {
    const nodes = [];
    const connections = [];

    for (let i = 0; i <= layers; i++) {
      const nodesInLayer = Math.pow(2, i);
      const horizontalGap = (width - 150) / (nodesInLayer + 1);

      for (let j = 0; j < nodesInLayer; j++) {
        const id = `${i}-${j}`;
        const randomShift = (Math.sin(i * 12 + j) * (horizontalGap * 0.15));
        const x = 75 + (horizontalGap * (j + 1)) + randomShift;
        const y = 80 + (i * verticalGap);
        const isFirstChildTrue = ((i * 37 + j * 13 + 7) % 2 === 0);

        nodes.push({ id, x, y, layer: i });

        if (i < layers) {
          connections.push({ from: id, to: `${i + 1}-${j * 2}`, isTrue: isFirstChildTrue });
          connections.push({ from: id, to: `${i + 1}-${j * 2 + 1}`, isTrue: !isFirstChildTrue });
        }
      }
    }
    return { nodes, connections };
  }, [layers, width, verticalGap]);

  useEffect(() => {
    const currentId = history[history.length - 1];
    const currentNode = network.nodes.find(n => n.id === currentId);
    if (currentNode) {
      setAvatarPos({ x: currentNode.x, y: currentNode.y });
    }
  }, [history, network.nodes]);

  const move = (isTrueTarget) => {
    const lastId = history[history.length - 1];
    const [lastLayer] = lastId.split('-').map(Number);
    
    if (lastLayer >= layers) return;

    const connection = network.connections.find(c => 
      c.from === lastId && c.isTrue === isTrueTarget
    );
    
    if (connection) {
      setHistory(prev => [...prev, connection.to]);
      setShowGuidance(false);
    }
  };

  const invokePrayer = () => {
    setShowGuidance(true);
    setTimeout(() => setShowGuidance(false), 2000);
  };

  const reset = () => {
    setHistory(['0-0']);
    setShowGuidance(false);
  };

  return (
    <div className="fixed inset-0 bg-[#1a120b] flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Meja Kayu */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#3c2a21 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* Frame Kitab */}
      <div className="relative w-full max-w-[850px] aspect-[3/4.2] bg-[#e7d4b5] rounded-r-xl shadow-[30px_0_60px_-15px_rgba(0,0,0,0.8),inset:5px_0_20px_rgba(0,0,0,0.2)] border-l-[35px] border-[#3c2a21] flex flex-col">
        
        {/* Tombol Reset */}
        <div className="absolute top-6 left-6 z-[60] flex flex-col items-center gap-1">
          <button 
            onClick={reset}
            className="w-10 h-10 rounded-full border border-[#3c2a21]/20 flex items-center justify-center bg-[#e7d4b5] hover:bg-[#3c2a21] hover:text-[#e7d4b5] transition-all duration-300 shadow-sm active:scale-90"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
          </button>
          <span className="text-[8px] font-bold tracking-widest text-[#3c2a21]/40 uppercase">Reset</span>
        </div>

        {/* Ornamen */}
        <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-[#8b7355] opacity-10 pointer-events-none"></div>
        <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-[#8b7355] opacity-10 pointer-events-none"></div>

        {/* Visualisasi Akar */}
        <div className="flex-1 relative overflow-hidden mt-4 pointer-events-none">
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-full scale-[1.05]"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Filter untuk efek menyala (glow) */}
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Garis Akar */}
            {network.connections.map((conn, idx) => {
              const fromNode = network.nodes.find(n => n.id === conn.from);
              const toNode = network.nodes.find(n => n.id === conn.to);
              const isActive = history.includes(conn.from) && history.includes(conn.to);
              const lastId = history[history.length - 1];
              const isGuided = showGuidance && conn.from === lastId && conn.isTrue;

              let strokeColor = "#8b7355"; 
              if (isActive) {
                strokeColor = conn.isTrue ? "#b8860b" : "#800000"; 
              } else if (isGuided) {
                strokeColor = "#ffffff"; // Putih untuk Doa
              }

              return (
                <path
                  key={`line-${idx}`}
                  d={getCurvePath(fromNode.x, fromNode.y, toNode.x, toNode.y)}
                  stroke={strokeColor}
                  strokeWidth={isActive ? 12 : isGuided ? 16 : 3.5}
                  strokeLinecap="round"
                  fill="none"
                  filter={isGuided ? "url(#glow)" : ""}
                  style={{
                    opacity: isActive ? 1 : isGuided ? 0.9 : 0.15,
                    transition: 'all 0.3s ease-out',
                    strokeDasharray: isGuided ? 'none' : 'none'
                  }}
                />
              );
            })}

            {/* Titik Node */}
            {network.nodes.map((node) => {
              const isActive = history.includes(node.id);
              const lastId = history[history.length - 1];
              const isTargetOfGuidance = showGuidance && network.connections.some(c => c.from === lastId && c.to === node.id && c.isTrue);
              
              let nodeColor = "#3c2a21";
              if (isActive) {
                const incoming = network.connections.find(c => c.to === node.id && history.includes(c.from));
                nodeColor = incoming?.isTrue ? "#b8860b" : (incoming ? "#800000" : "#3c2a21");
              } else if (isTargetOfGuidance) {
                nodeColor = "#ffffff";
              }

              return (
                <circle
                  key={node.id}
                  cx={node.x}
                  cy={node.y}
                  r={isActive ? nodeRadius + 3 : isTargetOfGuidance ? nodeRadius + 4 : nodeRadius}
                  fill={nodeColor}
                  fillOpacity={isActive || isTargetOfGuidance ? 1 : 0.3}
                  filter={isTargetOfGuidance ? "url(#glow)" : ""}
                  style={{ transition: 'all 0.3s ease-out' }}
                />
              );
            })}

            {/* Avatar */}
            <g transform={`translate(${avatarPos.x}, ${avatarPos.y})`} className="transition-transform duration-[400ms] ease-out">
               <circle r="20" fill="#3c2a21" opacity="0.1" className="animate-pulse" />
               <circle r="5" fill="#3c2a21" />
            </g>
          </svg>
        </div>

        {/* Tombol Kontrol */}
        <div className="py-10 px-12 flex justify-center z-50">
          <div className="flex gap-16">
            <button 
              onClick={() => move(true)}
              className="group relative flex items-center justify-center w-16 h-16 rounded-full border-2 border-[#b8860b]/30 bg-transparent active:scale-90 hover:bg-[#b8860b] hover:text-[#e7d4b5] text-[#b8860b] transition-all duration-200"
            >
              <span className="text-[11px] font-bold tracking-widest uppercase pointer-events-none">True</span>
            </button>
            
            <button 
              onClick={invokePrayer}
              className="group relative flex items-center justify-center w-16 h-16 rounded-full border-2 border-[#3c2a21]/20 bg-transparent active:scale-90 hover:bg-[#3c2a21] hover:text-[#e7d4b5] text-[#3c2a21] transition-all duration-200"
            >
              <span className="text-[11px] font-bold tracking-widest uppercase pointer-events-none">Doa</span>
            </button>

            <button 
              onClick={() => move(false)}
              className="group relative flex items-center justify-center w-16 h-16 rounded-full border-2 border-[#800000]/30 bg-transparent active:scale-90 hover:bg-[#800000] hover:text-[#e7d4b5] text-[#800000] transition-all duration-200"
            >
              <span className="text-[11px] font-bold tracking-widest uppercase pointer-events-none">False</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return <LauhulMahfuz2D />;
}

```
