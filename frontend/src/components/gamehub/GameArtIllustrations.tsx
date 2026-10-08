import React from 'react';
import { GameRecord } from '@/data/gameDatabase';

interface GameArtPictureProps {
  game: GameRecord;
  className?: string;
}

export const GameArtPicture: React.FC<GameArtPictureProps> = ({ game, className = '' }) => {
  const nameL = game.name.toLowerCase();
  const catL = game.category.toLowerCase();
  const gameplay = game.gameplayCategory || '';

  // Determine game theme
  let theme: 
    | 'platformer' 
    | 'pinball' 
    | 'asteroids' 
    | 'space' 
    | 'racing' 
    | 'horror' 
    | 'pacman' 
    | 'fruit_ninja' 
    | 'tower_defense' 
    | 'sports' 
    | 'puzzle' 
    | 'tetris' 
    | 'rpg' 
    | 'dinosaur' 
    | 'cyber' 
    | 'nature' = 'cyber';

  if (gameplay === 'pinball' || nameL.includes('pinball')) {
    theme = 'pinball';
  } else if (gameplay === 'asteroids' || nameL.includes('asteroid')) {
    theme = 'asteroids';
  } else if (gameplay === 'pacman' || nameL.includes('pac-man') || nameL.includes('pacman') || gameplay.includes('maze')) {
    theme = 'pacman';
  } else if (gameplay === 'fruit_ninja' || nameL.includes('fruit') || nameL.includes('slice')) {
    theme = 'fruit_ninja';
  } else if (catL.includes('platformer') || gameplay.includes('platform') || nameL.includes('platform') || gameplay === 'doodle_jump' || gameplay === 'runner') {
    theme = 'platformer';
  } else if (catL.includes('racing') || gameplay.includes('racing') || gameplay.includes('drift') || nameL.includes('car')) {
    theme = 'racing';
  } else if (catL.includes('horror') || gameplay.includes('horror') || gameplay.includes('zombie') || nameL.includes('zombie')) {
    theme = 'horror';
  } else if (catL.includes('strategy') || gameplay.includes('tower') || gameplay.includes('defense')) {
    theme = 'tower_defense';
  } else if (catL.includes('sports') || gameplay.includes('soccer') || gameplay.includes('basketball') || gameplay.includes('golf')) {
    theme = 'sports';
  } else if (catL.includes('puzzle') || gameplay.includes('match') || gameplay.includes('puzzle') || gameplay.includes('gem')) {
    theme = 'puzzle';
  } else if (catL.includes('building') || gameplay.includes('tetris') || gameplay.includes('block') || gameplay.includes('stack')) {
    theme = 'tetris';
  } else if (catL.includes('rpg') || nameL.includes('knight') || nameL.includes('sword') || nameL.includes('dungeon')) {
    theme = 'rpg';
  } else if (catL.includes('dinosaur') || nameL.includes('dino') || nameL.includes('dragon')) {
    theme = 'dinosaur';
  } else if (catL.includes('space') || gameplay.includes('space') || gameplay.includes('shooter')) {
    theme = 'space';
  } else if (nameL.includes('forest') || nameL.includes('nature') || nameL.includes('wild')) {
    theme = 'nature';
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
      {/* 1. PLATFORMER ARTWORK (GAME-077, etc.) */}
      {theme === 'platformer' && (
        <svg viewBox="0 0 300 130" className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`plat-sky-${game.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id={`plat-pipe-${game.id}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
          </defs>
          <rect width="300" height="130" fill={`url(#plat-sky-${game.id})`} />
          {/* Distant Hills */}
          <circle cx="60" cy="150" r="80" fill="#065f46" opacity="0.5" />
          <circle cx="210" cy="140" r="70" fill="#047857" opacity="0.6" />
          
          {/* Floating Brick Platforms */}
          <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))">
            <rect x="70" y="65" width="48" height="14" rx="3" fill="#b45309" stroke="#f59e0b" strokeWidth="1.5" />
            <rect x="84" y="67" width="20" height="10" rx="1" fill="#78350f" />
            
            <rect x="150" y="45" width="60" height="14" rx="3" fill="#b45309" stroke="#f59e0b" strokeWidth="1.5" />
            <rect x="168" y="47" width="24" height="10" rx="1" fill="#78350f" />

            {/* Glowing Golden Coins */}
            <circle cx="94" cy="50" r="6" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
            <circle cx="180" cy="30" r="6" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
          </g>

          {/* Pipe / Portal */}
          <rect x="235" y="80" width="30" height="40" rx="2" fill={`url(#plat-pipe-${game.id})`} stroke="#16a34a" strokeWidth="1.5" />
          <rect x="232" y="74" width="36" height="8" rx="2" fill="#22c55e" stroke="#16a34a" strokeWidth="1.5" />

          {/* Jumping Hero Silhouette */}
          <g transform="translate(125, 48)">
            <circle cx="0" cy="-12" r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            <rect x="-6" y="-5" width="12" height="14" rx="3" fill="#3b82f6" />
            <circle cx="6" cy="4" r="3.5" fill="#f59e0b" />
            <circle cx="-6" cy="7" r="3.5" fill="#f59e0b" />
          </g>

          {/* Ground Platform */}
          <rect x="0" y="112" width="300" height="18" fill="#15803d" />
          <rect x="0" y="116" width="300" height="14" fill="#78350f" />
        </svg>
      )}

      {/* 2. PINBALL ARTWORK (GAME-012) */}
      {theme === 'pinball' && (
        <svg viewBox="0 0 300 130" className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" preserveAspectRatio="none">
          <defs>
            <radialGradient id={`pb-bg-${game.id}`} cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#090d16" />
            </radialGradient>
          </defs>
          <rect width="300" height="130" fill={`url(#pb-bg-${game.id})`} />
          {/* Neon Table Orbit Guide Rails */}
          <path d="M 40 120 C 40 30, 260 30, 260 120" fill="none" stroke="#6366f1" strokeWidth="3" opacity="0.6" strokeDasharray="6 4" />
          <path d="M 60 120 C 60 45, 240 45, 240 120" fill="none" stroke="#a855f7" strokeWidth="2" opacity="0.4" />
          
          {/* Glowing Tri-Bumpers */}
          <circle cx="150" cy="50" r="16" fill="#f59e0b" filter="drop-shadow(0 0 10px #f59e0b)" />
          <circle cx="150" cy="50" r="7" fill="#ffffff" />
          
          <circle cx="110" cy="75" r="14" fill="#ec4899" filter="drop-shadow(0 0 8px #ec4899)" />
          <circle cx="110" cy="75" r="6" fill="#ffffff" />
          
          <circle cx="190" cy="75" r="14" fill="#06b6d4" filter="drop-shadow(0 0 8px #06b6d4)" />
          <circle cx="190" cy="75" r="6" fill="#ffffff" />

          {/* Dual Flippers */}
          <line x1="100" y1="115" x2="135" y2="105" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" filter="drop-shadow(0 0 6px #f43f5e)" />
          <line x1="200" y1="115" x2="165" y2="105" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" filter="drop-shadow(0 0 6px #f43f5e)" />

          {/* Chrome Steel Ball with motion trail */}
          <line x1="140" y1="90" x2="148" y2="68" stroke="#ffffff" strokeWidth="3" opacity="0.5" strokeDasharray="3 3" />
          <circle cx="148" cy="68" r="6.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" filter="drop-shadow(0 0 6px #ffffff)" />
        </svg>
      )}

      {/* 3. ASTEROIDS ARTWORK (GAME-006) */}
      {theme === 'asteroids' && (
        <svg viewBox="0 0 300 130" className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" preserveAspectRatio="none">
          <rect width="300" height="130" fill="#030712" />
          {/* Starfield */}
          <circle cx="30" cy="20" r="1" fill="#ffffff" opacity="0.8" />
          <circle cx="95" cy="45" r="1.5" fill="#ffffff" opacity="0.6" />
          <circle cx="210" cy="25" r="1" fill="#ffffff" opacity="0.7" />
          <circle cx="270" cy="80" r="1.2" fill="#ffffff" opacity="0.8" />
          <circle cx="50" cy="100" r="1" fill="#ffffff" opacity="0.5" />

          {/* Vector Polygonal Asteroids */}
          <polygon points="50,40 70,30 85,50 75,70 55,65 40,55" fill="#0f172a" stroke="#94a3b8" strokeWidth="2" filter="drop-shadow(0 0 6px #64748b)" />
          <polygon points="220,55 240,45 255,60 245,78 225,75 215,65" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.8" />
          <polygon points="175,20 185,15 195,25 188,35 172,30" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" />

          {/* Spaceship with Thruster */}
          <g transform="translate(130, 85) rotate(-35)">
            <polygon points="0,-16 -10,12 -4,8 0,8 4,8 10,12" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" filter="drop-shadow(0 0 8px #38bdf8)" />
            <polygon points="-3,9 0,18 3,9" fill="#f59e0b" filter="drop-shadow(0 0 6px #ef4444)" />
          </g>

          {/* Laser Blasts */}
          <circle cx="155" cy="55" r="2.5" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
          <circle cx="170" cy="42" r="2.5" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
        </svg>
      )}

      {/* 4. PACMAN & MAZE ARTWORK (GAME-007) */}
      {theme === 'pacman' && (
        <svg viewBox="0 0 300 130" className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" preserveAspectRatio="none">
          <rect width="300" height="130" fill="#020617" />
          {/* Blue Neon Maze Walls */}
          <path d="M 20 20 L 120 20 L 120 50 L 80 50 L 80 80 L 140 80 L 140 20 L 280 20 L 280 110 L 20 110 Z" fill="none" stroke="#2563eb" strokeWidth="3" filter="drop-shadow(0 0 8px #3b82f6)" />
          
          {/* Pellets */}
          <circle cx="100" cy="65" r="3" fill="#fef08a" />
          <circle cx="120" cy="65" r="3" fill="#fef08a" />
          <circle cx="140" cy="65" r="3" fill="#fef08a" />
          <circle cx="160" cy="65" r="3" fill="#fef08a" />
          <circle cx="180" cy="65" r="6" fill="#f59e0b" filter="drop-shadow(0 0 8px #f59e0b)" />

          {/* Yellow Chomper Pac-Man */}
          <path d="M 50 65 L 68 55 A 16 16 0 1 0 68 75 Z" fill="#facc15" filter="drop-shadow(0 0 10px #facc15)" />

          {/* Ghosts */}
          <g transform="translate(210, 65)">
            <path d="M -12 10 L -12 -2 A 12 12 0 0 1 12 -2 L 12 10 L 6 6 L 0 10 L -6 6 Z" fill="#ef4444" filter="drop-shadow(0 0 8px #ef4444)" />
            <circle cx="-4" cy="-3" r="3" fill="#ffffff" /><circle cx="-3" cy="-3" r="1.5" fill="#000000" />
            <circle cx="4" cy="-3" r="3" fill="#ffffff" /><circle cx="5" cy="-3" r="1.5" fill="#000000" />
          </g>
          <g transform="translate(245, 65)">
            <path d="M -12 10 L -12 -2 A 12 12 0 0 1 12 -2 L 12 10 L 6 6 L 0 10 L -6 6 Z" fill="#06b6d4" filter="drop-shadow(0 0 8px #06b6d4)" />
            <circle cx="-4" cy="-3" r="3" fill="#ffffff" /><circle cx="-3" cy="-3" r="1.5" fill="#000000" />
            <circle cx="4" cy="-3" r="3" fill="#ffffff" /><circle cx="5" cy="-3" r="1.5" fill="#000000" />
          </g>
        </svg>
      )}

      {/* 5. FRUIT NINJA & BLADE SLICE (GAME-014) */}
      {theme === 'fruit_ninja' && (
        <svg viewBox="0 0 300 130" className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" preserveAspectRatio="none">
          <rect width="300" height="130" fill="#2b1b17" />
          <path d="M 0 0 L 300 130" stroke="#3e2723" strokeWidth="2" opacity="0.3" />
          
          {/* Sliced Watermelon Halves */}
          <g transform="translate(90, 50) rotate(-20)">
            <path d="M -18 0 A 18 18 0 0 0 0 18 L 0 0 Z" fill="#10b981" stroke="#059669" strokeWidth="2" />
            <path d="M -15 0 A 15 15 0 0 0 0 15 L 0 0 Z" fill="#ef4444" />
          </g>
          <g transform="translate(118, 70) rotate(25)">
            <path d="M 0 0 L 18 0 A 18 18 0 0 1 0 18 Z" fill="#10b981" stroke="#059669" strokeWidth="2" />
            <path d="M 0 0 L 15 0 A 15 15 0 0 1 0 15 Z" fill="#ef4444" />
          </g>

          {/* Sliced Orange */}
          <circle cx="210" cy="55" r="16" fill="#f97316" stroke="#c2410c" strokeWidth="2" />
          <circle cx="210" cy="55" r="12" fill="#ea580c" />

          {/* Katana Glowing Neon Blade Slash Trail */}
          <path d="M 30 110 Q 150 40 280 20" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" filter="drop-shadow(0 0 12px #38bdf8)" />
          <path d="M 30 110 Q 150 40 280 20" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

          {/* Juice Splashes */}
          <circle cx="104" cy="58" r="3.5" fill="#ef4444" />
          <circle cx="112" cy="48" r="2.5" fill="#ef4444" />
          <circle cx="225" cy="42" r="3" fill="#f97316" />
        </svg>
      )}

      {/* 6. RACING ARTWORK */}
      {theme === 'racing' && (
        <svg viewBox="0 0 300 130" className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" preserveAspectRatio="none">
          <rect width="300" height="130" fill="#0f172a" />
          {/* Perspective Asphalt Highway */}
          <polygon points="120,0 180,0 280,130 20,130" fill="#1e293b" />
          {/* Red/White Curbs */}
          <polygon points="112,0 120,0 20,130 6,130" fill="#ef4444" />
          <polygon points="180,0 188,0 294,130 280,130" fill="#ef4444" />
          {/* Yellow Road Dashes */}
          <line x1="150" y1="0" x2="150" y2="130" stroke="#facc15" strokeWidth="3" strokeDasharray="16 14" />

          {/* Sports Car Silhouette with Headlights */}
          <g transform="translate(150, 85)">
            <rect x="-18" y="-12" width="36" height="38" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" filter="drop-shadow(0 0 12px #38bdf8)" />
            {/* Windshield */}
            <polygon points="-12,-4 12,-4 14,8 -14,8" fill="#0f172a" />
            {/* Taillights */}
            <rect x="-16" y="20" width="8" height="4" fill="#ef4444" filter="drop-shadow(0 0 6px #ef4444)" />
            <rect x="8" y="20" width="8" height="4" fill="#ef4444" filter="drop-shadow(0 0 6px #ef4444)" />
          </g>
        </svg>
      )}

      {/* 7. HORROR & ZOMBIE ARTWORK */}
      {theme === 'horror' && (
        <svg viewBox="0 0 300 130" className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" preserveAspectRatio="none">
          <rect width="300" height="130" fill="#09090b" />
          {/* Eerie Blood Moon */}
          <circle cx="230" cy="40" r="24" fill="#7f1d1d" opacity="0.8" filter="drop-shadow(0 0 16px #dc2626)" />
          
          {/* Spooky Silhouette Trees & Graveyard */}
          <path d="M 0 130 L 40 90 L 50 130 L 100 80 L 120 130 L 180 85 L 200 130 L 260 90 L 300 130 Z" fill="#18181b" />
          
          {/* Flashlight Beam Cutting Darkness */}
          <polygon points="50,90 280,30 280,120" fill="#fef08a" opacity="0.18" />

          {/* Zombie Silhouette with Glowing Red Eyes */}
          <g transform="translate(200, 85)">
            <circle cx="0" cy="-14" r="8" fill="#14532d" />
            <circle cx="-3" cy="-15" r="1.5" fill="#ef4444" filter="drop-shadow(0 0 4px #ef4444)" />
            <circle cx="3" cy="-15" r="1.5" fill="#ef4444" filter="drop-shadow(0 0 4px #ef4444)" />
            <rect x="-7" y="-6" width="14" height="22" rx="3" fill="#166534" />
            <line x1="-7" y1="0" x2="-18" y2="-4" stroke="#14532d" strokeWidth="3" />
            <line x1="7" y1="0" x2="18" y2="-4" stroke="#14532d" strokeWidth="3" />
          </g>
        </svg>
      )}

      {/* 8. TOWER DEFENSE & STRATEGY */}
      {theme === 'tower_defense' && (
        <svg viewBox="0 0 300 130" className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" preserveAspectRatio="none">
          <rect width="300" height="130" fill="#0f172a" />
          {/* Path */}
          <path d="M 0 40 L 110 40 L 110 95 L 300 95" fill="none" stroke="#334155" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Turret Tower */}
          <g transform="translate(180, 45)">
            <rect x="-16" y="-16" width="32" height="32" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" filter="drop-shadow(0 0 10px #38bdf8)" />
            <circle cx="0" cy="0" r="9" fill="#0284c7" />
            <rect x="-3" y="-18" width="6" height="16" fill="#38bdf8" />
          </g>

          {/* Laser Projectile Beam */}
          <line x1="180" y1="45" x2="230" y2="95" stroke="#f59e0b" strokeWidth="3" strokeDasharray="4 2" filter="drop-shadow(0 0 6px #f59e0b)" />

          {/* Invading Creep Monster */}
          <circle cx="230" cy="95" r="10" fill="#a855f7" stroke="#e879f9" strokeWidth="2" filter="drop-shadow(0 0 6px #a855f7)" />
        </svg>
      )}

      {/* 9. SPORTS ARTWORK */}
      {theme === 'sports' && (
        <svg viewBox="0 0 300 130" className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" preserveAspectRatio="none">
          <rect width="300" height="130" fill="#14532d" />
          {/* Field Lines */}
          <circle cx="150" cy="130" r="50" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.4" />
          <line x1="0" y1="130" x2="300" y2="130" stroke="#ffffff" strokeWidth="3" opacity="0.5" />
          
          {/* Goal Net */}
          <rect x="80" y="20" width="140" height="50" rx="3" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.7" />
          <line x1="80" y1="35" x2="220" y2="35" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
          <line x1="115" y1="20" x2="115" y2="70" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
          <line x1="150" y1="20" x2="150" y2="70" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
          <line x1="185" y1="20" x2="185" y2="70" stroke="#ffffff" strokeWidth="1" opacity="0.3" />

          {/* Soccer Ball flying towards goal */}
          <circle cx="150" cy="65" r="12" fill="#ffffff" stroke="#000000" strokeWidth="1.5" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))" />
          <polygon points="150,60 154,63 152,68 148,68 146,63" fill="#000000" />
        </svg>
      )}

      {/* 10. PUZZLE / MATCH-3 GEMS */}
      {theme === 'puzzle' && (
        <svg viewBox="0 0 300 130" className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" preserveAspectRatio="none">
          <rect width="300" height="130" fill="#0b0f19" />
          {/* Faceted Jewels */}
          <polygon points="80,45 95,30 110,45 95,65" fill="#ef4444" stroke="#fca5a5" strokeWidth="1.5" filter="drop-shadow(0 0 10px #ef4444)" />
          <polygon points="150,40 168,25 186,40 168,65" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1.5" filter="drop-shadow(0 0 12px #3b82f6)" />
          <polygon points="220,50 235,35 250,50 235,70" fill="#10b981" stroke="#6ee7b7" strokeWidth="1.5" filter="drop-shadow(0 0 10px #10b981)" />
          <polygon points="120,75 135,60 150,75 135,95" fill="#f59e0b" stroke="#fde047" strokeWidth="1.5" filter="drop-shadow(0 0 10px #f59e0b)" />
          <polygon points="180,80 195,65 210,80 195,100" fill="#a855f7" stroke="#e9d5ff" strokeWidth="1.5" filter="drop-shadow(0 0 10px #a855f7)" />
        </svg>
      )}

      {/* 11. TETRIS / BLOCK STACKER */}
      {theme === 'tetris' && (
        <svg viewBox="0 0 300 130" className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" preserveAspectRatio="none">
          <rect width="300" height="130" fill="#090d16" />
          {/* Falling Tetrominoes */}
          <g transform="translate(60, 30)">
            <rect x="0" y="0" width="16" height="16" rx="2" fill="#06b6d4" stroke="#22d3ee" strokeWidth="1" filter="drop-shadow(0 0 6px #06b6d4)" />
            <rect x="16" y="0" width="16" height="16" rx="2" fill="#06b6d4" stroke="#22d3ee" strokeWidth="1" />
            <rect x="32" y="0" width="16" height="16" rx="2" fill="#06b6d4" stroke="#22d3ee" strokeWidth="1" />
            <rect x="48" y="0" width="16" height="16" rx="2" fill="#06b6d4" stroke="#22d3ee" strokeWidth="1" />
          </g>
          <g transform="translate(160, 45)">
            <rect x="16" y="0" width="16" height="16" rx="2" fill="#a855f7" stroke="#c084fc" strokeWidth="1" filter="drop-shadow(0 0 6px #a855f7)" />
            <rect x="0" y="16" width="16" height="16" rx="2" fill="#a855f7" stroke="#c084fc" strokeWidth="1" />
            <rect x="16" y="16" width="16" height="16" rx="2" fill="#a855f7" stroke="#c084fc" strokeWidth="1" />
            <rect x="32" y="16" width="16" height="16" rx="2" fill="#a855f7" stroke="#c084fc" strokeWidth="1" />
          </g>
          <g transform="translate(230, 20)">
            <rect x="0" y="0" width="16" height="16" rx="2" fill="#facc15" stroke="#fde047" strokeWidth="1" filter="drop-shadow(0 0 6px #facc15)" />
            <rect x="16" y="0" width="16" height="16" rx="2" fill="#facc15" stroke="#fde047" strokeWidth="1" />
            <rect x="0" y="16" width="16" height="16" rx="2" fill="#facc15" stroke="#fde047" strokeWidth="1" />
            <rect x="16" y="16" width="16" height="16" rx="2" fill="#facc15" stroke="#fde047" strokeWidth="1" />
          </g>
        </svg>
      )}

      {/* 12. RPG & DUNGEON HERO */}
      {theme === 'rpg' && (
        <svg viewBox="0 0 300 130" className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" preserveAspectRatio="none">
          <rect width="300" height="130" fill="#1c1917" />
          {/* Dungeon Stone Arch */}
          <path d="M 60 130 L 60 40 Q 150 10 240 40 L 240 130" fill="none" stroke="#44403c" strokeWidth="12" />
          
          {/* Glowing Broadsword & Shield */}
          <g transform="translate(150, 65) rotate(45)">
            <rect x="-3" y="-30" width="6" height="45" fill="#e2e8f0" filter="drop-shadow(0 0 10px #facc15)" />
            <rect x="-10" y="15" width="20" height="5" fill="#f59e0b" />
            <rect x="-2" y="20" width="4" height="12" fill="#78350f" />
          </g>
          <g transform="translate(150, 65) rotate(-45)">
            <rect x="-3" y="-30" width="6" height="45" fill="#e2e8f0" filter="drop-shadow(0 0 10px #38bdf8)" />
            <rect x="-10" y="15" width="20" height="5" fill="#0284c7" />
          </g>
        </svg>
      )}

      {/* 13. CYBER & AI MATRIX (Default) */}
      {(theme === 'cyber' || theme === 'space' || theme === 'nature' || theme === 'dinosaur') && (
        <svg viewBox="0 0 300 130" className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" preserveAspectRatio="none">
          <rect width="300" height="130" fill="#030712" />
          {/* Cybernetic Neural Synapse Grid */}
          <line x1="40" y1="40" x2="110" y2="80" stroke="#06b6d4" strokeWidth="2" opacity="0.6" />
          <line x1="110" y1="80" x2="190" y2="35" stroke="#3b82f6" strokeWidth="2" opacity="0.6" />
          <line x1="190" y1="35" x2="260" y2="85" stroke="#a855f7" strokeWidth="2" opacity="0.6" />
          <line x1="110" y1="80" x2="160" y2="105" stroke="#06b6d4" strokeWidth="2" opacity="0.5" />

          {/* Pulsing Quantum Nodes */}
          <circle cx="40" cy="40" r="7" fill="#06b6d4" filter="drop-shadow(0 0 10px #06b6d4)" />
          <circle cx="110" cy="80" r="9" fill="#3b82f6" filter="drop-shadow(0 0 12px #3b82f6)" />
          <circle cx="190" cy="35" r="8" fill="#a855f7" filter="drop-shadow(0 0 10px #a855f7)" />
          <circle cx="260" cy="85" r="7" fill="#ec4899" filter="drop-shadow(0 0 10px #ec4899)" />
          <circle cx="160" cy="105" r="6" fill="#10b981" filter="drop-shadow(0 0 8px #10b981)" />
        </svg>
      )}
    </div>
  );
};
