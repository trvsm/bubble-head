import * as faceapi from "face-api.js";
import { getFaceRollAngle } from "./get-roll-angle";

// Set the base path so that when it's deployed to GitHub pages it still works
const BASE_PATH = window.location.pathname;

const MODEL_URL = `${BASE_PATH}/models`;

faceapi.loadTinyFaceDetectorModel(MODEL_URL);
faceapi.loadFaceLandmarkTinyModel(MODEL_URL);

export function initFaceApi() {
  faceapi.loadTinyFaceDetectorModel(MODEL_URL);
  faceapi.loadFaceLandmarkTinyModel(MODEL_URL);
}

function isFaceDetectionModelLoaded() {
  return !!faceapi.nets.tinyFaceDetector.params;
}

// Adjust these for performance vs accuracy
const options = new faceapi.TinyFaceDetectorOptions({
  inputSize: 224,
  scoreThreshold: 0.5,
});

export async function getRollAngle(videoEl: HTMLVideoElement): Promise<{
  faceDetected: boolean;
  rollAngle: number;
  midPoint: number;
}> {
  if (videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
    return { faceDetected: false, rollAngle: 0, midPoint: 0 };

  const result = await faceapi
    .detectSingleFace(videoEl, options)
    .withFaceLandmarks(true);

  if (!result) {
    return { faceDetected: false, rollAngle: 0, midPoint: 0 };
  }

  const originalRollAngle = getFaceRollAngle(result.landmarks.positions);

  // Set rollAngle from -20 to 20 to a value between 0 and 1
  const rollAngle = Math.min(Math.max(originalRollAngle, -20), 20);

  // Get the midpoint to a value between 0 and 1
  const midPoint =
    ((result.detection.box.left + result.detection.box.right) /
      2 /
      videoEl.videoWidth -
      0.5) *
    2;

  return {
    faceDetected: true,
    rollAngle: originalRollAngle,
    midPoint,
  };
}
