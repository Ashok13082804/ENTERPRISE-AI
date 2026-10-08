import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useImageStudioStore } from '@/store/imageStudioStore';
import { Layer } from '@/types/imageStudio';
import { Eye, Move, RotateCw, ZoomIn, ZoomOut, Image as ImageIcon } from 'lucide-react';

export const StudioCanvas: React.FC = () => {
  const {
    canvasWidth, canvasHeight, canvasBgColor,
    zoom, setZoom, panOffset, setPanOffset,
    layers, selectedLayerId, setSelectedLayerId,
    updateLayer, addLayer, pushHistory,
    activeTool, activeDrawTool, drawColor, brushSize, drawOpacity,
    mode, activeTransformation, beforeAfterSliderPos, setBeforeAfterSliderPos
  } = useImageStudioStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null); // handle name: 'nw' | 'se' etc.
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialLayerState, setInitialLayerState] = useState<Layer | null>(null);

  // Doodle state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDoodlePoints, setCurrentDoodlePoints] = useState<Array<{ x: number; y: number }>>([]);

  // Space key pan state
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle keyboard shortcuts for space panning & delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Auto-fit canvas to container on mount & resize
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth > 100 && clientHeight > 100) {
        const fitZoom = Math.min((clientWidth - 64) / canvasWidth, (clientHeight - 64) / canvasHeight, 1);
        if (fitZoom > 0.15 && fitZoom < 1.0) {
          setZoom(Math.round(fitZoom * 100) / 100);
        }
      }
    }
  }, [canvasWidth, canvasHeight, setZoom]);

  // Convert screen coordinates to canvas coordinate space
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (clientX - rect.left) / zoom;
    const y = (clientY - rect.top) / zoom;
    return { x, y };
  }, [zoom]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 1. Clear & Background
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Checkerboard pattern for transparency
    const checkSize = 16;
    for (let x = 0; x < canvasWidth; x += checkSize) {
      for (let y = 0; y < canvasHeight; y += checkSize) {
        ctx.fillStyle = ((x / checkSize + y / checkSize) % 2 === 0) ? '#18181b' : '#27272a';
        ctx.fillRect(x, y, checkSize, checkSize);
      }
    }

    // Canvas Background Color
    if (canvasBgColor && canvasBgColor !== 'transparent') {
      ctx.fillStyle = canvasBgColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // 2. Render Layers Sorted by Z-Index
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

    sortedLayers.forEach((layer) => {
      if (!layer.visible) return;

      ctx.save();
      ctx.globalAlpha = layer.opacity ?? 1;
      ctx.globalCompositeOperation = (layer.blendMode as GlobalCompositeOperation) || 'source-over';

      // Position & Rotate
      const centerX = layer.x + layer.width / 2;
      const centerY = layer.y + layer.height / 2;
      ctx.translate(centerX, centerY);
      if (layer.rotation) {
        ctx.rotate((layer.rotation * Math.PI) / 180);
      }
      ctx.translate(-layer.width / 2, -layer.height / 2);

      // Render based on layer type
      if (layer.type === 'image' && layer.src) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = layer.src;

        // Apply visual CSS adjustments if image is loaded
        if (img.complete && img.naturalWidth !== 0) {
          const adj = layer.adjustments;
          if (adj) {
            const b = 100 + (adj.brightness || 0);
            const c = 100 + (adj.contrast || 0);
            const s = 100 + (adj.saturation || 0);
            const blur = (adj.blur || 0) / 10;
            const sepia = adj.sepia || 0;
            const inv = adj.invert ? 100 : 0;
            const gray = adj.grayscale ? 100 : 0;
            ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) blur(${blur}px) sepia(${sepia}%) invert(${inv}%) grayscale(${gray}%)`;
          }
          ctx.drawImage(img, 0, 0, layer.width, layer.height);
          ctx.filter = 'none';
        }
      } else if (layer.type === 'shape') {
        ctx.fillStyle = layer.fillColor || '#38bdf8';
        ctx.strokeStyle = layer.strokeColor || '#ffffff';
        ctx.lineWidth = layer.strokeWidth || 0;

        const w = layer.width;
        const h = layer.height;

        ctx.beginPath();
        if (layer.shapeType === 'circle') {
          ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
        } else if (layer.shapeType === 'triangle') {
          ctx.moveTo(w / 2, 0);
          ctx.lineTo(w, h);
          ctx.lineTo(0, h);
          ctx.closePath();
        } else if (layer.shapeType === 'heart') {
          const d = Math.min(w, h);
          ctx.moveTo(w / 2, h * 0.8);
          ctx.bezierCurveTo(w / 2, h * 0.7, 0, h * 0.45, 0, h * 0.25);
          ctx.bezierCurveTo(0, 0, w / 2, 0, w / 2, h * 0.25);
          ctx.bezierCurveTo(w / 2, 0, w, 0, w, h * 0.25);
          ctx.bezierCurveTo(w, h * 0.45, w / 2, h * 0.7, w / 2, h * 0.8);
        } else if (layer.shapeType === 'star') {
          const cx = w / 2;
          const cy = h / 2;
          const spikes = 5;
          const outerR = Math.min(w, h) / 2;
          const innerR = outerR * 0.45;
          let rot = (Math.PI / 2) * 3;
          let step = Math.PI / spikes;
          ctx.moveTo(cx, cy - outerR);
          for (let i = 0; i < spikes; i++) {
            let x = cx + Math.cos(rot) * outerR;
            let y = cy + Math.sin(rot) * outerR;
            ctx.lineTo(x, y);
            rot += step;
            x = cx + Math.cos(rot) * innerR;
            y = cy + Math.sin(rot) * innerR;
            ctx.lineTo(x, y);
            rot += step;
          }
          ctx.lineTo(cx, cy - outerR);
          ctx.closePath();
        } else {
          // Rounded rectangle
          const r = layer.cornerRadius || 8;
          ctx.roundRect ? ctx.roundRect(0, 0, w, h, r) : ctx.rect(0, 0, w, h);
        }

        if (layer.fillColor && layer.fillColor !== 'transparent') ctx.fill();
        if (layer.strokeWidth && layer.strokeWidth > 0) ctx.stroke();
      } else if (layer.type === 'text') {
        const fontSize = layer.fontSize || 24;
        const fontStyle = layer.fontStyle || 'normal';
        const fontWeight = layer.fontWeight || 600;
        const fontFamily = layer.fontFamily || 'Inter, sans-serif';

        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = layer.fontColor || '#ffffff';
        ctx.textBaseline = 'top';

        if (layer.textShadow) {
          ctx.shadowColor = layer.shadowColor || 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = layer.shadowBlur || 8;
        }

        // Draw text
        ctx.fillText(layer.text || 'Text', 0, 0, layer.width);
        ctx.shadowColor = 'transparent';
      } else if (layer.type === 'doodle' && layer.points && layer.points.length > 1) {
        ctx.strokeStyle = layer.drawColor || '#38bdf8';
        ctx.lineWidth = layer.brushSize || 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(layer.points[0].x, layer.points[0].y);
        for (let i = 1; i < layer.points.length; i++) {
          ctx.lineTo(layer.points[i].x, layer.points[i].y);
        }
        ctx.stroke();
      }

      ctx.restore();
    });

    // 3. Render Current Active Doodle in progress
    if (isDrawing && currentDoodlePoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = brushSize;
      ctx.globalAlpha = drawOpacity;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(currentDoodlePoints[0].x, currentDoodlePoints[0].y);
      for (let i = 1; i < currentDoodlePoints.length; i++) {
        ctx.lineTo(currentDoodlePoints[i].x, currentDoodlePoints[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [
    canvasWidth, canvasHeight, canvasBgColor, layers,
    isDrawing, currentDoodlePoints, drawColor, brushSize, drawOpacity
  ]);

  // Handle Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    // 1. Pan Canvas (Space or Pan Tool)
    if (isSpacePressed || activeTool === 'pan') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    const { x, y } = getCanvasCoords(e.clientX, e.clientY);

    // 2. Freehand Doodle
    if (activeTool === 'draw') {
      setIsDrawing(true);
      setCurrentDoodlePoints([{ x, y }]);
      return;
    }

    // 3. Hit-test layers from top to bottom
    const reversed = [...layers].sort((a, b) => b.zIndex - a.zIndex);
    const clickedLayer = reversed.find((l) => {
      if (!l.visible || l.locked) return false;
      return x >= l.x && x <= l.x + l.width && y >= l.y && y <= l.y + l.height;
    });

    if (clickedLayer) {
      setSelectedLayerId(clickedLayer.id);
      setIsDragging(true);
      setDragStart({ x: x - clickedLayer.x, y: y - clickedLayer.y });
      setInitialLayerState({ ...clickedLayer });
      pushHistory();
    } else {
      setSelectedLayerId(null);
    }
  };

  // Handle Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    // 1. Panning
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    const { x, y } = getCanvasCoords(e.clientX, e.clientY);

    // 2. Doodle Drawing
    if (isDrawing && activeTool === 'draw') {
      setCurrentDoodlePoints((prev) => [...prev, { x, y }]);
      return;
    }

    // 3. Dragging Selected Layer
    if (isDragging && selectedLayerId && initialLayerState) {
      const newX = Math.round(x - dragStart.x);
      const newY = Math.round(y - dragStart.y);
      updateLayer(selectedLayerId, { x: newX, y: newY });
      return;
    }

    // 4. Resizing Selected Layer
    if (isResizing && selectedLayerId && initialLayerState) {
      let newW = initialLayerState.width;
      let newH = initialLayerState.height;
      let newX = initialLayerState.x;
      let newY = initialLayerState.y;

      if (isResizing.includes('e')) newW = Math.max(20, x - initialLayerState.x);
      if (isResizing.includes('s')) newH = Math.max(20, y - initialLayerState.y);
      if (isResizing.includes('w')) {
        const delta = initialLayerState.x - x;
        newW = Math.max(20, initialLayerState.width + delta);
        newX = x;
      }
      if (isResizing.includes('n')) {
        const delta = initialLayerState.y - y;
        newH = Math.max(20, initialLayerState.height + delta);
        newY = y;
      }

      updateLayer(selectedLayerId, { x: newX, y: newY, width: newW, height: newH });
    }
  };

  // Handle Mouse Up
  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDragging(false);
    setIsResizing(null);
    setIsRotating(false);

    // Commit Doodle to a new layer
    if (isDrawing && currentDoodlePoints.length > 1) {
      setIsDrawing(false);
      addLayer({
        name: `Doodle ${layers.length + 1}`,
        type: 'doodle',
        visible: true,
        locked: false,
        opacity: drawOpacity,
        blendMode: 'normal',
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight,
        rotation: 0,
        points: currentDoodlePoints,
        drawColor,
        brushSize
      });
      setCurrentDoodlePoints([]);
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom(zoom * zoomFactor);
    }
  };

  // Drag and drop image file directly onto canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        const img = new Image();
        img.onload = () => {
          const { x, y } = getCanvasCoords(e.clientX, e.clientY);
          addLayer({
            name: file.name.substring(0, 16),
            type: 'image',
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'normal',
            x: Math.max(0, x - img.width / 4),
            y: Math.max(0, y - img.height / 4),
            width: Math.min(img.width, 600),
            height: Math.min(img.height, 600),
            rotation: 0,
            src
          });
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`flex-1 relative overflow-hidden bg-background/95 select-none flex items-center justify-center ${
        isSpacePressed || activeTool === 'pan'
          ? 'cursor-grab active:cursor-grabbing'
          : activeTool === 'draw'
          ? 'cursor-crosshair'
          : 'cursor-default'
      }`}
    >
      {/* Canvas Viewport Container with Zoom and Pan Transforms */}
      <div
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.05s ease-out'
        }}
        className="relative shadow-2xl rounded-lg ring-1 ring-border/80"
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="rounded-lg block"
          style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
        />

        {/* Selected Layer Bounding Box & Transform Handles */}
        {selectedLayer && selectedLayer.visible && !selectedLayer.locked && (
          <div
            style={{
              position: 'absolute',
              left: `${selectedLayer.x}px`,
              top: `${selectedLayer.y}px`,
              width: `${selectedLayer.width}px`,
              height: `${selectedLayer.height}px`,
              transform: `rotate(${selectedLayer.rotation || 0}deg)`,
              transformOrigin: 'center center'
            }}
            className="pointer-events-none ring-2 ring-violet-500 ring-offset-1 rounded-sm"
          >
            {/* Corner Resize Handles */}
            {['nw', 'ne', 'se', 'sw'].map((handle) => {
              const isTop = handle.includes('n');
              const isLeft = handle.includes('w');
              return (
                <div
                  key={handle}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsResizing(handle);
                    setInitialLayerState({ ...selectedLayer });
                    pushHistory();
                  }}
                  style={{
                    position: 'absolute',
                    top: isTop ? '-6px' : 'calc(100% - 6px)',
                    left: isLeft ? '-6px' : 'calc(100% - 6px)',
                    cursor: `${handle}-resize`
                  }}
                  className="w-3 h-3 bg-white border-2 border-violet-600 rounded-full pointer-events-auto shadow-md"
                />
              );
            })}

            {/* Top Rotation Handle */}
            <div
              style={{
                position: 'absolute',
                top: '-24px',
                left: 'calc(50% - 5px)'
              }}
              className="w-2.5 h-2.5 bg-violet-500 border border-white rounded-full pointer-events-auto cursor-alias shadow-md"
            />
          </div>
        )}

        {/* Before / After Comparison Split View (in Transform mode) */}
        {mode === 'transform' && activeTransformation && (
          <div
            className="absolute inset-0 pointer-events-auto overflow-hidden rounded-lg"
            onMouseMove={(e) => {
              if (e.buttons === 1) {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                setBeforeAfterSliderPos(pos);
              }
            }}
          >
            {/* Transformed image (Background) */}
            <img
              src={activeTransformation.transformedUrl}
              alt="Transformed"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* Original image (Clipped Foreground) */}
            <div
              style={{ width: `${beforeAfterSliderPos}%` }}
              className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white shadow-xl"
            >
              <img
                src={activeTransformation.originalUrl}
                alt="Original"
                style={{ width: `${canvasWidth}px`, maxWidth: 'none' }}
                className="h-full object-cover pointer-events-none"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 text-white text-[11px] font-bold">
                BEFORE (ORIGINAL)
              </span>
            </div>

            <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-violet-600/80 text-white text-[11px] font-bold">
              AFTER ({activeTransformation.style.toUpperCase()})
            </span>

            {/* Draggable Divider Handle */}
            <div
              style={{ left: `${beforeAfterSliderPos}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-2xl flex items-center justify-center cursor-ew-resize border border-border"
            >
              <Move className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {/* Floating Canvas Info Bar */}
      <div className="absolute bottom-4 left-6 flex items-center gap-3 bg-card/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-border/60 text-xs text-muted-foreground shadow-lg">
        <span className="font-medium text-foreground">
          {canvasWidth} × {canvasHeight} px
        </span>
        <span className="text-border">|</span>
        <span>{layers.length} Layers</span>
        <span className="text-border">|</span>
        <span>Tool: <strong className="text-foreground capitalize">{activeTool}</strong></span>
      </div>
    </div>
  );
};
