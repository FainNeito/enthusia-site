const labels = {
  live:'Live', connecting:'Connecting', reconnecting:'Reconnecting — showing saved market data',
  offline:'Offline — showing saved market data', unavailable:'Market data is temporarily unavailable.'
};
const status=document.querySelector('#market-connection-status');
const label=document.querySelector('#market-connection-label');
const updated=document.querySelector('#market-last-updated');
for(const button of document.querySelectorAll('[data-status]'))button.addEventListener('click',()=>{
  const state=button.dataset.status;
  status.className='market-connection-status '+state;
  label.textContent=labels[state];
  updated.textContent=state==='live'?' · Last updated just now':'';
  for(const peer of document.querySelectorAll('[data-status]'))peer.setAttribute('aria-pressed',String(peer===button));
});
