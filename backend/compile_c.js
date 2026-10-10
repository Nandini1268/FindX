const { execSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const isWin = os.platform() === 'win32';
const binName = isWin ? 'hash_search.exe' : 'hash_search';
const binPath = path.join(__dirname, 'c_engine', binName);
const srcPath = path.join(__dirname, 'c_engine', 'hash_search.c');

console.log(`🔨 Compiling C engine for OS: ${os.platform()} (${binName})...`);

try {
  execSync(`gcc -o "${binPath}" "${srcPath}" -Wall`, { stdio: 'inherit' });
  if (!isWin && fs.existsSync(binPath)) {
    fs.chmodSync(binPath, 0o755);
  }
  console.log(`✅ C Engine compiled successfully at ${binPath}`);
} catch (err) {
  console.error(`❌ C compilation error:`, err.message);
  process.exit(1);
}

// Rebuild sqlite3 from source on Linux/Render to guarantee GLIBC compatibility
if (!isWin) {
  try {
    console.log(`🔨 Rebuilding sqlite3 from source for GLIBC compatibility...`);
    execSync(`npm rebuild sqlite3 --build-from-source`, { stdio: 'inherit' });
    console.log(`✅ sqlite3 rebuilt successfully`);
  } catch (err) {
    console.warn(`⚠️ sqlite3 rebuild warning:`, err.message);
  }
}

