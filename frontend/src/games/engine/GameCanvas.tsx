import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Maximize2, Pause, Trophy, Star, Shield, Zap, Sparkles, CheckCircle2, BookOpen, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Flame, Target, Keyboard } from 'lucide-react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { GameRecord } from '@/data/gameDatabase';
import { useGameHistoryStore } from '@/store/gameHistoryStore';
import { soundManager } from './SoundManager';
import { GameManualModal } from '@/components/gamehub/GameManualModal';
import { startPinballEngine } from './PinballEngine';
import { startAsteroidsEngine } from './AsteroidsEngine';
import { startPacmanEngine } from './PacmanEngine';
import { startFruitNinjaEngine } from './FruitNinjaEngine';
import { startCrossyEngine } from './CrossyEngine';
import { startPlatformerEngine } from './PlatformerEngine';
import { startTowerDefenseEngine } from './TowerDefenseEngine';
import { startHorrorSurvivalEngine } from './HorrorSurvivalEngine';
import { startSportsEngine } from './SportsEngine';
import { startPuzzleEngine } from './PuzzleEngine';
import { startBlockStackerEngine } from './BlockStackerEngine';
import { startDoodleJumpEngine } from './DoodleJumpEngine';
import { startProceduralAdaptiveEngine } from './ProceduralAdaptiveEngine';
import { getGameControlsDisplay } from '@/utils/gameControlsAndManual';

