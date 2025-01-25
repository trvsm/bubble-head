import { Scene } from "phaser";
import { FacePad } from "../plugins/facepad";
// import { EventBus } from "./EventBus";

export class Game extends Scene {
  constructor() {
    super("Game");
    this.player;
    this.cursors;
    this.bgTile;
    this.obstacle;
  }

  create() {
    this.fp = FacePad;
    // add tiled background for scrolling
    this.bgTile = this.add.tileSprite(0, 0, 1024, 768, "background");
    this.bgTile.scale = 4;

    this.add
      .text(
        512,
        84,
        "Control the bubble by tilting your head left or right\nSee how far you can get without popping!",
        {
          fontFamily: "Arial Black",
          fontSize: 38,
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 8,
          align: "center",
        }
      )
      .setOrigin(0.5);
    this.add.image(512, 768, "cloud-sky");

    // add bubble, that won't fall off screen
    this.player = this.physics.add.sprite(512, 768, "bubble");
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    this.player.scale = 0.25;

    // add rock to bump into
    this.obstacle = this.physics.add.staticGroup();
    this.obstacle.create(512, 0, "rock").refreshBody();
    this.obstacle.scale = 0.25;
    this.physics.add.overlap(
      this.player,
      this.obstacle,
      this.hitObstacle,
      null,
      this
    );

    this.cursors = this.input.keyboard.createCursorKeys();

    this.input.once("pointerdown", () => {
      this.scene.start("GameOver");
    });
  }

  update() {
    // move the tile background
    this.bgTile.tilePositionY -= 1;
    // TODO: set the position of obstacle to move down

    // move the bubble on keys
    // if (this.cursors.left.isDown) {
    //   this.player.setVelocityX(-120);
    // } else if (this.cursors.right.isDown) {
    //   this.player.setVelocityX(120);
    // }

    // Use FacePad Value
    const val = this.fp.value;
    this.player.setVelocityX(val * 10);
  }
  hitObstacle(player, obstacle) {
    this.scene.start("GameOver");
  }
}
