import { loadTracks, TRACK_ORDER, nearestIndex, progressScore } from './track.js';
import { Vehicle, PHYSICS } from './physics.js';
import { AIDriver, AI_PROFILES } from './ai.js';
import { readGamepad, recoverySnapshot } from './controls.js';
import { initGlobalLeaderboard } from '../../shared/leaderboard.js';

if (new URLSearchParams(window.location.search).has('embed')) document.body.classList.add('embed');

const $ = selector => document.querySelector(selector);
const canvas = $('#gameCanvas');
const context = canvas.getContext('2d');
const ui = {
  menu: $('#menuScreen'), guide: $('#guideScreen'), pause: $('#pauseScreen'), hud: $('#hud'), lights: $('#startLights'),
  track: $('#trackSelect'), mode: $('#modeSelect'), difficulty: $('#difficultySelect'), view: $('#viewSelect'), livery: $('#liverySelect'),
  lap: $('#lapLabel'), time: $('#lapTime'), speed: $('#speedLabel'), gear: $('#gearLabel'), position: $('#positionLabel'),
  delta: $('#delta'), leaderboard: $('#leaderboard'), notice: $('#notice'), modeLabel: $('#modeLabel'),
  throttle: $('#throttleBar'), brake: $('#brakeBar'), recovery: $('#recoveryCountdown'), sectors: [$('#sector1'), $('#sector2'), $('#sector3')]
};
const LIVERIES = { scarlet:['#e32f3d','#ffd34e'], papaya:['#f57a20','#27394b'], silver:['#2dbbab','#f1f3f4'], blue:['#3157d5','#ef3745'] };
const input = { left:false, right:false, throttle:false, brake:false };
const state = {
  phase:'loading', tracks:null, track:null, player:null, ai:[], mode:'time', difficulty:'normal', viewScale:2.55,
  livery:'scarlet', showLine:true, lap:1, totalLaps:3, lapTime:0, lastIndex:0, sector:0, sectorTimes:[null,null,null],
  currentTrace:[], bestTrace:null, bestLap:Infinity, delta:null, countdown:0, lightsOut:true, lastFrame:0,
  outside:false, warnings:0, penalty:0, noticeTimer:0, wrongWay:0, lapValid:true, gamepadReset:false, gamepadPause:false,
  raceClock:0, recoveryHistory:[], recoverySampleTimer:0, recovery:null
};
let globalRunId = `racing-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const worldBoard = initGlobalLeaderboard({ gameId:'racing', mode:'time:loading', title:'赛车全球最快圈', formatValue:value=>formatTime(Number(value)/1000) });

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
  globalRunId = `racing-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const [body] = LIVERIES[state.livery]; state.player = new Vehicle(body, 'YOU');
  state.ai = AI_PROFILES.map(profile => new AIDriver(state.track, profile, state.difficulty));
  if (state.mode === 'race') {
    state.lastIndex = placeCar(state.player, 9); state.ai.forEach((car,index) => placeCar(car,index));
    state.countdown = 0; state.lightsOut = false;
  } else {
    const point = state.track.points[0]; state.player.reset(point.x, point.y, point.heading); state.player.trackIndex = 0; state.lastIndex = 0;
    state.ai.forEach((car,index) => placeCar(car,index)); state.lightsOut = true;
  }
  Object.assign(state,{lap:1,totalLaps:state.track.laps,lapTime:0,sector:0,sectorTimes:[null,null,null],currentTrace:new Array(state.track.points.length).fill(null),bestTrace:null,bestLap:Infinity,delta:null,outside:false,warnings:0,penalty:0,wrongWay:0,lapValid:true,raceClock:0,recoveryHistory:[],recoverySampleTimer:0,recovery:null});
  ui.recovery.classList.add('hidden');
  ui.lights.classList.toggle('hidden', state.lightsOut); updateHud();
}

