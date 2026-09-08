// Tool to generate placeholder commands up to a target total.
// Usage: node tools/gen-commands.js <target>
const fs = require('fs');
const path = require('path');
const target = parseInt(process.argv[2] || '500', 10);
const dir = path.join(__dirname, '..', 'commands');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
const files = fs.readdirSync(dir).filter(f=>f.endsWith('.js'));
let start = 1;
const existingNames = files.map(f=>f.replace('.js',''));
// find next index
while(existingNames.includes(`cmd${start}`)) start++;
let count = files.length;
for (let i = start; count < target; i++){
  const name = `cmd${i}`;
  const content = `module.exports = { name: '${name}', aliases: [], description: 'Placeholder command ${name}', async handler({ from, args, sendText }){ await sendText(from, 'This is placeholder ${name}'); } };\n`;
  fs.writeFileSync(path.join(dir, `${name}.js`), content);
  count++;
  if (count % 50 === 0) console.log('Generated', count, 'commands');
}
console.log('Done. Total commands:', count);
