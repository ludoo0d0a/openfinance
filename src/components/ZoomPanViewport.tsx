import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const MAX_HEIGHT = 560;
const ZOOM_RANGE = 4;
const DRAG_PX = 4;

interface Props {
  contentWidth: number;
  contentHeight: number;
  fill?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Scales SVG-sized content to the panel, then lets the pointer zoom (wheel)
 * and pan (drag). Clicks still reach the diagram unless the pointer moved.
 * `fill` uses the parent height and will upscale so the drawing occupies the box.
 */
export function ZoomPanViewport({ contentWidth, contentHeight, fill = false, className, children }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [boxH, setBoxH] = useState(() => Math.min(MAX_HEIGHT, contentHeight));
  const [tx, setTx] = useState({ x: 0, y: 0, scale: 1 });
  const txRef = useRef(tx);
  txRef.current = tx;
  const interacted = useRef(false);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    origX: number;
    origY: number;
    moved: boolean;
  } | null>(null);
  const [panning, setPanning] = useState(false);
  const suppressClick = useRef(false);

  useLayoutEffect(() => {
    interacted.current = false;
    const el = viewportRef.current;
    if (!el) return;

    const layout = () => {
      const cw = el.clientWidth;
      const ch = fill
        ? el.clientHeight
        : Math.min(
            MAX_HEIGHT,
            Math.max(120, contentHeight * Math.min(1, contentWidth > 0 ? cw / contentWidth : 1)),
          );
      if (!fill) setBoxH(ch);
      if (!interacted.current) {
        setTx(fitTransform(cw, ch, contentWidth, contentHeight, fill));
      }
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    return () => ro.disconnect();
  }, [contentWidth, contentHeight, fill]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      interacted.current = true;
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const { x, y, scale } = txRef.current;
      const minScale = fitScale(rect.width, rect.height, contentWidth, contentHeight, fill);
      const maxScale = minScale * ZOOM_RANGE;
      const next = clamp(scale * Math.exp(-e.deltaY * 0.0015), minScale, maxScale);
      const k = next / (scale || 1);
      setTx({ scale: next, x: mx - (mx - x) * k, y: my - (my - y) * k });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [contentWidth, contentHeight, fill]);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      origX: tx.x,
      origY: tx.y,
      moved: false,
    };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && dx * dx + dy * dy < DRAG_PX * DRAG_PX) return;
    if (!d.moved) {
      d.moved = true;
      interacted.current = true;
      setPanning(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setTx((prev) => ({ ...prev, x: d.origX + dx, y: d.origY + dy }));
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (d.moved) suppressClick.current = true;
    drag.current = null;
    setPanning(false);
  }

  return (
    <div
      ref={viewportRef}
      className={cn(
        'relative w-full overflow-hidden border border-rule-soft bg-paper-raised select-none',
        panning ? 'cursor-grabbing' : 'cursor-grab',
        fill && 'min-h-0 flex-1',
        className,
      )}
      style={{ height: fill ? undefined : boxH, touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={(e) => {
        if (!suppressClick.current) return;
        suppressClick.current = false;
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left will-change-transform"
        style={{
          width: contentWidth,
          height: contentHeight,
          transform: `translate(${tx.x}px, ${tx.y}px) scale(${tx.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function fitScale(vw: number, vh: number, w: number, h: number, allowUpscale: boolean) {
  if (w <= 0 || h <= 0 || vw <= 0 || vh <= 0) return 1;
  const scale = Math.min(vw / w, vh / h);
  return allowUpscale ? scale : Math.min(scale, 1);
}

function fitTransform(vw: number, vh: number, w: number, h: number, allowUpscale: boolean) {
  const scale = fitScale(vw, vh, w, h, allowUpscale);
  return { scale, x: (vw - w * scale) / 2, y: (vh - h * scale) / 2 };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
