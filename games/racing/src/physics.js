export const PHYSICS = {
  maxSpeed: 390 / 3.6, acceleration: 16.8, brakeForce: 28, drag: .00095,
  rolling: .20, wheelbase: 3.6, steerLock: .48, tyreGrip: 2.04,
  aeroGrip: .00053, carLength: 5.55, carWidth: 2
};

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const approach = (value, target, amount) => value < target ? Math.min(target, value + amount) : Math.max(target, value - amount);

export class Vehicle {
  constructor(color = '#e62c36', name = 'YOU') {
    this.color = color; this.name = name; this.gridPosition = 0; this.lap = 1; this.trackIndex = 0;
    this.bestLap = Infinity; this.lastLap = 0; this.reset(0, 0, 0);
  }
  reset(x, y, heading) {
    Object.assign(this, { x, y, heading, speed: 0, steerAngle: 0, slipAngle: 0, yawRate: 0,
      throttle: 0, brake: 0, gear: 1, rpm: 4000, surface: 'asphalt', crashed: false });
  }
  update(dt, steerInput, throttleInput, brakeInput) {
    const surface = { asphalt:[1,1,1], kerb:[.88,.92,2], runoff:[.72,.68,4.5], grass:[.4,.32,9] }[this.surface] || [1,1,1];
    steerInput = clamp(steerInput || 0, -1, 1); throttleInput = clamp(throttleInput || 0, 0, 1); brakeInput = clamp(brakeInput || 0, 0, 1);
    this.throttle = throttleInput; this.brake = brakeInput;
    const speedRatio = clamp(this.speed / PHYSICS.maxSpeed, 0, 1);
    const shaped = Math.sign(steerInput) * Math.sin(Math.abs(steerInput) * Math.PI / 2) ** 1.35;
    const grip = (PHYSICS.tyreGrip + PHYSICS.aeroGrip * this.speed ** 2) * 9.81 * surface[0];
    const controlSpeed = Math.max(this.speed, 15);
    const targetSteer = clamp(Math.atan(shaped * grip * (PHYSICS.wheelbase + .00011 * this.speed ** 2) / controlSpeed ** 2) + shaped * PHYSICS.steerLock * (1 - clamp(this.speed / 15, 0, 1)), -PHYSICS.steerLock, PHYSICS.steerLock);
    this.steerAngle = approach(this.steerAngle, targetSteer, (3 - 1.65 * speedRatio) * dt);
    const engine = throttleInput * PHYSICS.acceleration * (1 - .42 * speedRatio ** 1.7) * surface[1];
    const braking = brakeInput * PHYSICS.brakeForce * (.88 + .12 * surface[0]);
    const engineBrake = throttleInput < .1 ? (1 - throttleInput / .1) * (.48 + .55 * clamp((this.rpm - 4000) / 9000, 0, 1)) : 0;
    this.speed = clamp(this.speed + (engine - braking - engineBrake - PHYSICS.drag * this.speed ** 2 - PHYSICS.rolling * surface[2]) * dt, 0, PHYSICS.maxSpeed);
    const lateralUsage = clamp(brakeInput * .78 + throttleInput * .2, 0, .98);
    const lateralLimit = grip * Math.sqrt(1 - lateralUsage ** 2);
    if (this.speed > .35) {
      const demandedYaw = this.speed * Math.tan(this.steerAngle) / (PHYSICS.wheelbase + .00011 * this.speed ** 2);
      const yawLimit = lateralLimit / Math.max(this.speed, 3);
      const targetYaw = clamp(demandedYaw * (1 + .08 * brakeInput), -yawLimit, yawLimit);
      this.yawRate += (targetYaw - this.yawRate) * Math.min(1, dt / clamp(3 / Math.max(this.speed, 5), .04, .24));
      this.slipAngle += (clamp((demandedYaw - targetYaw) * -.04, -.105, .105) - this.slipAngle) * Math.min(1, 8 * dt);
      this.heading = (this.heading + this.yawRate * dt + Math.PI * 3) % (Math.PI * 2) - Math.PI;
    }
    this.x += this.speed * Math.cos(this.heading + this.slipAngle) * dt;
    this.y += this.speed * Math.sin(this.heading + this.slipAngle) * dt;
    this.updateGearbox();
  }
  updateGearbox() {
    const speed = this.speed * 3.6, upper = [78,122,168,216,266,314,354,398], lower = [0,56,96,136,178,224,272,318];
    while (this.gear < 8 && speed > upper[this.gear - 1]) this.gear += 1;
    while (this.gear > 1 && speed < lower[this.gear - 1]) this.gear -= 1;
    this.rpm = Math.round(4200 + clamp((speed - lower[this.gear - 1]) / Math.max(1, upper[this.gear - 1] - lower[this.gear - 1]), 0, 1) * 8800);
  }
}
