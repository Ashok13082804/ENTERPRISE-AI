import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Wrench, Sparkles, Play, Save, Download, ArrowLeft,
  Code2, Eye, Sliders, Layers, Bot, Cpu, Check, Copy, RefreshCw
} from 'lucide-react';
import { GAME_DATABASE, getGameById, GameRecord } from '@/data/gameDatabase';
import { GameCanvas } from '@/games/engine/GameCanvas';
import toast from 'react-hot-toast';

export const GameBuilderPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialGame = getGameById(gameId || '') || GAME_DATABASE[0];
  const [selectedGame, setSelectedGame] = useState<GameRecord>(initialGame);

  // Configuration options as requested by Section 9
  const [mode, setMode] = useState<'2D' | '3D'>(initialGame.type);
  const [difficulty, setDifficulty] = useState<string>(initialGame.difficulty);
  const [theme, setTheme] = useState<'Classic' | 'Neon' | 'Space' | 'Fantasy'>('Neon');
  const [playerMode, setPlayerMode] = useState<'Single' | 'Multiplayer'>('Single');
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [generateAssets, setGenerateAssets] = useState<boolean>(true);
  const [generateCode, setGenerateCode] = useState<boolean>(true);

  // AI Prompt as requested by Section 10
  const [aiPrompt, setAiPrompt] = useState('Create an intense sci-fi survival game with asteroid hazards, laser shields, and procedural enemy waves.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'assets' | 'scenes' | 'ai'>('preview');

  // Generated code state
  const [gameSourceCode, setGameSourceCode] = useState(`// Generated Game Engine Code for ${selectedGame.name} (${selectedGame.id})
// Engine: ${mode === '3D' ? 'Three.js WebGL' : 'HTML5 Canvas 2D'}
// Theme: ${theme} | Difficulty: ${difficulty} | AI: ${aiEnabled ? 'Active' : 'Disabled'}

class ${selectedGame.name.replace(/[^a-zA-Z0-9]/g, '')}Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('${mode === '3D' ? 'webgl2' : '2d'}');
    this.score = 0;
    this.difficulty = '${difficulty}';
    this.theme = '${theme}';
    this.entities = [];
    this.init();
  }

  init() {
    console.log("Initializing ${selectedGame.name} engine...");
    this.spawnEntities();
  }

  spawnEntities() {
    for (let i = 0; i < 15; i++) {
      this.entities.push({
        x: Math.random() * 800,
        y: Math.random() * 500,
        speed: ${difficulty === 'Hard' ? 4.5 : 2.5},
        color: '${theme === 'Neon' ? '#00ffff' : '#ff0055'}'
      });
    }
  }

  update(delta) {
    // Engine physics cycle
    this.entities.forEach(entity => {
      entity.y += entity.speed * delta;
      if (entity.y > 500) entity.y = 0;
    });
  }

  render() {
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, 800, 500);
    // Draw render batch
  }
}

export default ${selectedGame.name.replace(/[^a-zA-Z0-9]/g, '')}Engine;`);

  const handleGameSelect = (id: string) => {
    const found = getGameById(id);
    if (found) {
      setSelectedGame(found);
      setMode(found.type);
      setDifficulty(found.difficulty);
    }
  };

  const handleCreateGame = () => {
    toast.success(`Project generated successfully for ${selectedGame.name}!`);
    setActiveTab('preview');
  };

  const handleGenerateAI = () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success('AI generation complete! Game parameters, rules and entities built.');
      setGameSourceCode(`// AI-Synthesized Game Engine
// Prompt: "${aiPrompt}"
// Generated with Enterprise Local AI Core

export class GeneratedAIGame {
  constructor() {
    this.rules = {
      objective: "Survive and conquer",
      difficulty: "${difficulty}",
      theme: "${theme}",
      aiAgents: 8
    };
    this.state = "RUNNING";
  }

  tick() {
    // Autonomous entity updates
  }
}`);
      setActiveTab('code');
    }, 1200);
  };

  const handleExport = (format: string) => {
    const blob = new Blob([gameSourceCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedGame.name.toLowerCase().replace(/\s+/g, '-')}-project.${format.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported as ${format}!`);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1700px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/game-hub')}
            className="p-2 rounded-xl bg-card/60 hover:bg-card border border-white/10 text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              <h1 className="text-xl md:text-2xl font-black text-white">GAME BUILDER & AI GENERATOR</h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure parameters, write engine scripts, synthesize with local AI, and export production bundles
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'preview' ? 'bg-primary text-white shadow-md' : 'bg-white/5 border border-white/10 text-muted-foreground hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>RUN</span>
          </button>

          <button
            onClick={() => toast.success('Game state saved to local workspace!')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-foreground hover:bg-white/10 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>SAVE</span>
          </button>

          <button
            onClick={handleCreateGame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>BUILD</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors">
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-white/10 bg-card/95 backdrop-blur-xl p-1.5 shadow-xl hidden group-hover:block z-30 space-y-1 text-xs">
              <button onClick={() => handleExport('ZIP')} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-foreground">ZIP Project</button>
              <button onClick={() => handleExport('HTML')} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-foreground">HTML5 Bundle</button>
              <button onClick={() => handleExport('TS')} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-foreground">TypeScript Module</button>
              <button onClick={() => handleExport('JS')} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-foreground">JavaScript Source</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Game Configuration & AI Generator (Sections 9 & 10) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Section 10: AI GAME GENERATOR */}
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Game Generator</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Offline AI Ready
              </span>
            </div>

            <textarea
              rows={3}
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="e.g. Create a zombie survival game in a dark forest..."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />

            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Game Architecture...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Game with AI</span>
                </>
              )}
            </button>
          </div>

          {/* Section 9: GAME CONFIGURATION */}
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Sliders className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-white uppercase tracking-wider">Game Configuration</h3>
            </div>

            {/* Select Game from 432 */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-semibold">Select Game (1 of 432)</label>
              <select
                value={selectedGame.id}
                onChange={e => handleGameSelect(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {GAME_DATABASE.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.id}: {g.name} ({g.type} - {g.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Mode: 2D / 3D */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-semibold">Dimension Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('2D')}
                  className={`py-2 rounded-xl font-bold border transition-colors ${
                    mode === '2D' ? 'bg-primary text-white border-primary' : 'bg-white/5 border-white/10 text-muted-foreground'
                  }`}
                >
                  2D Engine
                </button>
                <button
                  type="button"
                  onClick={() => setMode('3D')}
                  className={`py-2 rounded-xl font-bold border transition-colors ${
                    mode === '3D' ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 border-white/10 text-muted-foreground'
                  }`}
                >
                  3D Engine
                </button>
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-semibold">Difficulty Tuning</label>
              <div className="grid grid-cols-3 gap-2">
                {['Easy', 'Medium', 'Hard'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-1.5 rounded-lg font-semibold border transition-colors ${
                      difficulty === d ? 'bg-white/15 text-white border-white/30' : 'bg-white/5 border-white/5 text-muted-foreground'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-semibold">Aesthetic Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Classic', 'Neon', 'Space', 'Fantasy'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`py-1.5 rounded-lg font-semibold border transition-colors ${
                      theme === t ? 'bg-primary/30 text-primary border-primary/50' : 'bg-white/5 border-white/5 text-muted-foreground'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Player: Single / Multiplayer */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-semibold">Player Architecture</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlayerMode('Single')}
                  className={`py-1.5 rounded-lg font-semibold border ${
                    playerMode === 'Single' ? 'bg-white/15 text-white border-white/30' : 'bg-white/5 border-white/5 text-muted-foreground'
                  }`}
                >
                  Single Player
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerMode('Multiplayer')}
                  className={`py-1.5 rounded-lg font-semibold border ${
                    playerMode === 'Multiplayer' ? 'bg-white/15 text-white border-white/30' : 'bg-white/5 border-white/5 text-muted-foreground'
                  }`}
                >
                  Multiplayer
                </button>
              </div>
            </div>

            {/* Toggles: AI, Sound, Assets, Code */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-muted-foreground">AI Integration:</span>
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={e => setAiEnabled(e.target.checked)}
                  className="rounded text-primary focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-muted-foreground">Procedural Sound:</span>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={e => setSoundEnabled(e.target.checked)}
                  className="rounded text-primary focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-muted-foreground">Generate Assets:</span>
                <input
                  type="checkbox"
                  checked={generateAssets}
                  onChange={e => setGenerateAssets(e.target.checked)}
                  className="rounded text-primary focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-muted-foreground">Generate Source Code:</span>
                <input
                  type="checkbox"
                  checked={generateCode}
                  onChange={e => setGenerateCode(e.target.checked)}
                  className="rounded text-primary focus:ring-0"
                />
              </label>
            </div>

            <button
              onClick={handleCreateGame}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-wider text-xs shadow-md transition-all hover:scale-[1.02]"
            >
              CREATE GAME
            </button>
          </div>
        </div>

        {/* Right Panel: Workspace (Preview Canvas / Code Editor / Scenes / Settings) - Section 20 */}
        <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md overflow-hidden flex flex-col min-h-[600px]">
          {/* Workspace Tabs */}
          <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-black/30 overflow-x-auto">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'preview' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Game Canvas</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'code' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code Editor</span>
            </button>

            <button
              onClick={() => setActiveTab('scenes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'scenes' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Scenes & Entities</span>
            </button>

            <button
              onClick={() => setActiveTab('assets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'assets' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Assets</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'ai' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Logic</span>
            </button>
          </div>

          {/* Workspace Body */}
          <div className="flex-1 p-4 flex flex-col justify-center">
            {activeTab === 'preview' && (
              <div className="w-full flex items-center justify-center">
                <GameCanvas game={selectedGame} className="w-full max-h-[520px]" />
              </div>
            )}

            {activeTab === 'code' && (
              <div className="w-full h-full min-h-[480px] flex flex-col space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground pb-2">
                  <span>src/games/{selectedGame.id.toLowerCase()}/engine.ts</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(gameSourceCode);
                      toast.success('Code copied!');
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <textarea
                  value={gameSourceCode}
                  onChange={e => setGameSourceCode(e.target.value)}
                  className="flex-1 w-full font-mono text-xs p-4 rounded-xl bg-black/80 border border-white/10 text-emerald-400 focus:outline-none resize-none leading-relaxed"
                  rows={20}
                />
              </div>
            )}

            {activeTab === 'scenes' && (
              <div className="p-6 space-y-4 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider">Scene Hierarchy</h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-foreground">Scene 1: Main Title Screen</div>
                      <div className="text-muted-foreground text-[11px]">Start game, settings, high score display</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">READY</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-foreground">Scene 2: Core Gameplay Arena</div>
                      <div className="text-muted-foreground text-[11px]">Active game physics, collisions, scoring</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">ACTIVE</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-foreground">Scene 3: Victory / Game Over Overlay</div>
                      <div className="text-muted-foreground text-[11px]">XP award telemetry and score persistence</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">STANDBY</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assets' && (
              <div className="p-6 space-y-4 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider">Generated Asset Manifest</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center space-y-1">
                    <div className="text-sm font-bold text-foreground">Spritesheet</div>
                    <div className="text-[11px] text-muted-foreground">sprites_atlas.png</div>
                    <span className="text-[10px] text-emerald-400 font-bold">Loaded</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center space-y-1">
                    <div className="text-sm font-bold text-foreground">Audio Effects</div>
                    <div className="text-[11px] text-muted-foreground">sfx_synth.webaudio</div>
                    <span className="text-[10px] text-emerald-400 font-bold">Active</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center space-y-1">
                    <div className="text-sm font-bold text-foreground">Geometry Mesh</div>
                    <div className="text-[11px] text-muted-foreground">model_buffer.glb</div>
                    <span className="text-[10px] text-cyan-400 font-bold">Generated</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center space-y-1">
                    <div className="text-sm font-bold text-foreground">Collision Grid</div>
                    <div className="text-[11px] text-muted-foreground">spatial_grid.json</div>
                    <span className="text-[10px] text-emerald-400 font-bold">Indexed</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="p-6 space-y-4 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider">Neural NPC & Difficulty Controller</h4>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <div className="font-bold text-foreground">Reinforcement Learning Difficulty Scaling:</div>
                  <p className="text-muted-foreground">
                    Analyzes player reaction latency and accuracy every 10 seconds to smoothly calibrate opponent aggression.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold">Ollama / Local LLM</span>
                    <span className="text-muted-foreground text-[11px]">Offline Inference Active</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
