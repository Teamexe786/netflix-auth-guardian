import { useState } from "react";

interface NetflixInputProps {
  type: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export const NetflixInput = ({ type, label, value, onChange, required = false }: NetflixInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="relative h-12 mb-4">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        className="netflix-input"
      />
      <label className={`netflix-label ${(isFocused || value) ? 'text-xs -translate-y-[130%]' : ''}`}>
        {label}
      </label>
    </div>
  );
};