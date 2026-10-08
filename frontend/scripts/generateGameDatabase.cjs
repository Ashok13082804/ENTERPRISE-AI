const fs = require('fs');
const path = require('path');

const CATEGORIES_DATA = [
  {
    category: "Arcade Games",
    subcategory: "Classic & Modern Arcade",
    type: "2D",
    is_2d: true,
    is_3d: false,
    engine: "Canvas2D",
    accentColor: "from-amber-500 to-orange-600",
    games: [
      { name: "Snake", gameplay: "snake", desc: "Classic snake game with food collection, speed acceleration, and collision avoidance.", diff: "Easy", obj: "Grow snake as long as possible without hitting walls or tail." },
      { name: "Pong", gameplay: "pong", desc: "Two paddles, one ball, retro tennis simulation with AI opponent or local duel.", diff: "Easy", obj: "Score points against the opponent paddle by returning the ball." },
      { name: "Breakout", gameplay: "breakout", desc: "Classic brick destruction with bouncing physics, combos, and paddle control.", diff: "Easy", obj: "Clear all brick layers without losing the ball." },
      { name: "Arkanoid", gameplay: "arkanoid", desc: "Enhanced brick breaker with powerups, laser blasters, and variable brick defenses.", diff: "Medium", obj: "Smash through defense blocks and collect falling powerups." },
      { name: "Space Invaders", gameplay: "space_invaders", desc: "Defend Earth against descending alien formations with bunker shields and retro blasters.", diff: "Medium", obj: "Eliminate all alien invaders before they reach bottom screen." },
      { name: "Asteroids", gameplay: "asteroids", desc: "360-degree vector space craft blasting floating space rocks into smaller fragments.", diff: "Medium", obj: "Destroy drifting asteroids and alien saucers with thruster inertia." },
      { name: "Pac-Man style game", gameplay: "pacman", desc: "Navigate maze corridors, munch power pellets, and outsmart dynamic ghost AI.", diff: "Medium", obj: "Eat all dots in the labyrinth while dodging colorful chasing ghosts." },
      { name: "Flappy Bird", gameplay: "flappy", desc: "Tap-to-fly physics challenge navigating through perilous vertical pipe obstacles.", diff: "Hard", obj: "Flap wings smoothly through gaps between pipes to rack up points." },
      { name: "Crossy Road 2D", gameplay: "crossy", desc: "Hop through busy roadways, speeding trains, and treacherous rivers with log hopping.", diff: "Medium", obj: "Guide your character across endless busy lanes without getting hit." },
      { name: "Whack-a-Mole", gameplay: "whackamole", desc: "Fast-reaction reflex tester striking popping moles before they burrow down.", diff: "Easy", obj: "Click/tap on pop-up moles before the timer expires to score." },
      { name: "Brick Breaker", gameplay: "brick_breaker", desc: "High-speed arcade brick demolition with multiball cascading effects.", diff: "Medium", obj: "Shatter all reinforced bricks using tactical paddle ricochets." },
      { name: "Pinball", gameplay: "pinball", desc: "Kinetic pinball flipper table with bumpers, ramps, target drop banks, and multiball.", diff: "Hard", obj: "Keep ball in play with flippers and hit bumpers for massive multipliers." },
      { name: "Bubble Shooter", gameplay: "bubble_shooter", desc: "Aim and launch colored bubbles to match 3 or more clusters and pop the ceiling.", diff: "Easy", obj: "Clear the bubble ceiling before it drops too low." },
      { name: "Fruit Ninja 2D", gameplay: "fruit_ninja", desc: "Blade slicing frenzy cutting flying airborne fruit while avoiding explosive bombs.", diff: "Medium", obj: "Slice maximum fruit with mouse/finger swipes without slicing bombs." },
      { name: "Endless Runner", gameplay: "runner", desc: "Continuous forward dash jumping over spikes, sliding under beams, and grabbing coins.", diff: "Medium", obj: "Run as far as possible by jumping and sliding past hazard traps." },
      { name: "Doodle Jump", gameplay: "doodle_jump", desc: "Springy vertical bouncing ascending endless platforms, jetpacks, and moving ledges.", diff: "Medium", obj: "Ascend to astronomical heights by bouncing on platforms." },
      { name: "Helicopter Game", gameplay: "helicopter", desc: "Hold-to-ascend physics dodging jagged cavern stalactites and moving barriers.", diff: "Hard", obj: "Pilot the chopper through narrow jagged tunnels without crashing." },
      { name: "Jetpack Game", gameplay: "jetpack", desc: "High-octane jet propulsion dodging electric zappers, laser grids, and homing missiles.", diff: "Medium", obj: "Fly with jetpack thrust, collect coins, and dodge deadly lasers." },
      { name: "Tap-to-Jump Game", gameplay: "tap_jump", desc: "Rhythmic single-tap timing game clearing rotating obstacles and spike gaps.", diff: "Easy", obj: "Time jumps accurately on rotating platforms and geometric spikes." },
      { name: "Reaction Game", gameplay: "reaction", desc: "Ultra-fast human benchmark reaction tester measuring microsecond reflex speeds.", diff: "Easy", obj: "React instantly when the screen changes color to test reflexes." }
    ]
  },
  {
    category: "Space Games",
    subcategory: "Galactic Combat & Flight",
    type: "2D",
    is_2d: true,
    is_3d: false,
    engine: "Canvas2D",
    accentColor: "from-indigo-600 to-cyan-500",
    games: [
      { name: "2D Space Shooter", gameplay: "space_shooter", desc: "Top-down vertical scroller blasting enemy space armadas with upgradeable plasma cannons.", diff: "Medium", obj: "Destroy enemy waves and upgrade your starship weapons." },
      { name: "Galaxy Shooter", gameplay: "galaxy_shooter", desc: "Bullet-hell space warfare with intricate boss patterns and shield overcharge.", diff: "Hard", obj: "Navigate bullet swarms and defeat galaxy boss battleships." },
      { name: "Asteroid Shooter", gameplay: "asteroid_shooter", desc: "Heavy mining cruiser vaporizing dense asteroid belts with sonic shockwaves.", diff: "Medium", obj: "Mine valuable ore while vaporizing colliding space rocks." },
      { name: "Alien Invasion", gameplay: "alien_invasion", desc: "Planetary defense outpost intercepting dropships and alien biomechanical drones.", diff: "Hard", obj: "Defend cities from descending alien invasion craft." },
      { name: "Space Survival", gameplay: "space_survival", desc: "Drifting damaged cruiser managing oxygen, fuel, hull integrity, and debris shields.", diff: "Hard", obj: "Survive deep space hazards by balancing power and resources." },
      { name: "Space Racing", gameplay: "space_racing", desc: "Anti-gravity stellar hyperway racing through warp rings and solar flares.", diff: "Medium", obj: "Drift through plasma gates and reach warp speed before competitors." },
      { name: "Planet Defender", gameplay: "planet_defender", desc: "Orbital perimeter defense satellite rotating 360 degrees to blast incoming comets.", diff: "Medium", obj: "Rotate orbital cannon around planet to deflect all orbital threats." },
      { name: "UFO Attack", gameplay: "ufo_attack", desc: "Command an extraterrestrial saucer utilizing tractor beams and anti-matter rays.", diff: "Medium", obj: "Abduct resources and zap ground anti-air turrets." },
      { name: "Moon Landing", gameplay: "moon_landing", desc: "Precision thrust and fuel management lander simulation on low-gravity lunar crater.", diff: "Hard", obj: "Land the lunar module gently on the landing pad without crashing." },
      { name: "Space Exploration", gameplay: "space_exploration", desc: "Procgen solar system voyage charting exoplanets, anomalies, and wormholes.", diff: "Easy", obj: "Discover unknown star systems, scan planets, and record cosmic lore." },
      { name: "Starship Battle", gameplay: "starship_battle", desc: "Capital ship tactical skirmish directing broadside photon torpedoes and deflectors.", diff: "Hard", obj: "Outmaneuver hostile battlecruisers and blast their reactor cores." },
      { name: "Meteor Dodge", gameplay: "meteor_dodge", desc: "Ultra-fast reflex evasion navigating dense hypervelocity meteor fields.", diff: "Medium", obj: "Dodge burning meteors and collect antimatter canisters." },
      { name: "Space Mining", gameplay: "space_mining", desc: "Industrial mining drone harvesting rare isotopes, titanium crystals, and dark matter.", diff: "Medium", obj: "Extract valuable minerals from rich asteroids and return to station." },
      { name: "Space Colony", gameplay: "space_colony", desc: "Orbital dome construction managing hydroponics, solar arrays, and meteor defenses.", diff: "Medium", obj: "Build and expand a self-sustaining space colony in orbit." },
      { name: "Galactic War", gameplay: "galactic_war", desc: "All-out fleet conquest commanding squadrons of interceptors, cruisers, and titans.", diff: "Hard", obj: "Conquer contested sectors across the galaxy map." }
    ]
  },
  {
    category: "Horror Games",
    subcategory: "Dark Atmosphere & Survival",
    type: "2D",
    is_2d: true,
    is_3d: false,
    engine: "Canvas2D",
    accentColor: "from-red-900 to-rose-600",
    games: [
      { name: "2D Horror Escape", gameplay: "horror_escape", desc: "Dimly lit asylum corridors navigating with a flickering flashlight while escaping stalkers.", diff: "Hard", obj: "Find keys and fuses in the dark before sanity runs out." },
      { name: "Haunted House", gameplay: "haunted_house", desc: "Spooky Victorian manor filled with poltergeists, locked secret bookcases, and mirrors.", diff: "Medium", obj: "Solve paranormal puzzles and escape the cursed estate." },
      { name: "Zombie Survival", gameplay: "zombie_survival", desc: "Barricade windows, scavenge ammo, and repel relentless undead hordes.", diff: "Hard", obj: "Survive nocturnal waves of undead flesh-eaters." },
      { name: "Zombie Shooter", gameplay: "zombie_shooter", desc: "Dual-stick arcade shooter blasting mutated zombies with shotguns, grenades, and turrets.", diff: "Medium", obj: "Mow down endless infected hordes and upgrade your arsenal." },
      { name: "Vampire Survival", gameplay: "vampire_survival", desc: "Auto-firing roguelite survivor annihilating thousands of bats, ghouls, and vampires.", diff: "Medium", obj: "Collect gems, evolve spell synergies, and survive 20 minutes." },
      { name: "Ghost Hunter", gameplay: "ghost_hunter", desc: "EMF detector and UV camera investigation tracking ethereal entities into containment traps.", diff: "Medium", obj: "Identify ghost types using scientific paranormal equipment." },
      { name: "Haunted Hospital", gameplay: "haunted_hospital", desc: "Abandoned psych ward navigating stealthily past auditory-tracking monstrosities.", diff: "Hard", obj: "Sneak past blind monsters listening to your every footstep." },
      { name: "Haunted School", gameplay: "haunted_school", desc: "Midnight school investigation solving cursed chalkboards and dodging shadow lockers.", diff: "Medium", obj: "Collect student diaries to break the ancient school curse." },
      { name: "Paranormal Investigation", gameplay: "paranormal_investigation", desc: "Thermal imaging and spirit box communication deciphering entity messages.", diff: "Medium", obj: "Gather definitive proof of spectral presence without being consumed." },
      { name: "Horror Maze", gameplay: "horror_maze", desc: "Fog-shrouded labyrinth where the walls shift and terrifying whispers echo.", diff: "Hard", obj: "Find the glowing exit portal before the creature tracks your scent." },
      { name: "Escape the Monster", gameplay: "escape_monster", desc: "High-adrenaline chase sequence sliding under obstacles and leaping chasm pits.", diff: "Hard", obj: "Stay ahead of the relentless behemoth chasing right behind you." },
      { name: "Night Survival", gameplay: "night_survival", desc: "Gather firewood during twilight, maintain the sanctuary campfire against shadow fiends.", diff: "Medium", obj: "Keep your campfire burning until the first rays of dawn." },
      { name: "Cursed Village", gameplay: "cursed_village", desc: "Investigate deserted misty hamlets plagued by occult totems and lurking shadows.", diff: "Hard", obj: "Destroy pagan totems to lift the blood curse over the valley." },
      { name: "Haunted Mansion", gameplay: "haunted_mansion", desc: "Explore grand ballrooms, creaky stairwells, and hidden crypts under the estate.", diff: "Medium", obj: "Cleanse haunted artifacts using holy water and mystical relics." },
      { name: "Demon Escape", gameplay: "demon_escape", desc: "Underworld descent sprinting across crumbling brimstone bridges evading demon overlords.", diff: "Hard", obj: "Outrun the infernal demon lord across collapsing volcanic crags." }
    ]
  },
  {
    category: "Action Games",
    subcategory: "Combat & Reflexes",
    type: "2D",
    is_2d: true,
    is_3d: false,
    engine: "Canvas2D",
    accentColor: "from-amber-600 to-red-600",
    games: [
      { name: "2D Fighting Game", gameplay: "fighting_2d", desc: "Classic one-on-one combat with combos, special meters, crouch blocks, and super arts.", diff: "Hard", obj: "Deplete your rival fighter's health bar over 3 competitive rounds." },
      { name: "Beat 'em Up", gameplay: "beat_em_up", desc: "Side-scrolling street brawler throwing punches, flying kicks, and improvised weapons.", diff: "Medium", obj: "Clean up crime-ridden city streets wave by wave." },
      { name: "Ninja Game", gameplay: "ninja_game", desc: "Stealth shadow warrior climbing walls, hurling shurikens, and assassinating sentries.", diff: "Medium", obj: "Infiltrate feudal fortresses without triggering the alarm bells." },
      { name: "Samurai Game", gameplay: "samurai_game", desc: "Precision katana parry duels, stance switching, and cinematic blade slashes.", diff: "Hard", obj: "Time perfect blade parries to stagger opponent master samurai." },
      { name: "Sword Fighting", gameplay: "sword_fighting", desc: "Tactical fencing and blade clashing testing reach, timing, and thrust counters.", diff: "Medium", obj: "Outsmart your opponent's guard and land clean strikes." },
      { name: "Gun Shooter", gameplay: "gun_shooter", desc: "Tactical cover shooter timing reloads, peeking from barriers, and clearing targets.", diff: "Medium", obj: "Neutralize armed hostiles while managing ammo and cover." },
      { name: "Platform Fighter", gameplay: "platform_fighter", desc: "Arena knock-out combat launching rivals off the edge using percentage damage mechanics.", diff: "Hard", obj: "Knock opponents off the floating stages with aerial attacks." },
      { name: "Superhero Game", gameplay: "superhero_game", desc: "Supercharged vigilante wielding energy blasts, flight bursts, and shockwave punches.", diff: "Medium", obj: "Protect city skyscrapers from invading supervillain syndicates." },
      { name: "Robot Battle", gameplay: "robot_battle", desc: "Steel arena gladiatorial mech combat with plasma saws, rockets, and EMP shocks.", diff: "Hard", obj: "Dismantle rival combat robots in brutal titanium cage matches." },
      { name: "Monster Battle", gameplay: "monster_battle", desc: "Colossal kaiju rampage wrestling giant beasts amidst crumbling city skylines.", diff: "Medium", obj: "Unleash atomic breath and seismic tail swipes to defeat rival kaiju." },
      { name: "Pirate Battle", gameplay: "pirate_battle", desc: "High-seas naval cannon broadsides and swashbuckling cutlass boarding raids.", diff: "Medium", obj: "Sink armada galleons and plunder legendary pirate treasure chests." },
      { name: "Viking Battle", gameplay: "viking_battle", desc: "Norse berserker storming coastal fortifications wielding heavy axes and round shields.", diff: "Hard", obj: "Raid Saxon shoreline keeps to honor the Allfather in Valhalla." },
      { name: "Knight Game", gameplay: "knight_game", desc: "Chivalric tournament jousting and castle rampart defense with heavy broadswords.", diff: "Medium", obj: "Defend the royal drawbridge against waves of invading brigands." },
      { name: "Assassin Game", gameplay: "assassin_game", desc: "Rooftop freerunning, smoke bombs, and precision target elimination in crowded plazas.", diff: "Hard", obj: "Eliminate corrupt warlords from the shadows and vanish cleanly." },
      { name: "Martial Arts Game", gameplay: "martial_arts_game", desc: "Dojo discipline mastering dragon kicks, tiger sweeps, and chi counterattacks.", diff: "Hard", obj: "Defeat all grandmasters of rival martial arts clans." }
    ]
  },
  {
    category: "Platformer Games",
    subcategory: "Jump & Run",
    type: "2D",
    is_2d: true,
    is_3d: false,
    engine: "Canvas2D",
    accentColor: "from-emerald-500 to-teal-600",
    games: [
      { name: "Classic Platformer", gameplay: "platformer_classic", desc: "Run, jump, stomp creatures, and collect sparkling gemstones across rolling green hills.", diff: "Easy", obj: "Reach the checkered flagpole at the end of each platform stage." },
      { name: "Super Mario-style Platformer", gameplay: "mario_style", desc: "Bumping mystery coin blocks, mushroom powerups, turtle shells, and pipe warps.", diff: "Medium", obj: "Rescue the captured realm by jumping through worlds and stomping bosses." },
      { name: "Ninja Platformer", gameplay: "ninja_platformer", desc: "Wall-sliding, grappling hook swinging, and shuriken flips through moonlit pagodas.", diff: "Hard", obj: "Scale treacherous vertical fortresses with agile parkour moves." },
      { name: "Parkour Platformer", gameplay: "parkour_platformer", desc: "Momentum-based speedrunning sliding under barriers, wall running, and vaulting ledges.", diff: "Hard", obj: "Maintain maximum speed flow through urban obstacle courses." },
      { name: "Puzzle Platformer", gameplay: "puzzle_platformer", desc: "Pushing weight blocks, activating pressure switches, and opening temporal gates.", diff: "Medium", obj: "Solve environmental block puzzles to pave the path forward." },
      { name: "Physics Platformer", gameplay: "physics_platformer", desc: "Bouncy rubber surfaces, swinging pendulum ropes, and dynamic seesaw ramps.", diff: "Medium", obj: "Leverage kinetic physics, momentum, and elasticity to cross canyons." },
      { name: "Precision Platformer", gameplay: "precision_platformer", desc: "Pixel-perfect micro jumps, lethal spike gauntlets, and mid-air double dashes.", diff: "Extreme", obj: "Navigate razor-thin ledges without touching single spike hazards." },
      { name: "Horror Platformer", gameplay: "horror_platformer", desc: "Shadowy silhouette platforming avoiding terrifying claws and gruesome traps.", diff: "Hard", obj: "Sneak through gloomy grim woodlands without falling into abyss pits." },
      { name: "Adventure Platformer", gameplay: "adventure_platformer", desc: "Expansive interconnected caverns, unlocking boots, keys, and magical relics.", diff: "Medium", obj: "Explore hidden grottos, discover treasure chests, and expand abilities." },
      { name: "Vertical Platformer", gameplay: "vertical_platformer", desc: "Rising magma chamber jumping endlessly upwards before the boiling lava catches you.", diff: "Hard", obj: "Ascend crumbling rock pillars faster than the rising volcanic lava." },
      { name: "Multiplayer Platformer", gameplay: "multiplayer_platformer", desc: "Co-op synchronized button pressing and competitive racing to the finish portal.", diff: "Medium", obj: "Work with your partner or outrun them to the finish checkpoint." },
      { name: "Time-Travel Platformer", gameplay: "time_travel_platformer", desc: "Switching between past, present, and future eras to navigate altered landscapes.", diff: "Hard", obj: "Toggle time dimensions to open pathways blocked in the present." },
      { name: "Gravity Platformer", gameplay: "gravity_platformer", desc: "Invert gravity upside-down at the press of a key to walk across the ceiling.", diff: "Hard", obj: "Flip gravity on the fly to bypass impassable floor obstacles." },
      { name: "Water Platformer", gameplay: "water_platformer", desc: "Submerged marine ruins balancing buoyancy, oxygen bubbles, and water currents.", diff: "Medium", obj: "Swim and jump through currents without running out of oxygen." },
      { name: "Fire-and-Ice Platformer", gameplay: "fire_ice_platformer", desc: "Switching elemental heat and frost modes to walk on lava or freeze waterfalls.", diff: "Hard", obj: "Morph between fire and ice forms to master opposing environments." }
    ]
  },
  {
    category: "Puzzle Games",
    subcategory: "Logic & Brain Teasers",
    type: "2D",
    is_2d: true,
    is_3d: false,
    engine: "Canvas2D",
    accentColor: "from-purple-500 to-indigo-600",
    games: [
      { name: "Sudoku", gameplay: "sudoku", desc: "Classic 9x9 Japanese number placement grid adhering to unique row, col, and box rules.", diff: "Medium", obj: "Fill every row, column, and 3x3 square with digits 1 through 9." },
      { name: "Chess Puzzle", gameplay: "chess_puzzle", desc: "Tactical mate-in-two and mate-in-three scenarios finding brilliant sacrifices.", diff: "Hard", obj: "Find the singular grandmaster combination leading to checkmate." },
      { name: "Crossword", gameplay: "crossword", desc: "Intersecting vocabulary crossword grid with clever cultural and lexical clues.", diff: "Medium", obj: "Solve all across and down word definitions correctly." },
      { name: "Word Search", gameplay: "word_search", desc: "Letter matrix hunting hidden words horizontally, vertically, and diagonally.", diff: "Easy", obj: "Spot and highlight all hidden words in the scrambled letter matrix." },
      { name: "Minesweeper", gameplay: "minesweeper", desc: "Deduce hidden explosive landmines using numeric adjacency clues and safety flags.", diff: "Medium", obj: "Uncover every non-mined cell without detonating a single bomb." },
      { name: "2048", gameplay: "game_2048", desc: "Slide matching numeric tiles in 4 cardinal directions to merge towards the 2048 tile.", diff: "Medium", obj: "Combine numeric tiles strategically until you forge the legendary 2048." },
      { name: "Match-3", gameplay: "match_3", desc: "Swap adjacent sparkling gems to create horizontal or vertical triplets and cascades.", diff: "Easy", obj: "Match 3 or more gems to trigger chain reactions and score points." },
      { name: "Candy Match", gameplay: "candy_match", desc: "Delicious candy confectionery matching with wrapped striped blasts and chocolate bombs.", diff: "Easy", obj: "Match sweet jellies and candies to complete target goals." },
      { name: "Sliding Puzzle", gameplay: "sliding_puzzle", desc: "Classic 15-puzzle sliding numbered square tiles into sequential order.", diff: "Medium", obj: "Arrange scrambled 1-15 number tiles in ascending order." },
      { name: "Jigsaw Puzzle", gameplay: "jigsaw_puzzle", desc: "Interlocking jigsaw piece assembly fitting borders, corners, and color textures.", diff: "Easy", obj: "Snap all jigsaw puzzle pieces together into the complete artwork." },
      { name: "Memory Match", gameplay: "memory_match", desc: "Flip hidden cards two at a time to identify identical pictorial pairs.", diff: "Easy", obj: "Memorize card faces and match all pairs in the lowest turns." },
      { name: "Maze Puzzle", gameplay: "maze_puzzle", desc: "Complex winding algorithmic labyrinth finding the solitary route from start to finish.", diff: "Easy", obj: "Navigate through intricate maze walls to reach the green exit." },
      { name: "Sokoban", gameplay: "sokoban", desc: "Warehouse keeper pushing heavy cargo crates onto targeted storage squares.", diff: "Hard", obj: "Push all crates onto destination target squares without getting stuck." },
      { name: "Connect Four", gameplay: "connect_four", desc: "Drop colored discs into a 7x6 vertical grid aiming to connect 4 in a line.", diff: "Easy", obj: "Align 4 of your colored discs vertically, horizontally, or diagonally." },
      { name: "Tic-Tac-Toe", gameplay: "tic_tac_toe", desc: "3x3 grid battling X vs O with unbeatable minimax smart AI logic.", diff: "Easy", obj: "Create a continuous line of 3 marks before the opponent." },
      { name: "Tower Puzzle", gameplay: "tower_puzzle", desc: "Tower of Hanoi disk transfer puzzle moving stacked rings across 3 pegs.", diff: "Medium", obj: "Move the stack of graduated disks to the third peg without placing larger on smaller." },
      { name: "Logic Puzzle", gameplay: "logic_puzzle", desc: "Boolean truth tables, conditional gates, and deductive reasoning riddles.", diff: "Hard", obj: "Evaluate boolean conditions to unlock the secure mystery vault." },
      { name: "Number Puzzle", gameplay: "number_puzzle", desc: "Math arithmetic grid reaching targeted totals with limited operator choices.", diff: "Medium", obj: "Combine numeric cards with operators (+, -, *, /) to hit target sums." },
      { name: "Color Matching", gameplay: "color_matching", desc: "RGB color harmony sorting aligning gradient swatches into seamless spectra.", diff: "Easy", obj: "Sort scrambled color tiles into perfect chromatic spectral orders." },
      { name: "Pattern Matching", gameplay: "pattern_matching", desc: "Visual sequence recognition completing the missing glyph in the cipher.", diff: "Medium", obj: "Identify geometric pattern logic and predict the next symbol." },
      { name: "Escape Room Puzzle", gameplay: "escape_room_puzzle", desc: "Point-and-click chamber examining secret codes, dials, and hidden compartment keys.", diff: "Hard", obj: "Decipher multi-step locked clues to unlock the sealed escape door." },
      { name: "Pipe Connection", gameplay: "pipe_connection", desc: "Rotate fractured pipeline joints to guide continuous liquid flow from valve to drain.", diff: "Medium", obj: "Connect water pipes before the reservoir valve opens and floods." },
      { name: "Block Puzzle", gameplay: "block_puzzle", desc: "Fit varied polyomino block shapes into a 10x10 board to clear rows and columns.", diff: "Easy", obj: "Clear full rows and columns with polyomino blocks to keep grid clear." },
      { name: "Physics Puzzle", gameplay: "physics_puzzle", desc: "Cut ropes, trigger bouncy balls, and guide bowling balls into goal buckets.", diff: "Medium", obj: "Manipulate gravity, pulleys, and ropes to deliver the ball into the cup." },
      { name: "Riddle Game", gameplay: "riddle_game", desc: "Enigmatic textual and visual brain teasers challenging wit and lateral thinking.", diff: "Medium", obj: "Answer clever lateral-thinking riddles to ascend the wisdom trial." }
    ]
  },
  {
    category: "Racing Games",
    subcategory: "High Speed & Tracks",
    type: "2D",
    is_2d: true,
    is_3d: false,
    engine: "Canvas2D",
    accentColor: "from-blue-600 to-cyan-500",
    games: [
      { name: "2D Car Racing", gameplay: "racing_2d", desc: "Top-down asphalt circuit racing drifting through hairpins and passing rivals.", diff: "Medium", obj: "Complete 3 laps in record time while avoiding grass traps." },
      { name: "Top-Down Racing", gameplay: "topdown_racing", desc: "Classic arcade bird's-eye view motorsport with nitrous boosts and tire skid marks.", diff: "Medium", obj: "Master corner apexes and overtake competing sports cars." },
      { name: "Formula Racing", gameplay: "formula_racing", desc: "Open-wheel F1 Grand Prix managing aerodynamic slipstreams and pit lane tires.", diff: "Hard", obj: "Set pole position and capture the checkered championship flag." },
      { name: "Bike Racing", gameplay: "bike_racing", desc: "Motocross dirt track balancing pitch jumps over hills and muddy ruts.", diff: "Medium", obj: "Perform backflips over jumps and balance bike landings cleanly." },
      { name: "Motorcycle Racing", gameplay: "motorcycle_racing", desc: "High-speed highway superbike lane splitting at 200 mph between semi-trucks.", diff: "Hard", obj: "Weave through thick traffic at blinding speeds without clipping mirrors." },
      { name: "Kart Racing", gameplay: "kart_racing", desc: "Colorful kart mayhem firing homing shells, dropping banana peels, and boosting.", diff: "Easy", obj: "Drift around wacky bends and blast rivals with powerup items." },
      { name: "Boat Racing", gameplay: "boat_racing", desc: "Hydroplane speedboat water racing bouncing over waves and navigating buoys.", diff: "Medium", obj: "Steer powerboats through water channels without capsizing on wakes." },
      { name: "Plane Racing", gameplay: "plane_racing", desc: "Aerobatic air pylon racing threading needle gates at breakneck airspeed.", diff: "Hard", obj: "Roll and bank through aerial pylons with precision flight control." },
      { name: "Space Racing", gameplay: "space_racing_2d", desc: "Futuristic anti-grav speeder racing across neon magnetic tubes in the cosmos.", diff: "Hard", obj: "Race across zero-friction magnetic tracks at Mach speeds." },
      { name: "Drift Racing", gameplay: "drift_racing", desc: "Tsuiso tandem drift battles scoring points for angle, smoke, and clipping points.", diff: "Hard", obj: "Sustain continuous sideways drifts through tight mountain passes." },
      { name: "Traffic Racing", gameplay: "traffic_racing", desc: "Endless expressway dodging oncoming sedans, buses, and sports cruisers.", diff: "Medium", obj: "Score points by near-miss passing speeding civilian highway traffic." },
      { name: "Police Chase", gameplay: "police_chase", desc: "High-stakes getaway driver outrunning police interceptors and road barricades.", diff: "Hard", obj: "Evade aggressive patrol cars by spinning them out against obstacles." },
      { name: "Monster Truck Racing", gameplay: "monster_truck_racing", desc: "Giant 66-inch tire monster trucks crushing junk cars and leaping dirt ramps.", diff: "Medium", obj: "Crush rows of parked scrap cars and stick the high-altitude landings." },
      { name: "Off-Road Racing", gameplay: "offroad_racing", desc: "4x4 mud rally climbing rocky inclines and plowing through muddy bogs.", diff: "Medium", obj: "Navigate treacherous wilderness terrain without rolling the buggy." },
      { name: "Time Trial Racing", gameplay: "timetrial_racing", desc: "Pure racing perfection against translucent ghost cars shaving milliseconds.", diff: "Hard", obj: "Beat the gold trophy ghost car time record on every circuit." }
    ]
  },
  {
    category: "Strategy Games",
    subcategory: "Tactics & Command",
    type: "2D",
    is_2d: true,
    is_3d: false,
    engine: "Canvas2D",
    accentColor: "from-amber-600 to-yellow-600",
    games: [
      { name: "Tower Defense", gameplay: "tower_defense", desc: "Build arrow, cannon, and ice towers along winding pathways to stop invading creeps.", diff: "Medium", obj: "Upgrade defense turrets and prevent enemy waves from reaching your base." },
      { name: "Real-Time Strategy", gameplay: "rts_game", desc: "Mine ore, build barracks, train infantry, and execute multi-pronged army assaults.", diff: "Hard", obj: "Manage economy and command army squads to annihilate the enemy base." },
      { name: "Turn-Based Strategy", gameplay: "turn_based_strategy", desc: "Hexagonal grid warfare commanding units with movement points and attack ranges.", diff: "Hard", obj: "Outthink opponent commanders with tactical flanking maneuvers." },
      { name: "War Strategy", gameplay: "war_strategy", desc: "Grand military theater moving battalions, securing supply lines, and capturing capitals.", diff: "Hard", obj: "Capture strategic geopolitical provinces across the continental theater." },
      { name: "Kingdom Builder", gameplay: "kingdom_builder", desc: "Grow a feudal settlement managing peasant taxes, timber, grain, and knight garrisons.", diff: "Medium", obj: "Build a flourishing medieval realm while maintaining loyalty and food stocks." },
      { name: "City Builder", gameplay: "city_builder_2d", desc: "Zone residential, commercial, and industrial districts while providing power and water.", diff: "Medium", obj: "Create a thriving prosperous metropolis without going bankrupt." },
      { name: "Civilization Game", gameplay: "civilization_game", desc: "Guide humanity from primitive stone age clubs to orbital space launch pads.", diff: "Hard", obj: "Research technologies, construct wonders, and dominate civilization history." },
      { name: "Military Strategy", gameplay: "military_strategy", desc: "Combined arms doctrine deploying tanks, artillery batteries, and airstrike sorties.", diff: "Hard", obj: "Coordinate armor and air support to break fortified defensive lines." },
      { name: "Medieval Strategy", gameplay: "medieval_strategy", desc: "Feudal warfare with trebuchets, castle sieges, archer volleys, and heavy cavalry.", diff: "Hard", obj: "Breach enemy fortress walls with catapults and storm the keep." },
      { name: "Zombie Defense", gameplay: "zombie_defense", desc: "Place automated machine gun nests, barbed wire, and landmines against swarm hordes.", diff: "Medium", obj: "Fortify barricades and stop zombie hordes from overrunning headquarters." },
      { name: "Space Strategy", gameplay: "space_strategy", desc: "Colonize stellar systems, design battlefleets, and negotiate interstellar treaties.", diff: "Hard", obj: "Achieve galactic supremacy through diplomacy, trade, or orbital bombardment." },
      { name: "Resource Management", gameplay: "resource_management", desc: "Balance steel, oil, electricity, and labor in an interconnected supply network.", diff: "Medium", obj: "Optimize manufacturing supply chains and prevent industrial bottlenecks." },
      { name: "Farming Strategy", gameplay: "farming_strategy", desc: "Plant seasonal crops, monitor soil moisture, trade livestock, and upgrade equipment.", diff: "Easy", obj: "Maximize farm harvest yields and profit margins through strategic crop rotation." },
      { name: "Trading Strategy", gameplay: "trading_strategy", desc: "Buy low in coastal ports and sell high in inland capitals while hiring merchant guards.", diff: "Medium", obj: "Accumulate millions by exploiting market arbitrage between trade hubs." },
      { name: "Political Strategy", gameplay: "political_strategy", desc: "Campaign for democratic office, manage polling popularity, and balance voter coalitions.", diff: "Medium", obj: "Pass legislative reforms and win national presidential elections." },
      { name: "Battle Simulator", gameplay: "battle_simulator", desc: "Place ragdoll units with quirky physics on opposing battle lines and watch chaos ensue.", diff: "Easy", obj: "Formulate unit compositions to topple expensive opposing armies." }
    ]
  },
  {
    category: "Simulation Games",
    subcategory: "World & Economy Sims",
    type: "2D",
    is_2d: true,
    is_3d: false,
    engine: "Canvas2D",
    accentColor: "from-teal-600 to-emerald-600",
    games: [
      { name: "Farming Simulator", gameplay: "farming_sim", desc: "Till soil, plant wheat and corn seeds, water crops, and drive tractors to harvest.", diff: "Easy", obj: "Grow organic produce and expand farm acreage with modern equipment." },
      { name: "Restaurant Simulator", gameplay: "restaurant_sim", desc: "Seat hungry patrons, take gourmet orders, cook in the kitchen, and wash dishes.", diff: "Medium", obj: "Serve customers quickly to earn 5-star culinary reviews and tips." },
      { name: "Shop Simulator", gameplay: "shop_sim", desc: "Stock grocery shelves, price inventory items, operate cash registers, and restock.", diff: "Easy", obj: "Manage retail inventory and customer queues to build a retail empire." },
      { name: "School Simulator", gameplay: "school_sim", desc: "Design academic timetables, hire teachers, build science labs, and educate pupils.", diff: "Medium", obj: "Elevate school academic rankings and graduate top scholarship students." },
      { name: "Hospital Simulator", gameplay: "hospital_sim", desc: "Triage emergency patients, build MRI clinics, cure bizarre ailments, and manage doctors.", diff: "Hard", obj: "Cure incoming patients and expand hospital treatment facilities." },
      { name: "Airport Simulator", gameplay: "airport_sim", desc: "Coordinate runway taxiing, terminal baggage routing, and passenger boarding.", diff: "Hard", obj: "Keep flight schedules on time without runway traffic collisions." },
      { name: "Hotel Simulator", gameplay: "hotel_sim", desc: "Manage luxury resort suites, housekeeping services, room service, and pools.", diff: "Medium", obj: "Maximize guest satisfaction and room occupancy rates." },
      { name: "Factory Simulator", gameplay: "factory_sim", desc: "Construct automated conveyor belts, robotic arms, and assembly packaging lines.", diff: "Medium", obj: "Automate manufacturing outputs to fulfill massive export contracts." },
      { name: "Train Simulator", gameplay: "train_sim_2d", desc: "Control locomotive throttle and brakes, switch railway points, and transport commuters.", diff: "Easy", obj: "Stop accurately at station platforms on strict timetable schedules." },
      { name: "Fishing Simulator", gameplay: "fishing_sim", desc: "Cast lines into tranquil lakes, balance line tension, and land trophy record bass.", diff: "Easy", obj: "Catch diverse freshwater and saltwater fish species for your aquarium." },
      { name: "Life Simulator", gameplay: "life_sim", desc: "Choose life pathways from education, career ladders, relationships, health, and hobbies.", diff: "Medium", obj: "Live a long, wealthy, and fulfilled virtual life from cradle to retirement." },
      { name: "Pet Simulator", gameplay: "pet_sim", desc: "Adopt lovable puppies and kittens, feed them treats, play fetch, and teach tricks.", diff: "Easy", obj: "Keep your virtual pet happy, healthy, and well-groomed." },
      { name: "Business Simulator", gameplay: "business_sim", desc: "Found a tech startup, pitch venture capitalists, hire engineers, and IPO on Wall Street.", diff: "Hard", obj: "Scale startup valuation to billion-dollar unicorn status." },
      { name: "City Simulator", gameplay: "city_sim_2d", desc: "Manage urban transit networks, public utility grids, and pollution indices.", diff: "Hard", obj: "Balance civic budget while maintaining citizen happiness and clean air." },
      { name: "Traffic Simulator", gameplay: "traffic_sim", desc: "Program traffic light timing cycles to clear vehicular gridlock at intersections.", diff: "Medium", obj: "Prevent highway traffic jams by optimizing automated signal timers." },
      { name: "Police Simulator", gameplay: "police_sim", desc: "Patrol downtown beats, respond to 911 dispatches, and secure neighborhood safety.", diff: "Medium", obj: "Protect citizens and solve criminal cases using evidence detective work." }
    ]
  },
  {
    category: "RPG Games",
    subcategory: "Story & Character Growth",
    type: "2D",
    is_2d: true,
    is_3d: false,
    engine: "Canvas2D",
    accentColor: "from-violet-600 to-purple-800",
    games: [
      { name: "2D RPG", gameplay: "rpg_2d", desc: "Classic top-down hero adventure with inventory, quest logs, townspeople, and dungeons.", diff: "Medium", obj: "Embark on an epic quest to vanquish the shadow overlord." },
      { name: "Turn-Based RPG", gameplay: "turn_based_rpg", desc: "Tactical party battle system selecting attacks, magic spells, items, and summons.", diff: "Medium", obj: "Defeat menacing boss fiends using elemental weakness exploitation." },
      { name: "Action RPG", gameplay: "action_rpg", desc: "Real-time hack and slash combat rolling through attacks, casting spells, and looting armor.", diff: "Hard", obj: "Conquer monster-infested catacombs and find legendary relic gear." },
      { name: "Dungeon RPG", gameplay: "dungeon_rpg", desc: "Grid-based dungeon crawl disarming floor spike traps and discovering secret chests.", diff: "Hard", obj: "Delve through 20 deadly dungeon floors to retrieve the sacred chalice." },
      { name: "Fantasy RPG", gameplay: "fantasy_rpg", desc: "Wizards, elves, and paladins uniting to defend the mystical enchanted woodland grove.", diff: "Medium", obj: "Master arcane spellbooks and defend the realm against dark sorcery." },
      { name: "Medieval RPG", gameplay: "medieval_rpg_2d", desc: "Humble blacksmith apprentice rising to become the kingdom's sworn protector.", diff: "Medium", obj: "Craft legendary weapons and prove chivalric valor across the realm." },
      { name: "Pixel RPG", gameplay: "pixel_rpg", desc: "Charming 16-bit retro nostalgia with chiptune melodies and emotive story arcs.", diff: "Easy", obj: "Explore retro kingdoms and converse with eccentric village folk." },
      { name: "Monster RPG", gameplay: "monster_rpg", desc: "Tame wild elemental creatures, train their battle abilities, and duel gym champions.", diff: "Medium", obj: "Capture and train all 100 wild battle companions to win the championship." },
      { name: "Magic RPG", gameplay: "magic_rpg", desc: "Enroll in an ancient academy of wizardry, brew potions, and duel rival spellcasters.", diff: "Medium", obj: "Master all four elemental schools of magic and pass the archmage trials." },
      { name: "Open-World 2D RPG", gameplay: "open_world_rpg_2d", desc: "Vast seamless top-down world exploring coastal docks, snowy peaks, and desert ruins.", diff: "Hard", obj: "Roam freely across boundless continents discovering emergent adventures." },
      { name: "Survival RPG", gameplay: "survival_rpg", desc: "RPG progression interwoven with hunger, thirst, weapon degradation, and sheltering.", diff: "Hard", obj: "Level up combat skills while hunting for food and crafting camp gear." },
      { name: "Cyberpunk RPG", gameplay: "cyberpunk_rpg_2d", desc: "Neon rain-soaked back alleys hacking corporate mainframes and upgrading cyberware.", diff: "Hard", obj: "Infiltrate megacorporation data fortresses to expose conspiracy networks." },
      { name: "Sci-Fi RPG", gameplay: "scifi_rpg_2d", desc: "Starship crew recruitment, planetary away-team missions, and xenobiology research.", diff: "Medium", obj: "Chart uncharted star systems and negotiate diplomatic alliances." },
      { name: "Horror RPG", gameplay: "horror_rpg_2d", desc: "Psychological narrative horror with branching sanity meters and cryptic hauntings.", diff: "Hard", obj: "Uncover the dark truth behind the village tragedy before losing your mind." }
    ]
  },
  {
    category: "Survival Games",
    subcategory: "Resourcefulness & Wilderness",
    type: "2D",
    is_2d: true,
    is_3d: false,
    engine: "Canvas2D",
    accentColor: "from-lime-600 to-green-700",
    games: [
      { name: "Zombie Survival", gameplay: "survival_zombie_2d", desc: "Scavenge canned food, craft wooden barricades, and fend off hungry walkers.", diff: "Hard", obj: "Survive as many days as possible in the post-apocalyptic ruins." },
      { name: "Wilderness Survival", gameplay: "wilderness_survival", desc: "Friction fire starting, flint tool knapping, pine bough shelters, and tracking game.", diff: "Medium", obj: "Survive deep in the untamed forest with primitive bushcraft skills." },
      { name: "Island Survival", gameplay: "island_survival", desc: "Shipwrecked survivor opening coconuts, purifying saltwater, and signaling rescue ships.", diff: "Medium", obj: "Build a raft or SOS beacon on a deserted tropical atoll." },
      { name: "Forest Survival", gameplay: "forest_survival", desc: "Chop trees, construct log cabins, collect berry bushels, and avoid predatory wolves.", diff: "Medium", obj: "Establish a cozy homestead in the woodland without freezing." },
      { name: "Desert Survival", gameplay: "desert_survival", desc: "Endure scorching daylight heat, find desert oases, and brave freezing nighttime sandstorms.", diff: "Hard", obj: "Cross the arid dunes while conserving precious canteen water." },
      { name: "Apocalypse Survival", gameplay: "apocalypse_survival", desc: "Nuclear winter wasteland collecting rad-away, wearing gas masks, and fighting raiders.", diff: "Hard", obj: "Scour irradiated bunker ruins to keep your survivor clan alive." },
      { name: "Monster Survival", gameplay: "monster_survival", desc: "Set bear traps, construct barbed trenches, and endure nightly assaults by chimera beasts.", diff: "Hard", obj: "Survive the siege of mythological predators until daybreak." },
      { name: "Night Survival", gameplay: "night_survival_2d", desc: "Torchlight perimeter defense where creeping horrors only dwell in dark shadow patches.", diff: "Medium", obj: "Maintain illumination towers around your survivor encampment." },
      { name: "Crafting Survival", gameplay: "crafting_survival", desc: "Deep recipe crafting tree turning raw stone and wood into forge kilns and steel plate.", diff: "Medium", obj: "Unlock all 100 crafting blueprints from primitive tools to steam engines." },
      { name: "Space Survival", gameplay: "space_survival_craft", desc: "Leaking airlocks, micrometeorite punctures, and solar panel repair on stranded shuttles.", diff: "Hard", obj: "Patch hull breaches and craft spare thruster coils to return home." }
    ]
  },
  {
    category: "Building Games",
    subcategory: "Construction & Creativity",
    type: "2D",
    is_2d: true,
    is_3d: false,
    engine: "Canvas2D",
    accentColor: "from-amber-500 to-stone-600",
    games: [
      { name: "Minecraft-style 2D Builder", gameplay: "voxel_builder_2d", desc: "Break and place dirt, stone, glass, and wood voxel blocks to construct custom dreams.", diff: "Easy", obj: "Mine raw materials and build whatever your imagination conceives." },
      { name: "City Builder", gameplay: "city_builder_grid", desc: "Grid blueprint layout connecting transit avenues, green parks, and high-density towers.", diff: "Medium", obj: "Construct an aesthetically pleasing and prosperous skyline." },
      { name: "Village Builder", gameplay: "village_builder", desc: "Quaint thatched-roof cottages, windmill grain mills, and stone bakeries for happy settlers.", diff: "Easy", obj: "Nurture a small hamlet into a joyful medieval settlement." },
      { name: "Castle Builder", gameplay: "castle_builder", desc: "Erect stone curtain walls, round bastions, arrow slits, and deep moats.", diff: "Medium", obj: "Engineer an impregnable medieval fortress on the mountain ridge." },
      { name: "House Builder", gameplay: "house_builder", desc: "Architectural blueprint room designer laying hardwood, wallpaper, and modern furniture.", diff: "Easy", obj: "Design and furnish modern dream homes with custom floor plans." },
      { name: "Factory Builder", gameplay: "factory_builder_grid", desc: "Optimize assembly throughput routing splitters, mergers, and smelting furnaces.", diff: "Hard", obj: "Build a spaghetti-free automated factory producing supercomputers." },
      { name: "Bridge Builder", gameplay: "bridge_builder", desc: "Structural truss engineering designing steel and wood bridges to support heavy freight.", diff: "Medium", obj: "Build cost-effective bridges that don't collapse under truck loads." },
      { name: "Train Track Builder", gameplay: "train_track_builder", desc: "Lay railway switches, tunnel through mountains, and connect industrial factories.", diff: "Medium", obj: "Connect all towns with efficient non-blocking railway networks." },
      { name: "Tower Builder", gameplay: "tower_builder", desc: "Drop swaying crane girders precisely to stack the tallest skyscraper into the clouds.", diff: "Easy", obj: "Stack tower floors with perfect balance to reach astronomical altitudes." },
      { name: "Empire Builder", gameplay: "empire_builder", desc: "Monument construction erecting pyramids, colosseums, and grand victory arches.", diff: "Hard", obj: "Unite disparate lands under a glorious golden empire." }
    ]
  },
  {
    category: "Board/Card Games",
    subcategory: "Tabletop Classics",
    type: "2D",
    is_2d: true,
    is_3d: false,
    engine: "Canvas2D",
    accentColor: "from-rose-500 to-red-700",
    games: [
      { name: "Chess", gameplay: "chess_game", desc: "The royal game of kings featuring pawns, knights, bishops, rooks, queen, and smart AI.", diff: "Hard", obj: "Checkmate the opposing king with tactical precision." },
      { name: "Checkers", gameplay: "checkers_game", desc: "Diagonal jumping and kinging capturing opposing pieces on the red-black checkerboard.", diff: "Medium", obj: "Capture or trap all opposing checker pieces." },
      { name: "Ludo", gameplay: "ludo_game", desc: "Roll the dice, guide 4 tokens out of base, and race around the cross board to home.", diff: "Easy", obj: "Be the first player to guide all 4 tokens into the central home triangle." },
      { name: "Snakes and Ladders", gameplay: "snakes_ladders", desc: "Classic 1-100 board climbing ladders of fortune and sliding down treacherous snakes.", diff: "Easy", obj: "Roll dice to reach square 100 first while avoiding snake heads." },
      { name: "Monopoly-style Game", gameplay: "monopoly_style", desc: "Buy prime real estate, build hotels, collect exorbitant rent, and avoid jail time.", diff: "Medium", obj: "Bankrupt your competitors by monopolizing color property groups." },
      { name: "Solitaire", gameplay: "solitaire_klondike", desc: "Klondike card patience sorting alternating colors and building foundation suits from Ace to King.", diff: "Easy", obj: "Sort all 52 cards onto the 4 foundation suit piles." },
      { name: "Blackjack", gameplay: "blackjack_21", desc: "Vegas 21 casino table hitting, standing, doubling down, and splitting against the dealer.", diff: "Medium", obj: "Beat the dealer's hand total without exceeding 21 points." },
      { name: "Poker", gameplay: "texas_poker", desc: "Texas Hold'em betting rounds, bluffing, reading tells, and assembling royal flushes.", diff: "Hard", obj: "Win chips by holding the best 5-card poker hand or bluffing opponents." },
      { name: "Uno-style Game", gameplay: "uno_style", desc: "Color and number matching playing Skip, Reverse, Draw Two, and Wild cards.", diff: "Easy", obj: "Discard all cards in your hand before your opponents." },
      { name: "Memory Cards", gameplay: "memory_cards_board", desc: "Concentration matching card grid uncovering matching animal and rune symbols.", diff: "Easy", obj: "Find all matching card pairs with fewest attempts." },
      { name: "Mahjong", gameplay: "mahjong_solitaire", desc: "Traditional Chinese tile matching removing free bamboo, character, and wind tiles.", diff: "Medium", obj: "Clear the multi-layered tile pyramid by pairing free identical tiles." },
      { name: "Carrom", gameplay: "carrom_board", desc: "Flick the heavy striker disc to pocket carrom men and the red Queen into corner pockets.", diff: "Medium", obj: "Pocket all your colored carrom pieces plus the Queen." },
      { name: "Battleship", gameplay: "battleship_game", desc: "Coordinate naval fleet grid guessing coordinates to sink aircraft carriers and subs.", diff: "Medium", obj: "Locate and sink the opponent's entire naval fleet before they sink yours." },
      { name: "Connect Four", gameplay: "connect_four_board", desc: "Gravity disc drop strategy blocking diagonals and claiming center columns.", diff: "Easy", obj: "Connect four colored discs in a horizontal, vertical, or diagonal row." }
    ]
  },
  {
    category: "3D Shooter Games",
    subcategory: "First & Third Person 3D",
    type: "3D",
    is_2d: false,
    is_3d: true,
    engine: "ThreeJS",
    accentColor: "from-red-600 to-rose-700",
    games: [
      { name: "First-Person Shooter", gameplay: "fps_3d", desc: "3D FPS view with mouse-look camera, crosshairs, recoil weapons, and enemy patrol drones.", diff: "Hard", obj: "Infiltrate the enemy compound and neutralize hostile combatants." },
      { name: "Third-Person Shooter", gameplay: "tps_3d", desc: "Over-the-shoulder tactical shooter with crouch cover, roll dodges, and precision rifles.", diff: "Hard", obj: "Flank enemy positions and clear the industrial sector." },
      { name: "Tactical Shooter", gameplay: "tactical_shooter_3d", desc: "Slow, methodical room clearing using flashbangs, laser sights, and precision headshots.", diff: "Extreme", obj: "Breach rooms and eliminate terror cells without collateral damage." },
      { name: "Zombie Shooter", gameplay: "zombie_shooter_3d", desc: "Nighttime cemetery overrun with 3D shambling zombies, pump shotguns, and muzzle flashes.", diff: "Medium", obj: "Survive waves of 3D zombies with limited ammunition." },
      { name: "Alien Shooter", gameplay: "alien_shooter_3d", desc: "Derelict spaceship corridor combat against scuttling xenomorphs on ceilings and vents.", diff: "Hard", obj: "Purge alien nests using flamethrowers and pulse carbines." },
      { name: "Military Shooter", gameplay: "military_shooter_3d", desc: "Desert outpost defense using M4 carbines, sniper towers, and ammo supply crates.", diff: "Hard", obj: "Hold the forward operating base against insurgent vehicle convoys." },
      { name: "Space Shooter", gameplay: "space_shooter_3d", desc: "Zero-G interior starship combat floating through fractured decompression chambers.", diff: "Hard", obj: "Neutralize pirate boarding pods in zero-gravity space." },
      { name: "Robot Shooter", gameplay: "robot_shooter_3d", desc: "Automated factory floor blasting haywire assembly droids and heavy bipedal sentinels.", diff: "Medium", obj: "Disable rogue factory robots with EMP and plasma rifle blasts." },
      { name: "Monster Shooter", gameplay: "monster_shooter_3d", desc: "Hunting gargantuan beasts in ancient temple ruins using heavy rocket launchers.", diff: "Hard", obj: "Target weak-point glow nodes on colossal mythological monsters." },
      { name: "Survival Shooter", gameplay: "survival_shooter_3d", desc: "Desolate ruined town balancing bullet count, weapon jamming, and scavenged bandages.", diff: "Extreme", obj: "Loot military caches and survive in a cutthroat battle zone." },
      { name: "Arena Shooter", gameplay: "arena_shooter_3d", desc: "Quake-style high-speed rocket jumping, railgun flick shots, and bounce pads.", diff: "Extreme", obj: "Dominate the neon floating arena with fast movement and weapon pickups." },
      { name: "Sniper Game", gameplay: "sniper_game_3d", desc: "Long-range ballistic calculation adjusting for distance drop, windage, and target lead.", diff: "Hard", obj: "Eliminate high-value targets across 800-meter canyon valleys." },
      { name: "Stealth Shooter", gameplay: "stealth_shooter_3d", desc: "Shadow illumination meters, silent suppressed pistols, and security camera evasion.", diff: "Hard", obj: "Complete the mission undetected without raising single alarm sirens." },
      { name: "Wave Shooter", gameplay: "wave_shooter_3d", desc: "Stationary defense bunker mowing down progressive 3D enemy waves with miniguns.", diff: "Medium", obj: "Hold the perimeter line against 15 increasingly intense enemy waves." },
      { name: "Battle Royale", gameplay: "battle_royale_3d", desc: "Skydiving into an island arena, scavenging weapon chests, and evading the enclosing storm.", diff: "Extreme", obj: "Outlast all rival combatants to be the last survivor standing." }
    ]
  },
  {
    category: "3D Horror Games",
    subcategory: "Atmospheric 3D Terror",
    type: "3D",
    is_2d: false,
    is_3d: true,
    engine: "ThreeJS",
    accentColor: "from-zinc-800 to-red-950",
    games: [
      { name: "Haunted House", gameplay: "haunted_house_3d", desc: "First-person exploration of a creaky Victorian manor where doors slam shut on their own.", diff: "Hard", obj: "Find ancient ritual keys while avoiding the weeping apparition." },
      { name: "Haunted Hospital", gameplay: "haunted_hospital_3d", desc: "Stretcher-strewn corridors with blood-stained tile and flickering fluorescent tubes.", diff: "Hard", obj: "Restore backup power to the morgue elevators to escape." },
      { name: "Haunted School", gameplay: "haunted_school_3d", desc: "Echoing locker hallways and locked science labs haunted by previous pupils.", diff: "Medium", obj: "Recover student occult relics and avoid the shadow headmaster." },
      { name: "Abandoned Asylum", gameplay: "asylum_3d", desc: "Padded cells, rusted hydrotherapy baths, and chilling distant screams.", diff: "Hard", obj: "Uncover doctor audio logs and find the rusted exit gate latch." },
      { name: "Ghost Investigation", gameplay: "ghost_investigation_3d", desc: "Equip EMF meters, thermo cams, and spirit boxes to determine spectral classifications.", diff: "Medium", obj: "Gather ghost evidence without letting your sanity drop to zero." },
      { name: "Zombie Apocalypse", gameplay: "zombie_apocalypse_3d", desc: "Dark rainy city streets illuminated only by burning car wrecks and zombie eyes.", diff: "Hard", obj: "Sprint from safehouse to safehouse across a devastated city." },
      { name: "Monster Escape", gameplay: "monster_escape_3d", desc: "A blind creature with hypersensitive hearing stalks you through industrial boilers.", diff: "Hard", obj: "Crouch-walk and throw bottles to distract the stalking beast." },
      { name: "Psychological Horror", gameplay: "psycho_horror_3d", desc: "Non-Euclidean rooms that loop, paintings that morph, and shifting architecture.", diff: "Hard", obj: "Distinguish hallucination from reality and escape the looping corridor." },
      { name: "Survival Horror", gameplay: "survival_horror_3d", desc: "Classic tank or modern controls, limited ammo, ink ribbon saves, and wooden boards.", diff: "Hard", obj: "Manage inventory slots and survive horrific bio-weapon monstrosities." },
      { name: "Underground Horror", gameplay: "underground_horror_3d", desc: "Subterranean catacombs flooded with knee-deep murky water and lurking amphibious beasts.", diff: "Hard", obj: "Wade through flooded sewers with a dying flashlight battery." },
      { name: "Backrooms-style Game", gameplay: "backrooms_3d", desc: "Endless mono-yellow rooms, buzzing fluorescent lights, and moist carpet smells.", diff: "Medium", obj: "Noclip through liminal spaces to locate Exit Level 0." },
      { name: "Paranormal Investigation", gameplay: "paranormal_3d", desc: "Set video tripods and sound sensors in abandoned cabins to record paranormal proof.", diff: "Medium", obj: "Capture spectral entity photographic evidence and flee safely." },
      { name: "Demon Hunting", gameplay: "demon_hunting_3d", desc: "Trace salt circles, chant Latin incantations, and banish demonic entities to the pit.", diff: "Hard", obj: "Banish ancient demonic lords back into the underworld rift." },
      { name: "Haunted Forest", gameplay: "haunted_forest_3d", desc: "Dense midnight birch forest with a flashlight collecting 8 mysterious parchment pages.", diff: "Hard", obj: "Collect all 8 paper notes before the slender entity catches you." },
      { name: "Horror Maze", gameplay: "horror_maze_3d", desc: "Towering hedges shrouded in heavy volumetric fog with a relentless beast on your tail.", diff: "Hard", obj: "Navigate the shifting hedge maze and reach the sanctuary tower." },
      { name: "Night Survival", gameplay: "night_survival_3d", desc: "Defend an isolated cabin from dusk till dawn against creatures clawing at window shutters.", diff: "Hard", obj: "Keep generator fueled to maintain exterior perimeter floodlights." }
    ]
  },
  {
    category: "3D Racing Games",
    subcategory: "Motorsport & Driving 3D",
    type: "3D",
    is_2d: false,
    is_3d: true,
    engine: "ThreeJS",
    accentColor: "from-cyan-600 to-blue-700",
    games: [
      { name: "Car Racing", gameplay: "car_racing_3d", desc: "3D sports car racing on asphalt circuits with tire smoke, rpm gauges, and AI rivals.", diff: "Medium", obj: "Set the fastest lap time and win the 3D Grand Prix." },
      { name: "Formula Racing", gameplay: "formula_racing_3d", desc: "High-downforce open-wheel racing at 300 km/h hugging apex curbs and chicanes.", diff: "Hard", obj: "Brake at precise markers to execute flawless qualifying laps." },
      { name: "Street Racing", gameplay: "street_racing_3d", desc: "Underground midnight city street racing dodging civilian traffic with nitro boosts.", diff: "Medium", obj: "Win pink slips against rival underground street racers." },
      { name: "Drift Racing", gameplay: "drift_racing_3d", desc: "Togue mountain touge drifting scoring points for speed, angle, and proximity to barriers.", diff: "Hard", obj: "Initiate handbrake drifts and sustain high slip angles through S-curves." },
      { name: "Rally Racing", gameplay: "rally_racing_3d", desc: "Dirt, gravel, and snow stages listening to co-driver pace notes over jumps and crests.", diff: "Hard", obj: "Drift through dirt hairpins without sliding off mountain cliffs." },
      { name: "Off-Road Racing", gameplay: "offroad_racing_3d", desc: "Baja 1000 dune buggies leaping massive sand dunes and tearing through scrub brush.", diff: "Medium", obj: "Race across desert wilderness checkpoints in custom Trophy Trucks." },
      { name: "Kart Racing", gameplay: "kart_racing_3d", desc: "Fun vibrant 3D kart circuits with powerup cubes, turbo drift sparks, and loop-de-loops.", diff: "Easy", obj: "Chain mini-turbo drift boosts to stay in first place." },
      { name: "Motorcycle Racing", gameplay: "motorcycle_racing_3d", desc: "Knee-down leaning superbike racing on international GP circuits.", diff: "Hard", obj: "Balance high lean angles without low-siding into gravel traps." },
      { name: "Truck Racing", gameplay: "truck_racing_3d", desc: "Five-ton racing semi-trucks thundering around tight road courses with water-cooled brakes.", diff: "Medium", obj: "Manhandle roaring heavy diesel race trucks across the finish line." },
      { name: "Bus Racing", gameplay: "bus_racing_3d", desc: "Hilarious demolition racing piloting long articulated city buses on obstacle tracks.", diff: "Easy", obj: "Bash through barriers and out-muscle rival buses to victory." },
      { name: "Boat Racing", gameplay: "boat_racing_3d", desc: "Offshore powerboat wave jumping through ocean swells and coastal coves.", diff: "Medium", obj: "Skip over ocean waves at 120 knots and clear marker buoys." },
      { name: "Jet Ski Racing", gameplay: "jetski_racing_3d", desc: "Agile personal watercraft performing barrel rolls off ramps and dodging water obstacles.", diff: "Easy", obj: "Carve through water wakes and perform aerial stunts." },
      { name: "Air Racing", gameplay: "air_racing_3d", desc: "Propeller aerobatic monoplanes racing through inflatable pylon slaloms.", diff: "Hard", obj: "Fly knife-edge between pylons without wing clipping penalties." },
      { name: "Space Racing", gameplay: "space_racing_3d", desc: "F-Zero style magnetic track antigrav hovercraft racing through neon orbital rings.", diff: "Hard", obj: "Hit boost pads and reach Mach 2 on zero-gravity tracks." },
      { name: "Monster Truck Racing", gameplay: "monster_truck_3d", desc: "Crush stadium cars, perform wheelies, and fly 40 feet in the air off stadium jumps.", diff: "Medium", obj: "Perform massive stadium freestyle air stunts." },
      { name: "Police Chase", gameplay: "police_chase_3d", desc: "Evade pursuit helicopters, spike strips, and armored swat vans in high-speed 3D chase.", diff: "Hard", obj: "Lose your police wanted level by executing reckless evasive maneuvers." },
      { name: "Open-World Driving", gameplay: "open_world_driving_3d", desc: "Cruise through vast scenic 3D coastal highways, city streets, and mountain passes freely.", diff: "Easy", obj: "Explore the expansive 3D highway network at your leisure." }
    ]
  },
  {
    category: "3D Fighting Games",
    subcategory: "Arena & Hand-to-Hand 3D",
    type: "3D",
    is_2d: false,
    is_3d: true,
    engine: "ThreeJS",
    accentColor: "from-orange-600 to-red-700",
    games: [
      { name: "Martial Arts", gameplay: "martial_arts_3d", desc: "3D dojo combat with 8-way run movement, sidestep dodges, and high/low strike mixups.", diff: "Hard", obj: "Execute crisp martial arts katas and knock out rival masters." },
      { name: "Boxing", gameplay: "boxing_3d", desc: "Sweet science of boxing throwing jabs, hooks, uppercuts, slips, and weaving under blows.", diff: "Medium", obj: "Land devastating counter-punches and score a championship KO." },
      { name: "MMA", gameplay: "mma_3d", desc: "Octagon cage fighting blending Muay Thai clinch knees with ground-and-pound submissions.", diff: "Hard", obj: "Execute takedowns and lock in tap-out armbar submissions." },
      { name: "Karate", gameplay: "karate_3d", desc: "Shotokan karate Kumite scoring points with lightning reverse punches and sweep kicks.", diff: "Medium", obj: "Score Ippon points with disciplined explosive karate strikes." },
      { name: "Kung Fu", gameplay: "kungfu_3d", desc: "Wushu animal styles: Crane evasion, Tiger claws, Snake strikes, and Drunken boxing.", diff: "Hard", obj: "Flow seamlessly between Kung Fu animal forms to defeat opponents." },
      { name: "Street Fighting", gameplay: "street_fighting_3d", desc: "Back-alley brawl throwing haymakers, trash cans, and headbutts in an urban setting.", diff: "Medium", obj: "Become the undisputed king of underground street brawls." },
      { name: "Sword Fighting", gameplay: "sword_fighting_3d", desc: "3D weapon clashing, parrying steel blades, directional guards, and disarming strikes.", diff: "Hard", obj: "Parry opponent blade thrusts and deliver decisive sword cuts." },
      { name: "Samurai Combat", gameplay: "samurai_combat_3d", desc: "Cinematic duel at bamboo shrine practicing Iaijutsu quick-draw lethal slashes.", diff: "Hard", obj: "Draw your katana at the exact split-second flash for an instant victory." },
      { name: "Knight Combat", gameplay: "knight_combat_3d", desc: "Full plate armor battle with longswords, maces, shields, and crushing pommel strikes.", diff: "Hard", obj: "Batter through opponent knight defenses with shield bashes." },
      { name: "Superhero Fighting", gameplay: "superhero_fighting_3d", desc: "High-flying superhuman clashes throwing cars, hurling plasma, and cratering the ground.", diff: "Medium", obj: "Harness super strength and flight to defeat cosmic villain threats." },
      { name: "Robot Fighting", gameplay: "robot_fighting_3d", desc: "Heavy hydraulic mechanized gladiators smashing gears, hydraulic fluid, and armor plating.", diff: "Hard", obj: "Sunder enemy battle mechs with motorized spinning titanium hammers." },
      { name: "Monster Fighting", gameplay: "monster_fighting_3d", desc: "Colossal mythical creatures battling on mountaintops with elemental breath weapons.", diff: "Medium", obj: "Unleash primal fury to claim dominion as alpha apex predator." }
    ]
  },
  {
    category: "3D Adventure Games",
    subcategory: "Exploration & Discovery 3D",
    type: "3D",
    is_2d: false,
    is_3d: true,
    engine: "ThreeJS",
    accentColor: "from-amber-600 to-emerald-600",
    games: [
      { name: "Treasure Hunting", gameplay: "treasure_hunting_3d", desc: "Explore ancient tomb chambers solving sun-dial stone puzzles and finding gold idols.", diff: "Medium", obj: "Recover lost golden artifacts from dangerous trap-laden ruins." },
      { name: "Jungle Adventure", gameplay: "jungle_adventure_3d", desc: "Swing on lianas, leap across jungle canopy trees, and discover lost Aztec ziggurats.", diff: "Medium", obj: "Trek through uncharted rainforests to unearth lost civilizations." },
      { name: "Island Adventure", gameplay: "island_adventure_3d", desc: "Explore tropical coves, scale volcanic peaks, and uncover hidden pirate grottoes.", diff: "Easy", obj: "Map every secret corner of the mysterious volcanic paradise." },
      { name: "Desert Adventure", gameplay: "desert_adventure_3d", desc: "Sand-glide across endless glowing orange dunes toward enigmatic glowing pyramids.", diff: "Medium", obj: "Journey toward the distant monolith through shifting sandstorms." },
      { name: "Mountain Adventure", gameplay: "mountain_adventure_3d", desc: "Ice climbing glacial precipices, setting pitons, and surviving blizzard avalanches.", diff: "Hard", obj: "Summit the highest forbidden peak in the mountain range." },
      { name: "Underwater Adventure", gameplay: "underwater_adventure_3d", desc: "Dive with underwater propulsion vehicles through bioluminescent coral reefs and trenches.", diff: "Easy", obj: "Photograph exotic deep-sea marine life and sunken galleon relics." },
      { name: "Space Adventure", gameplay: "space_adventure_3d", desc: "Explore abandoned orbital space stations with EVA jetpack thrusters and magnetic boots.", diff: "Medium", obj: "Investigate anomalies aboard the silent deep-space orbital platform." },
      { name: "Archaeology Adventure", gameplay: "archaeology_3d", desc: "Brush sediment away from fossil beds and decipher hieroglyphic stone cartouches.", diff: "Medium", obj: "Piece together ancient historical timelines from excavated artifacts." },
      { name: "Pirate Adventure", gameplay: "pirate_adventure_3d", desc: "Sail 3D merchant sloops across Caribbean seas, dig up X-marked treasure, and battle kraken.", diff: "Medium", obj: "Become a legendary pirate captain feared across the seven seas." },
      { name: "Medieval Adventure", gameplay: "medieval_adventure_3d", desc: "Explore sprawling castle keeps, bustling town squares, and haunted dragon caves.", diff: "Medium", obj: "Undertake heroic quests for the king across the medieval kingdom." },
      { name: "Fantasy Adventure", gameplay: "fantasy_adventure_3d", desc: "Ride majestic winged creatures through floating sky islands and shimmering crystals.", diff: "Easy", obj: "Restore harmony to the fractured fantasy sky archipelago." },
      { name: "Sci-Fi Adventure", gameplay: "scifi_adventure_3d", desc: "Investigate Dyson sphere superstructures and alien monolith beacons across the galaxy.", diff: "Hard", obj: "Unlock the secrets of an ancient precursor alien civilization." },
      { name: "Open-World Adventure", gameplay: "open_world_adventure_3d", desc: "Seamless 3D world with paragliding, rock climbing, horseback riding, and campfires.", diff: "Medium", obj: "Roam across boundless landscapes and forge your own adventure." }
    ]
  },
  {
    category: "3D RPG",
    subcategory: "Epic Quests & Heroes 3D",
    type: "3D",
    is_2d: false,
    is_3d: true,
    engine: "ThreeJS",
    accentColor: "from-purple-600 to-indigo-700",
    games: [
      { name: "Fantasy RPG", gameplay: "fantasy_rpg_3d", desc: "Third-person heroic fantasy casting fireballs, equipping mythic armor, and slaying drakes.", diff: "Hard", obj: "Slay the ancient dragon threatening the kingdom of Eldoria." },
      { name: "Open-World RPG", gameplay: "open_world_rpg_3d", desc: "Explore sprawling landscapes, accept tavern quests, and build your character legend.", diff: "Hard", obj: "Complete main storyline quests while discovering hidden faction guildlines." },
      { name: "Medieval RPG", gameplay: "medieval_rpg_3d", desc: "Grounded historical medieval roleplaying with sword masteries, alchemy, and archery.", diff: "Hard", obj: "Rise from an impoverished peasant to a renowned feudal lord." },
      { name: "Action RPG", gameplay: "action_rpg_3d", desc: "Fast-paced hack and slash combat dodging boss area attacks and looting legendary gear.", diff: "Hard", obj: "Vanquish demonic dungeon bosses and collect legendary set equipment." },
      { name: "Dungeon RPG", gameplay: "dungeon_rpg_3d", desc: "Explore 3D dungeon corridors, disarm wall dart traps, and defeat skeleton guards.", diff: "Medium", obj: "Conquer the depths of the Forgotten Under-crypt." },
      { name: "MMORPG-style Game", gameplay: "mmorpg_style_3d", desc: "Simulated online world with guild chat, raid bosses, auction houses, and mount pets.", diff: "Hard", obj: "Assemble 10-player raid groups to topple colossal raid dungeon bosses." },
      { name: "Sci-Fi RPG", gameplay: "scifi_rpg_3d", desc: "Futuristic galactic roleplay with plasma blasters, cybernetic implants, and alien crew.", diff: "Hard", obj: "Save the galactic confederacy from a rogue AI hivemind." },
      { name: "Cyberpunk RPG", gameplay: "cyberpunk_rpg_3d", desc: "Neon megacity night exploration installing neural cyberdecks and fighting corpo security.", diff: "Hard", obj: "Hack corporate mainframe databanks to expose city corruption." },
      { name: "Samurai RPG", gameplay: "samurai_rpg_3d", desc: "Feudal Japan open realm upholding the bushido code across cherry blossom valleys.", diff: "Hard", obj: "Liberate provinces from occupying warlord garrisons." },
      { name: "Wizard RPG", gameplay: "wizard_rpg_3d", desc: "Hogwarts-style spell school learning incantations, transfigurations, and brewing elixirs.", diff: "Medium", obj: "Master the 7 forbidden arcane arts in the grand wizard academy." },
      { name: "Monster RPG", gameplay: "monster_rpg_3d", desc: "Track, hunt, and study colossal wyverns in lush 3D ecosystem biomes.", diff: "Hard", obj: "Hunt apex monsters and craft superior weapon armaments from their scales." },
      { name: "Survival RPG", gameplay: "survival_rpg_3d", desc: "Survive harsh wilderness elements while leveling up archery, woodcutting, and magic.", diff: "Hard", obj: "Build a fortified stronghold while leveling character survivability." },
      { name: "Story-Based RPG", gameplay: "story_rpg_3d", desc: "Deep branching narrative choices with moral dilemmas altering the fate of the realm.", diff: "Medium", obj: "Navigate complex character dialogue to determine the fate of nations." }
    ]
  },
  {
    category: "Open-World Games",
    subcategory: "Boundless Sandbox Worlds",
    type: "3D",
    is_2d: false,
    is_3d: true,
    engine: "ThreeJS",
    accentColor: "from-blue-500 to-indigo-600",
    games: [
      { name: "Open-World City", gameplay: "open_world_city", desc: "Massive 3D metropolis with pedestrian crowds, traffic systems, taxis, and skyscrapers.", diff: "Medium", obj: "Drive sports cars and explore every district of the living metropolis." },
      { name: "Open-World Crime Game", gameplay: "open_world_crime", desc: "Rise through the underworld ranks pulling off bank heists and evading police cordons.", diff: "Hard", obj: "Execute high-profile syndicate operations and build a criminal empire." },
      { name: "Open-World Survival", gameplay: "open_world_survival_3d", desc: "Boundless procedural wilderness scavenging resources, hunting wildlife, and building bases.", diff: "Hard", obj: "Survive and thrive in an untamed open-world frontier." },
      { name: "Open-World RPG", gameplay: "open_world_rpg_game", desc: "Boundless fantasy horizon with hundreds of landmarks, dungeons, and hidden shrines.", diff: "Hard", obj: "Journey to all four corners of the continent completing legendary quests." },
      { name: "Open-World Racing", gameplay: "open_world_racing_game", desc: "Hundreds of miles of open roads, speed traps, drift zones, and car festivals.", diff: "Medium", obj: "Dominate street racing championships across the entire open map." },
      { name: "Open-World Adventure", gameplay: "open_world_adventure_game", desc: "Climb any mountain, sail any river, and glide through canyons on custom gliders.", diff: "Medium", obj: "Discover every ancient mystery hidden across the open world." },
      { name: "Open-World Zombie Game", gameplay: "open_world_zombie", desc: "Quarantined county overrun by millions of infected where nowhere is truly safe.", diff: "Hard", obj: "Fortify safe zones and rescue scattered survivor communities." },
      { name: "Open-World Fantasy", gameplay: "open_world_fantasy_game", desc: "Magical realm populated by centaurs, griffins, enchanted castles, and floating cities.", diff: "Medium", obj: "Ride across the mythical kingdom defending villagers from rogue sorcerers." },
      { name: "Open-World Sci-Fi", gameplay: "open_world_scifi_game", desc: "Exoplanet colony with terraforming stations, alien ruins, and rover expeditions.", diff: "Hard", obj: "Terraform the alien wilderness into a flourishing human habitat." },
      { name: "Open-World Pirate Game", gameplay: "open_world_pirate", desc: "Vast archipelago of tropical islands, naval battles, tavern singing, and burried loot.", diff: "Medium", obj: "Rule the Caribbean waves as the supreme pirate admiral." },
      { name: "Open-World Military Game", gameplay: "open_world_military", desc: "Combined arms warzone operating helicopters, tanks, and APCs in tactical operations.", diff: "Hard", obj: "Capture hostile military bases and secure contested territory." },
      { name: "Open-World Farming Game", gameplay: "open_world_farming", desc: "Expansive agrarian county managing massive farm fields, combines, and livestock ranches.", diff: "Easy", obj: "Cultivate hundreds of acres of farmland across the open countryside." }
    ]
  },
  {
    category: "3D Simulation",
    subcategory: "Vehicles & Life Simulations 3D",
    type: "3D",
    is_2d: false,
    is_3d: true,
    engine: "ThreeJS",
    accentColor: "from-sky-600 to-cyan-600",
    games: [
      { name: "Flight Simulator", gameplay: "flight_sim_3d", desc: "Full 3D cockpit flight physics with elevator trim, rudder pedals, thrust, and runways.", diff: "Hard", obj: "Take off from runway, fly designated waypoint route, and land smoothly." },
      { name: "Train Simulator", gameplay: "train_sim_3d", desc: "3D cab locomotive operation managing air brakes, horn signals, and rail switches.", diff: "Medium", obj: "Transport freight safely along scenic mountain rail lines." },
      { name: "Bus Simulator", gameplay: "bus_sim_3d", desc: "Drive municipal transit buses, kneel doors for passengers, collect fares, and observe traffic.", diff: "Medium", obj: "Complete scheduled city bus transit routes with high passenger comfort." },
      { name: "Truck Simulator", gameplay: "truck_sim_3d", desc: "Long-haul European and American 18-wheeler cargo deliveries across highways.", diff: "Medium", obj: "Deliver fragile cargo on schedule across cross-country highways." },
      { name: "Car Simulator", gameplay: "car_sim_3d", desc: "Realistic manual transmission car physics with clutch bite point and parallel parking.", diff: "Medium", obj: "Master defensive driving and pass advanced driver license tests." },
      { name: "Farming Simulator", gameplay: "farming_sim_3d", desc: "Operate 3D tractors with seed drill attachments, harvesters, and grain trailers.", diff: "Easy", obj: "Harvest golden wheat fields and deliver grain to silos." },
      { name: "Construction Simulator", gameplay: "construction_sim_3d", desc: "Operate hydraulic excavators, tower cranes, and concrete mixer trucks on job sites.", diff: "Hard", obj: "Dig building foundations and hoist structural steel beams into position." },
      { name: "City Simulator", gameplay: "city_sim_3d", desc: "3D city planning laying water mains, electric substations, and highway flyovers.", diff: "Hard", obj: "Build a sustainable 3D city with low pollution and thriving economy." },
      { name: "Airport Simulator", gameplay: "airport_sim_3d", desc: "Drive pushback tugs, baggage loaders, and follow-me cars around busy airport aprons.", diff: "Medium", obj: "Turn around parked jumbo jets on time at gate terminals." },
      { name: "Hospital Simulator", gameplay: "hospital_sim_3d", desc: "3D emergency ward triage directing ambulances, surgeons, and patient beds.", diff: "Hard", obj: "Manage emergency room resources during a major health crisis." },
      { name: "Police Simulator", gameplay: "police_sim_3d", desc: "Patrol downtown 3D districts in cruiser, conduct traffic stops, and preserve public peace.", diff: "Medium", obj: "Uphold the law and investigate traffic incidents fairly." },
      { name: "Firefighter Simulator", gameplay: "firefighter_sim_3d", desc: "Drive fire engine trucks, connect fire hoses to hydrants, and rescue trapped victims.", diff: "Hard", obj: "Extinguish raging structure blazes and rescue building occupants." },
      { name: "Restaurant Simulator", gameplay: "restaurant_sim_3d", desc: "Manage 3D dining rooms, seat VIP guests, organize waitstaff, and design menus.", diff: "Medium", obj: "Run a Michelin-star restaurant with impeccable dining service." },
      { name: "Hotel Simulator", gameplay: "hotel_sim_3d", desc: "Design 3D luxury hotel lobbies, rooftop infinity pools, and penthouse suites.", diff: "Medium", obj: "Deliver 5-star hospitality service to elite international travelers." },
      { name: "Factory Simulator", gameplay: "factory_sim_3d", desc: "Configure 3D automated robotic production cells, conveyor belts, and logistics drones.", diff: "Hard", obj: "Maximize factory production output while minimizing downtime." },
      { name: "Space Station Simulator", gameplay: "space_station_sim_3d", desc: "Manage modular ISS-style orbital laboratories with solar panels and docking adapters.", diff: "Hard", obj: "Keep station life support systems balanced in deep space orbit." },
      { name: "School Simulator", gameplay: "school_sim_3d", desc: "Construct 3D campus grounds, libraries, sports stadiums, and lecture amphitheaters.", diff: "Medium", obj: "Develop a prestigious university campus known for research excellence." },
      { name: "Life Simulator", gameplay: "life_sim_3d", desc: "3D avatar living an immersive life: furnish apartments, pursue hobbies, and make friends.", diff: "Easy", obj: "Live a joyful and balanced virtual life in a cozy 3D neighborhood." }
    ]
  },
  {
    category: "3D Survival",
    subcategory: "Harsh Environments 3D",
    type: "3D",
    is_2d: false,
    is_3d: true,
    engine: "ThreeJS",
    accentColor: "from-emerald-700 to-teal-800",
    games: [
      { name: "Zombie Survival", gameplay: "zombie_survival_3d", desc: "Build wooden fortresses, craft spiked defenses, and shoot infected mutants in 3D.", diff: "Hard", obj: "Survive day and night cycles against evolving zombie variants." },
      { name: "Island Survival", gameplay: "island_survival_3d", desc: "Stranded on an uncharted 3D tropical island gathering driftwood, spearfishing, and crafting.", diff: "Medium", obj: "Construct beach shelters and forge survival tools from island flora." },
      { name: "Forest Survival", gameplay: "forest_survival_3d", desc: "Deep pine forest survival chopping 3D trees, tracking deer, and crafting longbows.", diff: "Medium", obj: "Thrive in the wilderness while avoiding ravenous bear attacks." },
      { name: "Ocean Survival", gameplay: "ocean_survival_3d", desc: "Expand a tiny wooden raft in the middle of a vast ocean using a plastic debris hook.", diff: "Medium", obj: "Expand your floating raft and fend off circling sharks." },
      { name: "Desert Survival", gameplay: "desert_survival_3d", desc: "Survive brutal sun exposure, seek shade in canyon caves, and search for underground water.", diff: "Hard", obj: "Traverse the scorching desert expanse without succumbing to heatstroke." },
      { name: "Arctic Survival", gameplay: "arctic_survival_3d", desc: "Freezing blizzard conditions building snow igloos, hunting seals, and keeping warm.", diff: "Hard", obj: "Battle hypothermia and survive the endless arctic polar night." },
      { name: "Dinosaur Survival", gameplay: "dino_survival_3d", desc: "Prehistoric island inhabited by aggressive T-Rex, raptors, and pterodactyls.", diff: "Hard", obj: "Survive among apex prehistoric predators using crafted tranquilizers." },
      { name: "Monster Survival", gameplay: "monster_survival_3d", desc: "Gothic dark world hunting cryptids and horrific mythical predators.", diff: "Hard", obj: "Set monster traps and survive night ambushes in the ruins." },
      { name: "Alien Survival", gameplay: "alien_survival_3d", desc: "Crashed on an alien world with toxic atmospheres, bio-luminescent plants, and strange beasts.", diff: "Hard", obj: "Synthesize oxygen filters and repair your escape shuttle." },
      { name: "Apocalypse Survival", gameplay: "apocalypse_survival_3d", desc: "Ash-covered ruined earth scavenging abandoned supermarkets and fighting scavengers.", diff: "Hard", obj: "Establish a self-sufficient underground bunker shelter." },
      { name: "Underground Survival", gameplay: "underground_survival_3d", desc: "Deep cavern network mining crystals, building underground outposts, and fighting cave bugs.", diff: "Medium", obj: "Mine valuable ore in dark subterranean caverns." },
      { name: "Space Survival", gameplay: "space_survival_3d", desc: "Drifting in an EVA suit repairing thruster manifolds outside a crippled space station.", diff: "Hard", obj: "Conserve oxygen and jetpack propellant while fixing hull breaches." },
      { name: "Multiplayer Survival", gameplay: "multiplayer_survival_3d", desc: "Collaborate with squadmates to build massive bases and defend against rival clans.", diff: "Hard", obj: "Build an unraidable clan fortress with your teammates." }
    ]
  },
  {
    category: "Dinosaur Games",
    subcategory: "Prehistoric Jurassic Era",
    type: "3D",
    is_2d: false,
    is_3d: true,
    engine: "ThreeJS",
    accentColor: "from-green-600 to-lime-700",
    games: [
      { name: "Dinosaur Survival", gameplay: "dino_survival_jurassic", desc: "Survive in primeval jungles among velociraptors, triceratops, and tyrannosaurs.", diff: "Hard", obj: "Avoid being devoured by apex Jurassic predators." },
      { name: "Dinosaur Hunting", gameplay: "dino_hunting", desc: "Big-game hunter armed with high-caliber rifles tracking prehistoric giants.", diff: "Hard", obj: "Track dinosaur footprints and take down designated targets safely." },
      { name: "Dinosaur Park", gameplay: "dino_park_builder", desc: "Build electric enclosures, hatch cloned dinosaur embryos, and entertain park tourists.", diff: "Medium", obj: "Run a profitable prehistoric park without containment breaches." },
      { name: "Dinosaur Simulator", gameplay: "dino_simulator", desc: "Play as a ferocious Tyrannosaurus Rex stomping through forests and hunting prey.", diff: "Easy", obj: "Roar, hunt, and dominate the prehistoric jungle as a T-Rex." },
      { name: "Dinosaur Racing", gameplay: "dino_racing", desc: "Mount agile raptors and gallimimus dinosaurs in competitive jungle race tracks.", diff: "Medium", obj: "Saddle up your dinosaur steed and outrun other riders." },
      { name: "Dinosaur Battle", gameplay: "dino_battle", desc: "Colosseum arena battles pitting Spinosaurus against T-Rex in epic clashes.", diff: "Medium", obj: "Command prehistoric beasts in gladiator battle spectacles." },
      { name: "Jurassic Adventure", gameplay: "jurassic_adventure", desc: "Explore ancient volcanic islands uncovering amber fossils and secret dinosaur nests.", diff: "Easy", obj: "Explore lush Jurassic valleys and discover rare dinosaur species." },
      { name: "Dinosaur Open World", gameplay: "dino_open_world", desc: "Massive primeval continent with migrating sauropod herds and lush fern forests.", diff: "Medium", obj: "Roam freely across an untamed prehistoric Earth." }
    ]
  },
  {
    category: "Medieval Games",
    subcategory: "Knights, Castles & Swords",
    type: "3D",
    is_2d: false,
    is_3d: true,
    engine: "ThreeJS",
    accentColor: "from-yellow-700 to-amber-800",
    games: [
      { name: "Medieval RPG", gameplay: "medieval_rpg_epic", desc: "Live the life of a sworn knight defending lordships, attending tourneys, and crusading.", diff: "Hard", obj: "Earn knighthood honor through battlefield valor." },
      { name: "Castle Defense", gameplay: "castle_defense_3d", desc: "Pour boiling oil from murder holes, command archer battlements, and repel siege towers.", diff: "Hard", obj: "Hold the fortress walls against overwhelming siege armies." },
      { name: "Kingdom Builder", gameplay: "kingdom_builder_3d", desc: "3D kingdom construction placing stone bastions, watermills, and royal palaces.", diff: "Medium", obj: "Erect a magnificent feudal realm and expand territorial borders." },
      { name: "Medieval War", gameplay: "medieval_war_3d", desc: "Clash of thousand-soldier armies with cavalry charges, pike squares, and siege engines.", diff: "Hard", obj: "Lead infantry formations to victory on muddy battlefield plains." },
      { name: "Knight Simulator", gameplay: "knight_sim_3d", desc: "Train with squires at the quintain, polish armor, participate in jousts, and serve the king.", diff: "Medium", obj: "Master chivalric martial arts and win the grand royal tourney." },
      { name: "Viking Game", gameplay: "viking_game_3d", desc: "Sail dragon-headed longships across stormy northern seas and raid coastal monasteries.", diff: "Hard", obj: "Raid enemy settlements and return with glory and plunder." },
      { name: "Samurai Game", gameplay: "samurai_game_3d", desc: "Wield dual katanas in feudal Japan protecting villagers from bandit incursions.", diff: "Hard", obj: "Defend sacred shrines and master the way of the warrior." },
      { name: "Pirate Game", gameplay: "pirate_game_3d", desc: "Captain square-rigged galleons, fire multi-deck cannons, and board rival vessels.", diff: "Medium", obj: "Plunder gold bullion from enemy merchant convoys." },
      { name: "Medieval Strategy", gameplay: "medieval_strategy_3d", desc: "Top-down 3D tactical command ordering archer volleys and flanking heavy cavalry.", diff: "Hard", obj: "Out-maneuver enemy commanders to capture the castle keep." },
      { name: "Medieval Open World", gameplay: "medieval_open_world", desc: "Expansive European countryside with bustling market towns, bandit woods, and monasteries.", diff: "Medium", obj: "Travel freely across medieval provinces fulfilling quests." }
    ]
  },
  {
    category: "Sci-Fi Games",
    subcategory: "Futuristic & Cybernetic 3D",
    type: "3D",
    is_2d: false,
    is_3d: true,
    engine: "ThreeJS",
    accentColor: "from-cyan-500 to-blue-600",
    games: [
      { name: "Space Exploration", gameplay: "space_exploration_3d", desc: "Navigate interstellar wormholes, land on procedural exoplanets, and catalog anomalies.", diff: "Medium", obj: "Explore uncharted star clusters and map alien worlds." },
      { name: "Space Station", gameplay: "space_station_3d", desc: "Dock shuttles, conduct microgravity experiments, and manage orbital laboratory systems.", diff: "Medium", obj: "Maintain orbital station operations and scientific research." },
      { name: "Alien Invasion", gameplay: "alien_invasion_3d", desc: "Defend Earth cities against gigantic tripod walkers and mothership laser beams.", diff: "Hard", obj: "Repel the extraterrestrial invasion force from major city sectors." },
      { name: "Robot War", gameplay: "robot_war_3d", desc: "Command mechanized android divisions in futuristic combat against rogue cybernetic armies.", diff: "Hard", obj: "Eradicate rogue sentient robot factions threatening humanity." },
      { name: "Cyberpunk City", gameplay: "cyberpunk_city_3d", desc: "Explore multi-level vertical neon megastructures with flying spinner cars and holograms.", diff: "Medium", obj: "Navigate the neon underworld and interact with cybernetic citizens." },
      { name: "Galactic War", gameplay: "galactic_war_3d", desc: "Epic space fleet battles between star dreadnoughts exchanging heavy turbolaser fire.", diff: "Hard", obj: "Command capital starships and obliterate the enemy armada." },
      { name: "Planet Exploration", gameplay: "planet_exploration_3d", desc: "Drive 6-wheeled rovers across red canyons, icy plains, and geothermal vents on alien planets.", diff: "Easy", obj: "Collect geological core samples from unexplored planetary surfaces." },
      { name: "Space Mining", gameplay: "space_mining_3d", desc: "Laser-blast titanium asteroids and tractor beam high-value mineral fragments into cargo bays.", diff: "Medium", obj: "Harvest asteroid belt wealth and sell raw materials at space docks." },
      { name: "Colony Simulator", gameplay: "colony_simulator_3d", desc: "Build pressurized habitat domes, moisture vaporators, and solar arrays on Mars.", diff: "Hard", obj: "Establish a thriving human settlement on the Martian surface." },
      { name: "Mech Battle", gameplay: "mech_battle_3d", desc: "Pilot 50-ton walking battle mechs armed with particle cannons and missile pods.", diff: "Hard", obj: "Annihilate opposing battle mechs in gladiatorial arena combat." },
      { name: "Sci-Fi RPG", gameplay: "scifi_rpg_epic_3d", desc: "Deep narrative journey as a starship captain shaping the galactic order.", diff: "Hard", obj: "Uncover a precursor cosmic threat capable of wiping out all life." }
    ]
  },
  {
    category: "Educational / AI Games",
    subcategory: "Brain Training & Academics",
    type: "2D",
    is_2d: true,
    is_3d: false,
    engine: "Canvas2D",
    accentColor: "from-blue-500 to-indigo-600",
    games: [
      { name: "AI Quiz Game", gameplay: "ai_quiz", desc: "Intelligent dynamic trivia game adapting question difficulty to your real-time performance.", diff: "Easy", obj: "Answer trivia questions correctly across science, history, and tech." },
      { name: "Coding Game", gameplay: "coding_game", desc: "Solve visual programming challenges guiding robots through mazes using algorithmic loops.", diff: "Medium", obj: "Write clean code logic to guide the automated rover to its goal." },
      { name: "Programming Puzzle", gameplay: "programming_puzzle", desc: "Debug broken code snippets, optimize time complexity, and fix logic syntax bugs.", diff: "Hard", obj: "Identify and resolve software bugs to pass all automated test suites." },
      { name: "Mathematics Game", gameplay: "math_game", desc: "Fast-paced mental math calculating arithmetic, algebra, and geometry under time pressure.", diff: "Medium", obj: "Solve math equations rapidly to maintain combo streaks." },
      { name: "Physics Game", gameplay: "physics_game", desc: "Experiment with gravity, momentum, refraction, and circuits in a sandbox laboratory.", diff: "Medium", obj: "Solve kinetic physics challenges using pulleys, levers, and lasers." },
      { name: "Chemistry Game", gameplay: "chemistry_game", desc: "Combine elements on the periodic table to synthesize compounds and avoid explosions.", diff: "Medium", obj: "Synthesize target chemical molecules following molecular recipes." },
      { name: "Language Learning Game", gameplay: "language_game", desc: "Master vocabulary, grammar syntax, and pronunciation in foreign language flashcard drills.", diff: "Easy", obj: "Match words to translations and build foreign language fluency." },
      { name: "Typing Game", gameplay: "typing_game", desc: "Test typing speed (WPM) and accuracy blasting incoming meteor words before they strike.", diff: "Medium", obj: "Type incoming words rapidly and accurately to protect the city." },
      { name: "Memory Training Game", gameplay: "memory_training", desc: "Dual N-Back and digit span challenges scientifically engineered to boost working memory.", diff: "Hard", obj: "Recall sequential visual and auditory cues across multiple steps." },
      { name: "Brain Training Game", gameplay: "brain_training", desc: "Neuroscience-inspired cognitive workouts testing attention, speed, and flexibility.", diff: "Medium", obj: "Complete daily cognitive mini-games to elevate your mental sharpness." },
      { name: "Cybersecurity Game", gameplay: "cybersecurity_game", desc: "Defend network topology against DDoS attacks, SQL injection, and malware intrusions.", diff: "Hard", obj: "Configure firewalls and patch vulnerabilities before hackers breach servers." },
      { name: "AI Detective Game", gameplay: "ai_detective", desc: "Interrogate simulated suspects, analyze digital forensic logs, and identify the culprit.", diff: "Medium", obj: "Find contradictions in suspect testimonies to solve the mystery." },
      { name: "AI Interview Game", gameplay: "ai_interview", desc: "Simulated job interview practicing behavioral answers and technical system design.", diff: "Medium", obj: "Deliver articulate answers to tough technical interview questions." },
      { name: "AI Chess", gameplay: "ai_chess", desc: "Play against a multi-tier neural network chess engine from 800 to 2800 ELO rating.", diff: "Hard", obj: "Outsmart the AI chess engine using deep opening and endgame strategy." },
      { name: "AI Strategy Game", gameplay: "ai_strategy", desc: "Compete against an adaptive neural network AI that learns and counters your unit tactics.", diff: "Hard", obj: "Adapt your strategic battle formations against a learning neural AI." },
      { name: "AI NPC Adventure", gameplay: "ai_npc_adventure", desc: "Conversational RPG with generative LLM-powered NPCs that remember past dialogues.", diff: "Medium", obj: "Befriend intelligent NPCs through natural conversation to solve village mysteries." }
    ]
  },
  {
    category: "Multiplayer Games",
    subcategory: "Head-to-Head & Co-op",
    type: "2D",
    is_2d: true,
    is_3d: false,
    engine: "Canvas2D",
    accentColor: "from-fuchsia-600 to-pink-600",
    games: [
      { name: "Multiplayer Chess", gameplay: "multi_chess", desc: "Real-time or turn-based two-player chess on shared keyboard or network lobbies.", diff: "Hard", obj: "Outplay your human opponent on the 64-square battlefield." },
      { name: "Multiplayer Racing", gameplay: "multi_racing", desc: "Split-screen or dual-control side-by-side car racing with turbo boosts and drift turns.", diff: "Medium", obj: "Cross the finish line before your friend in intense head-to-head racing." },
      { name: "Multiplayer Shooter", gameplay: "multi_shooter", desc: "Top-down 2-player arena gun battle collecting weapon drops and using cover walls.", diff: "Medium", obj: "Score more frags than your opponent in the fast-paced 1v1 arena." },
      { name: "Multiplayer FPS", gameplay: "multi_fps", desc: "Deathmatch arena combat tracking opponent positions with laser carbines.", diff: "Hard", obj: "Achieve the target frag count first in competitive 1v1 combat." },
      { name: "Multiplayer Survival", gameplay: "multi_survival", desc: "Share resources, build a joint shelter, and divide hunting duties to survive together.", diff: "Medium", obj: "Cooperate with your partner to survive harsh wilderness conditions." },
      { name: "Multiplayer RPG", gameplay: "multi_rpg", desc: "Form a classic Warrior-Mage co-op duo to conquer challenging dungeon bosses.", diff: "Medium", obj: "Combine complementary character classes to defeat elite monsters." },
      { name: "Multiplayer Battle Arena", gameplay: "multi_arena", desc: "MOBA-style 2-lane clash pushing minion waves and taking down defense towers.", diff: "Hard", obj: "Destroy the enemy core structure while defending your own base." },
      { name: "Multiplayer Platformer", gameplay: "multi_platformer", desc: "Co-op synchronized puzzle platforming where one player holds switches for the other.", diff: "Medium", obj: "Work together to solve puzzle gates and reach the exit portal." },
      { name: "Multiplayer Card Game", gameplay: "multi_card", desc: "Custom deck building and tactical card dueling casting spells and summoning beasts.", diff: "Medium", obj: "Reduce your opponent's life total to zero with strategic card combos." },
      { name: "Multiplayer Football", gameplay: "multi_football", desc: "2-player table soccer passing, lobbing, and striking balls into the opposing net.", diff: "Easy", obj: "Score more goals than your rival before the match whistle blows." },
      { name: "Multiplayer Cricket", gameplay: "multi_cricket", desc: "Batting vs bowling duel timing willow strikes and bowling spin Yorkers.", diff: "Medium", obj: "Hit boundaries and defend your wickets against bowling attacks." },
      { name: "Multiplayer Quiz", gameplay: "multi_quiz", desc: "Buzzer-speed trivia showdown racing to lock in correct answers first.", diff: "Easy", obj: "Buzz in first with the correct trivia answer to accumulate points." },
      { name: "Multiplayer Fighting", gameplay: "multi_fighting", desc: "Local 2-player martial arts duel executing high-damage combos and counter-throws.", diff: "Hard", obj: "Defeat your friend in a best-of-three round fighting spectacle." },
      { name: "Multiplayer Hide-and-Seek", gameplay: "multi_hide_seek", desc: "One player hides as a prop while the seeker searches the environment room by room.", diff: "Easy", obj: "Blend in with room props or hunt down the disguised hider." },
      { name: "Capture the Flag", gameplay: "multi_ctf", desc: "Infiltrate the opposing base, steal their team flag, and return it safely to your base.", diff: "Medium", obj: "Capture the enemy flag 3 times while defending your own." },
      { name: "Team Battle Game", gameplay: "multi_team_battle", desc: "Squad-based combat coordinating flanking maneuvers and support healing.", diff: "Hard", obj: "Wipe out the opposing squad through tactical team coordination." }
    ]
  },
  {
    category: "Sports Games",
    subcategory: "Athletics & Ball Games",
    type: "2D",
    is_2d: true,
    is_3d: false,
    engine: "Canvas2D",
    accentColor: "from-emerald-600 to-green-600",
    games: [
      { name: "Football", gameplay: "sports_football", desc: "Exciting 11v11 soccer pitch simulation with passing, through-balls, slide tackles, and goals.", diff: "Medium", obj: "Score goals by curving shots past the goalkeeper into the net." },
      { name: "Cricket", gameplay: "sports_cricket", desc: "T20 cricket match hitting sixes over deep mid-wicket and bowling deceptive googlies.", diff: "Medium", obj: "Chase down the target run total before exhausting 20 overs." },
      { name: "Basketball", gameplay: "sports_basketball", desc: "Full-court basketball with dribble crossovers, 3-point swishes, and slam dunks.", diff: "Medium", obj: "Sink jump shots and throw down alley-oop dunks to outscore rivals." },
      { name: "Tennis", gameplay: "sports_tennis", desc: "Grand slam court tennis with forehand topspin, sliced backhands, and drop shots.", diff: "Medium", obj: "Win sets and match points by placing baseline winners out of reach." },
      { name: "Volleyball", gameplay: "sports_volleyball", desc: "Beach sand volleyball bumping, setting, and spiking over the net.", diff: "Easy", obj: "Spike the ball onto the opponent court floor to score points." },
      { name: "Badminton", gameplay: "sports_badminton", desc: "Rapid shuttlecock rallies with steep downward smashes and delicate net tumbles.", diff: "Easy", obj: "Smash the shuttlecock past your opponent's reach to win the rally." },
      { name: "Baseball", gameplay: "sports_baseball", desc: "Batter vs pitcher showdown hitting grand slam home runs and fielding grounders.", diff: "Medium", obj: "Time your swing to hit home runs over the outfield fence." },
      { name: "Hockey", gameplay: "sports_hockey", desc: "Fast-paced ice rink hockey slapshots, body checks, and goalie saves.", diff: "Medium", obj: "Slap the puck past the goalie into the hockey net." },
      { name: "Golf", gameplay: "sports_golf", desc: "18-hole links golf calculating wind drift, club selection, and putting greens.", diff: "Medium", obj: "Sink the golf ball into the cup in fewest strokes under par." },
      { name: "Boxing", gameplay: "sports_boxing", desc: "Ringside boxing trading jabs, uppercuts, ducking weaves, and heavy haymakers.", diff: "Medium", obj: "Out-point your boxing opponent or score a dramatic knockout." },
      { name: "Wrestling", gameplay: "sports_wrestling", desc: "Grappling canvas wrestling executing suplexes, leg sweeps, and three-count pins.", diff: "Medium", obj: "Execute wrestling throws and pin opponent shoulders to the mat." },
      { name: "Table Tennis", gameplay: "sports_table_tennis", desc: "Ping pong table rallies with heavy topspin paddles and reflex smashes.", diff: "Easy", obj: "Return fast ping-pong spins and win 11-point sets." },
      { name: "Swimming", gameplay: "sports_swimming", desc: "Olympic swimming lane races timing strokes, flip turns, and breathing rhythm.", diff: "Easy", obj: "Time arm strokes and kick bursts to win the 100m freestyle." },
      { name: "Athletics", gameplay: "sports_athletics", desc: "Decathlon track events: 100m dash, hurdles, long jump, and javelin throw.", diff: "Medium", obj: "Mash sprint keys and time jump angles to set track records." },
      { name: "Skateboarding", gameplay: "sports_skateboarding", desc: "Skate park halfpipes performing kickflips, 50-50 grinds, and 540-degree spins.", diff: "Medium", obj: "Chain street skate tricks and grinds for massive combo scores." },
      { name: "Cycling", gameplay: "sports_cycling", desc: "Tour velodrome cycling pacing energy stamina, drafting, and sprinting to the line.", diff: "Medium", obj: "Conserve stamina in the peloton and launch a winning sprint finish." }
    ]
  },
  {
    category: "Advanced AI Games",
    subcategory: "Generative AI & LLM Systems",
    type: "2D",
    is_2d: true,
    is_3d: false,
    engine: "Canvas2D",
    accentColor: "from-indigo-500 to-purple-600",
    games: [
      { name: "AI NPC Game", gameplay: "ai_npc_game", desc: "Deep simulated town where NPCs form friendships, hold grudges, and react to player actions.", diff: "Medium", obj: "Influence social dynamics and village politics through conversation." },
      { name: "AI Enemy Battle", gameplay: "ai_enemy_battle", desc: "Battle an AI commander that learns your attack patterns and dynamically adapts defenses.", diff: "Hard", obj: "Overcome an evolving neural AI combatant that counters your playstyle." },
      { name: "AI Zombie Game", gameplay: "ai_zombie_game", desc: "Infected horde driven by swarm intelligence, flanking tactics, and scent tracking.", diff: "Hard", obj: "Outwit an emergent AI zombie hivemind that surrounds and traps you." },
      { name: "AI Detective Game", gameplay: "ai_detective_advanced", desc: "Solve procedurally generated murder cases by interviewing suspects and spotting lies.", diff: "Hard", obj: "Interrogate suspects, find evidence contradictions, and convict the killer." },
      { name: "AI Story Generator Game", gameplay: "ai_story_generator", desc: "Interactive choose-your-own-adventure story dynamically authored by an AI storyteller.", diff: "Easy", obj: "Make narrative choices in an ever-expanding dynamically generated fantasy tale." },
      { name: "AI Dungeon Master", gameplay: "ai_dungeon_master", desc: "Pen-and-paper tabletop RPG where an AI DM describes rooms, rolls dice, and adjudicates.", diff: "Medium", obj: "Roleplay your character through an imaginative AI-guided campaign." },
      { name: "AI RPG", gameplay: "ai_rpg_advanced", desc: "RPG world where quests, lore, items, and character backstories are generated uniquely.", diff: "Medium", obj: "Embark on an adventure where no two playthroughs share the same quests." },
      { name: "AI Conversation Game", gameplay: "ai_conversation", desc: "Diplomatic debate challenge persuading skeptical AI world leaders to sign peace accords.", diff: "Medium", obj: "Use rhetoric, facts, and empathy to persuade AI diplomats." },
      { name: "AI Virtual World", gameplay: "ai_virtual_world", desc: "Autonomous ecosystem of AI entities trading goods, building houses, and evolving.", diff: "Easy", obj: "Observe and interact with an evolving ecosystem of autonomous agents." },
      { name: "AI Companion Game", gameplay: "ai_companion", desc: "Nurture an intelligent digital companion that learns your preferences, humor, and habits.", diff: "Easy", obj: "Bond with a learning virtual companion through daily interactions." },
      { name: "AI Chess", gameplay: "ai_chess_advanced", desc: "Neural network chess engine explaining the strategic reasoning behind every move.", diff: "Hard", obj: "Improve your chess master game by learning from neural AI move evaluations." },
      { name: "AI Racing Opponent", gameplay: "ai_racing_opponent", desc: "Race against AI drivers trained with reinforcement learning exhibiting human-like racecraft.", diff: "Hard", obj: "Out-brake and out-maneuver reinforcement-learned racing AI opponents." },
      { name: "AI Football Manager", gameplay: "ai_football_manager", desc: "Manage soccer club tactics, player scouting, and training with AI match simulations.", diff: "Medium", obj: "Lead your underdog football club to league championship victory." },
      { name: "AI Strategy Game", gameplay: "ai_strategy_advanced", desc: "Warfare against an AI general running Monte Carlo Tree Search to predict your moves.", diff: "Hard", obj: "Outsmart a grandmaster-tier strategic planning algorithm." },
      { name: "AI Procedural World Generator", gameplay: "ai_world_generator", desc: "Generate infinite islands, dungeons, and planets with custom seed algorithms.", diff: "Easy", obj: "Generate and explore custom procedural terrain with unique biomes." },
      { name: "AI Quest Generator", gameplay: "ai_quest_generator", desc: "Create bespoke RPG adventures tailored to your character's skills, morals, and history.", diff: "Medium", obj: "Complete customized questlines generated specifically for your playstyle." },
      { name: "AI Character Generator", gameplay: "ai_character_generator", desc: "Design complex video game characters with backstory, visual prompts, and stats.", diff: "Easy", obj: "Generate original game characters with deep lore and stat balances." },
      { name: "AI Voice-Controlled Game", gameplay: "ai_voice_game", desc: "Command starships, issue spells, and guide troops using natural voice speech recognition.", diff: "Medium", obj: "Speak voice commands like 'shields up' and 'fire torpedoes' to play." },
      { name: "AI Gesture-Controlled Game", gameplay: "ai_gesture_game", desc: "Control spaceship flight and slice obstacles using web camera hand gesture recognition.", diff: "Medium", obj: "Use hand gestures to steer vehicles and deflect incoming projectiles." },
      { name: "AI Face-Controlled Game", gameplay: "ai_face_game", desc: "Navigate games using eyebrow raises, head tilts, and facial smile expressions.", diff: "Medium", obj: "Control game characters through intuitive facial expression recognition." },
      { name: "AI Image-Based Puzzle", gameplay: "ai_image_puzzle", desc: "Solve generative visual puzzles identifying surreal anomalies and hidden symbols.", diff: "Medium", obj: "Spot visual patterns and discrepancies in AI-generated artwork." },
      { name: "AI Coding Battle Game", gameplay: "ai_coding_battle", desc: "Live competitive code duel against an AI programmer optimizing algorithms in real time.", diff: "Hard", obj: "Write bug-free algorithms faster than the competing code AI." },
      { name: "AI Cybersecurity Game", gameplay: "ai_cyber_defense", desc: "AI-powered red-team vs blue-team cyber warfare defending infrastructure networks.", diff: "Hard", obj: "Thwart automated zero-day attack scripts launched by aggressive AI bots." },
      { name: "AI Interview Simulator", gameplay: "ai_interview_sim", desc: "Comprehensive technical and behavioral interview preparation with AI grading.", diff: "Medium", obj: "Achieve top interview performance scores through structured responses." },
      { name: "AI Language Learning Game", gameplay: "ai_language_tutor", desc: "Conversational language immersion chatting naturally with an AI foreign language tutor.", diff: "Easy", obj: "Converse fluently in your target language with real-time feedback." },
      { name: "AI Educational Game", gameplay: "ai_educational_hub", desc: "Adaptive learning portal generating personalized math, physics, and coding quests.", diff: "Easy", obj: "Master complex STEM concepts through gamified adaptive learning modules." }
    ]
  }
];

