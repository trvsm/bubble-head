type CenterBox = {
  x: number; // center of bounding box (X)
  y: number; // center of bounding box (Y)
  width: number; // bounding box total width
  height: number; // bounding box total height
};

/**
 * Determines whether a circle (described by a center-based bounding box)
 * intersects a right-angled triangle (also described by a center-based bounding box
 * plus info about which corner is the right angle).
 *
 * @param triangleBox    The bounding box for the triangle, with (x,y) as its center
 * @param circleBox      The bounding box for the circle, with (x,y) as its center
 * @param rightAngleCorner Either 'top-left' or 'top-right' (the location of the right angle in the bounding box).
 */
export function isCircleIntersectingTriangle(
  triangleBox: CenterBox,
  circleBox: CenterBox,
  rightAngleCorner: "top-left" | "top-right"
): boolean {
  // -------------------------------
  // 1. Compute actual corners of the triangle bounding box
  //    from its center-based representation
  // -------------------------------
  const halfTw = triangleBox.width / 2;
  const halfTh = triangleBox.height / 2;

  // To avoid confusion, define some local helper variables:
  const triLeft = triangleBox.x - halfTw;
  const triRight = triangleBox.x + halfTw;
  const triTop = triangleBox.y - halfTh;
  const triBottom = triangleBox.y + halfTh;

  // 2. Derive the triangle’s vertices A, B, C based on rightAngleCorner
  let Ax: number, Ay: number;
  let Bx: number, By: number;
  let Cx: number, Cy: number;

  if (rightAngleCorner === "top-left") {
    // Right angle at top-left
    Ax = triLeft;
    Ay = triTop; // A (top-left)
    Bx = triRight;
    By = triTop; // B (top-right)
    Cx = triLeft;
    Cy = triBottom; // C (bottom-left)
  } else {
    // Right angle at top-right
    Ax = triRight;
    Ay = triTop; // A (top-right)
    Bx = triLeft;
    By = triTop; // B (top-left)
    Cx = triRight;
    Cy = triBottom; // C (bottom-right)
  }

  // -------------------------------
  // 3. Circle geometry from center-based bounding box
  // -------------------------------
  // For a circle bounding box, (x, y) is already the circle center
  const circleCenterX = circleBox.x;
  const circleCenterY = circleBox.y;
  const radius = circleBox.width / 2; // assuming width == height

  // -------------------------------
  // 4. Optional: bounding-box overlap test for early-out
  //    We can convert both center-based boxes to standard top-left boxes
  //    and see if they overlap. If not, no intersection is possible.
  // -------------------------------
  if (!boxesOverlapCenterBased(triangleBox, circleBox)) {
    return false;
  }

  // -------------------------------
  // 5. Detailed collision checks
  // -------------------------------

  // (a) Circle center in triangle?
  if (pointInTriangle(circleCenterX, circleCenterY, Ax, Ay, Bx, By, Cx, Cy)) {
    return true;
  }

  // (b) Any triangle vertex inside the circle?
  if (
    pointInCircle(Ax, Ay, circleCenterX, circleCenterY, radius) ||
    pointInCircle(Bx, By, circleCenterX, circleCenterY, radius) ||
    pointInCircle(Cx, Cy, circleCenterX, circleCenterY, radius)
  ) {
    return true;
  }

  // (c) Distance from circle center to each triangle edge <= radius?
  if (
    pointToSegmentDistance(circleCenterX, circleCenterY, Ax, Ay, Bx, By) <=
      radius ||
    pointToSegmentDistance(circleCenterX, circleCenterY, Bx, By, Cx, Cy) <=
      radius ||
    pointToSegmentDistance(circleCenterX, circleCenterY, Cx, Cy, Ax, Ay) <=
      radius
  ) {
    return true;
  }

  // No collision found
  return false;
}

/**
 * Quick overlap check for two bounding boxes defined by their centers.
 * Converts each to top-left-based coordinates internally and then tests.
 */
function boxesOverlapCenterBased(a: CenterBox, b: CenterBox): boolean {
  const aLeft = a.x - a.width / 2;
  const aRight = a.x + a.width / 2;
  const aTop = a.y - a.height / 2;
  const aBottom = a.y + a.height / 2;

  const bLeft = b.x - b.width / 2;
  const bRight = b.x + b.width / 2;
  const bTop = b.y - b.height / 2;
  const bBottom = b.y + b.height / 2;

  return !(
    aRight < bLeft ||
    bRight < aLeft ||
    aBottom < bTop ||
    bBottom < aTop
  );
}

/** Returns `true` if (px, py) lies inside a circle of radius r centered at (cx, cy). */
function pointInCircle(
  px: number,
  py: number,
  cx: number,
  cy: number,
  r: number
): boolean {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}

/** Returns `true` if (px, py) lies within the triangle defined by (Ax,Ay), (Bx,By), (Cx,Cy). */
function pointInTriangle(
  px: number,
  py: number,
  Ax: number,
  Ay: number,
  Bx: number,
  By: number,
  Cx: number,
  Cy: number
): boolean {
  const areaABC = triangleArea(Ax, Ay, Bx, By, Cx, Cy);
  const areaPAB = triangleArea(px, py, Ax, Ay, Bx, By);
  const areaPBC = triangleArea(px, py, Bx, By, Cx, Cy);
  const areaPCA = triangleArea(px, py, Cx, Cy, Ax, Ay);

  // Allow a small numerical tolerance
  const epsilon = 1e-7;
  return Math.abs(areaPAB + areaPBC + areaPCA - areaABC) < epsilon;
}

/** Returns the absolute area of the triangle (A,B,C). */
function triangleArea(
  Ax: number,
  Ay: number,
  Bx: number,
  By: number,
  Cx: number,
  Cy: number
): number {
  return Math.abs(Ax * (By - Cy) + Bx * (Cy - Ay) + Cx * (Ay - By)) / 2;
}

/**
 * Computes the distance from point P(px, py) to the *line segment* AB(Ax,Ay -> Bx,By).
 * If the perpendicular projection lies outside [A,B], returns the distance to the closer endpoint.
 */
function pointToSegmentDistance(
  px: number,
  py: number,
  Ax: number,
  Ay: number,
  Bx: number,
  By: number
): number {
  // Vector AB
  const ABx = Bx - Ax;
  const ABy = By - Ay;

  // Vector AP
  const APx = px - Ax;
  const APy = py - Ay;

  const AB_sq = ABx * ABx + ABy * ABy;
  if (AB_sq === 0) {
    // A and B are the same point
    return distance(px, py, Ax, Ay);
  }

  // Projection factor t = (AP · AB) / (AB · AB)
  const t = (APx * ABx + APy * ABy) / AB_sq;

  if (t <= 0) {
    // Closest to A
    return distance(px, py, Ax, Ay);
  } else if (t >= 1) {
    // Closest to B
    return distance(px, py, Bx, By);
  } else {
    // Closest to projection on segment
    const projX = Ax + t * ABx;
    const projY = Ay + t * ABy;
    return distance(px, py, projX, projY);
  }
}

/** Euclidean distance between two points (x1,y1) and (x2,y2). */
function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// -----------------------------------------------------
// Example usage:

const triangleBox: CenterBox = {
  x: 15, // center X
  y: 15, // center Y
  width: 30,
  height: 30,
};

const circleBox: CenterBox = {
  x: 20, // circle center X
  y: 20, // circle center Y
  width: 30,
  height: 30, // circle => width == height
};

// Right angle is at top-left corner of the triangle's bounding box
const result = isCircleIntersectingTriangle(triangleBox, circleBox, "top-left");
console.log("Do they intersect?", result);
