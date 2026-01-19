"use client";
import React, { useEffect } from "react";
import styles from "./Toast.module.css";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = "error", duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const style = {
    "--toast-duration": `${duration}ms`,
  } as React.CSSProperties;

  return (
    <div className={styles.toast} onClick={onClose} style={style}>
      <span>{message}</span>
      <div className={styles.progressBar} />
    </div>
  );
}
