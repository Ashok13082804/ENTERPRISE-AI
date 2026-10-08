import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Eye, Wrench, Heart, Star, Bot, Users, Sparkles, BookOpen } from 'lucide-react';
import { GameRecord } from '@/data/gameDatabase';
import { useGameHistoryStore } from '@/store/gameHistoryStore';
import { GameArtPicture } from './GameArtIllustrations';

interface GameCardProps {
  game: GameRecord;
  onPlay?: (game: GameRecord) => void;
  onManual?: (game: GameRecord) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay, onManual }) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, getHighScore } = useGameHistoryStore();
  const favorite = isFavorite(game.id);
  const highScore = getHighScore(game.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay(game);
    } else {
      navigate(`/game-hub/${game.id.toLowerCase()}/play`);
    }
  };

  const handleManualClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onManual) {
      onManual(game);
    } else {
      navigate(`/game-hub/${game.id.toLowerCase()}?tab=manual`);
    }
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/game-hub/${game.id.toLowerCase()}`);
  };

  const handleBuildClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/game-hub/${game.id.toLowerCase()}/build`);
  };

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(game.id);
  };

  return (
    <div
      onClick={handleViewClick}
      className="group relative flex flex-col rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer overflow-hidden"
    >
      {/* Visual Accent Glow on Hover */}
      <div className={`absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br ${game.accentColor} opacity-15 blur-2xl group-hover:opacity-30 transition-opacity`} />

      {/* Card Header: Preview Thumbnail / Stylized Genre Art */}
      <div className={`relative w-full h-36 rounded-xl bg-gradient-to-br ${game.accentColor} p-3 flex flex-col justify-between overflow-hidden shadow-inner`}>
        {/* Game Thematic Artwork / Picture */}
        <GameArtPicture game={game} />

        {/* Contrast protection gradient for text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20 z-0" />

        <div className="relative z-10 flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase bg-black/40 text-white backdrop-blur-sm border border-white/20">
            {game.id}
          </span>

          {/* Favorite button */}
          <button
            onClick={handleFavClick}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-transform active:scale-90"
            title={favorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${favorite ? 'text-red-400 fill-red-400' : 'text-white/80 hover:text-red-400'}`} />
          </button>
        </div>

        {/* Big Game Icon / Title watermark */}
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <div className="text-[10px] font-medium text-white/80 uppercase tracking-widest">{game.category}</div>
            <div className="text-base font-black text-white leading-tight drop-shadow-md truncate max-w-[170px]">
              {game.name}
            </div>
          </div>

          <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm text-[10px] font-bold text-white border border-white/10">
            {game.type === '3D' ? (
              <span className="text-amber-300">3D</span>
            ) : (
              <span className="text-cyan-300">2D</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 flex flex-col justify-between pt-3">
        <div>
          {/* Tags & Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-muted-foreground">
              {game.genre}
            </span>

            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
              game.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              game.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {game.difficulty}
            </span>

            {game.is_ai && (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" title="AI Enabled">
                <Bot className="w-2.5 h-2.5" />
                <span>AI</span>
              </span>
            )}

            {game.is_multiplayer && (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20" title="Multiplayer Supported">
                <Users className="w-2.5 h-2.5" />
                <span>2P</span>
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {game.description}
          </p>
        </div>

        {/* High Score & Actions */}
        <div className="pt-2 border-t border-white/5">
          {highScore > 0 && (
            <div className="flex items-center justify-between text-[11px] mb-2 px-1 text-muted-foreground">
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <Star className="w-3 h-3 fill-amber-400" />
                High Score:
              </span>
              <span className="font-mono font-bold text-foreground">{highScore.toLocaleString()}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePlayClick}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-102 active:scale-98"
              title="Launch Playable Game"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play</span>
            </button>

            <button
              onClick={handleManualClick}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all hover:scale-102 active:scale-98"
              title="Read Official Game Manual & How-to-Play Rules"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Manual</span>
            </button>

            <button
              onClick={handleViewClick}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-foreground text-xs font-medium border border-white/10 transition-colors"
              title="View Details & History"
            >
              <Eye className="w-3 h-3" />
              <span>Details</span>
            </button>

            <button
              onClick={handleBuildClick}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground text-xs font-medium border border-white/10 transition-colors"
              title="Open in Game Builder"
            >
              <Wrench className="w-3 h-3" />
              <span>Build</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
