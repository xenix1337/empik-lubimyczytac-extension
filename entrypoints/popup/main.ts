document.addEventListener('DOMContentLoaded', async () => {
  const uniqueLinksEl = document.getElementById('unique-links');
  const matchedBooksEl = document.getElementById('matched-books');
  const cloudflareWarningEl = document.getElementById('cloudflare-warning');

  try {
    // Odpytujemy aktywną kartę
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    
    if (tab?.id) {
      const stats = await browser.tabs.sendMessage(tab.id, { action: 'getStats' });
      
      if (stats) {
        if (uniqueLinksEl) uniqueLinksEl.textContent = stats.uniqueLinksCount.toString();
        if (matchedBooksEl) matchedBooksEl.textContent = stats.booksMatched.toString();
        
        if (stats.cloudflareBlocked && cloudflareWarningEl) {
          cloudflareWarningEl.classList.remove('hidden');
        }
      }
    }
  } catch (error) {
    // Jeśli skrypt na stronie nie odpowiedział (np. strona nie jest empikiem lub skrypt się nie załadował)
    if (uniqueLinksEl) uniqueLinksEl.textContent = '-';
    if (matchedBooksEl) matchedBooksEl.textContent = '-';
  }
});
