import React from 'react';
import { IconMapPin } from '../icons';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}

export const LocationInput: React.FC<LocationInputProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  disabled = false 
}) => {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          paddingLeft: '2.5rem',
          paddingRight: '1rem',
          paddingTop: '0.5rem',
          paddingBottom: '0.5rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          outline: 'none'
        }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        disabled={disabled}
      />
      <IconMapPin 
        style={{ 
          position: 'absolute', 
          left: '0.75rem', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          width: '1rem', 
          height: '1rem', 
          color: '#9ca3af' 
        }} 
      />
    </div>
  );
};