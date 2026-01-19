"use client";
import React, { useState } from "react";
import styling from "./AddEventModal.module.css";
import { TimeSelect } from "../TimeSelect";

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
}

export function AddEventModal({
  isOpen,
  onClose,
  onSave,
  days,
}: AddEventModalProps) {
  const [title, setTitle] = useState("");
  const [day, setDay] = useState(days[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, day, startTime, endTime });
    onClose();
    // Reset form or keep values? Let's reset for now
    setTitle("");
    setDay(days[0]);
    setStartTime("09:00");
    setEndTime("10:00");
  };

  return (
    <div className={styling.overlay} onClick={onClose}>
      <div className={styling.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styling.title}>Add New Event</h2>
        
        <form onSubmit={handleSubmit}>
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
            <button type="button" onClick={onClose} className={`${styling.button} ${styling.cancelBtn}`}>
              Cancel
            </button>
            <button type="submit" className={`${styling.button} ${styling.submitBtn}`}>
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
