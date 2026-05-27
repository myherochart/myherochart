import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════
// DESIGN SYSTEM — Premium Slate-Blue Dark Theme
// ═══════════════════════════════════════════════════════════
const C = {
  bg: "#2c3152", bgDeep: "#272c49", bgTop: "#39406a",
  surface: "#3a4167", surface2: "#46507a", surface3: "#53608d",
  border: "rgba(255,255,255,0.08)", border2: "rgba(255,255,255,0.14)",
  amber: "#f1c46a", amberDim: "#c9962c", amberGlow: "rgba(241,196,106,0.14)",
  teal: "#60d2c8", tealDim: "#319d95", tealGlow: "rgba(96,210,200,0.12)",
  green: "#69cf8d", greenDim: "#3b9660", greenGlow: "rgba(105,207,141,0.12)",
  purple: "#ae8bf0", purpleDim: "#7653cb", purpleGlow: "rgba(174,139,240,0.12)",
  red: "#ea8a8a", redDim: "#b84f4f",
  text: "#f7f8fd", text2: "#b4bbd3", text3: "#7d86a7",
  shadow: "0 10px 36px rgba(15,20,40,0.18)", shadowSm: "0 4px 18px rgba(15,20,40,0.14)",
  r: "16px", rSm: "10px",
};

const G = "'DM Sans', 'Space Grotesk', sans-serif";
const B = "'Nunito', sans-serif";

const ZONES = [
  {id:5,name:"SUPER HERO",color:"#60d2c8",emoji:"⚡",desc:"Going above & beyond!",pts:5},
  {id:4,name:"HERO",color:"#69cf8d",emoji:"🦸",desc:"Making great choices!",pts:4},
  {id:3,name:"IN TRAINING",color:"#f1c46a",emoji:"🛡️",desc:"Learning & growing!",pts:3},
  {id:2,name:"RESET",color:"#ea8a8a",emoji:"🔄",desc:"Time to reset!",pts:2},
  {id:1,name:"REBUILD",color:"#ae8bf0",emoji:"🔧",desc:"We rebuild together!",pts:1},
];

const PERIODS_SCHOOL = ["Morning Circle","Block 1","Block 2","Lunch","Block 3","Block 4","Dismissal"];
const PERIODS_HOME   = ["Wake Up","Breakfast","Chores","Homework","Free Time","Dinner","Bedtime"];

const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.r,
    marginBottom: "20px", padding: "22px", boxShadow: C.shadowSm,
    backdropFilter: "blur(6px)", transition: "all 0.2s ease", ...style
  }}>{children}</div>
);

const Btn = ({ children, onClick, variant = "default", style = {}, disabled }) => {
  const variants = {
    default: { background: C.surface2, color: C.text2, border: `1px solid ${C.border2}` },
    emerald: { background: C.greenGlow, color: C.green, border: "1px solid rgba(82,196,122,0.3)" },
    go: { background: C.amberGlow, color: C.amber, border: "1px solid rgba(232,184,75,0.3)" },
    primary: { background: C.green, color: "#0a2015", border: "none" },
    amber: { background: C.amber, color: "#1a0800", border: "none" },
  };
  const v = variants[variant] || variants.default;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      fontFamily: B, fontSize: "13px", fontWeight: 700, padding: "8px 14px",
      cursor: disabled ? "not-allowed" : "pointer", borderRadius: C.rSm,
      whiteSpace: "nowrap", transition: "all 0.15s ease",
      opacity: disabled ? 0.5 : 1, ...v, ...style
    }}>{children}</button>
  );
};

const SectionLabel = ({ children }) => (
  <div style={{
    fontFamily: G, fontSize: "11px", fontWeight: 600, color: C.text3,
    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px"
  }}>{children}</div>
);

const H1 = ({ children, style = {} }) => (
  <div style={{
    fontFamily: G, fontSize: "18px", fontWeight: 700, color: C.amber,
    textAlign: "center", marginBottom: "6px", letterSpacing: "-0.5px", ...style
  }}>{children}</div>
);

const H2 = ({ children, style = {} }) => (
  <div style={{
    fontFamily: G, fontSize: "14px", fontWeight: 700, color: C.amber,
    marginBottom: "12px", letterSpacing: "-0.3px", ...style
  }}>{children}</div>
);

// ═══════════════════════════════════════════════════════════

// ── Shared gem emoji map (used in Rewards + elsewhere) ────
const GEMEI={diamond:"💎",emerald:"💚",gold:"⭐"};
// Gem earn rules per zone (shown in chart)
const ZONE_GEMS={5:{gold:5,emerald:1,diamond:1},4:{gold:4,emerald:1},3:{gold:3},2:{gold:2},1:{gold:1}};
// Unlock thresholds
const DASH_NEED=5;   // 💚 emeralds ever earned
const RUN_NEED=3;    // 💎 diamonds ever earned


// ═══════════════════════════════════════════════════════════
// HERO DASH — 3-Level Pac-Man game
// ═══════════════════════════════════════════════════════════
const DCOLS=15, DROWS=13;

const DASH_WALLS = [
  [ // Lv1 — Open Maze
    [2,2],[2,3],[2,6],[2,7],[2,8],[2,11],[2,12],
    [4,2],[4,3],[4,4],[4,7],[4,10],[4,11],[4,12],
    [6,2],[6,3],[6,6],[6,7],[6,8],[6,11],[6,12],
    [8,2],[8,3],[8,4],[8,7],[8,10],[8,11],[8,12],
    [10,2],[10,3],[10,6],[10,7],[10,8],[10,11],[10,12],
  ],
  [ // Lv2 — Tight Corridors
    [2,2],[2,3],[2,5],[2,6],[2,8],[2,9],[2,11],[2,12],
    [3,3],[3,11],
    [4,2],[4,3],[4,4],[4,6],[4,8],[4,10],[4,11],[4,12],
    [5,4],[5,10],
    [6,2],[6,3],[6,5],[6,7],[6,9],[6,11],[6,12],
    [7,4],[7,10],
    [8,2],[8,3],[8,4],[8,6],[8,8],[8,10],[8,11],[8,12],
    [9,3],[9,11],
    [10,2],[10,3],[10,5],[10,6],[10,8],[10,9],[10,11],[10,12],
  ],
  [ // Lv3 — Dense Maze
    [2,2],[2,3],[2,4],[2,5],[2,9],[2,10],[2,11],[2,12],
    [3,2],[3,4],[3,6],[3,8],[3,10],[3,12],
    [4,2],[4,3],[4,5],[4,9],[4,11],[4,12],
    [5,3],[5,4],[5,5],[5,9],[5,10],[5,11],
    [6,2],[6,3],[6,4],[6,6],[6,7],[6,8],[6,10],[6,11],[6,12],
    [7,3],[7,4],[7,5],[7,9],[7,10],[7,11],
    [8,2],[8,3],[8,5],[8,9],[8,11],[8,12],
    [9,2],[9,4],[9,6],[9,8],[9,10],[9,12],
    [10,2],[10,3],[10,4],[10,5],[10,9],[10,10],[10,11],[10,12],
  ],
];

const DASH_CFG = [
  {speed:680,chase:0.42,d:1,e:2,title:'Level 1',sub:'Open Maze'},
  {speed:490,chase:0.56,d:2,e:2,title:'Level 2',sub:'Tight Corridors'},
  {speed:360,chase:0.70,d:3,e:3,title:'Level 3',sub:'Dense Maze'},
];

function buildWS(interior){
  const ws=new Set();
  for(let r=0;r<DROWS;r++){ws.add(`${r},0`);ws.add(`${r},${DCOLS-1}`);}
  for(let c=0;c<DCOLS;c++){ws.add(`0,${c}`);ws.add(`${DROWS-1},${c}`);}
  interior.forEach(([r,c])=>ws.add(`${r},${c}`));
  return ws;
}
function buildGrid(ws){
  return Array.from({length:DROWS},(_,r)=>
    Array.from({length:DCOLS},(_,c)=>{
      if(ws.has(`${r},${c}`)) return 1;
      if(r===6&&c===7) return 0;
      if(r===2&&c===13) return 0;
      return Math.random()<0.07?3:2;
    })
  );
}
const countGems=g=>g.flat().filter(v=>v===2||v===3).length;

