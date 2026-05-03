interface BookSuggestion {
  title: string;
  url: string;
  authors: string[];
  rating: string;
}

let extState = {
  uniqueLinksCount: 0,
  booksMatched: 0,
  cloudflareBlocked: false
};
const matchedUrls = new Set<string>();

export default defineContentScript({
  matches: ['*://*.empik.com/*'],
  main() {
    extState = {
      uniqueLinksCount: 0,
      booksMatched: 0,
      cloudflareBlocked: false
    };
    matchedUrls.clear();

    browser.runtime.onMessage.addListener((message) => {
      if (message.action === 'getStats') {
        // W nowoczesnym MV3 zwrócenie Promise bezpośrednio jest najszybszym i najbardziej niezawodnym
        // sposobem na odesłanie odpowiedzi (omijamy problemy z cyklem życia sendResponse)
        return Promise.resolve(extState);
      }
    });

    const RETRY_DELAYS_MS = [0, 1000, 2000];
    
    const initializeApp = (attemptIndex: number) => {
      if (attemptIndex >= RETRY_DELAYS_MS.length) return;
      
      const currentDelay = attemptIndex === 0 
        ? 0 
        : RETRY_DELAYS_MS[attemptIndex] - RETRY_DELAYS_MS[attemptIndex - 1];

      setTimeout(() => {
        const bookLinks = document.querySelectorAll<HTMLAnchorElement>('a[href*="ksiazka-p"]');
        
        if (bookLinks.length > 0) {
          const uniqueHrefs = new Set<string>();
          bookLinks.forEach(link => {
            uniqueHrefs.add(link.href.split('?')[0]);
          });
          extState.uniqueLinksCount = uniqueHrefs.size;

          bookLinks.forEach(processBookLink);
        } else {
          // Retry if elements are loaded asynchronously (e.g., SPAs)
          initializeApp(attemptIndex + 1);
        }
      }, currentDelay);
    };

    initializeApp(0);
  },
});

async function processBookLink(link: HTMLAnchorElement) {
  const titleContainer = link.querySelector('strong.ta-product-title') || link.querySelector('strong');
  const rawTitle = titleContainer?.textContent;
  const productTitleAttribute = link.getAttribute('title') || '';
  
  if (!rawTitle) return;

  const normalizedTitle = rawTitle.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  // Strip volume/series identifiers (everything after the first dot)
  const searchPhrase = normalizedTitle.split('.')[0].trim();

  try {
    const response = await browser.runtime.sendMessage({
      action: 'searchBook',
      phrase: searchPhrase
    });

    if (!response.success) {
      if (response.status === 403 || response.error?.includes('403') || response.error?.includes('503')) {
        extState.cloudflareBlocked = true;
      }
      return;
    }
    
    if (!response.html) return;

    const suggestions = parseHtmlSuggestions(response.html);
    const matchedBook = findMatchingBook(suggestions, productTitleAttribute);

    if (matchedBook) {
      appendRatingBadge(link, titleContainer, matchedBook.rating);
      matchedUrls.add(link.href.split('?')[0]);
      extState.booksMatched = matchedUrls.size;
    }
  } catch {
    // Silently ignore errors in production
  }
}

function parseHtmlSuggestions(html: string): BookSuggestion[] {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');
  const bookNodes = document.querySelectorAll('.authorAllBooks__singleText');
  const suggestions: BookSuggestion[] = [];

  bookNodes.forEach(node => {
    const titleNode = node.querySelector<HTMLAnchorElement>('.authorAllBooks__singleTextTitle');
    const authorNodes = node.querySelectorAll<HTMLAnchorElement>('.authorAllBooks__singleTextAuthor a');
    const ratingNode = node.querySelector<HTMLElement>('.listLibrary__ratingStarsNumber');

    if (titleNode) {
      const href = titleNode.getAttribute('href') || '';
      suggestions.push({
        title: titleNode.textContent?.trim() || '',
        url: href.startsWith('http') ? href : `https://lubimyczytac.pl${href}`,
        authors: Array.from(authorNodes).map(a => a.textContent?.trim() || ''),
        rating: ratingNode?.textContent?.trim() || ''
      });
    }
  });

  return suggestions;
}

function findMatchingBook(suggestions: BookSuggestion[], targetTitleAttribute: string): BookSuggestion | undefined {
  const normalizedTargetAttribute = targetTitleAttribute.toLowerCase();

  return suggestions.find(book => {
    if (book.authors.length === 0) return false;

    return book.authors.some(authorName => {
      if (!authorName) return false;
      
      const authorParts = authorName.toLowerCase().split(/\s+/);
      // Validate that all parts of the author's name exist in the target title attribute.
      // This approach elegantly handles cases where first and last names are swapped.
      return authorParts.every(part => normalizedTargetAttribute.includes(part));
    });
  });
}

function appendRatingBadge(link: HTMLAnchorElement, titleContainer: Element | null, rawRating: string) {
  // Prevent duplicate badges
  if (link.querySelector('.lc-rating-badge') || !rawRating) return;

  const numericRating = rawRating.split('/')[0].trim();
  if (!numericRating) return;
  
  const badge = document.createElement('span');
  badge.className = 'lc-rating-badge';
  badge.style.color = '#FF5500';
  badge.style.fontWeight = 'bold';
  badge.style.marginLeft = '8px';
  badge.style.whiteSpace = 'nowrap';
  badge.innerHTML = `★ ${numericRating}`;
  
  if (titleContainer) {
    titleContainer.after(badge);
  } else {
    link.appendChild(badge);
  }
}
