export function webhookUrl(value){
  try{const url=new URL(value.trim());if(url.protocol!=='https:'||url.hostname!=='discord.com'||url.port||url.username||url.password||url.search||url.hash||!/^\/api\/webhooks\/\d{16,22}\/[A-Za-z0-9._-]+$/.test(url.pathname))return null;url.searchParams.set('wait','true');return url.href;}catch{return null;}
}
export function splitMessage(title,body){
  const text=`[WEBSITE TEST] ${title.trim()}\n\n${body.trim()}`;
  const parts=[];let part='';for(const character of text){if(part.length+character.length>1800){parts.push(part);part='';}part+=character;}if(part)parts.push(part);
  return parts.map((value,index)=>parts.length===1?value:`[Part ${index+1}/${parts.length}]\n${value}`);
}
export async function sendTest(url,messages,fetchImpl=fetch,onProgress=()=>{}){
  let confirmed=0;
  for(const content of messages){
    let response;
    for(let attempt=0;attempt<3;attempt++){
      try{response=await fetchImpl(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content,allowed_mentions:{parse:[]}}),redirect:'error',signal:AbortSignal.timeout(15000)});}catch{return {status:'uncertain',confirmed};}
      if(response.status!==429)break;
      const header=response.headers.get('retry-after');
      if(header===null||!header.trim())return {status:'rejected',confirmed};
      const delay=Number(header);
      if(!Number.isFinite(delay)||delay<0||delay>30||attempt===2)return {status:'rejected',confirmed};
      await new Promise(resolve=>setTimeout(resolve,Math.ceil(delay*1000)));
    }
    if(!response.ok)return {status:response.status>=400&&response.status<500?'rejected':'uncertain',confirmed};
    try{const result=await response.json();if(!/^\d{16,22}$/.test(result.id??''))return {status:'uncertain',confirmed};}catch{return {status:'uncertain',confirmed};}
    confirmed++;onProgress(confirmed,messages.length);
  }
  return {status:'sent',confirmed};
}
if(typeof document!=='undefined'){
  const get=id=>document.getElementById(id),hook=get('hook'),title=get('title'),body=get('body'),button=get('send'),status=get('status');
  const preview=()=>{get('preview-title').textContent=title.value||'Untitled test';get('preview-body').textContent=body.value||'Your announcement will appear here.';};
  title.addEventListener('input',preview);body.addEventListener('input',preview);
  button.addEventListener('click',async()=>{
    const url=webhookUrl(hook.value);if(!url){status.textContent='Enter a valid Discord webhook URL.';return;}
    if(!title.value.trim()||!body.value.trim()){status.textContent='Add a title and announcement before sending.';return;}
    const messages=splitMessage(title.value,body.value);button.disabled=true;status.textContent=`Sending ${messages.length} test message(s)…`;
    try{const result=await sendTest(url,messages,fetch,(count,total)=>{status.textContent=`Discord confirmed ${count} of ${total} message(s).`;});
      status.textContent=result.status==='sent'?`Delivered: Discord confirmed ${result.confirmed} test message(s).`:`${result.confirmed} of ${messages.length} confirmed. ${result.status==='rejected'?'Discord rejected the next part.':'Delivery of the next part is uncertain.'} Check the channel before retrying; previously sent parts would be duplicated.`;
    }finally{button.disabled=false;}
  });
}
