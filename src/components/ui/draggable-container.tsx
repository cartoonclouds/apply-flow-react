import { type DragPosition, useDraggable } from "@/lib/use-draggable";
import { cn } from "@/lib/utils";
import React, { type ReactNode } from "react";

type InitialPositionContext = {
  elementRect: DOMRect;
  viewport: {
    width: number;
    height: number;
  };
};

type DraggableContainerProps = {
  className?: string;
  handleClassName?: string;
  children: ReactNode;
  handle: (context: { isDragging: boolean }) => ReactNode;
  initialPosition?: DragPosition;
  viewportPadding?: number;
  resolveInitialPosition?: (context: InitialPositionContext) => DragPosition;
};

function DraggableContainer({
  className,
  handleClassName,
  children,
  handle,
  initialPosition,
  viewportPadding,
  resolveInitialPosition,
}: DraggableContainerProps) {
  const {
    draggableRef,
    position,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  } = useDraggable<HTMLElement>({
    initialPosition,
    viewportPadding,
    resolveInitialPosition,
  });

  return (
    <aside
      ref={draggableRef}
      className={cn("fixed z-50", className)}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div
        className={cn(
          "select-none cursor-grab active:cursor-grabbing",
          handleClassName,
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {handle({ isDragging })}
      </div>

      {children}
    </aside>
  );
}

export default DraggableContainer;
