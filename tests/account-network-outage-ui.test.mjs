import assert from 'node:assert/strict';
import test from 'node:test';
import {renderExactAccount} from '../public/assets/exact-account.js';

// Exercise the real renderer using an isolated template double, not a live session.
test('account outage displays unavailable ownership and disables linking',()=>{
  const node=()=>({children:[],hidden:false,disabled:false,textContent:'',className:'',
    append(...children){this.children.push(...children);},replaceChildren(...children){this.children=children;},
    addEventListener(){},replaceWith(){},setAttribute(){},querySelector(){return null;},querySelectorAll(){return [];}});
  const list=node();list.firstElementChild=node();
  const links=node();links.querySelector=selector=>selector==='ul'?list:null;
  const link=node(),button=node(),description=node(),code=node(),command=node(),status=node();
  code.querySelector=selector=>selector==='.cmd'?command:status;
  link.querySelector=selector=>selector==='button'?button:selector==='.swap'?code:description;
  const claims=node(),bindings=node();bindings.querySelector=()=>null;
  const grid=node();grid.children=[links,link,claims,bindings];
  const head=node(),heading=node(),username=node(),logout=node();
  head.querySelector=selector=>selector==='h2'?heading:selector==='button'?logout:username;
  const out=node(),login=node();out.querySelector=()=>login;
  const fragment={querySelector:selector=>selector.includes('outShow')?out:selector==='.tip'?head:grid};
  const root=node();
  const originalDocument=globalThis.document,originalWindow=globalThis.window;
  globalThis.document={querySelector:()=>({content:{cloneNode:()=>fragment}}),createElement:node};
  globalThis.window={dispatchEvent(){}};
  try {
    renderExactAccount(root,{authenticated:true,discord:{username:'PreviewPlayer'},linkedMinecraftAccounts:[],networkAccounts:true,networkAccountsUnavailable:true},
      {signInHref:()=>'/login',signOut(){},startLink(){},punishmentClaimSection:()=>node()});
    assert.equal(button.disabled,true);
    assert.match(list.children[0].textContent,/temporarily unavailable/i);
    assert.match(description.textContent,/temporarily unavailable/i);
    assert.doesNotMatch(list.children[0].textContent,/no minecraft accounts/i);
  } finally {globalThis.document=originalDocument;globalThis.window=originalWindow;}
});
