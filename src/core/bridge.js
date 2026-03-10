export const sendBridgeCommand = (action, payload = {}) => {
  window.postMessage({
    source: 'smarthub-spatial-os',
    action: action,
    ...payload // Se despliega el appId aquí
  }, "*"); 
};