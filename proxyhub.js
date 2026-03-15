const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

// ─── Game: Snake ─────────────────────────────────────────────────────────────
const GAME_SNAKE = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#0f0f23;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:monospace;color:#fff;user-select:none;}
h2{margin-bottom:10px;color:#4ade80;font-size:20px;}
canvas{border:2px solid #4ade80;box-shadow:0 0 20px rgba(74,222,128,0.3);}
#info{margin-top:10px;font-size:13px;color:#94a3b8;}
</style></head><body><h2>🐍 Snake</h2>
<canvas id="c" width="400" height="400"></canvas>
<div id="info">Arrow keys to move &bull; SPACE to restart</div>
<script>
const c=document.getElementById('c'),ctx=c.getContext('2d'),G=20,W=c.width/G,H=c.height/G;
let s=[{x:10,y:10}],d={x:1,y:0},nd={x:1,y:0},f,sc=0,go=false,iv;
function rf(){return{x:Math.floor(Math.random()*W),y:Math.floor(Math.random()*H)};}
f=rf();
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowUp'&&d.y===0){nd={x:0,y:-1};e.preventDefault();}
  else if(e.key==='ArrowDown'&&d.y===0){nd={x:0,y:1};e.preventDefault();}
  else if(e.key==='ArrowLeft'&&d.x===0){nd={x:-1,y:0};e.preventDefault();}
  else if(e.key==='ArrowRight'&&d.x===0){nd={x:1,y:0};e.preventDefault();}
  else if(e.key===' '){if(go)restart();e.preventDefault();}
});
function restart(){s=[{x:10,y:10}];d={x:1,y:0};nd={x:1,y:0};sc=0;go=false;f=rf();clearInterval(iv);iv=setInterval(tick,130);}
function tick(){
  d={...nd};
  const h={x:s[0].x+d.x,y:s[0].y+d.y};
  if(h.x<0||h.x>=W||h.y<0||h.y>=H||s.some(p=>p.x===h.x&&p.y===h.y)){go=true;draw();clearInterval(iv);return;}
  s.unshift(h);
  if(h.x===f.x&&h.y===f.y){sc++;f=rf();}else s.pop();
  draw();
}
function draw(){
  ctx.fillStyle='#0f0f23';ctx.fillRect(0,0,c.width,c.height);
  ctx.strokeStyle='rgba(255,255,255,0.03)';
  for(let i=0;i<W;i++){ctx.beginPath();ctx.moveTo(i*G,0);ctx.lineTo(i*G,c.height);ctx.stroke();}
  for(let i=0;i<H;i++){ctx.beginPath();ctx.moveTo(0,i*G);ctx.lineTo(c.width,i*G);ctx.stroke();}
  ctx.fillStyle='#f87171';ctx.shadowColor='#f87171';ctx.shadowBlur=10;
  ctx.fillRect(f.x*G+2,f.y*G+2,G-4,G-4);ctx.shadowBlur=0;
  s.forEach((p,i)=>{
    ctx.fillStyle=i===0?'#4ade80':'#22c55e';
    ctx.shadowColor=i===0?'#4ade80':'transparent';ctx.shadowBlur=i===0?8:0;
    ctx.fillRect(p.x*G+1,p.y*G+1,G-2,G-2);
  });ctx.shadowBlur=0;
  ctx.fillStyle='#94a3b8';ctx.font='14px monospace';ctx.textAlign='left';ctx.fillText('Score: '+sc,8,18);
  if(go){
    ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle='#f87171';ctx.font='bold 32px monospace';ctx.textAlign='center';ctx.fillText('GAME OVER',c.width/2,c.height/2-20);
    ctx.fillStyle='#94a3b8';ctx.font='16px monospace';ctx.fillText('Score: '+sc,c.width/2,c.height/2+15);
    ctx.fillText('SPACE to restart',c.width/2,c.height/2+45);
  }
}
draw();iv=setInterval(tick,130);
</script></body></html>`;

// ─── Game: Pong ───────────────────────────────────────────────────────────────
const GAME_PONG = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#0f0f23;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:monospace;color:#fff;user-select:none;}
h2{margin-bottom:10px;color:#60a5fa;font-size:20px;}
canvas{border:2px solid #60a5fa;box-shadow:0 0 20px rgba(96,165,250,0.3);}
#info{margin-top:10px;font-size:13px;color:#94a3b8;}
</style></head><body><h2>🏓 Pong</h2>
<canvas id="c" width="600" height="400"></canvas>
<div id="info">Mouse or W/S keys &bull; SPACE to launch</div>
<script>
const c=document.getElementById('c'),ctx=c.getContext('2d');
const PW=10,PH=80,BR=8,SPD=4;
let p1={x:10,y:c.height/2-PH/2},p2={x:c.width-20,y:c.height/2-PH/2};
let ball={x:c.width/2,y:c.height/2,vx:0,vy:0};
let s1=0,s2=0,started=false;
const keys={};
document.addEventListener('keydown',e=>{keys[e.key]=true;if(e.key===' '&&!started)launch();e.preventDefault();});
document.addEventListener('keyup',e=>keys[e.key]=false);
document.addEventListener('mousemove',e=>{
  const r=c.getBoundingClientRect();
  p1.y=Math.max(0,Math.min(c.height-PH,e.clientY-r.top-PH/2));
  if(!started)ball.y=p1.y+PH/2;
});
function launch(){ball={x:c.width/2,y:c.height/2,vx:(Math.random()>0.5?1:-1)*SPD,vy:(Math.random()-0.5)*4};started=true;}
function ai(){const spd=3.5,center=p2.y+PH/2;if(center<ball.y-5)p2.y=Math.min(c.height-PH,p2.y+spd);else if(center>ball.y+5)p2.y=Math.max(0,p2.y-spd);}
function tick(){
  if(keys['w'])p1.y=Math.max(0,p1.y-5);
  if(keys['s'])p1.y=Math.min(c.height-PH,p1.y+5);
  if(started){
    ball.x+=ball.vx;ball.y+=ball.vy;
    if(ball.y<=BR||ball.y>=c.height-BR)ball.vy*=-1;
    if(ball.x-BR<=p1.x+PW&&ball.y>=p1.y&&ball.y<=p1.y+PH&&ball.vx<0){ball.vx=Math.abs(ball.vx)*1.04;ball.vy=(ball.y-(p1.y+PH/2))/12*4;}
    if(ball.x+BR>=p2.x&&ball.y>=p2.y&&ball.y<=p2.y+PH&&ball.vx>0){ball.vx=-Math.abs(ball.vx)*1.04;ball.vy=(ball.y-(p2.y+PH/2))/12*4;}
    if(ball.x<0){s2++;started=false;ball={x:c.width/2,y:c.height/2,vx:0,vy:0};}
    if(ball.x>c.width){s1++;started=false;ball={x:c.width/2,y:c.height/2,vx:0,vy:0};}
    ai();
  }
  draw();requestAnimationFrame(tick);
}
function draw(){
  ctx.fillStyle='#0f0f23';ctx.fillRect(0,0,c.width,c.height);
  ctx.setLineDash([10,10]);ctx.strokeStyle='rgba(255,255,255,0.08)';
  ctx.beginPath();ctx.moveTo(c.width/2,0);ctx.lineTo(c.width/2,c.height);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#60a5fa';ctx.shadowColor='#60a5fa';ctx.shadowBlur=10;ctx.fillRect(p1.x,p1.y,PW,PH);
  ctx.fillStyle='#f87171';ctx.shadowColor='#f87171';ctx.shadowBlur=10;ctx.fillRect(p2.x,p2.y,PW,PH);
  ctx.fillStyle='#fff';ctx.shadowColor='#fff';ctx.beginPath();ctx.arc(ball.x,ball.y,BR,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle='#fff';ctx.font='bold 40px monospace';ctx.textAlign='center';
  ctx.fillText(s1,c.width/4,55);ctx.fillText(s2,3*c.width/4,55);
  if(!started){ctx.fillStyle='rgba(0,0,0,0.45)';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#94a3b8';ctx.font='18px monospace';ctx.textAlign='center';ctx.fillText('SPACE to launch',c.width/2,c.height/2);}
}
tick();
</script></body></html>`;

