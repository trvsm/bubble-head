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

    this.load.image("background", "assets/blue.png");
    this.load.image("rock", "assets/crop-rock.png");
    // animation frames
    this.load.image("bubble", "assets/bubble_idle1.png");
    this.load.image("frame2", "assets/bubble_idle2.png");
    this.load.image("frame4", "assets/bubble_idle4.png");

    this.load.image("pop3", "assets/pop3.png");
    this.load.image("pop4", "assets/pop4.png");

    // sound effects
    this.load.audio("pop", "assets/pop.mp3");
    this.load.audio("music", "assets/cloud-dancer.mp3");
  }

  create() {
    this.scene.start("Preloader");
  }
}
