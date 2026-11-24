import { useEffect, useRef } from "react";
import "./CursorFollower.css";

export default function CursorFollower() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!cursor || !finePointer || reducedMotion) return undefined;

    let disposed = false;
    let cleanup = () => {};

    import("gsap").then(({ gsap }) => {
      if (disposed) return;

      gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0.7, autoAlpha: 0 });
      const moveX = gsap.quickTo(cursor, "x", { duration: 0.28, ease: "power3.out" });
      const moveY = gsap.quickTo(cursor, "y", { duration: 0.28, ease: "power3.out" });
      let visible = false;

      const handlePointerMove = event => {
        moveX(event.clientX);
        moveY(event.clientY);
        if (!visible) {
          visible = true;
          gsap.to(cursor, { autoAlpha: 1, scale: 1, duration: 0.2, overwrite: "auto" });
        }
      };

      const handlePointerOver = event => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const isInteractive = Boolean(target.closest("a, button, input, textarea, select, [role='button']"));
        cursor.classList.toggle("is-interactive", isInteractive);
        gsap.to(cursor, { scale: isInteractive ? 1.45 : 1, duration: 0.2, overwrite: "auto" });
      };

      const handlePointerLeave = () => {
        visible = false;
        gsap.to(cursor, { autoAlpha: 0, duration: 0.18, overwrite: "auto" });
      };

      document.addEventListener("pointermove", handlePointerMove, { passive: true });
      document.addEventListener("pointerover", handlePointerOver, { passive: true });
      document.addEventListener("pointerleave", handlePointerLeave);

      cleanup = () => {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerover", handlePointerOver);
        document.removeEventListener("pointerleave", handlePointerLeave);
        gsap.killTweensOf(cursor);
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div ref={cursorRef} className="cursor-follower" aria-hidden="true">
      <span className="cursor-follower-dot"/>
    </div>
  );
}
