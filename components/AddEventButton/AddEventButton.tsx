"use client";
import styles from "./AddEventButton.module.css";

interface AddEventButtonProps {
  onClick?: () => void;
}

/**
 * Floating action button (or corner button) to trigger the "Add Event" modal.
 */
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
