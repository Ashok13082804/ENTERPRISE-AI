import React, { useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useImageStudioStore } from '@/store/imageStudioStore';
import { StudioMode } from '@/types/imageStudio';
import { StudioHeader } from '@/components/image-studio/StudioHeader';
import { StudioSidebar } from '@/components/image-studio/StudioSidebar';
import { StudioCanvas } from '@/components/image-studio/StudioCanvas';
import { StudioPropertiesPanel } from '@/components/image-studio/StudioPropertiesPanel';
import { GeneratePanel } from '@/components/image-studio/GeneratePanel';
import { TransformPanel } from '@/components/image-studio/TransformPanel';
import { CollagePanel } from '@/components/image-studio/CollagePanel';
import { StyleLibraryPanel } from '@/components/image-studio/StyleLibraryPanel';
import { ProjectsPanel } from '@/components/image-studio/ProjectsPanel';
import { HistoryPanel } from '@/components/image-studio/HistoryPanel';
import { ExportModal } from '@/components/image-studio/ExportModal';
import { KeyboardShortcutsModal } from '@/components/image-studio/KeyboardShortcutsModal';
import { ImageStudioService } from '@/services/imageStudioService';
import toast from 'react-hot-toast';

export default function ImageStudioPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { mode: routeMode } = useParams<{ mode?: string }>();
  const {
    mode, setMode,
    undo, redo, deleteLayer, duplicateLayer, selectedLayerId,
    setExportModalOpen, setShortcutsModalOpen,
    zoom, setZoom,
    currentProjectId, currentProjectName, layers, canvasWidth, canvasHeight, canvasBgColor,
    setActiveTool
  } = useImageStudioStore();

  // Sync route / query params with mode
  useEffect(() => {
    const tab = searchParams.get('tab') || routeMode;
    if (tab && ['generate', 'edit', 'transform', 'collage', 'styles', 'projects', 'history'].includes(tab)) {
      setMode(tab as StudioMode);
    }
  }, [searchParams, routeMode, setMode]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl/Cmd + Z
      if (cmdOrCtrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl/Cmd + Shift + Z
      if (cmdOrCtrl && e.key.toLowerCase() === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }

      // Duplicate: Ctrl/Cmd + D
      if (cmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedLayerId) duplicateLayer(selectedLayerId);
        return;
      }

      // Save: Ctrl/Cmd + S
      if (cmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        ImageStudioService.saveProject({
          id: currentProjectId || `proj_${Date.now()}`,
          name: currentProjectName,
          thumbnail: layers.find(l => l.type === 'image')?.src || '',
          canvas: { width: canvasWidth, height: canvasHeight, backgroundColor: canvasBgColor },
          layers,
          promptHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        toast.success('Project saved (Ctrl+S)');
        return;
      }

      // Export: Ctrl/Cmd + E
      if (cmdOrCtrl && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setExportModalOpen(true);
        return;
      }

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLayerId) {
          e.preventDefault();
          deleteLayer(selectedLayerId);
        }
        return;
      }

      // Zoom In: Ctrl/Cmd + = or +
      if (cmdOrCtrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom(zoom + 0.15);
        return;
      }

      // Zoom Out: Ctrl/Cmd + -
      if (cmdOrCtrl && e.key === '-') {
        e.preventDefault();
        setZoom(zoom - 0.15);
        return;
      }

      // Tool Shortcuts
      if (!cmdOrCtrl && !e.shiftKey && !e.altKey) {
        const k = e.key.toLowerCase();
        if (k === 'v') setActiveTool('select');
        if (k === 'h') setActiveTool('pan');
        if (k === 'b') setActiveTool('draw');
        if (k === 't') setActiveTool('text');
        if (k === 'u') setActiveTool('shape');
        if (k === 'e') setActiveTool('eraser');
        if (k === 'c') setActiveTool('crop');
        if (k === 'i') setActiveTool('inpaint');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo, redo, deleteLayer, duplicateLayer, selectedLayerId,
    setExportModalOpen, zoom, setZoom,
    currentProjectId, currentProjectName, layers, canvasWidth, canvasHeight, canvasBgColor,
    setActiveTool
  ]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* 1. Header Navigation & Controls */}
      <StudioHeader />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <StudioSidebar />

        {/* Center Main View Area depending on active mode */}
        <main className="flex-1 flex overflow-hidden relative">
          {mode === 'edit' ? (
            <>
              <StudioCanvas />
              <StudioPropertiesPanel />
            </>
          ) : mode === 'generate' ? (
            <GeneratePanel />
          ) : mode === 'transform' ? (
            <TransformPanel />
          ) : mode === 'collage' ? (
            <CollagePanel />
          ) : mode === 'styles' ? (
            <StyleLibraryPanel />
          ) : mode === 'projects' ? (
            <ProjectsPanel />
          ) : (
            <HistoryPanel />
          )}
        </main>
      </div>

      {/* 3. Export Modal */}
      <ExportModal />

      {/* 4. Keyboard Shortcuts Cheat Sheet */}
      <KeyboardShortcutsModal />
    </div>
  );
}
