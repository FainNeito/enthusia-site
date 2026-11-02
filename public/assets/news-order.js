export function orderNewsPosts(posts,order='newest') {
  const direction=order==='oldest'?1:-1;
  return posts.map((post,index)=>({post,index,time:typeof post.date==='string'?Date.parse(post.date):NaN}))
    .sort((a,b)=>{
      const aValid=Number.isFinite(a.time),bValid=Number.isFinite(b.time);
      if(aValid!==bValid)return aValid?-1:1;
      return aValid?(a.time-b.time)*direction||a.index-b.index:a.index-b.index;
    }).map(entry=>entry.post);
}
