import { Scene } from "phaser";
// Scene is the base class
// this.load is the main way to add stuff
// create call does the stuff
// this.physics.add adds physics props to objects, then supports things like velocity, setBounce
// config in main.js passed to game object

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

    // tile sprites for backgrounds
    this.load.image("background", "assets/blue.png");
    this.load.image("wallLeft", "assets/border_L.png");
    this.load.image("wallRight", "assets/border_R.png");

    // animation frames
    // player
    this.load.image("bubble", "assets/bubble_idle1.png");
    this.load.image("frame2", "assets/bubble_idle2.png");
    this.load.image("frame4", "assets/bubble_idle4.png");

    // game over
    this.load.image("pop3", "assets/pop3.png");
    this.load.image("pop4", "assets/pop4.png");

    // leaf obstacle
    this.load.image("rock", "assets/leaf1.png");
    this.load.image("leafFrame2", "assets/leaf2.png");
    this.load.image("leafFrame3", "assets/leaf3.png");
    this.load.image("leafFrame4", "assets/leaf4.png");

    // Cliffs Obstacle
    this.load.image("cliff-l", "assets/obstacles/Cliff-L.png");
    this.load.image("cliff-r", "assets/obstacles/Cliff-R.png");

    // sound effects
    this.load.audio("pop", "assets/pop.mp3");
    this.load.audio("music", "assets/cloud-dancer.mp3");
  }

  create() {
    this.scene.start("Preloader");
  }
}
