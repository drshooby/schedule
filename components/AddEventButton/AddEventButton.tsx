"use client";
import React from "react";
import styles from "./AddEventButton.module.css";

interface AddEventButtonProps {
  onClick?: () => void;
}

export const AddEventButton: React.FC<AddEventButtonProps> = ({ onClick }) => {
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
