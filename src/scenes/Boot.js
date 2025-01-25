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

    this.load.image("background", "assets/bg.png");
    this.load.image("bubble", "assets/bubble.png");
    this.load.image("cloud-sky", "assets/cloud-sky.png");
    this.load.image("rock", "assets/crop-rock.png");
  }

  create() {
    this.scene.start("Preloader");
  }
}
