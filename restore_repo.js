const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function readObject(hash) {
  const dir = hash.substring(0, 2);
  const file = hash.substring(2);
  const p = path.join('.git', 'objects', dir, file);
  if (!fs.existsSync(p)) return null;
  const compressed = fs.readFileSync(p);
  const buf = zlib.inflateSync(compressed);
  const nullIdx = buf.indexOf(0);
  const header = buf.slice(0, nullIdx).toString('utf8');
  const [type, size] = header.split(' ');
  const content = buf.slice(nullIdx + 1);
  return { type, size: parseInt(size, 10), content };
}

function parseTree(buf) {
  let idx = 0;
  const entries = [];
  while (idx < buf.length) {
    const spaceIdx = buf.indexOf(32, idx);
    const mode = buf.slice(idx, spaceIdx).toString('utf8');
    const nullIdx = buf.indexOf(0, spaceIdx);
    const name = buf.slice(spaceIdx + 1, nullIdx).toString('utf8');
    const sha = buf.slice(nullIdx + 1, nullIdx + 21).toString('hex');
    entries.push({ mode, name, sha });
    idx = nullIdx + 21;
  }
  return entries;
}

function extractTree(treeSha, targetDir) {
  const obj = readObject(treeSha);
  if (!obj || obj.type !== 'tree') return;
  const entries = parseTree(obj.content);
  for (const entry of entries) {
    const fullPath = path.join(targetDir, entry.name);
    if (entry.mode === '40000') {
      if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
      extractTree(entry.sha, fullPath);
    } else {
      const blobObj = readObject(entry.sha);
      if (blobObj) {
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, blobObj.content);
      }
    }
  }
}

console.log('Restoring workspace files from .git...');
extractTree('fb9541d6de5b83629b4dec79f625c00cbe5d0d29', '.');
console.log('Restoration complete!');
