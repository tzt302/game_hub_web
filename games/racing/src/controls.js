export function normalizedTrigger(buttonValue = 0, axisValue = -1) {
  const button = Number.isFinite(buttonValue) ? buttonValue : 0;
  const axis = Number.isFinite(axisValue) ? Math.max(0, Math.min(1, (axisValue + 1) / 2)) : 0;
  return Math.max(button, axis);
}

export function readGamepad(pad, deadzone = 0.12) {
  if (!pad) return { steer: 0, throttle: 0, brake: 0, reset: false, pause: false };
  const rawSteer = pad.axes?.[0] || 0;
  const steer = Math.abs(rawSteer) > deadzone
    ? (Math.abs(rawSteer) - deadzone) / (1 - deadzone) * Math.sign(rawSteer)
    : 0;
  const standard = pad.mapping === 'standard';
  const throttle = normalizedTrigger(pad.buttons?.[7]?.value, standard ? -1 : pad.axes?.[5]);
  const brake = normalizedTrigger(pad.buttons?.[6]?.value, standard ? -1 : pad.axes?.[2]);
  return {
    steer,
    throttle,
    brake,
    reset: Boolean(pad.buttons?.[0]?.pressed || pad.buttons?.[1]?.pressed),
    pause: Boolean(pad.buttons?.[9]?.pressed)
  };
}

export function recoverySnapshot(history, now, seconds = 3) {
  if (!history.length) return null;
  const target = now - seconds;
  let selected = history[0];
  for (const snapshot of history) {
    if (snapshot.time > target) break;
    selected = snapshot;
  }
  return selected;
}
