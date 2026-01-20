"use client";
import { useMemo, useState } from "react";
import styling from "./TimeGrid.module.css";
import { AddEventModal } from "@/components/AddEventModal/AddEventModal";
import { AddEventButton } from "@/components/AddEventButton";
import { TopActions } from "@/components/TopActions";
import { EventCard } from "@/components/EventCard";
import { Toast } from "@/components/Toast";
import { START_HOUR, END_HOUR, PASTEL_COLORS } from "@/utils/constants";

/**
 * Props for the TimeGrid component.
 */
interface TimeGridProps {
  /** list of days to display in the header (e.g. ["Mon", "Tue"]) */
  days?: string[];
  /** Start hour of the grid (0-24) */
  startHour?: number;
  /** End hour of the grid (0-24) */
  endHour?: number;
}

/**
 * Represents a single event on the calendar.
 */
interface CalendarEvent {
  id: string;
  title: string;
  day: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  color: string;
}





interface TimeGridProps {
  days?: string[];
  startHour?: number;
  endHour?: number;
}

// ... (CalendarEvent interface remains same)

/**
 * Main grid component for the weekly schedule.
 * Handles event rendering, creation, updating, deletion, and persistence.
 */
export function TimeGrid({
  days = ["Mon", "Tue", "Wed", "Thu", "Fri"],
  startHour = START_HOUR,
  endHour = END_HOUR,
}: TimeGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [modalInitialState, setModalInitialState] = useState<{
    day: string;
    startTime: string;
    endTime: string;
  } | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error"; duration?: number } | null>(null);

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

  const handleSaveEvent = (newEventData: { title: string; days: string[]; startTime: string; endTime: string; color: string }) => {
    if (selectedEvent) {
        // Editing existing event
        // 1. Update the ORIGINAL event to the FIRST selected day (or keep its day if contained)
        // 2. Create NEW events for any other days selected
        
        // Actually, simpler logic:
        // Delete the old event specific ID, then create new events for ALL selected days?
        // OR:
        // Update the current event instance to the first day in list.
        // Create copies for others.
        // Let's do:
        // - Update the current event to match properties.
        // - If days changed, we might need to "move" it.
        
        // User said: "edit event... add days... create copies".
        // Let's keep it robust:
        // We will keep the ID for the *primary* edited event (so modal doesn't freak out if we were keeping it open, though we close it).
        // Actually we close modal on save.
        
        // Let's just create N events and delete the old one?
        // No, keep the old ID for at least one to be nice to React keys if possible, but not strictly necessary as we close modal.
        
        // Plan:
        // 1. Remove the originally selected event (since we are replacing it with this new definition which might be multiple days).
        // 2. Create new events for every day in `days`.
        // Wait, if I just change the title of "Mon" event and I have "Mon" selected, I expect "Mon" event to update.
        // If I have "Mon" event, and I select "Mon" and "Fri", I expect "Mon" to update and "Fri" to be created.
        
        const eventsToAdd: CalendarEvent[] = [];
        const primaryDay = newEventData.days[0];
        
        // Update the existing ID for the primary day
        eventsToAdd.push({
             ...selectedEvent,
             title: newEventData.title,
             day: primaryDay, // Move to first selected day if changed
             startTime: newEventData.startTime,
             endTime: newEventData.endTime,
             color: newEventData.color
        });
        
        // Create new IDs for secondary days
        for (let i = 1; i < newEventData.days.length; i++) {
             eventsToAdd.push({
                id: crypto.randomUUID(),
                title: newEventData.title,
                day: newEventData.days[i],
                startTime: newEventData.startTime,
                endTime: newEventData.endTime,
                color: newEventData.color
             });
        }

        setEvents(prev => {
            // Remove the old event instance
            const filtered = prev.filter(e => e.id !== selectedEvent.id);
            return [...filtered, ...eventsToAdd];
        });
        
        setSelectedEvent(null);
    } else {
        // Creating new event(s)
        const newEvents: CalendarEvent[] = newEventData.days.map(d => ({
            id: crypto.randomUUID(),
            title: newEventData.title,
            day: d,
            startTime: newEventData.startTime,
            endTime: newEventData.endTime,
            color: newEventData.color, // Use the color passed from modal
        }));
        setEvents((prev) => [...prev, ...newEvents]);
    }
  };

  const handleDeleteEvent = () => {
      if (selectedEvent) {
          setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
          setToast({ message: "Event removed.", type: "success", duration: 2500 });
          setSelectedEvent(null);
      }
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

  const handleSaveConfig = () => {
    // Strip IDs for cleaner JSON export
    const eventsToSave = events.map(({ id, ...rest }) => rest);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ events: eventsToSave }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "schedule.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleLoadConfig = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target?.result as string);
            if (json && Array.isArray(json.events)) {
                // Ensure every event has an ID upon loading
                const loadedEvents = json.events.map((e: any) => ({
                    ...e,
                    id: e.id || crypto.randomUUID()
                }));
                setEvents(loadedEvents);
                setToast({ message: "Schedule loaded.", type: "success", duration: 2500 });
            } else {
                setToast({ message: "Invalid file format.", type: "error", duration: 4000 });
            }
        } catch (e) {
            setToast({ message: "Error parsing file.", type: "error", duration: 4000 });
        }
    };
    reader.readAsText(file);
  };

  const handleClearEvents = () => {
    setEvents([]);
    setToast({ message: "All events cleared.", type: "success", duration: 2500 });
  };

  return (
    <div className={styling.container}>
      <div className={styling.toolbar}>
        <TopActions onSave={handleSaveConfig} onLoad={handleLoadConfig} onClear={handleClearEvents} />
      </div>

      {/* Modal Layer */}
      <AddEventModal 
        isOpen={isModalOpen} 
        onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
        }} 
        onSave={handleSaveEvent}
        onDelete={selectedEvent ? handleDeleteEvent : undefined}
        days={days}
        initialDay={selectedEvent ? selectedEvent.day : modalInitialState?.day}
        initialStartTime={selectedEvent ? selectedEvent.startTime : modalInitialState?.startTime}
        initialEndTime={selectedEvent ? selectedEvent.endTime : modalInitialState?.endTime}
        initialTitle={selectedEvent ? selectedEvent.title : ""}
        initialColor={selectedEvent ? selectedEvent.color : PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)]}
      />
      
      {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            duration={toast.duration} 
            onClose={() => setToast(null)} 
          />
      )}

      <div className={styling.grid} style={gridStyle}>
        {/* Render Header Row */}
        <div className={styling.cornerCell}>
           <AddEventButton onClick={() => {
               setModalInitialState(null); // Reset to defaults for generic add
               setSelectedEvent(null);
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
          <div key={hour} style={{ display: "contents" }}>
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
                         time={`${formatTime12h(event.startTime)} - ${formatTime12h(event.endTime)}`}
                         onClick={(e) => {
                           e.stopPropagation();
                           setSelectedEvent(event);
                           setIsModalOpen(true);
                         }}
                       />
                     );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Formats a "HH:mm" string into 12-hour format (e.g. "13:30" -> "1:30 PM").
 */
const formatTime12h = (timeStr: string): string => {
  const [hStr, mStr] = timeStr.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr || "00";
  
  if (h === 24) return `12:${m} AM`;
  if (h === 12) return `12:${m} PM`;
  
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
};

/**
 * Formats a simple number hour into a label (e.g. 13 -> "1:00 PM").
 */
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