import { GameRecord } from '@/data/gameDatabase';

export interface GameControlsDisplay {
  bannerShortcuts: string;
  dpad: {
    up: { label: string; key: string; code: string; title: string };
    down: { label: string; key: string; code: string; title: string };
    left: { label: string; key: string; code: string; title: string };
    right: { label: string; key: string; code: string; title: string };
  };
  actionBtn: { label: string; key: string; code: string; title: string };
  boostBtn: { label: string; key: string; code: string; title: string };
}

export interface DetailedGameManual {
  overview: string;
  howToPlay: string[];
  rules: string[];
  scoringSystem: string;
  winCondition: string;
  controlsSummary: string;
  proTips: string[];
  keys: { key: string; action: string }[];
}

/**
 * Returns accurate, game-specific control labels for on-screen buttons and keyboard banner.
 */
export function getGameControlsDisplay(game: GameRecord): GameControlsDisplay {
  const nameL = game.name.toLowerCase();
  const catL = game.category.toLowerCase();
  const gameplay = game.gameplayCategory || '';

  // 1. PINBALL
  if (gameplay === 'pinball' || nameL.includes('pinball')) {
    return {
      bannerShortcuts: 'Left Flipper: [A] / ← · Right Flipper: [D] / → · Plunger: [Space] / ↓ · Reset: [R]',
      dpad: {
        up: { label: 'NUDGE', key: 'ArrowUp', code: 'ArrowUp', title: 'Table Nudge (W / Up)' },
        down: { label: 'PLUNGER', key: 'ArrowDown', code: 'ArrowDown', title: 'Pull Plunger (S / Down)' },
        left: { label: 'FLIP L', key: 'ArrowLeft', code: 'ArrowLeft', title: 'Left Flipper (A / Left)' },
        right: { label: 'FLIP R', key: 'ArrowRight', code: 'ArrowRight', title: 'Right Flipper (D / Right)' },
      },
      actionBtn: { label: 'PLUNGER [Space]', key: ' ', code: 'Space', title: 'Launch Ball / Spring Plunger' },
      boostBtn: { label: 'TILT [Shift]', key: 'Shift', code: 'ShiftLeft', title: 'Table Nudge' },
    };
  }

  // 2. ASTEROIDS
  if (gameplay === 'asteroids' || nameL.includes('asteroid')) {
    return {
      bannerShortcuts: 'Rotate: [A]/[D] or ←/→ · Thrust: [W] or ↑ · Fire Laser: [Space] / Click',
      dpad: {
        up: { label: 'THRUST', key: 'ArrowUp', code: 'ArrowUp', title: 'Rocket Thrust (W / Up)' },
        down: { label: 'BRAKE', key: 'ArrowDown', code: 'ArrowDown', title: 'Retro Thruster (S / Down)' },
        left: { label: 'ROT L', key: 'ArrowLeft', code: 'ArrowLeft', title: 'Rotate Left (A / Left)' },
        right: { label: 'ROT R', key: 'ArrowRight', code: 'ArrowRight', title: 'Rotate Right (D / Right)' },
      },
      actionBtn: { label: 'FIRE [Space]', key: ' ', code: 'Space', title: 'Fire Photon Cannon' },
      boostBtn: { label: 'HYPER [Shift]', key: 'Shift', code: 'ShiftLeft', title: 'Hyperspace Boost' },
    };
  }

  // 3. PACMAN & MAZE
  if (gameplay === 'pacman' || nameL.includes('pac-man') || nameL.includes('pacman') || gameplay.includes('maze')) {
    return {
      bannerShortcuts: 'Navigate: [WASD] or Arrows · Eat Pellets · Power Pellets Turn Ghosts Blue',
      dpad: {
        up: { label: 'UP', key: 'ArrowUp', code: 'ArrowUp', title: 'Move Up (W / Up)' },
        down: { label: 'DOWN', key: 'ArrowDown', code: 'ArrowDown', title: 'Move Down (S / Down)' },
        left: { label: 'LEFT', key: 'ArrowLeft', code: 'ArrowLeft', title: 'Move Left (A / Left)' },
        right: { label: 'RIGHT', key: 'ArrowRight', code: 'ArrowRight', title: 'Move Right (D / Right)' },
      },
      actionBtn: { label: 'TURBO [Space]', key: ' ', code: 'Space', title: 'Speed Surge' },
      boostBtn: { label: 'BOOST [Shift]', key: 'Shift', code: 'ShiftLeft', title: 'Chomp Boost' },
    };
  }

  // 4. FRUIT NINJA & BLADE SLICE
  if (gameplay === 'fruit_ninja' || nameL.includes('fruit') || nameL.includes('slice')) {
    return {
      bannerShortcuts: 'Blade Slicing: Drag / Swipe Mouse or Touch across fruits · Dodge Bombs!',
      dpad: {
        up: { label: 'SWIPE ▲', key: 'ArrowUp', code: 'ArrowUp', title: 'Slash Upwards' },
        down: { label: 'SWIPE ▼', key: 'ArrowDown', code: 'ArrowDown', title: 'Slash Downwards' },
        left: { label: 'SWIPE ◄', key: 'ArrowLeft', code: 'ArrowLeft', title: 'Slash Left' },
        right: { label: 'SWIPE ►', key: 'ArrowRight', code: 'ArrowRight', title: 'Slash Right' },
      },
      actionBtn: { label: 'KATANA [Space]', key: ' ', code: 'Space', title: 'Full Blade Sweep' },
      boostBtn: { label: 'COMBO [Shift]', key: 'Shift', code: 'ShiftLeft', title: 'Blade Focus' },
    };
  }

  // 5. CROSSY ROAD
  if (gameplay === 'crossy' || nameL.includes('crossy') || nameL.includes('frogger')) {
    return {
      bannerShortcuts: 'Hop: [WASD] or Arrows · Dodge traffic and ride floating river logs',
      dpad: {
        up: { label: 'FORWARD', key: 'ArrowUp', code: 'ArrowUp', title: 'Hop Forward (W / Up)' },
        down: { label: 'BACK', key: 'ArrowDown', code: 'ArrowDown', title: 'Hop Back (S / Down)' },
        left: { label: 'LEFT', key: 'ArrowLeft', code: 'ArrowLeft', title: 'Hop Left (A / Left)' },
        right: { label: 'RIGHT', key: 'ArrowRight', code: 'ArrowRight', title: 'Hop Right (D / Right)' },
      },
      actionBtn: { label: 'HOP [Space]', key: ' ', code: 'Space', title: 'Hop Forward' },
      boostBtn: { label: 'DASH [Shift]', key: 'Shift', code: 'ShiftLeft', title: 'Fast Leap' },
    };
  }

  // 6. PLATFORMER (GAME-061 - GAME-075, etc.)
  if (catL.includes('platformer') || gameplay.includes('platform') || nameL.includes('platform')) {
    return {
      bannerShortcuts: 'Run: [A]/[D] or Arrows · Jump: [W] / [Space] or Click · Stomp Monsters!',
      dpad: {
        up: { label: 'JUMP', key: 'ArrowUp', code: 'ArrowUp', title: 'High Jump (W / Up)' },
        down: { label: 'DUCK', key: 'ArrowDown', code: 'ArrowDown', title: 'Crouch (S / Down)' },
        left: { label: 'RUN L', key: 'ArrowLeft', code: 'ArrowLeft', title: 'Run Left (A / Left)' },
        right: { label: 'RUN R', key: 'ArrowRight', code: 'ArrowRight', title: 'Run Right (D / Right)' },
      },
      actionBtn: { label: 'JUMP [Space]', key: ' ', code: 'Space', title: 'Jump / Stomp' },
      boostBtn: { label: 'SPRINT [Shift]', key: 'Shift', code: 'ShiftLeft', title: 'Speed Sprint' },
    };
  }

  // 7. TOWER DEFENSE & STRATEGY
  if (catL.includes('strategy') || gameplay.includes('tower') || gameplay.includes('defense') || nameL.includes('tower')) {
    return {
      bannerShortcuts: 'Build / Upgrade: Click Turret Pads · Special Strike: [Space]',
      dpad: {
        up: { label: 'TARGET ▲', key: 'ArrowUp', code: 'ArrowUp', title: 'Aim Top Sector' },
        down: { label: 'TARGET ▼', key: 'ArrowDown', code: 'ArrowDown', title: 'Aim Bottom Sector' },
        left: { label: 'SLOT ◄', key: 'ArrowLeft', code: 'ArrowLeft', title: 'Select Left Turret' },
        right: { label: 'SLOT ►', key: 'ArrowRight', code: 'ArrowRight', title: 'Select Right Turret' },
      },
      actionBtn: { label: 'STRIKE [Space]', key: ' ', code: 'Space', title: 'Call Artillery Strike' },
      boostBtn: { label: 'OVERDRIVE [Shift]', key: 'Shift', code: 'ShiftLeft', title: 'Turret Overdrive' },
    };
  }

  // 8. HORROR & ZOMBIE SURVIVAL
  if (catL.includes('horror') || gameplay.includes('horror') || gameplay.includes('zombie') || nameL.includes('zombie')) {
    return {
      bannerShortcuts: 'Move: [WASD] · Aim Flashlight: Mouse · Shoot: [Space] / Click · Survive to Dawn!',
      dpad: {
        up: { label: 'NORTH', key: 'ArrowUp', code: 'ArrowUp', title: 'Move North (W)' },
        down: { label: 'SOUTH', key: 'ArrowDown', code: 'ArrowDown', title: 'Move South (S)' },
        left: { label: 'WEST', key: 'ArrowLeft', code: 'ArrowLeft', title: 'Move West (A)' },
        right: { label: 'EAST', key: 'ArrowRight', code: 'ArrowRight', title: 'Move East (D)' },
      },
      actionBtn: { label: 'SHOOT [Space]', key: ' ', code: 'Space', title: 'Fire Weapon / Strike' },
      boostBtn: { label: 'SPRINT [Shift]', key: 'Shift', code: 'ShiftLeft', title: 'Adrenaline Sprint' },
    };
  }

  // 9. SPORTS (Soccer / Basketball / Golf)
  if (catL.includes('sports') || gameplay.includes('soccer') || gameplay.includes('basketball') || gameplay.includes('golf')) {
    return {
      bannerShortcuts: 'Aim Trajectory: [A]/[D] or Mouse · Hold & Release [Space] / Click to Shoot',
      dpad: {
        up: { label: 'ELEVATE', key: 'ArrowUp', code: 'ArrowUp', title: 'Higher Arc (W / Up)' },
        down: { label: 'LOW SHOT', key: 'ArrowDown', code: 'ArrowDown', title: 'Low Driven Shot (S / Down)' },
        left: { label: 'AIM L', key: 'ArrowLeft', code: 'ArrowLeft', title: 'Aim Curve Left (A / Left)' },
        right: { label: 'AIM R', key: 'ArrowRight', code: 'ArrowRight', title: 'Aim Curve Right (D / Right)' },
      },
      actionBtn: { label: 'KICK / SHOOT [Space]', key: ' ', code: 'Space', title: 'Hold & Release to Shoot' },
      boostBtn: { label: 'POWER [Shift]', key: 'Shift', code: 'ShiftLeft', title: 'Max Power Gauge' },
    };
  }

  // 10. PUZZLE / MATCH-3 GEMS
  if (catL.includes('puzzle') || gameplay.includes('match') || gameplay.includes('puzzle') || gameplay.includes('gem')) {
    return {
      bannerShortcuts: 'Click / Tap Adjacent Jewels to Swap & Match 3 in a Row',
      dpad: {
        up: { label: 'ROW ▲', key: 'ArrowUp', code: 'ArrowUp', title: 'Select Row Above' },
        down: { label: 'ROW ▼', key: 'ArrowDown', code: 'ArrowDown', title: 'Select Row Below' },
        left: { label: 'COL ◄', key: 'ArrowLeft', code: 'ArrowLeft', title: 'Select Column Left' },
        right: { label: 'COL ►', key: 'ArrowRight', code: 'ArrowRight', title: 'Select Column Right' },
      },
      actionBtn: { label: 'SWAP [Space]', key: ' ', code: 'Space', title: 'Swap Selected Gems' },
      boostBtn: { label: 'HINT [Shift]', key: 'Shift', code: 'ShiftLeft', title: 'Find Match Hint' },
    };
  }

  // 11. BUILDING & TETRIS BLOCK STACKER
  if (catL.includes('building') || gameplay.includes('tetris') || gameplay.includes('block') || gameplay.includes('stack')) {
    return {
      bannerShortcuts: 'Move: [A]/[D] · Rotate: [W] or ↑ · Soft Drop: [S] or ↓ · Hard Drop: [Space]',
      dpad: {
        up: { label: 'ROTATE', key: 'ArrowUp', code: 'ArrowUp', title: 'Rotate Block (W / Up)' },
        down: { label: 'SOFT DROP', key: 'ArrowDown', code: 'ArrowDown', title: 'Soft Drop (S / Down)' },
        left: { label: 'LEFT', key: 'ArrowLeft', code: 'ArrowLeft', title: 'Shift Left (A / Left)' },
        right: { label: 'RIGHT', key: 'ArrowRight', code: 'ArrowRight', title: 'Shift Right (D / Right)' },
      },
      actionBtn: { label: 'HARD DROP [Space]', key: ' ', code: 'Space', title: 'Instant Slam Down' },
      boostBtn: { label: 'HOLD [Shift]', key: 'Shift', code: 'ShiftLeft', title: 'Hold Piece' },
    };
  }

  // 12. DOODLE JUMP
  if (gameplay === 'doodle_jump' || nameL.includes('doodle')) {
    return {
      bannerShortcuts: 'Steer: [A]/[D] or Arrows · Bounce upward onto platforms & spring pads',
      dpad: {
        up: { label: 'SUPER JUMP', key: 'ArrowUp', code: 'ArrowUp', title: 'High Jump (W / Up)' },
        down: { label: 'DROP', key: 'ArrowDown', code: 'ArrowDown', title: 'Fast Fall (S / Down)' },
        left: { label: 'STEER L', key: 'ArrowLeft', code: 'ArrowLeft', title: 'Steer Left (A / Left)' },
        right: { label: 'STEER R', key: 'ArrowRight', code: 'ArrowRight', title: 'Steer Right (D / Right)' },
      },
      actionBtn: { label: 'SPRING [Space]', key: ' ', code: 'Space', title: 'Trigger Spring Propel' },
      boostBtn: { label: 'BOOST [Shift]', key: 'Shift', code: 'ShiftLeft', title: 'Rocket Boost' },
    };
  }

  // 13. RACING
  if (catL.includes('racing') || gameplay.includes('racing') || gameplay.includes('drift')) {
    return {
      bannerShortcuts: 'Steer: [A]/[D] or Arrows · Nitro Speed: [Space] or [Shift] · Dodge Traffic',
      dpad: {
        up: { label: 'NITRO', key: 'ArrowUp', code: 'ArrowUp', title: 'Accelerate (W / Up)' },
        down: { label: 'BRAKE', key: 'ArrowDown', code: 'ArrowDown', title: 'Brake / Drift (S / Down)' },
        left: { label: 'STEER L', key: 'ArrowLeft', code: 'ArrowLeft', title: 'Steer Left (A / Left)' },
        right: { label: 'STEER R', key: 'ArrowRight', code: 'ArrowRight', title: 'Steer Right (D / Right)' },
      },
      actionBtn: { label: 'NITRO [Space]', key: ' ', code: 'Space', title: 'Nitrous Speed Injection' },
      boostBtn: { label: 'DRIFT [Shift]', key: 'Shift', code: 'ShiftLeft', title: 'Handbrake Drift' },
    };
  }

  // 14. DEFAULT / PROCEDURAL ADAPTIVE
  return {
    bannerShortcuts: `Move: [WASD] or Arrows · Special Ability: [Space] / Click · Pause: [P] · Reset: [R]`,
    dpad: {
      up: { label: 'UP', key: 'ArrowUp', code: 'ArrowUp', title: 'Move Up (W / Up)' },
      down: { label: 'DOWN', key: 'ArrowDown', code: 'ArrowDown', title: 'Move Down (S / Down)' },
      left: { label: 'LEFT', key: 'ArrowLeft', code: 'ArrowLeft', title: 'Move Left (A / Left)' },
      right: { label: 'RIGHT', key: 'ArrowRight', code: 'ArrowRight', title: 'Move Right (D / Right)' },
    },
    actionBtn: { label: 'SPECIAL [Space]', key: ' ', code: 'Space', title: 'Trigger Unique Ability' },
    boostBtn: { label: 'SPRINT [Shift]', key: 'Shift', code: 'ShiftLeft', title: 'Sprint / Boost' },
  };
}

