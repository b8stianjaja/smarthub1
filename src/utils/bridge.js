/**
 * Emite comandos hacia el System Bridge (Extensión)
 * cumpliendo con la Sección 5.24 del D.E.M.
 */
export const sendBridgeCommand = (action, payload = {}) => {
  window.postMessage({
    source: 'smarthub-spatial-os',
    action: action,
    ...payload
  }, "*"); 
};

export const COMMANDS = {
  OPEN_APP: 'OPEN_APP',
  PLAY_PAUSE: 'KEY_STROKE', // Space
  FULLSCREEN: 'KEY_STROKE', // F
  MUTE: 'KEY_STROKE',       // M
};