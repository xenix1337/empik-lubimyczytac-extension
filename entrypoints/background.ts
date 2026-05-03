const NOTIFICATION_ID = 'lc-cloudflare-warning';
let lastNotificationTime = 0;

export default defineBackground(() => {
  // Handle notification clicks to immediately open the resolution page
  browser.notifications.onClicked.addListener((notificationId) => {
    if (notificationId === NOTIFICATION_ID) {
      browser.tabs.create({ url: 'https://lubimyczytac.pl' });
      browser.notifications.clear(notificationId);
    }
  });

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action !== 'searchBook') return false;

    const phrase = encodeURIComponent(message.phrase);
    const url = `https://lubimyczytac.pl/szukaj/ksiazki?phrase=${phrase}`;

    fetch(url)
      .then(async (response) => {
        if (response.ok) {
          const text = await response.text();
          sendResponse({ success: true, html: text });
        } else {
          // Detect Cloudflare blocks or heavy rate-limiting (403/503)
          if (response.status === 403 || response.status === 503) {
            const now = Date.now();
            // Throttle notifications to max once per 5 minutes to prevent spamming
            if (now - lastNotificationTime > 300000) {
              lastNotificationTime = now;
              browser.notifications.create(NOTIFICATION_ID, {
                type: 'basic',
                iconUrl: browser.runtime.getURL('/icon.svg'),
                title: 'Empik ↔ LubimyCzytać',
                message: 'Wykryto blokadę bezpieczeństwa LubimyCzytać! Kliknij to powiadomienie, by otworzyć serwis i się odblokować.'
              }).catch(() => {
                // Silently ignore notification errors (e.g., disabled in OS)
              }); 
            }
          }
          sendResponse({ success: false, error: `HTTP Error ${response.status}` });
        }
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.toString() });
      });

    // Keeps the message channel open for an asynchronous response
    return true;
  });
});
