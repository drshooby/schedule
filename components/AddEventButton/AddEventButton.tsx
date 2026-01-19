"use client";
import React from "react";
import styles from "./AddEventButton.module.css";

interface AddEventButtonProps {
  onClick?: () => void;
}

export function AddEventButton({ onClick }: AddEventButtonProps) {
  return (
    <button 
      className={styles.addButton} 
      onClick={onClick}
      title="Add Event"
    >
      +
    </button>
  );
};