// ─── Game: 2048 ───────────────────────────────────────────────────────────────
const GAME_2048 = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#0f0f23;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:monospace;color:#fff;user-select:none;}
h2{margin-bottom:8px;color:#fbbf24;font-size:20px;}
#sc{font-size:15px;color:#94a3b8;margin-bottom:10px;}
#board{display:grid;grid-template-columns:repeat(4,88px);gap:8px;background:#1e293b;padding:12px;border-radius:10px;border:2px solid #fbbf24;box-shadow:0 0 20px rgba(251,191,36,0.2);}
.cell{width:88px;height:88px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:bold;border-radius:6px;transition:background 0.1s;}
#msg{margin-top:10px;font-size:16px;height:22px;}
#info{margin-top:6px;font-size:13px;color:#94a3b8;}
</style></head><body><h2>🔢 2048</h2>
<div id="sc">Score: <span id="score">0</span></div>
<div id="board"></div>
<div id="msg"></div>
<div id="info">Arrow keys &bull; R to restart</div>
<script>
const C={0:'#0f172a',2:'#1e3a5f',4:'#1e4d6b',8:'#0e7490',16:'#0369a1',32:'#2563eb',64:'#7c3aed',128:'#a855f7',256:'#ec4899',512:'#f59e0b',1024:'#f97316',2048:'#ef4444'};
let grid,score,won,lost;
function init(){grid=Array(4).fill(0).map(()=>Array(4).fill(0));score=0;won=false;lost=false;add();add();render();}
function add(){const e=[];for(let r=0;r<4;r++)for(let c=0;c<4;c++)if(!grid[r][c])e.push([r,c]);if(!e.length)return;const[r,c]=e[Math.floor(Math.random()*e.length)];grid[r][c]=Math.random()<0.9?2:4;}
function compress(row){const f=row.filter(x=>x);while(f.length<4)f.push(0);return f;}
function merge(row){for(let i=0;i<3;i++)if(row[i]&&row[i]===row[i+1]){row[i]*=2;score+=row[i];row[i+1]=0;if(row[i]===2048)won=true;}return row;}
function transpose(g){return g[0].map((_,i)=>g.map(r=>r[i]));}
function move(dir){
  const prev=JSON.stringify(grid);
  if(dir==='left')grid=grid.map(r=>compress(merge(compress(r))));
  if(dir==='right')grid=grid.map(r=>compress(merge(compress(r.slice().reverse()))).reverse());
  if(dir==='up'){grid=transpose(grid).map(r=>compress(merge(compress(r))));grid=transpose(grid);}
  if(dir==='down'){grid=transpose(grid).map(r=>compress(merge(compress(r.slice().reverse()))).reverse());grid=transpose(grid);}
  if(JSON.stringify(grid)!==prev)add();
  checkLost();render();
}
function checkLost(){
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){
    if(!grid[r][c])return;
    if(c<3&&grid[r][c]===grid[r][c+1])return;
    if(r<3&&grid[r][c]===grid[r+1][c])return;
  }lost=true;
}
function render(){
  document.getElementById('score').textContent=score;
  const b=document.getElementById('board');b.innerHTML='';
  grid.forEach(row=>row.forEach(v=>{
    const d=document.createElement('div');d.className='cell';
    d.style.background=C[Math.min(v,2048)]||'#dc2626';
    d.style.color=v<=4?'#94a3b8':'#fff';d.textContent=v||'';b.appendChild(d);
  }));
  const m=document.getElementById('msg');
  if(won)m.innerHTML='<span style="color:#fbbf24">🎉 You won! Keep going!</span>';
  else if(lost)m.innerHTML='<span style="color:#f87171">Game Over! Press R</span>';
  else m.textContent='';
}
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft')move('left');
  if(e.key==='ArrowRight')move('right');
  if(e.key==='ArrowUp')move('up');
  if(e.key==='ArrowDown')move('down');
  if(e.key==='r'||e.key==='R')init();
  if(e.key.startsWith('Arrow'))e.preventDefault();
});
init();
</script></body></html>`;

// ─── Game: Breakout ───────────────────────────────────────────────────────────
const GAME_BREAKOUT = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#0f0f23;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:monospace;color:#fff;user-select:none;}
h2{margin-bottom:10px;color:#a78bfa;font-size:20px;}
canvas{border:2px solid #a78bfa;box-shadow:0 0 20px rgba(167,139,250,0.3);}
#info{margin-top:10px;font-size:13px;color:#94a3b8;}
</style></head><body><h2>🧱 Breakout</h2>
<canvas id="c" width="480" height="400"></canvas>
<div id="info">Mouse to move &bull; Click or SPACE to launch</div>
<script>
const c=document.getElementById('c'),ctx=c.getContext('2d');
const COLS=['#f87171','#fb923c','#fbbf24','#4ade80','#60a5fa','#a78bfa'];
const PW=80,PH=10,BR=7;
let bricks=[],paddle={x:c.width/2-PW/2,y:c.height-30,w:PW,h:PH};
let ball={x:c.width/2,y:c.height-50,vx:3,vy:-4,launched:false};
let sc=0,lives=3,over=false,won=false;
function initBricks(){bricks=[];for(let r=0;r<6;r++)for(let col=0;col<10;col++)bricks.push({x:col*46+8,y:r*22+40,w:42,h:18,alive:true,color:COLS[r]});}
initBricks();
document.addEventListener('mousemove',e=>{
  const r=c.getBoundingClientRect();
  paddle.x=Math.max(0,Math.min(c.width-PW,e.clientX-r.left-PW/2));
  if(!ball.launched)ball.x=paddle.x+PW/2;
});
document.addEventListener('click',launch);
document.addEventListener('keydown',e=>{if(e.key===' '){launch();e.preventDefault();}});
function launch(){if(!ball.launched&&!over){ball.launched=true;ball.vx=(Math.random()-0.5)*6||3;ball.vy=-4;}}
function tick(){
  if(ball.launched&&!over){
    ball.x+=ball.vx;ball.y+=ball.vy;
    if(ball.x-BR<0||ball.x+BR>c.width)ball.vx*=-1;
    if(ball.y-BR<0)ball.vy*=-1;
    if(ball.y+BR>c.height){lives--;if(lives<=0){over=true;}else{ball.launched=false;ball.x=paddle.x+PW/2;ball.y=c.height-50;}}
    if(ball.y+BR>=paddle.y&&ball.y-BR<=paddle.y+PH&&ball.x>=paddle.x&&ball.x<=paddle.x+PW&&ball.vy>0){
      ball.vy=-Math.abs(ball.vy);ball.vx=(ball.x-(paddle.x+PW/2))/(PW/2)*5;
    }
    bricks.forEach(b=>{
      if(!b.alive)return;
      if(ball.x+BR>b.x&&ball.x-BR<b.x+b.w&&ball.y+BR>b.y&&ball.y-BR<b.y+b.h){
        b.alive=false;sc+=10;ball.vy*=-1;
      }
    });
    if(bricks.every(b=>!b.alive)){over=true;won=true;}
  }
  draw();requestAnimationFrame(tick);
}
function draw(){
  ctx.fillStyle='#0f0f23';ctx.fillRect(0,0,c.width,c.height);
  bricks.forEach(b=>{if(!b.alive)return;ctx.fillStyle=b.color;ctx.shadowColor=b.color;ctx.shadowBlur=4;ctx.fillRect(b.x,b.y,b.w,b.h);});
  ctx.shadowBlur=0;
  ctx.fillStyle='#a78bfa';ctx.shadowColor='#a78bfa';ctx.shadowBlur=8;ctx.fillRect(paddle.x,paddle.y,PW,PH);
  ctx.fillStyle='#fff';ctx.shadowColor='#fff';ctx.shadowBlur=8;
  ctx.beginPath();ctx.arc(ball.x,ball.y,BR,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='#94a3b8';ctx.font='14px monospace';ctx.textAlign='left';ctx.fillText('Score: '+sc,8,20);
  ctx.textAlign='right';ctx.fillText('Lives: '+lives,c.width-8,20);
  if(over){
    ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,c.width,c.height);ctx.textAlign='center';
    if(won){ctx.fillStyle='#4ade80';ctx.font='bold 30px monospace';ctx.fillText('YOU WIN! 🎉',c.width/2,c.height/2-20);}
    else{ctx.fillStyle='#f87171';ctx.font='bold 30px monospace';ctx.fillText('GAME OVER',c.width/2,c.height/2-20);}
    ctx.fillStyle='#94a3b8';ctx.font='16px monospace';ctx.fillText('Score: '+sc,c.width/2,c.height/2+15);
    ctx.fillText('Refresh to play again',c.width/2,c.height/2+45);
  }
}
tick();
</script></body></html>`;

