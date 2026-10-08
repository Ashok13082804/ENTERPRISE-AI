import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2, Search, Filter, Trophy, Sparkles, Star, Zap, Bot,
  Users, Layers, Flame, CheckCircle2, RotateCcw, Compass, ArrowRight,
  TrendingUp, Award, Clock, Heart, History, Terminal
} from 'lucide-react';
import { GAME_DATABASE, GAME_CATEGORIES, getCategoryCounts, GameRecord } from '@/data/gameDatabase';
import { useGameHistoryStore } from '@/store/gameHistoryStore';
import { GameCard } from '@/components/gamehub/GameCard';
import { GameManualModal } from '@/components/gamehub/GameManualModal';

export const GameHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { getPlayerLevel, getPlayerStats, favorites, recentGameIds, lastPlayedSession } = useGameHistoryStore();
  const playerLevel = getPlayerLevel();
  const playerStats = getPlayerStats();
  const categoryCounts = useMemo(() => getCategoryCounts(), []);

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedDimension, setSelectedDimension] = useState<string>('All'); // All | 2D | 3D
  const [selectedManualGame, setSelectedManualGame] = useState<GameRecord | null>(null);

  // Top navigation tabs as requested by Section 2
  const NAV_TABS = [
    { id: 'All', label: 'All Games', count: GAME_DATABASE.length },
    { id: '2D', label: '2D Games', count: categoryCounts.is_2d },
    { id: '3D', label: '3D Games', count: categoryCounts.is_3d },
    { id: 'AI', label: 'AI Games', count: categoryCounts.is_ai },
    { id: 'Multiplayer', label: 'Multiplayer', count: categoryCounts.is_multiplayer },
    { id: 'Sports', label: 'Sports', count: categoryCounts['Sports Games'] || 16 },
    { id: 'Arcade', label: 'Arcade', count: categoryCounts['Arcade Games'] || 20 },
    { id: 'Puzzle', label: 'Puzzle', count: categoryCounts['Puzzle Games'] || 25 },
    { id: 'Racing', label: 'Racing', count: (categoryCounts['Racing Games'] || 15) + (categoryCounts['3D Racing Games'] || 17) },
    { id: 'RPG', label: 'RPG', count: (categoryCounts['RPG Games'] || 14) + (categoryCounts['3D RPG'] || 13) },
    { id: 'Horror', label: 'Horror', count: (categoryCounts['Horror Games'] || 15) + (categoryCounts['3D Horror Games'] || 16) },
    { id: 'Strategy', label: 'Strategy', count: categoryCounts['Strategy Games'] || 16 },
    { id: 'Simulation', label: 'Simulation', count: (categoryCounts['Simulation Games'] || 16) + (categoryCounts['3D Simulation'] || 18) },
    { id: 'Favorites', label: 'Favorites', count: favorites.length },
    { id: 'Recently Played', label: 'Recently Played', count: recentGameIds.length },
    { id: 'My Games', label: 'My Games', count: favorites.length + recentGameIds.length },
  ];

  // Dynamic search & filter logic
  const filteredGames = useMemo(() => {
    let result = GAME_DATABASE;

    // Filter by Top Tab
    if (activeTab === '2D') {
      result = result.filter(g => g.is_2d);
    } else if (activeTab === '3D') {
      result = result.filter(g => g.is_3d);
    } else if (activeTab === 'AI') {
      result = result.filter(g => g.is_ai);
    } else if (activeTab === 'Multiplayer') {
      result = result.filter(g => g.is_multiplayer);
    } else if (activeTab === 'Favorites') {
      result = result.filter(g => favorites.includes(g.id));
    } else if (activeTab === 'Recently Played') {
      result = result.filter(g => recentGameIds.includes(g.id));
    } else if (activeTab === 'My Games') {
      result = result.filter(g => favorites.includes(g.id) || recentGameIds.includes(g.id));
    } else if (activeTab !== 'All') {
      result = result.filter(g =>
        g.category.toLowerCase().includes(activeTab.toLowerCase()) ||
        g.genre.toLowerCase().includes(activeTab.toLowerCase())
      );
    }

    // Filter by Dimension dropdown
    if (selectedDimension === '2D') {
      result = result.filter(g => g.is_2d);
    } else if (selectedDimension === '3D') {
      result = result.filter(g => g.is_3d);
    }

    // Filter by Difficulty
    if (selectedDifficulty !== 'All') {
      result = result.filter(g => g.difficulty === selectedDifficulty);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.id.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.genre.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.difficulty.toLowerCase().includes(q) ||
        g.engine.toLowerCase().includes(q) ||
        g.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [activeTab, selectedDimension, selectedDifficulty, searchQuery, favorites, recentGameIds]);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1700px] mx-auto min-h-screen">
      {/* 1. HERO HEADER: Title, Stats & Player Level Badge */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 p-6 md:p-10 shadow-2xl backdrop-blur-xl">
        {/* Glow backdrop circles */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary-foreground text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Full-Stack 2D + 3D Game Engineering Engine</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">
              432 GAME DEVELOPMENT HUB
            </h1>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Unified multi-genre gaming ecosystem featuring all 432 playable browser games,
              instant Three.js WebGL and Canvas 2D engines, live score telemetries, and AI builder workflows.
            </p>
          </div>

          {/* User Player Level Card */}
          <div className="w-full lg:w-auto flex-shrink-0 bg-card/70 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-center gap-5">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
              <Award className="w-8 h-8 text-white" />
              <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-black text-[10px] font-black text-amber-300 border border-amber-400/40">
                LVL {playerLevel.level}
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1.5 min-w-[200px]">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs text-muted-foreground uppercase font-semibold">User Game Level</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-amber-400 font-bold">
                  {playerLevel.rankBadge}
                </span>
              </div>
              <div className="text-base font-extrabold text-white truncate">{playerLevel.title}</div>
              {/* Progress bar */}
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${playerLevel.progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
                <span>{playerLevel.currentXP.toLocaleString()} XP</span>
                <span>{playerLevel.progressPercent}% to Lvl {playerLevel.level + 1}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. DYNAMIC STATISTICS BAR */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white/5 border border-white/5 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-xs text-muted-foreground font-medium">Total Games</div>
            <div className="text-2xl font-black text-white tabular-nums">{categoryCounts.total}</div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> 100% Registered
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-xs text-muted-foreground font-medium">2D Games</div>
            <div className="text-2xl font-black text-cyan-400 tabular-nums">{categoryCounts.is_2d}</div>
            <div className="text-[10px] text-muted-foreground">Canvas & Sprites</div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-xs text-muted-foreground font-medium">3D Games</div>
            <div className="text-2xl font-black text-amber-400 tabular-nums">{categoryCounts.is_3d}</div>
            <div className="text-[10px] text-muted-foreground">Three.js WebGL</div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-xs text-muted-foreground font-medium">AI Games</div>
            <div className="text-2xl font-black text-indigo-400 tabular-nums">{categoryCounts.is_ai}</div>
            <div className="text-[10px] text-muted-foreground">Neural & Generative</div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-xs text-muted-foreground font-medium">Multiplayer</div>
            <div className="text-2xl font-black text-fuchsia-400 tabular-nums">{categoryCounts.is_multiplayer}</div>
            <div className="text-[10px] text-muted-foreground">Co-op & Versus</div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-xs text-muted-foreground font-medium">Player Matches</div>
            <div className="text-2xl font-black text-emerald-400 tabular-nums">{playerStats.totalGamesPlayed}</div>
            <div className="text-[10px] text-muted-foreground">{playerStats.totalScore.toLocaleString()} Total Pts</div>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & ADVANCED FILTERS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input Box */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search 432 games... (e.g. snake, zombie, racing, 3D, chess, FPS)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-card/70 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters and Validation Trigger */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Dimension Filter */}
          <select
            value={selectedDimension}
            onChange={e => setSelectedDimension(e.target.value)}
            className="bg-card/70 border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Dimensions (2D + 3D)</option>
            <option value="2D">2D Games Only</option>
            <option value="3D">3D Games Only</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="bg-card/70 border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Extreme">Extreme</option>
          </select>

          {/* Verification Report link */}
          <button
            onClick={() => navigate('/game-hub/validation')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-foreground border border-white/10 transition-colors"
            title="View 432 Game Automated Validation Report"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Validation Report</span>
          </button>
        </div>
      </div>

      {/* 4. TOP NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {NAV_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all select-none ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                  : 'bg-card/50 hover:bg-card/80 text-muted-foreground hover:text-foreground border border-white/5'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 5. MATCH COUNT BANNER */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing <strong className="text-foreground font-bold">{filteredGames.length}</strong> of{' '}
          <strong className="text-foreground font-bold">432</strong> games
        </span>
        {searchQuery && (
          <span>
            Filtering by: <em className="text-foreground">"{searchQuery}"</em>
          </span>
        )}
      </div>

      {/* 6. GAME CARDS RESPONSIVE GRID (4-6 per row desktop, 2-4 tablet, 1-2 mobile) */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredGames.map(game => (
            <GameCard
              key={game.id}
              game={game}
              onManual={(g) => setSelectedManualGame(g)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-3xl border border-dashed border-white/10 bg-card/30 p-8">
          <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-bold text-white mb-1">No games match your search</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
            Try adjusting your search terms, changing the category tab, or resetting filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveTab('All');
              setSelectedDimension('All');
              setSelectedDifficulty('All');
            }}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Global Game Manual Modal for all 432 Games */}
      <GameManualModal
        game={selectedManualGame}
        isOpen={!!selectedManualGame}
        onClose={() => setSelectedManualGame(null)}
      />
    </div>
  );
};
