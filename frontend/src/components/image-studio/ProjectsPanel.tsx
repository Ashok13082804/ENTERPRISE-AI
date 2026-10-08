import React, { useState, useEffect } from 'react';
import {
  FolderHeart, Plus, Edit3, Trash2, Copy, Calendar, Layers as LayersIcon,
  Check, ArrowRight, Sparkles
} from 'lucide-react';
import { useImageStudioStore } from '@/store/imageStudioStore';
import { ImageStudioService } from '@/services/imageStudioService';
import { StudioProject } from '@/types/imageStudio';
import { SAMPLE_PROJECTS } from '@/data/imageStudioPresets';
import toast from 'react-hot-toast';

export const ProjectsPanel: React.FC = () => {
  const {
    savedProjects, setSavedProjects,
    loadProject, setMode,
    clearCanvas, setCanvasSize, setCurrentProjectName
  } = useImageStudioStore();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const projs = await ImageStudioService.fetchProjects();
        setSavedProjects(projs);
      } catch (e) {
        setSavedProjects(SAMPLE_PROJECTS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [setSavedProjects]);

  const handleCreateNew = (preset: 'square' | 'widescreen' | 'story') => {
    clearCanvas();
    const dims = preset === 'widescreen'
      ? { w: 1280, h: 720, name: 'Untitled Widescreen (16:9)' }
      : preset === 'story'
      ? { w: 720, h: 1280, name: 'Untitled Story (9:16)' }
      : { w: 1024, h: 1024, name: 'Untitled Square (1:1)' };

    setCanvasSize(dims.w, dims.h);
    setCurrentProjectName(dims.name);
    setMode('edit');
    toast.success(`Created ${dims.name}`);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await ImageStudioService.deleteProject(id);
      setSavedProjects(savedProjects.filter((p) => p.id !== id));
      toast.success('Project deleted');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const handleDuplicate = (project: StudioProject, e: React.MouseEvent) => {
    e.stopPropagation();
    const dup: StudioProject = {
      ...project,
      id: `proj_${Date.now()}`,
      name: `${project.name} (Copy)`,
      updatedAt: new Date().toISOString()
    };
    ImageStudioService.saveProject(dup);
    setSavedProjects([dup, ...savedProjects]);
    toast.success(`Duplicated ${project.name}`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-md p-5 rounded-2xl border border-border/70 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <FolderHeart className="w-5 h-5 text-blue-400" />
            My Editable Studio Projects
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage your layered projects, templates, and diagram compositions. Every element remains completely editable.
          </p>
        </div>

        {/* New Project Starters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleCreateNew('square')}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Square (1:1)</span>
          </button>
          <button
            onClick={() => handleCreateNew('widescreen')}
            className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border"
          >
            <span>Widescreen (16:9)</span>
          </button>
          <button
            onClick={() => handleCreateNew('story')}
            className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border"
          >
            <span>Story (9:16)</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {savedProjects.map((proj) => (
          <div
            key={proj.id}
            onClick={() => loadProject(proj)}
            className="group bg-card/85 hover:bg-card rounded-2xl border border-border/80 hover:border-blue-500/50 overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            {/* Thumbnail */}
            <div className="aspect-video w-full bg-secondary/50 relative overflow-hidden flex items-center justify-center">
              {proj.thumbnail ? (
                <img
                  src={proj.thumbnail}
                  alt={proj.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <LayersIcon className="w-8 h-8 text-blue-400/50" />
                  <span className="text-xs font-medium">Layered Canvas</span>
                </div>
              )}
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white">
                {proj.canvas.width} × {proj.canvas.height}
              </div>
            </div>

            {/* Details */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-blue-400 transition-colors">
                  {proj.name}
                </h3>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <LayersIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>{proj.layers.length} layers</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{proj.updatedAt ? proj.updatedAt.split(' ')[0] : 'Today'}</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    loadProject(proj);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Open in Studio</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleDuplicate(proj, e)}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                    title="Duplicate Project"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(proj.id, e)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
