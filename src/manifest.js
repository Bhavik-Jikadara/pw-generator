import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json' assert { type: 'json' }

const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'logo.png',
    32: 'logo.png',
    48: 'logo.png',
    128: 'logo.png',
  },
  action: {
    default_popup: 'popup.html',
    default_icon: 'logo.png',
    default_title: packageData.name,
  },
  background: {
    service_worker: 'src/background/index.js',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['src/contentScript/index.js'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['logo.png'],
      matches: [],
    },
  ],
  permissions: ['storage', 'clipboardWrite'],
})
