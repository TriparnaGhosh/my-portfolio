import { useEffect, useRef, useState } from "react";
import "./LegoWavingAvatar.css";

export default function LegoWavingAvatar({
  src = "/doll_img_transparent.png",
  alt = "LEGO-style doll waving",
  size = 96,
  width,
  frameAspectRatio = 25 / 56,
  fps = 5,
  loop = true,
  playOnHover = false,
  pauseWhenHidden = false,
  crisp = false,
  className = ""
}) {
  const avatarRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const frameRate = Math.min(30, Math.max(1, Number(fps) || 5));
  const classes = [
    "lego-waving-avatar",
    loop ? "lego-waving-avatar--loop" : "lego-waving-avatar--once",
    playOnHover && "lego-waving-avatar--hover",
    pauseWhenHidden && !isVisible && "lego-waving-avatar--hidden",
    crisp && "lego-waving-avatar--crisp",
    className
  ].filter(Boolean).join(" ");

  useEffect(() => {
    const element = avatarRef.current;
    if (!pauseWhenHidden || !element || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [pauseWhenHidden]);

  return (
    <span
      ref={avatarRef}
      className={classes}
      role="img"
      aria-label={alt}
      tabIndex={playOnHover ? 0 : undefined}
      style={{
        width: width ?? size,
        aspectRatio: frameAspectRatio,
        backgroundImage: `url("${src}")`,
        "--lego-cycle-duration": `${3 / frameRate}s`
      }}
    />
  );
}
