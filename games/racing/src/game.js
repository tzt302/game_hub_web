import { loadTracks, TRACK_ORDER, nearestIndex, progressScore } from './track.js';
import { Vehicle, PHYSICS } from './physics.js';
import { AIDriver, AI_PROFILES } from './ai.js';

if (new URLSearchParams(window.location.search).has('embed')) document.body.classList.add('embed');

const $ = selector => document.querySelector(selector);
const canvas = $('#gameCanvas');
const context = canvas.getContext('2d');
const ui = {
  menu: $('#menuScreen'), guide: $('#guideScreen'), pause: $('#pauseScreen'), hud: $('#hud'), lights: $('#startLights'),
  track: $('#trackSelect'), mode: $('#modeSelect'), difficulty: $('#difficultySelect'), view: $('#viewSelect'), livery: $('#liverySelect'),
  lap: $('#lapLabel'), time: $('#lapTime'), speed: $('#speedLabel'), gear: $('#gearLabel'), position: $('#positionLabel'),
  delta: $('#delta'), leaderboard: $('#leaderboard'), notice: $('#notice'), modeLabel: $('#modeLabel'),
  throttle: $('#throttleBar'), brake: $('#brakeBar'), sectors: [$('#sector1'), $('#sector2'), $('#sector3')]
};
const LIVERIES = { scarlet:['#e32f3d','#ffd34e'], papaya:['#f57a20','#27394b'], silver:['#2dbbab','#f1f3f4'], blue:['#3157d5','#ef3745'] };
const input = { left:false, right:false, throttle:false, brake:false };
const state = {
  phase:'loading', tracks:null, track:null, player:null, ai:[], mode:'time', difficulty:'normal', viewScale:2.55,
  livery:'scarlet', showLine:true, lap:1, totalLaps:3, lapTime:0, lastIndex:0, sector:0, sectorTimes:[null,null,null],
  currentTrace:[], bestTrace:null, bestLap:Infinity, delta:null, countdown:0, lightsOut:true, lastFrame:0,
  outside:false, warnings:0, penalty:0, noticeTimer:0, wrongWay:0, lapValid:true, gamepadReset:false
};

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect(); const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.max(1, Math.round(rect.width * ratio)); canvas.height = Math.max(1, Math.round(rect.height * ratio));
  context.setTransform(ratio, 0, 0, ratio, 0, 0); state.screenWidth = rect.width; state.screenHeight = rect.height;
}
window.addEventListener('resize', resizeCanvas);

function formatTime(value) {
  if (!Number.isFinite(value)) return '--:--.---';
  const minutes = Math.floor(value / 60); return `${minutes}:${(value % 60).toFixed(3).padStart(6,'0')}`;
}

function setNotice(message, seconds = 2.3) {
  ui.notice.textContent = message; ui.notice.classList.remove('hidden'); state.noticeTimer = seconds;
}

function surfaceFor(vehicle) {
  const nearest = nearestIndex(state.track, vehicle.x, vehicle.y, vehicle.trackIndex);
  vehicle.trackIndex = nearest.index; const half = state.track.width / 2;
  vehicle.surface = nearest.distance <= half ? 'asphalt' : nearest.distance <= half + 1.25 ? 'kerb' : nearest.distance <= half + 6.25 ? 'runoff' : 'grass';
  return nearest;
}

function placeCar(vehicle, gridPosition) {
  const count = state.track.points.length; const row = Math.floor(gridPosition / 2); const index = (count - 2 - row * 2 + count) % count;
  const point = state.track.points[index]; const side = gridPosition % 2 ? 1 : -1; const offset = Math.min(2.6, state.track.width * .2) * side;
  vehicle.reset(point.x - Math.sin(point.heading) * offset, point.y + Math.cos(point.heading) * offset, point.heading);
  vehicle.trackIndex = index; vehicle.gridPosition = gridPosition; vehicle.lap = 1; return index;
}

