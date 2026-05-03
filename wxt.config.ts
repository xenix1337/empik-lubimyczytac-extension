import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    name: 'Empik ↔ LubimyCzytać',
    description: 'Integracja pomiędzy sklepem Empik a portalem LubimyCzytać.',
    permissions: [
      'notifications'
    ],
    host_permissions: [
      '*://lubimyczytac.pl/*'
    ],
    icons: {
      "16": "icon.svg",
      "32": "icon.svg",
      "48": "icon.svg",
      "128": "icon.svg"
    },
    action: {
      default_icon: "icon.svg"
    },
    browser_action: {
      default_icon: "icon.svg"
    },
    browser_specific_settings: {
      gecko: {
        id: "empik-lubimyczytac@xenix1337",
        data_collection_permissions: {
          required: ["none"]
        }
      }
    }
  },
  webExt: {
    startUrls: ['https://www.empik.com/wiosna/ksiazki/pakiety/2za50']
  }
});
