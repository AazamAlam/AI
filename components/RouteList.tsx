import React from 'react';
import { Route } from '../types';
import { getColors } from '../utils/colors';

interface RouteListProps {
  routes: Route[];
  onRouteSelect: (id: string) => void;
  isMobile?: boolean;
}

export const RouteList: React.FC<RouteListProps> = ({ routes, onRouteSelect, isMobile = false }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {routes.map((route) => {
        const colors = getColors(route.color);
        return (
          <button
            key={route.id}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '0.75rem',
              borderRadius: isMobile ? '0.5rem' : '0.75rem',
              border: `2px solid ${route.isSelected ? colors.border : '#e5e7eb'}`,
              backgroundColor: route.isSelected ? '#eef2ff' : 'white',
              boxShadow: route.isSelected ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onClick={() => onRouteSelect(route.id)}
            onMouseEnter={(e) => !route.isSelected && (e.currentTarget.style.borderColor = '#d1d5db')}
            onMouseLeave={(e) => !route.isSelected && (e.currentTarget.style.borderColor = '#e5e7eb')}
          >
            <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: isMobile ? 0 : '0.25rem',
                flex: isMobile ? 1 : undefined
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  minWidth: 0, 
                  flex: 1, 
                  marginRight: '0.5rem' 
                }}>
                  <div style={{ 
                    padding: '0.375rem', 
                    borderRadius: '9999px', 
                    backgroundColor: colors.bg, 
                    marginRight: isMobile ? '0.75rem' : '0.5rem', 
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' 
                  }}>
                    <route.icon style={{ width: '1rem', height: '1rem', color: 'white' }} />
                  </div>
                  {isMobile ? (
                    <div style={{ minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#374151',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {route.label.split('(')[0].trim()}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {route.segment.distance} / {route.segment.duration}
                      </span>
                    </div>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        color: '#374151',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}
                    >
                      {route.label.split('(')[0].trim()}
                    </span>
                  )}
                </div>
                <span style={{ 
                  fontSize: isMobile ? '1rem' : '1.125rem', 
                  fontWeight: isMobile ? '700' : '800', 
                  color: '#111827', 
                  lineHeight: 1, 
                  flexShrink: 0,
                  marginLeft: isMobile ? '0.5rem' : 0
                }}>
                  {route.score}<span style={{ fontSize: '0.75rem', fontWeight: '400', color: '#6b7280' }}>/100</span>
                </span>
              </div>
              {!isMobile && (
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280', 
                  fontWeight: '500', 
                  marginLeft: '2rem', 
                  margin: 0 
                }}>
                  {route.segment.distance} / {route.segment.duration} ({route.label.match(/\(([^)]+)\)/)?.[1] || 'Details'})
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};