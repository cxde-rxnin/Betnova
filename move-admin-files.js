const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'app', '(app)', 'admin');
const dashboardDir = path.join(adminDir, '(dashboard)');

if (!fs.existsSync(dashboardDir)) {
  fs.mkdirSync(dashboardDir, { recursive: true });
}

const items = fs.readdirSync(adminDir);

items.forEach(item => {
  if (item === '(dashboard)' || item === 'login') return;
  const oldPath = path.join(adminDir, item);
  const newPath = path.join(dashboardDir, item);
  fs.renameSync(oldPath, newPath);
  console.log(`Moved ${item} to (dashboard)/${item}`);
});
console.log('Restructure complete.');