function resetSession() {
  const [body] = LIVERIES[state.livery]; state.player = new Vehicle(body, 'YOU');
  state.ai = AI_PROFILES.map(profile => new AIDriver(state.track, profile, state.difficulty));
  if (state.mode === 'race') {
    state.lastIndex = placeCar(state.player, 9); state.ai.forEach((car,index) => placeCar(car,index));
    state.countdown = 0; state.lightsOut = false;
  } else {
    const point = state.track.points[0]; state.player.reset(point.x, point.y, point.heading); state.player.trackIndex = 0; state.lastIndex = 0;
    state.ai.forEach((car,index) => placeCar(car,index)); state.lightsOut = true;
  }
  Object.assign(state,{lap:1,totalLaps:state.track.laps,lapTime:0,sector:0,sectorTimes:[null,null,null],currentTrace:new Array(state.track.points.length).fill(null),bestTrace:null,bestLap:Infinity,delta:null,outside:false,warnings:0,penalty:0,wrongWay:0,lapValid:true});
  ui.lights.classList.toggle('hidden', state.lightsOut); updateHud();
}

function startConfiguredSession() {
  state.track = state.tracks[ui.track.value]; state.mode = ui.mode.value; state.difficulty = ui.difficulty.value;
  state.viewScale = Number(ui.view.value); state.livery = ui.livery.value; resetSession();
  ui.guide.classList.add('hidden'); ui.menu.classList.add('hidden'); ui.hud.classList.remove('hidden'); state.phase = 'race'; canvas.focus();
}

$('#raceSetup').addEventListener('submit', event => { event.preventDefault(); state.track = state.tracks[ui.track.value]; ui.menu.classList.add('hidden'); ui.guide.classList.remove('hidden'); });
$('#driveButton').addEventListener('click', startConfiguredSession);
$('#pauseButton').addEventListener('click', () => togglePause(true)); $('#resumeButton').addEventListener('click', () => togglePause(false));
$('#restartButton').addEventListener('click', () => { resetSession(); togglePause(false); });
$('#menuButton').addEventListener('click', showMenu); $('#lineButton').addEventListener('click', () => { state.showLine = !state.showLine; });

function showMenu() { state.phase = 'menu'; ui.pause.classList.add('hidden'); ui.hud.classList.add('hidden'); ui.lights.classList.add('hidden'); ui.menu.classList.remove('hidden'); }
function togglePause(paused) { if (!['race','paused'].includes(state.phase)) return; state.phase = paused ? 'paused' : 'race'; ui.pause.classList.toggle('hidden', !paused); }