function startConfiguredSession() {
  state.track = state.tracks[ui.track.value]; state.mode = ui.mode.value; state.difficulty = ui.difficulty.value;
  state.viewScale = Number(ui.view.value); state.livery = ui.livery.value; resetSession();
  worldBoard.setMode(`${state.mode}:${state.track.id}`);
  ui.guide.classList.add('hidden'); ui.menu.classList.add('hidden'); ui.hud.classList.remove('hidden'); state.phase = 'race';
  canvas.focus({ preventScroll:true });
  window.scrollTo({ top:0, left:0, behavior:'auto' });
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
  if (event.code === 'KeyR' && state.phase === 'race') requestRecovery();
  if (event.code === 'KeyL' && state.phase === 'race') state.showLine = !state.showLine;
});
window.addEventListener('keyup', event => { if (keyMap[event.code]) { input[keyMap[event.code]] = false; event.preventDefault(); } });
document.querySelectorAll('[data-control]').forEach(button => {
  const control = button.dataset.control;
  const set = value => { input[control] = value; };
  button.addEventListener('pointerdown', event => { event.preventDefault(); button.setPointerCapture(event.pointerId); set(true); });
  ['pointerup','pointercancel','lostpointercapture'].forEach(type => button.addEventListener(type, () => set(false)));
});
document.querySelector('[data-recover]').addEventListener('pointerdown', event => { event.preventDefault(); requestRecovery(); });
document.querySelectorAll('.touch-controls button').forEach(button => {
  ['contextmenu','selectstart','dragstart'].forEach(type => button.addEventListener(type, event => event.preventDefault()));
});

function recoverPlayer(message = '车辆已重置') {
  const point = state.track.points[state.player.trackIndex]; state.player.reset(point.x, point.y, point.heading); state.player.trackIndex = state.lastIndex = state.player.trackIndex; setNotice(message);
}

function recordRecoverySnapshot(dt) {
  state.raceClock += dt;
  state.recoverySampleTimer += dt;
  if (state.recoverySampleTimer < .1) return;
  state.recoverySampleTimer = 0;
  const player = state.player;
  state.recoveryHistory.push({ time:state.raceClock, x:player.x, y:player.y, heading:player.heading, speed:player.speed, trackIndex:player.trackIndex });
  while (state.recoveryHistory.length && state.recoveryHistory[0].time < state.raceClock - 6) state.recoveryHistory.shift();
}

function requestRecovery() {
  if (state.phase !== 'race' || state.recovery || !state.player || !state.track) return;
  const saved = recoverySnapshot(state.recoveryHistory, state.raceClock, 3);
  const point = state.track.points[state.player.trackIndex];
  state.recovery = { remaining:3, shown:3, target:saved || { x:point.x, y:point.y, heading:point.heading, speed:0, trackIndex:state.player.trackIndex } };
  Object.keys(input).forEach(key => { input[key] = false; });
  ui.recovery.querySelector('strong').textContent = '3';
  ui.recovery.classList.remove('hidden');
}

function updateRecovery(dt) {
  if (!state.recovery) return false;
  state.recovery.remaining -= dt;
  const shown = Math.max(1, Math.ceil(state.recovery.remaining));
  if (shown !== state.recovery.shown) {
    state.recovery.shown = shown;
    const label = ui.recovery.querySelector('strong');
    label.textContent = String(shown);
    label.style.animation = 'none'; void label.offsetWidth; label.style.animation = '';
  }
  if (state.recovery.remaining > 0) return true;
  const target = state.recovery.target;
  state.player.reset(target.x, target.y, target.heading);
  state.player.speed = Math.max(0, target.speed || 0);
  state.player.trackIndex = target.trackIndex;
  state.lastIndex = target.trackIndex;
  state.lapValid = false; state.delta = null; state.currentTrace.fill(null); state.outside = false; state.wrongWay = 0;
  state.recovery = null; ui.recovery.classList.add('hidden'); setNotice('已回到 3 秒前 · 本圈无效');
  return true;
}

function activeGamepad() { return Array.from(navigator.getGamepads?.() || []).find(Boolean); }