function HeroDashGame({addGems,onClose}){
  const [level,setLevel]=useState(0);
  const [grid,setGrid]=useState(()=>buildGrid(buildWS(DASH_WALLS[0])));
  const [player,setPlayer]=useState({r:6,c:7});
  const [villain,setVillain]=useState({r:2,c:13});
  const [score,setScore]=useState(0);
  const [phase,setPhase]=useState('idle');
  const totalRef=useRef(countGems(grid));
  const wsRef=useRef(buildWS(DASH_WALLS[0]));
  const sRef=useRef({grid,player,villain,phase,score,level});
  useEffect(()=>{sRef.current={grid,player,villain,phase,score,level};},[grid,player,villain,phase,score,level]);

  const iw=useCallback((r,c)=>r<0||r>=DROWS||c<0||c>=DCOLS||wsRef.current.has(`${r},${c}`),[]);

  const loadLevel=useCallback((lvl)=>{
    const ws=buildWS(DASH_WALLS[lvl]);
    wsRef.current=ws;
    const ng=buildGrid(ws);
    totalRef.current=countGems(ng);
    setLevel(lvl);setGrid(ng);setPlayer({r:6,c:7});setVillain({r:2,c:13});setScore(0);setPhase('playing');
  },[]);

  const move=useCallback((dr,dc)=>{
    const s=sRef.current;
    if(s.phase!=='playing') return;
    const{grid:g,player:p,villain:v,score:sc,level:lvl}=s;
    const nr=p.r+dr,nc=p.c+dc;
    if(iw(nr,nc)) return;
    const ng=g.map(row=>[...row]);
    let pts=0;
    if(ng[nr][nc]===2){pts=10;ng[nr][nc]=0;}
    else if(ng[nr][nc]===3){pts=50;ng[nr][nc]=0;}
    setGrid(ng);setPlayer({r:nr,c:nc});
    if(pts>0) setScore(sc+pts);
    if(nr===v.r&&nc===v.c){setPhase('lost');return;}
    if(countGems(ng)===0){
      const cfg=DASH_CFG[lvl];
      addGems('diamond',cfg.d);addGems('emerald',cfg.e);
      setPhase(lvl<DASH_WALLS.length-1?'levelDone':'allDone');
    }
  },[addGems,iw]);

  useEffect(()=>{
    if(phase!=='playing') return;
    const cfg=DASH_CFG[level];
    const iv=setInterval(()=>{
      const s=sRef.current;
      if(s.phase!=='playing') return;
      const{villain:v,player:p}=s;
      const dirs=[[-1,0],[1,0],[0,-1],[0,1]];
      const valid=dirs.filter(([dr,dc])=>!iw(v.r+dr,v.c+dc));
      if(!valid.length) return;
      let dir=valid[Math.floor(Math.random()*valid.length)];
      if(Math.random()<cfg.chase){
        dir=valid.reduce((b,d)=>
          (Math.abs(v.r+d[0]-p.r)+Math.abs(v.c+d[1]-p.c))<
          (Math.abs(v.r+b[0]-p.r)+Math.abs(v.c+b[1]-p.c))?d:b
        ,valid[0]);
      }
      const nv={r:v.r+dir[0],c:v.c+dir[1]};
      setVillain(nv);
      if(nv.r===sRef.current.player.r&&nv.c===sRef.current.player.c) setPhase('lost');
    },cfg.speed);
    return()=>clearInterval(iv);
  },[phase,level,iw]);

  useEffect(()=>{
    const h=e=>{
      const m={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1],
               w:[-1,0],s:[1,0],a:[0,-1],d:[0,1]};
      if(m[e.key]){e.preventDefault();move(...m[e.key]);}
    };
    window.addEventListener('keydown',h);
    return()=>window.removeEventListener('keydown',h);
  },[move]);

  const cfg=DASH_CFG[Math.min(level,2)];
  const collected=totalRef.current-countGems(grid);
  const CELL=22;

  const dBtn=(label,dr,dc)=>(
    <button onClick={()=>move(dr,dc)} style={{
      width:52,height:52,background:phase==='playing'?C.surface2:'rgba(255,255,255,0.04)',
      border:`1px solid ${phase==='playing'?C.border2:C.border}`,borderRadius:C.rSm,
      fontSize:22,cursor:phase==='playing'?'pointer':'default',
      color:phase==='playing'?C.amber:C.text3,
      display:'flex',alignItems:'center',justifyContent:'center',
    }}>{label}</button>
  );

  const Overlay=({emoji,title,sub,btnLabel,btnColor,btnAction})=>(
    <div style={{
      position:'absolute',inset:0,background:'rgba(8,12,28,0.9)',
      borderRadius:12,display:'flex',flexDirection:'column',
      alignItems:'center',justifyContent:'center',gap:8,zIndex:10,
    }}>
      <div style={{fontSize:32}}>{emoji}</div>
      <div style={{fontFamily:G,fontSize:19,fontWeight:700,color:btnColor,letterSpacing:'-0.3px',textAlign:'center',padding:'0 16px'}}>{title}</div>
      {sub&&<div style={{fontFamily:B,fontSize:12,color:C.text3,fontWeight:600,textAlign:'center'}}>{sub}</div>}
      <button onClick={btnAction} style={{
        background:btnColor,border:'none',borderRadius:C.r,padding:'9px 26px',
        fontFamily:G,fontSize:14,fontWeight:700,color:'#1a0800',cursor:'pointer',marginTop:4,
      }}>{btnLabel}</button>
    </div>
  );

  return(
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:2000,display:'flex',flexDirection:'column',fontFamily:B}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',background:C.surface,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{fontFamily:G,fontSize:'13px',fontWeight:700,color:C.amber}}>{cfg.title} · {cfg.sub}</div>
          <span style={{fontFamily:G,fontSize:'12px',fontWeight:700,color:C.teal}}>💎 {collected}/{totalRef.current}</span>
          <span style={{fontFamily:G,fontSize:'12px',fontWeight:700,color:C.amber}}>⭐ {score}</span>
          <span style={{fontFamily:G,fontSize:'12px',fontWeight:700,color:C.green}}>Lvl {level+1}/3</span>
        </div>
        <button onClick={onClose} style={{background:C.surface2,border:`1px solid ${C.border2}`,color:C.text2,padding:'6px 14px',borderRadius:C.rSm,fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:B}}>Close</button>
      </div>

      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,padding:12,overflow:'hidden'}}>
        <div style={{position:'relative'}}>
          <div style={{display:'inline-grid',gridTemplateColumns:`repeat(${DCOLS},${CELL}px)`,gap:1,background:'#1a1f3a',padding:3,borderRadius:12,border:`1px solid ${C.border}`}}>
            {grid.map((row,r)=>row.map((cell,c)=>{
              const isP=player.r===r&&player.c===c;
              const isV=villain.r===r&&villain.c===c;
              return(
                <div key={`${r}-${c}`} style={{width:CELL,height:CELL,background:cell===1?'#0D1B4E':'#050D20',borderRadius:2,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {isP?'🦸':isV?'👹':cell===2?<span style={{color:C.amber,fontWeight:900,fontSize:14}}>·</span>:cell===3?'⭐':''}
                </div>
              );
            }))}
          </div>
          {phase==='idle'&&<Overlay emoji="🏃" title="HERO DASH — 3 Levels!" sub="Collect all gems! Avoid the villain!" btnLabel="▶ Start Level 1" btnColor={C.amber} btnAction={()=>loadLevel(0)}/>}
          {phase==='levelDone'&&<Overlay emoji="✅" title={`${cfg.title} Complete!`} sub={`+${cfg.d}💎 +${cfg.e}💚 banked!`} btnLabel={`▶ Level ${level+2}`} btnColor={C.green} btnAction={()=>loadLevel(level+1)}/>}
          {phase==='allDone'&&<Overlay emoji="🏆" title="All 3 Levels Done!" sub="You're the ultimate Hero! Gems banked!" btnLabel="🔄 Play Again" btnColor={C.amber} btnAction={()=>loadLevel(0)}/>}
          {phase==='lost'&&<Overlay emoji="💀" title="Try Again!" sub={`Retry ${cfg.title}?`} btnLabel="🔄 Retry" btnColor={C.red} btnAction={()=>loadLevel(level)}/>}
        </div>

        {phase==='playing'&&(
          <button onClick={()=>loadLevel(level)} style={{background:'transparent',border:`1px dashed ${C.border}`,borderRadius:C.rSm,padding:'5px 14px',fontFamily:G,fontSize:'12px',fontWeight:700,color:C.text3,cursor:'pointer'}}>🔄 Restart Level</button>
        )}

        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
          <div>{dBtn('⬆',-1,0)}</div>
          <div style={{display:'flex',gap:4}}>{dBtn('⬅',0,-1)}<div style={{width:52,height:52}}/>{dBtn('➡',0,1)}</div>
          <div>{dBtn('⬇',1,0)}</div>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// HERO RUNNER — 10-Level Mario Platformer
// ═══════════════════════════════════════════════════════════
const RW=380, RH=260;
const GRAV=0.50, JV=-11.2, PSPD=3.5, PW=20, PH=28, ENW=22, ENH=20;
// Max jump height ≈ 126px. Max horizontal jump distance ≈ 156px at full speed.

// ── Themes ─────────────────────────────────────────────────
const TH = {
  day:    {sky:['#5b9bd5','#92ccf0'],hill:'rgba(68,112,48,0.6)',grass:'#3d8c30',rail:'#f1c46a',dark:false},
  cave:   {sky:['#141420','#141420'],hill:null,               grass:'#5a3a20',rail:'#c9962c',dark:true},
  dusk:   {sky:['#e05a10','#f5a030'],hill:'rgba(110,70,30,0.6)',grass:'#7a5530',rail:'#ae8bf0',dark:false},
  night:  {sky:['#070720','#141438'],hill:'rgba(18,18,55,0.8)',grass:'#223a1e',rail:'#ae8bf0',dark:false},
  castle: {sky:['#180808','#320808'],hill:'rgba(55,8,8,0.8)', grass:'#3a1818',rail:'#ea8a8a',dark:false},
  sky:    {sky:['#7ecef5','#b8e8f8'],hill:'rgba(180,220,255,0.5)',grass:'#5aa445',rail:'#60d2c8',dark:false},
};

// ── 10 Levels ──────────────────────────────────────────────
// gsegs: [[x0,x1]] — ground at y=238. Gaps between = death pits.
// pipes: [{x,yt}]  — pipe cap top y, body to ground.
// cpipes:[{x,yb}]  — ceiling pipe, hangs to yb.
// qbs:  [{x,y}]   — question blocks 24×24. Hit from below = gem.
// plats: [[x,y,w,h]]
// mplats:[{id,wx,y,w,vx,x0,x1}]
// enems: [{id,wx,wy,vx,x0,x1}]
// gems:  [{id,wx,wy,t}]  t='gold'|'emerald'|'diamond'
// ceiling: y (optional, for cave levels)

const RUNNER_LEVELS = [
 {// ── LV1: Mushroom Plains ──────────────────────────────────
  title:'World 1-1', sub:'Mushroom Plains', theme:TH.day,
  worldW:3200, flagX:3085, reward:{d:1,e:1,g:3},
  gsegs:[[0,940],[1100,2680],[2860,3200]],
  pipes:[{x:370,yt:182},{x:640,yt:165},{x:1320,yt:175},{x:1960,yt:160},{x:2390,yt:175}],
  cpipes:[],
  qbs:[{x:285,y:168},{x:323,y:168},{x:361,y:168},{x:323,y:132},{x:615,y:162},{x:1140,y:165}],
  plats:[[955,180,80,12],[1060,180,80,12],[1520,170,90,12],[2080,180,80,12],[2700,165,90,12],[2890,142,80,12]],
  mplats:[{id:'a0',wx:948,y:170,w:100,vx:1.8,x0:940,x1:1052}],
  enems:[
   {id:0,wx:200,wy:216,vx:-1.0,x0:80,x1:355},{id:1,wx:555,wy:216,vx:1.0,x0:380,x1:630},
   {id:2,wx:1250,wy:216,vx:-1.2,x0:1110,x1:1310},{id:3,wx:1700,wy:216,vx:1.2,x0:1540,x1:1950},
   {id:4,wx:2180,wy:216,vx:-1.0,x0:1970,x1:2380},{id:5,wx:2760,wy:216,vx:1.0,x0:2870,x1:3075},
  ],
  gems:[
   {id:0,wx:110,wy:218,t:'gold'},{id:1,wx:220,wy:218,t:'gold'},{id:2,wx:440,wy:218,t:'gold'},
   {id:3,wx:970,wy:158,t:'gold'},{id:4,wx:1070,wy:158,t:'gold'},{id:5,wx:1560,wy:150,t:'emerald'},
   {id:6,wx:1380,wy:218,t:'gold'},{id:7,wx:1700,wy:218,t:'gold'},{id:8,wx:2120,wy:160,t:'gold'},
   {id:9,wx:2200,wy:218,t:'emerald'},{id:10,wx:2500,wy:218,t:'gold'},{id:11,wx:2730,wy:145,t:'emerald'},
   {id:12,wx:2910,wy:122,t:'diamond'},{id:13,wx:3050,wy:218,t:'gold'},
  ],
 },
 {// ── LV2: Pipe Valley ──────────────────────────────────────
  title:'World 1-2', sub:'Pipe Valley', theme:TH.day,
  worldW:3500, flagX:3380, reward:{d:1,e:2,g:2},
  gsegs:[[0,700],[870,1550],[1740,2450],[2640,3500]],
  pipes:[{x:350,yt:175},{x:500,yt:158},{x:608,yt:140},{x:1050,yt:168},{x:1260,yt:152},{x:1380,yt:138},{x:1870,yt:165},{x:2080,yt:148},{x:2700,yt:158},{x:2920,yt:142},{x:3100,yt:165}],
  cpipes:[],
  qbs:[{x:200,y:162},{x:580,y:155},{x:1100,y:158},{x:1900,y:162},{x:2750,y:158},{x:3150,y:162}],
  plats:[[710,178,100,12],[820,178,100,12],[1560,175,100,12],[1660,175,100,12],[2460,172,100,12],[2560,172,100,12],[3200,165,100,12]],
  mplats:[{id:'b0',wx:715,y:168,w:90,vx:2.0,x0:708,x1:818},{id:'b1',wx:1560,y:165,w:90,vx:2.0,x0:1552,x1:1652}],
  enems:[
   {id:0,wx:180,wy:216,vx:-1.2,x0:80,x1:340},{id:1,wx:1050,wy:216,vx:1.2,x0:880,x1:1260},
   {id:2,wx:1350,wy:216,vx:-1.2,x0:1270,x1:1550},{id:3,wx:1900,wy:216,vx:1.3,x0:1750,x1:2080},
   {id:4,wx:2200,wy:216,vx:-1.3,x0:2090,x1:2450},{id:5,wx:2750,wy:216,vx:1.3,x0:2650,x1:2910},
   {id:6,wx:3000,wy:216,vx:-1.2,x0:2930,x1:3100},{id:7,wx:3250,wy:216,vx:1.2,x0:3110,x1:3370},
  ],
  gems:[
   {id:0,wx:150,wy:218,t:'gold'},{id:1,wx:420,wy:218,t:'gold'},{id:2,wx:740,wy:158,t:'gold'},
   {id:3,wx:830,wy:158,t:'gold'},{id:4,wx:1100,wy:218,t:'emerald'},{id:5,wx:1200,wy:218,t:'gold'},
   {id:6,wx:1590,wy:155,t:'gold'},{id:7,wx:1670,wy:155,t:'gold'},{id:8,wx:1950,wy:218,t:'emerald'},
   {id:9,wx:2150,wy:218,t:'gold'},{id:10,wx:2490,wy:152,t:'emerald'},{id:11,wx:2580,wy:152,t:'gold'},
   {id:12,wx:2800,wy:218,t:'gold'},{id:13,wx:3050,wy:218,t:'emerald'},{id:14,wx:3230,wy:145,t:'diamond'},
   {id:15,wx:3340,wy:218,t:'gold'},
  ],
 },
 {// ── LV3: Platform Run ─────────────────────────────────────
  title:'World 1-3', sub:'Platform Run', theme:TH.sky,
  worldW:3800, flagX:3680, reward:{d:2,e:1,g:2},
  gsegs:[[0,500],[750,1150],[1420,1820],[2100,2500],[2780,3800]],
  pipes:[{x:280,yt:178},{x:600,yt:162},{x:1200,yt:172},{x:1650,yt:158},{x:2320,yt:168},{x:2620,yt:155}],
  cpipes:[],
  qbs:[{x:160,y:162},{x:850,y:155},{x:1500,y:158},{x:2200,y:162},{x:2850,y:155},{x:3100,y:148}],
  plats:[
   [510,178,90,12],[640,178,90,12],[1160,175,90,12],[1280,160,80,12],
   [1830,172,80,12],[1950,155,80,12],[2510,168,80,12],[2640,150,80,12],
   [3200,162,100,12],[3350,145,80,12],[3520,160,90,12],
  ],
  mplats:[
   {id:'c0',wx:510,y:168,w:90,vx:2.0,x0:502,x1:638},{id:'c1',wx:1155,y:165,w:90,vx:2.2,x0:1148,x1:1278},
   {id:'c2',wx:1825,y:162,w:90,vx:2.2,x0:1818,x1:1948},{id:'c3',wx:2505,y:158,w:90,vx:2.4,x0:2498,x1:2638},
  ],
  enems:[
   {id:0,wx:200,wy:216,vx:-1.2,x0:60,x1:490},{id:1,wx:540,wy:156,vx:1.2,x0:512,x1:628},
   {id:2,wx:900,wy:216,vx:-1.2,x0:760,x1:1145},{id:3,wx:1200,wy:216,vx:1.3,x0:1430,x1:1812},
   {id:4,wx:1870,wy:133,vx:-1.3,x0:1832,x1:1948},{id:5,wx:2280,wy:216,vx:1.3,x0:2110,x1:2490},
   {id:6,wx:2600,wy:216,vx:-1.3,x0:2510,x1:2770},{id:7,wx:2900,wy:216,vx:1.2,x0:2790,x1:3080},
   {id:8,wx:3250,wy:140,vx:-1.2,x0:3202,x1:3348},
  ],
  gems:[
   {id:0,wx:120,wy:218,t:'gold'},{id:1,wx:300,wy:218,t:'gold'},{id:2,wx:548,wy:155,t:'gold'},
   {id:3,wx:660,wy:155,t:'gold'},{id:4,wx:900,wy:218,t:'emerald'},{id:5,wx:1200,wy:218,t:'gold'},
   {id:6,wx:1290,wy:138,t:'emerald'},{id:7,wx:1500,wy:218,t:'gold'},{id:8,wx:1960,wy:133,t:'gold'},
   {id:9,wx:2150,wy:218,t:'emerald'},{id:10,wx:2380,wy:218,t:'gold'},{id:11,wx:2652,wy:128,t:'diamond'},
   {id:12,wx:2860,wy:218,t:'gold'},{id:13,wx:3210,wy:140,t:'emerald'},{id:14,wx:3540,wy:138,t:'diamond'},
   {id:15,wx:3640,wy:218,t:'gold'},
  ],
 },
 {// ── LV4: Underground Caves (CEILING!) ─────────────────────
  title:'World 1-4', sub:'Underground Caves', theme:TH.cave,
  worldW:3500, flagX:3400, reward:{d:2,e:2,g:2},
  ceiling:38,
  gsegs:[[0,3500]],  // continuous ground — ceiling pipes are the hazard
  pipes:[{x:550,yt:175},{x:900,yt:162},{x:1400,yt:178},{x:1900,yt:162},{x:2400,yt:172},{x:2900,yt:158}],
  cpipes:[{x:180,yb:150},{x:350,yb:130},{x:620,yb:148},{x:800,yb:128},{x:1050,yb:148},{x:1250,yb:135},
          {x:1550,yb:150},{x:1750,yb:128},{x:2050,yb:148},{x:2250,yb:130},{x:2550,yb:150},{x:2750,yb:128},
          {x:3050,yb:148},{x:3200,yb:130},{x:3280,yb:155}],
  qbs:[{x:300,y:155},{x:700,y:155},{x:1100,y:158},{x:1600,y:155},{x:2100,y:158},{x:2600,y:155},{x:3100,y:158}],
  plats:[[320,178,80,12],[700,170,80,12],[1100,182,80,12],[1600,170,80,12],[2100,182,80,12],[2600,170,80,12],[3100,182,80,12]],
  mplats:[{id:'d0',wx:450,y:165,w:90,vx:1.8,x0:120,x1:540},{id:'d1',wx:1300,y:165,w:90,vx:1.8,x0:960,x1:1390},
          {id:'d2',wx:2300,y:165,w:90,vx:1.8,x0:1960,x1:2390},{id:'d3',wx:3300,y:165,w:90,vx:1.8,x0:2960,x1:3390}],
  enems:[
   {id:0,wx:200,wy:216,vx:-1.3,x0:100,x1:540},{id:1,wx:740,wy:216,vx:1.3,x0:560,x1:890},
   {id:2,wx:1050,wy:216,vx:-1.3,x0:910,x1:1390},{id:3,wx:1500,wy:216,vx:1.4,x0:1400,x1:1890},
   {id:4,wx:2000,wy:216,vx:-1.4,x0:1910,x1:2390},{id:5,wx:2500,wy:216,vx:1.4,x0:2410,x1:2890},
   {id:6,wx:3000,wy:216,vx:-1.4,x0:2910,x1:3390},{id:7,wx:650,wy:148,vx:1.0,x0:330,x1:698},
   {id:8,wx:1750,wy:148,vx:-1.0,x0:1610,x1:1798},{id:9,wx:2850,wy:148,vx:1.0,x0:2610,x1:2898},
  ],
  gems:[
   {id:0,wx:80,wy:218,t:'gold'},{id:1,wx:160,wy:218,t:'gold'},{id:2,wx:400,wy:218,t:'gold'},
   {id:3,wx:500,wy:218,t:'emerald'},{id:4,wx:760,wy:218,t:'gold'},{id:5,wx:860,wy:218,t:'gold'},
   {id:6,wx:1150,wy:160,t:'emerald'},{id:7,wx:1250,wy:218,t:'gold'},{id:8,wx:1450,wy:218,t:'gold'},
   {id:9,wx:1660,wy:148,t:'gold'},{id:10,wx:1800,wy:218,t:'emerald'},{id:11,wx:1960,wy:218,t:'gold'},
   {id:12,wx:2160,wy:160,t:'gold'},{id:13,wx:2300,wy:218,t:'gold'},{id:14,wx:2450,wy:218,t:'emerald'},
   {id:15,wx:2660,wy:148,t:'gold'},{id:16,wx:2800,wy:218,t:'gold'},{id:17,wx:3000,wy:218,t:'gold'},
   {id:18,wx:3160,wy:160,t:'emerald'},{id:19,wx:3300,wy:218,t:'diamond'},
  ],
 },
 {// ── LV5: Desert Winds ─────────────────────────────────────
  title:'World 2-1', sub:'Desert Winds', theme:TH.dusk,
  worldW:4000, flagX:3880, reward:{d:2,e:2,g:2},
  gsegs:[[0,800],[1020,1780],[2020,2800],[3060,4000]],
  pipes:[{x:400,yt:165},{x:600,yt:145},{x:1200,yt:158},{x:1450,yt:140},{x:1920,yt:155},{x:2250,yt:140},{x:2500,yt:162},{x:2700,yt:145},{x:3250,yt:155},{x:3500,yt:140},{x:3720,yt:162}],
  cpipes:[],
  qbs:[{x:250,y:158},{x:700,y:155},{x:1300,y:155},{x:1850,y:158},{x:2300,y:155},{x:2850,y:158},{x:3350,y:155},{x:3800,y:158}],
  plats:[[815,175,100,12],[900,175,100,12],[1790,172,100,12],[1900,172,100,12],[2810,168,100,12],[2920,168,100,12]],
  mplats:[{id:'e0',wx:808,y:165,w:90,vx:2.2,x0:800,x1:912},{id:'e1',wx:1783,y:162,w:90,vx:2.2,x0:1775,x1:1892},
          {id:'e2',wx:2803,y:158,w:90,vx:2.4,x0:2795,x1:2912},{id:'e3',wx:3500,y:158,w:90,vx:2.4,x0:3492,x1:3600}],
  enems:[
   {id:0,wx:200,wy:216,vx:-1.4,x0:60,x1:390},{id:1,wx:600,wy:216,vx:1.4,x0:420,x1:790},
   {id:2,wx:860,wy:153,vx:1.4,x0:817,x1:908},{id:3,wx:1300,wy:216,vx:-1.4,x0:1030,x1:1440},
   {id:4,wx:1600,wy:216,vx:1.4,x0:1450,x1:1780},{id:5,wx:1870,wy:150,vx:-1.4,x0:1792,x1:1898},
   {id:6,wx:2200,wy:216,vx:-1.5,x0:2030,x1:2500},{id:7,wx:2600,wy:216,vx:1.5,x0:2510,x1:2800},
   {id:8,wx:2870,wy:146,vx:1.4,x0:2813,x1:2918},{id:9,wx:3250,wy:216,vx:-1.5,x0:3070,x1:3500},
   {id:10,wx:3700,wy:216,vx:1.4,x0:3510,x1:3870},
  ],
  gems:[
   {id:0,wx:100,wy:218,t:'gold'},{id:1,wx:300,wy:218,t:'gold'},{id:2,wx:550,wy:218,t:'emerald'},
   {id:3,wx:840,wy:153,t:'gold'},{id:4,wx:920,wy:153,t:'gold'},{id:5,wx:1100,wy:218,t:'gold'},
   {id:6,wx:1400,wy:218,t:'emerald'},{id:7,wx:1600,wy:218,t:'gold'},{id:8,wx:1900,wy:150,t:'gold'},
   {id:9,wx:2100,wy:218,t:'gold'},{id:10,wx:2350,wy:218,t:'emerald'},{id:11,wx:2600,wy:218,t:'gold'},
   {id:12,wx:2920,wy:146,t:'gold'},{id:13,wx:3150,wy:218,t:'emerald'},{id:14,wx:3400,wy:218,t:'gold'},
   {id:15,wx:3600,wy:218,t:'gold'},{id:16,wx:3750,wy:218,t:'emerald'},{id:17,wx:3850,wy:218,t:'diamond'},
  ],
 },
 {// ── LV6: Sky Islands ──────────────────────────────────────
  title:'World 2-2', sub:'Sky Islands', theme:TH.sky,
  worldW:4200, flagX:4080, reward:{d:2,e:2,g:2},
  gsegs:[[0,350],[600,950],[1300,1600],[1950,2250],[2600,2850],[3200,3500],[3850,4200]],
  pipes:[{x:200,yt:180},{x:700,yt:162},{x:1400,yt:172},{x:1760,yt:158},{x:2100,yt:172},{x:2450,yt:158},{x:2700,yt:165},{x:3050,yt:152},{x:3350,yt:168},{x:3700,yt:152},{x:3960,yt:165}],
  cpipes:[],
  qbs:[{x:150,y:158},{x:750,y:155},{x:1400,y:158},{x:1800,y:155},{x:2250,y:158},{x:2700,y:155},{x:3200,y:158},{x:3700,y:152},{x:4000,y:155}],
  plats:[
   [355,178,90,12],[465,178,90,12],[955,172,80,12],[1050,155,80,12],[1150,172,80,12],
   [1605,168,80,12],[1720,150,80,12],[1840,168,80,12],[2255,162,80,12],[2375,145,80,12],
   [2855,158,80,12],[2975,140,80,12],[3505,155,80,12],[3625,138,80,12],[3740,155,80,12],
  ],
  mplats:[
   {id:'f0',wx:350,y:168,w:90,vx:2.4,x0:342,x1:592},{id:'f1',wx:945,y:158,w:80,vx:2.4,x0:938,x1:1148},
   {id:'f2',wx:1595,y:148,w:80,vx:2.6,x0:1588,x1:1838},{id:'f3',wx:2245,y:142,w:80,vx:2.6,x0:2238,x1:2588},
   {id:'f4',wx:2845,y:138,w:80,vx:2.8,x0:2838,x1:3188},{id:'f5',wx:3495,y:132,w:80,vx:2.8,x0:3488,x1:3838},
  ],
  enems:[
   {id:0,wx:180,wy:216,vx:-1.5,x0:60,x1:340},{id:1,wx:390,wy:156,vx:1.5,x0:357,x1:553},
   {id:2,wx:700,wy:216,vx:-1.5,x0:610,x1:940},{id:3,wx:1010,wy:150,vx:1.5,x0:957,x1:1148},
   {id:4,wx:1450,wy:216,vx:-1.6,x0:1310,x1:1595},{id:5,wx:1700,wy:128,vx:1.5,x0:1607,x1:1838},
   {id:6,wx:2050,wy:216,vx:-1.6,x0:1960,x1:2245},{id:7,wx:2360,wy:123,vx:-1.5,x0:2247,x1:2453},
   {id:8,wx:2710,wy:143,vx:1.5,x0:2637,x1:2843},{id:9,wx:3020,wy:118,vx:-1.5,x0:2847,x1:3063},
   {id:10,wx:3600,wy:133,vx:1.5,x0:3497,x1:3738},{id:11,wx:3850,wy:216,vx:-1.5,x0:3860,x1:4070},
  ],
  gems:[
   {id:0,wx:150,wy:218,t:'gold'},{id:1,wx:400,wy:156,t:'gold'},{id:2,wx:480,wy:156,t:'gold'},
   {id:3,wx:750,wy:218,t:'emerald'},{id:4,wx:1000,wy:133,t:'gold'},{id:5,wx:1090,wy:133,t:'gold'},
   {id:6,wx:1450,wy:218,t:'gold'},{id:7,wx:1740,wy:128,t:'emerald'},{id:8,wx:2050,wy:218,t:'gold'},
   {id:9,wx:2400,wy:123,t:'gold'},{id:10,wx:2700,wy:218,t:'emerald'},{id:11,wx:3000,wy:116,t:'diamond'},
   {id:12,wx:3250,wy:218,t:'gold'},{id:13,wx:3630,wy:116,t:'emerald'},{id:14,wx:3880,wy:218,t:'gold'},
   {id:15,wx:4010,wy:218,t:'diamond'},
  ],
 },
 {// ── LV7: Haunted Night ────────────────────────────────────
  title:'World 2-3', sub:'Haunted Night', theme:TH.night,
  worldW:4500, flagX:4380, reward:{d:2,e:3,g:2},
  gsegs:[[0,650],[870,1500],[1740,2380],[2620,3260],[3500,4000],[4200,4500]],
  pipes:[{x:320,yt:162},{x:480,yt:145},{x:1000,yt:165},{x:1200,yt:148},{x:1360,yt:162},{x:1880,yt:152},{x:2080,yt:138},{x:2450,yt:162},{x:2760,yt:148},{x:2960,yt:162},{x:3600,yt:152},{x:3750,yt:138},{x:4030,yt:158}],
  cpipes:[],
  qbs:[{x:200,y:155},{x:900,y:152},{x:1100,y:152},{x:1800,y:155},{x:2000,y:152},{x:2700,y:155},{x:3600,y:152},{x:4050,y:155}],
  plats:[
   [660,172,100,12],[750,172,100,12],[1505,165,90,12],[1630,148,80,12],[2385,162,90,12],[2510,145,80,12],
   [3265,158,90,12],[3380,140,80,12],[4005,155,90,12],[4100,138,80,12],[4270,155,90,12],
  ],
  mplats:[
   {id:'g0',wx:654,y:162,w:90,vx:2.5,x0:646,x1:858},{id:'g1',wx:1499,y:152,w:85,vx:2.5,x0:1491,x1:1728},
   {id:'g2',wx:2379,y:148,w:85,vx:2.7,x0:2371,x1:2608},{id:'g3',wx:3259,y:142,w:85,vx:2.7,x0:3251,x1:3488},
   {id:'g4',wx:4000,y:135,w:85,vx:3.0,x0:3992,x1:4188},
  ],
  enems:[
   {id:0,wx:200,wy:216,vx:-1.6,x0:60,x1:640},{id:1,wx:700,wy:150,vx:1.6,x0:656,x1:848},
   {id:2,wx:1050,wy:216,vx:-1.6,x0:880,x1:1495},{id:3,wx:1610,wy:126,vx:1.6,x0:1501,x1:1628},
   {id:4,wx:1900,wy:216,vx:-1.7,x0:1750,x1:2375},{id:5,wx:2500,wy:123,vx:-1.6,x0:2381,x1:2508},
   {id:6,wx:2800,wy:216,vx:1.7,x0:2630,x1:3255},{id:7,wx:3380,wy:118,vx:-1.6,x0:3261,x1:3378},
   {id:8,wx:3650,wy:216,vx:-1.7,x0:3510,x1:3990},{id:9,wx:4060,wy:133,vx:1.6,x0:4007,x1:4098},
   {id:10,wx:4280,wy:133,vx:-1.6,x0:4102,x1:4268},{id:11,wx:4350,wy:216,vx:1.5,x0:4210,x1:4370},
  ],
  gems:[
   {id:0,wx:100,wy:218,t:'gold'},{id:1,wx:350,wy:218,t:'gold'},{id:2,wx:710,wy:150,t:'gold'},
   {id:3,wx:800,wy:150,t:'gold'},{id:4,wx:1100,wy:218,t:'emerald'},{id:5,wx:1380,wy:218,t:'gold'},
   {id:6,wx:1560,wy:126,t:'emerald'},{id:7,wx:1900,wy:218,t:'gold'},{id:8,wx:2200,wy:218,t:'gold'},
   {id:9,wx:2540,wy:123,t:'diamond'},{id:10,wx:2900,wy:218,t:'emerald'},{id:11,wx:3200,wy:218,t:'gold'},
   {id:12,wx:3420,wy:118,t:'gold'},{id:13,wx:3700,wy:218,t:'gold'},{id:14,wx:3900,wy:218,t:'emerald'},
   {id:15,wx:4120,wy:133,t:'gold'},{id:16,wx:4310,wy:133,t:'gold'},{id:17,wx:4350,wy:218,t:'diamond'},
  ],
 },
 {// ── LV8: Lava Castle ──────────────────────────────────────
  title:'World 3-1', sub:'Lava Castle', theme:TH.castle,
  worldW:4800, flagX:4680, reward:{d:3,e:2,g:2},
  gsegs:[[0,600],[880,1400],[1720,2280],[2600,3120],[3440,3960],[4280,4800]],
  pipes:[{x:280,yt:155},{x:440,yt:138},{x:1050,yt:152},{x:1200,yt:136},{x:1880,yt:148},{x:2050,yt:132},{x:2760,yt:148},{x:2930,yt:132},{x:3600,yt:145},{x:3770,yt:130},{x:4380,yt:148},{x:4550,yt:132}],
  cpipes:[],
  qbs:[{x:150,y:148},{x:480,y:145},{x:1100,y:148},{x:1880,y:145},{x:2800,y:148},{x:3640,y:145},{x:4420,y:148}],
  plats:[
   [605,165,100,12],[720,165,100,12],[1405,158,90,12],[1530,140,80,12],[2285,155,90,12],[2400,138,80,12],
   [3125,152,90,12],[3240,135,80,12],[3965,148,90,12],[4080,132,80,12],
  ],
  mplats:[
   {id:'h0',wx:598,y:155,w:90,vx:2.6,x0:590,x1:870},{id:'h1',wx:1398,y:148,w:85,vx:2.6,x0:1390,x1:1710},
   {id:'h2',wx:2278,y:142,w:85,vx:2.8,x0:2270,x1:2590},{id:'h3',wx:3118,y:135,w:85,vx:2.8,x0:3110,x1:3430},
   {id:'h4',wx:3958,y:128,w:85,vx:3.0,x0:3950,x1:4270},{id:'h5',wx:1530,y:118,w:70,vx:2.4,x0:1522,x1:1618}],
  enems:[
   {id:0,wx:200,wy:216,vx:-1.7,x0:60,x1:590},{id:1,wx:660,wy:143,vx:1.7,x0:600,x1:808},
   {id:2,wx:1050,wy:216,vx:-1.7,x0:890,x1:1395},{id:3,wx:1500,wy:118,vx:-1.6,x0:1532,x1:1618},
   {id:4,wx:1900,wy:216,vx:1.8,x0:1730,x1:2275},{id:5,wx:2380,wy:216,vx:-1.8,x0:2290,x1:2590},
   {id:6,wx:2800,wy:216,vx:1.8,x0:2610,x1:3115},{id:7,wx:3220,wy:113,vx:-1.7,x0:3242,x1:3318},
   {id:8,wx:3600,wy:216,vx:-1.8,x0:3450,x1:3955},{id:9,wx:4040,wy:110,vx:1.7,x0:3962,x1:4078},
   {id:10,wx:4380,wy:216,vx:1.8,x0:4290,x1:4670},{id:11,wx:4580,wy:216,vx:-1.7,x0:4290,x1:4670},
  ],
  gems:[
   {id:0,wx:100,wy:218,t:'gold'},{id:1,wx:350,wy:218,t:'gold'},{id:2,wx:660,wy:143,t:'emerald'},
   {id:3,wx:750,wy:143,t:'gold'},{id:4,wx:1100,wy:218,t:'gold'},{id:5,wx:1350,wy:218,t:'emerald'},
   {id:6,wx:1540,wy:96,t:'diamond'},{id:7,wx:1950,wy:218,t:'gold'},{id:8,wx:2200,wy:218,t:'gold'},
   {id:9,wx:2400,wy:218,t:'emerald'},{id:10,wx:2850,wy:218,t:'gold'},{id:11,wx:3100,wy:218,t:'gold'},
   {id:12,wx:3280,wy:113,t:'diamond'},{id:13,wx:3650,wy:218,t:'emerald'},{id:14,wx:3900,wy:218,t:'gold'},
   {id:15,wx:4095,wy:110,t:'gold'},{id:16,wx:4450,wy:218,t:'gold'},{id:17,wx:4600,wy:218,t:'diamond'},
  ],
 },
 {// ── LV9: Speed Dash ───────────────────────────────────────
  title:'World 3-2', sub:'Speed Dash', theme:TH.dusk,
  worldW:5000, flagX:4880, reward:{d:3,e:3,g:2},
  gsegs:[[0,560],[740,1240],[1440,1940],[2140,2640],[2840,3340],[3540,4040],[4240,5000]],
  pipes:[{x:260,yt:158},{x:400,yt:142},{x:850,yt:158},{x:1050,yt:142},{x:1550,yt:158},{x:1750,yt:142},
         {x:2250,yt:155},{x:2450,yt:140},{x:2950,yt:155},{x:3150,yt:140},{x:3650,yt:152},{x:3850,yt:138},
         {x:4350,yt:152},{x:4550,yt:138},{x:4700,yt:155}],
  cpipes:[],
  qbs:[{x:150,y:148},{x:900,y:148},{x:1600,y:148},{x:2300,y:148},{x:3000,y:148},{x:3700,y:148},{x:4400,y:148}],
  plats:[
   [560,162,90,12],[640,162,90,12],[1240,155,80,12],[1360,140,80,12],[1940,152,80,12],[2060,138,80,12],
   [2640,148,80,12],[2760,132,80,12],[3340,145,80,12],[3460,130,80,12],[4040,142,80,12],[4160,128,80,12],
  ],
  mplats:[
   {id:'i0',wx:553,y:152,w:85,vx:3.0,x0:545,x1:728},{id:'i1',wx:1233,y:145,w:80,vx:3.0,x0:1225,x1:1428},
   {id:'i2',wx:1933,y:138,w:80,vx:3.2,x0:1925,x1:2128},{id:'i3',wx:2633,y:132,w:80,vx:3.2,x0:2625,x1:2828},
   {id:'i4',wx:3333,y:125,w:80,vx:3.4,x0:3325,x1:3528},{id:'i5',wx:4033,y:118,w:80,vx:3.4,x0:4025,x1:4228},
  ],
  enems:[
   {id:0,wx:200,wy:216,vx:-1.9,x0:60,x1:550},{id:1,wx:610,wy:140,vx:1.8,x0:562,x1:728},
   {id:2,wx:950,wy:216,vx:-1.9,x0:750,x1:1230},{id:3,wx:1310,wy:118,vx:1.8,x0:1242,x1:1358},
   {id:4,wx:1550,wy:216,vx:1.9,x0:1450,x1:1930},{id:5,wx:2030,wy:116,vx:-1.8,x0:1942,x1:2058},
   {id:6,wx:2250,wy:216,vx:-1.9,x0:2150,x1:2630},{id:7,wx:2730,wy:110,vx:1.8,x0:2642,x1:2758},
   {id:8,wx:2950,wy:216,vx:2.0,x0:2850,x1:3330},{id:9,wx:3430,wy:108,vx:-1.8,x0:3342,x1:3458},
   {id:10,wx:3650,wy:216,vx:-2.0,x0:3550,x1:4030},{id:11,wx:4130,wy:106,vx:1.8,x0:4042,x1:4158},
   {id:12,wx:4350,wy:216,vx:2.0,x0:4250,x1:4870},{id:13,wx:4700,wy:216,vx:-1.9,x0:4250,x1:4870},
  ],
  gems:[
   {id:0,wx:100,wy:218,t:'gold'},{id:1,wx:300,wy:218,t:'gold'},{id:2,wx:620,wy:140,t:'gold'},
   {id:3,wx:700,wy:140,t:'gold'},{id:4,wx:1000,wy:218,t:'emerald'},{id:5,wx:1200,wy:218,t:'gold'},
   {id:6,wx:1310,wy:118,t:'gold'},{id:7,wx:1700,wy:218,t:'emerald'},{id:8,wx:1900,wy:218,t:'gold'},
   {id:9,wx:2040,wy:114,t:'diamond'},{id:10,wx:2400,wy:218,t:'gold'},{id:11,wx:2600,wy:218,t:'emerald'},
   {id:12,wx:2740,wy:108,t:'gold'},{id:13,wx:3100,wy:218,t:'gold'},{id:14,wx:3300,wy:218,t:'gold'},
   {id:15,wx:3440,wy:106,t:'diamond'},{id:16,wx:3800,wy:218,t:'emerald'},{id:17,wx:4000,wy:218,t:'gold'},
   {id:18,wx:4140,wy:104,t:'gold'},{id:19,wx:4500,wy:218,t:'gold'},{id:20,wx:4750,wy:218,t:'diamond'},
  ],
 },
 {// ── LV10: Hero's Gauntlet ─────────────────────────────────
  title:'World 4-4', sub:"Hero's Gauntlet", theme:TH.castle,
  worldW:5500, flagX:5380, reward:{d:4,e:3,g:3},
  gsegs:[[0,480],[700,1120],[1380,1800],[2060,2480],[2740,3160],[3420,3840],[4100,4520],[4780,5500]],
  pipes:[{x:250,yt:148},{x:380,yt:132},{x:800,yt:148},{x:950,yt:132},{x:1480,yt:145},{x:1620,yt:128},
         {x:2160,yt:145},{x:2300,yt:128},{x:2840,yt:142},{x:2980,yt:128},{x:3520,yt:142},{x:3660,yt:125},
         {x:4200,yt:142},{x:4340,yt:125},{x:4880,yt:138},{x:5020,yt:122},{x:5200,yt:140}],
  cpipes:[],
  qbs:[{x:120,y:142},{x:750,y:142},{x:1430,y:142},{x:2110,y:142},{x:2790,y:142},{x:3470,y:142},{x:4150,y:142},{x:4830,y:142},{x:5100,y:138}],
  plats:[
   [480,155,80,12],[585,155,80,12],[1120,148,80,12],[1240,132,70,12],[1800,145,80,12],[1920,130,70,12],
   [2480,142,80,12],[2600,128,70,12],[3160,138,80,12],[3280,122,70,12],[3840,135,80,12],[3960,118,70,12],
   [4520,132,80,12],[4640,115,70,12],[5250,128,80,12],[5330,112,70,12],
  ],
  mplats:[
   {id:'j0',wx:473,y:145,w:80,vx:3.0,x0:465,x1:688},{id:'j1',wx:1113,y:138,w:75,vx:3.0,x0:1105,x1:1368},
   {id:'j2',wx:1793,y:132,w:75,vx:3.2,x0:1785,x1:2048},{id:'j3',wx:2473,y:125,w:75,vx:3.2,x0:2465,x1:2728},
   {id:'j4',wx:3153,y:118,w:75,vx:3.4,x0:3145,x1:3408},{id:'j5',wx:3833,y:112,w:75,vx:3.4,x0:3825,x1:4088},
   {id:'j6',wx:4513,y:105,w:75,vx:3.6,x0:4505,x1:4768},{id:'j7',wx:5193,y:98,w:75,vx:3.6,x0:5185,x1:5368},
  ],
  enems:[
   {id:0,wx:200,wy:216,vx:-2.1,x0:60,x1:470},{id:1,wx:535,wy:133,vx:2.0,x0:482,x1:663},
   {id:2,wx:900,wy:216,vx:-2.1,x0:710,x1:1110},{id:3,wx:1210,wy:110,vx:2.0,x0:1122,x1:1238},
   {id:4,wx:1480,wy:216,vx:2.1,x0:1390,x1:1790},{id:5,wx:1890,wy:108,vx:-2.0,x0:1802,x1:1918},
   {id:6,wx:2160,wy:216,vx:-2.2,x0:2070,x1:2470},{id:7,wx:2570,wy:106,vx:2.0,x0:2482,x1:2598},
   {id:8,wx:2840,wy:216,vx:2.2,x0:2750,x1:3150},{id:9,wx:3250,wy:100,vx:-2.0,x0:3162,x1:3278},
   {id:10,wx:3520,wy:216,vx:-2.3,x0:3430,x1:3830},{id:11,wx:3930,wy:96,vx:2.0,x0:3842,x1:3958},
   {id:12,wx:4200,wy:216,vx:2.3,x0:4110,x1:4510},{id:13,wx:4610,wy:93,vx:-2.0,x0:4522,x1:4638},
   {id:14,wx:4880,wy:216,vx:-2.4,x0:4790,x1:5180},{id:15,wx:5280,wy:76,vx:2.0,x0:5195,x1:5366},
   {id:16,wx:5350,wy:216,vx:2.2,x0:4790,x1:5370},
  ],
  gems:[
   {id:0,wx:100,wy:218,t:'gold'},{id:1,wx:550,wy:133,t:'gold'},{id:2,wx:630,wy:133,t:'gold'},
   {id:3,wx:850,wy:218,t:'emerald'},{id:4,wx:1050,wy:218,t:'gold'},{id:5,wx:1240,wy:110,t:'gold'},
   {id:6,wx:1550,wy:218,t:'gold'},{id:7,wx:1750,wy:218,t:'emerald'},{id:8,wx:1930,wy:108,t:'diamond'},
   {id:9,wx:2200,wy:218,t:'gold'},{id:10,wx:2400,wy:218,t:'gold'},{id:11,wx:2600,wy:106,t:'gold'},
   {id:12,wx:2900,wy:218,t:'emerald'},{id:13,wx:3100,wy:218,t:'gold'},{id:14,wx:3280,wy:100,t:'diamond'},
   {id:15,wx:3580,wy:218,t:'gold'},{id:16,wx:3780,wy:218,t:'gold'},{id:17,wx:3960,wy:96,t:'gold'},
   {id:18,wx:4260,wy:218,t:'emerald'},{id:19,wx:4460,wy:218,t:'gold'},{id:20,wx:4638,wy:93,t:'diamond'},
   {id:21,wx:4940,wy:218,t:'gold'},{id:22,wx:5140,wy:218,t:'gold'},{id:23,wx:5330,wy:76,t:'diamond'},
  ],
 },
];

// ── Game Engine ────────────────────────────────────────────
function HeroRunnerGame({addGems,onClose}){
  const canvasRef=useRef(null);
  const rafRef=useRef(null);
  const keysRef=useRef({});
  const touchRef=useRef({left:false,right:false,jump:false});
  const lvRef=useRef(RUNNER_LEVELS[0]);

  const TOTAL=(lv)=>RUNNER_LEVELS[lv].gems.length;

  const mkState=(lv=0,ph='idle')=>{
    const ld=RUNNER_LEVELS[lv];
    return{
      p:{wx:40,wy:202,vx:0,vy:0,onGround:false,face:1,frame:0,inv:0,onMpId:null},
      gems:ld.gems.map(g=>({...g})),
      enemies:ld.enems.map(e=>({...e,dead:false,dt:0})),
      qblocks:ld.qbs.map(q=>({...q,hit:false})),
      mplats:ld.mplats.map(m=>({...m})),
      floatGems:[],
      cam:0, phase:ph, score:0, gemsGot:0, tick:0, lives:3, level:lv,
    };
  };

  const gs=useRef(mkState(0,'idle'));
  const [ui,setUi]=useState({phase:'idle',score:0,gemsGot:0,total:0,lives:3,level:0,title:'World 1-1',sub:'Mushroom Plains'});

  const syncUi=(g)=>{
    const ld=RUNNER_LEVELS[g.level];
    setUi({phase:g.phase,score:g.score,gemsGot:g.gemsGot,total:TOTAL(g.level),lives:g.lives,level:g.level,title:ld.title,sub:ld.sub});
  };

  const loadLevel=useCallback((lv,ph='playing')=>{
    lvRef.current=RUNNER_LEVELS[lv];
    gs.current=mkState(lv,ph);
    syncUi(gs.current);
  },[]);

  useEffect(()=>{
    const onKD=e=>{keysRef.current[e.key]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();};
    const onKU=e=>{keysRef.current[e.key]=false;};
    window.addEventListener('keydown',onKD);
    window.addEventListener('keyup',onKU);

    const update=()=>{
      const g=gs.current; if(g.phase!=='playing') return;
      const ld=lvRef.current;
      const p=g.p; const keys=keysRef.current; const touch=touchRef.current;
      g.tick++;

      // Move mplats & carry player
      for(const mp of g.mplats){
        const prev=mp.wx;
        mp.wx+=mp.vx; if(mp.wx<=mp.x0||mp.wx>=mp.x1) mp.vx*=-1;
        if(p.onMpId===mp.id) p.wx+=mp.wx-prev;
      }
      p.onMpId=null;

      // Input
      const goL=keys.ArrowLeft||keys.a||touch.left;
      const goR=keys.ArrowRight||keys.d||touch.right;
      const doJ=keys.ArrowUp||keys.w||keys[' ']||touch.jump;
      if(goL){p.vx=-PSPD;p.face=-1;}
      else if(goR){p.vx=PSPD;p.face=1;}
      else{p.vx*=0.68;}
      if(doJ&&p.onGround){p.vy=JV;p.onGround=false;}
      p.vy=Math.min(p.vy+GRAV,14);

      // Horizontal move
      p.wx=Math.max(0,Math.min(p.wx+p.vx,ld.worldW-PW));

      // Build solid rectangles: [x,y,w,h,type,ref?]
      const solids=[];
      for(const[x0,x1]of ld.gsegs) solids.push([x0,238,x1-x0,22,'gnd']);
      for(const pl of ld.plats) solids.push([pl[0],pl[1],pl[2],pl[3],'plat']);
      for(const mp of g.mplats) solids.push([mp.wx,mp.y,mp.w,12,'mp',mp]);
      for(const pi of ld.pipes) solids.push([pi.x-4,pi.yt,44,238-pi.yt,'pipe']);
      for(const cp of ld.cpipes) solids.push([cp.x-4,0,44,cp.yb+12,'cpipe']);
      for(const qb of g.qblocks) if(!qb.hit) solids.push([qb.x,qb.y,24,24,'qb',qb]);

      // Horizontal solid collision
      for(const s of solids){
        const[sx,sy,sw,sh]=s;
        if(p.wy+PH<=sy||p.wy>=sy+sh) continue;
        if(p.wx+PW>sx&&p.wx<sx+sw){
          const oL=(p.wx+PW)-sx, oR=(sx+sw)-p.wx;
          if(oL<oR&&oL<10&&p.vx>=0){p.wx=sx-PW;p.vx=0;}
          else if(oR<=oL&&oR<10&&p.vx<=0){p.wx=sx+sw;p.vx=0;}
        }
      }

      // Vertical move
      const prevBot=p.wy+PH, prevTop=p.wy;
      p.wy+=p.vy; p.onGround=false;

      // Vertical solid collision
      for(const s of solids){
        const[sx,sy,sw,sh,st,sr]=s;
        if(p.wx+PW<=sx||p.wx>=sx+sw) continue;
        const nb=p.wy+PH;
        // Land on top
        if(p.vy>=0&&prevBot<=sy+2&&nb>=sy){
          p.wy=sy-PH;p.vy=0;p.onGround=true;
          if(st==='mp') p.onMpId=sr.id;
        }
        // Head bump (not ground, not ceiling pipe)
        if(p.vy<0&&st!=='gnd'&&st!=='cpipe'){
          const sb=sy+sh;
          if(prevTop>=sb-2&&p.wy<sb){
            p.wy=sb;p.vy=2;
            if(st==='qb'&&sr&&!sr.hit){
              sr.hit=true;
              g.floatGems.push({id:g.tick+'fg',wx:sr.x+12,wy:sr.y-2,age:0});
              g.score+=50;
            }
          }
        }
      }

      // Ceiling constraint
      if(ld.ceiling!=null&&p.wy<ld.ceiling){p.wy=ld.ceiling;p.vy=Math.max(0,p.vy);}

      // Walking animation
      if(p.onGround&&Math.abs(p.vx)>0.5&&g.tick%7===0) p.frame=(p.frame+1)%4;

      // Camera
      g.cam=Math.max(0,Math.min(p.wx-RW/3,ld.worldW-RW));

      // Float gems rise
      for(const fg of g.floatGems){
        fg.age++;
        if(fg.age<14) fg.wy-=2.5;
        if(Math.abs(p.wx+PW/2-fg.wx)<20&&Math.abs(p.wy+PH/2-fg.wy)<20){fg.col=true;g.gemsGot++;}
      }
      g.floatGems=g.floatGems.filter(fg=>!fg.col&&fg.age<50);

      // Collect gems
      for(const gem of g.gems){
        if(gem.col) continue;
        if(Math.abs(p.wx+PW/2-gem.wx)<18&&Math.abs(p.wy+PH/2-gem.wy)<18){
          gem.col=true;g.gemsGot++;
          g.score+=gem.t==='diamond'?50:gem.t==='emerald'?30:10;
        }
      }

      // Enemies
      if(p.inv>0) p.inv--;
      for(const en of g.enemies){
        if(en.dead){en.dt++;continue;}
        en.wx+=en.vx;
        if(en.wx<=en.x0||en.wx>=en.x1) en.vx*=-1;
        if(p.wx+PW>en.wx&&p.wx<en.wx+ENW&&p.wy+PH>en.wy&&p.wy<en.wy+ENH){
          if(p.vy>0&&p.wy+PH<en.wy+ENH*0.55){en.dead=true;en.dt=0;p.vy=-7;g.score+=200;}
          else if(p.inv===0){g.lives--;p.inv=120;p.vy=-7;if(g.lives<=0){g.phase='lost';syncUi(g);}}
        }
      }

      // Fall into gap
      if(p.wy>RH+50){
        g.lives--;
        if(g.lives<=0){g.phase='lost';syncUi(g);return;}
        Object.assign(p,{wx:40,wy:180,vx:0,vy:0,inv:120,onGround:false,onMpId:null});
        g.cam=0;
      }

      // Win: reach flag
      if(p.wx+PW>=ld.flagX){
        const r=ld.reward;
        addGems('diamond',r.d);addGems('emerald',r.e);addGems('gold',r.g);
        g.phase=g.level>=RUNNER_LEVELS.length-1?'allDone':'levelDone';
        syncUi(g);
      }
      if(g.tick%8===0) syncUi(g);
    };

    const draw=()=>{
      const canvas=canvasRef.current; if(!canvas) return;
      const ctx=canvas.getContext('2d');
      const g=gs.current; const cam=g.cam; const p=g.p; const tick=g.tick;
      const ld=lvRef.current; const th=ld.theme;

      // Sky
      const skG=ctx.createLinearGradient(0,0,0,RH);
      skG.addColorStop(0,th.sky[0]);skG.addColorStop(1,th.sky[1]);
      ctx.fillStyle=skG; ctx.fillRect(0,0,RW,RH);

      // Cave ceiling
      if(ld.ceiling!=null){
        ctx.fillStyle='#2a2020'; ctx.fillRect(0,0,RW,ld.ceiling);
        ctx.fillStyle='#3a2a28';
        for(let xi=0;xi<RW;xi+=20) ctx.fillRect(xi,0,18,ld.ceiling);
      }

      // Background hills
      if(th.hill){
        ctx.fillStyle=th.hill;
        for(let i=0;i<7;i++){const hx=((i*360-cam*0.35)%(RW*7)+RW*7)%(RW*7)-180;ctx.beginPath();ctx.ellipse(hx+180,RH-22,178,68,0,0,Math.PI*2);ctx.fill();}
      }

      // Abyss / gap floor
      ctx.fillStyle='#060610'; ctx.fillRect(0,238,RW,RH-238);

      // Stars (night/cave)
      if(th.dark||th.sky[0].startsWith('#07')||th.sky[0].startsWith('#14')||th.sky[0].startsWith('#18')){
        ctx.fillStyle='rgba(255,255,255,0.5)';
        [52,143,261,88,314,178,67,219,398,31,117,492,354,79,225,410,155,290].forEach((s,i)=>{
          const wx2=(s*137+i*61)%ld.worldW; const wy2=(s*31)%110+5;
          const sx=((wx2-cam*0.2)%RW+RW)%RW; ctx.fillRect(sx,wy2,1.5,1.5);
        });
      }

      // Ground segments
      for(const[gs2,ge]of ld.gsegs){
        const sx=gs2-cam,ex=ge-cam; if(ex<0||sx>RW) continue;
        ctx.fillStyle='#1a1e35'; ctx.fillRect(sx,238,ex-sx,22);
        ctx.fillStyle=th.grass; ctx.fillRect(sx,238,ex-sx,5);
        ctx.fillStyle='rgba(80,120,60,0.35)';
        for(let xi=0;xi<ge-gs2;xi+=18) ctx.fillRect(sx+xi,244,10,5);
      }

      // Floating platforms
      for(const[px,py,pw,ph]of ld.plats){
        const sx=px-cam; if(sx+pw<0||sx>RW) continue;
        ctx.fillStyle=C.surface; ctx.fillRect(sx,py+3,pw,ph-3);
        ctx.fillStyle=th.rail; ctx.fillRect(sx,py,pw,4);
        ctx.fillStyle='rgba(0,0,0,0.1)';
        for(let xi=0;xi<pw;xi+=18) ctx.fillRect(sx+xi,py+3,1,ph-3);
      }

      // Moving platforms
      for(const mp of g.mplats){
        const sx=mp.wx-cam; if(sx+mp.w<0||sx>RW) continue;
        ctx.fillStyle=C.tealDim; ctx.fillRect(sx,mp.y+3,mp.w,9);
        ctx.fillStyle=C.teal; ctx.fillRect(sx,mp.y,mp.w,4);
        const pulse=0.4+0.3*Math.sin(tick*0.12);
        ctx.fillStyle=`rgba(96,210,200,${pulse})`;
        ctx.font='7px sans-serif'; ctx.textAlign='center';
        ctx.fillText(mp.vx>0?'▸':'◂',sx+mp.w/2,mp.y+10);
      }

      // Mario-style Green Pipes
      const drawPipe=(px,yt)=>{
        const sx=px-cam; if(sx+44<0||sx-4>RW) return;
        const bh=Math.max(0,238-yt-12);
        ctx.fillStyle='#1a7a2e'; ctx.fillRect(sx,yt+12,36,bh);
        ctx.fillStyle='#229940'; ctx.fillRect(sx,yt+12,9,bh);
        ctx.fillStyle='#159230'; ctx.fillRect(sx+28,yt+12,8,bh);
        ctx.fillStyle='#22a040'; ctx.fillRect(sx-4,yt,44,12);
        ctx.fillStyle='#33c055'; ctx.fillRect(sx-4,yt,44,5);
        ctx.fillStyle='#168030'; ctx.fillRect(sx+36,yt,5,12);
        ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(sx+2,yt+2,30,8);
      };
      for(const pi of ld.pipes) drawPipe(pi.x,pi.yt);

      // Ceiling Pipes (hang from top)
      const drawCPipe=(px,yb)=>{
        if(ld.ceiling==null) return;
        const sx=px-cam; if(sx+44<0||sx-4>RW) return;
        const bh=Math.max(0,yb-ld.ceiling-12);
        ctx.fillStyle='#1a7a2e'; ctx.fillRect(sx,ld.ceiling,36,bh);
        ctx.fillStyle='#229940'; ctx.fillRect(sx,ld.ceiling,9,bh);
        ctx.fillStyle='#159230'; ctx.fillRect(sx+28,ld.ceiling,8,bh);
        ctx.fillStyle='#22a040'; ctx.fillRect(sx-4,yb-12,44,12);
        ctx.fillStyle='#168030'; ctx.fillRect(sx-4,yb-12,5,12);
        ctx.fillStyle='#33c055'; ctx.fillRect(sx-4,yb-12,44,5);
        ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(sx+2,yb-10,30,7);
      };
      for(const cp of ld.cpipes) drawCPipe(cp.x,cp.yb);

      // Question Blocks
      const bAnim=Math.floor(tick/8)%2;
      for(const qb of g.qblocks){
        const sx=qb.x-cam; if(sx+24<0||sx>RW+24) continue;
        const by2=qb.y+(qb.hit?0:bAnim*-1);
        if(qb.hit){
          ctx.fillStyle='#5a3a18'; ctx.fillRect(sx,by2,24,24);
          ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(sx+2,by2+2,20,20);
        } else {
          const gl=0.5+0.5*Math.sin(tick*0.14);
          ctx.fillStyle=`rgba(241,180,60,${0.85+gl*0.15})`; ctx.fillRect(sx,by2,24,24);
          ctx.fillStyle='rgba(180,120,30,0.8)'; ctx.fillRect(sx+3,by2+3,18,18);
          ctx.fillStyle='#fff8e0'; ctx.font='bold 13px serif';
          ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillText('?',sx+12,by2+13);
        }
        ctx.strokeStyle='rgba(0,0,0,0.4)'; ctx.lineWidth=1; ctx.strokeRect(sx,by2,24,24);
      }

      // Float gems from qblocks
      ctx.font='13px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      for(const fg of g.floatGems){
        if(fg.col) continue;
        const sx=fg.wx-cam;
        ctx.globalAlpha=Math.max(0,1-fg.age/50);
        ctx.fillText('⭐',sx,fg.wy);
        ctx.globalAlpha=1;
      }

      // Flag
      const fx=ld.flagX-cam;
      if(fx>-40&&fx<RW+40){
        ctx.fillStyle=C.amber; ctx.fillRect(fx,52,5,RH-52-22);
        ctx.fillStyle=C.red; ctx.beginPath(); ctx.moveTo(fx+5,52); ctx.lineTo(fx+38,68); ctx.lineTo(fx+5,85); ctx.closePath(); ctx.fill();
        ctx.fillStyle=C.amberDim; ctx.fillRect(fx-7,RH-22,20,8);
        // Glow
        ctx.fillStyle=`rgba(255,215,0,${0.15+0.1*Math.sin(tick*0.1)})`;
        ctx.fillRect(fx-5,52,48,RH-52-22);
      }

      // Gems
      ctx.font='13px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      for(const gem of g.gems){
        if(gem.col) continue;
        const sx=gem.wx-cam; if(sx<-18||sx>RW+18) continue;
        const bob=Math.sin(tick*0.07+gem.id*0.9)*3;
        ctx.fillText(gem.t==='diamond'?'💎':gem.t==='emerald'?'💚':'⭐',sx,gem.wy+bob);
      }

      // Enemies (goomba)
      for(const en of g.enemies){
        const sx=en.wx-cam; if(sx<-30||sx>RW+30) continue;
        if(en.dead){if(en.dt<28){ctx.fillStyle=C.redDim;ctx.fillRect(sx,en.wy+ENH-5,ENW,5);}continue;}
        ctx.fillStyle=C.red;
        ctx.beginPath();ctx.ellipse(sx+ENW/2,en.wy+ENH*0.55,ENW/2,ENH*0.55,0,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#1a0800';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(sx+3,en.wy+2);ctx.lineTo(sx+9,en.wy+5);ctx.stroke();
        ctx.beginPath();ctx.moveTo(sx+13,en.wy+5);ctx.lineTo(sx+19,en.wy+2);ctx.stroke();
        ctx.fillStyle='#1a0800';ctx.fillRect(sx+4,en.wy+4,4,4);ctx.fillRect(sx+13,en.wy+4,4,4);
        const fp=Math.floor(tick/8)%2;
        ctx.fillStyle=C.redDim;
        ctx.fillRect(sx+(fp?2:4),en.wy+ENH-4,7,4);ctx.fillRect(sx+(fp?13:11),en.wy+ENH-4,7,4);
      }

      // Player
      if(!(p.inv>0&&Math.floor(p.inv/5)%2===1)){
        const px2=p.wx-cam,py2=p.wy,fl=p.face===-1;
        ctx.fillStyle=C.purpleDim;
        ctx.fillRect(px2+(fl?11:1),py2+PH-7,9,7);
        ctx.fillRect(px2+(fl?1:11),py2+PH-7,9,7);
        ctx.fillStyle='#4d3485'; ctx.fillRect(px2+2,py2+PH-13,PW-4,7);
        ctx.fillStyle=C.amber; ctx.fillRect(px2+2,py2+10,PW-4,PH-10-13+1);
        ctx.fillStyle=C.purple; ctx.fillRect(fl?px2+PW-1:px2-6,py2+11,7,12);
        ctx.fillStyle='#f7c97a'; ctx.fillRect(px2+2,py2+1,PW-4,11);
        ctx.fillStyle=C.purpleDim;
        ctx.fillRect(px2+2,py2,PW-4,5);
        ctx.fillRect(fl?px2+7:px2+2,py2,PW-(fl?2:6),2);
        ctx.fillStyle='#1a1e35'; ctx.fillRect(px2+(fl?4:PW-8),py2+5,3,3);
        ctx.fillStyle=C.amberDim; ctx.fillRect(px2+(fl?3:PW-11),py2+9,8,2);
      }

      // Phase overlays
      const dim=(r,gg,b,a=0.84)=>{ctx.fillStyle=`rgba(${r},${gg},${b},${a})`;ctx.fillRect(0,0,RW,RH);};
      ctx.textAlign='center'; ctx.textBaseline='middle';
      const F=(sz,bold='')=>`${bold?'bold ':''}${sz}px "DM Sans",sans-serif`;

      if(g.phase==='idle'){
        dim(14,18,35);
        ctx.fillStyle=C.amber;ctx.font=F(18,'bold');
        ctx.fillText(`${ld.title} · ${ld.sub}`,RW/2,RH/2-38);
        ctx.fillStyle=C.text;ctx.font=F(13);
        ctx.fillText('Collect gems · Jump on enemies · Reach the flag!',RW/2,RH/2-12);
        ctx.fillText('← → move   ↑ / Space = jump   Stomp enemies!',RW/2,RH/2+10);
        ctx.fillText('❓ blocks give bonus gems when hit from below!',RW/2,RH/2+30);
        ctx.fillStyle='rgba(241,196,106,0.2)'; ctx.fillRect(RW/2-60,RH/2+45,120,30);
        ctx.fillStyle=C.amber;ctx.font=F(14,'bold');
        ctx.fillText('▶ TAP TO PLAY',RW/2,RH/2+60);
      }
      if(g.phase==='levelDone'){
        dim(8,26,14);
        ctx.fillStyle=C.green;ctx.font=F(20,'bold');
        ctx.fillText(`✅ ${ld.title} Clear!`,RW/2,RH/2-30);
        const r=ld.reward;
        ctx.fillStyle=C.amber;ctx.font=F(13);
        ctx.fillText(`+${r.d}💎 +${r.e}💚 +${r.g}⭐ added to wallet!`,RW/2,RH/2,);
        ctx.fillText(`Score: ${g.score}  ·  Gems: ${g.gemsGot}/${TOTAL(g.level)}`,RW/2,RH/2+20);
        const nextLv=RUNNER_LEVELS[g.level+1];
        ctx.fillStyle='rgba(105,207,141,0.2)'; ctx.fillRect(RW/2-72,RH/2+34,144,30);
        ctx.fillStyle=C.green;ctx.font=F(13,'bold');
        ctx.fillText(`▶ Next: ${nextLv.title} · ${nextLv.sub}`,RW/2,RH/2+49);
      }
      if(g.phase==='allDone'){
        dim(8,22,8);
        ctx.fillStyle=C.amber;ctx.font=F(22,'bold');ctx.fillText('🏆 ALL 10 LEVELS COMPLETE!',RW/2,RH/2-28);
        ctx.fillStyle=C.green;ctx.font=F(13);ctx.fillText('You are a True Hero Champion! 🦸',RW/2,RH/2+2);
        ctx.fillText(`Final Score: ${g.score}`,RW/2,RH/2+22);
        ctx.fillStyle='rgba(241,196,106,0.2)'; ctx.fillRect(RW/2-55,RH/2+36,110,28);
        ctx.fillStyle=C.amber;ctx.font=F(13,'bold');ctx.fillText('🔄 PLAY AGAIN',RW/2,RH/2+50);
      }
      if(g.phase==='lost'){
        dim(26,8,10);
        ctx.fillStyle=C.red;ctx.font=F(22,'bold');ctx.fillText('💀 GAME OVER',RW/2,RH/2-20);
        ctx.fillStyle=C.text2;ctx.font=F(12);ctx.fillText('Tap to try this level again',RW/2,RH/2+8);
      }
    };

    const loop=()=>{update();draw();rafRef.current=requestAnimationFrame(loop);};
    rafRef.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(rafRef.current);window.removeEventListener('keydown',onKD);window.removeEventListener('keyup',onKU);};
  },[addGems]);

  const handleTap=()=>{
    const{phase,level}=gs.current;
    if(phase==='idle'||phase==='lost') loadLevel(level);
    else if(phase==='levelDone'&&level<RUNNER_LEVELS.length-1) loadLevel(level+1);
    else if(phase==='allDone') loadLevel(0);
  };

  const dBtn=(label,dir,extra={})=>(
    <button onPointerDown={()=>{touchRef.current[dir]=true;}}
            onPointerUp={()=>{touchRef.current[dir]=false;}}
            onPointerLeave={()=>{touchRef.current[dir]=false;}}
            style={{width:dir==='jump'?92:58,height:52,background:C.surface2,border:`1px solid ${C.border2}`,
              borderRadius:C.rSm,fontSize:dir==='jump'?12:22,color:C.amber,cursor:'pointer',
              userSelect:'none',touchAction:'none',fontFamily:B,fontWeight:800,
              display:'flex',alignItems:'center',justifyContent:'center',...extra}}>
      {label}
    </button>
  );

  return(
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:2000,display:'flex',flexDirection:'column',fontFamily:B}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 14px',background:C.surface,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <div style={{fontFamily:G,fontSize:'12px',fontWeight:700,color:C.amber}}>{ui.title} · {ui.sub}</div>
          <span style={{fontFamily:G,fontSize:'11px',fontWeight:700,color:C.green}}>Lvl {ui.level+1}/10</span>
          <span style={{fontFamily:G,fontSize:'11px',fontWeight:700,color:C.amber}}>⭐{ui.score}</span>
          <span style={{fontFamily:G,fontSize:'11px',fontWeight:700,color:C.teal}}>💎{ui.gemsGot}/{ui.total}</span>
          <span style={{fontFamily:G,fontSize:'11px',fontWeight:700,color:C.red}}>❤️{ui.lives}</span>
        </div>
        <button onClick={onClose} style={{background:C.surface2,border:`1px solid ${C.border2}`,color:C.text2,padding:'5px 12px',borderRadius:C.rSm,fontSize:'12px',fontWeight:700,cursor:'pointer',fontFamily:B}}>Close</button>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'8px 6px 0',gap:8,overflow:'hidden'}}>
        <canvas ref={canvasRef} width={RW} height={RH} onClick={handleTap}
          style={{borderRadius:10,border:`1px solid ${C.border2}`,cursor:'pointer',maxWidth:'100%',display:'block'}}/>
        <div style={{height:32,display:'flex',alignItems:'center'}}>
          {ui.phase==='playing'&&(
            <button onClick={()=>loadLevel(ui.level)} style={{background:'transparent',border:`1px dashed ${C.border}`,borderRadius:C.rSm,padding:'4px 12px',fontFamily:G,fontSize:'11px',fontWeight:700,color:C.text3,cursor:'pointer'}}>🔄 Restart Level</button>
          )}
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center',paddingBottom:8}}>
          {dBtn('⬅','left')}{dBtn('⬆ JUMP','jump')}{dBtn('➡','right')}
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// MAIN APPLICATION — My Hero Chart™
// ═══════════════════════════════════════════════════════════

