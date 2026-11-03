import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

async function renderDirectory(api) {
  const status={hidden:true,textContent:''},count={textContent:''},empty={hidden:false,textContent:''};
  const button={dataset:{onClick:'pickOpen'},events:{},setAttribute(){},addEventListener(name,callback){this.events[name]=callback;}};
  button.parentElement={querySelectorAll:()=>[button]};
  const document={body:{dataset:{exactDirectory:'bounties'}},documentElement:{hasAttribute:()=>false},
    querySelector(selector){if(selector==='[data-directory-status]')return status;if(selector==='[data-b-text="countLine"]')return count;if(selector==='[data-on-click="pickOpen"]')return button;return null;},
    querySelectorAll(selector){if(selector==='[data-on-click]')return [button];if(selector.includes('emptyShow'))return [empty];return [];}};
  const source=(await readFile(new URL('../public/assets/exact-directory.js',import.meta.url),'utf8'))
    .replace(/^import .*;\r?\n/gm,'').replace('start().catch(error=>notice(error.message));','globalThis.startPromise=start().catch(error=>notice(error.message));');
  const context={document,api,notice:()=>{},el:()=>({}),link:()=>({}),location:{hash:''},history:{replaceState(){}},window:{},URL,AbortController,setTimeout,clearTimeout};
  vm.createContext(context);vm.runInContext(source,context);await context.startPromise;
  return {status,count,empty,button};
}

test('a failed bounty feed stays unavailable after filters are used',async()=>{
  const view=await renderDirectory(async()=>{throw new Error('Data is unavailable. Try again later.');});
  view.button.events.click();
  assert.match(view.status.textContent,/bounty data is unavailable/i);
  assert.equal(view.count.textContent,'');
  assert.equal(view.empty.hidden,true);
});

test('a successful empty bounty feed still reports zero results',async()=>{
  const view=await renderDirectory(async()=>({items:[]}));
  view.button.events.click();
  assert.equal(view.count.textContent,'0 bounties shown.');
  assert.equal(view.empty.hidden,false);
});
