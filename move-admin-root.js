const fs = require('fs');
const path = require('path');

const oldAdminDir = path.join(__dirname, 'app', '(app)', 'admin');
const newAdminDir = path.join(__dirname, 'app', 'admin');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(oldAdminDir)) {
  copyRecursiveSync(oldAdminDir, newAdminDir);
  console.log('Copied admin to root');
  try {
    fs.rmSync(oldAdminDir, { recursive: true, force: true });
    console.log('Deleted old admin dir');
  } catch (e) {
    console.error('Could not delete old admin dir, user may need to stop dev server:', e.message);
  }
} else {
  console.log('Admin dir not found in (app)');
}
