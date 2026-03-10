import { useState, useCallback } from 'react';
import { useSpatialEngine } from './hooks/useSpatialEngine';
import SpatialCursor from './components/spatial/SpatialCursor';
import AppGrid from './components/ui/AppGrid';
import { sendBridgeCommand } from './core/bridge';

function App() {
  const [activeApp, setActiveApp] = useState(null);

  const handleSpatialAction = useCallback((action, targetId) => {
    if (action === 'OPEN_APP') {
      // Diferenciamos apps web vs apps locales de SmartHub
      const webApps = ['netflix', 'youtube', 'disney', 'hbomax', 'spotify'];
      
      if (webApps.includes(targetId)) {
        sendBridgeCommand('OPEN_APP', { appId: targetId }); // Enviamos a la extensión
      } else {
        setActiveApp(targetId); // Abrimos dentro del Hub (ej: Galería)
      }
    } else if (action === 'GO_HOME') {
      setActiveApp(null);
    }
  }, []);

  const { videoRef, cursorX, cursorY, isReady } = useSpatialEngine(handleSpatialAction);

  return (
    <div className="os-environment">
      <video ref={videoRef} className="engine-feed" playsInline muted />
      
      {isReady && <SpatialCursor x={cursorX} y={cursorY} />}
      
      {!isReady && (
        <div className="spatial-loader">
          <div className="loader-ring"></div>
          <h2>Iniciando Entorno Espacial</h2>
          <p>Calibrando sensores biomecánicos...</p>
        </div>
      )}

      <div className={`os-workspace ${isReady ? 'fade-in' : 'hidden'}`}>
        {activeApp === null ? (
          <>
            <header className="os-header">
              <h1>SmartHub</h1>
            </header>
            <AppGrid />
          </>
        ) : (
          <div className="app-window">
            <button 
              className="spatial-interactable back-button" 
              data-spatial-action="GO_HOME"
            >
              ← Volver al Hub
            </button>
            <div className="app-content">
              <h2>Entorno: {activeApp.toUpperCase()}</h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;