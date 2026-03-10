import { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const APPS = [
  { id: 'netflix', name: 'Netflix', color: '#E50914' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000' }
];

const AppGrid = ({ onMapUpdate, activeId }) => {
  const gridRef = useRef(null);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => {
      const map = Array.from(gridRef.current.children).map(el => ({
        id: el.dataset.id,
        rect: el.getBoundingClientRect()
      }));
      onMapUpdate(map);
    });
    observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, [onMapUpdate]);

  return (
    <div className="app-grid" ref={gridRef}>
      {APPS.map(app => (
        <div key={app.id} data-id={app.id} className={`app-card ${activeId === app.id ? 'hover' : ''}`}>
          {app.name}
        </div>
      ))}
    </div>
  );
};

export default AppGrid;