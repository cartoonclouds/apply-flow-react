import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type PointerEvent,
} from "react";

export type DragPosition = {
  x: number;
  y: number;
};

type InitialPositionContext = {
  elementRect: DOMRect;
  viewport: {
    width: number;
    height: number;
  };
};

type UseDraggableOptions = {
  initialPosition?: DragPosition;
  viewportPadding?: number;
  resolveInitialPosition?: (context: InitialPositionContext) => DragPosition;
};

type UseDraggableResult<T extends HTMLElement> = {
  draggableRef: React.RefObject<T | null>;
  position: DragPosition;
  isDragging: boolean;
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
};

export function useDraggable<T extends HTMLElement>(
  options: UseDraggableOptions = {},
): UseDraggableResult<T> {
  const {
    initialPosition = { x: 16, y: 16 },
    viewportPadding = 8,
    resolveInitialPosition,
  } = options;

  const draggableRef = useRef<T | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<DragPosition>(initialPosition);

  const clampPosition = useCallback(
    (nextX: number, nextY: number): DragPosition => {
      const element = draggableRef.current;

      if (!element) {
        return {
          x: Math.max(viewportPadding, nextX),
          y: Math.max(viewportPadding, nextY),
        };
      }

      const rect = element.getBoundingClientRect();
      const maxX = Math.max(
        viewportPadding,
        window.innerWidth - rect.width - viewportPadding,
      );
      const maxY = Math.max(
        viewportPadding,
        window.innerHeight - rect.height - viewportPadding,
      );

      return {
        x: Math.min(Math.max(viewportPadding, nextX), maxX),
        y: Math.min(Math.max(viewportPadding, nextY), maxY),
      };
    },
    [viewportPadding],
  );

  useEffect(() => {
    const element = draggableRef.current;

    if (!element) {
      return;
    }

    if (!resolveInitialPosition) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const next = resolveInitialPosition({
      elementRect: rect,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });

    setPosition((current) => {
      const isCurrentDefault =
        current.x === initialPosition.x && current.y === initialPosition.y;

      if (!isCurrentDefault) {
        return current;
      }

      return clampPosition(next.x, next.y);
    });
  }, [
    clampPosition,
    initialPosition.x,
    initialPosition.y,
    resolveInitialPosition,
  ]);

  useEffect(() => {
    function handleResize() {
      setPosition((current) => clampPosition(current.x, current.y));
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [clampPosition]);

  function finishPointerDrag(event: PointerEvent<HTMLElement>) {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    pointerIdRef.current = null;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0) {
      return;
    }

    const panel = draggableRef.current;

    if (!panel) {
      return;
    }

    const rect = panel.getBoundingClientRect();
    pointerIdRef.current = event.pointerId;
    dragOffsetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (!isDragging || pointerIdRef.current !== event.pointerId) {
      return;
    }

    const nextX = event.clientX - dragOffsetRef.current.x;
    const nextY = event.clientY - dragOffsetRef.current.y;
    setPosition(clampPosition(nextX, nextY));
  }

  return {
    draggableRef,
    position,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp: finishPointerDrag,
    onPointerCancel: finishPointerDrag,
  };
}
