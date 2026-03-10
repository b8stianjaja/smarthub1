import { useState, useCallback, useRef } from 'react';
import HandDetector from './components/HandDetector';
import SpatialCursor from './components/SpatialCursor';
import AppGrid from './components/AppGrid';

function App() {
  const [frameData, setFrameData] = useState({ point: { x: 0, y: 0 }, pinching: false });
  const [hoveredApp, setHoveredApp] = useState(null);
  const collisionMap = useRef([]);

  const handleFrame = useCallback((landmarks) => {
    const thumb = landmarks[4];
    const index = landmarks[8];

    // Cálculo de Pinch (D.E.M. 4.21)
    const dist = Math.sqrt(Math.pow(thumb.x - index.x, 2) + Math.pow(thumb.y - index.y, 2));
    const isPinching = dist < 0.05;

    const pxX = index.x * window.innerWidth;
    const pxY = index.y * window.innerHeight;

    // Detección de colisiones contra mapa estático [cite: 20]
    const hit = collisionMap.current.find(app => 
      pxX >= app.rect.left && pxX <= app.rect.right &&
      pxY >= app.rect.top && pxY <= app.rect.bottom
    );

    setHoveredApp(hit?.id || null);
    setFrameData({ point: { x: index.x, y: index.y }, pinching: isPinching });

    if (hit && isPinching) {
      window.postMessage({ source: 'smarthub', action: 'OPEN', id: hit.id }, "*"); // System Bridge [cite: 24]
    }
  }, []);

  return (
    <div className="spatial-os">
      <HandDetector onFrame={handleFrame} />
      <SpatialCursor point={frameData.point} isPinching={frameData.pinching} />
      <AppGrid onMapUpdate={(map) => collisionMap.current = map} activeId={hoveredApp} />
    </div>
  );
}

export default App;