import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

async function pages(dir) {
  const entries=await readdir(dir,{withFileTypes:true}),found=[];
  for(const entry of entries){if(entry.name==='preview')continue;const name=path.join(dir,entry.name);if(entry.isDirectory())found.push(...await pages(name));else if(entry.name.endsWith('.html'))found.push(name);}
  return found;
}
test('every public page declares the shared tab and home-screen icons',async()=>{
  const files=await pages('public');assert.ok(files.length>20);
  for(const file of files){const html=await readFile(file,'utf8');for(const asset of ['/favicon.ico','/favicon.png','/apple-touch-icon.png'])assert.ok(html.includes(`href="${asset}"`),`${file} is missing ${asset}`);}
});
test('favicon assets are valid sized PNG and multi-size ICO files',async()=>{
  for(const [file,size] of [['public/favicon.png',192],['public/apple-touch-icon.png',180]]){const png=await readFile(file);assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);}
  const ico=await readFile('public/favicon.ico');assert.equal(ico.readUInt16LE(2),1);assert.ok(ico.readUInt16LE(4)>=3);
});
