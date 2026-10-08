import React, { useState } from 'react';
import {
  Palette, Search, Sparkles, ArrowRight, Check, Compass,
  Camera, Users, Building2, Trees, Rocket, Landmark, Cpu,
  Network, Layout, Briefcase, BookOpen, Gamepad2, Clapperboard,
  Car, Atom, Sprout, Shield, FileCheck, Share2, Package, Map,
  Box, Flame, Wand2, GraduationCap, Brain
} from 'lucide-react';
import { useImageStudioStore } from '@/store/imageStudioStore';
import { ALL_30_CATEGORIES } from '@/data/imageStudioPresets';
import { CategoryDefinition } from '@/types/imageStudio';
import toast from 'react-hot-toast';

export const StyleLibraryPanel: React.FC = () => {
  const { setGenerationSettings, setMode } = useImageStudioStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  // Icon mapping
  const iconMap: Record<string, any> = {
    Palette, Camera, Users, Building2, Trees, Rocket, Sparkles, Landmark,
    Cpu, Network, Layout, Briefcase, BookOpen, Gamepad2, Clapperboard,
    Sparkle: Sparkles, Utensils: Palette, Car, Atom, Sprout, Shield,
    FileCheck, Share2, Package, Map, Box, Flame, Wand2, GraduationCap, Brain
  };

  const filteredCategories = ALL_30_CATEGORIES.filter((cat) => {
    const matchesName = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDesc = cat.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSub = cat.subtypes.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesName || matchesDesc || matchesSub;
  });

  const handleSelectStyle = (cat: CategoryDefinition, subtype?: string) => {
    const styleName = subtype || cat.subtypes[0];
    setGenerationSettings({
      category: cat.name,
      subcategory: styleName,
      style: styleName,
      aspectRatio: cat.recommendedAspect || '1:1',
      prompt: cat.suggestedPrompt || `High-quality ${styleName} artwork in ${cat.name}`
    });
    setMode('generate');
    toast.success(`Loaded style preset: ${cat.name} → ${styleName}`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-md p-5 rounded-2xl border border-border/70 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-400" />
            Complete 30 Categories & Sub-Style Catalog
          </h2>
          <p className="text-xs text-muted-foreground">
            Explore and generate across all 30 foundational artistic, technical, architectural, and educational domains.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search across all 30 categories..."
            className="w-full bg-secondary/60 border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-pink-500"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.map((cat) => {
          const Icon = iconMap[cat.iconName] || Palette;
          return (
            <div
              key={cat.id}
              className="group bg-card/85 hover:bg-card rounded-2xl border border-border/80 hover:border-pink-500/50 p-5 space-y-3.5 transition-all shadow-md hover:shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center border border-border/60 text-pink-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-pink-400 tracking-wider uppercase block">
                        Category {cat.number}
                      </span>
                      <h3 className="text-sm font-bold text-foreground leading-tight">
                        {cat.name}
                      </h3>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {cat.subtypes.length} types
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {cat.description}
                </p>

                {/* Subtypes Pills (First 6 visible) */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cat.subtypes.slice(0, 6).map((sub) => (
                    <button
                      key={sub}
                      onClick={() => handleSelectStyle(cat, sub)}
                      className="px-2 py-0.5 rounded-md bg-secondary/60 hover:bg-pink-500 hover:text-white border border-border/40 text-[10px] text-muted-foreground hover:border-transparent transition-all"
                    >
                      {sub}
                    </button>
                  ))}
                  {cat.subtypes.length > 6 && (
                    <span className="text-[10px] text-muted-foreground self-center px-1">
                      +{cat.subtypes.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSelectStyle(cat)}
                className="w-full py-2 rounded-xl bg-secondary/80 group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-purple-600 text-muted-foreground group-hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-border/50 group-hover:border-transparent transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create with Category {cat.number}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
