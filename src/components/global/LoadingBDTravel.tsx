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

export default function LoadingBdTravel({
  size = 56,
  speed = 0.6,
  color = "#006666",          // primary token
  colorSecondary = "#004d4d", // primary dark
  className = "",
  ariaLabel = "Loading",
}: Props) {
  const styleVars: CssVars = {
    "--uib-size": `${size}px`,
    "--uib-speed": `${speed}s`,
    "--uib-color": color,
    "--uib-color-secondary": colorSecondary,
  };

  return (
    <div
      className={`${styles.portalContainer} ${className}`}
      role="status"
      aria-label={ariaLabel}
      style={{
        background: "#E7E5E4",
      }}
    >
      <div className={styles.viewportCenter}>
        {/* Neumorphic card wrapping the dot-wave */}
        <div
          style={{
            background: "#E7E5E4",
            boxShadow:
              "10px 10px 22px rgba(0,0,0,0.13), -6px -6px 16px rgba(255,255,255,0.72)",
            borderRadius: "16px",
            padding: "24px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div className={styles["dot-wave"]} style={styleVars}>
            <div className={styles["dot-wave__dot"]} />
            <div className={styles["dot-wave__dot"]} />
            <div className={styles["dot-wave__dot"]} />
            <div className={styles["dot-wave__dot"]} />
          </div>

          <span
            style={{
              fontFamily: "var(--font-space-mono, 'Space Mono', monospace)",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#1E293880",
            }}
          >
            {ariaLabel}
          </span>
        </div>
      </div>
    </div>
  );
}