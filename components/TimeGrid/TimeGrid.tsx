"use client";
import React, { useMemo, useState } from "react";
import styling from "./TimeGrid.module.css";
import { AddEventModal } from "../AddEventModal/AddEventModal";
import { AddEventButton } from "../AddEventButton";
import { EventCard } from "../EventCard";

interface TimeGridProps {
  days?: string[];
  startHour?: number; // e.g., 8 for 8:00 AM
  endHour?: number; // e.g., 18 for 6:00 PM
}

interface CalendarEvent {
  id: string;
  title: string;
  day: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  color: string;
}

const PASTEL_COLORS = [
  "#E3F2FD", // Blue
  "#E8F5E9", // Green
  "#F3E5F5", // Purple
  "#FFF3E0", // Orange
  "#FCE4EC", // Pink
  "#FAFAFA", // Gray
];

export function TimeGrid({
  days = ["Mon", "Tue", "Wed", "Thu", "Fri"],
  startHour = 5,
  endHour = 23,
}: TimeGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [modalInitialState, setModalInitialState] = useState<{
    day: string;
    startTime: string;
    endTime: string;
  } | null>(null);

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

  const handleSaveEvent = (newEventData: any) => {
    const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: newEventData.title,
        day: newEventData.day,
        startTime: newEventData.startTime,
        endTime: newEventData.endTime,
        color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  const handleCellClick = (day: string, hour: number) => {
    if (hour === 24) {
      // Midnight slot: default to 12:00 AM - 12:00 AM (0 mins)
      // or 24:00 - 24:00. 
      // Our validation requires end > start, so user will have to edit it.
      setModalInitialState({
        day,
        startTime: "24:00",
        endTime: "24:00"
      });
      setIsModalOpen(true);
      return;
    }

    // Format hour to HH:00
    const startH = hour < 10 ? `0${hour}` : `${hour}`;
    const startTime = `${startH}:00`;
    
    // Default 1 hour duration
    let endH = hour + 1;
    // Cap at 24?
    if (endH > 24) endH = 24; 
    const endHStr = endH < 10 ? `0${endH}` : `${endH}`;
    const endTime = `${endHStr}:00`;

    setModalInitialState({
        day,
        startTime,
        endTime
    });
    setIsModalOpen(true);
  };

  return (
    <div className={styling.container}>
      {/* Modal Layer */}
      <AddEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveEvent}
        days={days}
        initialDay={modalInitialState?.day}
        initialStartTime={modalInitialState?.startTime}
        initialEndTime={modalInitialState?.endTime}
      />

      <div className={styling.grid} style={gridStyle}>
        {/* Render Header Row */}
        <div className={styling.cornerCell}>
           <AddEventButton onClick={() => {
               setModalInitialState(null); // Reset to defaults for generic add
               setIsModalOpen(true);
           }} />
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
            {days.map((day, index) => {
              // Find events that start in this exact slot (day + hour)
              const cellEvents = events.filter(e => {
                const [hStr] = e.startTime.split(":");
                const h = parseInt(hStr, 10);
                return e.day === day && h === hour;
              });

              return (
                <div
                  key={`${day}-${hour}`}
                  className={styling.cell}
                  onClick={() => handleCellClick(day, hour)}
                >
                  {cellEvents.map(event => {
                     const [startH, startM] = event.startTime.split(":").map(Number);
                     const [endH, endM] = event.endTime.split(":").map(Number);
                     
                     // Calculate top offset
                     const topPercent = (startM / 60) * 100;
                     
                     // Calculate duration in minutes
                     const startTotal = startH * 60 + startM;
                     const endTotal = endH * 60 + endM;
                     const duration = endTotal - startTotal;
                     const heightPercent = (duration / 60) * 100;

                     return (
                       <EventCard
                         key={event.id}
                         title={event.title}
                         top={`${topPercent}%`}
                         height={`${heightPercent}%`}
                         color={event.color}
                         time={formatHour(startH) + " - " + formatHour(endH)}
                         onClick={(e) => {
                           e.stopPropagation();
                           console.log("Clicked event", event);
                         }}
                       />
                     );
                  })}
                </div>
              );
            })}
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