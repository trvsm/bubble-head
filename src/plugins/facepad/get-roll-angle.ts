// Type for a single landmark point:
interface Point {
  x: number;
  y: number;
}

/**
 * Returns the center (average) of multiple landmark points.
 */
function getCenterOfLandmarks(landmarks: Point[], indices: number[]): Point {
  let sumX = 0;
  let sumY = 0;

  for (const idx of indices) {
    sumX += landmarks[idx].x;
    sumY += landmarks[idx].y;
  }

  return {
    x: sumX / indices.length,
    y: sumY / indices.length,
  };
}

/**
 * Computes the roll angle (in degrees) of the face using the
 * left and right eye positions from a 68-point landmark set.
 *
 * The 68-point model (as per dlib) typically uses:
 *  - Left eye:  indices 36..41
 *  - Right eye: indices 42..47
 *
 * This function calculates the angle of the line connecting the
 * two eye centers relative to the horizontal axis.
 */
export function getFaceRollAngle(landmarks: Point[]): number {
  // Indices for eyes in the 68-point model
  const LEFT_EYE_INDICES = [36, 37, 38, 39, 40, 41];
  const RIGHT_EYE_INDICES = [42, 43, 44, 45, 46, 47];

  // Compute centers of left and right eyes
  const leftEyeCenter = getCenterOfLandmarks(landmarks, LEFT_EYE_INDICES);
  const rightEyeCenter = getCenterOfLandmarks(landmarks, RIGHT_EYE_INDICES);

  // Calculate the angle between the two eye centers
  const dx = rightEyeCenter.x - leftEyeCenter.x;
  const dy = rightEyeCenter.y - leftEyeCenter.y;

  // Angle in radians, then convert to degrees
  const angleRad = Math.atan2(dy, dx);
  const angleDeg = (angleRad * 180) / Math.PI;

  return angleDeg;
}
