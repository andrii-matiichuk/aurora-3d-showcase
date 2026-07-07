#!/usr/bin/env bash
# Production build: minify CSS + JS with esbuild and inline the CSS into a
# single dist/index.html. Readable source in css/ and js/ stays untouched.
# Usage: ./build.sh   (requires Node.js + npx; esbuild is fetched on first run)
set -euo pipefail
cd "$(dirname "$0")"

rm -rf dist
mkdir -p dist/js

# Minify assets
npx --yes esbuild css/styles.css --minify --outfile=dist/styles.min.css
npx --yes esbuild js/i18n.js  --minify --outfile=dist/js/i18n.js
npx --yes esbuild js/scene.js --minify --outfile=dist/js/scene.js
npx --yes esbuild js/ui.js    --minify --outfile=dist/js/ui.js
npx --yes esbuild js/touch-fx.js --minify --outfile=dist/js/touch-fx.js

# Build dist/index.html: inline the minified CSS (removes one render-blocking request)
node -e '
  const fs = require("fs");
  let html = fs.readFileSync("index.html", "utf8");
  const css = fs.readFileSync("dist/styles.min.css", "utf8").trim();
  html = html.replace(
    /<link rel="stylesheet" href="css\/styles\.css" \/>/,
    "<style>" + css + "</style>"
  );
  // strip HTML comments and collapse blank lines
  html = html.replace(/<!--[\s\S]*?-->/g, "").replace(/\n\s*\n+/g, "\n");
  fs.writeFileSync("dist/index.html", html);
'
rm -f dist/styles.min.css

echo "Built dist/ ->"
ls -1 dist dist/js
