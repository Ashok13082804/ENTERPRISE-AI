import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Gamepad2, ChevronRight, GripVertical } from 'lucide-react';
import { useGameHistoryStore } from '@/store/gameHistoryStore';

export const GameHubFAB: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getPlayerLevel } = useGameHistoryStore();
  const playerLevel = getPlayerLevel();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // If already inside the game hub routes, keep it minimal or show return button
  const isInsideHub = location.pathname.startsWith('/game-hub');

  // Position state (pixel coordinates)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const nodeRef = useRef<HTMLElement | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number; moved: boolean } | null>(null);

  // Initialize position from localStorage or default to bottom-right
  useEffect(() => {
    const saved = localStorage.getItem('gamehub_fab_pos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          const clampedX = Math.max(16, Math.min(window.innerWidth - 300, parsed.x));
          const clampedY = Math.max(16, Math.min(window.innerHeight - 80, parsed.y));
          setPosition({ x: clampedX, y: clampedY });
          return;
        }
      } catch {}
    }
    // Default bottom-right position
    setPosition({
      x: Math.max(16, window.innerWidth - 320),
      y: Math.max(16, window.innerHeight - 90),
    });
  }, []);

  // Handle window resizing to keep widget within viewport
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        if (!prev) return null;
        return {
          x: Math.max(16, Math.min(window.innerWidth - 300, prev.x)),
          y: Math.max(16, Math.min(window.innerHeight - 80, prev.y)),
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only primary mouse button
    const currentX = position ? position.x : (window.innerWidth - 320);
    const currentY = position ? position.y : (window.innerHeight - 90);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: currentX,
      initY: currentY,
      moved: false,
    };

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    if (!dragStartRef.current.moved && Math.hypot(dx, dy) > 5) {
      dragStartRef.current.moved = true;
      setIsDragging(true);
    }

    if (dragStartRef.current.moved) {
      const nodeWidth = nodeRef.current?.offsetWidth || 280;
      const nodeHeight = nodeRef.current?.offsetHeight || 68;

      const nextX = Math.max(10, Math.min(window.innerWidth - nodeWidth - 10, dragStartRef.current.initX + dx));
      const nextY = Math.max(10, Math.min(window.innerHeight - nodeHeight - 10, dragStartRef.current.initY + dy));

      setPosition({ x: nextX, y: nextY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const hadMoved = dragStartRef.current.moved;
    dragStartRef.current = null;
    setIsDragging(false);

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    if (hadMoved) {
      // Save position to localStorage
      if (position) {
        localStorage.setItem('gamehub_fab_pos', JSON.stringify(position));
      }
    } else {
      // Just a click without movement -> navigate
      navigate('/game-hub');
    }
  };

  if (!position) return null;

  return (
    <aside
      ref={nodeRef}
      role="region"
      aria-label="Game Hub floating action"
      className="fixed z-50 flex items-center select-none touch-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging ? 'none' : 'box-shadow 0.2s ease, transform 0.15s ease',
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            navigate('/game-hub');
          }
        }}
        aria-label="Open 432 Game Development Hub (Drag to move)"
        title="Open 432 Game Development Hub (Click to open, Drag to move anywhere)"
        className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border select-none transition-all duration-200 shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          isDragging
            ? 'cursor-grabbing scale-105 shadow-indigo-500/50 ring-2 ring-cyan-400'
            : 'cursor-grab hover:scale-[1.02] active:scale-95'
        } ${
          isInsideHub
            ? 'bg-slate-900/95 border-primary/40 text-foreground backdrop-blur-xl'
            : 'bg-gradient-to-r from-indigo-600/95 via-purple-600/95 to-pink-600/95 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 border-white/25 text-white backdrop-blur-xl shadow-indigo-500/40'
        }`}
        style={{
          boxShadow: isDragging
            ? '0 25px 50px -12px rgba(99, 102, 241, 0.6), 0 0 30px rgba(168, 85, 247, 0.5)'
            : isHovered
            ? '0 20px 35px -5px rgba(99, 102, 241, 0.45), 0 0 20px rgba(168, 85, 247, 0.35)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(99, 102, 241, 0.25)',
        }}
      >
        {/* Subtle Grip Drag Affordance */}
        <div className="flex items-center text-white/50 group-hover:text-white/80 transition-colors -mr-1" title="Drag to reposition">
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Animated glowing border ring */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300 pointer-events-none" />

        {/* Gamepad Icon Tile with Pulse */}
        <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 shadow-inner group-hover:rotate-6 transition-transform">
          <Gamepad2 className="w-6 h-6 text-white drop-shadow" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
        </div>

        {/* Labels & Counts */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs md:text-sm font-black tracking-wider uppercase drop-shadow-sm font-mono">
              🎮 GAME HUB
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-black/40 text-amber-300 border border-amber-300/30">
              LVL {playerLevel.level}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/90">
            <span className="font-bold text-amber-300">432 Games</span>
            <span>·</span>
            <span className="hidden sm:inline text-white/80">{playerLevel.title}</span>
            <span className="sm:hidden text-white/80">2D + 3D</span>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="hidden md:flex items-center pl-1 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </aside>
  );
};
