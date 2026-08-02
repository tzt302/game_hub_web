import { Vehicle } from './physics.js';
import { nearestIndex } from './track.js';

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const angleDelta = (a, b) => (a - b + Math.PI * 3) % (Math.PI * 2) - Math.PI;

export const AI_PROFILES = [
  ['NOVA','#3977f5',.96],['APEX','#f68a26',.93],['VOLT','#2fc39f',.90],['ORBIT','#b04fe1',.87],
  ['ROOK','#e9d839',.84],['CRIMSON','#cf2b3b',.91],['ARROW','#e7edf2',.89],['ZENITH','#43cf69',.86],['PHANTOM','#666c78',.88]
];

export class AIDriver extends Vehicle {
  constructor(track, profile, difficulty = 'normal') {
    super(profile[1], profile[0]); this.track = track; this.skill = profile[2]; this.difficulty = difficulty; this.smoothSteer = 0;
  }
  drive(dt, rivals = []) {
    const nearest = nearestIndex(this.track, this.x, this.y, this.trackIndex);
    this.trackIndex = nearest.index;
    const count = this.track.points.length;
    const lookSteps = Math.max(4, Math.round((18 + this.speed * .55) / this.track.sampleM));
    const targetIndex = (this.trackIndex + lookSteps) % count;
    const line = this.track.racingLine[targetIndex]; const center = this.track.points[targetIndex];
    let targetX = center.x + (line.x - center.x) * (nearest.distance < this.track.width * .4 ? .76 : .35);
    let targetY = center.y + (line.y - center.y) * (nearest.distance < this.track.width * .4 ? .76 : .35);
    for (const rival of rivals) {
      if (rival === this) continue;
      const gap = ((rival.trackIndex - this.trackIndex + count) % count) * this.track.sampleM;
      if (gap > 0 && gap < 30) { const side = this.gridPosition % 2 ? 1 : -1; targetX += -Math.sin(center.heading) * side * 1.6; targetY += Math.cos(center.heading) * side * 1.6; break; }
    }
    const desiredHeading = Math.atan2(targetY - this.y, targetX - this.x);
    const steer = clamp(angleDelta(desiredHeading, this.heading) * 2.1, -1, 1);
    this.smoothSteer += (steer - this.smoothSteer) * Math.min(1, 7 * dt);
    let targetKmh = 390;
    for (let step = 5; step < 36; step += 2) targetKmh = Math.min(targetKmh, this.track.points[(this.trackIndex + step) % count].speed);
    const difficulty = { easy:.89, normal:.98, hard:1.035 }[this.difficulty] || .98;
    let targetSpeed = targetKmh / 3.6 * (.82 + this.skill * .18) * difficulty;
    if (nearest.distance > this.track.width * .43) targetSpeed *= .72;
    const error = targetSpeed - this.speed;
    const throttle = error > 0 ? clamp(error / 9 + .18, 0, 1) : 0;
    const brake = error < 0 ? clamp(-error / 12, 0, 1) : 0;
    this.update(dt, this.smoothSteer, throttle, brake);
  }
}
