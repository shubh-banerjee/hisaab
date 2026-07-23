const { spawnSync } = require('child_process');

const scripts = [
  'scripts/rebuild-splash-implementation.js',
  'scripts/rebuild-home-screen.js',
  'scripts/rebuild-demo-flow.js',
  'scripts/polish-demo-lesson-shell.js',
  'scripts/finalize-demo-close-icon.js',
  'scripts/implement-small-test-flow.js',
  'scripts/inject-upload-runtime.js',
];

for (const script of scripts) {
  const result = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