function handleGamepadButtons() {
  const controls = readGamepad(activeGamepad());
  if (controls.reset && !state.gamepadReset && state.phase === 'race') requestRecovery();
  if (controls.pause && !state.gamepadPause && ['race','paused'].includes(state.phase)) togglePause(state.phase === 'race');
  state.gamepadReset = controls.reset; state.gamepadPause = controls.pause;
}

function readControls() {
  let steer=(input.right?1:0)-(input.left?1:0),throttle=input.throttle?1:0,brake=input.brake?1:0;
  const gamepad = readGamepad(activeGamepad());
  if (gamepad.steer) steer = gamepad.steer;
  throttle = Math.max(throttle, gamepad.throttle); brake = Math.max(brake, gamepad.brake);
  return{steer,throttle,brake};
}

function updateRace(dt) {
  if (updateRecovery(dt)) return;
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
  recordRecoverySnapshot(dt);
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
  if (state.lapValid&&state.currentTrace.some(Number.isFinite) && state.lapTime < state.bestLap) { state.bestLap = state.lapTime; state.bestTrace = completeTrace(state.currentTrace,state.lapTime); setNotice(`个人最快圈 ${formatTime(state.bestLap)}`); worldBoard.submit({durationMs:Math.round(state.bestLap*1000),runId:globalRunId,mode:`${state.mode}:${state.track.id}`,metadata:{track:state.track.id,session_mode:state.mode,penalty:state.penalty}}); }
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
  drawBackdrop(width,height);
  if(!state.track||!state.player){drawLoading(width,height);return;}
  drawWorld(width,height); drawMinimap(width,height);
}
function roundedRectPath(x,y,width,height,radius){
  const r=Math.min(radius,width/2,height/2);context.beginPath();context.moveTo(x+r,y);context.lineTo(x+width-r,y);context.quadraticCurveTo(x+width,y,x+width,y+r);context.lineTo(x+width,y+height-r);context.quadraticCurveTo(x+width,y+height,x+width-r,y+height);context.lineTo(x+r,y+height);context.quadraticCurveTo(x,y+height,x,y+height-r);context.lineTo(x,y+r);context.quadraticCurveTo(x,y,x+r,y);context.closePath();
}
function drawBackdrop(width,height){
  const gradient=context.createLinearGradient(0,0,width,height);gradient.addColorStop(0,'#79e49a');gradient.addColorStop(.58,'#55d98d');gradient.addColorStop(1,'#35c87e');context.fillStyle=gradient;context.fillRect(0,0,width,height);
  context.save();context.globalAlpha=.2;for(let y=22;y<height;y+=58){for(let x=22+(Math.floor(y/58)%2)*28;x<width;x+=58){context.fillStyle=(x+y)%3?'#ffffff':'#ffe264';context.beginPath();context.arc(x,y,2.3,0,Math.PI*2);context.fill();}}context.restore();
}
function drawLoading(width,height){context.fillStyle='#123d52';context.font='900 15px Microsoft YaHei';context.textAlign='center';context.fillText('正在准备玩具赛道…',width/2,height/2);}

