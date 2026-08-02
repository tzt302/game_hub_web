export const TRACK_ORDER = ['spa', 'silverstone', 'monza', 'monaco', 'shanghai'];

const TRACK_NAMES = {
  spa: ['斯帕-弗朗科尔尚', 'BELGIUM'],
  silverstone: ['银石', 'GREAT BRITAIN'],
  monza: ['蒙扎', 'ITALY'],
  monaco: ['摩纳哥', 'MONACO'],
  shanghai: ['上海国际赛车场', 'CHINA']
};

const angleDelta = (a, b) => (a - b + Math.PI * 3) % (Math.PI * 2) - Math.PI;
const circularDelta = (index, center, count) => {
  let value = (index - center + count) % count;
  return value > count / 2 ? value - count : value;
};

export async function loadTracks() {
  const response = await fetch('./assets/telemetry_layouts.json');
  if (!response.ok) throw new Error(`赛道数据加载失败 (${response.status})`);
  const raw = await response.json();
  return Object.fromEntries(TRACK_ORDER.map(id => [id, buildTrack(id, raw[id])]));
}

export function buildTrack(id, raw) {
  const identity = TRACK_NAMES[id] || [String(id).toUpperCase(), 'TEST'];
  const points = raw.points.map(row => ({
    x: Number(row[0]), y: Number(row[1]), speed: Number(row[2]), gear: Number(row[3]),
    throttle: Number(row[4]), brake: Boolean(row[5]), rpm: Number(row[6]),
    elevation: Number(row[7] || 0), elapsed: Number(row[8] || 0), heading: 0, curvature: 0
  }));
  const count = points.length;
  points.forEach((point, index) => {
    const previous = points[(index - 1 + count) % count];
    const next = points[(index + 1) % count];
    point.heading = Math.atan2(next.y - previous.y, next.x - previous.x);
  });
  points.forEach((point, index) => {
    const before = points[(index - 2 + count) % count];
    const after = points[(index + 2) % count];
    point.curvature = angleDelta(after.heading, before.heading) / Math.max(1, raw.sample_m * 4);
  });

  const usable = Math.max(1, raw.width / 2 - 1.65);
  const offsets = new Array(count).fill(0);
  const candidates = points
    .map((point, index) => ({ index, strength: Math.abs(point.curvature) }))
    .filter(candidate => candidate.strength > 0.0035)
    .filter(candidate => {
      for (let d = -10; d <= 10; d += 1) {
        if (Math.abs(points[(candidate.index + d + count) % count].curvature) > candidate.strength) return false;
      }
      return true;
    })
    .sort((a, b) => b.strength - a.strength);
  const apexes = [];
  for (const candidate of candidates) {
    if (apexes.every(apex => Math.min((candidate.index - apex + count) % count, (apex - candidate.index + count) % count) >= 14)) apexes.push(candidate.index);
  }
  const gaussian = (delta, sigma) => Math.exp(-0.5 * (delta / sigma) ** 2);
  for (const apex of apexes) {
    const turn = Math.sign(points[apex].curvature) || 1;
    const severity = Math.max(.42, Math.min(1, Math.abs(points[apex].curvature) / .03));
    for (let index = 0; index < count; index += 1) {
      offsets[index] += turn * (
        usable * (.58 + severity * .20) * gaussian(circularDelta(index, apex, count), 7)
        - usable * (.42 + severity * .16) * gaussian(circularDelta(index, (apex - 18 + count) % count, count), 10)
        - usable * (.42 + severity * .16) * gaussian(circularDelta(index, (apex + 16) % count, count), 10)
      );
    }
  }
  for (let pass = 0; pass < 4; pass += 1) {
    const smoothed = offsets.map((_, i) => {
      let total = 0;
      for (let d = -2; d <= 2; d += 1) total += offsets[(i + d + count) % count];
      return total / 5;
    });
    offsets.splice(0, count, ...smoothed);
  }
  const racingLine = points.map((point, index) => {
    const offset = Math.max(-usable, Math.min(usable, offsets[index]));
    return { x: point.x - Math.sin(point.heading) * offset, y: point.y + Math.cos(point.heading) * offset };
  });
  const brakeIndices = new Set();
  const liftIndices = new Set();
  const brakeZones = [];
  points.forEach((point, index) => {
    const previous = points[(index - 1 + count) % count];
    if (!point.brake || previous.brake) return;
    let run = 0;
    while (run < 80 && points[(index + run) % count].brake) { brakeIndices.add((index + run) % count); run += 1; }
    if (run < 2) return;
    for (let d = 1; d <= 8; d += 1) liftIndices.add((index - d + count) % count);
    let apex = index;
    for (let d = 0; d < Math.min(28, run + 20); d += 1) if (points[(index + d) % count].speed < points[apex].speed) apex = (index + d) % count;
    brakeZones.push({ index, apex, targetKmh: Math.round(points[apex].speed) });
  });
  const xs = points.map(point => point.x); const ys = points.map(point => point.y);
  return {
    id, name: identity[0], country: identity[1], points, racingLine, offsets,
    brakeIndices, liftIndices, brakeZones, width: Number(raw.width), length: Number(raw.length_m),
    laps: Number(raw.laps), sampleM: Number(raw.sample_m || 5), sectorIndices: raw.sector_indices,
    referenceLap: Number(raw.lap_time), bounds: { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) }
  };
}

export function nearestIndex(track, x, y, hint = null) {
  const count = track.points.length;
  let bestIndex = 0; let bestDistance = Infinity;
  const inspect = index => {
    const point = track.points[(index + count) % count];
    const distance = (point.x - x) ** 2 + (point.y - y) ** 2;
    if (distance < bestDistance) { bestDistance = distance; bestIndex = (index + count) % count; }
  };
  if (Number.isInteger(hint)) {
    for (let delta = -35; delta <= 55; delta += 1) inspect(hint + delta);
    if (bestDistance < 70 ** 2) return { index: bestIndex, distance: Math.sqrt(bestDistance) };
  }
  for (let index = 0; index < count; index += 1) inspect(index);
  return { index: bestIndex, distance: Math.sqrt(bestDistance) };
}

export function progressScore(car, track) {
  return (car.lap - 1) + car.trackIndex / track.points.length;
}
