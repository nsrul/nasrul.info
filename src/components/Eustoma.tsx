import { createEustoma, type Eustoma as Engine } from '@lib/eustoma/engine';
import { useTheme } from 'next-themes';
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from 'react';

export default function Eustoma({
  avoid,
}: {
  avoid?: RefObject<HTMLElement | null>;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const engine = createEustoma({
      avoid: () => avoid?.current ?? null,
      onMessage: setMessage,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
        .matches,
      stage,
    });
    if (!engine) {
      setMessage(
        'This flower needs WebGL 2. Open the page in a recent Safari, Chrome, Firefox, or Edge to see it.',
      );
      return;
    }
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [avoid]);

  // next-themes swaps the class after this render, so read the paper a frame later.
  useEffect(() => {
    const frame = requestAnimationFrame(() => engineRef.current?.refreshTheme());
    return () => cancelAnimationFrame(frame);
  }, [resolvedTheme]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const engine = engineRef.current;
    if (!engine) return;
    const actions: Record<string, () => void> = {
      ArrowDown: () => engine.tilt(0.08),
      ArrowLeft: () => engine.turn(-0.25),
      ArrowRight: () => engine.turn(0.25),
      ArrowUp: () => engine.tilt(-0.08),
      Enter: () => engine.ripple(),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  return (
    <div className="eustoma">
      <div
        aria-describedby="eustoma-hint"
        aria-label="Eustoma, a flower drawn in violet ASCII characters on green stems"
        aria-roledescription="interactive artwork"
        className="eustoma-stage"
        onKeyDown={onKeyDown}
        ref={stageRef}
        role="application"
        tabIndex={0}
      />
      <p className="sr-only" id="eustoma-hint">
        Drag to turn it and click to send a ripple through it. With the
        keyboard, arrow keys turn and tilt it, and Enter sends a ripple.
      </p>
      <p className="eustoma-caption">Eustoma</p>
      {message ? (
        <p className="eustoma-message" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
