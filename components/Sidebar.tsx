import React from 'react';
import { Route } from '../types';
import { IconMapPin, IconSearch } from '../icons';
import { LocationInput } from './LocationInput';
import { RouteList } from './RouteList';

interface SidebarProps {
  startLocationName: string;
  endLocationName: string;
  onStartLocationChange: (value: string) => void;
  onEndLocationChange: (value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  geocodeError: string | null;
  routes: Route[] | null;
  onRouteSelect: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  startLocationName,
  endLocationName,
  onStartLocationChange,
  onEndLocationChange,
  onSearch,
  isLoading,
  geocodeError,
  routes,
  onRouteSelect,
}) => {
  return (
    <div style={{ 
      width: '320px', 
      padding: '1.5rem', 
      backgroundColor: 'white', 
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
      zIndex: 20, 
      flexShrink: 0, 
      overflowY: 'auto' 
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <IconMapPin style={{ color: '#4f46e5', width: '1.5rem', height: '1.5rem' }}/>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
          Smart Route Planner
        </h1>
      </div>
      
      {/* Location Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <LocationInput
          value={startLocationName}
          onChange={onStartLocationChange}
          placeholder="Start Location (e.g., NYU)"
          disabled={isLoading}
        />
        <LocationInput
          value={endLocationName}
          onChange={onEndLocationChange}
          placeholder="Destination (e.g., Central Park)"
          disabled={isLoading}
        />
      </div>

      {/* Search Button */}
      <button
        style={{
          width: '100%',
          padding: '0.625rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0.5rem',
          fontWeight: '600',
          color: 'white',
          backgroundColor: isLoading ? '#818cf8' : '#4f46e5',
          border: 'none',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s'
        }}
        onClick={onSearch}
        disabled={isLoading || !startLocationName || !endLocationName}
        onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#4338ca')}
        onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#4f46e5')}
      >
        {isLoading ? (
          <>
            <svg 
              style={{ 
                animation: 'spin 1s linear infinite', 
                marginRight: '0.75rem', 
                height: '1.25rem', 
                width: '1.25rem', 
                color: 'white' 
              }} 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                style={{ opacity: 0.25 }} 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                style={{ opacity: 0.75 }} 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Searching...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        ) : (
          <>
            <IconSearch style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Search Optimal Routes
          </>
        )}
      </button>

      {/* Geocoding Error Display */}
      {geocodeError && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          backgroundColor: '#fee2e2', 
          color: '#b91c1c', 
          borderRadius: '0.5rem', 
          fontSize: '0.875rem' 
        }}>
          <p style={{ margin: 0, fontWeight: '600' }}>Location Error:</p>
          <p style={{ margin: 0 }}>{geocodeError}</p>
        </div>
      )}
      
      {/* Route Selector (Desktop) */}
      {routes && (
        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#1f2937', 
            marginBottom: '0.75rem' 
          }}>
            Found {routes.length} Optimal Routes:
          </p>
          <RouteList routes={routes} onRouteSelect={onRouteSelect} />
        </div>
      )}
    </div>
  );
};