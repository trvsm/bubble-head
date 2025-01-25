import { getRollAngle, initFaceApi } from "./face-api";

export class FacePadPlugin {
  private faceDetected: boolean = false;
  private _value: number = 0;
  private _container: HTMLDivElement;
  private _video: HTMLVideoElement;

  private _enabled: boolean = true;

  initialized: boolean = false;

  constructor(id: string = "facepad") {
    this.init(id);
  }
  async init(id: string) {
    if (this.initialized) return;

    initFaceApi();

    const container = document.getElementById("facepad");
    if (!container) {
      console.error(`Unable to find container with id: ${id}`);
      return;
    }

    this._container = container as HTMLDivElement;

    // Initialize the video component
    const video = document.createElement("video");

    // Get the video stream
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;

    this._video = video;

    // Append it into the DOM
    this._container.appendChild(video);
    this.start();
    this.initialized = true;
  }

  /**
   * Start detecting the face and updating the value.
   */
  start() {
    this._enabled = true;
    this.updateValue();
  }

  /**
   * Update the value based on the rollAngle of the face.
   */
  async updateValue() {
    if (!this._enabled) {
      return;
    }

    const { faceDetected, rollAngle } = await getRollAngle(this._video);

    this._value = -1 * rollAngle;
    this.faceDetected = faceDetected;

    setTimeout(() => {
      this.updateValue();
    });
  }

  /**
   * TODO: Setup calibration?
   */
  calibrate() {
    console.log("FacePad calibrate");
    // Send event to show a popup with asking to move head to the left
    // and then to the right
    // And save these details into this facepad.
  }

  /**
   * Destroy the instance of the facepad plugin.
   */
  destroy() {
    console.log("FacePad destroy");
    if (this._video) {
      // Pause the video element and then hide it all
      this._video.pause();
      // Remove the video component
      this._container.removeChild(this._video);
    }
    this.initialized = false;
  }

  /**
   * Whether or not the face is currently detected.
   */
  get isFaceDetected() {
    return this.faceDetected;
  }

  /**
   * The current value of the rollangle.
   */
  get value() {
    return this._value;
  }
}

export const FacePad = new FacePadPlugin();
