// Tailwind for critical-product.scss: the theme's setup, scanning only the product page's first-screen sources.
const path = require('path');
const base = require('../../tailwind.config.cjs');

const engine = path.join(__dirname, '../../node_modules/@salla.sa/twilight-theme-engine/tailwind');

module.exports = {
  ...base,
  content: [
    './app/routes/__root.tsx',
    './app/components/{layout,ui,product}/**/*.{ts,tsx}',
    `${engine}/components/{layout,product}/**/*`,
    `${engine}/components/common/BreadcrumbTrail.*`,
    `${engine}/routes/product/**/*`,
    './node_modules/@salla.sa/twilight-components-react/dist/skeletons/**/*.js',
    // Listing cards share the folder but render on other pages.
    '!./app/components/product/{ProductCard,ProductList*}.tsx',
    `!${engine}/components/product/{ProductCard,ProductList*}.*`,
  ],
};
