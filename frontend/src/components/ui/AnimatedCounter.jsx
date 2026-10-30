import { useEffect, useState } from "react";

export default function AnimatedCounter({
  value = 0,
  duration = 1500,
  suffix = "",
  prefix = "",
}) {
  const [count, setCount] = useState(0);

  const target = Number(value);

  useEffect(() => {
    if (isNaN(target)) {
      setCount(0);
      return;
    }

    let current = 0;
    const steps = 60;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;

      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}