interface GameCanvasProps {
  game: GameRecord;
  onGameOver?: (score: number, outcome: string) => void;
  className?: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ game, onGameOver, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvas2DRef = useRef<HTMLCanvasElement>(null);
  const threeMountRef = useRef<HTMLDivElement>(null);

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameMessage, setGameMessage] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [gameTime, setGameTime] = useState<number>(0);
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [restartCount, setRestartCount] = useState<number>(0);

  const { recordGameSession, getHighScore } = useGameHistoryStore();

  // References for animation frame loops and cleanup
  const animationFrameId = useRef<number | null>(null);
  const gameStartTimeRef = useRef<number>(Date.now());
  const scoreRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(true);
  const isPausedRef = useRef<boolean>(false);
  const gameOverRef = useRef<boolean>(false);

  // Active keyboard keys set for smooth continuous movement & simultaneous key combinations
  const activeKeysRef = useRef<Set<string>>(new Set());

  // Active virtual button hold timers for smooth continuous controls
  const virtualHoldIntervalRef = useRef<number | null>(null);

  // Sync refs
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  // Load high score
  useEffect(() => {
    const savedHigh = getHighScore(game.id);
    setHighScore(savedHigh);
  }, [game.id, getHighScore]);

  // Game timer
  useEffect(() => {
    if (!isPlaying || isPaused || gameOver) return;
    const interval = setInterval(() => {
      setGameTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isPaused, gameOver]);

  // Finish game helper
  const handleEndGame = useCallback((finalScore: number, outcome: 'victory' | 'game_over' | 'completed', message: string) => {
    if (gameOverRef.current) return;
    setGameOver(true);
    setGameMessage(message);
    gameOverRef.current = true;

    if (outcome === 'victory' || finalScore > highScore) {
      soundManager.playWin();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      soundManager.playGameOver();
    }

    const duration = Math.max(1, Math.round((Date.now() - gameStartTimeRef.current) / 1000));
    recordGameSession({
      gameId: game.id,
      gameName: game.name,
      category: game.category,
      score: finalScore,
      durationSeconds: duration,
      outcome,
      accuracy: Math.min(100, 75 + Math.floor(Math.random() * 25)),
    });

    if (finalScore > highScore) {
      setHighScore(finalScore);
    }

    if (onGameOver) {
      onGameOver(finalScore, outcome);
    }
  }, [game, highScore, recordGameSession, onGameOver]);

  // Restart game
  const handleRestart = useCallback(() => {
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    gameOverRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    setIsPlaying(true);
    isPlayingRef.current = true;
    setGameTime(0);
    gameStartTimeRef.current = Date.now();
    activeKeysRef.current.clear();
    soundManager.playScore();
    setRestartCount(c => c + 1);
  }, []);

  const toggleSound = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Check if target is an interactive form element (input/textarea/select)
  const isInputField = (target: EventTarget | null) => {
    if (!target || !(target instanceof HTMLElement)) return false;
    const tag = target.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
  };

  // Virtual Gamepad synthetic event dispatcher
  const triggerVirtualKey = useCallback((key: string, code: string) => {
    activeKeysRef.current.add(code);
    activeKeysRef.current.add(key.toLowerCase());
    activeKeysRef.current.add(key);

    window.dispatchEvent(new KeyboardEvent('keydown', { key, code, bubbles: true }));
    setTimeout(() => {
      activeKeysRef.current.delete(code);
      activeKeysRef.current.delete(key.toLowerCase());
      activeKeysRef.current.delete(key);
      window.dispatchEvent(new KeyboardEvent('keyup', { key, code, bubbles: true }));
    }, 90);
  }, []);

  const startHoldKey = (key: string, code: string) => {
    activeKeysRef.current.add(code);
    activeKeysRef.current.add(key.toLowerCase());
    activeKeysRef.current.add(key);
    triggerVirtualKey(key, code);

    if (virtualHoldIntervalRef.current) clearInterval(virtualHoldIntervalRef.current);
    virtualHoldIntervalRef.current = window.setInterval(() => {
      triggerVirtualKey(key, code);
    }, 110);
  };

  const stopHoldKey = (code?: string) => {
    if (code) {
      activeKeysRef.current.delete(code);
    }
    if (virtualHoldIntervalRef.current) {
      clearInterval(virtualHoldIntervalRef.current);
      virtualHoldIntervalRef.current = null;
    }
  };

  // ---------------------------------------------------------------------------
  // GLOBAL KEYBOARD EVENT MANAGER
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const onGlobalKeyDown = (e: KeyboardEvent) => {
      // 1. Never capture keys if user is typing in forms, text inputs, search boxes
      if (isInputField(e.target)) return;

      // 2. Universal Global Shortcuts
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePause();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showManualModal) {
          setShowManualModal(false);
        } else {
          togglePause();
        }
        return;
      }
      if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleRestart();
        return;
      }
      if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowManualModal(prev => !prev);
        return;
      }
      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // 3. Prevent browser default scrolling for gaming keys
      const scrollKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '];
      if (scrollKeys.includes(e.key) || scrollKeys.includes(e.code)) {
        e.preventDefault();
      }

      // 4. Track active key states for 60fps continuous movements
      activeKeysRef.current.add(e.code);
      activeKeysRef.current.add(e.key.toLowerCase());
      activeKeysRef.current.add(e.key);
    };

    const onGlobalKeyUp = (e: KeyboardEvent) => {
      if (isInputField(e.target)) return;
      activeKeysRef.current.delete(e.code);
      activeKeysRef.current.delete(e.key.toLowerCase());
      activeKeysRef.current.delete(e.key);
    };

    const onBlur = () => {
      activeKeysRef.current.clear();
    };

    window.addEventListener('keydown', onGlobalKeyDown, { passive: false });
    window.addEventListener('keyup', onGlobalKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onGlobalKeyDown);
      window.removeEventListener('keyup', onGlobalKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [togglePause, handleRestart, toggleFullscreen, showManualModal]);

  // ---------------------------------------------------------------------------
  // GAME ENGINE DISPATCHER
  useEffect(() => {
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    gameOverRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    setIsPlaying(true);
    isPlayingRef.current = true;
    setGameTime(0);
    gameStartTimeRef.current = Date.now();
    activeKeysRef.current.clear();

    // -------------------------------------------------------------------------
    // 3D GAME ENGINE (THREE.JS)
    // -------------------------------------------------------------------------
    if (game.is_3d && threeMountRef.current) {
      const mount = threeMountRef.current;
      mount.innerHTML = '';

      const width = mount.clientWidth || 800;
      const height = mount.clientHeight || 500;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(
        game.category.includes('Horror') ? 0x07070d :
        game.category.includes('Space') ? 0x050515 :
        game.category.includes('Racing') ? 0x1a233a :
        game.category.includes('Dinosaur') ? 0x142818 :
        0x0d1117
      );

      // Camera
      const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      mount.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, game.category.includes('Horror') ? 0.2 : 0.6);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
      dirLight.position.set(15, 30, 20);
      dirLight.castShadow = true;
      scene.add(dirLight);

      // Ground plane / environment
      const groundGeo = new THREE.PlaneGeometry(150, 150, 20, 20);
      const groundMat = new THREE.MeshStandardMaterial({
        color: game.category.includes('Horror') ? 0x1f1a24 :
               game.category.includes('Racing') ? 0x1b1f24 :
               game.category.includes('Dinosaur') ? 0x223a1e :
               0x161b22,
        roughness: 0.8,
        wireframe: game.category.includes('Sci-Fi'),
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Grid helper for tech feel
      const grid = new THREE.GridHelper(150, 40, 0x6366f1, 0x334155);
      grid.position.y = 0.05;
      scene.add(grid);

      // Gameplay entities
      const objects: THREE.Mesh[] = [];
      const isShooter = game.category.includes('Shooter') || game.name.includes('Shooter');
      const isRacer = game.category.includes('Racing') || game.name.includes('Racing') || game.name.includes('Car');

      // Player Object
      let playerMesh: THREE.Mesh;
      if (isRacer) {
        const carGeo = new THREE.BoxGeometry(2, 0.8, 3.8);
        const carMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.8, roughness: 0.2 });
        playerMesh = new THREE.Mesh(carGeo, carMat);
        playerMesh.position.set(0, 0.4, 0);
        scene.add(playerMesh);
        camera.position.set(0, 4, -8);
        camera.lookAt(0, 0, 10);
      } else if (isShooter) {
        // Weapon in hand / cockpit
        const gunGeo = new THREE.BoxGeometry(0.3, 0.4, 1.2);
        const gunMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, metalness: 0.9, roughness: 0.1 });
        playerMesh = new THREE.Mesh(gunGeo, gunMat);
        playerMesh.position.set(0.6, -0.4, 1.2);
        camera.add(playerMesh);
        scene.add(camera);
        camera.position.set(0, 2, 0);
      } else {
        // General 3D Character
        const avatarGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.8, 16);
        const avatarMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.3 });
        playerMesh = new THREE.Mesh(avatarGeo, avatarMat);
        playerMesh.position.set(0, 0.9, 0);
        scene.add(playerMesh);
        camera.position.set(0, 6, -10);
        camera.lookAt(playerMesh.position);
      }

      // Populate interactive 3D world targets / obstacles
      const targetColors = [0xef4444, 0xf59e0b, 0x10b981, 0x06b6d4, 0xec4899];
      for (let i = 0; i < 24; i++) {
        const shapeType = Math.floor(Math.random() * 3);
        let geo: THREE.BufferGeometry;
        if (shapeType === 0) geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        else if (shapeType === 1) geo = new THREE.SphereGeometry(1, 16, 16);
        else geo = new THREE.ConeGeometry(1, 2.2, 16);

        const color = targetColors[i % targetColors.length];
        const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.4, roughness: 0.4 });
        const mesh = new THREE.Mesh(geo, mat);

        mesh.position.x = (Math.random() - 0.5) * 80;
        mesh.position.y = 1 + Math.random() * 2;
        mesh.position.z = 10 + Math.random() * 70;
        mesh.castShadow = true;

        scene.add(mesh);
        objects.push(mesh);
      }

      // Discrete Action on KeyDown
      const onDiscreteKey = (e: KeyboardEvent) => {
        if (isInputField(e.target)) return;
        if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter') {
          soundManager.playShoot();
          setScore(s => {
            const next = s + 100;
            if (next >= 1500) {
              handleEndGame(next, 'victory', '🎯 Objective Cleared! Spectacular 3D Victory!');
            }
            return next;
          });
        }
      };
      window.addEventListener('keydown', onDiscreteKey);

      // Mouse aim / click
      const onPointerDown = () => {
        soundManager.playShoot();
        setScore(s => s + 50);
      };
      mount.addEventListener('pointerdown', onPointerDown);

      // Animation loop: checks activeKeysRef every frame for smooth 60fps continuous control
      let animId: number;
      const animate = () => {
        if (!isPlayingRef.current) return;
        if (!isPausedRef.current && !gameOverRef.current) {
          const keys = activeKeysRef.current;
          const isSprint = keys.has('ShiftLeft') || keys.has('ShiftRight') || keys.has('shift');
          const baseSpeed = isRacer ? 0.6 : 0.45;
          const speed = baseSpeed * (isSprint ? 1.75 : 1.0);

          // Forward / Accelerate
          if (keys.has('KeyW') || keys.has('ArrowUp') || keys.has('w')) {
            if (isRacer) playerMesh.position.z += speed * 1.5;
            else camera.position.z += speed;
          }
          // Backward / Brake
          if (keys.has('KeyS') || keys.has('ArrowDown') || keys.has('s')) {
            if (isRacer) playerMesh.position.z -= speed * 0.8;
            else camera.position.z -= speed;
          }
          // Steer Left / Strafe Left
          if (keys.has('KeyA') || keys.has('ArrowLeft') || keys.has('a')) {
            if (isRacer) playerMesh.position.x += speed * 1.1;
            else camera.position.x -= speed;
          }
          // Steer Right / Strafe Right
          if (keys.has('KeyD') || keys.has('ArrowRight') || keys.has('d')) {
            if (isRacer) playerMesh.position.x -= speed * 1.1;
            else camera.position.x += speed;
          }

          if (isRacer) {
            camera.position.x = playerMesh.position.x;
            camera.position.z = playerMesh.position.z - 8;
            camera.lookAt(playerMesh.position.x, 1, playerMesh.position.z + 10);
          } else if (!isShooter) {
            camera.lookAt(playerMesh.position);
          }

          // Rotate ambient targets
          objects.forEach((obj, idx) => {
            obj.rotation.x += 0.01 * (idx % 2 === 0 ? 1 : -1);
            obj.rotation.y += 0.02;

            // Check collision proximity
            const dist = isRacer ? obj.position.distanceTo(playerMesh.position) : obj.position.distanceTo(camera.position);
            if (dist < 2.5) {
              soundManager.playHit();
              obj.position.z += 80;
              setScore(s => s + 150);
            }
          });

          renderer.render(scene, camera);
        }
        animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);

      // Resize handler
      const handleResize = () => {
        if (!mount) return;
        const newW = mount.clientWidth;
        const newH = mount.clientHeight;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('keydown', onDiscreteKey);
        window.removeEventListener('resize', handleResize);
        mount.removeEventListener('pointerdown', onPointerDown);
        renderer.dispose();
      };
    }

    // -------------------------------------------------------------------------
    // 2D CANVAS GAME ENGINES
    // -------------------------------------------------------------------------
    const canvas = canvas2DRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    const gameplay = game.gameplayCategory || 'generic_arcade';
    const nameLower = game.name.toLowerCase();

    // ---------------------------------------------
    // DEDICATED ENGINE: PINBALL (GAME-012, etc.)
    // ---------------------------------------------
    if (gameplay === 'pinball' || nameLower.includes('pinball')) {
      return startPinballEngine({
        canvas,
        ctx,
        game,
        width,
        height,
        activeKeys: activeKeysRef.current,
        scoreRef,
        setScore,
        isPlayingRef,
        isPausedRef,
        gameOverRef,
        handleEndGame,
      });
    }

    // ---------------------------------------------
    // DEDICATED ENGINE: ASTEROIDS (GAME-006, etc.)
    // ---------------------------------------------
    if (gameplay === 'asteroids' || nameLower.includes('asteroid')) {
      return startAsteroidsEngine({
        canvas,
        ctx,
        game,
        width,
        height,
        activeKeys: activeKeysRef.current,
        scoreRef,
        setScore,
        isPlayingRef,
        isPausedRef,
        gameOverRef,
        handleEndGame,
      });
    }

    // ---------------------------------------------
    // DEDICATED ENGINE: PAC-MAN & MAZE (GAME-007, etc.)
    // ---------------------------------------------
    if (gameplay === 'pacman' || nameLower.includes('pac-man') || nameLower.includes('pacman') || gameplay.includes('maze')) {
      return startPacmanEngine({
        canvas,
        ctx,
        game,
        width,
        height,
        activeKeys: activeKeysRef.current,
        scoreRef,
        setScore,
        isPlayingRef,
        isPausedRef,
        gameOverRef,
        handleEndGame,
      });
    }

    // ---------------------------------------------
    // DEDICATED ENGINE: FRUIT NINJA & BLADE SLICE (GAME-014, etc.)
    // ---------------------------------------------
    if (gameplay === 'fruit_ninja' || nameLower.includes('fruit') || nameLower.includes('slice') || gameplay.includes('ninja')) {
      return startFruitNinjaEngine({
        canvas,
        ctx,
        game,
        width,
        height,
        activeKeys: activeKeysRef.current,
        scoreRef,
        setScore,
        isPlayingRef,
        isPausedRef,
        gameOverRef,
        handleEndGame,
      });
    }

    // ---------------------------------------------
    // DEDICATED ENGINE: CROSSY ROAD & FROGGER (GAME-009, etc.)
    // ---------------------------------------------
    if (gameplay === 'crossy' || nameLower.includes('crossy') || nameLower.includes('frogger')) {
      return startCrossyEngine({
        canvas,
        ctx,
        game,
        width,
        height,
        activeKeys: activeKeysRef.current,
        scoreRef,
        setScore,
        isPlayingRef,
        isPausedRef,
        gameOverRef,
        handleEndGame,
      });
    }

    // ---------------------------------------------
    // DEDICATED ENGINE: DOODLE JUMP (GAME-016, etc.)
    // ---------------------------------------------
    if (gameplay === 'doodle_jump' || nameLower.includes('doodle')) {
      return startDoodleJumpEngine({
        canvas,
        ctx,
        game,
        width,
        height,
        activeKeys: activeKeysRef.current,
        scoreRef,
        setScore,
        isPlayingRef,
        isPausedRef,
        gameOverRef,
        handleEndGame,
      });
    }

    // ---------------------------------------------
    // DEDICATED ENGINE: 2D PLATFORMER (GAME-061 - GAME-075)
    // ---------------------------------------------
    if (game.category === 'Platformer Games' || gameplay.includes('platform') || nameLower.includes('platform')) {
      return startPlatformerEngine({
        canvas,
        ctx,
        game,
        width,
        height,
        activeKeys: activeKeysRef.current,
        scoreRef,
        setScore,
        isPlayingRef,
        isPausedRef,
        gameOverRef,
        handleEndGame,
      });
    }

    // ---------------------------------------------
    // DEDICATED ENGINE: TOWER DEFENSE & STRATEGY
    // ---------------------------------------------
    if (game.category === 'Strategy Games' || gameplay.includes('tower') || gameplay.includes('defense') || nameLower.includes('tower')) {
      return startTowerDefenseEngine({
        canvas,
        ctx,
        game,
        width,
        height,
        activeKeys: activeKeysRef.current,
        scoreRef,
        setScore,
        isPlayingRef,
        isPausedRef,
        gameOverRef,
        handleEndGame,
      });
    }

    // ---------------------------------------------
    // DEDICATED ENGINE: HORROR & ZOMBIE FLASHLIGHT SURVIVAL
    // ---------------------------------------------
    if (game.category === 'Horror Games' || gameplay.includes('horror') || gameplay.includes('zombie') || nameLower.includes('zombie') || nameLower.includes('horror')) {
      return startHorrorSurvivalEngine({
        canvas,
        ctx,
        game,
        width,
        height,
        activeKeys: activeKeysRef.current,
        scoreRef,
        setScore,
        isPlayingRef,
        isPausedRef,
        gameOverRef,
        handleEndGame,
      });
    }

    // ---------------------------------------------
    // DEDICATED ENGINE: SPORTS SIMULATION (Soccer / Basketball / Golf)
    // ---------------------------------------------
    if (game.category === 'Sports Games' || gameplay.includes('soccer') || gameplay.includes('football') || gameplay.includes('basketball') || gameplay.includes('golf')) {
      return startSportsEngine({
        canvas,
        ctx,
        game,
        width,
        height,
        activeKeys: activeKeysRef.current,
        scoreRef,
        setScore,
        isPlayingRef,
        isPausedRef,
        gameOverRef,
        handleEndGame,
      });
    }

    // ---------------------------------------------
    // DEDICATED ENGINE: PUZZLE & MATCH-3 GEMS
    // ---------------------------------------------
    if (game.category === 'Puzzle Games' || gameplay.includes('match') || gameplay.includes('puzzle') || gameplay.includes('gem')) {
      return startPuzzleEngine({
        canvas,
        ctx,
        game,
        width,
        height,
        activeKeys: activeKeysRef.current,
        scoreRef,
        setScore,
        isPlayingRef,
        isPausedRef,
        gameOverRef,
        handleEndGame,
      });
    }

    // ---------------------------------------------
    // DEDICATED ENGINE: BUILDING & TETRIS BLOCK STACKER
    // ---------------------------------------------
    if (game.category === 'Building Games' || gameplay.includes('tetris') || gameplay.includes('block') || gameplay.includes('stack')) {
      return startBlockStackerEngine({
        canvas,
        ctx,
        game,
        width,
        height,
        activeKeys: activeKeysRef.current,
        scoreRef,
        setScore,
        isPlayingRef,
        isPausedRef,
        gameOverRef,
        handleEndGame,
      });
    }

    // ---------------------------------------------
    // ENGINE 1: SNAKE (GAME-001, etc.)
    // ---------------------------------------------
    if (gameplay === 'snake') {
      const gridSize = 20;
      let snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ];
      let dx = 1;
      let dy = 0;
      let food = { x: 15, y: 10 };
      let lastMoveTime = 0;
      const baseInterval = 110;

      const placeFood = () => {
        food = {
          x: Math.floor(Math.random() * (width / gridSize - 4)) + 2,
          y: Math.floor(Math.random() * (height / gridSize - 4)) + 2,
        };
      };

      const handleKey = (e: KeyboardEvent) => {
        if (isInputField(e.target)) return;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.code === 'ArrowUp' || e.code === 'KeyW') { 
          if (dy === 0) { dx = 0; dy = -1; soundManager.playMove(); } 
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.code === 'ArrowDown' || e.code === 'KeyS') { 
          if (dy === 0) { dx = 0; dy = 1; soundManager.playMove(); } 
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.code === 'ArrowLeft' || e.code === 'KeyA') { 
          if (dx === 0) { dx = -1; dy = 0; soundManager.playMove(); } 
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.code === 'ArrowRight' || e.code === 'KeyD') { 
          if (dx === 0) { dx = 1; dy = 0; soundManager.playMove(); } 
        }
      };
      window.addEventListener('keydown', handleKey);

      const loop = (timestamp: number) => {
        if (!isPlayingRef.current) return;
        if (!isPausedRef.current && !gameOverRef.current) {
          // Check if space/shift turbo speed is active
          const isBoost = activeKeysRef.current.has('Space') || activeKeysRef.current.has('ShiftLeft');
          const moveInterval = isBoost ? baseInterval * 0.55 : baseInterval;

          if (timestamp - lastMoveTime > moveInterval) {
            lastMoveTime = timestamp;
            const head = { x: snake[0].x + dx, y: snake[0].y + dy };

            // Wall collision
            if (head.x < 0 || head.x >= width / gridSize || head.y < 0 || head.y >= height / gridSize) {
              handleEndGame(scoreRef.current, 'game_over', '💥 Snake crashed into perimeter wall!');
              return;
            }

            // Self collision
            for (let i = 1; i < snake.length; i++) {
              if (snake[i].x === head.x && snake[i].y === head.y) {
                handleEndGame(scoreRef.current, 'game_over', '💥 Snake collided with its own tail!');
                return;
              }
            }

            snake.unshift(head);

            // Food collision
            if (head.x === food.x && head.y === food.y) {
              soundManager.playScore();
              setScore(s => {
                const next = s + 100;
                if (next >= 1500) {
                  handleEndGame(next, 'victory', '👑 Snake Master! 1,500 Score Reached!');
                }
                return next;
              });
              placeFood();
            } else {
              snake.pop();
            }
          }

          // Render
          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, width, height);

          // Grid lines
          ctx.strokeStyle = '#1e293b22';
          ctx.lineWidth = 1;
          for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
          }
          for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
          }

          // Food
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Snake
          snake.forEach((seg, i) => {
            ctx.fillStyle = i === 0 ? '#10b981' : '#059669';
            ctx.shadowColor = i === 0 ? '#10b981' : 'transparent';
            ctx.shadowBlur = i === 0 ? 8 : 0;
            ctx.beginPath();
            ctx.roundRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2, 4);
            ctx.fill();
          });
          ctx.shadowBlur = 0;
        }
        animationFrameId.current = requestAnimationFrame(loop);
      };
      animationFrameId.current = requestAnimationFrame(loop);

      return () => {
        window.removeEventListener('keydown', handleKey);
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      };
    }

    // ---------------------------------------------
    // ENGINE 2: PONG (GAME-002, etc.)
    // ---------------------------------------------
    if (gameplay === 'pong') {
      const paddleW = 14;
      const paddleH = 90;
      let playerY = height / 2 - paddleH / 2;
      let aiY = height / 2 - paddleH / 2;
      let ballX = width / 2;
      let ballY = height / 2;
      let ballSpeedX = 6;
      let ballSpeedY = 4;
      let playerScore = 0;
      let aiScore = 0;

      const onMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const scaleY = height / rect.height;
        const relativeY = (e.clientY - rect.top) * scaleY;
        playerY = Math.max(10, Math.min(height - paddleH - 10, relativeY - paddleH / 2));
      };
      canvas.addEventListener('mousemove', onMouseMove);

      const loop = () => {
        if (!isPlayingRef.current) return;
        if (!isPausedRef.current && !gameOverRef.current) {
          // Continuous smooth keyboard movement for left paddle (W/S or ArrowUp/Down)
          const keys = activeKeysRef.current;
          const pSpeed = 8;
          if (keys.has('KeyW') || keys.has('w') || keys.has('ArrowUp')) {
            playerY = Math.max(10, playerY - pSpeed);
          }
          if (keys.has('KeyS') || keys.has('s') || keys.has('ArrowDown')) {
            playerY = Math.min(height - paddleH - 10, playerY + pSpeed);
          }

          ballX += ballSpeedX;
          ballY += ballSpeedY;

          // Top/bottom wall bounce
          if (ballY <= 8 || ballY >= height - 8) {
            ballSpeedY = -ballSpeedY;
            soundManager.playHit();
          }

          // AI paddle tracking
          const targetY = ballY - paddleH / 2;
          aiY += (targetY - aiY) * 0.085;
          aiY = Math.max(10, Math.min(height - paddleH - 10, aiY));

          // Player paddle hit
          if (ballX <= 40 + paddleW && ballX >= 35 && ballY >= playerY && ballY <= playerY + paddleH) {
            ballSpeedX = Math.abs(ballSpeedX) * 1.05;
            // Angle deflection
            const deltaY = ballY - (playerY + paddleH / 2);
            ballSpeedY = deltaY * 0.25;
            soundManager.playHit();
            setScore(s => s + 25);
          }

          // AI paddle hit
          if (ballX >= width - 40 - paddleW && ballX <= width - 35 && ballY >= aiY && ballY <= aiY + paddleH) {
            ballSpeedX = -Math.abs(ballSpeedX) * 1.05;
            const deltaY = ballY - (aiY + paddleH / 2);
            ballSpeedY = deltaY * 0.25;
            soundManager.playHit();
          }

          // Point scored
          if (ballX < 0) {
            aiScore++;
            soundManager.playGameOver();
            ballX = width / 2;
            ballY = height / 2;
            ballSpeedX = 6;
            ballSpeedY = (Math.random() - 0.5) * 6;
            if (aiScore >= 7) {
              handleEndGame(scoreRef.current, 'game_over', 'AI Opponent Won Match (7-point rule)!');
              return;
            }
          } else if (ballX > width) {
            playerScore++;
            soundManager.playScore();
            setScore(s => s + 200);
            ballX = width / 2;
            ballY = height / 2;
            ballSpeedX = -6;
            ballSpeedY = (Math.random() - 0.5) * 6;
            if (playerScore >= 7) {
              handleEndGame(scoreRef.current + 1000, 'victory', '🏆 Grand Champion! You defeated AI 7-point match!');
              return;
            }
          }

          // Render
          ctx.fillStyle = '#0a0e1a';
          ctx.fillRect(0, 0, width, height);

          // Center dashed net
          ctx.strokeStyle = '#334155';
          ctx.setLineDash([8, 8]);
          ctx.beginPath();
          ctx.moveTo(width / 2, 0);
          ctx.lineTo(width / 2, height);
          ctx.stroke();
          ctx.setLineDash([]);

          // Scores on field
          ctx.font = 'bold 36px monospace';
          ctx.fillStyle = '#ffffff22';
          ctx.textAlign = 'center';
          ctx.fillText(`${playerScore}`, width / 4, 60);
          ctx.fillText(`${aiScore}`, (3 * width) / 4, 60);

          // Paddles
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.fillRect(40, playerY, paddleW, paddleH);

          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = '#f43f5e';
          ctx.fillRect(width - 40 - paddleW, aiY, paddleW, paddleH);

          // Ball
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ffffff';
          ctx.beginPath();
          ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        animationFrameId.current = requestAnimationFrame(loop);
      };
      animationFrameId.current = requestAnimationFrame(loop);

      return () => {
        canvas.removeEventListener('mousemove', onMouseMove);
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      };
    }

    // ---------------------------------------------
    // ENGINE 3: BREAKOUT / BRICK BREAKER / ARKANOID (GAME-003, GAME-004, GAME-011)
    // ---------------------------------------------
    if (gameplay === 'breakout' || gameplay === 'arkanoid' || gameplay === 'brick_breaker') {
      const paddleW = 124;
      const paddleH = 16;
      let paddleX = (width - paddleW) / 2;
      let ballX = width / 2;
      let ballY = height - 60;
      let ballDx = 5;
      let ballDy = -5;

      const rows = 5;
      const cols = 9;
      const brickW = 74;
      const brickH = 22;
      const brickPad = 8;
      const offsetTop = 45;
      const offsetLeft = (width - (cols * (brickW + brickPad) - brickPad)) / 2;

      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
      const bricks: { x: number; y: number; status: number; color: string; val: number }[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          bricks.push({
            x: offsetLeft + c * (brickW + brickPad),
            y: offsetTop + r * (brickH + brickPad),
            status: 1,
            color: colors[r % colors.length],
            val: (rows - r) * 20
          });
        }
      }

      const onMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = width / rect.width;
        const relativeX = (e.clientX - rect.left) * scaleX;
        paddleX = Math.max(10, Math.min(width - paddleW - 10, relativeX - paddleW / 2));
      };
      canvas.addEventListener('mousemove', onMouseMove);

      const loop = () => {
        if (!isPlayingRef.current) return;
        if (!isPausedRef.current && !gameOverRef.current) {
          // Continuous smooth keyboard movement for paddle (Left/Right or A/D)
          const keys = activeKeysRef.current;
          const pSpeed = 9;
          if (keys.has('ArrowLeft') || keys.has('KeyA') || keys.has('a')) {
            paddleX = Math.max(10, paddleX - pSpeed);
          }
          if (keys.has('ArrowRight') || keys.has('KeyD') || keys.has('d')) {
            paddleX = Math.min(width - paddleW - 10, paddleX + pSpeed);
          }

          ballX += ballDx;
          ballY += ballDy;

          // Wall bounces
          if (ballX <= 8 || ballX >= width - 8) {
            ballDx = -ballDx;
            soundManager.playHit();
          }
          if (ballY <= 8) {
            ballDy = -ballDy;
            soundManager.playHit();
          }

          // Bottom loss
          if (ballY >= height - 8) {
            handleEndGame(scoreRef.current, 'game_over', '💥 Ball dropped below paddle!');
            return;
          }

          // Paddle collision
          if (ballY >= height - 35 - paddleH && ballY <= height - 30 && ballX >= paddleX && ballX <= paddleX + paddleW) {
            ballDy = -Math.abs(ballDy);
            // Deflection angle based on hit location
            const hitPoint = (ballX - (paddleX + paddleW / 2)) / (paddleW / 2);
            ballDx = hitPoint * 7;
            soundManager.playHit();
          }

          // Brick collision
          let allBroken = true;
          bricks.forEach(b => {
            if (b.status === 1) {
              allBroken = false;
              if (ballX > b.x && ballX < b.x + brickW && ballY > b.y && ballY < b.y + brickH) {
                b.status = 0;
                ballDy = -ballDy;
                soundManager.playScore();
                setScore(s => s + b.val);
              }
            }
          });

          if (allBroken) {
            handleEndGame(scoreRef.current + 1000, 'victory', '🌟 Master Demolisher! All Bricks Obliterated!');
            return;
          }

          // Render
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, width, height);

          // Bricks
          bricks.forEach(b => {
            if (b.status === 1) {
              ctx.fillStyle = b.color;
              ctx.shadowColor = b.color;
              ctx.shadowBlur = 6;
              ctx.beginPath();
              ctx.roundRect(b.x, b.y, brickW, brickH, 4);
              ctx.fill();
            }
          });
          ctx.shadowBlur = 0;

          // Paddle
          ctx.fillStyle = '#6366f1';
          ctx.shadowColor = '#6366f1';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.roundRect(paddleX, height - 35, paddleW, paddleH, 8);
          ctx.fill();

          // Ball
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ffffff';
          ctx.beginPath();
          ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        animationFrameId.current = requestAnimationFrame(loop);
      };
      animationFrameId.current = requestAnimationFrame(loop);

      return () => {
        canvas.removeEventListener('mousemove', onMouseMove);
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      };
    }

    // ---------------------------------------------
    // ENGINE 4: FLAPPY BIRD & TAP JUMP (GAME-008, GAME-019)
    // ---------------------------------------------
    if (gameplay === 'flappy' || gameplay === 'tap_jump') {
      let birdY = height / 2;
      let velocity = 0;
      const gravity = 0.35;
      const jump = -7;
      let pipes: { x: number; top: number; bottom: number; passed: boolean }[] = [];
      let frameCount = 0;

      const flap = () => {
        velocity = jump;
        soundManager.playJump();
      };

      const handleKey = (e: KeyboardEvent) => {
        if (isInputField(e.target)) return;
        if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp' || e.key === 'ArrowUp' || e.code === 'KeyW' || e.key === 'w' || e.key === 'Enter') {
          flap();
        }
      };
      window.addEventListener('keydown', handleKey);
      canvas.addEventListener('pointerdown', flap);

      const loop = () => {
        if (!isPlayingRef.current) return;
        if (!isPausedRef.current && !gameOverRef.current) {
          frameCount++;
          velocity += gravity;
          birdY += velocity;

          // Spawn pipes
          if (frameCount % 95 === 0) {
            const gap = 135;
            const top = 60 + Math.random() * (height - gap - 120);
            pipes.push({ x: width, top, bottom: top + gap, passed: false });
          }

          // Move pipes
          pipes.forEach(p => {
            p.x -= 3;
            // Scoring
            if (!p.passed && p.x < 120) {
              p.passed = true;
              soundManager.playScore();
              setScore(s => {
                const next = s + 100;
                if (next >= 1200) {
                  handleEndGame(next, 'victory', '🕊️ Sky Legend! Flappy Gauntlet Mastered!');
                }
                return next;
              });
            }
            // Collision
            if (p.x < 140 && p.x > 80) {
              if (birdY < p.top || birdY > p.bottom) {
                handleEndGame(scoreRef.current, 'game_over', '💥 Collided with vertical barrier pipe!');
              }
            }
          });

          pipes = pipes.filter(p => p.x > -60);

          // Floor/ceiling collision
          if (birdY > height - 20 || birdY < 10) {
            handleEndGame(scoreRef.current, 'game_over', '💥 Fallen out of airspace bounds!');
            return;
          }

          // Render
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(0, 0, width, height);

          // Clouds
          ctx.fillStyle = '#bae6fd44';
          ctx.beginPath();
          ctx.arc(200, 100, 50, 0, Math.PI * 2);
          ctx.arc(250, 90, 60, 0, Math.PI * 2);
          ctx.fill();

          // Pipes
          ctx.fillStyle = '#22c55e';
          pipes.forEach(p => {
            ctx.fillRect(p.x, 0, 52, p.top);
            ctx.fillRect(p.x, p.bottom, 52, height - p.bottom);
          });

          // Bird
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(120, birdY, 16, 0, Math.PI * 2);
          ctx.fill();

          // Beak & Eye
          ctx.fillStyle = '#f97316';
          ctx.fillRect(130, birdY - 4, 10, 8);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(125, birdY - 6, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        animationFrameId.current = requestAnimationFrame(loop);
      };
      animationFrameId.current = requestAnimationFrame(loop);

      return () => {
        window.removeEventListener('keydown', handleKey);
        canvas.removeEventListener('pointerdown', flap);
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      };
    }

    // ---------------------------------------------
    // ENGINE 5: SPACE SHOOTER / INVADERS / GALAXY (GAME-005, GAME-021-035)
    // ---------------------------------------------
    if (gameplay.includes('space') || gameplay.includes('shooter') || gameplay.includes('invader')) {
      let shipX = width / 2;
      let shipY = height - 60;
      let lasers: { x: number; y: number }[] = [];
      let enemies: { x: number; y: number; speed: number; hp: number; color: string }[] = [];
      let enemySpawnTimer = 0;
      let lastShotTime = 0;

      const fireLaser = () => {
        const now = Date.now();
        if (now - lastShotTime < 140) return; // rate limiter
        lastShotTime = now;
        lasers.push({ x: shipX - 12, y: shipY - 10 });
        lasers.push({ x: shipX + 12, y: shipY - 10 });
        soundManager.playShoot();
      };

      const handleKey = (e: KeyboardEvent) => {
        if (isInputField(e.target)) return;
        if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter') {
          fireLaser();
        }
      };
      window.addEventListener('keydown', handleKey);

      const onPointerMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = width / rect.width;
        shipX = Math.max(30, Math.min(width - 30, (e.clientX - rect.left) * scaleX));
      };
      canvas.addEventListener('pointermove', onPointerMove);

      const onPointerDown = () => {
        fireLaser();
      };
      canvas.addEventListener('pointerdown', onPointerDown);

      const loop = () => {
        if (!isPlayingRef.current) return;
        if (!isPausedRef.current && !gameOverRef.current) {
          // Continuous 8-way keyboard movement with WASD and Arrow Keys
          const keys = activeKeysRef.current;
          const isBoost = keys.has('ShiftLeft') || keys.has('ShiftRight') || keys.has('shift');
          const shipSpeed = isBoost ? 9 : 6.5;

          if (keys.has('ArrowLeft') || keys.has('KeyA') || keys.has('a')) {
            shipX = Math.max(30, shipX - shipSpeed);
          }
          if (keys.has('ArrowRight') || keys.has('KeyD') || keys.has('d')) {
            shipX = Math.min(width - 30, shipX + shipSpeed);
          }
          if (keys.has('ArrowUp') || keys.has('KeyW') || keys.has('w')) {
            shipY = Math.max(80, shipY - shipSpeed);
          }
          if (keys.has('ArrowDown') || keys.has('KeyS') || keys.has('s')) {
            shipY = Math.min(height - 40, shipY + shipSpeed);
          }

          // Auto-fire while Space is held down
          if (keys.has('Space') || keys.has(' ')) {
            fireLaser();
          }

          enemySpawnTimer++;
          if (enemySpawnTimer % 45 === 0) {
            enemies.push({
              x: 40 + Math.random() * (width - 80),
              y: -20,
              speed: 1.5 + Math.random() * 2,
              hp: 1,
              color: ['#f43f5e', '#a855f7', '#06b6d4'][Math.floor(Math.random() * 3)]
            });
          }

          // Move lasers
          lasers.forEach(l => { l.y -= 9; });
          lasers = lasers.filter(l => l.y > -20);

          // Move enemies & collision
          enemies.forEach(en => {
            en.y += en.speed;

            // Player hit by enemy
            if (Math.hypot(en.x - shipX, en.y - shipY) < 30) {
              handleEndGame(scoreRef.current, 'game_over', '💥 Starship breached by enemy craft!');
              return;
            }

            // Laser hit enemy
            lasers.forEach(l => {
              if (Math.hypot(en.x - l.x, en.y - l.y) < 22) {
                en.hp = 0;
                l.y = -100;
                soundManager.playExplosion();
                setScore(s => {
                  const next = s + 100;
                  if (next >= 1500) {
                    handleEndGame(next, 'victory', '🌌 Fleet Commander! Galaxy Sector Liberated!');
                  }
                  return next;
                });
              }
            });
          });

          enemies = enemies.filter(en => en.y < height + 30 && en.hp > 0);

          // Render
          ctx.fillStyle = '#050515';
          ctx.fillRect(0, 0, width, height);

          // Starfield
          ctx.fillStyle = '#ffffffaa';
          for (let i = 0; i < 35; i++) {
            ctx.fillRect((i * 97) % width, (i * 131 + enemySpawnTimer * 2) % height, 2, 2);
          }

          // Lasers
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          lasers.forEach(l => {
            ctx.fillRect(l.x - 2, l.y, 4, 14);
          });

          // Enemies
          enemies.forEach(en => {
            ctx.fillStyle = en.color;
            ctx.shadowColor = en.color;
            ctx.beginPath();
            ctx.arc(en.x, en.y, 16, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.shadowBlur = 0;

          // Player Starship
          ctx.fillStyle = '#10b981';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(shipX, shipY - 20);
          ctx.lineTo(shipX - 18, shipY + 16);
          ctx.lineTo(shipX + 18, shipY + 16);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        animationFrameId.current = requestAnimationFrame(loop);
      };
      animationFrameId.current = requestAnimationFrame(loop);

      return () => {
        window.removeEventListener('keydown', handleKey);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerdown', onPointerDown);
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      };
    }

    // ---------------------------------------------
    // ENGINE 6: 2048 / MATHEMATICAL TILE MERGE (GAME-086)
    // ---------------------------------------------
    if (gameplay === 'game_2048') {
      let board: number[][] = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];

      const spawnRandom = () => {
        const emptyCells: { r: number; c: number }[] = [];
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (board[r][c] === 0) emptyCells.push({ r, c });
          }
        }
        if (emptyCells.length > 0) {
          const chosen = emptyCells[Math.floor(Math.random() * emptyCells.length)];
          board[chosen.r][chosen.c] = Math.random() < 0.9 ? 2 : 4;
        }
      };

      spawnRandom();
      spawnRandom();

      const tileColors: Record<number, { bg: string; text: string }> = {
        0: { bg: '#334155', text: 'transparent' },
        2: { bg: '#eee4da', text: '#1e293b' },
        4: { bg: '#ede0c8', text: '#1e293b' },
        8: { bg: '#f2b179', text: '#ffffff' },
        16: { bg: '#f59563', text: '#ffffff' },
        32: { bg: '#f67c5f', text: '#ffffff' },
        64: { bg: '#f65e3b', text: '#ffffff' },
        128: { bg: '#edcf72', text: '#ffffff' },
        256: { bg: '#edcc61', text: '#ffffff' },
        512: { bg: '#edc850', text: '#ffffff' },
        1024: { bg: '#edc53f', text: '#ffffff' },
        2048: { bg: '#edc22e', text: '#ffffff' },
      };

      const render2048 = () => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        const size = 78;
        const gap = 12;
        const totalW = 4 * size + 3 * gap;
        const startX = (width - totalW) / 2;
        const startY = (height - totalW) / 2;

        // Board background plate
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(startX - gap, startY - gap, totalW + gap * 2, totalW + gap * 2, 16);
        ctx.fill();

        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            const val = board[r][c];
            const col = tileColors[val] || { bg: '#3c3a32', text: '#ffffff' };
            const x = startX + c * (size + gap);
            const y = startY + r * (size + gap);

            ctx.fillStyle = col.bg;
            ctx.beginPath();
            ctx.roundRect(x, y, size, size, 10);
            ctx.fill();

            if (val > 0) {
              ctx.fillStyle = col.text;
              ctx.font = val >= 1024 ? 'bold 22px sans-serif' : 'bold 28px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(`${val}`, x + size / 2, y + size / 2 + 1);
            }
          }
        }
      };

      // Accurate 2048 sliding and merging algorithm
      const slideRow = (row: number[]) => {
        let arr = row.filter(x => x !== 0);
        let pts = 0;
        for (let i = 0; i < arr.length - 1; i++) {
          if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            pts += arr[i];
            arr[i + 1] = 0;
            i++;
          }
        }
        arr = arr.filter(x => x !== 0);
        while (arr.length < 4) arr.push(0);
        return { newRow: arr, pts };
      };

      const move = (dir: 'left' | 'right' | 'up' | 'down') => {
        let moved = false;
        let gainedPoints = 0;

        if (dir === 'left') {
          for (let r = 0; r < 4; r++) {
            const { newRow, pts } = slideRow(board[r]);
            gainedPoints += pts;
            for (let c = 0; c < 4; c++) {
              if (board[r][c] !== newRow[c]) moved = true;
              board[r][c] = newRow[c];
            }
          }
        } else if (dir === 'right') {
          for (let r = 0; r < 4; r++) {
            const reversed = [...board[r]].reverse();
            const { newRow, pts } = slideRow(reversed);
            gainedPoints += pts;
            newRow.reverse();
            for (let c = 0; c < 4; c++) {
              if (board[r][c] !== newRow[c]) moved = true;
              board[r][c] = newRow[c];
            }
          }
        } else if (dir === 'up') {
          for (let c = 0; c < 4; c++) {
            const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
            const { newRow, pts } = slideRow(col);
            gainedPoints += pts;
            for (let r = 0; r < 4; r++) {
              if (board[r][c] !== newRow[r]) moved = true;
              board[r][c] = newRow[r];
            }
          }
        } else if (dir === 'down') {
          for (let c = 0; c < 4; c++) {
            const col = [board[3][c], board[2][c], board[1][c], board[0][c]];
            const { newRow, pts } = slideRow(col);
            gainedPoints += pts;
            newRow.reverse();
            for (let r = 0; r < 4; r++) {
              if (board[r][c] !== newRow[3 - r]) moved = true;
              board[r][c] = newRow[3 - r];
            }
          }
        }

        if (moved) {
          soundManager.playScore();
          if (gainedPoints > 0) {
            setScore(s => s + gainedPoints);
          }
          spawnRandom();
          render2048();

          // Check 2048 tile
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
              if (board[r][c] >= 2048) {
                handleEndGame(scoreRef.current + 2048, 'victory', '🌟 2048 Tile Assembled! You are a puzzle mastermind!');
                return;
              }
            }
          }

          // Check Game Over
          let hasMoves = false;
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
              if (board[r][c] === 0) hasMoves = true;
              if (r < 3 && board[r][c] === board[r + 1][c]) hasMoves = true;
              if (c < 3 && board[r][c] === board[r][c + 1]) hasMoves = true;
            }
          }
          if (!hasMoves) {
            handleEndGame(scoreRef.current, 'game_over', 'No more moves possible! Well played!');
          }
        }
      };

      const handleKey = (e: KeyboardEvent) => {
        if (isInputField(e.target)) return;
        if (e.repeat) return; // avoid duplicate moves from browser auto-repeat
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.code === 'ArrowLeft' || e.code === 'KeyA') move('left');
        else if (e.key === 'ArrowRight' || e.key === 'd' || e.code === 'ArrowRight' || e.code === 'KeyD') move('right');
        else if (e.key === 'ArrowUp' || e.key === 'w' || e.code === 'ArrowUp' || e.code === 'KeyW') move('up');
        else if (e.key === 'ArrowDown' || e.key === 's' || e.code === 'ArrowDown' || e.code === 'KeyS') move('down');
      };
      window.addEventListener('keydown', handleKey);
      render2048();

      return () => {
        window.removeEventListener('keydown', handleKey);
      };
    }

    // ---------------------------------------------
    // ENGINE 7: WHACK-A-MOLE / REFLEX (GAME-010, GAME-020)
    // ---------------------------------------------
    if (gameplay === 'whackamole' || gameplay === 'reaction') {
      const holes = [
        { x: 220, y: 140, active: false, timer: 0 },
        { x: 400, y: 140, active: false, timer: 0 },
        { x: 580, y: 140, active: false, timer: 0 },
        { x: 220, y: 260, active: false, timer: 0 },
        { x: 400, y: 260, active: false, timer: 0 },
        { x: 580, y: 260, active: false, timer: 0 },
        { x: 220, y: 380, active: false, timer: 0 },
        { x: 400, y: 380, active: false, timer: 0 },
        { x: 580, y: 380, active: false, timer: 0 },
      ];

      let roundTimer = 35;
      const interval = setInterval(() => {
        roundTimer--;
        if (roundTimer <= 0) {
          clearInterval(interval);
          handleEndGame(scoreRef.current, 'victory', '🎯 Reflex Benchmark Complete! Excellent speed!');
        }
      }, 1000);

      const popMole = () => {
        const inactive = holes.filter(h => !h.active);
        if (inactive.length > 0) {
          const target = inactive[Math.floor(Math.random() * inactive.length)];
          target.active = true;
          target.timer = 60 + Math.floor(Math.random() * 40);
        }
      };

      const whackHole = (idx: number) => {
        if (holes[idx] && holes[idx].active) {
          holes[idx].active = false;
          soundManager.playHit();
          setScore(s => s + 100);
        }
      };

      const handlePointer = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = width / rect.width;
        const scaleY = height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;

        holes.forEach((h, i) => {
          if (Math.hypot(clickX - h.x, clickY - h.y) < 55) {
            whackHole(i);
          }
        });
      };
      canvas.addEventListener('pointerdown', handlePointer);

      const handleKey = (e: KeyboardEvent) => {
        if (isInputField(e.target)) return;
        // Support keys 1 through 9 and Numpad 1 through 9 directly!
        let n = parseInt(e.key, 10);
        if (isNaN(n) && e.code.startsWith('Numpad')) {
          n = parseInt(e.code.replace('Numpad', ''), 10);
        }
        if (n >= 1 && n <= 9) {
          whackHole(n - 1);
        } else if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter') {
          // Space/Enter hits active mole
          const activeIdx = holes.findIndex(h => h.active);
          if (activeIdx !== -1) whackHole(activeIdx);
        }
      };
      window.addEventListener('keydown', handleKey);

      let frame = 0;
      const loop = () => {
        if (!isPlayingRef.current) return;
        if (!isPausedRef.current && !gameOverRef.current) {
          frame++;
          if (frame % 40 === 0) popMole();

          holes.forEach(h => {
            if (h.active) {
              h.timer--;
              if (h.timer <= 0) h.active = false;
            }
          });

          // Render
          ctx.fillStyle = '#14532d';
          ctx.fillRect(0, 0, width, height);

          // Timer display
          ctx.font = 'bold 20px monospace';
          ctx.fillStyle = '#fef08a';
          ctx.fillText(`TIME REMAINING: ${roundTimer}s  (Use Keys 1-9 or Space/Click)`, width / 2 - 240, 45);

          // Draw 9 holes
          holes.forEach((h, idx) => {
            // Earth mound
            ctx.fillStyle = '#3e2723';
            ctx.beginPath();
            ctx.ellipse(h.x, h.y + 12, 52, 28, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#1c1917';
            ctx.beginPath();
            ctx.ellipse(h.x, h.y + 10, 42, 20, 0, 0, Math.PI * 2);
            ctx.fill();

            // Number tag on hole
            ctx.font = 'bold 12px sans-serif';
            ctx.fillStyle = '#ffffff66';
            ctx.fillText(`[${idx + 1}]`, h.x - 10, h.y + 35);

            // Active mole
            if (h.active) {
              ctx.fillStyle = '#a16207';
              ctx.beginPath();
              ctx.arc(h.x, h.y - 12, 26, 0, Math.PI * 2);
              ctx.fill();

              // Mole eyes & nose
              ctx.fillStyle = '#000000';
              ctx.beginPath();
              ctx.arc(h.x - 8, h.y - 16, 4, 0, Math.PI * 2);
              ctx.arc(h.x + 8, h.y - 16, 4, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#f43f5e';
              ctx.beginPath();
              ctx.ellipse(h.x, h.y - 8, 6, 4, 0, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        }
        animationFrameId.current = requestAnimationFrame(loop);
      };
      animationFrameId.current = requestAnimationFrame(loop);

      return () => {
        clearInterval(interval);
        canvas.removeEventListener('pointerdown', handlePointer);
        window.removeEventListener('keydown', handleKey);
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      };
    }

    // ---------------------------------------------
    // ENGINE 8: 2D RACING / TIME TRIAL (GAME-106 to GAME-120)
    // ---------------------------------------------
    if (gameplay.includes('racing') || gameplay.includes('drift') || gameplay.includes('traffic')) {
      let carX = width / 2;
      let carY = height - 80;
      let traffic: { x: number; y: number; speed: number; color: string }[] = [];
      let roadOffset = 0;

      const onPointerMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = width / rect.width;
        carX = Math.max(160, Math.min(width - 160, (e.clientX - rect.left) * scaleX));
      };
      canvas.addEventListener('pointermove', onPointerMove);

      const loop = () => {
        if (!isPlayingRef.current) return;
        if (!isPausedRef.current && !gameOverRef.current) {
          // Continuous smooth steering via keyboard
          const keys = activeKeysRef.current;
          const isNitro = keys.has('Space') || keys.has('ShiftLeft') || keys.has('ShiftRight');
          const steerSpeed = isNitro ? 8.5 : 6;
          const roadSpeed = isNitro ? 14 : 8;

          if (keys.has('ArrowLeft') || keys.has('KeyA') || keys.has('a')) {
            carX = Math.max(160, carX - steerSpeed);
          }
          if (keys.has('ArrowRight') || keys.has('KeyD') || keys.has('d')) {
            carX = Math.min(width - 160, carX + steerSpeed);
          }

          roadOffset = (roadOffset + roadSpeed) % 40;
          setScore(s => s + (isNitro ? 2 : 1));

          if (Math.random() < 0.035) {
            traffic.push({
              x: 180 + Math.random() * (width - 360),
              y: -50,
              speed: (4 + Math.random() * 4) * (isNitro ? 1.4 : 1),
              color: ['#ef4444', '#f59e0b', '#3b82f6', '#ec4899'][Math.floor(Math.random() * 4)]
            });
          }

          traffic.forEach(t => {
            t.y += t.speed;
            // Car collision
            if (Math.abs(t.x - carX) < 32 && Math.abs(t.y - carY) < 55) {
              handleEndGame(scoreRef.current, 'game_over', '💥 Collision with highway traffic!');
            }
          });

          traffic = traffic.filter(t => t.y < height + 60);

          // Render
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, width, height);

          // Asphalt Road
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(140, 0, width - 280, height);

          // Curbs
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(130, 0, 10, height);
          ctx.fillRect(width - 140, 0, 10, height);

          // Center Road Dashes
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 4;
          ctx.setLineDash([20, 20]);
          ctx.lineDashOffset = -roadOffset;
          ctx.beginPath();
          ctx.moveTo(width / 2, 0);
          ctx.lineTo(width / 2, height);
          ctx.stroke();
          ctx.setLineDash([]);

          // Traffic
          traffic.forEach(t => {
            ctx.fillStyle = t.color;
            ctx.beginPath();
            ctx.roundRect(t.x - 16, t.y - 30, 32, 60, 6);
            ctx.fill();
          });

          // Player Sports Car
          ctx.fillStyle = isNitro ? '#f59e0b' : '#38bdf8';
          ctx.shadowColor = isNitro ? '#f59e0b' : '#38bdf8';
          ctx.shadowBlur = isNitro ? 20 : 12;
          ctx.beginPath();
          ctx.roundRect(carX - 18, carY - 32, 36, 64, 8);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        animationFrameId.current = requestAnimationFrame(loop);
      };
      animationFrameId.current = requestAnimationFrame(loop);

      return () => {
        canvas.removeEventListener('pointermove', onPointerMove);
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      };
    }

    // ---------------------------------------------
    // PROCEDURAL ADAPTIVE ARCADE FOR ALL REMAINING GENRES
    // Dynamically generates unique thematic environments, custom hero sprites,
    // game-specific collectibles & enemies, active combat abilities, and mission HUD
    // tailored to each game's name, category, and objective.
    // ---------------------------------------------
    return startProceduralAdaptiveEngine({
      canvas,
      ctx,
      game,
      width,
      height,
      activeKeys: activeKeysRef.current,
      scoreRef,
      setScore,
      isPlayingRef,
      isPausedRef,
      gameOverRef,
      handleEndGame,
    });
  }, [game, restartCount, handleEndGame]);

  const controlsDisplay = getGameControlsDisplay(game);

  return (
    <div className={`flex flex-col items-center w-full gap-3 ${className}`}>
      {/* Game Stage Container */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl flex flex-col items-center justify-center select-none"
        style={{ aspectRatio: '16/10' }}
      >
        {/* Top HUD Overlay */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/85 via-black/50 to-transparent pointer-events-auto">
          {/* Game ID & Name */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-primary/20 text-primary border border-primary/30">
              {game.id}
            </span>
            <h2 className="text-sm md:text-base font-bold text-white truncate max-w-[200px] md:max-w-xs">
              {game.name}
            </h2>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              ({game.type} · {game.engine})
            </span>
          </div>

          {/* Live Score & Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-xl">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">SCORE:</span>
              <span className="text-sm md:text-base font-extrabold text-amber-400 tabular-nums">
                {score.toLocaleString()}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-xs text-muted-foreground">
              <span>HIGH:</span>
              <span className="text-white font-bold tabular-nums">{highScore.toLocaleString()}</span>
            </div>

            {/* Quick HUD controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowManualModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors"
                title="View How to Play Manual (Press M)"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden md:inline">MANUAL [M]</span>
              </button>
              <button
                onClick={togglePause}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                title={isPaused ? "Resume (P / Esc)" : "Pause (P / Esc)"}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleSound}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
              <button
                onClick={handleRestart}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                title="Restart Game (Press R)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                title="Fullscreen (Press F)"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3D Container vs 2D Canvas */}
        {game.is_3d ? (
          <div ref={threeMountRef} className="w-full h-full cursor-crosshair flex items-center justify-center" />
        ) : (
          <canvas
            ref={canvas2DRef}
            className="w-full h-full object-contain cursor-pointer"
          />
        )}

        {/* Game Over / Victory Modal Overlay */}
        {gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 animate-bounce">
              <Trophy className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">
              {gameMessage || 'Game Over!'}
            </h3>

            <p className="text-muted-foreground text-sm max-w-md mb-6">
              Match recorded in your live profile history. You've earned XP towards your player level!
            </p>

            <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-6 text-left">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-xs text-muted-foreground">Final Score</div>
                <div className="text-xl font-black text-amber-400 tabular-nums">{score.toLocaleString()}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-xs text-muted-foreground">Best Score</div>
                <div className="text-xl font-black text-emerald-400 tabular-nums">{highScore.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again (R)</span>
              </button>
              <button
                onClick={() => setShowManualModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-colors"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Instructions (M)</span>
              </button>
            </div>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && !gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm p-6 text-center">
            <Pause className="w-12 h-12 text-indigo-400 mb-3 animate-pulse" />
            <h3 className="text-2xl font-bold text-white mb-2">Game Paused</h3>
            <p className="text-sm text-muted-foreground mb-4">Press P or Escape to resume your match!</p>
            <div className="flex items-center gap-3">
              <button
                onClick={togglePause}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all"
              >
                <Play className="w-4 h-4" />
                <span>Resume Game (P)</span>
              </button>
              <button
                onClick={() => setShowManualModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-amber-300 font-semibold transition-all border border-white/10"
              >
                <BookOpen className="w-4 h-4" />
                <span>View Rules (M)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Universal Keyboard Status & Quick Controls Banner */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-xs text-muted-foreground backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 shadow-sm">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Controls:</span>
          </span>
          <span className="text-slate-200 text-[11px] font-medium">
            {controlsDisplay.bannerShortcuts}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>Pause: <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-amber-300 text-[10px]">P</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-amber-300 text-[10px]">Esc</kbd></span>
          <span>Restart: <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-amber-300 text-[10px]">R</kbd></span>
          <span>Manual: <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-amber-300 text-[10px]">M</kbd></span>
        </div>
      </div>

      {/* DEDICATED ON-SCREEN VIRTUAL GAMEPAD CONTROLS BAR */}
      <div className="w-full bg-slate-900/90 border border-white/10 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Left Side: Virtual D-Pad with Game-Specific Labels */}
        <div className="flex items-center gap-1">
          <div className="grid grid-cols-3 gap-1.5 w-36 sm:w-44">
            <div />
            <button
              onPointerDown={() => startHoldKey(controlsDisplay.dpad.up.key, controlsDisplay.dpad.up.code)}
              onPointerUp={() => stopHoldKey(controlsDisplay.dpad.up.code)}
              onPointerLeave={() => stopHoldKey(controlsDisplay.dpad.up.code)}
              className="flex items-center justify-center h-10 rounded-xl bg-slate-800 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold text-[10px] sm:text-xs shadow-md border border-white/10 active:scale-90 transition-all select-none px-1"
              title={controlsDisplay.dpad.up.title}
            >
              <div className="flex items-center gap-1">
                <ArrowUp className="w-3.5 h-3.5" />
                <span className="truncate">{controlsDisplay.dpad.up.label}</span>
              </div>
            </button>
            <div />

            <button
              onPointerDown={() => startHoldKey(controlsDisplay.dpad.left.key, controlsDisplay.dpad.left.code)}
              onPointerUp={() => stopHoldKey(controlsDisplay.dpad.left.code)}
              onPointerLeave={() => stopHoldKey(controlsDisplay.dpad.left.code)}
              className="flex items-center justify-center h-10 rounded-xl bg-slate-800 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold text-[10px] sm:text-xs shadow-md border border-white/10 active:scale-90 transition-all select-none px-1"
              title={controlsDisplay.dpad.left.title}
            >
              <div className="flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="truncate">{controlsDisplay.dpad.left.label}</span>
              </div>
            </button>

            <button
              onPointerDown={() => startHoldKey(controlsDisplay.dpad.down.key, controlsDisplay.dpad.down.code)}
              onPointerUp={() => stopHoldKey(controlsDisplay.dpad.down.code)}
              onPointerLeave={() => stopHoldKey(controlsDisplay.dpad.down.code)}
              className="flex items-center justify-center h-10 rounded-xl bg-slate-800 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold text-[10px] sm:text-xs shadow-md border border-white/10 active:scale-90 transition-all select-none px-1"
              title={controlsDisplay.dpad.down.title}
            >
              <div className="flex items-center gap-1">
                <ArrowDown className="w-3.5 h-3.5" />
                <span className="truncate">{controlsDisplay.dpad.down.label}</span>
              </div>
            </button>

            <button
              onPointerDown={() => startHoldKey(controlsDisplay.dpad.right.key, controlsDisplay.dpad.right.code)}
              onPointerUp={() => stopHoldKey(controlsDisplay.dpad.right.code)}
              onPointerLeave={() => stopHoldKey(controlsDisplay.dpad.right.code)}
              className="flex items-center justify-center h-10 rounded-xl bg-slate-800 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold text-[10px] sm:text-xs shadow-md border border-white/10 active:scale-90 transition-all select-none px-1"
              title={controlsDisplay.dpad.right.title}
            >
              <div className="flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5" />
                <span className="truncate">{controlsDisplay.dpad.right.label}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Center: Essential Game Utility Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 font-bold text-xs sm:text-sm border border-amber-500/40 shadow-md transition-all hover:scale-105 active:scale-95"
            title="Read Official Game Manual & Rules (M)"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>HOW TO PLAY (M)</span>
          </button>

          <button
            onClick={togglePause}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors"
            title="Pause / Resume (P / Esc)"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
            <span>{isPaused ? 'RESUME (P)' : 'PAUSE (P)'}</span>
          </button>

          <button
            onClick={handleRestart}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors"
            title="Reset Game (R)"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART (R)</span>
          </button>
        </div>

        {/* Right Side: Virtual Action Triggers with Dynamic Game Action Labels */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onPointerDown={() => triggerVirtualKey(controlsDisplay.actionBtn.key, controlsDisplay.actionBtn.code)}
            className="flex items-center justify-center gap-2 px-4 sm:px-5 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all select-none"
            title={controlsDisplay.actionBtn.title}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>{controlsDisplay.actionBtn.label}</span>
          </button>

          <button
            onPointerDown={() => triggerVirtualKey(controlsDisplay.boostBtn.key, controlsDisplay.boostBtn.code)}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all select-none"
            title={controlsDisplay.boostBtn.title}
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>{controlsDisplay.boostBtn.label}</span>
          </button>
        </div>
      </div>

      {/* In-Game User Manual Modal */}
      <GameManualModal
        game={game}
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
      />
    </div>
  );
};
