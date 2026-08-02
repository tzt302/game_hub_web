import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Vehicle } from '../src/physics.js';
import { buildTrack, nearestIndex } from '../src/track.js';
import { AIDriver } from '../src/ai.js';

const realTrackData = JSON.parse(readFileSync(new URL('../assets/telemetry_layouts.json', import.meta.url), 'utf8'));

function sampleTrack() {
  const points = Array.from({ length: 160 }, (_, index) => {
    const angle = index / 160 * Math.PI * 2;
    const speed = 170 + 90 * (1 + Math.cos(angle * 4)) / 2;
    const brake = speed < 190;
    return [Math.cos(angle) * 130, Math.sin(angle) * 90, speed, 5, brake ? 0 : 1, brake, 10000, 0, index * .5];
  });
  return buildTrack('test', { points, width: 15, length_m: 700, laps: 3, sample_m: 5, sector_indices: [53, 106], lap_time: 80 });
}

test('vehicle accelerates, brakes and shifts with browser inputs', () => {
  const car = new Vehicle();
  for (let frame = 0; frame < 600; frame += 1) car.update(1 / 60, 0, 1, 0);
  const fast = car.speed;
  assert.ok(fast > 55);
  assert.ok(car.gear >= 5);
  for (let frame = 0; frame < 90; frame += 1) car.update(1 / 60, 0, 0, 1);
  assert.ok(car.speed < fast * .55);
});

test('track builder creates a bounded racing line and braking guide', () => {
  const track = sampleTrack();
  assert.equal(track.points.length, 160);
  assert.equal(track.racingLine.length, track.points.length);
  assert.ok(track.brakeIndices.size > 0);
  assert.ok(track.brakeZones.length >= 3);
  assert.ok(Math.max(...track.offsets.map(Math.abs)) <= track.width / 2);
});

test('nearest point uses local hint and returns physical distance', () => {
  const track = sampleTrack();
  const point = track.points[80];
  const nearest = nearestIndex(track, point.x + 1, point.y - 1, 78);
  assert.ok(Math.abs(nearest.index - 80) <= 1);
  assert.ok(nearest.distance < 2);
});

test('AI follows the line and produces valid controls', () => {
  const track = sampleTrack(); const point = track.points[0];
  const ai = new AIDriver(track, ['TEST', '#fff', .9], 'normal');
  ai.reset(point.x, point.y, point.heading); ai.trackIndex = 0;
  for (let frame = 0; frame < 180; frame += 1) ai.drive(1 / 60, [ai]);
  assert.ok(ai.speed > 5);
  assert.ok(Number.isFinite(ai.x) && Number.isFinite(ai.y));
  assert.ok(Math.abs(ai.smoothSteer) <= 1);
});

test('all five 2.5 telemetry circuits build for the browser', () => {
  for (const id of ['spa','silverstone','monza','monaco','shanghai']) {
    const track = buildTrack(id, realTrackData[id]);
    assert.ok(track.points.length > 600, id);
    assert.ok(track.brakeZones.length > 3, id);
    assert.equal(track.sectorIndices.length, 2, id);
  }
});
