const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);  //  misura la velocità di caricamento
      getFID(onPerfEntry);  //  misura l'interattività
      getFCP(onPerfEntry);  //  misura la stabilità visiva.
      getLCP(onPerfEntry);  //  misura il momento in cui il primo contenuto (testo, immagine, ecc.) viene visualizzato sullo schermo
      getTTFB(onPerfEntry); //  misura il tempo che intercorre tra la richiesta di una risorsa e l'arrivo del primo byte della risposta
    });
  }
};

export default reportWebVitals;
