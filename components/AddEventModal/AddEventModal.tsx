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
    days: string[]; // Changed from single day
    startTime: string;
    endTime: string;
    color: string;
  }) => void;
  days: string[];
  initialDay?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  initialTitle?: string;
  initialColor?: string;
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
  initialColor,
  onDelete,
}: AddEventModalProps) {
  const [title, setTitle] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([days[0]]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [color, setColor] = useState("#E3F2FD"); // Default blue-ish
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedDays(initialDay ? [initialDay] : [days[0]]);
      setStartTime(initialStartTime || "09:00");
      setEndTime(initialEndTime || "10:00");
      setTitle(initialTitle || "");
      setColor(initialColor || "#E3F2FD");
      setError(null);
    }
  }, [isOpen, initialDay, initialStartTime, initialEndTime, initialTitle, initialColor, days]);

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

    if (selectedDays.length === 0) {
        setError("Please select at least one day.");
        return;
    }

    onSave({ title, days: selectedDays, startTime, endTime, color });
    onClose();
    // Reset form
    setTitle("");
    setSelectedDays([days[0]]);
  };

  const toggleDay = (d: string) => {
    if (selectedDays.includes(d)) {
        // Prevent unselecting the last day? Or allow it but validate on save?
        // Let's allow unselecting but validate on save.
        setSelectedDays(prev => prev.filter(day => day !== d));
    } else {
        setSelectedDays(prev => [...prev, d]);
    }
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
            <label className={styling.label}>Days</label>
            <div className={styling.dayPicker}>
                {days.map((d) => {
                    const isSelected = selectedDays.includes(d);
                    return (
                        <button
                            key={d}
                            type="button"
                            className={`${styling.dayBtn} ${isSelected ? styling.dayBtnSelected : ''}`}
                            onClick={() => toggleDay(d)}
                        >
                            {d}
                        </button>
                    );
                })}
            </div>
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

          <div className={styling.formGroup}>
            <label className={styling.label}>Color</label>
            <div className={styling.colorInputWrapper}>
                <div className={styling.colorPreview} style={{ backgroundColor: color }}>
                    <input 
                        type="color" 
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className={styling.colorInput}
                    />
                </div>
                <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>
                    {color.toUpperCase()}
                </span>
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
