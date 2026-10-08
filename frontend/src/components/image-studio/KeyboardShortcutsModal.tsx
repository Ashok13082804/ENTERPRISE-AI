import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import { useImageStudioStore } from '@/store/imageStudioStore';

export const KeyboardShortcutsModal: React.FC = () => {
  const { shortcutsModalOpen, setShortcutsModalOpen } = useImageStudioStore();

  if (!shortcutsModalOpen) return null;

  const shortcuts = [
    { key: 'Ctrl/Cmd + Z', desc: 'Undo last editing action' },
    { key: 'Ctrl/Cmd + Shift + Z', desc: 'Redo previously undone action' },
    { key: 'Ctrl/Cmd + D', desc: 'Duplicate selected layer' },
    { key: 'Delete / Backspace', desc: 'Delete currently selected layer' },
    { key: 'Ctrl/Cmd + S', desc: 'Save project to cloud/local storage' },
    { key: 'Ctrl/Cmd + E', desc: 'Open export modal (PNG, JPG, PDF)' },
    { key: 'Ctrl/Cmd + +', desc: 'Zoom in canvas' },
    { key: 'Ctrl/Cmd + -', desc: 'Zoom out canvas' },
    { key: 'Space + Drag', desc: 'Pan canvas workspace freely' },
    { key: 'V', desc: 'Select / Move pointer tool' },
    { key: 'H', desc: 'Hand / Pan viewport tool' },
    { key: 'B', desc: 'Freehand Doodle / Brush tool' },
    { key: 'T', desc: 'Typography / Text layer tool' },
    { key: 'U', desc: 'Shape insertion tool' },
    { key: 'E', desc: 'Eraser brush tool' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-base text-foreground">Studio Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setShortcutsModalOpen(false)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/40 text-xs transition-colors"
            >
              <span className="text-muted-foreground font-medium">{sc.desc}</span>
              <kbd className="px-2 py-1 rounded-md bg-secondary text-foreground font-mono font-semibold border border-border shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
