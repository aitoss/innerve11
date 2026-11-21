import { MathUtils, Vector3 } from "three";

export const ENTRANCE_Z = 9;
export const EXIT_Z = -203;
export const BEND_Z = -72;
export const EYE_HEIGHT = 0.4;
const PITCH_DISTANCE = 7;

// The view tips down just before the lip and finishes turning inside the shaft.
export function turnAngle(z: number) {
  return MathUtils.smoothstep(BEND_Z - z, -PITCH_DISTANCE, PITCH_DISTANCE) * Math.PI / 2;
}

export function routePoint(x: number, y: number, z: number, out = new Vector3()) {
  const remaining = z - BEND_Z;
  const t = Math.min(Math.abs(remaining) / PITCH_DISTANCE, 1);
  // Slow to a stop at the corner, then pick up speed going straight down.
  const travel = remaining * t * (2 - t);
  const angle = turnAngle(z);
  const height = y - EYE_HEIGHT;
  return out.set(
    x,
    EYE_HEIGHT + Math.min(0, travel) + height * Math.cos(angle),
    BEND_Z + Math.max(0, travel) - height * Math.sin(angle),
  );
}

// Keep floating rooms clear of both the horizontal approach and the vertical shaft.
export function distanceToRide(x: number, y: number, z: number) {
  const entranceDz = z - MathUtils.clamp(z, BEND_Z, ENTRANCE_Z);
  const shaftDy = y - MathUtils.clamp(y, EYE_HEIGHT + EXIT_Z - BEND_Z, EYE_HEIGHT);
  return Math.sqrt(x * x + Math.min(
    (y - EYE_HEIGHT) ** 2 + entranceDz ** 2,
    shaftDy ** 2 + (z - BEND_Z) ** 2,
  ));
}

export function routeFraction(z: number) {
  return MathUtils.clamp((ENTRANCE_Z - z) / (ENTRANCE_Z - EXIT_Z), 0, 1);
}
