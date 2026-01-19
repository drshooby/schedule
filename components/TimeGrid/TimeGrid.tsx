"use client";
import React, { useMemo, useState } from "react";
import styling from "./TimeGrid.module.css";
import { AddEventModal } from "../AddEventModal/AddEventModal";
import { AddEventButton } from "../AddEventButton";

interface TimeGridProps {
  days?: string[];
  startHour?: number; // e.g., 8 for 8:00 AM
  endHour?: number; // e.g., 18 for 6:00 PM
}

export const TimeGrid: React.FC<TimeGridProps> = ({
  days = ["Mon", "Tue", "Wed", "Thu", "Fri"],
  startHour = 1,
  endHour = 24,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create an array of hours based on start/end props
  const hours = useMemo(() => {
    const timeSlots = [];
    for (let i = startHour; i <= endHour; i++) {
      timeSlots.push(i);
    }
    return timeSlots;
  }, [startHour, endHour]);

  // CSS variable for grid columns logic
  const gridStyle = {
    "--day-count": days.length,
  } as React.CSSProperties;

  const handleSaveEvent = (event: any) => {
    console.log("New Event Created:", event);
    // TODO: Add to state/db
  };

  return (
    <div className={styling.container}>
      {/* Modal Layer */}
      <AddEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveEvent}
        days={days}
      />

      <div className={styling.grid} style={gridStyle}>
        {/* Render Header Row */}
        <div className={styling.cornerCell}>
           <AddEventButton onClick={() => setIsModalOpen(true)} />
        </div>
        {days.map((day) => (
          <div key={day} className={styling.headerCell}>
            {day}
          </div>
        ))}
        {/* Render Grid Body */}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            {/* Time Label Column */}
            <div className={styling.timeLabel}>{formatHour(hour)}</div>

            {/* Day Columns for this Hour */}
            {days.map((day, index) => (
              <div
                key={`${day}-${hour}`}
                className={styling.cell}
                // We can add onClick handlers here later for interactivity
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Helper to format 13 -> 1:00 PM
const formatHour = (hour: number): string => {
  if (hour === 24) {
    return "12:00 AM";
  }
  if (hour === 12) {
    return "12:00 PM";
  }
  const ampm = hour > 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:00 ${ampm}`;
};