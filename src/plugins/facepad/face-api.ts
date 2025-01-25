import * as faceapi from "face-api.js";
import { getFaceRollAngle } from "./get-roll-angle";

const MODEL_URL = "/models";

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
}> {
  if (videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
    return { faceDetected: false, rollAngle: 0 };

  const result = await faceapi
    .detectSingleFace(videoEl, options)
    .withFaceLandmarks(true);

  if (!result) {
    return { faceDetected: false, rollAngle: 0 };
  }

  const rollAngle = getFaceRollAngle(result.landmarks.positions);
  return {
    faceDetected: true,
    rollAngle,
  };
}
