import { renderMarkup } from './exact-markup.js';

export function webhookUrl(value){
  try{const url=new URL(value.trim());if(url.protocol!=='https:'||url.hostname!=='discord.com'||url.port||url.username||url.password||url.search||url.hash||!/^\/api\/webhooks\/\d{16,22}\/[A-Za-z0-9._-]+$/.test(url.pathname))return null;url.searchParams.set('wait','true');return url.href;}catch{return null;}
}
// Discord allows 4096 characters in an embed description. Longer text is
// attached in the same message rather than being silently truncated.
export function buildMessage(title,body,images=[],category='Announcement'){
  const name=title.trim(),text=body.trim();
  if(!name||name.length>160||!text||text.length>20000||!['Announcement','Changelog','Event'].includes(category))throw new Error('invalid_announcement');
  if(!Array.isArray(images)||images.length>9||images.some(image=>!image||!['image/png','image/jpeg'].includes(image.type)||image.size>8*1024*1024||image.size===0))throw new Error('invalid_images');
  const attached=text.length>4096,files=[];
  const embed={title:name,url:category==='Changelog'?'https://enthusia.info/changelog':'https://enthusia.info/news',description:attached?'The full announcement is attached as a text file.':text,color:0xb3201a,footer:{text:category}};
  if(attached)files.push({name:'announcement.txt',blob:new Blob([text],{type:'text/plain;charset=utf-8'})});
  const embeds=[embed];
  images.forEach((image,index)=>{const name=`image-${index+1}.${image.type==='image/png'?'png':'jpg'}`;files.push({name,blob:image});const target=index===0?embed:{image:{url:`attachment://${name}`}};if(index===0)target.image={url:`attachment://${name}`};else embeds.push(target);});
  return {payload:{content:'**[WEBSITE TEST]**',embeds,allowed_mentions:{parse:[]}},files,attached};
}
export async function sendTest(url,message,fetchImpl=fetch){
  let requestBody,headers;
  if(message.files.length){requestBody=new FormData();requestBody.append('payload_json',JSON.stringify(message.payload));message.files.forEach((file,index)=>requestBody.append(`files[${index}]`,file.blob,file.name));}
  else{requestBody=JSON.stringify(message.payload);headers={'Content-Type':'application/json'};}
  for(let attempt=0;attempt<3;attempt++){
    let response;
    try{response=await fetchImpl(url,{method:'POST',...(headers?{headers}:{}),body:requestBody,redirect:'error',signal:AbortSignal.timeout(15000)});}catch{return {status:'uncertain'};}
    if(response.status===429){const header=response.headers.get('retry-after');if(header===null||!header.trim())return {status:'rejected'};const delay=Number(header);if(!Number.isFinite(delay)||delay<0||delay>30||attempt===2)return {status:'rejected'};await new Promise(resolve=>setTimeout(resolve,Math.ceil(delay*1000)));continue;}
    if(!response.ok)return {status:response.status>=400&&response.status<500?'rejected':'uncertain'};
    try{const result=await response.json();return {status:/^\d{16,22}$/.test(result.id??'')?'sent':'uncertain'};}catch{return {status:'uncertain'};}
  }
  return {status:'rejected'};
}
if(typeof document!=='undefined'){
  const get=id=>document.getElementById(id),hook=get('hook'),title=get('title'),body=get('body'),button=get('send'),status=get('status'),cover=get('cover'),category=get('category');
  let imageUrls=[];
  const preview=()=>{get('preview-title').textContent=title.value||'Untitled test';get('preview-title').href=category.value==='Changelog'?'https://enthusia.info/changelog':'https://enthusia.info/news';renderMarkup(get('preview-body'),body.value||'Your announcement will appear here.');get('preview-category').textContent=category.value;get('format-status').textContent=body.value.length>4096?'Long announcement: sent as one message with a text attachment.':'Fits in one Discord embed.';};
  title.addEventListener('input',preview);body.addEventListener('input',preview);category.addEventListener('change',preview);
  cover.addEventListener('change',()=>{imageUrls.forEach(url=>URL.revokeObjectURL(url));imageUrls=[];const container=get('preview-images'),files=[...cover.files];container.replaceChildren();if(files.length>9||files.some(file=>!['image/png','image/jpeg'].includes(file.type)||file.size===0||file.size>8*1024*1024)){status.textContent='Choose up to 9 PNG or JPEG images, each no larger than 8 MB.';return;}for(const [index,file] of files.entries()){const image=document.createElement('img');imageUrls.push(URL.createObjectURL(file));image.src=imageUrls[index];image.alt=`Selected image ${index+1}`;image.className='cover-preview';container.append(image);}status.textContent=files.length?`${files.length} image(s) selected. Not sent yet.`:'Not sent.';});
  for(const control of document.querySelectorAll('[data-wrap]'))control.addEventListener('click',()=>{const token=control.dataset.wrap,start=body.selectionStart,end=body.selectionEnd;body.setRangeText(token+body.value.slice(start,end)+token,start,end,'select');body.focus();preview();});
  for(const control of document.querySelectorAll('[data-line]'))control.addEventListener('click',()=>{const at=body.value.lastIndexOf('\n',body.selectionStart-1)+1;body.setRangeText(control.dataset.line,at,at,'end');body.focus();preview();});
  button.addEventListener('click',async()=>{
    const url=webhookUrl(hook.value);if(!url){status.textContent='Enter a valid Discord webhook URL.';return;}
    let message;try{message=buildMessage(title.value,body.value,[...cover.files],category.value);}catch(error){status.textContent=error.message==='invalid_images'?'Choose up to 9 PNG or JPEG images, each no larger than 8 MB.':'Add a title and announcement before sending.';return;}
    button.disabled=true;status.textContent='Sending one test message…';
    try{const result=await sendTest(url,message);status.textContent=result.status==='sent'?'Delivered: Discord confirmed one test message.':result.status==='rejected'?'Discord rejected the message. Nothing was confirmed.':'Delivery is uncertain. Check the channel before retrying to avoid a duplicate.';}finally{button.disabled=false;}
  });
  preview();
}
