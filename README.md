# Empik ↔ LubimyCzytać Extension

Eleganckie rozszerzenie przeglądarki łączące największy polski sklep kulturalny Empik.com z największym portalem z recenzjami literackimi – Lubimyczytac.pl.

## Funkcje wtyczki
- **Oceny na żywo**: Automatycznie wyszukuje i wstrzykuje pomarańczowe odznaki z ocenami książek bezpośrednio na listach produktów w Empiku.
- **Smart Matching**: Wykorzystuje tzw. *fuzzy matching*, aby ignorować odwrotny zapis autora (np. "Katarzyna Wolwowicz" na Empiku oraz "Wolwowicz Katarzyna" na LC).
- **Zoptymalizowany Scraping**: Obcina numery serii czy tomów, zlicza unikalne identyfikatory i scrapuje w locie oryginalny HTML z wyszukiwarki portalu.
- **Obsługa Cloudflare**: W przypadku odcięcia dostępu (np. weryfikacja przeglądarki z kodem 403), wtyczka posiada dedykowany Popup i wypuszcza systemowe powiadomienie, by użytkownik wyklikał ewentualną Captchę.
- **Cross-Browser**: Napisane przy użyciu nowoczesnego frameworka [WXT](https://wxt.dev/), co zapewnia z miejsca architekturę Manifest V3 dla Chrome, Edge, Opery oraz wsparcie dla przeglądarki Firefox.

---

## 🛠️ Development

```bash
# Instalacja paczek
npm install

# Testowanie na Firefoksie
npm run dev:firefox

# Testowanie na Chrome/Edge
npm run dev
```

## 📦 Przygotowanie do Produkcji
```bash
# Budowanie rozszerzenia dla wszystkich targetów
npm run build
```
Zbudowane pliki wtyczki znajdą się w katalogu `.output/`. Aby wygenerować archiwa gotowe do sklepów, uruchom komendę:
```bash
npm run zip
```
Spakowane archiwa znajdziesz w folderze `.output/`.

---

## 🚀 Publikacja w Sklepach

### Sklep Google Chrome Web Store
1. Zbuduj archiwum ZIP (`npm run zip`).
2. Zaloguj się w [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/). Rejestracja wymaga opłacenia jednorazowej, dożywotniej opłaty w wysokości $5.
3. Kliknij **Nowy element** i prześlij wygenerowany dla Chrome pakiet `.zip`.
4. Wypełnij stronę szczegółów sklepu:
   - Opis działania wtyczki.
   - Prześlij screeny z działania wtyczki na tle Empiku.
   - Załącz ikonę wtyczki i tzw. Marquee promocyjne.
5. Uzupełnij zakładkę **Prywatność**. Rozszerzenie używa uprawnień `storage` (wymagane przez środowisko do cache'u lub zapisywania ustawień w przyszłości) oraz `notifications` (do ostrzegania o braku połączenia). Podaj te argumenty recenzentom.
6. Prześlij rozszerzenie do weryfikacji. Wypuszczenie wersji do sklepu zajmuje zazwyczaj 2-3 dni.

### Sklep Firefox Add-ons (Mozilla)
1. Wygeneruj ZIP dedykowany pod przeglądarkę Firefox (`npm run zip:firefox`).
2. Przejdź na [Firefox Add-on Developer Hub](https://addons.mozilla.org/en-US/developers/). Rejestracja deweloperska tutaj jest całkowicie darmowa.
3. Kliknij **Submit a New Add-on**.
4. Wybierz opcję hostowania na addons.mozilla.org.
5. Prześlij plik `.zip`. Ich walidator przepuści wtyczkę przez zautomatyzowane skanery bezpieczeństwa.
6. Uzupełnij wymagane metadane (opis, kategoria, zrzuty ekranu).
7. W przypadku Firefoxa recenzenci często polegają na narzędziach analizujących kod źródłowy. Ze względu na fakt używania bundlera (Vite), Mozilla może zażądać wrzucenia także paczki z oryginalnym kodem źródłowym wtyczki w zakładce "Source code", by upewnić się, że to my wygenerowaliśmy kod (`npm run zip` tworzy specjalną paczkę z kodem źródłowym specjalnie dla nich!).
8. Prześlij do recenzji, co trwa zwykle około od 24 do 48 godzin.