const LOGO_URL     = "data:image/png;base64,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";
const BOOKLET_URL  = "https://myherochart.com/booklet";
const CREATOR_NAME = "Sedrick D Scott, M.S.";
const CREDENTIALS  = "Applied Behavioral Analysis";

// Typography system
const DISPLAY = "'Bangers', cursive";
const HEAD    = "'DM Sans', sans-serif";
const BODY    = "'Nunito', sans-serif";

// Home periods only
const PERIODS = ["Morning","Breakfast","Chores","Learning","Free Time","Dinner","Bedtime"];

// Shared style helpers
const lbl  = (c=C.amberDim) => ({fontFamily:HEAD,fontSize:9,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:c});
const hd   = (sz=18,c=C.amber) => ({fontFamily:HEAD,fontSize:sz,fontWeight:700,letterSpacing:'0.01em',color:c,lineHeight:1.2});
const mono = (sz=26,c=C.amber) => ({fontFamily:HEAD,fontSize:sz,fontWeight:700,letterSpacing:'-0.02em',color:c,lineHeight:1});

const GoldRule = () => (
  <div style={{height:1,background:`linear-gradient(90deg,transparent,${C.amber}44,transparent)`,margin:'14px 0'}}/>
);
const SL = ({children,style={}}) => (
  <div style={{...lbl(),marginBottom:8,...style}}>{children}</div>
);

