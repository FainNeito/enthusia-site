// This test sends a single summary and optional cover. It never publishes an article.
export function buildSummaryTest(title, summary, cover) {
  const name=title.trim(), text=summary.trim();
  if(!name||name.length>160||!text||text.length>1000)throw new Error('invalid_summary');
  if(cover&&(!['image/png','image/jpeg'].includes(cover.type)||!cover.size||cover.size>8*1024*1024))
    throw new Error('invalid_cover');
  const embed={author:{name:'✦ ENTHUSIA SMP · ANNOUNCEMENT'},title:name,url:'https://enthusia.info/news',
    description:text+'\n\n[Visit Enthusia News](https://enthusia.info/news)',color:0xb3201a,
    footer:{text:'Website announcement test · No article published'}};
  const files=[];
  if(cover){const filename=cover.type==='image/png'?'cover.png':'cover.jpg';
    embed.image={url:'attachment://'+filename};files.push({name:filename,blob:cover});}
  return {payload:{content:'**[WEBSITE TEST]**',embeds:[embed],allowed_mentions:{parse:[]}},files};
}
