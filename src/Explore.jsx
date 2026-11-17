import { PHOTO } from './remainingPhotos.js';
import { useRef, useState } from 'react';
import { Glass, INK, MUTED } from './ui.jsx';
import { H } from './homeUpdateAssets.js';
import { Ph } from './phosphor.jsx';
import nora from './assets/people/nora.jpg';
import './explore.css';

export const POSTS = [
 {id:'foxy',photo:PHOTO.p0404,avatar:H.himgEllipse15,user:'maya.sav',text:'A slow morning at Fern & Fable',likes:128,height:321},
 {id:'dinner',photo:PHOTO.p0405,avatar:H.himgEllipse16,user:'eli.explores',text:'Low lighting and a tucked-away dinner table.',likes:76,height:241},
 {id:'sunny',photo:PHOTO.p0408,avatar:H.himgEllipse17,user:'jules.jpg',text:'A sunny seat for a slow morning.',likes:94,height:241},
 {id:'clay',photo:PHOTO.p0407,avatar:H.himgEllipse18,user:'nina.makes',text:'An afternoon of clay, color, and a little creative reset.',likes:53,height:240},
];
export function ExploreFeed({onOpen,liked,top=1662}) {
 return <section className="abs explore-feed" style={{left:24,top,width:396}}><h2 style={{fontSize:24,fontWeight:600,lineHeight:'28px',color:INK}}>Explore</h2><div style={{display:'flex',gap:16,marginTop:20}}>{[[POSTS[0],POSTS[1]],[POSTS[2],POSTS[3]]].map((col,i)=><div key={i} style={{display:'flex',flexDirection:'column',gap:16}}>{col.map(p=><button key={p.id} onClick={p.id==='foxy'?onOpen:undefined} className="explore-feed-card ef-outline" style={{cursor:p.id==='foxy'?'pointer':'default'}}>
  <img src={p.photo} alt="" className="ef-photo"/>
  <span className="ef-copy"><span className="ef-text" style={p.id==='sunny'?{color:'#15171f'}:undefined}>{p.text}</span>
   <span className="ef-meta"><img src={p.avatar} alt="" width="13" height="13"/><span>{p.user}</span><Ph n="heart" size={13} fill="#5e5a7e" style={{marginLeft:'auto'}}/><span>{p.likes+(p.id==='foxy'&&liked?1:0)}</span></span></span>
 </button>)}</div>)}</div></section>;
}
const Pic=({src,size=22,...props})=><img src={src} alt="" width={size} height={size} {...props}/>;
export default function ExplorePost({onBack,onOpenVenue,liked,setLiked,saved,setSaved,follow,setFollow,replies,setReplies}) {
 const [reply,setReply]=useState(''); const input=useRef(null);
 const send=e=>{e.preventDefault();if(reply.trim()){setReplies(v=>[...v,reply.trim()]);setReply('');}};
 const Dot=({src})=>src?<img src={src} alt="" className="ep-dot" style={{objectFit:'cover'}}/>:<span className="ep-dot"/>;
 return <div className="abs explore-post" style={{inset:0,background:'#f7f5f1',zIndex:41}}><div className="scroll hide-sb"><main>
 <nav><button aria-label="Back to Explore" onClick={onBack}><Pic src={H.pimgBackToExplore} size={24}/></button><h1>Explore</h1></nav>
 <article className="ep-card"><div className="ep-author"><Dot src={H.himgEllipse15}/><div><strong>maya.sav</strong><p>Savannah, GA · 1h ago</p></div></div>
 <img src={PHOTO.p0404} alt="" className="ep-photo"/>
 <h2>A slow morning at Fern &amp; Fable</h2>
 <p className="ep-body">I took my coffee to the bench by the glass-block wall. The daylight was soft there, and we could talk without raising our voices.</p>
 <div className="ep-tags">{['Sound · Easy to talk','Light · Natural','Seating · Bench'].map(t=><span key={t}>{t}</span>)}</div>
 <div className="ep-actions"><button aria-label="Like post" aria-pressed={liked} onClick={()=>setLiked(!liked)}><Ph n={liked?'heart-fill':'heart'} size={18} fill="#5e5a7e"/><span>{128+(liked?1:0)}</span></button><button aria-label="Comments" onClick={()=>input.current?.focus()}><Pic src={H.pimgComments} size={18}/><span>{12+replies.length}</span></button><button aria-label="Share" onClick={()=>{if(navigator.share)navigator.share({title:'A slow morning at Fern & Fable',url:location.href}).catch(()=>{});}}><Ph n="export" size={18} fill="#5e5a7e"/><span>Share</span></button></div></article>
 <hr/><section className="explore-place"><button onClick={onOpenVenue} className="explore-place-card ep-place"><img src={PHOTO.p0602} alt="" style={{width:392,height:176,objectFit:'cover'}}/><div><h2>Fern &amp; Fable</h2><p>Level 2 · 0.5 mi · Updated 1h ago</p><p>Soft daylight · Bench seating</p><span>View place <Pic src={H.pimgViewPlaceArrow} size={18}/></span></div></button></section>
 <hr/><section className="explore-replies"><header><h2>Replies · {12+replies.length}</h2><span>Most relevant</span></header><div className="explore-reply"><Dot src={H.himgEllipse17}/><div><strong>jules.jpg</strong><p>Is that bench right by the glass blocks?</p><small>28m　 Reply　 ♡ 8</small><div className="explore-reply" style={{marginTop:5}}><Dot src={H.himgEllipse15}/><div><strong>maya.sav · Author</strong><p>Yes! The light was soft there when I went, and we could chat easily.</p><small>20m　 Reply　 ♡ 3</small></div></div></div></div><div className="explore-reply"><Dot src={H.himgEllipse16}/><div><strong>eli.explores</strong><p>Saving this for a coffee catch-up. That bench looks like a good spot.</p><small>15m　 Reply　 ♡ 4</small></div></div>{replies.map((r,i)=><div key={i} className="explore-reply"><Pic src={nora} size={32} style={{borderRadius:16,objectFit:'cover'}}/><p>{r}</p></div>)}<p className="explore-all-replies">View all {12+replies.length} replies</p></section><hr/>
 <form onSubmit={send} className="explore-reply-form"><Pic src={nora} size={32} style={{borderRadius:16,objectFit:'cover'}}/><div><input ref={input} aria-label="Add a reply" placeholder="Add a reply…" value={reply} onChange={e=>setReply(e.target.value)}/><button type="submit" aria-label="Send reply"><Pic src={H.pimgSendReply} size={18}/></button></div></form>
 </main></div></div>;
}