/**
 * Returns tailored, high-accuracy instructions, rules, scoring, and pro tips for each game.
 */
export function getGameInstructionDetails(game: GameRecord): DetailedGameManual {
  const nameL = game.name.toLowerCase();
  const catL = game.category.toLowerCase();
  const gameplay = game.gameplayCategory || '';

  // 1. PINBALL
  if (gameplay === 'pinball' || nameL.includes('pinball')) {
    return {
      overview: `Pinball is a kinetic arcade flipper simulation with physical ball gravity, reflective bounce physics, glowing neon bumpers, top lane rollovers, and multiball jackpot triggers.`,
      howToPlay: [
        "Hold down [Space] or the Down Arrow / on-screen Plunger button to compress the spring, then release to launch the pinball up the curved orbit lane.",
        "Press [A] or Left Arrow to flip the Left Flipper, and [D] or Right Arrow to flip the Right Flipper.",
        "Keep the ball circulating on the upper playfield to ricochet off the tri-bumpers (150-500 pts) and trigger slingshot kickbacks (+75 pts).",
        "Roll through all 3 Top Rollover Lanes (A - B - C) to trigger the massive 1,500 pt MULTIBALL Jackpot and launch extra pinballs onto the table simultaneously!",
      ],
      rules: [
        "You begin each match with 3 steel pinballs. Letting a ball fall through the bottom gap between flippers costs 1 ball.",
        "Hitting active rotating flippers imparts high kinetic acceleration to launch the ball upward into targets.",
        "Knocking down all 3 drop targets on the upper left awards an instant 1,000 pt bank bonus.",
        "The match concludes when all 3 pinballs have drained.",
      ],
      scoringSystem: "Bumpers: +150 to +500 pts · Slingshots: +75 pts · Drop Targets: +350 pts (+1,000 bank) · Rollovers: +200 pts · Multiball Jackpot: +1,500 pts.",
      winCondition: "Surpass high score and trigger the Multiball Jackpot before draining all 3 pinballs.",
      controlsSummary: "Left Flipper [A / ←], Right Flipper [D / →], Plunger Launch [Space / ↓], Table Reset [R].",
      proTips: [
        "Do not hold both flippers up at once; trap the ball on one flipper, aim carefully, and release to shoot precisely into the top lanes.",
        "Time your flipper strike just as the ball reaches the flipper tip for maximum launch velocity.",
      ],
      keys: [
        { key: "A / Left Arrow", action: "Left Flipper" },
        { key: "D / Right Arrow", action: "Right Flipper" },
        { key: "Space / Down Arrow", action: "Launch Spring Plunger" },
        { key: "R", action: "Restart New Pinball Match" },
        { key: "P / Esc", action: "Pause / Resume" },
      ],
    };
  }

  // 2. ASTEROIDS
  if (gameplay === 'asteroids' || nameL.includes('asteroid')) {
    return {
      overview: `Asteroids is a vector space flight simulation where you pilot a nimble starfighter through hazardous asteroid fields, splitting massive space boulders into tumbling fragments.`,
      howToPlay: [
        "Use [A] and [D] or Left/Right arrows to rotate your ship's heading.",
        "Press [W] or Up arrow to ignite rocket thrusters. Inertia carries your ship forward through zero-gravity space.",
        "Press [Space] or click the mouse to fire laser cannons and blast asteroids in your trajectory.",
        "Flying or shooting across any screen edge wraps your ship and lasers to the opposite side of the screen.",
      ],
      rules: [
        "Large asteroids crack into 2 medium asteroids (+50 pts). Medium asteroids split into 2 small fast rocks (+100 pts).",
        "Direct collision between your ship and an asteroid destroys your ship and costs 1 life.",
        "You have 3 ships per match. Hyperspace invulnerability shields you for 3 seconds after respawn.",
        "Clear all asteroids in the quadrant to master the sector and claim victory.",
      ],
      scoringSystem: "Large Asteroids: +50 pts · Medium: +100 pts · Small: +200 pts · Sector Master Clearance: +1,000 pts.",
      winCondition: "Clear all asteroids in the sector without losing all 3 starships.",
      controlsSummary: "Rotate [A]/[D], Thrust [W], Fire Lasers [Space / Click], Hyperspace [Shift].",
      proTips: [
        "Don't shoot too many large asteroids simultaneously or the screen will swarm with unpredictable small fast fragments.",
        "Use screen wrapping to escape tight corners when surrounded by tumbling boulders.",
      ],
      keys: [
        { key: "A / D or Left/Right", action: "Rotate Ship Heading" },
        { key: "W or Up Arrow", action: "Fire Ion Thruster" },
        { key: "Space / Click", action: "Fire Laser Cannons" },
        { key: "R", action: "Restart Sector" },
      ],
    };
  }

  // 3. PAC-MAN & MAZE
  if (gameplay === 'pacman' || nameL.includes('pac-man') || nameL.includes('pacman') || gameplay.includes('maze')) {
    return {
      overview: `Navigate a retro neon labyrinth, consuming pellets while evading 4 patrolling ghost adversaries. Turn the tables by collecting flashing Power Pellets!`,
      howToPlay: [
        "Direct Pac-Man through the corridors using [WASD] or Arrow keys.",
        "Consume small yellow pellets (+10 pts) scattered throughout every maze corridor.",
        "Chomp flashing orange Power Pellets in the corners (+50 pts) to turn the ghosts vulnerable blue for a limited duration.",
        "While ghosts are blue, chase and consume them for huge +200 point bonuses!",
      ],
      rules: [
        "Colliding with an active colored ghost costs 1 life and resets your position to the starting corner.",
        "Ghosts change corridors dynamically to track your trajectory; avoid getting cornered in dead ends.",
        "You have 3 lives per game.",
        "Consume all pellets on the grid to achieve complete labyrinth clearance.",
      ],
      scoringSystem: "Small Pellets: +10 pts · Power Pellets: +50 pts · Chomp Ghost: +200 pts · Complete Maze Clearance: +1,000 pts.",
      winCondition: "Eat every single pellet in the labyrinth.",
      controlsSummary: "Steer [WASD / Arrows], Turbo [Space], Pause [P], Restart [R].",
      proTips: [
        "Save Power Pellets for when ghosts are surrounding you to escape lethal traps.",
        "Learn the ghost patrol routes to anticipate their movements before entering corridors.",
      ],
      keys: [
        { key: "WASD / Arrows", action: "Steer Pac-Man" },
        { key: "P / Esc", action: "Pause Game" },
        { key: "R", action: "Restart Match" },
      ],
    };
  }

  // 4. FRUIT NINJA & BLADE SLICE
  if (gameplay === 'fruit_ninja' || nameL.includes('fruit') || nameL.includes('slice')) {
    return {
      overview: `Fruit Ninja is a dojo blade slicing game. Slice through flying watermelons, oranges, and bananas with a gleaming neon katana while avoiding dangerous explosive bombs!`,
      howToPlay: [
        "Click and drag your mouse or swipe your finger across fruits tossed into the air.",
        "Slice fruits in mid-air to carve them into halves and produce vibrant juice splatter effects (+50 pts).",
        "Slice multiple fruits in a single swift stroke to chain combos.",
        "DO NOT slice black bombs with burning fuses; striking a bomb causes an instant explosion and ends the match!",
      ],
      rules: [
        "Letting 3 whole fruits fall off the bottom of the screen without being sliced costs your 3 dojo lives.",
        "Slicing any bomb results in an instant Game Over.",
        "Combos award multiplied score ratings and bonus XP.",
      ],
      scoringSystem: "Fruit Slice: +50 pts · Sliced Combos: Multiplied by fruits sliced in one stroke · Dojo Mastery: +1,500 pts.",
      winCondition: "Slice as many fruits as possible and achieve a legendary high score without hitting bombs.",
      controlsSummary: "Drag / Swipe Mouse or Touch to Slice Fruits.",
      proTips: [
        "Wait until fruits reach the peak of their parabolic arc where their velocity is lowest before slicing.",
        "Use short, precise swipe strokes to avoid accidentally clipping near bombs.",
      ],
      keys: [
        { key: "Mouse Drag / Touch", action: "Katana Blade Slice" },
        { key: "Space", action: "Full Blade Sweep" },
        { key: "R", action: "Restart Dojo" },
      ],
    };
  }

  // 5. PLATFORMER (GAME-061 - GAME-075, etc.)
  if (catL.includes('platformer') || gameplay.includes('platform') || nameL.includes('platform')) {
    return {
      overview: `${game.name} is a 2D side-scrolling platformer featuring precision jumping, floating brick platforms, collectible gold coins, stompable monsters, and an end-level victory flagpole.`,
      howToPlay: [
        "Run left and right using [A] and [D] or Arrow keys.",
        "Press [W], [Space], or Up Arrow to jump across chasms and leap onto elevated brick ledges.",
        "Collect glowing gold coins (+100 pts) placed in challenging platform locations.",
        "Defeat patrolling monsters by landing directly on top of their heads from a downward jump (+250 pts).",
        "Reach the victory flagpole at the far right of the course to complete the level!",
      ],
      rules: [
        "Walking horizontally into a monster damages you and ends the run.",
        "Falling into bottomless pits or off the stage results in instant defeat.",
        "Stomping monsters from above bounces your character upward to reach secret coin platforms.",
      ],
      scoringSystem: "Coins: +100 pts · Stomping Monsters: +250 pts · Level Clearance Flag: +1,500 pts.",
      winCondition: "Reach the victory flagpole at the end of the course.",
      controlsSummary: "Run [A]/[D] or Arrows, Jump [W]/[Space] or Click, Sprint [Shift].",
      proTips: [
        "Hold jump while stomping on a monster to bounce significantly higher.",
        "Time your leaps when moving platforms reach the closest edge.",
      ],
      keys: [
        { key: "A / D or Left/Right", action: "Run Left / Right" },
        { key: "W / Space / Up", action: "Jump / Leap" },
        { key: "Shift", action: "Sprint Boost" },
        { key: "R", action: "Restart Level" },
      ],
    };
  }

  // 6. TOWER DEFENSE & STRATEGY
  if (catL.includes('strategy') || gameplay.includes('tower') || gameplay.includes('defense') || nameL.includes('tower')) {
    return {
      overview: `Command strategic defensive emplacements along a winding invasion route. Build Laser and Cannon turrets to destroy waves of enemy creeps before they breach your base crystal.`,
      howToPlay: [
        "Click on empty circular slots along the road to construct turrets (Cost: 50 Gold).",
        "Click on existing turrets to upgrade their damage and firing rate (Cost: 30 Gold).",
        "Turrets automatically acquire targets in range and fire laser beams or high-impact explosive shells.",
        "Eliminate creeps to earn gold bounties and fund further fortress upgrades.",
      ],
      rules: [
        "Creeps that reach the end of the road inflict 15% damage to your Base Crystal.",
        "If Base Crystal HP drops to 0%, the sector is lost.",
        "Survive all 5 waves of increasingly resilient enemy creeps to achieve tactical victory.",
      ],
      scoringSystem: "Creep Kill: +100 pts (+20 Gold) · Wave Cleared: +80 Gold · Sector Victory: +2,000 pts.",
      winCondition: "Successfully defend all 5 waves with Base Crystal HP above 0%.",
      controlsSummary: "Click slots to build/upgrade turrets, [Space] to fire special strike.",
      proTips: [
        "Place Cannon turrets near tight bends where enemies linger longer in weapon range.",
        "Upgrading existing towers is often more cost-effective than building isolated low-level towers.",
      ],
      keys: [
        { key: "Mouse Click", action: "Build Turret (50G) / Upgrade (30G)" },
        { key: "Space", action: "Artillery Special Strike" },
        { key: "R", action: "Restart Tactical Defense" },
      ],
    };
  }

  // 7. HORROR & ZOMBIE SURVIVAL
  if (catL.includes('horror') || gameplay.includes('horror') || gameplay.includes('zombie') || nameL.includes('zombie')) {
    return {
      overview: `Trapped in pitch-black darkness, your flashlight is your only lifeline. Cut through shadows, detect approaching zombie hordes, and shoot to survive until dawn!`,
      howToPlay: [
        "Move your survivor across the room using [WASD] or Arrow keys.",
        "Aim your flashlight cone by moving your mouse or finger; only areas illuminated by the beam are visible!",
        "Fire your weapon with [Space] or Left Click to eliminate zombies before they enter your melee perimeter.",
        "Pick up ammo crates dropped by fallen zombies to keep your firearm loaded.",
        "Survive until the 45-second Dawn countdown timer reaches zero to claim victory!",
      ],
      rules: [
        "Zombies emerge unpredictably from the outer dark borders.",
        "Close-contact zombie attacks drain your health bar rapidly.",
        "If health drops to 0%, you are overwhelmed by the undead horde.",
      ],
      scoringSystem: "Zombie Neutralized: +100 pts · Ammo Pickup: +6 Rounds · Dawn Survival Victory: +2,000 pts.",
      winCondition: "Keep health above 0% until dawn arrives (45s survival timer).",
      controlsSummary: "Move [WASD], Aim Flashlight [Mouse], Shoot [Space / Click], Sprint [Shift].",
      proTips: [
        "Keep moving and sweep your flashlight in full 360-degree circles to avoid being ambushed from behind.",
        "Conserve ammunition by only firing when zombies are clearly centered in your flashlight beam.",
      ],
      keys: [
        { key: "WASD / Arrows", action: "Move Survivor" },
        { key: "Mouse Aim", action: "Direct Dynamic Flashlight Cone" },
        { key: "Space / Click", action: "Fire Weapon" },
        { key: "Shift", action: "Adrenaline Sprint" },
        { key: "R", action: "Restart Horror Night" },
      ],
    };
  }

  // 8. SPORTS (Soccer / Basketball / Golf)
  if (catL.includes('sports') || gameplay.includes('soccer') || gameplay.includes('basketball') || gameplay.includes('golf')) {
    return {
      overview: `A high-stakes athletic shootout challenge! Aim your trajectory arrow, gauge power meter timing, and score spectacular goals past active goalkeepers.`,
      howToPlay: [
        "Aim your trajectory line using [A] and [D] or by moving your mouse.",
        "Press and hold [Space] or click to charge the power gauge meter.",
        "Release [Space] right as the power gauge reaches the green sweet spot to unleash an unstoppable strike.",
        "Score at least 3 out of your 5 penalty attempts to win the championship match!",
      ],
      rules: [
        "You receive exactly 5 shooting attempts per match.",
        "Shooting too early or too late causes the ball to fly wide or be easily saved by the goalie.",
        "Goalkeepers track trajectory angles and dive to block predictable shots.",
      ],
      scoringSystem: "Goal Scored: +250 pts (+300 for basketball, +500 for golf) · Match Championship Victory: +1,000 pts.",
      winCondition: "Score 3 or more goals out of 5 attempts.",
      controlsSummary: "Aim [A]/[D] or Mouse, Hold & Release [Space / Click] to Shoot.",
      proTips: [
        "Wait for the goalkeeper to commit towards one side before releasing your shot into the opposite corner.",
        "Higher power gives less reaction time for the goalie to dive.",
      ],
      keys: [
        { key: "A / D or Mouse", action: "Aim Shot Trajectory" },
        { key: "Space / Click", action: "Hold & Release for Power Shot" },
        { key: "R", action: "Restart Match" },
      ],
    };
  }

  // 9. PUZZLE / MATCH-3 GEMS
  if (catL.includes('puzzle') || gameplay.includes('match') || gameplay.includes('puzzle') || gameplay.includes('gem')) {
    return {
      overview: `Align glittering faceted gemstones on an 8x8 grid. Swap adjacent rubies, sapphires, emeralds, and topazes to trigger cascades and explosive combo multipliers!`,
      howToPlay: [
        "Click on any gem on the grid to select it (it will pulse with a bright glow ring).",
        "Click on an adjacent gem (Up, Down, Left, or Right) to swap their positions.",
        "If 3 or more identical gems align in a horizontal or vertical row, they shatter with particle sparkles and new gems cascade from above.",
        "Create cascades and combo chains to maximize your score before your 20 moves expire!",
      ],
      rules: [
        "Swaps that do not form a valid match of 3 or more gems automatically revert.",
        "You have 20 moves per puzzle session.",
        "Cascade chain reactions grant multiplied score bonuses without consuming extra moves.",
      ],
      scoringSystem: "3-Gem Match: +180 pts · 4-Gem Match: +360 pts · 5-Gem Cascade: +600 pts.",
      winCondition: "Score as many points as possible within 20 moves.",
      controlsSummary: "Click or Tap adjacent gems to swap and align 3 of a kind.",
      proTips: [
        "Look for matches near the bottom of the grid to cause larger cascade chain reactions above.",
        "Prioritize matching 4 or 5 gems simultaneously for massive point multipliers.",
      ],
      keys: [
        { key: "Mouse Click", action: "Select & Swap Jewels" },
        { key: "R", action: "Restart Puzzle Grid" },
      ],
    };
  }

  // 10. BUILDING & TETRIS BLOCK STACKER
  if (catL.includes('building') || gameplay.includes('tetris') || gameplay.includes('block') || gameplay.includes('stack')) {
    return {
      overview: `A strategic architectural puzzle. Guide falling tetromino shapes into complete horizontal rows. Clear lines to prevent the grid from overflowing to the top!`,
      howToPlay: [
        "Guide the falling tetromino block left or right using [A] and [D] or Arrow keys.",
        "Press [W] or Up Arrow to rotate the block 90 degrees.",
        "Press [S] or Down Arrow for Soft Drop to guide the piece down faster.",
        "Press [Space] for an instant Hard Drop to lock the piece into place immediately.",
        "Complete solid horizontal lines without any gaps to clear them and score massive points!",
      ],
      rules: [
        "Blocks cannot overlap existing settled blocks or pass through the grid boundaries.",
        "Clearing lines creates room for new blocks and awards line-clear bonuses.",
        "If blocks stack all the way to the top ceiling, the game ends in defeat.",
        "Clear 10 complete lines to master the architecture stage and claim victory!",
      ],
      scoringSystem: "Single Line: +150 pts · Double: +350 pts · Triple: +600 pts · Tetris 4-Line Clear: +1,000 pts · 10 Lines Master: +1,500 pts.",
      winCondition: "Clear 10 total lines without letting blocks stack to the top.",
      controlsSummary: "Move [A]/[D], Rotate [W]/↑, Soft Drop [S]/↓, Hard Drop [Space].",
      proTips: [
        "Keep the stack as flat as possible to avoid leaving unreachable holes.",
        "Reserve the rightmost column to set up high-scoring 4-line Tetris clears with long I-bars.",
      ],
      keys: [
        { key: "A / D or Left/Right", action: "Move Block Left / Right" },
        { key: "W or Up Arrow", action: "Rotate Block 90°" },
        { key: "S or Down Arrow", action: "Soft Drop" },
        { key: "Space", action: "Hard Drop (Instant Lock)" },
        { key: "R", action: "Restart Block Grid" },
      ],
    };
  }

  // 11. DEFAULT PROCEDURAL / ALL OTHER GAMES
  return {
    overview: `${game.name} is an engaging ${game.type} game built on ${game.category} mechanics. ${game.description}`,
    howToPlay: [
      `Use [WASD] or Arrow keys to navigate your themed hero avatar across the arena.`,
      `Collect glowing sector objective items (+100 pts) scattered across the field.`,
      `Evade hostile adversaries that patrol the sector and try to intercept your path.`,
      `Press [Space], [Enter], or click to unleash your unique Special Ability and clear threats with shockwave attacks!`,
      `Clear all stage objectives across all 3 sectors to master ${game.name}!`,
    ],
    rules: [
      "Colliding with hostile adversaries depletes your health bar.",
      "If your health reaches 0%, the mission fails.",
      "Special abilities require a cooldown period before they can be deployed again.",
      "Clear all sector items to advance to the next difficulty stage.",
    ],
    scoringSystem: "Objective Items: +100 pts · Enemy Defeated: +250 pts · Special Ability Elimination: +300 pts · Full Stage Clearance: +1,500 pts.",
    winCondition: `Complete objective: ${game.objective} across all 3 sectors.`,
    controlsSummary: "Move [WASD / Arrows], Special Ability [Space / Click], Sprint [Shift], Pause [P], Restart [R].",
    proTips: [
      "Save your special ability for moments when you are cornered by multiple adversaries.",
      "Collect items along perimeter lines to maintain an escape route into the open center.",
    ],
    keys: [
      { key: "WASD / Arrows", action: "Navigate Hero" },
      { key: "Space / Click", action: "Deploy Thematic Special Ability" },
      { key: "Shift", action: "Sprint / Boost" },
      { key: "P / Esc", action: "Pause / Resume" },
      { key: "R", action: "Restart Game Match" },
    ],
  };
}