let globalGameIndex = 0;
const allGames = [];

for (const cat of CATEGORIES_DATA) {
  for (const g of cat.games) {
    globalGameIndex++;
    const idNum = String(globalGameIndex).padStart(3, '0');
    const id = `GAME-${idNum}`;
    
    // Default controls
    let controls = {
      keyboard: "Arrow Keys / WASD, Space, Shift, P, R, M",
      mouse: "Click to interact / aim",
      touch: "Virtual on-screen D-Pad & action triggers",
      gamepad: "Directional controls + Action/Jump buttons",
      keys: [
        { key: "Arrow Keys / WASD", action: "Move Player / Direction" },
        { key: "Space", action: "Action / Jump / Shoot" },
        { key: "Shift", action: "Sprint / Boost" },
        { key: "P / Esc", action: "Pause / Resume" },
        { key: "R", action: "Restart Game" },
        { key: "M", action: "User Manual & Rules" }
      ]
    };

    if (g.gameplay === 'snake') {
      controls.keys = [
        { key: "Arrow Keys / WASD", action: "Steer Snake (Up, Down, Left, Right)" },
        { key: "P / Esc", action: "Pause / Resume" },
        { key: "R", action: "Restart Match" },
        { key: "M", action: "View Rules & Instructions" }
      ];
    } else if (g.gameplay === 'pong') {
      controls.keys = [
        { key: "W / S", action: "Move Left Paddle Up / Down" },
        { key: "Up / Down", action: "Move Right Paddle (2P Local Duel)" },
        { key: "Space", action: "Serve / Launch Ball" },
        { key: "P / Esc", action: "Pause / Resume" },
        { key: "R", action: "Restart Match" },
        { key: "M", action: "User Manual" }
      ];
    } else if (g.gameplay === 'breakout' || g.gameplay === 'brick_breaker' || g.gameplay === 'arkanoid') {
      controls.keys = [
        { key: "A / D or Left / Right", action: "Smooth Glide Paddle Left / Right" },
        { key: "Space", action: "Launch Ball / Fire Laser" },
        { key: "P / Esc", action: "Pause / Resume" },
        { key: "R", action: "Restart Stage" },
        { key: "M", action: "User Manual" }
      ];
    } else if (g.gameplay === 'flappy' || g.gameplay === 'tap_jump') {
      controls.keys = [
        { key: "Space / ArrowUp / W", action: "Flap Wings / Jump" },
        { key: "P / Esc", action: "Pause / Resume" },
        { key: "R", action: "Restart Run" },
        { key: "M", action: "User Manual" }
      ];
    } else if (g.gameplay === 'game_2048') {
      controls.keys = [
        { key: "Arrow Keys / WASD", action: "Slide Numbered Tiles (4 Directions)" },
        { key: "Enter / Space", action: "Confirm / Merge" },
        { key: "P / Esc", action: "Pause / Resume" },
        { key: "R", action: "Restart Puzzle" },
        { key: "M", action: "User Manual" }
      ];
    } else if (g.gameplay === 'whackamole' || g.gameplay === 'reaction') {
      controls.keys = [
        { key: "1–9 (or Numpad 1–9)", action: "Directly Strike Hole 1 to 9" },
        { key: "Space / Enter", action: "Strike Any Active Mole" },
        { key: "Mouse Click", action: "Click Directly on Popping Mole" },
        { key: "P / Esc", action: "Pause / Resume" },
        { key: "R", action: "Restart Round" },
        { key: "M", action: "User Manual" }
      ];
    } else if (g.gameplay.includes('racing') || g.gameplay.includes('drift') || g.gameplay.includes('traffic')) {
      controls.keys = [
        { key: "W / ArrowUp", action: "Accelerate Throttle" },
        { key: "S / ArrowDown", action: "Brake / Reverse" },
        { key: "A / ArrowLeft", action: "Steer Left" },
        { key: "D / ArrowRight", action: "Steer Right" },
        { key: "Space / Shift", action: "Handbrake / Nitro Boost" },
        { key: "P / Esc", action: "Pause / Resume" },
        { key: "R", action: "Restart Race" },
        { key: "M", action: "User Manual" }
      ];
    } else if (g.gameplay.includes('space') || g.gameplay.includes('shooter') || g.gameplay.includes('invader')) {
      controls.keys = [
        { key: "WASD / Arrow Keys", action: "8-Way Starship Maneuvers" },
        { key: "Space / Left Click", action: "Fire Dual Plasma Cannons" },
        { key: "Shift", action: "Hyperdrive Afterburners / Boost" },
        { key: "1–3", action: "Select Weapon / Plasma Cannons" },
        { key: "P / Esc", action: "Pause / Resume" },
        { key: "R", action: "Restart Fleet Mission" },
        { key: "M", action: "User Manual" }
      ];
    } else if (g.gameplay.includes('platform') || g.gameplay.includes('runner') || g.gameplay.includes('jump')) {
      controls.keys = [
        { key: "A / D or Left / Right", action: "Run Left / Right" },
        { key: "Space / W / ArrowUp", action: "Jump / Wall Jump" },
        { key: "Shift", action: "Sprint / Dash" },
        { key: "E", action: "Interact / Activate Switch" },
        { key: "P / Esc", action: "Pause / Resume" },
        { key: "R", action: "Restart Level" },
        { key: "M", action: "User Manual" }
      ];
    } else if (cat.is_3d) {
      controls.keys = [
        { key: "WASD / Arrow Keys", action: "3D Motion / Strafe / Drive" },
        { key: "Mouse Aim", action: "Orient 3D Camera / Aim" },
        { key: "Space / Left Click", action: "Jump / Shoot / Primary Action" },
        { key: "Shift", action: "Sprint / Turbo Acceleration" },
        { key: "E", action: "Interact / Open / Use" },
        { key: "Q", action: "Secondary Weapon / Ability" },
        { key: "1–9", action: "Hotbar Equipment / Weapon Select" },
        { key: "P / Esc", action: "Pause / Resume" },
        { key: "R", action: "Restart 3D Simulation" },
        { key: "M", action: "User Manual & Rules" }
      ];
    } else if (g.gameplay.includes('chess') || g.gameplay.includes('checkers') || g.gameplay.includes('board') || g.gameplay.includes('card')) {
      controls.keys = [
        { key: "Mouse Click", action: "Select & Move Piece / Card" },
        { key: "Arrow Keys / WASD", action: "Navigate Grid Cursor" },
        { key: "Space / Enter", action: "Pick Up / Place Piece" },
        { key: "Esc / U", action: "Deselect / Undo" },
        { key: "P", action: "Pause Clock" },
        { key: "R", action: "Restart Game" },
        { key: "M", action: "User Manual" }
      ];
    }

function generateManual(name, category, gameplay, desc, obj, diff, type) {
  let howToPlay = [];
  let rules = [];
  let scoring = "";
  let winCondition = "";
  let proTips = [];

  if (gameplay === 'snake') {
    howToPlay = [
      "Use Arrow Keys / WASD or the On-Screen D-Pad buttons to direct the snake.",
      "Steer towards the glowing red food pellets scattered across the grid.",
      "Each food pellet consumed extends your snake body by 1 segment.",
      "Maintain situational awareness as your tail lengthens and speed ramps up."
    ];
    rules = [
      "Turning 180 degrees directly back into your neck is prohibited.",
      "Colliding with the outer boundary walls causes an instant crash.",
      "Colliding with any part of your own tail results in game over.",
      "Speed dynamically increases as your score reaches higher tiers."
    ];
    scoring = "+100 points per food pellet + 10 points bonus per surviving second.";
    winCondition = "Score 1,500 points or survive as long as possible with maximum snake length.";
    proTips = [
      "Circumnavigate the outer walls in S-patterns to conserve internal maneuvering space.",
      "Avoid cutting through the center once your tail exceeds 10 segments."
    ];
  } else if (gameplay === 'pong') {
    howToPlay = [
      "Control your paddle using W/S keys or the on-screen UP/DOWN buttons.",
      "Intercept the incoming ball and reflect it towards the opponent's side.",
      "Angle your paddle hits to impart spin and send unpredictable ricochets.",
      "Score points whenever the opponent fails to return your volley."
    ];
    rules = [
      "Ball rebounds elastically off the top and bottom borders.",
      "Striking the ball with the outer edges of the paddle increases return velocity.",
      "First player to score 7 points wins the championship match.",
      "Missing the ball awards 1 point to the opponent."
    ];
    scoring = "+100 points per goal scored + 10 points per successful paddle rally.";
    winCondition = "Be the first to reach 7 points before the AI opponent.";
    proTips = [
      "Move the paddle while striking the ball to impart sharp angular deflection.",
      "Stay centered on the court when waiting for the return."
    ];
  } else if (gameplay === 'breakout' || gameplay === 'brick_breaker' || gameplay === 'arkanoid') {
    howToPlay = [
      "Move the bottom paddle using A/D, Arrow keys, mouse drag, or on-screen buttons.",
      "Bounce the steel ball upward into the wall of colored bricks.",
      "Destroy all bricks on the screen while keeping the ball in active play.",
      "Position the paddle carefully to aim rebounds into hard-to-reach brick layers."
    ];
    rules = [
      "The ball rebounds off side and top walls, and shatters bricks on contact.",
      "Letting the ball drop below the paddle loses the current round.",
      "Different colored bricks require tactical rebound angles to clear.",
      "Clearing the final brick completes the stage."
    ];
    scoring = "+50 points per brick shattered + 500 points combo clear bonus.";
    winCondition = "Shatter every brick on the screen to achieve total victory.";
    proTips = [
      "Aim for the upper corners to lodge the ball above the brick ceiling for cascading bounces.",
      "Use the edges of the paddle to create steep diagonal trajectories."
    ];
  } else if (gameplay === 'game_2048') {
    howToPlay = [
      "Slide the numbered tiles in 4 directions using Arrow Keys, WASD, or On-Screen buttons.",
      "When two tiles with the same number collide during a slide, they merge into one (2+2=4, 4+4=8...).",
      "A new tile (2 or 4) spawns in a random empty spot after every valid slide.",
      "Strategically plan each move to build up towards the legendary 2048 tile."
    ];
    rules = [
      "All tiles on the board slide together until blocked by the edge or other tiles.",
      "Each tile can only merge once per slide.",
      "Game ends when the board is completely full and no adjacent tiles can merge.",
      "Reaching 2048 achieves victory, though you can continue for endless high scores."
    ];
    scoring = "Sum of all merged tile numbers is added directly to your score total.";
    winCondition = "Successfully merge numbers until the 2048 tile is created.";
    proTips = [
      "Keep your highest-value tile locked in one designated corner (e.g. bottom-right).",
      "Organize tiles in descending snake rows leading to your highest tile."
    ];
  } else if (gameplay === 'flappy' || gameplay === 'tap_jump') {
    howToPlay = [
      "Press Space, Up Arrow, or tap the on-screen FLAP / JUMP button to gain altitude.",
      "Release the button to allow gravity to pull you downward.",
      "Navigate cleanly through the vertical gaps between green pipes.",
      "Time your flaps rhythmically to maintain smooth flight altitude."
    ];
    rules = [
      "Touching any pipe boundary results in an immediate crash.",
      "Touching the ground floor or flying above the sky ceiling ends the run.",
      "Each pipe set safely passed awards +100 points.",
      "Speed and gap variation challenge your reflexes as you progress."
    ];
    scoring = "+100 points per pipe pair cleared + distance bonus.";
    winCondition = "Survive the obstacle gauntlet and achieve a score of 1,000+ points.";
    proTips = [
      "Tap lightly and frequently rather than waiting until the character falls too low.",
      "Focus your eyes on the bottom pipe ledge of the upcoming gap."
    ];
  } else if (gameplay.includes('chess') || gameplay.includes('checkers') || gameplay.includes('board')) {
    howToPlay = [
      "Select your piece on the board and click on the valid target square.",
      "Use tactical positioning, piece development, and center control.",
      "Anticipate the AI opponent's countermoves and defend your high-value pieces.",
      "Execute tactical captures and deliver a decisive checkmate or kinging trap."
    ];
    rules = [
      "Standard turn-based rules: White and Black take alternating turns.",
      "Pieces move strictly according to their classical piece movement geometry.",
      "Checkmate occurs when the king is under attack with no legal escapes.",
      "Illegal moves are strictly rejected by the move validation logic."
    ];
    scoring = "+250 points per tactical capture + 1,000 points checkmate victory bonus.";
    winCondition = "Deliver checkmate to the opponent King or capture all opposing checkers.";
    proTips = [
      "Control the central four squares early in the opening phase.",
      "Develop minor pieces (Knights and Bishops) before launching aggressive queen attacks."
    ];
  } else if (type === '3D') {
    howToPlay = [
      "Use W/A/S/D keys or the on-screen Virtual Directional buttons to move in 3D space.",
      "Move the mouse or use Look buttons to orient your 3D perspective and aim.",
      "Press Space or click the on-screen ACTION / SHOOT button to interact or fire.",
      "Navigate around 3D obstacles, track objectives, and conquer the 3D environment."
    ];
    rules = [
      "Full 3D bounding-box and distance collision detection active.",
      "Enemies or obstacles deal damage upon proximity or impact.",
      "Surviving waves or reaching target destinations clears stage milestones.",
      "Score scales continuously with distance, speed, and targets neutralized."
    ];
    scoring = "+100 points per target eliminated + 25 points per second in active 3D motion.";
    winCondition = "Reach 1,500 points or successfully clear all interactive world targets.";
    proTips = [
      "Maintain active strafing movement to evade incoming target vectors.",
      "Keep track of the radar and HUD compass to spot nearby entities."
    ];
  } else {
    howToPlay = [
      `Use Arrow Keys, WASD, or On-Screen Virtual Buttons to control your ${name} actions.`,
      `Engage with objectives: ${obj}`,
      "Dodge hostile hazards and maintain momentum to build up combo multipliers.",
      "Fulfill the genre objective to complete the level and bank your XP."
    ];
    rules = [
      "Player moves within designated screen boundaries.",
      "Collision with hazards reduces health or concludes the match.",
      "All actions contribute to real-time score and XP calculations.",
      "Clean runs without taking damage award precision bonuses."
    ];
    scoring = "+100 points per objective accomplished + combo accuracy multipliers.";
    winCondition = `Fulfill: ${obj} and surpass target high score.`;
    proTips = [
      "Watch the movement patterns of hazards before advancing into contested spaces.",
      "Use on-screen buttons for quick thumb reflex inputs."
    ];
  }

  return {
    overview: `${name} is an engaging ${type} ${category} built on ${category} mechanics. ${desc}`,
    howToPlay,
    rules,
    scoringSystem: scoring,
    winCondition,
    controlsSummary: "Keyboard (WASD/Arrows), Mouse/Touch, and dedicated On-Screen Gamepad Buttons.",
    proTips
  };
}

    const is3D = cat.is_3d;
    const is2D = cat.is_2d;
    const isAI = cat.category.includes('AI') || g.name.includes('AI') || g.gameplay.includes('ai') || g.desc.includes('AI');
    const isMultiplayer = cat.category.includes('Multiplayer') || g.name.includes('Multiplayer') || g.gameplay.includes('multi');

    const manual = generateManual(g.name, cat.category, g.gameplay, g.desc, g.obj, g.diff, cat.type);

    allGames.push({
      id,
      numericId: globalGameIndex,
      name: g.name,
      category: cat.category,
      subcategory: cat.subcategory,
      type: cat.type,
      genre: cat.category.replace(' Games', '').replace('3D ', ''),
      description: g.desc,
      objective: g.obj,
      controls,
      manual,
      features: [
        `${cat.type} Rendering Engine (${cat.engine})`,
        "Dedicated Interactive On-Screen Gamepad Controls",
        "Comprehensive How-To-Play Manual & Rulebook",
        "Live High-Score & Accuracy Tracking",
        "Persistent Game Session History & Level XP",
        "Adaptive Sound Effects & Visual Micro-particles"
      ],
      difficulty: g.diff,
      engine: cat.engine,
      is_2d: is2D,
      is_3d: is3D,
      is_ai: isAI,
      is_multiplayer: isMultiplayer,
      status: is3D ? "3D Interactive Prototype" : "Full Engine",
      route: `/game-hub/${id.toLowerCase()}`,
      tags: [
        cat.category.toLowerCase().replace(' games', ''),
        cat.type.toLowerCase(),
        g.diff.toLowerCase(),
        cat.engine.toLowerCase(),
        isAI ? "ai" : "",
        isMultiplayer ? "multiplayer" : "",
        g.gameplay
      ].filter(Boolean),
      accentColor: cat.accentColor,
      gameplayCategory: g.gameplay,
      soundTrack: "procedural-synth"
    });
  }
}

