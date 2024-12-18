import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json' assert { type: 'json' }

const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  action: {
    default_popup: "popup.html",
    default_icon: {
      "16": "logo.png",
      "32": "logo.png",
      "48": "logo.png",
      "128": "logo.png"
    }
  },
  icons: {
    "16": "logo.png",
    "32": "logo.png",
    "48": "logo.png",
    "128": "logo.png"
  },
  background: {
    service_worker: "src/background/index.js",
    type: "module"
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["src/contentScript/index.js"]
    }
  ],
  web_accessible_resources: [
    {
      resources: ["logo.png", "assets/*"],
      matches: ["<all_urls>"]
    }
  ],
  commands: {
    _execute_action: {
      suggested_key: {
        default: "Ctrl+Shift+B",
        mac: "Command+Shift+B"
      },
      description: "Open password generator"
    }
  },
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
  }
});