// ── RESPONSIVE HELPERS ─────────────────────────────────────
// In artifacts we use a single maxWidth container.
// All padding/spacing uses rem-equivalent numbers that feel
// comfortable on both 375px phones and 1440px desktops.
const PAD = {padding:'0 20px'};
const CARD = {
  background:C.surface,
  border:`1px solid rgba(255,255,255,0.07)`,
  borderRadius:16,
  boxShadow:'0 2px 20px rgba(0,0,0,0.15)',
};

export default function MyHeroChartApp(){
  useEffect(()=>{
    const lk=document.createElement('link');
    lk.href="https://fonts.googleapis.com/css2?family=Bangers&family=DM+Sans:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&display=swap";
    lk.rel='stylesheet';
    document.head.appendChild(lk);
    return()=>{try{document.head.removeChild(lk);}catch{}};
  },[]);

  // ── State ────────────────────────────────────────────────
  const [screen,     setScreen]    = useState('home');
  const [activeGame, setActiveGame]= useState(null);
  const [heroName,   setHeroName]  = useState('My Hero');
  const [editName,   setEditName]  = useState(false);
  const [streak,     setStreak]    = useState(0);
  const [redeemed,   setRedeemed]  = useState([]);
  const [notes,      setNotes]     = useState([]);
  const [noteInput,  setNoteInput] = useState('');
  const [selPeriod,  setSelPeriod] = useState(null);
  const [rewardMsg,  setRewardMsg] = useState('');
  const [zoneToast,  setZoneToast] = useState(null);
  const [gems,       setGems]        = useState({diamond:1,emerald:3,gold:8});
  const [totalEarned,setTotalEarned] = useState({diamond:1,emerald:3,gold:8});
  const [chartData,  setChartData]   = useState(PERIODS.map(p=>({period:p,zone:null})));

  const addGems   = useCallback((t,a)=>{ setGems(p=>({...p,[t]:p[t]+a})); setTotalEarned(p=>({...p,[t]:p[t]+a})); },[]);
  const spendGems = useCallback((t,a)=>{ setGems(p=>({...p,[t]:Math.max(0,p[t]-a)})); },[]);
  const filled    = chartData.filter(p=>p.zone!==null);
  const avgZone   = filled.length>0?filled.reduce((s,p)=>s+p.zone,0)/filled.length:0;
  const curZone   = ZONES.find(z=>z.id===Math.round(avgZone))||null;
  const allDone   = filled.length===chartData.length;
  const dashUnlocked   = totalEarned.emerald>=DASH_NEED;
  const runnerUnlocked = totalEarned.diamond>=RUN_NEED;

  const showToast=(zone,earned)=>{setZoneToast({zone,earned});setTimeout(()=>setZoneToast(null),2600);};
  const resetChart=()=>{setChartData(PERIODS.map(p=>({period:p,zone:null})));setSelPeriod(null);};

  // ── Zone Toast ──────────────────────────────────────────
  function ZoneToastOverlay(){
    if(!zoneToast) return null;
    const{zone,earned}=zoneToast;
    return(
      <div style={{
        position:'fixed',top:64,left:'50%',transform:'translateX(-50%)',
        zIndex:9999,textAlign:'center',pointerEvents:'none',
        background:zone.color+'ee',
        backdropFilter:'blur(20px)',
        borderRadius:20,padding:'20px 36px',
        border:'1px solid rgba(255,255,255,0.2)',
        boxShadow:`0 20px 60px ${zone.color}55`,
        minWidth:220,
      }}>
        <div style={{fontSize:52,lineHeight:1,marginBottom:6}}>{zone.emoji}</div>
        <div style={{...hd(17,'#fff'),letterSpacing:'0.06em',marginBottom:4}}>{zone.name}</div>
        <div style={{...lbl('rgba(255,255,255,0.8)'),fontSize:10}}>You earned {earned}</div>
      </div>
    );
  }

  // ── Nav Bar ─────────────────────────────────────────────
  function NavBar(){
    const gIcon=dashUnlocked||runnerUnlocked?'🎮':'🔒';
    const navItems=[
      {id:'home',  icon:'🏠',  label:'Home'},
      {id:'chart', icon:'📊',  label:'Chart'},
      {id:'rewards',icon:'🏆', label:'Store'},
      {id:'games', icon:gIcon, label:'Games'},
      {id:'parent',icon:'👪',  label:'Family'},
    ];
    return(
      <nav style={{
        position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',
        width:'100%',maxWidth:680,
        background:'rgba(6,13,38,0.97)',
        backdropFilter:'blur(24px)',
        borderTop:`1px solid ${C.amber}33`,
        display:'flex',justifyContent:'space-around',
        padding:'8px 4px 18px',
        zIndex:1000,
      }}>
        {navItems.map(n=>{
          const on=screen===n.id;
          return(
            <button key={n.id}
              onClick={()=>{setScreen(n.id);if(n.id!=='games')setActiveGame(null);}}
              style={{
                background:'none',border:'none',cursor:'pointer',
                display:'flex',flexDirection:'column',alignItems:'center',gap:3,
                padding:'4px 8px',borderRadius:10,minWidth:52,
                transition:'all 0.2s',
              }}>
              <div style={{
                width:46,height:30,display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:19,borderRadius:10,
                background:on?`${C.amber}15`:'none',
                border:`1px solid ${on?C.amber+'33':'transparent'}`,
                transition:'all 0.2s',
              }}>{n.icon}</div>
              <div style={{
                ...lbl(on?C.amber:'rgba(255,255,255,0.3)'),
                fontSize:8.5,letterSpacing:'0.09em',
                transition:'color 0.2s',
              }}>{n.label}</div>
            </button>
          );
        })}
      </nav>
    );
  }

  // ── HOME ────────────────────────────────────────────────
  function HomeScreen(){
    const pts=filled.reduce((s,p)=>s+(p.zone||0),0);
    const max=chartData.length*5;
    return(
      <div style={{paddingBottom:110,maxWidth:680,margin:'0 auto',width:'100%'}}>

        {/* Brand Header */}
        <header style={{
          padding:'28px 24px 22px',
          background:`linear-gradient(175deg,${C.surface}dd 0%,transparent 100%)`,
          borderBottom:`1px solid ${C.amber}1a`,
          display:'flex',alignItems:'center',gap:16,
        }}>
          <img src={LOGO_URL} alt="My Hero Chart Logo"
            style={{width:56,height:56,objectFit:'contain',flexShrink:0}}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{
              fontFamily:DISPLAY,fontSize:28,color:C.amber,
              letterSpacing:3,lineHeight:1,marginBottom:4,
              textShadow:`0 0 30px ${C.amber}25`,
            }}>MY HERO CHART™</div>
            <div style={{...lbl(C.amberDim),letterSpacing:'0.2em',fontSize:8.5}}>
              RESET · REBUILD · REPEAT
            </div>
          </div>
          <button onClick={()=>setScreen('sets')} style={{
            background:'none',border:`1px solid ${C.border}`,
            borderRadius:10,padding:'7px 12px',cursor:'pointer',
            ...lbl(C.text3),letterSpacing:'0.08em',fontSize:9,
            flexShrink:0,
          }}>Settings</button>
        </header>

        <div style={{padding:'18px 20px 0'}}>

          {/* Hero Card */}
          <div style={{
            ...CARD,padding:'18px 20px',marginBottom:14,
            borderLeft:`3px solid ${curZone?curZone.color:C.surface2}`,
            background:curZone?`linear-gradient(90deg,${curZone.color}14,${C.surface})`:C.surface,
          }}>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <div style={{fontSize:48,flexShrink:0}}>{curZone?curZone.emoji:'🦸'}</div>
              <div style={{flex:1,minWidth:0}}>
                {editName?(
                  <input autoFocus value={heroName}
                    onChange={e=>setHeroName(e.target.value)}
                    onBlur={()=>setEditName(false)}
                    onKeyDown={e=>e.key==='Enter'&&setEditName(false)}
                    style={{
                      fontFamily:HEAD,fontSize:20,fontWeight:700,color:C.amber,
                      background:`${C.amber}0a`,border:`1px solid ${C.amber}33`,
                      borderRadius:8,padding:'3px 12px',width:'90%',outline:'none',
                    }}/>
                ):(
                  <div onClick={()=>setEditName(true)} style={{
                    ...hd(20),cursor:'pointer',display:'flex',alignItems:'center',gap:8,
                    whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',
                  }}>
                    {heroName}
                    <span style={{fontSize:12,opacity:0.3}}>✏</span>
                  </div>
                )}
                <div style={{fontFamily:BODY,fontSize:11,fontWeight:600,marginTop:4,
                  color:curZone?curZone.color:C.text3,lineHeight:1.4}}>
                  {curZone?`${curZone.name} · ${curZone.desc}`:'Begin your day — tap Log Today below'}
                </div>
              </div>
              <div style={{
                textAlign:'center',flexShrink:0,
                background:`${C.amber}0a`,border:`1px solid ${C.amber}1a`,
                borderRadius:12,padding:'10px 14px',
              }}>
                <div style={{...mono(28)}}>{streak}</div>
                <div style={{...lbl(C.amberDim),fontSize:7.5,marginTop:3}}>Streak 🔥</div>
              </div>
            </div>
          </div>

          {/* Today's Chart */}
          <div style={{
            ...CARD,padding:'18px 20px',marginBottom:14,
            ...(allDone?{border:`1px solid ${C.amber}33`,boxShadow:`0 0 28px ${C.amber}0f`}:{}),
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14,gap:10}}>
              <div>
                <div style={{...hd(15,allDone?C.amber:C.text)}}>
                  {allDone?'✦ Wonderful Day':'How was your day?'}
                </div>
                <div style={{...lbl(C.text3),marginTop:4,marginBottom:0,letterSpacing:'0.1em'}}>
                  {filled.length} of {chartData.length} moments · {pts} of {max} pts
                </div>
              </div>
              <button onClick={()=>setScreen('chart')} style={{
                background:allDone?C.amber:'none',
                color:allDone?'#1a0800':C.amber,
                border:`1px solid ${C.amber}44`,
                borderRadius:24,padding:'8px 20px',
                fontFamily:HEAD,fontWeight:700,fontSize:11,
                letterSpacing:'0.08em',textTransform:'uppercase',
                cursor:'pointer',flexShrink:0,whiteSpace:'nowrap',
              }}>{allDone?'Review':'Log Today'}</button>
            </div>
            <div style={{display:'flex',gap:4,marginBottom:12}}>
              {chartData.map((b,i)=>{
                const z=ZONES.find(z=>z.id===b.zone);
                return(
                  <div key={i} onClick={()=>setScreen('chart')} style={{
                    flex:1,height:46,borderRadius:9,cursor:'pointer',
                    background:z?z.color:'rgba(255,255,255,0.03)',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:16,border:`1px solid ${z?z.color+'44':'rgba(255,255,255,0.04)'}`,
                    transition:'all 0.15s',
                  }}>{z?z.emoji:<span style={{color:'rgba(255,255,255,0.07)',fontSize:9}}>○</span>}</div>
                );
              })}
            </div>
            <div style={{height:3,background:'rgba(255,255,255,0.05)',borderRadius:3}}>
              <div style={{
                height:'100%',borderRadius:3,transition:'width 0.5s',
                width:`${max>0?(pts/max)*100:0}%`,
                background:`linear-gradient(90deg,${C.teal},${C.green},${C.amber})`,
              }}/>
            </div>
          </div>

          {/* Gem Wallet */}
          <SL>Gem Wallet</SL>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:16}}>
            {[
              {type:'diamond',emoji:'💎',color:'#60A5FA',label:'Diamonds'},
              {type:'emerald',emoji:'💚',color:'#34D399',label:'Emeralds'},
              {type:'gold',   emoji:'⭐',color:C.amber,  label:'Stars'},
            ].map(g=>(
              <div key={g.type} style={{
                ...CARD,padding:'14px 10px',textAlign:'center',
                borderTop:`2px solid ${g.color}33`,
              }}>
                <div style={{fontSize:24,marginBottom:5}}>{g.emoji}</div>
                <div style={{...mono(28,g.color)}}>{gems[g.type]}</div>
                <div style={{...lbl(C.text3),fontSize:8,marginTop:4}}>{g.label}</div>
              </div>
            ))}
          </div>

          {/* Earn Games */}
          <SL>Your Earned Games</SL>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
            {[
              {key:'dash',  label:'Hero Dash',  emoji:'🏃',need:DASH_NEED, have:totalEarned.emerald,gem:'💚',color:'#FF6347',unlocked:dashUnlocked,  action:()=>{setScreen('games');setActiveGame('dash');}},
              {key:'runner',label:'Hero Runner',emoji:'🎮',need:RUN_NEED,  have:totalEarned.diamond, gem:'💎',color:'#7B2FBE',unlocked:runnerUnlocked,action:()=>{setScreen('games');setActiveGame('runner');}},
            ].map(g=>(
              <div key={g.key} style={{
                ...CARD,
                padding:'14px 16px',
                display:'flex',alignItems:'center',gap:14,
                cursor:g.unlocked?'pointer':'default',
                background:g.unlocked?`linear-gradient(90deg,${g.color}14,${C.surface})`:C.surface,
                border:`1px solid ${g.unlocked?g.color+'2a':C.border}`,
                transition:'all 0.2s',
              }} onClick={g.unlocked?g.action:undefined}>
                <div style={{fontSize:30,flexShrink:0}}>{g.emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                    <div style={{...hd(13,g.unlocked?g.color:C.text2)}}>{g.label}</div>
                    <div style={{...lbl(g.unlocked?C.green:C.text3),fontSize:8.5}}>
                      {g.unlocked?'✦ Unlocked':`${g.gem} ${g.have} / ${g.need}`}
                    </div>
                  </div>
                  <div style={{height:2.5,background:'rgba(255,255,255,0.05)',borderRadius:2}}>
                    <div style={{height:'100%',borderRadius:2,
                      width:`${Math.min(100,(g.have/g.need)*100)}%`,
                      background:g.unlocked?g.color:`${g.color}77`,
                      transition:'width 0.5s'}}/>
                  </div>
                  {!g.unlocked&&<div style={{fontFamily:BODY,fontSize:9,color:C.text3,marginTop:4}}>
                    {g.key==='dash'?'Earn by logging Zone 4 or 5':'Earn by logging Zone 5 — Super Hero'}
                  </div>}
                </div>
                {g.unlocked&&<div style={{fontFamily:HEAD,fontSize:16,color:g.color,flexShrink:0}}>→</div>}
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:4}}>
            {[
              {label:'Reward Store', sub:'Spend your gems',    emoji:'🏆',color:C.teal,   action:()=>setScreen('rewards')},
              {label:'Family Corner',sub:'Parents & teachers', emoji:'👪',color:'#2563EB',action:()=>setScreen('parent')},
            ].map((q,i)=>(
              <button key={i} onClick={q.action} style={{
                background:`${q.color}0f`,border:`1px solid ${q.color}2a`,
                borderRadius:14,padding:'16px 14px',
                cursor:'pointer',textAlign:'left',transition:'all 0.2s',
              }}>
                <div style={{fontSize:24,marginBottom:8}}>{q.emoji}</div>
                <div style={{...hd(13,C.text),marginBottom:3}}>{q.label}</div>
                <div style={{fontFamily:BODY,fontSize:10,color:C.text3,lineHeight:1.4}}>{q.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── CHART ───────────────────────────────────────────────
  function ChartScreen(){
    const logZone=(idx,zId)=>{
      const nd=[...chartData];
      const was=nd[idx].zone;
      nd[idx]={...nd[idx],zone:zId};
      setChartData(nd);
      if(!was){
        const earn=ZONE_GEMS[zId]||{};
        const parts=[];
        Object.entries(earn).forEach(([t,a])=>{addGems(t,a);parts.push(`${GEMEI[t]}${a}`);});
        const z=ZONES.find(z=>z.id===zId);
        if(z) showToast(z,parts.join(' '));
        if(nd.filter(p=>p.zone!==null).length===chartData.length) setStreak(s=>s+1);
      }
      setSelPeriod(null);
    };
    const pts=filled.reduce((s,p)=>s+(p.zone||0),0);
    const max=chartData.length*5;
    return(
      <div style={{padding:'22px 20px 110px',maxWidth:680,margin:'0 auto',width:'100%'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:22}}>
          <div>
            <div style={{...hd(20)}}>{heroName}'s Chart</div>
            <div style={{...lbl(C.text3),marginTop:4}}>Tap each moment to log the zone</div>
          </div>
          <button onClick={()=>setScreen('home')} style={{
            background:'none',border:`1px solid ${C.border}`,borderRadius:10,
            padding:'8px 16px',cursor:'pointer',flexShrink:0,
            ...lbl(C.text3),letterSpacing:'0.08em',marginTop:2,
          }}>← Home</button>
        </div>

        {/* Gem guide */}
        <div style={{...CARD,padding:'14px 16px',marginBottom:14}}>
          <SL>Gems you earn per moment</SL>
          <div style={{display:'flex',gap:4}}>
            {ZONES.map(z=>{
              const e=ZONE_GEMS[z.id]||{};
              return(
                <div key={z.id} style={{flex:1,background:z.color,borderRadius:10,padding:'8px 3px',textAlign:'center'}}>
                  <div style={{fontSize:17,marginBottom:2}}>{z.emoji}</div>
                  <div style={{fontFamily:HEAD,fontSize:6.5,color:'rgba(255,255,255,0.9)',fontWeight:700,letterSpacing:'0.03em',lineHeight:1.2}}>
                    {z.name.replace('IN ','').split(' ')[0]}
                  </div>
                  <div style={{fontFamily:HEAD,fontSize:9,color:'rgba(255,255,255,0.85)',marginTop:2,letterSpacing:'0.02em'}}>
                    {e.diamond?'💎':''}{e.emerald?'💚':''}{e.gold?`⭐${e.gold}`:''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score */}
        <div style={{...CARD,padding:'14px 18px',marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <SL style={{marginBottom:0}}>Today's Score</SL>
            <div style={{...mono(20)}}>{pts}<span style={{fontFamily:BODY,fontSize:12,color:C.text3,fontWeight:400}}> / {max}</span></div>
          </div>
          <div style={{height:5,background:'rgba(255,255,255,0.05)',borderRadius:5,overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:5,transition:'width 0.5s',
              width:`${max>0?(pts/max)*100:0}%`,
              background:`linear-gradient(90deg,${C.teal},${C.green},${C.amber})`}}/>
          </div>
          {allDone&&(
            <div style={{...hd(12,C.amber),textAlign:'center',marginTop:10,letterSpacing:'0.12em'}}>
              ✦ Chart Complete · {streak} Day Streak 🔥
            </div>
          )}
        </div>

        {/* Period blocks */}
        <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:18}}>
          {chartData.map((block,i)=>{
            const z=ZONES.find(z=>z.id===block.zone);
            const sel=selPeriod===i;
            return(
              <div key={i}>
                <div onClick={()=>setSelPeriod(sel?null:i)} style={{
                  background:z?`linear-gradient(90deg,${z.color}16,${C.surface})`:C.surface,
                  borderRadius:sel?'14px 14px 0 0':14,
                  border:`1px solid ${z?z.color+'2a':C.border}`,
                  borderLeft:`3px solid ${z?z.color:C.surface2}`,
                  padding:'13px 16px',
                  display:'flex',alignItems:'center',gap:12,
                  cursor:'pointer',transition:'all 0.15s',
                  minHeight:60,
                }}>
                  <div style={{
                    width:38,height:38,borderRadius:10,flexShrink:0,
                    background:z?z.color:'rgba(255,255,255,0.04)',
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,
                  }}>{z?z.emoji:'○'}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{...hd(13,z?z.color:C.text)}}>{block.period}</div>
                    <div style={{fontFamily:BODY,fontSize:10,fontWeight:600,marginTop:2,
                      color:z?`${z.color}aa`:C.text3}}>
                      {z?z.name:'How did this moment go?'}
                    </div>
                  </div>
                  {z&&(
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{...mono(16)}}>+{z.pts}</div>
                      <div style={{fontFamily:BODY,fontSize:9,color:C.amberDim,marginTop:2}}>
                        {(ZONE_GEMS[z.id]?.diamond?'💎':'')+(ZONE_GEMS[z.id]?.emerald?'💚':'')+(ZONE_GEMS[z.id]?.gold?'⭐':'')}
                      </div>
                    </div>
                  )}
                  <div style={{...lbl(C.text3),fontSize:10,flexShrink:0}}>{sel?'▲':'▼'}</div>
                </div>
                {sel&&(
                  <div style={{
                    background:C.bgDeep,borderRadius:'0 0 14px 14px',
                    padding:'10px 6px',display:'flex',gap:4,
                    border:`1px solid ${C.border}`,borderTop:'none',
                  }}>
                    {ZONES.map(z=>(
                      <button key={z.id} onClick={()=>logZone(i,z.id)} style={{
                        flex:1,background:z.color,
                        border:block.zone===z.id?`2px solid ${C.amber}`:'2px solid transparent',
                        borderRadius:10,padding:'10px 2px',cursor:'pointer',
                        display:'flex',flexDirection:'column',alignItems:'center',gap:2,
                        minHeight:54,
                        boxShadow:block.zone===z.id?`0 0 14px ${C.amber}55`:'none',
                      }}>
                        <span style={{fontSize:22}}>{z.emoji}</span>
                        <span style={{fontFamily:HEAD,fontSize:6.5,color:'#fff',fontWeight:700,letterSpacing:'0.04em'}}>
                          {z.name.replace('IN ','').split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={resetChart} style={{
          width:'100%',background:'none',border:`1px dashed ${C.border}`,
          borderRadius:12,padding:'13px',cursor:'pointer',
          ...lbl(C.text3),letterSpacing:'0.1em',
        }}>↺ Start Fresh</button>
      </div>
    );
  }

  // ── REWARDS ─────────────────────────────────────────────
  function RewardsScreen(){
    const REWARDS=[
      {id:1, name:'Sticker Pick',    emoji:'🌟',cost:{gold:10},   desc:'Choose any sticker you want'},
      {id:2, name:'Extra Screen Time',emoji:'📱',cost:{emerald:3},desc:'30 extra minutes of screen time'},
      {id:3, name:'Movie Night Pick', emoji:'🎬',cost:{emerald:5},desc:'You choose the family movie'},
      {id:4, name:'No Chores Pass',   emoji:'🏠',cost:{diamond:1},desc:'Skip your chores for one day'},
      {id:5, name:'Special Outing',   emoji:'🌟',cost:{diamond:2},desc:'A special trip just for you'},
      {id:6, name:'Pick the Dinner',  emoji:'🍽️',cost:{gold:5},  desc:'You choose what the family eats'},
      {id:7, name:'Choose Family Game',emoji:'🎲',cost:{emerald:2},desc:'Pick the family game night game'},
      {id:8, name:'Trophy Badge',     emoji:'🏆',cost:{diamond:3},desc:'A permanent hero award'},
      {id:9, name:'Late Bedtime',     emoji:'🌙',cost:{emerald:4},desc:'Stay up one extra hour'},
      {id:10,name:'Hero Certificate', emoji:'📜',cost:{diamond:1},desc:'Your official hero certificate'},
    ];
    const canAfford=c=>Object.entries(c).every(([t,a])=>gems[t]>=a);
    const redeem=r=>{
      if(!canAfford(r.cost)||redeemed.includes(r.id)) return;
      Object.entries(r.cost).forEach(([t,a])=>spendGems(t,a));
      setRedeemed(p=>[...p,r.id]);
      setRewardMsg(`${r.emoji} ${r.name} — you earned it!`);
      setTimeout(()=>setRewardMsg(''),4000);
    };
    return(
      <div style={{padding:'22px 20px 110px',maxWidth:680,margin:'0 auto',width:'100%'}}>
        <div style={{...hd(20),marginBottom:4}}>Reward Store</div>
        <div style={{fontFamily:BODY,fontSize:11,color:C.text3,marginBottom:18,lineHeight:1.5}}>
          Earn gems by logging great moments · Spend them on real rewards
        </div>
        {rewardMsg&&(
          <div style={{
            background:`${C.teal}12`,border:`1px solid ${C.teal}33`,
            borderRadius:12,padding:'13px 16px',marginBottom:14,
            fontFamily:HEAD,fontSize:13,color:C.teal,textAlign:'center',letterSpacing:'0.02em',
          }}>{rewardMsg}</div>
        )}
        {/* Wallet */}
        <div style={{...CARD,padding:'16px 18px',marginBottom:16,display:'flex',justifyContent:'space-around'}}>
          {[{t:'diamond',e:'💎',c:'#60A5FA'},{t:'emerald',e:'💚',c:'#34D399'},{t:'gold',e:'⭐',c:C.amber}].map(g=>(
            <div key={g.t} style={{textAlign:'center'}}>
              <div style={{fontSize:24,marginBottom:4}}>{g.e}</div>
              <div style={{...mono(26,g.c)}}>{gems[g.t]}</div>
              <div style={{...lbl(C.text3),fontSize:8,marginTop:4}}>{g.t}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {REWARDS.map(r=>{
            const can=canAfford(r.cost),done=redeemed.includes(r.id);
            const[ct,ca]=Object.entries(r.cost)[0];
            return(
              <div key={r.id} style={{
                ...CARD,padding:'14px 12px',
                background:done?`${C.teal}08`:C.surface,
                border:`1px solid ${done?C.teal+'2a':can?C.amber+'1a':C.border}`,
                opacity:done?0.75:1,
              }}>
                <div style={{fontSize:24,marginBottom:6}}>{done?'✅':r.emoji}</div>
                <div style={{...hd(12,done?C.teal:C.text),marginBottom:3}}>{r.name}</div>
                <div style={{fontFamily:BODY,fontSize:10,color:C.text3,marginBottom:10,lineHeight:1.4}}>{r.desc}</div>
                <button onClick={()=>redeem(r)} disabled={!can||done} style={{
                  width:'100%',
                  background:done?'none':can?C.amber:'rgba(255,255,255,0.04)',
                  border:`1px solid ${done?C.teal+'2a':C.border}`,
                  borderRadius:8,padding:'8px 4px',
                  fontFamily:HEAD,fontSize:10,fontWeight:700,
                  letterSpacing:'0.07em',textTransform:'uppercase',
                  color:done?C.teal:can?'#1a0800':C.text3,
                  cursor:can&&!done?'pointer':'not-allowed',
                  minHeight:34,
                }}>
                  {done?'Redeemed':`${GEMEI[ct]} ${ca} ${ct}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── GAMES ───────────────────────────────────────────────
  function GamesMenu(){
    return(
      <div style={{padding:'22px 20px 110px',maxWidth:680,margin:'0 auto',width:'100%'}}>
        <div style={{...hd(20),marginBottom:4}}>Hero Games</div>
        <div style={{fontFamily:BODY,fontSize:11,color:C.text3,marginBottom:22,lineHeight:1.5}}>
          Log great moments · Earn gems · Unlock your games
        </div>
        {[
          {key:'dash',  label:'Hero Dash',  emoji:'🏃',levels:'3 Levels',
           desc:'Pac-Man maze runner',sub:'Collect gems · Stomp villains · Beat the maze',
           color:'#FF6347',dark:'#7f1d1d',need:DASH_NEED,have:totalEarned.emerald,gem:'💚',gemName:'Emeralds',
           tip:'Log Zone 4 or Zone 5 to earn 💚 Emeralds',
           unlocked:dashUnlocked,action:()=>setActiveGame('dash')},
          {key:'runner',label:'Hero Runner',emoji:'🎮',levels:'10 Levels',
           desc:'Mario-style platformer',sub:'Pipes · Platforms · Question blocks · Boss worlds',
           color:'#7B2FBE',dark:'#3b0764',need:RUN_NEED,have:totalEarned.diamond,gem:'💎',gemName:'Diamonds',
           tip:'Only Zone 5 — Super Hero — earns 💎 Diamonds',
           unlocked:runnerUnlocked,action:()=>setActiveGame('runner')},
        ].map(g=>(
          <div key={g.key} style={{borderRadius:18,marginBottom:14,overflow:'hidden',
            border:`1px solid ${g.unlocked?g.color+'33':C.border}`,
            boxShadow:g.unlocked?`0 8px 36px ${g.color}20`:'none'}}>
            <div style={{
              background:g.unlocked?`linear-gradient(135deg,${g.color},${g.dark})`:C.surface,
              padding:'20px',
            }}>
              <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                <div style={{fontSize:46,flexShrink:0}}>{g.emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:5,flexWrap:'wrap',gap:8}}>
                    <div style={{fontFamily:DISPLAY,fontSize:22,letterSpacing:2,lineHeight:1,
                      color:g.unlocked?'#fff':C.amber}}>{g.label.toUpperCase()}</div>
                    {g.unlocked&&<div style={{...lbl('rgba(255,255,255,0.85)'),fontSize:8,
                      background:'rgba(255,255,255,0.18)',borderRadius:6,padding:'2px 8px'}}>Earned ✦</div>}
                    <div style={{...lbl(g.unlocked?'rgba(255,255,255,0.5)':C.text3),fontSize:8,marginLeft:'auto'}}>{g.levels}</div>
                  </div>
                  <div style={{fontFamily:BODY,fontSize:11,fontWeight:600,
                    color:g.unlocked?'rgba(255,255,255,0.85)':C.text2}}>{g.desc}</div>
                  <div style={{fontFamily:BODY,fontSize:10,
                    color:g.unlocked?'rgba(255,255,255,0.5)':C.text3,marginTop:2}}>{g.sub}</div>
                </div>
              </div>
            </div>
            <div style={{background:C.surface,padding:'14px 20px'}}>
              {!g.unlocked&&(
                <div style={{marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                    <div style={{...lbl(C.text3),fontSize:8.5}}>{g.gem} {g.have} of {g.need} {g.gemName}</div>
                    <div style={{...lbl(C.amber),fontSize:8.5}}>{g.need-g.have} to go</div>
                  </div>
                  <div style={{height:3,background:'rgba(255,255,255,0.05)',borderRadius:3,marginBottom:6}}>
                    <div style={{height:'100%',width:`${Math.min(100,(g.have/g.need)*100)}%`,
                      background:`linear-gradient(90deg,${g.color}77,${g.color})`,borderRadius:3,transition:'width 0.5s'}}/>
                  </div>
                  <div style={{fontFamily:BODY,fontSize:10,color:C.text3}}>{g.tip}</div>
                </div>
              )}
              {g.unlocked?(
                <button onClick={g.action} style={{
                  width:'100%',background:'none',border:`1px solid ${g.color}55`,
                  borderRadius:10,padding:'12px',minHeight:44,
                  fontFamily:HEAD,fontSize:12,fontWeight:700,color:g.color,
                  letterSpacing:'0.07em',textTransform:'uppercase',cursor:'pointer',
                }}>▶ Play {g.label}</button>
              ):(
                <button onClick={()=>setScreen('chart')} style={{
                  width:'100%',background:'none',border:`1px dashed ${C.border}`,
                  borderRadius:10,padding:'11px',minHeight:44,
                  fontFamily:HEAD,fontSize:10,fontWeight:600,color:C.text3,
                  letterSpacing:'0.07em',textTransform:'uppercase',cursor:'pointer',
                }}>Log moments to earn {g.gem}</button>
              )}
            </div>
          </div>
        ))}
        {/* Guide */}
        <div style={{...CARD,padding:'16px 18px'}}>
          <SL>How to earn gems</SL>
          {ZONES.slice().reverse().map(z=>{
            const e=ZONE_GEMS[z.id]||{};
            return(
              <div key={z.id} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,paddingBottom:8,
                borderBottom:`1px solid ${C.border}`,':last-child':{borderBottom:'none'}}}>
                <div style={{width:28,height:28,background:z.color,borderRadius:7,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>{z.emoji}</div>
                <div style={{fontFamily:BODY,fontSize:11,fontWeight:600,color:C.text2,flex:1}}>{z.name}</div>
                <div style={{fontFamily:HEAD,fontSize:11,fontWeight:700,color:C.amber}}>
                  {e.diamond?'💎 ':''}{e.emerald?'💚 ':''}{e.gold?`⭐ ${e.gold}`:''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── FAMILY CORNER ───────────────────────────────────────
  function ParentCorner(){
    const tips=[
      {emoji:'🦸',title:'Be the Hero Coach',body:'Celebrate every zone — even Reset and Rebuild. Growth lives in the attempt, not just the achievement.'},
      {emoji:'🔄',title:'Reset Is a Strength',body:'"Heroes reset and come back stronger." Let this become your family\'s phrase for resilience.'},
      {emoji:'🏆',title:'Let Them Earn It',body:'The earning process is the lesson. Anticipating a game reward builds more behavioral motivation than the game itself.'},
      {emoji:'💎',title:'Extend the Economy',body:'Stars for chores, Emeralds for homework done well, Diamonds for acts of kindness. Bring the system to life at home.'},
      {emoji:'📊',title:'Review Together',body:'Make the nightly chart review a celebration ritual — never a correction session. Ask: what was your best moment today?'},
      {emoji:'❤️',title:'Unconditional Hero Love',body:'"No matter what zone, you are always my hero." Say it every night, without conditions.'},
      {emoji:'🎮',title:'Games as Prizes',body:'Hero Dash and Hero Runner are intentionally designed as earned rewards. The anticipation is part of the behavioral system.'},
      {emoji:'🤝',title:'Consistent Messaging',body:'The more consistent the language and expectations are at home, the more powerful the system becomes over time.'},
    ];
    return(
      <div style={{padding:'22px 20px 110px',maxWidth:680,margin:'0 auto',width:'100%'}}>
        <div style={{...hd(20),marginBottom:4}}>Family Corner</div>
        <div style={{fontFamily:BODY,fontSize:11,color:C.text3,marginBottom:20,lineHeight:1.5}}>
          For parents, guardians & caregivers · PreK–3rd grade
        </div>

        {/* Booklet */}
        <div style={{
          background:`${C.amber}08`,border:`1px solid ${C.amber}2a`,
          borderRadius:14,padding:'16px',marginBottom:18,
          display:'flex',alignItems:'center',gap:14,
        }}>
          <img src={LOGO_URL} alt="" style={{width:44,height:44,objectFit:'contain',flexShrink:0}}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{...hd(13,C.amber),letterSpacing:'0.04em'}}>My Hero Chart™ Booklet</div>
            <div style={{fontFamily:BODY,fontSize:10,color:C.text3,marginTop:3,lineHeight:1.4}}>
              The complete guide to the behavior system
            </div>
          </div>
          <a href={BOOKLET_URL} target="_blank" rel="noreferrer" style={{
            background:C.amber,color:'#1a0800',border:'none',borderRadius:10,
            padding:'9px 18px',fontFamily:HEAD,fontSize:10,fontWeight:700,
            letterSpacing:'0.09em',textTransform:'uppercase',
            cursor:'pointer',textDecoration:'none',whiteSpace:'nowrap',flexShrink:0,
            minHeight:36,display:'flex',alignItems:'center',
          }}>Open →</a>
        </div>

        {/* Today's report */}
        <SL>Today's Report</SL>
        <div style={{...CARD,padding:'18px',marginBottom:18}}>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
            <div style={{fontSize:42,flexShrink:0}}>{curZone?curZone.emoji:'🦸'}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{...hd(18,C.amber)}}>{heroName}</div>
              <div style={{fontFamily:BODY,fontSize:11,color:curZone?curZone.color:C.text3,fontWeight:600,marginTop:3}}>
                {curZone?`${curZone.name} · ${curZone.desc}`:'No moments logged yet today'}
              </div>
            </div>
            <div style={{textAlign:'center',flexShrink:0}}>
              <div style={{...mono(22)}}>{streak}</div>
              <div style={{...lbl(C.text3),fontSize:8,marginTop:3}}>Day Streak 🔥</div>
            </div>
          </div>
          <GoldRule/>
          <div style={{display:'flex',justifyContent:'space-around',marginBottom:14}}>
            {[{e:'💎',t:'diamond',c:'#60A5FA'},{e:'💚',t:'emerald',c:'#34D399'},{e:'⭐',t:'gold',c:C.amber}].map(g=>(
              <div key={g.t} style={{textAlign:'center'}}>
                <div style={{fontSize:22,marginBottom:4}}>{g.e}</div>
                <div style={{...mono(22,g.c)}}>{gems[g.t]}</div>
                <div style={{...lbl(C.text3),fontSize:7.5,marginTop:3}}>{g.t}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:3,marginBottom:14}}>
            {chartData.map((b,i)=>{
              const z=ZONES.find(z=>z.id===b.zone);
              return(<div key={i} style={{flex:1,height:26,borderRadius:5,
                background:z?z.color:'rgba(255,255,255,0.04)',
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,
              }}>{z?z.emoji:''}</div>);
            })}
          </div>
          <GoldRule/>
          <div style={{display:'flex',justifyContent:'space-around'}}>
            {[{l:'Hero Dash',u:dashUnlocked,p:totalEarned.emerald,n:DASH_NEED,g:'💚'},
              {l:'Hero Runner',u:runnerUnlocked,p:totalEarned.diamond,n:RUN_NEED,g:'💎'}].map((x,i)=>(
              <div key={i} style={{textAlign:'center'}}>
                <div style={{...lbl(C.text3),fontSize:8,marginBottom:4}}>{x.l}</div>
                <div style={{fontFamily:HEAD,fontSize:11,fontWeight:700,color:x.u?C.green:C.amber}}>
                  {x.u?'✦ Earned':`${x.g} ${x.p}/${x.n}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <SL>Progress Notes</SL>
        <div style={{...CARD,padding:'14px',marginBottom:18}}>
          <div style={{display:'flex',gap:8,marginBottom:10}}>
            <input value={noteInput} onChange={e=>setNoteInput(e.target.value)}
              placeholder="Add a note about today..."
              style={{flex:1,background:'rgba(255,255,255,0.04)',border:`1px solid ${C.border}`,
                borderRadius:8,padding:'10px 12px',fontFamily:BODY,fontSize:12,outline:'none',
                color:C.text,minHeight:40,}}
              onKeyDown={e=>{if(e.key==='Enter'&&noteInput.trim()){
                setNotes(p=>[{text:noteInput.trim(),time:new Date().toLocaleTimeString()},...p]);
                setNoteInput('');
              }}}/>
            <button onClick={()=>{if(noteInput.trim()){
              setNotes(p=>[{text:noteInput.trim(),time:new Date().toLocaleTimeString()},...p]);
              setNoteInput('');}
            }} style={{
              background:C.amber,border:'none',borderRadius:8,padding:'10px 18px',
              fontFamily:HEAD,fontSize:10,fontWeight:700,color:'#1a0800',cursor:'pointer',
              letterSpacing:'0.08em',textTransform:'uppercase',flexShrink:0,minHeight:40,
            }}>Add</button>
          </div>
          {notes.length===0
            ?<div style={{fontFamily:BODY,fontSize:11,color:C.text3,textAlign:'center',padding:'8px 0'}}>No notes yet</div>
            :notes.map((n,i)=>(
              <div key={i} style={{
                background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'9px 12px',marginBottom:5,
                borderLeft:`2px solid ${C.amberDim}`,display:'flex',justifyContent:'space-between',alignItems:'flex-start',
              }}>
                <div style={{fontFamily:BODY,fontSize:11,color:C.text,lineHeight:1.4}}>{n.text}</div>
                <div style={{fontFamily:BODY,fontSize:9,color:C.text3,flexShrink:0,marginLeft:10,marginTop:1}}>{n.time}</div>
              </div>
            ))
          }
        </div>

        {/* Tips */}
        <SL>Coaching Tips</SL>
        <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:24}}>
          {tips.map((tip,i)=>(
            <div key={i} style={{...CARD,padding:'14px 16px',display:'flex',gap:12,alignItems:'flex-start'}}>
              <div style={{fontSize:20,flexShrink:0,marginTop:1}}>{tip.emoji}</div>
              <div>
                <div style={{...hd(12,C.amber),letterSpacing:'0.03em',marginBottom:4}}>{tip.title}</div>
                <div style={{fontFamily:BODY,fontSize:11,color:C.text2,lineHeight:1.65}}>{tip.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          textAlign:'center',padding:'28px 20px',
          background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,
        }}>
          <img src={LOGO_URL} alt="My Hero Chart Logo"
            style={{width:60,height:60,objectFit:'contain',marginBottom:14}}/>
          <div style={{
            fontFamily:DISPLAY,fontSize:22,color:C.amber,
            letterSpacing:3,marginBottom:6,
          }}>MY HERO CHART™</div>
          <GoldRule/>
          <div style={{fontFamily:BODY,fontSize:10,color:C.text3,marginBottom:2}}>
            Behavioral support for PreK–3rd grade
          </div>
          <div style={{fontFamily:BODY,fontSize:10,color:C.text3,marginBottom:2}}>
            myherochart@gmail.com · New Orleans, LA
          </div>
          <div style={{...lbl(C.amberDim),letterSpacing:'0.2em',fontSize:8.5,marginTop:10}}>
            Reset · Rebuild · Repeat
          </div>
          <GoldRule/>
          <div style={{fontFamily:HEAD,fontSize:11,fontWeight:700,color:C.text2,marginBottom:2,letterSpacing:'0.03em'}}>
            {CREATOR_NAME}
          </div>
          <div style={{fontFamily:BODY,fontSize:10,color:C.text3,fontStyle:'italic'}}>
            {CREDENTIALS}
          </div>
          {BOOKLET_URL&&(
            <a href={BOOKLET_URL} target="_blank" rel="noreferrer" style={{
              display:'inline-block',marginTop:14,
              fontFamily:HEAD,fontSize:10,fontWeight:700,color:C.amber,
              letterSpacing:'0.1em',textTransform:'uppercase',
              textDecoration:'none',borderBottom:`1px solid ${C.amber}33`,paddingBottom:2,
            }}>View Booklet →</a>
          )}
        </div>
      </div>
    );
  }

  // ── SHARE ───────────────────────────────────────────────
  function ShareScreen(){
    const pts=filled.reduce((s,p)=>s+(p.zone||0),0);
    const report=`My Hero Chart™ — Daily Report\n\n${heroName}\n${new Date().toLocaleDateString()}\nStreak: ${streak} days 🔥\n\nMoments Logged: ${filled.length} of ${chartData.length}\nHero Score: ${pts} of ${chartData.length*5} pts\nCurrent Zone: ${curZone?curZone.name:'Not started'}\n\nGem Wallet\n💎 ${gems.diamond} Diamonds\n💚 ${gems.emerald} Emeralds\n⭐ ${gems.gold} Stars\n\nHero Dash — ${dashUnlocked?'✓ Earned':'In progress'}\nHero Runner — ${runnerUnlocked?'✓ Earned':'In progress'}\n\nReset · Rebuild · Repeat\n— My Hero Chart™\n   ${CREATOR_NAME}, ${CREDENTIALS}`;
    return(
      <div style={{padding:'22px 20px 110px',maxWidth:680,margin:'0 auto',width:'100%'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
          <div style={{...hd(20)}}>Today's Summary</div>
          <button onClick={()=>setScreen('home')} style={{
            background:'none',border:`1px solid ${C.border}`,borderRadius:10,
            padding:'8px 16px',cursor:'pointer',...lbl(C.text3),
          }}>← Home</button>
        </div>
        <div style={{...CARD,padding:'20px',marginBottom:12}}>
          <pre style={{fontFamily:BODY,fontSize:11,color:C.text,whiteSpace:'pre-wrap',lineHeight:1.9,margin:0}}>{report}</pre>
        </div>
        <button onClick={()=>navigator.clipboard?.writeText(report)} style={{
          display:'block',width:'100%',padding:'14px',
          fontFamily:HEAD,fontSize:11,fontWeight:700,
          letterSpacing:'0.1em',textTransform:'uppercase',
          textAlign:'center',cursor:'pointer',
          border:`1px solid ${C.amber}33`,borderRadius:12,
          background:'none',color:C.amber,minHeight:46,
        }}>Copy Report</button>
      </div>
    );
  }

  // ── SETTINGS ────────────────────────────────────────────
  function SettingsScreen(){
    return(
      <div style={{padding:'22px 20px 110px',maxWidth:680,margin:'0 auto',width:'100%'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
          <div style={{...hd(20)}}>Settings</div>
          <button onClick={()=>setScreen('home')} style={{
            background:'none',border:`1px solid ${C.border}`,borderRadius:10,
            padding:'8px 16px',cursor:'pointer',...lbl(C.text3),
          }}>← Home</button>
        </div>

        <SL>Hero Name</SL>
        <input value={heroName} onChange={e=>setHeroName(e.target.value)}
          style={{
            background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,
            padding:'13px 16px',color:C.text,fontFamily:HEAD,fontSize:15,fontWeight:600,
            width:'100%',outline:'none',marginBottom:22,boxSizing:'border-box',
            letterSpacing:'0.02em',
          }}/>

        <SL>Game Unlock Progress</SL>
        <div style={{...CARD,padding:'16px',marginBottom:22}}>
          {[{l:'Hero Dash',u:dashUnlocked,p:totalEarned.emerald,n:DASH_NEED,g:'💚'},
            {l:'Hero Runner',u:runnerUnlocked,p:totalEarned.diamond,n:RUN_NEED,g:'💎'}].map((x,i)=>(
            <div key={i} style={{
              display:'flex',justifyContent:'space-between',alignItems:'center',
              paddingBottom:i<1?12:0,marginBottom:i<1?12:0,
              borderBottom:i<1?`1px solid ${C.border}`:'none',
            }}>
              <div style={{fontFamily:BODY,fontSize:12,color:C.text2}}>{x.l} · {x.n}{x.g} needed</div>
              <div style={{fontFamily:HEAD,fontSize:12,fontWeight:700,color:x.u?C.green:C.amber}}>
                {x.u?'✦ Unlocked':`${x.p} / ${x.n}`}
              </div>
            </div>
          ))}
        </div>

        <SL>Booklet</SL>
        <a href={BOOKLET_URL} target="_blank" rel="noreferrer" style={{
          display:'flex',alignItems:'center',gap:12,
          background:`${C.amber}08`,border:`1px solid ${C.amber}2a`,
          borderRadius:12,padding:'14px 16px',textDecoration:'none',marginBottom:22,
        }}>
          <img src={LOGO_URL} alt="" style={{width:36,height:36,objectFit:'contain',flexShrink:0}}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{...hd(12,C.amber)}}>My Hero Chart™ Booklet</div>
            <div style={{fontFamily:BODY,fontSize:10,color:C.text3,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {BOOKLET_URL}
            </div>
          </div>
          <div style={{...lbl(C.amber),fontSize:9,flexShrink:0}}>Open →</div>
        </a>

        <SL>About</SL>
        <div style={{...CARD,padding:'16px',marginBottom:22,textAlign:'center'}}>
          <img src={LOGO_URL} alt="" style={{width:40,height:40,objectFit:'contain',marginBottom:10}}/>
          <div style={{fontFamily:HEAD,fontSize:13,fontWeight:700,color:C.text,marginBottom:2}}>{CREATOR_NAME}</div>
          <div style={{fontFamily:BODY,fontSize:11,color:C.text3,fontStyle:'italic',marginBottom:10}}>{CREDENTIALS}</div>
          <div style={{...lbl(C.amberDim),fontSize:8,letterSpacing:'0.15em'}}>My Hero Chart™ · New Orleans, LA</div>
        </div>

        <button onClick={()=>{
          const ok=(()=>{try{return window.confirm('Reset all data?');}catch{return true;}})();
          if(ok){
            setGems({diamond:0,emerald:0,gold:0});
            setTotalEarned({diamond:0,emerald:0,gold:0});
            setRedeemed([]);setNotes([]);setStreak(0);
            setChartData(PERIODS.map(p=>({period:p,zone:null})));
          }
        }} style={{
          width:'100%',background:'none',border:`1px dashed rgba(234,138,138,0.3)`,
          borderRadius:12,padding:'13px',cursor:'pointer',
          ...lbl(C.red),letterSpacing:'0.1em',
        }}>Reset All Data</button>
      </div>
    );
  }

  // ── RENDER ──────────────────────────────────────────────
  return(
    <div style={{
      maxWidth:680,margin:'0 auto',minHeight:'100vh',width:'100%',
      background:`radial-gradient(ellipse at 40% 0%,${C.bgTop} 0%,${C.bg} 55%,${C.bgDeep} 100%)`,
      position:'relative',overflowX:'hidden',fontFamily:BODY,color:C.text,
    }}>
      <ZoneToastOverlay/>
      {screen==='home'    && <HomeScreen/>}
      {screen==='chart'   && <ChartScreen/>}
      {screen==='rewards' && <RewardsScreen/>}
      {screen==='games'   && !activeGame && <GamesMenu/>}
      {screen==='games'   && activeGame==='dash'   && <HeroDashGame   addGems={addGems} onClose={()=>setActiveGame(null)}/>}
      {screen==='games'   && activeGame==='runner' && <HeroRunnerGame  addGems={addGems} onClose={()=>setActiveGame(null)}/>}
      {screen==='parent'  && <ParentCorner/>}
      {screen==='share'   && <ShareScreen/>}
      {screen==='sets'    && <SettingsScreen/>}
      <NavBar/>
    </div>
  );
}
