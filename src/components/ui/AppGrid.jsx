import { useLayoutEffect, useRef } from 'react';

const APPS = [
  { id: 'netflix', name: 'Netflix', color: '#E50914' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000' },
  { id: 'spotify', name: 'Spotify', color: '#1DB954' }
];

const AppGrid = ({ onMapUpdate }) => {
  const gridRef = useRef(null);

  useLayoutEffect(() => {
    // Genera las "cajas de colisión" (Hitboxes) para el motor espacial
    const updateMap = () => {
      if (!gridRef.current) return;
      const map = Array.from(gridRef.current.children).map(el => ({
        id: el.dataset.id,
        rect: el.getBoundingClientRect()
      }));
      onMapUpdate(map);
    };

    updateMap(); // Llamada inicial
    
    // Si la ventana cambia de tamaño, recalculamos las hitboxes
    window.addEventListener('resize', updateMap);
    return () => window.removeEventListener('resize', updateMap);
  }, [onMapUpdate]);

  return (
    <div className="app-grid" ref={gridRef}>
      {APPS.map(app => (
        <div key={app.id} data-id={app.id} className="app-card" style={{ '--hover-color': app.color }}>
          <h2>{app.name}</h2>
        </div>
      ))}
    </div>
  );
};

export default AppGrid;