// ─── Game: Flappy Bird ────────────────────────────────────────────────────────
const GAME_FLAPPY = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#0f0f23;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:monospace;color:#fff;user-select:none;}
h2{margin-bottom:10px;color:#34d399;font-size:20px;}
canvas{border:2px solid #34d399;box-shadow:0 0 20px rgba(52,211,153,0.3);}
#info{margin-top:10px;font-size:13px;color:#94a3b8;}
</style></head><body><h2>🐦 Flappy Bird</h2>
<canvas id="c" width="320" height="480"></canvas>
<div id="info">SPACE or Click to flap</div>
<script>
const c=document.getElementById('c'),ctx=c.getContext('2d');
const GRAV=0.38,JUMP=-7,GAP=130,PW=45,SPD=2.5;
let bird,pipes,sc,best=0,started,dead,pipeTimer;
function init(){
  bird={x:70,y:c.height/2,vy:0,r:14};
  pipes=[];sc=0;started=false;dead=false;
  clearInterval(pipeTimer);pipeTimer=null;
}
function addPipe(){pipes.push({x:c.width,top:60+Math.random()*(c.height-GAP-120),passed:false});}
function flap(){
  if(dead){init();return;}
  if(!started){started=true;pipeTimer=setInterval(addPipe,1700);}
  bird.vy=JUMP;
}
document.addEventListener('keydown',e=>{if(e.key===' '){flap();e.preventDefault();}});
c.addEventListener('click',flap);
function tick(){
  if(started&&!dead){
    bird.vy+=GRAV;bird.y+=bird.vy;
    pipes.forEach(p=>p.x-=SPD);
    pipes=pipes.filter(p=>p.x+PW>0);
    if(bird.y+bird.r>c.height||bird.y-bird.r<0){dead=true;best=Math.max(sc,best);}
    pipes.forEach(p=>{
      if(bird.x+bird.r>p.x&&bird.x-bird.r<p.x+PW&&(bird.y-bird.r<p.top||bird.y+bird.r>p.top+GAP)){dead=true;best=Math.max(sc,best);}
      if(!p.passed&&p.x+PW<bird.x){p.passed=true;sc++;}
    });
  }
  draw();requestAnimationFrame(tick);
}
function draw(){
  ctx.fillStyle='#0f1f3d';ctx.fillRect(0,0,c.width,c.height);
  pipes.forEach(p=>{
    ctx.fillStyle='#22c55e';ctx.shadowColor='#22c55e';ctx.shadowBlur=6;
    ctx.fillRect(p.x,0,PW,p.top);
    ctx.fillRect(p.x,p.top+GAP,PW,c.height-p.top-GAP);
    ctx.fillStyle='#16a34a';
    ctx.fillRect(p.x-3,p.top-12,PW+6,12);
    ctx.fillRect(p.x-3,p.top+GAP,PW+6,12);
  });ctx.shadowBlur=0;
  ctx.save();ctx.translate(bird.x,bird.y);ctx.rotate(Math.min(Math.PI/4,bird.vy*0.05));
  ctx.fillStyle='#fbbf24';ctx.shadowColor='#fbbf24';ctx.shadowBlur=8;
  ctx.beginPath();ctx.arc(0,0,bird.r,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#1e293b';ctx.shadowBlur=0;ctx.beginPath();ctx.arc(5,-4,4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(6,-5,2,0,Math.PI*2);ctx.fill();
  ctx.restore();
  ctx.fillStyle='#fff';ctx.font='bold 28px monospace';ctx.textAlign='center';ctx.fillText(sc,c.width/2,48);
  if(!started){
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle='#fff';ctx.font='18px monospace';ctx.textAlign='center';
    ctx.fillText('Tap or SPACE to start',c.width/2,c.height/2);
  }
  if(dead){
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle='#f87171';ctx.font='bold 30px monospace';ctx.textAlign='center';ctx.fillText('DEAD',c.width/2,c.height/2-35);
    ctx.fillStyle='#fff';ctx.font='16px monospace';
    ctx.fillText('Score: '+sc,c.width/2,c.height/2+2);
    ctx.fillText('Best:  '+best,c.width/2,c.height/2+26);
    ctx.fillStyle='#94a3b8';ctx.font='14px monospace';ctx.fillText('Tap to retry',c.width/2,c.height/2+58);
  }
}
init();tick();
</script></body></html>`;

// ─── Main UI ──────────────────────────────────────────────────────────────────
const MAIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ProxyHub</title>
<style>
:root{--bg:#0a0a1a;--bg2:#111827;--bg3:#1f2937;--accent:#6366f1;--text:#f1f5f9;--text2:#94a3b8;--border:#374151;--sw:230px;}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{height:100%;overflow:hidden;}
body{background:var(--bg);color:var(--text);font-family:'Segoe UI',system-ui,sans-serif;display:flex;flex-direction:column;}

/* ── Top Bar ── */
.topbar{height:54px;background:var(--bg2);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 12px;gap:8px;flex-shrink:0;z-index:50;}
.toggle{background:none;border:none;color:var(--text2);font-size:20px;cursor:pointer;padding:6px 8px;border-radius:6px;line-height:1;}
.toggle:hover{background:var(--bg3);color:var(--text);}
.logo{font-weight:800;font-size:17px;background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;white-space:nowrap;padding-right:4px;}
.nav-btn{background:var(--bg3);border:1px solid var(--border);color:var(--text2);padding:5px 9px;border-radius:6px;cursor:pointer;font-size:13px;line-height:1;}
.nav-btn:hover{background:var(--border);color:var(--text);}
.urlbar{flex:1;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 14px;border-radius:8px;font-size:14px;outline:none;min-width:0;}
.urlbar:focus{border-color:var(--accent);}
.go{background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;white-space:nowrap;}
.go:hover{opacity:0.88;}

/* ── Layout ── */
.layout{display:flex;flex:1;overflow:hidden;}

/* ── Sidebar ── */
.sidebar{width:var(--sw);background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;overflow:hidden;transition:width 0.25s ease;}
.sidebar.closed{width:0;}
.sidebar-inner{width:var(--sw);display:flex;flex-direction:column;overflow:hidden;height:100%;}
.sidebar-head{padding:14px 16px 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text2);border-bottom:1px solid var(--border);}
.games-list{overflow-y:auto;flex:1;}
.games-list::-webkit-scrollbar{width:4px;}
.games-list::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
.cat{padding:10px 16px 4px;font-size:11px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.08em;}
.game-item{display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer;transition:background .15s;border-radius:0;font-size:14px;font-weight:500;white-space:nowrap;}
.game-item:hover{background:var(--bg3);}
.game-item .ico{font-size:19px;width:24px;text-align:center;}

/* ── Main ── */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
#proxy-frame{flex:1;border:none;background:#fff;display:none;}
.welcome{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:20px;}
.welcome h1{font-size:48px;background:linear-gradient(135deg,#6366f1,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800;}
.welcome p{color:var(--text2);font-size:16px;max-width:420px;line-height:1.6;}
.welcome .hint{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px 20px;font-size:13px;color:var(--text2);}
.welcome .hint b{color:var(--text);}

/* ── Game Modal ── */
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:200;align-items:center;justify-content:center;}
.overlay.open{display:flex;}
.modal{background:var(--bg2);border:1px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,0.6);display:flex;flex-direction:column;}
.modal-head{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border);background:var(--bg3);}
.modal-title{font-weight:600;font-size:15px;}
.modal-close{background:none;border:none;color:var(--text2);font-size:24px;cursor:pointer;line-height:1;padding:0 4px;}
.modal-close:hover{color:var(--text);}
.modal iframe{border:none;display:block;}
</style>
</head>
<body>

<div class="topbar">
  <button class="toggle" id="toggleBtn" title="Toggle game hub">☰</button>
  <span class="logo">ProxyHub</span>
  <button class="nav-btn" id="backBtn" title="Back">◀</button>
  <button class="nav-btn" id="fwdBtn" title="Forward">▶</button>
  <button class="nav-btn" id="reloadBtn" title="Reload">↻</button>
  <input class="urlbar" id="urlBar" type="text" placeholder="Enter a URL (e.g. example.com)" spellcheck="false"/>
  <button class="go" id="goBtn">Go</button>
</div>

<div class="layout">
  <!-- Sidebar -->
  <div class="sidebar" id="sidebar">
    <div class="sidebar-inner">
      <div class="sidebar-head">🎮 Game Hub</div>
      <div class="games-list">
        <div class="cat">Arcade</div>
        <div class="game-item" onclick="openGame('snake','🐍 Snake','320x400')"><span class="ico">🐍</span>Snake</div>
        <div class="game-item" onclick="openGame('pong','🏓 Pong','640x430')"><span class="ico">🏓</span>Pong</div>
        <div class="game-item" onclick="openGame('flappy','🐦 Flappy Bird','360x520')"><span class="ico">🐦</span>Flappy Bird</div>
        <div class="game-item" onclick="openGame('breakout','🧱 Breakout','520x450')"><span class="ico">🧱</span>Breakout</div>
        <div class="cat">Puzzle</div>
        <div class="game-item" onclick="openGame('2048','🔢 2048','420x530')"><span class="ico">🔢</span>2048</div>
      </div>
    </div>
  </div>

  <!-- Main content -->
  <div class="main">
    <div class="welcome" id="welcome">
      <h1>ProxyHub</h1>
      <p>Browse the web privately and play games — all in one place.</p>
      <div class="hint">
        <b>Type any URL above</b> and press Go to start browsing.<br>
        Open the <b>Game Hub</b> sidebar to play games anytime.
      </div>
    </div>
    <iframe id="proxy-frame" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
  </div>
</div>

<!-- Game Modal -->
<div class="overlay" id="overlay">
  <div class="modal" id="modal">
    <div class="modal-head">
      <span class="modal-title" id="modalTitle">Game</span>
      <button class="modal-close" onclick="closeGame()">×</button>
    </div>
    <iframe id="game-frame" scrolling="no"></iframe>
  </div>
</div>

<script>
const sidebar = document.getElementById('sidebar');
const urlBar = document.getElementById('urlBar');
const frame = document.getElementById('proxy-frame');
const welcome = document.getElementById('welcome');
const overlay = document.getElementById('overlay');
const gameFrame = document.getElementById('game-frame');
const modalTitle = document.getElementById('modalTitle');

// ── Sidebar toggle ──
document.getElementById('toggleBtn').addEventListener('click', () => {
  sidebar.classList.toggle('closed');
});

// ── Navigation ──
function navigate(url) {
  if (!url) return;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  urlBar.value = url;
  const proxyUrl = '/fetch?url=' + encodeURIComponent(url);
  frame.src = proxyUrl;
  frame.style.display = 'block';
  welcome.style.display = 'none';
  navHistory.push(url);
  historyIdx = navHistory.length - 1;
}

let navHistory = [], historyIdx = -1;

document.getElementById('goBtn').addEventListener('click', () => navigate(urlBar.value.trim()));
urlBar.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(urlBar.value.trim()); });

document.getElementById('backBtn').addEventListener('click', () => {
  if (historyIdx > 0) { historyIdx--; const u = navHistory[historyIdx]; urlBar.value = u; frame.src = '/fetch?url=' + encodeURIComponent(u); }
});
document.getElementById('fwdBtn').addEventListener('click', () => {
  if (historyIdx < navHistory.length - 1) { historyIdx++; const u = navHistory[historyIdx]; urlBar.value = u; frame.src = '/fetch?url=' + encodeURIComponent(u); }
});
document.getElementById('reloadBtn').addEventListener('click', () => {
  try { frame.contentWindow.location.reload(); } catch(e) { frame.src = frame.src + ''; }
});

// Sync URL bar with iframe navigation (works since everything is on our origin)
setInterval(() => {
  try {
    const loc = frame.contentWindow.location.href;
    if (loc && loc !== 'about:blank') {
      const params = new URLSearchParams(new URL(loc).search);
      const proxied = params.get('url');
      if (proxied && proxied !== urlBar.value) urlBar.value = proxied;
    }
  } catch(e) {}
}, 600);

// ── Games ──
function openGame(id, title, size) {
  const [w, h] = size.split('x').map(Number);
  gameFrame.style.width = w + 'px';
  gameFrame.style.height = h + 'px';
  gameFrame.src = '/game/' + id;
  modalTitle.textContent = title;
  overlay.classList.add('open');
}

function closeGame() {
  overlay.classList.remove('open');
  gameFrame.src = 'about:blank';
}

overlay.addEventListener('click', e => { if (e.target === overlay) closeGame(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeGame(); });
</script>
</body>
</html>`;

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.send(MAIN_HTML));

const GAMES = { snake: GAME_SNAKE, pong: GAME_PONG, '2048': GAME_2048, breakout: GAME_BREAKOUT, flappy: GAME_FLAPPY };
app.get('/game/:id', (req, res) => {
  const game = GAMES[req.params.id];
  if (!game) return res.status(404).send('Not found');
  res.send(game);
});

// ─── Proxy ────────────────────────────────────────────────────────────────────
app.get('/fetch', async (req, res) => {
  let target = req.query.url;
  if (!target) return res.status(400).send('No URL');
  if (!/^https?:\/\//i.test(target)) target = 'https://' + target;

  try {
    const response = await axios.get(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
      },
      responseType: 'arraybuffer',
      maxRedirects: 8,
      timeout: 18000,
    });

    const ct = response.headers['content-type'] || 'application/octet-stream';

    // Strip headers that block embedding
    ['x-frame-options','content-security-policy','x-content-type-options'].forEach(h => res.removeHeader(h));
    res.set('Content-Type', ct);

    function resolveUrl(href) {
      try { return new URL(href, target).href; } catch { return null; }
    }

    function proxify(u) {
      const abs = resolveUrl(u);
      return abs ? '/fetch?url=' + encodeURIComponent(abs) : u;
    }

    // ── HTML ──
    if (ct.includes('text/html')) {
      const html = Buffer.from(response.data).toString('utf-8');
      const $ = cheerio.load(html);

      $('a[href]').each((_, el) => {
        const h = $(el).attr('href');
        if (h && !h.startsWith('#') && !h.startsWith('javascript:') && !h.startsWith('mailto:') && !h.startsWith('data:'))
          $(el).attr('href', proxify(h));
      });

      $('[src]').each((_, el) => {
        const s = $(el).attr('src');
        if (s && !s.startsWith('data:') && !s.startsWith('blob:'))
          $(el).attr('src', proxify(s));
      });

      $('[srcset]').each((_, el) => {
        const ss = $(el).attr('srcset').split(',').map(part => {
          const [url, descriptor] = part.trim().split(/\s+/);
          const abs = resolveUrl(url);
          return abs ? '/fetch?url=' + encodeURIComponent(abs) + (descriptor ? ' ' + descriptor : '') : part;
        });
        $(el).attr('srcset', ss.join(', '));
      });

      $('link[href]').each((_, el) => {
        const h = $(el).attr('href');
        if (h && !h.startsWith('data:')) $(el).attr('href', proxify(h));
      });

      $('form[action]').each((_, el) => {
        const a = $(el).attr('action');
        if (a) $(el).attr('action', proxify(a));
      });

      // Remove CSP meta tags
      $('meta[http-equiv="Content-Security-Policy"]').remove();
      $('meta[http-equiv="X-Frame-Options"]').remove();

      return res.send($.html());
    }

    // ── CSS ──
    if (ct.includes('text/css')) {
      let css = Buffer.from(response.data).toString('utf-8');
      css = css.replace(/url\(['"]?([^'")\s]+)['"]?\)/g, (match, u) => {
        if (u.startsWith('data:') || u.startsWith('#')) return match;
        const abs = resolveUrl(u);
        return abs ? "url('/fetch?url=" + encodeURIComponent(abs) + "')" : match;
      });
      return res.set('Content-Type', 'text/css').send(css);
    }

    // ── Everything else (images, fonts, JS, etc.) ──
    res.send(Buffer.from(response.data));

  } catch (err) {
    const msg = err.response ? `HTTP ${err.response.status}` : err.message;
    res.status(502).send(`<!DOCTYPE html><html><body style="margin:0;background:#0a0a1a;color:#f87171;font-family:monospace;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:12px;text-align:center;padding:20px;">
      <div style="font-size:48px;">⚠️</div>
      <div style="font-size:22px;font-weight:700;">Failed to load page</div>
      <div style="color:#94a3b8;font-size:14px;">${msg}</div>
      <a href="/" style="color:#6366f1;font-size:14px;margin-top:8px;">← Back to ProxyHub</a>
    </body></html>`);
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(``);
  console.log(`  ██████╗ ██████╗  ██████╗ ██╗  ██╗██╗   ██╗██╗  ██╗██╗   ██╗██████╗ `);
  console.log(`  ██╔══██╗██╔══██╗██╔═══██╗╚██╗██╔╝╚██╗ ██╔╝██║  ██║██║   ██║██╔══██╗`);
  console.log(`  ██████╔╝██████╔╝██║   ██║ ╚███╔╝  ╚████╔╝ ███████║██║   ██║██████╔╝`);
  console.log(`  ██╔═══╝ ██╔══██╗██║   ██║ ██╔██╗   ╚██╔╝  ██╔══██║██║   ██║██╔══██╗`);
  console.log(`  ██║     ██║  ██║╚██████╔╝██╔╝ ██╗   ██║   ██║  ██║╚██████╔╝██████╔╝`);
  console.log(`  ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ `);
  console.log(``);
  console.log(`  Running at http://localhost:${PORT}`);
  console.log(``);
});