console.log(`Generated ${allGames.length} games. Verifying...`);
if (allGames.length !== 432) {
  console.error(`ERROR: Expected 432 games, but generated ${allGames.length}!`);
  process.exit(1);
}

const fileContent = `/**
 * 432 Complete Game Database Registry
 * Generated automatically from Master Development Specification.
 * Total Records: 432
 * IDs: GAME-001 through GAME-432
 */

export interface GameControls {
  keyboard?: string;
  mouse?: string;
  touch?: string;
  gamepad?: string;
  keys: { key: string; action: string }[];
}

export interface GameManual {
  overview: string;
  howToPlay: string[];
  rules: string[];
  scoringSystem: string;
  winCondition: string;
  controlsSummary: string;
  proTips: string[];
}

export interface GameRecord {
  id: string; // "GAME-001" to "GAME-432"
  numericId: number;
  name: string;
  category: string;
  subcategory: string;
  type: '2D' | '3D';
  genre: string;
  description: string;
  objective: string;
  controls: GameControls;
  manual: GameManual;
  features: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  engine: 'Canvas2D' | 'ThreeJS' | 'ProceduralWebGL' | 'BoardLogic';
  is_2d: boolean;
  is_3d: boolean;
  is_ai: boolean;
  is_multiplayer: boolean;
  status: 'Playable' | 'Full Engine' | '3D Interactive Prototype';
  route: string;
  tags: string[];
  accentColor: string;
  gameplayCategory: string;
  soundTrack: string;
}

export const GAME_DATABASE: GameRecord[] = ${JSON.stringify(allGames, null, 2)};

export const GAME_CATEGORIES = Array.from(new Set(GAME_DATABASE.map(g => g.category)));

export function getGameById(id: string): GameRecord | undefined {
  if (!id) return undefined;
  const normalized = id.trim().toUpperCase();
  return GAME_DATABASE.find(g => g.id === normalized || g.id === \`GAME-\${normalized.replace('GAME-', '').padStart(3, '0')}\`);
}

export function getGameByNumericId(num: number): GameRecord | undefined {
  return GAME_DATABASE.find(g => g.numericId === num);
}

export function getGamesByCategory(category: string): GameRecord[] {
  if (category === 'All') return GAME_DATABASE;
  return GAME_DATABASE.filter(g => g.category.toLowerCase() === category.toLowerCase());
}

export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {
    total: GAME_DATABASE.length,
    is_2d: GAME_DATABASE.filter(g => g.is_2d).length,
    is_3d: GAME_DATABASE.filter(g => g.is_3d).length,
    is_ai: GAME_DATABASE.filter(g => g.is_ai).length,
    is_multiplayer: GAME_DATABASE.filter(g => g.is_multiplayer).length,
  };
  GAME_CATEGORIES.forEach(cat => {
    counts[cat] = GAME_DATABASE.filter(g => g.category === cat).length;
  });
  return counts;
}
`;

const outputPath = path.resolve(__dirname, '../src/data/gameDatabase.ts');
fs.writeFileSync(outputPath, fileContent, 'utf-8');
console.log(`Saved successfully to ${outputPath}`);

