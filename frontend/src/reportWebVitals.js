function getOrCreateClientId() {
  let clientId = localStorage.getItem('ga_client_id');
  if (!clientId) {
    clientId = `${Date.now()}.${Math.random().toString(36).substring(2)}`;
    localStorage.setItem('ga_client_id', clientId);
  }
  return clientId;
}

function sendToGoogleAnalytics({ name, delta, id }) {
  const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
  const apiSecret = process.env.REACT_APP_GA_API_SECRET;

  if (!measurementId || !apiSecret) {
    console.warn('Il Mesurement ID di Google Analytics o l\'API key non sono state impostate');
    return;
  }

  const analyticsEndpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

  const body = JSON.stringify({
    client_id: getOrCreateClientId(),
    events: [
      {
        name: 'web_vital',
        params: {
          metric_name: name,
          metric_delta: delta,
          metric_id: id,
        },
      },
    ],
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(analyticsEndpoint, body);
  } else {
    fetch(analyticsEndpoint, { body, method: 'POST', keepalive: true });
  }
}

const reportWebVitals = () => {
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(sendToGoogleAnalytics);  //  misura la stabilità visiva
    getFID(sendToGoogleAnalytics);  //  misura l'interattività
    getFCP(sendToGoogleAnalytics);  //  misura la velocità di caricamento 
    getLCP(sendToGoogleAnalytics);  //  misura il momento in cui il primo contenuto (testo, immagine, ecc.) viene visualizzato sullo schermo
    getTTFB(sendToGoogleAnalytics); //  misura il tempo che intercorre tra la richiesta di una risorsa e l'arrivo del primo byte della risposta 
  });
};

export default reportWebVitals;
 