function drawWorld(width,height){
  const track=state.track,scale=state.viewScale; context.save();context.translate(width/2,height*.54);context.rotate(-state.player.heading-Math.PI/2);context.scale(scale,scale);context.translate(-state.player.x,-state.player.y);
  const centerPath=new Path2D(); track.points.forEach((point,index)=>index?centerPath.lineTo(point.x,point.y):centerPath.moveTo(point.x,point.y));centerPath.closePath();
  context.lineJoin='round';context.lineCap='round';
  context.strokeStyle='#15736a';context.lineWidth=track.width+15.5;context.stroke(centerPath);
  context.strokeStyle='#ffe05b';context.lineWidth=track.width+12.5;context.stroke(centerPath);
  context.strokeStyle='#fffdf1';context.lineWidth=track.width+9.2;context.stroke(centerPath);
  context.strokeStyle='#ff6558';context.setLineDash([3.8,3.8]);context.lineWidth=track.width+7.2;context.stroke(centerPath);context.setLineDash([]);
  context.strokeStyle='#526b7a';context.lineWidth=track.width;context.stroke(centerPath);
  context.strokeStyle='rgba(255,255,255,.22)';context.setLineDash([1.1,5]);context.lineWidth=.24;context.stroke(centerPath);context.setLineDash([]);
  if(state.showLine) drawRacingLine(track);
  drawTimingLines(track); if(state.mode==='race') [...state.ai].sort((a,b)=>a.y-b.y).forEach(car=>drawCar(car,false));drawCar(state.player,true);context.restore();
}
function drawRacingLine(track){
  let lastColor='';let path=null; const flush=()=>{if(path){context.strokeStyle='rgba(7,68,78,.22)';context.lineWidth=1.35;context.stroke(path);context.strokeStyle=lastColor;context.lineWidth=.85;context.globalAlpha=.96;context.stroke(path);context.globalAlpha=1;}};
  track.racingLine.forEach((point,index)=>{const color=track.brakeIndices.has(index)?'#ff4438':track.liftIndices.has(index)?'#ffbd35':'#28dbe8';if(color!==lastColor){flush();path=new Path2D();path.moveTo(point.x,point.y);lastColor=color;}else path.lineTo(point.x,point.y);});flush();
  context.font='900 3.1px Microsoft YaHei';context.textAlign='center';context.textBaseline='bottom';track.brakeZones.forEach(zone=>{const p=track.points[zone.index],nx=-Math.sin(p.heading),ny=Math.cos(p.heading);context.strokeStyle='#ff6758';context.lineWidth=.72;context.beginPath();context.moveTo(p.x+nx*track.width*.46,p.y+ny*track.width*.46);context.lineTo(p.x-nx*track.width*.46,p.y-ny*track.width*.46);context.stroke();context.save();context.translate(p.x,p.y);context.rotate(p.heading+Math.PI/2);context.fillStyle='#fff8bf';context.fillText(`${zone.targetKmh}`,0,-1);context.restore();});
}
function drawTimingLines(track){[0,...track.sectorIndices].forEach((index,marker)=>{const p=track.points[index],nx=-Math.sin(p.heading),ny=Math.cos(p.heading);context.strokeStyle=marker===0?'#fff8b8':'#42e8dd';context.lineWidth=1;context.beginPath();context.moveTo(p.x+nx*track.width/2,p.y+ny*track.width/2);context.lineTo(p.x-nx*track.width/2,p.y-ny*track.width/2);context.stroke();});}
function drawCar(car,player){
  const [body,accent]=player?LIVERIES[state.livery]:[car.color,'#fff4a3'];context.save();context.translate(car.x,car.y);context.rotate(car.heading);context.scale(1.55,1.55);
  context.fillStyle='rgba(8,68,73,.32)';context.beginPath();context.ellipse(-.15,.18,3.45,1.48,0,0,Math.PI*2);context.fill();
  context.fillStyle='#172b35';[[-2.18,-1.27,1.42,.66],[-2.18,.61,1.42,.66],[1.24,-1.12,1.2,.52],[1.24,.60,1.2,.52]].forEach(([x,y,w,h])=>{roundedRectPath(x,y,w,h,.2);context.fill();});
  context.fillStyle=body;context.beginPath();context.moveTo(2.86,0);context.quadraticCurveTo(1.7,-.28,.78,-.62);context.lineTo(-1.7,-.78);context.quadraticCurveTo(-2.62,-.64,-2.78,0);context.quadraticCurveTo(-2.62,.64,-1.7,.78);context.lineTo(.78,.62);context.quadraticCurveTo(1.7,.28,2.86,0);context.closePath();context.fill();
  context.strokeStyle='rgba(255,255,255,.72)';context.lineWidth=.12;context.stroke();
  context.fillStyle=accent;roundedRectPath(-2.35,-.15,4.42,.3,.14);context.fill();
  context.fillStyle='rgba(255,255,255,.35)';roundedRectPath(-1.75,-.54,1.65,.18,.09);context.fill();
  context.fillStyle='#17303a';context.beginPath();context.ellipse(-.48,0,.78,.42,0,0,Math.PI*2);context.fill();
  context.fillStyle=accent;context.beginPath();context.arc(-.58,0,.29,0,Math.PI*2);context.fill();
  context.fillStyle='#112631';roundedRectPath(-2.84,-1.06,.31,2.12,.12);context.fill();roundedRectPath(2.05,-1.2,.28,2.4,.12);context.fill();
  context.fillStyle='rgba(255,255,255,.9)';roundedRectPath(2.34,-.16,.42,.32,.13);context.fill();
  if(player){context.strokeStyle='#fff7a8';context.lineWidth=.18;context.setLineDash([.45,.28]);context.beginPath();context.ellipse(-.05,0,3.35,1.38,0,0,Math.PI*2);context.stroke();context.setLineDash([]);}context.restore();
}
function drawMinimap(width,height){
  const track=state.track,box={x:width-210,y:112,w:185,h:132}; if(width<700)return;context.save();context.fillStyle='rgba(249,255,253,.92)';roundedRectPath(box.x,box.y,box.w,box.h,18);context.fill();context.strokeStyle='rgba(255,255,255,.95)';context.lineWidth=3;context.stroke();context.fillStyle='rgba(10,82,93,.2)';roundedRectPath(box.x,box.y+box.h-5,box.w,9,5);context.fill();
  const bw=track.bounds.maxX-track.bounds.minX,bh=track.bounds.maxY-track.bounds.minY,s=Math.min((box.w-28)/bw,(box.h-28)/bh),ox=box.x+(box.w-bw*s)/2,oy=box.y+(box.h-bh*s)/2;context.beginPath();track.points.forEach((p,i)=>{const x=ox+(p.x-track.bounds.minX)*s,y=oy+(p.y-track.bounds.minY)*s;i?context.lineTo(x,y):context.moveTo(x,y)});context.closePath();context.strokeStyle='#4d6775';context.lineWidth=5;context.stroke();context.strokeStyle='#fff';context.lineWidth=2;context.stroke();
  const dot=(car,color,r)=>{context.fillStyle='#123d52';context.beginPath();context.arc(ox+(car.x-track.bounds.minX)*s,oy+(car.y-track.bounds.minY)*s,r+1.4,0,Math.PI*2);context.fill();context.fillStyle=color;context.beginPath();context.arc(ox+(car.x-track.bounds.minX)*s,oy+(car.y-track.bounds.minY)*s,r,0,Math.PI*2);context.fill();};if(state.mode==='race')state.ai.forEach(car=>dot(car,car.color,2.2));dot(state.player,'#ff6758',4);context.restore();
}

function frame(timestamp){
  const dt=Math.min(.033,Math.max(0,(timestamp-state.lastFrame)/1000||0));state.lastFrame=timestamp;handleGamepadButtons();if(state.phase==='race')updateRace(dt);draw();requestAnimationFrame(frame);
}

async function initialize(){
  resizeCanvas();try{state.tracks=await loadTracks();TRACK_ORDER.forEach(id=>{const option=document.createElement('option');option.value=id;option.textContent=`${state.tracks[id].name} · ${state.tracks[id].country}`;ui.track.append(option);});state.track=state.tracks.spa;const p=state.track.points[0];state.player=new Vehicle();state.player.reset(p.x,p.y,p.heading);state.player.trackIndex=0;state.phase='menu';}catch(error){console.error(error);ui.menu.querySelector('.setup-panel').innerHTML=`<h2>赛道加载失败</h2><p>${error.message}</p><p>请通过网站服务器打开本页面，而不是直接双击 HTML 文件。</p>`;}requestAnimationFrame(frame);
}
initialize();
