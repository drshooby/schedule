"use client";
import React, { useState } from "react";
import styling from "./AddEventModal.module.css";
import { TimeSelect } from "../TimeSelect";
import { Toast } from "../Toast";
import { START_HOUR, END_HOUR } from "@/utils/constants";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: {
    title: string;
    day: string;
    startTime: string;
    endTime: string;
  }) => void;
  days: string[];
  initialDay?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  initialTitle?: string;
  onDelete?: () => void;
}

export function AddEventModal({
  isOpen,
  onClose,
  onSave,
  days,
  initialDay,
  initialStartTime,
  initialEndTime,
  initialTitle,
  onDelete,
}: AddEventModalProps) {
  const [title, setTitle] = useState("");
  const [day, setDay] = useState(days[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setDay(initialDay || days[0]);
      setStartTime(initialStartTime || "09:00");
      setEndTime(initialEndTime || "10:00");
      setTitle(initialTitle || "");
      setError(null);
    }
  }, [isOpen, initialDay, initialStartTime, initialEndTime, initialTitle, days]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if end > start
    // Convert logic: "HH:mm" -> integer comparison
    // "09:00" -> 900, "13:30" -> 1330
    const toMinutes = (s: string) => {
      const [h, m] = s.split(":").map(Number);
      return h * 60 + m;
    };
    const sMin = toMinutes(startTime);
    const eMin = toMinutes(endTime);

    const minAllowedMins = START_HOUR * 60;
    const maxAllowedMins = END_HOUR * 60; // 11:00 PM (23:00)

    // Check strict range
    if (sMin < minAllowedMins || eMin > maxAllowedMins) {
        setError("Available scheduling is between 5am - 11pm.");
        return;
    }

    if (eMin <= sMin) {
        setError("Events must end after they start and cannot span multiple days.");
        return;
    }

    onSave({ title, day, startTime, endTime });
    onClose();
    // Reset form
    setTitle("");
    setDay(days[0]);
  };

  return (
    <>
    {error && <Toast message={error} onClose={() => setError(null)} />}
    <div className={styling.overlay} onClick={onClose}>
      <div className={styling.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styling.title}>{onDelete ? "Edit Event" : "Add New Event"}</h2>
        
        <form onSubmit={handleSubmit} className={styling.form}>
          <div className={styling.formGroup}>
            <label className={styling.label}>Event Title</label>
            <input
              type="text"
              className={styling.input}
              placeholder="e.g. Deep Work Session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className={styling.formGroup}>
            <label className={styling.label}>Day</label>
            <select
              className={styling.select}
              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className={styling.row}>
            <div className={styling.formGroup} style={{ flex: 1 }}>
              <label className={styling.label}>Start Time</label>
              <TimeSelect
                value={startTime}
                onChange={setStartTime}
              />
            </div>

            <div className={styling.formGroup} style={{ flex: 1 }}>
              <label className={styling.label}>End Time</label>
              <TimeSelect
                value={endTime}
                onChange={setEndTime}
              />
            </div>
          </div>

          <div className={styling.actions}>
            {onDelete && (
                <button 
                    type="button" 
                    onClick={() => {
                        onDelete();
                        onClose();
                    }}
                    className={styling.removeBtn}
                >
                    Remove
                </button>
            )}
            <button type="button" onClick={onClose} className={`${styling.button} ${styling.cancelBtn}`}>
              Cancel
            </button>
            <button type="submit" className={`${styling.button} ${styling.submitBtn}`}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};