const keyMap = { KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',KeyW:'throttle',ArrowUp:'throttle',KeyS:'brake',ArrowDown:'brake' };
window.addEventListener('keydown', event => {
  if (keyMap[event.code]) { input[keyMap[event.code]] = true; event.preventDefault(); }
  if (event.code === 'KeyP' || event.code === 'Escape') togglePause(state.phase === 'race');
  if (event.code === 'KeyR' && state.phase === 'race') recoverPlayer();
  if (event.code === 'KeyL' && state.phase === 'race') state.showLine = !state.showLine;
});
window.addEventListener('keyup', event => { if (keyMap[event.code]) { input[keyMap[event.code]] = false; event.preventDefault(); } });
document.querySelectorAll('[data-control]').forEach(button => {
  const control = button.dataset.control;
  const set = value => { input[control] = value; };
  button.addEventListener('pointerdown', event => { event.preventDefault(); button.setPointerCapture(event.pointerId); set(true); });
  ['pointerup','pointercancel','lostpointercapture'].forEach(type => button.addEventListener(type, () => set(false)));
});

function recoverPlayer(message = '车辆已重置') {
  const point = state.track.points[state.player.trackIndex]; state.player.reset(point.x, point.y, point.heading); state.player.trackIndex = state.lastIndex = state.player.trackIndex; setNotice(message);
}

function readControls() {
  let steer=(input.right?1:0)-(input.left?1:0),throttle=input.throttle?1:0,brake=input.brake?1:0;
  const pad=Array.from(navigator.getGamepads?.()||[]).find(Boolean);
  if(pad){const axis=pad.axes[0]||0,deadzone=.12;if(Math.abs(axis)>deadzone)steer=(Math.abs(axis)-deadzone)/(1-deadzone)*Math.sign(axis);throttle=Math.max(throttle,pad.buttons[7]?.value||0);brake=Math.max(brake,pad.buttons[6]?.value||0);const reset=Boolean(pad.buttons[1]?.pressed);if(reset&&!state.gamepadReset)recoverPlayer();state.gamepadReset=reset;}
  return{steer,throttle,brake};
}

function updateRace(dt) {
  if (!state.lightsOut) {
    state.countdown += dt; const lit = state.countdown < .75 ? 0 : Math.min(5, Math.floor((state.countdown - .75) / .75) + 1);
    [...ui.lights.querySelectorAll('i')].forEach((light,index) => light.classList.toggle('on', index < lit));
    if (state.countdown >= 5.25) { state.lightsOut = true; ui.lights.querySelector('span').textContent = 'LIGHTS OUT'; setTimeout(() => ui.lights.classList.add('hidden'), 650); }
    return;
  }
  const controls=readControls();
  const nearest = surfaceFor(state.player); state.player.update(dt, controls.steer, controls.throttle, controls.brake); surfaceFor(state.player);
  if (state.mode === 'race') {
    const allCars = [state.player,...state.ai];
    state.ai.forEach(car => { surfaceFor(car); car.drive(dt, allCars); surfaceFor(car); updateAiLap(car); });
  }
  state.lapTime += dt; state.currentTrace[state.player.trackIndex] = state.lapTime;
  updateDirection(dt); updateTrackLimits(); updateTiming(nearest.index); updateContacts();
  if (state.noticeTimer > 0) { state.noticeTimer -= dt; if (state.noticeTimer <= 0) ui.notice.classList.add('hidden'); }
  updateHud();
}

function updateDirection(dt) {
  const heading = state.track.points[state.player.trackIndex].heading;
  const alignment = Math.cos(state.player.heading - heading);
  state.wrongWay = state.player.speed > 8 && alignment < -.35 ? state.wrongWay + dt : Math.max(0,state.wrongWay-dt*2);
  if (state.wrongWay > .65 && state.wrongWay < 2.4) setNotice('禁止逆向行驶', .25);
  if (state.wrongWay >= 2.4) { recoverPlayer('逆向行驶 · 已重置'); state.wrongWay = 0; }
}

function updateTrackLimits() {
  const outside = state.player.surface === 'runoff' || state.player.surface === 'grass';
  if (outside && !state.outside && state.player.speed > 8) {
    if (state.mode === 'time') { state.lapValid=false;state.currentTrace.fill(null); state.delta = null; setNotice('圈速已删除 · 赛道限制'); }
    else { state.warnings += 1; if (state.warnings >= 3) { state.penalty += 5; state.warnings = 0; setNotice('罚时 5 秒 · 赛道限制'); } else setNotice(`赛道限制警告 ${state.warnings} / 3`); }
  }
  state.outside = outside;
}

function crossed(last, current, marker, count) { return last <= marker && current > marker && current-last < count*.2; }
function updateTiming(previousIndex) {
  const index = state.player.trackIndex, count = state.track.points.length;
  if (state.sector < 2 && crossed(state.lastIndex,index,state.track.sectorIndices[state.sector],count)) {
    const previousTotal = state.sectorTimes.slice(0,state.sector).reduce((a,b) => a+(b||0),0); state.sectorTimes[state.sector] = state.lapTime-previousTotal; state.sector += 1;
  }
  if (state.bestTrace && Number.isFinite(state.bestTrace[index])) state.delta = state.lapTime-state.bestTrace[index];
  const lineCrossed = state.lastIndex > count*.85 && index < count*.15;
  if (lineCrossed && state.player.speed > 5) completePlayerLap();
  state.lastIndex = index;
}

function completePlayerLap() {
  state.sectorTimes[2] = state.lapTime-(state.sectorTimes[0]||0)-(state.sectorTimes[1]||0);
  if (state.lapValid&&state.currentTrace.some(Number.isFinite) && state.lapTime < state.bestLap) { state.bestLap = state.lapTime; state.bestTrace = completeTrace(state.currentTrace,state.lapTime); setNotice(`个人最快圈 ${formatTime(state.bestLap)}`); }
  else if(!state.lapValid)setNotice('无效圈 · 成绩未记录');
  state.lap += 1; state.lapTime = 0; state.sector = 0; state.sectorTimes = [null,null,null]; state.currentTrace = new Array(state.track.points.length).fill(null); state.delta = null;state.lapValid=true;
  if (state.lap > state.totalLaps) { state.lap = state.totalLaps; setNotice(`比赛完成 · 最快圈 ${formatTime(state.bestLap)}`,8); state.phase = 'paused'; ui.pause.classList.remove('hidden'); ui.pause.querySelector('h2').textContent = '比赛完成'; }
}

export function completeTrace(trace, lapTime) {
  const output = [...trace], known = output.map((value,index) => Number.isFinite(value) ? index : -1).filter(index => index >= 0);
  if (!known.length) return output.map((_,index) => index/output.length*lapTime);
  for (let index=0; index<output.length; index+=1) if (!Number.isFinite(output[index])) {
    let before=index-1; while(before>=0&&!Number.isFinite(output[before])) before-=1; let after=index+1; while(after<output.length&&!Number.isFinite(output[after])) after+=1;
    const a=before>=0?output[before]:0,b=after<output.length?output[after]:lapTime,span=(after<output.length?after:output.length)-(before>=0?before:0); output[index]=a+(b-a)*(index-(before>=0?before:0))/Math.max(1,span);
  }
  return output;
}

function updateAiLap(car) { const count=state.track.points.length, previous=car._lastIndex??car.trackIndex; if(previous>count*.85&&car.trackIndex<count*.15&&car.speed>5) car.lap+=1; car._lastIndex=car.trackIndex; }
function updateContacts() {
  if (state.mode !== 'race') return; const cars=[state.player,...state.ai];
  for(let i=0;i<cars.length;i+=1)for(let j=i+1;j<cars.length;j+=1){const a=cars[i],b=cars[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>0&&d<2.2){const push=(2.2-d)/2;a.x-=dx/d*push;a.y-=dy/d*push;b.x+=dx/d*push;b.y+=dy/d*push;a.speed*=.985;b.speed*=.985;}}
}

function standings() {
  const entries=[{car:state.player,name:'YOU',player:true},...state.ai.map(car=>({car,name:car.name,player:false}))];
  return entries.sort((a,b)=>progressScore(b.car,state.track)-progressScore(a.car,state.track));
}

function updateHud() {
  if (!state.player) return; ui.speed.textContent=Math.round(state.player.speed*3.6).toString().padStart(3,'0'); ui.gear.textContent=state.player.gear;
  ui.lap.textContent=`LAP ${state.lap} / ${state.totalLaps}`; ui.time.textContent=formatTime(state.lapTime); ui.modeLabel.textContent=state.mode==='race'?'GRAND PRIX · 10 CARS':'TIME TRIAL';
  ui.throttle.style.height=`${Math.max(4,state.player.throttle*100)}%`; ui.brake.style.height=`${Math.max(4,state.player.brake*100)}%`;
  ui.sectors.forEach((element,index)=>element.textContent=state.sectorTimes[index]?state.sectorTimes[index].toFixed(3):'--.---');
  const deltaStrong=ui.delta.querySelector('strong'); deltaStrong.textContent=state.delta==null?'--.---':`${state.delta>=0?'+':''}${state.delta.toFixed(3)}`; ui.delta.className=`delta ${state.delta==null?'neutral':state.delta>0?'positive':'negative'}`;
  const order=standings(),position=order.findIndex(entry=>entry.player)+1; ui.position.textContent=`${position} / ${order.length}`;
  ui.leaderboard.innerHTML=order.map((entry,index)=>`<li class="${entry.player?'player':''}"><b>${index+1}</b><span>${entry.name}</span><span>${entry.player?'YOU':gapLabel(entry.car)}</span></li>`).join('');
}
function gapLabel(car){const gap=(progressScore(state.player,state.track)-progressScore(car,state.track))*state.track.referenceLap;return `${gap>=0?'+':''}${gap.toFixed(1)}`;}

function draw() {
  const width=state.screenWidth||canvas.clientWidth,height=state.screenHeight||canvas.clientHeight; context.clearRect(0,0,width,height);
  context.fillStyle='#203d2b';context.fillRect(0,0,width,height);
  if(!state.track||!state.player){drawLoading(width,height);return;}
  drawWorld(width,height); drawMinimap(width,height);
}
function drawLoading(width,height){context.fillStyle='#fff';context.font='700 14px Microsoft YaHei';context.textAlign='center';context.fillText('正在加载赛道遥测…',width/2,height/2);}

function drawWorld(width,height){
  const track=state.track,scale=state.viewScale; context.save();context.translate(width/2,height*.54);context.rotate(-state.player.heading-Math.PI/2);context.scale(scale,scale);context.translate(-state.player.x,-state.player.y);
  const centerPath=new Path2D(); track.points.forEach((point,index)=>index?centerPath.lineTo(point.x,point.y):centerPath.moveTo(point.x,point.y));centerPath.closePath();
  context.lineJoin='round';context.lineCap='round';context.strokeStyle='#1a1d20';context.lineWidth=track.width+12.5;context.stroke(centerPath);context.strokeStyle='#716e63';context.lineWidth=track.width+10;context.stroke(centerPath);context.strokeStyle='#eee9df';context.lineWidth=track.width+2.5;context.stroke(centerPath);context.strokeStyle='#d62d35';context.setLineDash([3.8,3.8]);context.lineWidth=track.width+2.2;context.stroke(centerPath);context.setLineDash([]);context.strokeStyle='#3f464d';context.lineWidth=track.width;context.stroke(centerPath);
  if(state.showLine) drawRacingLine(track);
  drawTimingLines(track); if(state.mode==='race') [...state.ai].sort((a,b)=>a.y-b.y).forEach(car=>drawCar(car,false));drawCar(state.player,true);context.restore();
}
function drawRacingLine(track){
  let lastColor='';let path=null; const flush=()=>{if(path){context.strokeStyle=lastColor;context.lineWidth=.72;context.globalAlpha=.9;context.stroke(path);context.globalAlpha=1;}};
  track.racingLine.forEach((point,index)=>{const color=track.brakeIndices.has(index)?'#ff4438':track.liftIndices.has(index)?'#ffbd35':'#28dbe8';if(color!==lastColor){flush();path=new Path2D();path.moveTo(point.x,point.y);lastColor=color;}else path.lineTo(point.x,point.y);});flush();
  context.font='700 3.2px Microsoft YaHei';context.textAlign='center';context.textBaseline='bottom';track.brakeZones.forEach(zone=>{const p=track.points[zone.index],nx=-Math.sin(p.heading),ny=Math.cos(p.heading);context.strokeStyle='#ff4438';context.lineWidth=.55;context.beginPath();context.moveTo(p.x+nx*track.width*.46,p.y+ny*track.width*.46);context.lineTo(p.x-nx*track.width*.46,p.y-ny*track.width*.46);context.stroke();context.save();context.translate(p.x,p.y);context.rotate(p.heading+Math.PI/2);context.fillStyle='#fff';context.fillText(`${zone.targetKmh}`,0,-1);context.restore();});
}
function drawTimingLines(track){[0,...track.sectorIndices].forEach((index,marker)=>{const p=track.points[index],nx=-Math.sin(p.heading),ny=Math.cos(p.heading);context.strokeStyle=marker===0?'#fff':'#32dbe8';context.lineWidth=.8;context.beginPath();context.moveTo(p.x+nx*track.width/2,p.y+ny*track.width/2);context.lineTo(p.x-nx*track.width/2,p.y-ny*track.width/2);context.stroke();});}
function drawCar(car,player){
  const [body,accent]=player?LIVERIES[state.livery]:[car.color,'#f2f2f2'];context.save();context.translate(car.x,car.y);context.rotate(car.heading);context.fillStyle='#07090b';
  [[-2.1,-1.25,1.45,.62],[-2.1,.63,1.45,.62],[1.3,-1.08,1.25,.48],[1.3,.60,1.25,.48]].forEach(rect=>context.fillRect(...rect));context.fillStyle=body;context.beginPath();context.moveTo(2.75,0);context.lineTo(.8,-.55);context.lineTo(-2.45,-.68);context.lineTo(-2.75,.68);context.lineTo(.8,.55);context.closePath();context.fill();context.fillStyle=accent;context.fillRect(-2.35,-.12,4.25,.24);context.fillStyle='#101318';context.beginPath();context.ellipse(-.55,0,.72,.38,0,0,Math.PI*2);context.fill();context.fillStyle='#080a0c';context.fillRect(-2.75,-1.05,.28,2.1);context.fillRect(2.05,-1.18,.25,2.36);if(player){context.strokeStyle='#fff';context.lineWidth=.08;context.strokeRect(-2.75,-1.05,5.05,2.1);}context.restore();
}
function drawMinimap(width,height){
  const track=state.track,box={x:width-210,y:115,w:185,h:130}; if(width<700)return;context.save();context.fillStyle='#070b10d9';context.fillRect(box.x,box.y,box.w,box.h);context.strokeStyle='#ffffff20';context.strokeRect(box.x,box.y,box.w,box.h);
  const bw=track.bounds.maxX-track.bounds.minX,bh=track.bounds.maxY-track.bounds.minY,s=Math.min((box.w-24)/bw,(box.h-24)/bh),ox=box.x+(box.w-bw*s)/2,oy=box.y+(box.h-bh*s)/2;context.beginPath();track.points.forEach((p,i)=>{const x=ox+(p.x-track.bounds.minX)*s,y=oy+(p.y-track.bounds.minY)*s;i?context.lineTo(x,y):context.moveTo(x,y)});context.closePath();context.strokeStyle='#aeb7c0';context.lineWidth=2;context.stroke();
  const dot=(car,color,r)=>{context.fillStyle=color;context.beginPath();context.arc(ox+(car.x-track.bounds.minX)*s,oy+(car.y-track.bounds.minY)*s,r,0,Math.PI*2);context.fill();};if(state.mode==='race')state.ai.forEach(car=>dot(car,car.color,2));dot(state.player,'#fff',3.5);context.restore();
}

function frame(timestamp){
  const dt=Math.min(.033,Math.max(0,(timestamp-state.lastFrame)/1000||0));state.lastFrame=timestamp;if(state.phase==='race')updateRace(dt);draw();requestAnimationFrame(frame);
}

async function initialize(){
  resizeCanvas();try{state.tracks=await loadTracks();TRACK_ORDER.forEach(id=>{const option=document.createElement('option');option.value=id;option.textContent=`${state.tracks[id].name} · ${state.tracks[id].country}`;ui.track.append(option);});state.track=state.tracks.spa;const p=state.track.points[0];state.player=new Vehicle();state.player.reset(p.x,p.y,p.heading);state.player.trackIndex=0;state.phase='menu';}catch(error){console.error(error);ui.menu.querySelector('.setup-panel').innerHTML=`<h2>赛道加载失败</h2><p>${error.message}</p><p>请通过网站服务器打开本页面，而不是直接双击 HTML 文件。</p>`;}requestAnimationFrame(frame);
}
initialize();
