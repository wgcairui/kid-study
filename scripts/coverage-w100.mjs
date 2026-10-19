// 写字表 100 字 hanzi-writer 覆盖测试
// 用法: node scripts/coverage-w100.mjs
// 数据源: data/lessons/g1-up-w100.json
// 笔画库: js/lib/dataWriter.js + dataWriter1.js (合并 1248 字)

import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const ctx = { window: {} };
vm.createContext(ctx);

vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/lib/dataWriter.js'), 'utf8'), ctx);
const dw2 = fs.readFileSync(path.join(ROOT, 'js/lib/dataWriter1.js'), 'utf8');
const m = dw2.match(/window\.writerData1\s*=\s*(\{[\s\S]*\})/);
ctx.window.writerData1 = JSON.parse(m[1]);

const merged = Object.assign({}, ctx.window.writerData, ctx.window.writerData1);
console.log(`笔画库 (writerData + writerData1): ${Object.keys(merged).length} 字`);

const w100 = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/lessons/g1-up-w100.json'), 'utf8'));
const allChars = [];
for (const lesson of w100.lessons) {
  for (const item of lesson.items) {
    allChars.push({ w: item.w, lesson: lesson.id, title: lesson.title });
  }
}
const uniqueChars = [...new Set(allChars.map(x => x.w))];
const missing = uniqueChars.filter(c => !merged[c]);
const totalCount = allChars.length;
const uniqueCount = uniqueChars.length;

console.log('\n=== 写字表 100 字覆盖测试 ===');
console.log(`JSON 课程:    ${w100.lessons.length} 课`);
console.log(`总写字次数:   ${totalCount} (含重复)`);
console.log(`去重写字:     ${uniqueCount}`);
console.log(`已覆盖:       ${uniqueCount - missing.length}`);
console.log(`缺笔画数据:   ${missing.length}`);
console.log(`覆盖率:       ${((uniqueCount - missing.length) / uniqueCount * 100).toFixed(1)}%`);

if (missing.length) {
  console.log('\n缺笔画数据的字:');
  for (const c of missing) {
    const where = allChars.filter(x => x.w === c).map(x => x.lesson);
    console.log('  ' + c + '  →  ' + [...new Set(where)].join(', '));
  }
}

if (uniqueCount !== 100) {
  console.log(`\n⚠️ 写字表去重只有 ${uniqueCount} 字, 部编版 1 上 应该是 100 字, 还差 ${100 - uniqueCount} 字`);
  console.log('   请用 1 上教材逐字核对, 缺的字补到 g1-up-w100.json');
  process.exit(2);
}
