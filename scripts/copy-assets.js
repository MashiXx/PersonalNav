// tsc only emits .ts/.json, so views and static assets never reach dist/.
// index.ts resolves both from __dirname, which means a built app cannot render
// anything without this step.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const assets = ['views', 'public'];

for (const asset of assets) {
  const from = path.join(root, 'src', asset);
  const to = path.join(root, 'dist', asset);

  if (!fs.existsSync(from)) {
    console.warn(`skipped src/${asset} (not found)`);
    continue;
  }

  // Overwrite in place rather than wiping the target: dist/public/uploads holds
  // user-uploaded avatars and icons when running outside a container.
  fs.cpSync(from, to, { recursive: true });
  console.log(`copied src/${asset} -> dist/${asset}`);
}
