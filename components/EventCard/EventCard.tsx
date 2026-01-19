"use client";
import React from "react";
import styles from "./EventCard.module.css";

interface EventCardProps {
  title: string;
  top: string; // percentage
  height: string; // percentage
  color: string;
  time: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function EventCard({ 
  title, 
  top, 
  height, 
  color,
  time,
  onClick 
}: EventCardProps) {
  return (
    <div 
      className={styles.card}
      style={{ 
        top, 
        height, 
        backgroundColor: color 
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      title={title}
    >
      {title}
      <br />
      {time}
    </div>
  );
};
