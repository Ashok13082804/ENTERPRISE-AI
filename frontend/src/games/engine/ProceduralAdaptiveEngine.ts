// Procedural Adaptive Engine - Generates Unique Worlds, Sprites & Mechanics for Every Game
import { GameRecord } from '@/data/gameDatabase';
import { soundManager } from './SoundManager';

interface ProceduralAdaptiveEngineOptions {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  game: GameRecord;
  width: number;
  height: number;
  activeKeys: Set<string>;
  scoreRef: React.MutableRefObject<number>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  isPlayingRef: React.MutableRefObject<boolean>;
  isPausedRef: React.MutableRefObject<boolean>;
  gameOverRef: React.MutableRefObject<boolean>;
  handleEndGame: (finalScore: number, outcome: 'victory' | 'game_over' | 'completed', message: string) => void;
}

export function startProceduralAdaptiveEngine({
  canvas,
  ctx,
  game,
  width,
  height,
  activeKeys,
  scoreRef,
  setScore,
  isPlayingRef,
  isPausedRef,
  gameOverRef,
  handleEndGame,
}: ProceduralAdaptiveEngineOptions) {
  // Deterministic seed based on game.id and game.name
  let seed = 0;
  const str = game.id + game.name + game.category;
  for (let i = 0; i < str.length; i++) {
    seed = (seed * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  const pseudoRandom = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const nameLower = game.name.toLowerCase();
  const catLower = game.category.toLowerCase();
  const descLower = (game.description || '').toLowerCase();

  // Detect Thematic Genre
  let theme: 'medieval' | 'cyber' | 'nature' | 'ocean' | 'volcano' | 'military' | 'magic' | 'space' | 'retro' | 'horror' = 'cyber';

  if (catLower.includes('horror') || nameLower.includes('dark') || nameLower.includes('ghost') || nameLower.includes('zombie')) {
    theme = 'horror';
  } else if (catLower.includes('rpg') || nameLower.includes('knight') || nameLower.includes('sword') || nameLower.includes('castle') || nameLower.includes('quest')) {
    theme = 'medieval';
  } else if (catLower.includes('space') || nameLower.includes('star') || nameLower.includes('cosmic') || nameLower.includes('galaxy') || nameLower.includes('alien')) {
    theme = 'space';
  } else if (nameLower.includes('magic') || nameLower.includes('wizard') || nameLower.includes('spell') || nameLower.includes('rune') || nameLower.includes('alchemist')) {
    theme = 'magic';
  } else if (nameLower.includes('tank') || nameLower.includes('war') || nameLower.includes('soldier') || nameLower.includes('military') || nameLower.includes('combat')) {
    theme = 'military';
  } else if (nameLower.includes('water') || nameLower.includes('ocean') || nameLower.includes('sea') || nameLower.includes('aqua') || nameLower.includes('fish') || nameLower.includes('diver')) {
    theme = 'ocean';
  } else if (nameLower.includes('fire') || nameLower.includes('lava') || nameLower.includes('volcano') || nameLower.includes('dragon') || catLower.includes('dinosaur')) {
    theme = 'volcano';
  } else if (nameLower.includes('forest') || nameLower.includes('tree') || nameLower.includes('jungle') || nameLower.includes('nature') || nameLower.includes('wild')) {
    theme = 'nature';
  } else if (catLower.includes('arcade') || nameLower.includes('retro') || nameLower.includes('synth') || nameLower.includes('pixel')) {
    theme = 'retro';
  }

  // Theme Visual Configuration
  const themeConfig = {
    medieval: {
      bg1: '#1c1917',
      bg2: '#0c0a09',
      accent: '#eab308',
      heroType: 'knight',
      particleColor: '#f59e0b',
      itemType: 'relic',
      specialName: 'Whirlwind Blade',
    },
    cyber: {
      bg1: '#090d16',
      bg2: '#020617',
      accent: '#06b6d4',
      heroType: 'cyborg',
      particleColor: '#38bdf8',
      itemType: 'data_core',
      specialName: 'EMP Pulse',
    },
    nature: {
      bg1: '#14532d',
      bg2: '#052e16',
      accent: '#4ade80',
      heroType: 'ranger',
      particleColor: '#86efac',
      itemType: 'nature_blossom',
      specialName: 'Nature Wrath',
    },
    ocean: {
      bg1: '#082f49',
      bg2: '#0c4a6e',
      accent: '#38bdf8',
      heroType: 'diver',
      particleColor: '#bae6fd',
      itemType: 'sea_pearl',
      specialName: 'Tidal Wave',
    },
    volcano: {
      bg1: '#450a0a',
      bg2: '#1c0505',
      accent: '#f97316',
      heroType: 'dragon_knight',
      particleColor: '#ef4444',
      itemType: 'fire_crystal',
      specialName: 'Meteor Strike',
    },
    military: {
      bg1: '#1e293b',
      bg2: '#0f172a',
      accent: '#84cc16',
      heroType: 'tank',
      particleColor: '#facc15',
      itemType: 'ammo_crate',
      specialName: 'Artillery Barrage',
    },
    magic: {
      bg1: '#3b0764',
      bg2: '#1e1b4b',
      accent: '#c084fc',
      heroType: 'wizard',
      particleColor: '#d8b4fe',
      itemType: 'mana_orb',
      specialName: 'Arcane Nova',
    },
    space: {
      bg1: '#050515',
      bg2: '#020208',
      accent: '#818cf8',
      heroType: 'starship',
      particleColor: '#c7d2fe',
      itemType: 'cosmic_star',
      specialName: 'Photon Laser',
    },
    retro: {
      bg1: '#2e1065',
      bg2: '#030712',
      accent: '#ec4899',
      heroType: 'retro_hero',
      particleColor: '#f43f5e',
      itemType: 'retro_gem',
      specialName: 'Hyper Dash',
    },
    horror: {
      bg1: '#18181b',
      bg2: '#09090b',
      accent: '#ef4444',
      heroType: 'survivor',
      particleColor: '#71717a',
      itemType: 'cursed_relic',
      specialName: 'Flare Burst',
    },
  }[theme];

  // Player Entity
  let playerX = width / 2;
  let playerY = height / 2;
  let playerAngle = 0;
  let abilityCooldown = 0;
  const maxCooldown = 80;
  let hp = 100;
  let stage = 1;
  const speed = 5.2;

  // Collectibles / Objectives
  interface ThematicItem {
    x: number;
    y: number;
    radius: number;
    value: number;
    floatOffset: number;
  }
  let items: ThematicItem[] = [];

  // Active Enemies / Adversaries
  interface ThematicEnemy {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    hp: number;
    color: string;
  }
  let enemies: ThematicEnemy[] = [];

  // Special ability attack shockwave
  interface Shockwave {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    color: string;
    alpha: number;
  }
  let shockwaves: Shockwave[] = [];

  // Floating ambient particles (Embers, bubbles, leaves, circuit sparks)
  let ambientParticles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
  for (let i = 0; i < 30; i++) {
    ambientParticles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: 1.5 + Math.random() * 2.5,
      alpha: 0.3 + Math.random() * 0.5,
    });
  }

  // Populate Stage Items
  const populateStage = () => {
    items = [];
    enemies = [];
    for (let i = 0; i < 10; i++) {
      items.push({
        x: 60 + Math.random() * (width - 120),
        y: 60 + Math.random() * (height - 120),
        radius: 14,
        value: 100,
        floatOffset: Math.random() * Math.PI * 2,
      });
    }

    const enemyCount = 3 + stage * 2;
    for (let i = 0; i < enemyCount; i++) {
      enemies.push({
        x: Math.random() < 0.5 ? 40 : width - 40,
        y: 50 + Math.random() * (height - 100),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 16,
        hp: 2 + stage,
        color: '#f43f5e',
      });
    }
  };
  populateStage();

  // Trigger Special Ability
  const triggerSpecialAbility = () => {
    if (abilityCooldown > 0) return;
    abilityCooldown = maxCooldown;
    soundManager.playScore();

    shockwaves.push({
      x: playerX,
      y: playerY,
      radius: 10,
      maxRadius: 180,
      color: themeConfig.accent,
      alpha: 1.0,
    });

    // Damage enemies in range
    enemies.forEach((e, idx) => {
      if (Math.hypot(e.x - playerX, e.y - playerY) < 180) {
        e.hp -= 3;
        if (e.hp <= 0) {
          enemies.splice(idx, 1);
          soundManager.playExplosion();
          setScore(s => s + 250);
        }
      }
    });
  };

  const onPointerDown = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (width / rect.width);
    const my = (e.clientY - rect.top) * (height / rect.height);
    playerAngle = Math.atan2(my - playerY, mx - playerX);
    triggerSpecialAbility();
  };

  const onPointerMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (width / rect.width);
    const my = (e.clientY - rect.top) * (height / rect.height);
    playerAngle = Math.atan2(my - playerY, mx - playerX);
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);

  let animationFrameId: number | null = null;
  let frame = 0;

  const loop = () => {
    if (!isPlayingRef.current) return;
    if (!isPausedRef.current && !gameOverRef.current) {
      frame++;
      const keys = activeKeys;

      // 8-Way Movement
      let dx = 0;
      let dy = 0;
      if (keys.has('ArrowLeft') || keys.has('KeyA') || keys.has('a')) dx -= 1;
      if (keys.has('ArrowRight') || keys.has('KeyD') || keys.has('d')) dx += 1;
      if (keys.has('ArrowUp') || keys.has('KeyW') || keys.has('w')) dy -= 1;
      if (keys.has('ArrowDown') || keys.has('KeyS') || keys.has('s')) dy += 1;

      if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
      }

      playerX = Math.max(35, Math.min(width - 35, playerX + dx * speed));
      playerY = Math.max(45, Math.min(height - 45, playerY + dy * speed));

      if (dx !== 0 || dy !== 0) {
        playerAngle = Math.atan2(dy, dx);
      }

      // Special Ability Action
      if (keys.has('Space') || keys.has('Enter') || keys.has(' ')) {
        triggerSpecialAbility();
      }

      if (abilityCooldown > 0) abilityCooldown--;

      // Update Shockwaves
      for (let sIdx = shockwaves.length - 1; sIdx >= 0; sIdx--) {
        const sw = shockwaves[sIdx];
        sw.radius += 9;
        sw.alpha -= 0.04;
        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(sIdx, 1);
        }
      }

      // Update Ambient Particles
      ambientParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      });

      // Collect Thematic Items
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        if (Math.hypot(playerX - it.x, playerY - it.y) < it.radius + 20) {
          items.splice(i, 1);
          soundManager.playScore();
          setScore(s => s + it.value);

          if (items.length === 0) {
            stage++;
            soundManager.playWin();
            if (stage > 3) {
              handleEndGame(scoreRef.current + 1500, 'victory', `🏆 Victory! Mastered all sectors of ${game.name}! Score: ${scoreRef.current + 1500}`);
              return;
            } else {
              populateStage();
            }
          }
        }
      }

      // Update Enemies
      enemies.forEach(e => {
        const angleToPlayer = Math.atan2(playerY - e.y, playerX - e.x);
        e.x += Math.cos(angleToPlayer) * 1.2;
        e.y += Math.sin(angleToPlayer) * 1.2;

        // Player Collision
        if (Math.hypot(playerX - e.x, playerY - e.y) < e.radius + 16) {
          hp -= 0.35;
          if (hp <= 0) {
            soundManager.playHit();
            handleEndGame(scoreRef.current, 'game_over', `💥 Defeated in battle for ${game.name}!`);
            return;
          }
        }
      });

      // -------------------------------------------------------------
      // RENDER UNIQUE WORLD
      // -------------------------------------------------------------
      // Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, themeConfig.bg1);
      bgGrad.addColorStop(1, themeConfig.bg2);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Environment Geometry / Floor Art
      if (theme === 'medieval') {
        // Castle Paver Tiles
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 60) {
          for (let y = 0; y < height; y += 60) {
            ctx.strokeRect(x, y, 60, 60);
          }
        }
      } else if (theme === 'cyber') {
        // Hexagonal / Grid Matrix
        ctx.strokeStyle = '#06b6d418';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += 40) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }
      } else if (theme === 'space') {
        // Distant Constellations
        ctx.fillStyle = '#ffffff66';
        for (let s = 0; s < 50; s++) {
          const sx = ((s * 137) % width);
          const sy = ((s * 219) % height);
          ctx.fillRect(sx, sy, (s % 4 === 0) ? 2.5 : 1.5, (s % 4 === 0) ? 2.5 : 1.5);
        }
      }

      // Ambient Particles
      ambientParticles.forEach(p => {
        ctx.fillStyle = themeConfig.particleColor;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Draw Shockwaves
      shockwaves.forEach(sw => {
        ctx.strokeStyle = sw.color;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 18;
        ctx.lineWidth = 4;
        ctx.globalAlpha = Math.max(0, sw.alpha);
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
      ctx.globalAlpha = 1.0;

      // Draw Thematic Items (Not plain dots!)
      items.forEach(it => {
        const floatY = it.y + Math.sin(frame * 0.06 + it.floatOffset) * 4;

        ctx.shadowColor = themeConfig.accent;
        ctx.shadowBlur = 12;

        if (themeConfig.itemType === 'relic') {
          // Ancient Golden Chalice / Relic
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(it.x, floatY - 2, 10, 0, Math.PI);
          ctx.lineTo(it.x + 2, floatY + 8);
          ctx.lineTo(it.x - 2, floatY + 8);
          ctx.closePath();
          ctx.fill();
        } else if (themeConfig.itemType === 'data_core') {
          // Glowing Cyber Core
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.rect(it.x - 8, floatY - 8, 16, 16);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(it.x - 4, floatY - 4, 8, 8);
        } else if (themeConfig.itemType === 'mana_orb') {
          // Arcane Purple Mana Crystal
          ctx.fillStyle = '#c084fc';
          ctx.beginPath();
          ctx.moveTo(it.x, floatY - 12);
          ctx.lineTo(it.x + 9, floatY);
          ctx.lineTo(it.x, floatY + 12);
          ctx.lineTo(it.x - 9, floatY);
          ctx.closePath();
          ctx.fill();
        } else if (themeConfig.itemType === 'fire_crystal') {
          // Burning Flame Gem
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(it.x, floatY, 9, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Star / Crystal Jewel
          ctx.fillStyle = themeConfig.accent;
          ctx.beginPath();
          ctx.arc(it.x, floatY, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(it.x - 3, floatY - 3, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      });

      // Draw Enemies (Thematic Adversaries)
      enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 8;

        // Demon / Drone / Monster shape
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();

        // Glowing red hostile eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(e.x - 5, e.y - 4, 3, 0, Math.PI * 2);
        ctx.arc(e.x + 5, e.y - 4, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(e.x - 4, e.y - 4, 1.5, 0, Math.PI * 2);
        ctx.arc(e.x + 6, e.y - 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // DRAW THEMATIC HERO AVATAR (Custom Sprite according to game theme!)
      ctx.save();
      ctx.translate(playerX, playerY);
      ctx.rotate(playerAngle);

      if (themeConfig.heroType === 'knight') {
        // Crusader Knight with Shield & Broadsword
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Helmet Gold Crest
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-3, -16, 6, 6);

        // Sword blade extended forward
        ctx.fillStyle = '#e2e8f0';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.fillRect(8, 6, 22, 4);
        ctx.shadowBlur = 0;

        // Shield on side
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.roundRect(4, -14, 10, 18, 4);
        ctx.fill();
      } else if (themeConfig.heroType === 'wizard') {
        // Arcane Wizard with Pointed Hat & Glowing Staff
        ctx.fillStyle = '#7e22ce';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Arcane Staff
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(8, -12);
        ctx.lineTo(24, -12);
        ctx.stroke();

        ctx.fillStyle = '#c084fc';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(26, -12, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (themeConfig.heroType === 'tank') {
        // Military Armored Tank
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.roundRect(-16, -14, 32, 28, 4);
        ctx.fill();

        // Treads
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-16, -16, 32, 4);
        ctx.fillRect(-16, 12, 32, 4);

        // Turret Barrel
        ctx.fillStyle = '#84cc16';
        ctx.fillRect(2, -4, 22, 8);
      } else if (themeConfig.heroType === 'starship') {
        // Sleek Cosmic Starfighter
        ctx.fillStyle = '#3b82f6';
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(22, 0);
        ctx.lineTo(-14, -15);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-14, 15);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Cockpit
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(4, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Stylized Futuristic Hero / Cyborg
        ctx.fillStyle = themeConfig.accent;
        ctx.shadowColor = themeConfig.accent;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Visor / Blaster
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(8, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // IN-GAME MISSION HUD
      // Top Left: Game Info & Objective Banner
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(16, 14, 380, 52, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = themeConfig.accent;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${game.name.toUpperCase()} · STAGE ${stage}/3`, 28, 32);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px sans-serif';
      const objText = game.objective || `Collect all sector resources and eliminate threats!`;
      ctx.fillText(objText.length > 55 ? objText.substring(0, 52) + '...' : objText, 28, 52);

      // Top Right: Health & Special Cooldown
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.roundRect(width - 240, 14, 224, 52, 10);
      ctx.fill();
      ctx.stroke();

      // Health bar
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('HEALTH', width - 228, 30);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(width - 175, 20, 145, 12);
      ctx.fillStyle = hp > 40 ? '#10b981' : '#ef4444';
      ctx.fillRect(width - 175, 20, (Math.max(0, hp) / 100) * 145, 12);

      // Special Ability Cooldown
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('SPECIAL', width - 228, 52);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(width - 175, 42, 145, 12);
      const cdRatio = 1 - abilityCooldown / maxCooldown;
      ctx.fillStyle = abilityCooldown === 0 ? themeConfig.accent : '#64748b';
      ctx.fillRect(width - 175, 42, cdRatio * 145, 12);

      if (abilityCooldown === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`[SPACE] ${themeConfig.specialName}`, width - 102, 52);
      }
    }
    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);

  return () => {
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
}
