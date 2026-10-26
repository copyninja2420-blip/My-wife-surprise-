import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  speed?: number;
  start?: boolean;
  delay?: number;
  className?: string;
  caret?: boolean;
  onDone?: () => void;
};

/** Gradual, handwritten-feeling text reveal. */
export function Typewriter({
  text,
  speed = 45,
  start = true,
  delay = 0,
  className,
  caret = true,
  onDone,
}: Props) {
  const [count, setCount] = useState(0);
  const [begun, setBegun] = useState(delay === 0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!start || delay === 0) return;
    const t = setTimeout(() => setBegun(true), delay);
    return () => clearTimeout(t);
  }, [start, delay]);

  useEffect(() => {
    if (!start || !begun) return;
    if (count >= text.length) return;
    const t = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(t);
  }, [count, text.length, speed, start, begun]);

  useEffect(() => {
    setCount(0);
    doneRef.current = false;
  }, [text]);

  const done = count >= text.length;

  useEffect(() => {
    if (done && !doneRef.current) {
      doneRef.current = true;
      onDone?.();
    }
  }, [done, onDone]);

  return (
    <span className={className}>
      {text.slice(0, count)}
      {caret && !done && <span className="type-caret" aria-hidden="true" />}
    </span>
  );
}
