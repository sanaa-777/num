const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const version = process.env.APP_BUILD_VERSION || new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
let commit = process.env.GITHUB_SHA || 'local';
try {
  commit = execSync('git rev-parse --short HEAD', {
    cwd: root,
    stdio: ['ignore', 'pipe', 'ignore']
  }).toString().trim();
} catch (_) {}
const deployedAt = new Date().toISOString();

function stampHtmlAssets(content) {
  return content
    .replace(/((?:src|href)=["'][^"']+\.(?:css|js))\?v=(?:__APP_BUILD_VERSION__|\d{14})/gi, `$1?v=${version}`)
    .replace(/((?:src|href)=["'][^"']+\.(?:json|png|jpe?g|svg|ico|webp))\?v=(?:__APP_BUILD_VERSION__|\d{14})/gi, '$1');
}

const updates = [
  {
    file: 'index.html',
    transforms: [stampHtmlAssets]
  },
  {
    file: 'admin.html',
    transforms: [stampHtmlAssets]
  },
  {
    file: 'about.html',
    transforms: [stampHtmlAssets]
  },
  {
    file: 'privacy.html',
    transforms: [stampHtmlAssets]
  },
  {
    file: 'sw.js',
    transforms: [
      (content) => content.replace(/const BUILD_VERSION = '(?:__APP_BUILD_VERSION__|\d{14})';/, `const BUILD_VERSION = '${version}';`),
      (content) => content.replace(/(\/(?:index|admin)\.html|\/manifest\.json)\?v=(?:__APP_BUILD_VERSION__|\d{14}|\$\{BUILD_VERSION\})/g, '$1'),
      (content) => content.replace(/(\/[^`'"\s]+?\.(?:css|js))\?v=(?:__APP_BUILD_VERSION__|\d{14}|\$\{BUILD_VERSION\})/g, `$1?v=${version}`)
    ]
  },
  {
    file: 'app/build-meta.js',
    transforms: [
      (content) => content.replace(/version: '(?:__APP_BUILD_VERSION__|\d{14})'/, `version: '${version}'`),
      (content) => content.replace(/commit: '(?:__APP_BUILD_COMMIT__|[^']+)'/, `commit: '${commit}'`),
      (content) => content.replace(/deployedAt: '(?:__APP_BUILD_TIME__|[^']+)'/, `deployedAt: '${deployedAt}'`)
    ]
  }
];

for (const update of updates) {
  const filePath = path.join(root, update.file);
  let content = fs.readFileSync(filePath, 'utf8');
  for (const transform of update.transforms) {
    content = transform(content);
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

console.log(JSON.stringify({ version, commit, deployedAt }, null, 2));
