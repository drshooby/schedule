"use client";
import React, { useState, useRef, useEffect } from "react";
import { START_HOUR, END_HOUR } from "@/utils/constants";
import styles from "./TimeSelect.module.css";

interface TimeSelectProps {
  value: string; // Expected "HH:mm" (24h)
  onChange: (value: string) => void;
}

export function TimeSelect({ value, onChange }: TimeSelectProps) {
  // Local state for what the user typed. 
  // We initialize it by formatting the incoming "HH:mm" into friendly "h:mm am/pm"
  const [inputValue, setInputValue] = useState(formatDisplayTime(value));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal state if prop changes form outside
  useEffect(() => {
    // Only update if not currently focused to avoid fighting the user
    if (document.activeElement !== containerRef.current?.querySelector('input')) {
         setInputValue(formatDisplayTime(value));
    }
  }, [value]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleBlur = () => {
    // When leaving logic, parse whatever is in the input
    const parsed = parseTime(inputValue);
    if (parsed) {
        // Valid time found
        onChange(parsed); // updates parent with "HH:mm"
        setInputValue(formatDisplayTime(parsed)); // re-format display
    } else {
        // Invalid, revert to last known good prop
        setInputValue(formatDisplayTime(value));
    }
    // We don't close dropdown immediately here because the click might be ON the dropdown
    // The click-outside handler handles the actual closing
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
        e.currentTarget.blur();
        setIsDropdownOpen(false);
    }
    if (e.key === "Escape") {
        setIsDropdownOpen(false);
        e.currentTarget.blur();
    }
  };

  const handleOptionClick = (time24: string) => {
    onChange(time24);
    setInputValue(formatDisplayTime(time24));
    setIsDropdownOpen(false);
  };

  // Generate suggestions (every 30 mins)
  const suggestions = generateTimeSlots();

  return (
    <div className={styles.container} ref={containerRef}>
      <input
        type="text"
        className={styles.input}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Select time..."
      />
      
      <div className={`${styles.dropdown} ${isDropdownOpen ? styles.open : ""}`}>
        {suggestions.map((slot) => (
          <div 
            key={slot.val} 
            className={`${styles.option} ${slot.val === value ? styles.selected : ""}`}
            onMouseDown={(e) => {
                // Prevent input blur so we don't trigger handleBlur logic prematurely
                e.preventDefault();
            }}
            onClick={(e) => {
                e.stopPropagation(); // Prevent click from bubbling to modal/forms
                handleOptionClick(slot.val);
            }}
          >
            {slot.label}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Helpers ---

// Generates "HH:mm" -> "h:mm AM/PM"
function formatDisplayTime(time24: string): string {
    if (!time24) return "";
    const [hStr, mStr] = time24.split(":");
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) return time24;

    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12; 
    const mDisplay = m < 10 ? `0${m}` : m;
    return `${h}:${mDisplay} ${ampm}`;
}

// Parses "9", "930", "9:30", "14", "2pm" -> "HH:mm" (24h)
// Returns null if invalid
function parseTime(input: string): string | null {
    const clean = input.trim().toLowerCase().replace(/[^a-z0-9:]/g, "");
    if (!clean) return null;

    let h = 0, m = 0;
    let isPM = clean.includes("p");
    let isAM = clean.includes("a");
    
    // Remove letters
    const numbers = clean.replace(/[a-z]/g, "");
    
    if (numbers.includes(":")) {
        // Format "9:30"
        const parts = numbers.split(":");
        h = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10);
    } else {
        // Loose formats: "9", "930", "1400"
        const num = parseInt(numbers, 10);
        if (isNaN(num)) return null;

        if (num < 24) {
            // "9", "14" -> just hour
            h = num;
        } else if (num < 100) {
           // ambiguous "99" ? Asssume "9:09" ? rare. 
           // Let's treat < 60 as minutes of current hour? No context.
           // Probably invalid or just hours. Let's treat "45" as 45:00 (invalid hour)
           // Actually, standard quick entry is usually hours.
           h = num; 
        } else {
            // "930", "1430"
            // Last 2 digits are minutes
            m = num % 100;
            h = Math.floor(num / 100);
        }
    }

    // Apply AM/PM logic
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;

    // Validation
    if (h > 23) h = 23; // Clamp? or Error? Clamp for safety
    if (m > 59) m = 59;
    
    // Return "HH:mm"
    const hStr = h < 10 ? `0${h}` : h;
    const mStr = m < 10 ? `0${m}` : m;
    return `${hStr}:${mStr}`;
}



// ... (existing imports)

function generateTimeSlots() {
    const slots = [];
    const startMins = START_HOUR * 60;
    const endMins = END_HOUR * 60; // Strictly stop at 11:00 PM

    for (let i = 0; i <= (endMins - startMins) / 30; i++) {
        const totalMins = startMins + i * 30;
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        
        // Don't go past 24:00
        if (h > 24 || (h === 24 && m > 0)) continue;

        const hStr = h < 10 ? `0${h}` : h;
        const mStr = m < 10 ? `0${m}` : m;
        const val = `${hStr}:${mStr}`;
             
        slots.push({
            val, 
            label: formatDisplayTime(val)
        });
    }
    return slots;
}
