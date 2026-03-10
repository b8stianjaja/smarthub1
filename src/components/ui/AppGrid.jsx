const APPS = [
  { id: 'netflix', name: 'Netflix', color: '#E50914', imgPlaceholder: 'https://via.placeholder.com/200/222/fff?text=Netflix' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', imgPlaceholder: 'https://via.placeholder.com/200/222/fff?text=YouTube' },
  { id: 'disney', name: 'Disney+', color: '#113CCF', imgPlaceholder: 'https://via.placeholder.com/200/222/fff?text=Disney+' },
  { id: 'hbomax', name: 'Max', color: '#002BE7', imgPlaceholder: 'https://via.placeholder.com/200/222/fff?text=Max' },
  { id: 'spotify', name: 'Spotify', color: '#1DB954', imgPlaceholder: 'https://via.placeholder.com/200/222/fff?text=Spotify' },
  { id: 'galeria', name: 'Galería', color: '#007AFF', imgPlaceholder: 'https://via.placeholder.com/200/222/fff?text=Galeria' }
];

const AppGrid = () => {
  return (
    <div className="app-grid">
      {APPS.map(app => (
        <div 
          key={app.id} 
          className="app-card spatial-interactable" 
          data-spatial-action="OPEN_APP"
          data-spatial-id={app.id}
          style={{ '--brand-color': app.color }}
        >
          <div className="app-icon-wrapper">
            {/* decoding="async" previene que la decodificación trabe la interfaz */}
            <img src={app.imgPlaceholder} alt={app.name} className="app-icon" loading="lazy" decoding="async" />
          </div>
          <div className="app-info">
            <h2>{app.name}</h2>
          </div>
          <div className="app-glow"></div>
        </div>
      ))}
    </div>
  );
};

export default AppGrid;