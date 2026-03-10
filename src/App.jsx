import { useSpatialEngine } from './hooks/useSpatialEngine';
import SpatialCursor from './components/spatial/SpatialCursor';
import AppGrid from './components/ui/AppGrid';

function App() {
  const { videoRef, cursorX, cursorY, updateCollisionMap } = useSpatialEngine();

  return (
    <div className="os-environment">
      {/* El video ahora es visible para depurar */}
      <video ref={videoRef} className="engine-feed" playsInline muted />
      
      <SpatialCursor x={cursorX} y={cursorY} />
      
      <div className="os-workspace">
        <header className="os-header">
          <h1>SmartHub</h1>
          <p>Spatial OS Environment</p>
        </header>
        <AppGrid onMapUpdate={updateCollisionMap} />
      </div>
    </div>
  );
}

export default App;