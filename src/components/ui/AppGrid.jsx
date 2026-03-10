const APPS = [
  { id: 'netflix', name: 'Netflix', color: '#E50914', imgPlaceholder: 'https://via.placeholder.com/200/222/fff?text=Logo+Netflix' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', imgPlaceholder: 'https://via.placeholder.com/200/222/fff?text=Logo+YouTube' },
  { id: 'spotify', name: 'Spotify', color: '#1DB954', imgPlaceholder: 'https://via.placeholder.com/200/222/fff?text=Logo+Spotify' },
  { id: 'galeria', name: 'Galería', color: '#007AFF', imgPlaceholder: 'https://via.placeholder.com/200/222/fff?text=Logo+Galeria' }
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
          {/* Aquí irán tus PNGs cuando los tengas */}
          <div className="app-icon-wrapper">
            <img src={app.imgPlaceholder} alt={app.name} className="app-icon" />
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