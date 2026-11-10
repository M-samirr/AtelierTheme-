// Tailwind for critical.scss: the theme's setup, scanning only the home page's first-screen sources.
const path = require('path');
const base = require('../../tailwind.config.cjs');

const engine = path.join(__dirname, '../../node_modules/@salla.sa/twilight-theme-engine/tailwind');

module.exports = {
  ...base,
  content: [
    './app/routes/__root.tsx',
    './app/components/{layout,ui,home}/**/*.{ts,tsx}',
    `${engine}/components/{layout,home}/**/*`,
    `${engine}/routes/home/**/*`,
    // The SDK's server skeletons, which stand in for its components until they load.
    './node_modules/@salla.sa/twilight-components-react/dist/skeletons/**/*.js',
  ],
};
