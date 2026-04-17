import { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

export default function Lightbox({ src, alt = "Збільшене зображення", onClose }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);

  // Handle Wheel scroll for zooming
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      // Zoom in
      setScale(s => Math.min(s + 0.25, 5));
    } else {
      // Zoom out
      setScale(s => {
        const newScale = Math.max(s - 0.25, 1);
        if (newScale === 1) setPosition({ x: 0, y: 0 });
        return newScale;
      });
    }
  }, []);

  // Prevent wheel scroll on document when lightbox is open
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use an active listener to explicitly prevent default
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  const handleMouseDown = (e) => {
    if (scale === 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetZoom = (e) => {
    e?.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const zoomIn = (e) => {
    e?.stopPropagation();
    setScale(s => Math.min(s + 0.5, 5));
  };

  const zoomOut = (e) => {
    e?.stopPropagation();
    setScale(s => {
      const val = Math.max(s - 0.5, 1);
      if (val === 1) setPosition({ x: 0, y: 0 });
      return val;
    });
  };

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center justify-center w-full h-full max-w-[100vw] max-h-[100dvh]"
        onClick={e => e.stopPropagation()}
        ref={containerRef}
      >
        {/* Controls Float */}
        <div className="absolute top-12 right-4 sm:top-16 sm:right-8 z-50 flex items-center gap-1.5 sm:gap-2 bg-surface-900/90 p-1.5 rounded-xl border border-surface-700/50 backdrop-blur-md shadow-2xl">
          <button onClick={zoomOut} className="p-1.5 sm:p-2 rounded-lg text-surface-300 hover:text-white hover:bg-surface-700 transition-colors" title="Зменшити">
            <ZoomOut size={18} />
          </button>
          <div className="text-xs font-mono font-medium text-surface-200 min-w-[45px] text-center select-none pointer-events-none">
            {Math.round(scale * 100)}%
          </div>
          <button onClick={zoomIn} className="p-1.5 sm:p-2 rounded-lg text-surface-300 hover:text-white hover:bg-surface-700 transition-colors" title="Збільшити">
            <ZoomIn size={18} />
          </button>
          <div className="w-px h-5 bg-surface-700 mx-1"></div>
          <button onClick={resetZoom} className="p-1.5 sm:p-2 rounded-lg text-surface-300 hover:text-white hover:bg-surface-700 transition-colors" title="Відновити масштаб">
            <Maximize size={18} />
          </button>
          <div className="w-px h-5 bg-surface-700 mx-1"></div>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg text-red-400 hover:text-white hover:bg-red-500/80 transition-colors" title="Закрити">
            <X size={18} />
          </button>
        </div>

        {/* Tip for users */}
        {scale === 1 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur text-white/70 text-xs rounded-full pointer-events-none select-none z-50 animate-fade-in delay-500 opacity-0 group-hover:opacity-100 transition-opacity">
            Коліщатко або подвійний клік для зуму
          </div>
        )}

        {/* Image Container */}
        <div
          className={`group flex items-center justify-center w-full h-full overflow-hidden ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (scale === 1) setScale(2.5);
            else resetZoom(e);
          }}
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
            }}
            className="max-w-[95vw] max-h-[90vh] object-contain rounded shadow-2xl origin-center"
          />
        </div>
      </div>
    </div>
  );
}
