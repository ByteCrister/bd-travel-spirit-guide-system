"use client";

import React from "react";
import styles from "../../styles/loading-bdtravel.module.css";

type Props = {
  size?: number;
  speed?: number;
  color?: string;
  colorSecondary?: string;
  className?: string;
  ariaLabel?: string;
};

type CssVars = React.CSSProperties & {
  "--uib-size"?: string;
  "--uib-speed"?: string;
  "--uib-color"?: string;
  "--uib-color-secondary"?: string;
};

/**
 * Renders a centered loader. On server (or before mount) it renders
 * the same full-viewport markup in-place so the loader is centered
 * inside the layout. After mount it portals the same markup to
 * document.body so it sits above any layout wrappers.
 */
export default function LoadingBdTravel({
  size = 56,
  speed = 0.6,
  color = "#7dd3fc",
  colorSecondary = "#0369a1",
  className = "",
  ariaLabel = "Loading",
}: Props) {

  const styleVars: CssVars = {
    "--uib-size": `${size}px`,
    "--uib-speed": `${speed}s`,
    "--uib-color": color,
    "--uib-color-secondary": colorSecondary,
  };

  // Render in-place on server / pre-mount, portal after mount
  return (
    <div className={`${styles.portalContainer} ${className}`} role="status" aria-label={ariaLabel}>
      <div className={styles.viewportCenter}>
        <div className={styles["dot-wave"]} style={styleVars}>
          <div className={styles["dot-wave__dot"]} />
          <div className={styles["dot-wave__dot"]} />
          <div className={styles["dot-wave__dot"]} />
          <div className={styles["dot-wave__dot"]} />
        </div>
      </div>
    </div>
  );
}
