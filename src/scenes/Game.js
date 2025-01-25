import { Scene } from "phaser";
import { FacePad } from "../plugins/facepad";
// import { EventBus } from "./EventBus";

export class Game extends Scene {
  constructor() {
    super("Game");
    this.intervalId = null;
  }

  create() {
    this.player;
    this.cursors;
    this.bgTile;
    this.obstacle;
    this.rock;
    this.rockGroup = [];
    this.fp = FacePad;
    // sound effects: background music & bubble pop
    this.music = this.sound.add("music", { loop: true }); // can add more in this config args; speed, mute, volume
    this.music.play();
    this.pop = this.sound.add("pop");
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
    this.player.scale = 3;

    // animate player bubble
    this.animate = this.anims.create({
      key: "idle",
      frames: [
        { key: "bubble" },
        { key: "frame2" },
        // { key: "frame3" },
        { key: "frame4" },
      ],
      frameRate: 8,
      repeat: -1,
    });
    this.player.play("idle");

    this.obstacle = this.physics.add.staticGroup();
    // add rock obstacle at start & every 2-8 seconds
    this.createObstacle();
    this.startInterval();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.once("pointerdown", () => {
      this.music.stop();
      this.scene.start("GameOver");
    });
  }

  update() {
    // move the tile background
    this.bgTile.tilePositionY -= 1;
    // move the rock, refresh to update physics body
    this.rockGroup.forEach((rock) => {
      rock.setPosition(rock.x, rock.y + 1);
      rock.refreshBody();
    });

    // Use FacePad Value
    const val = this.fp.value;
    this.player.setVelocityX(val * 10);
  }
  hitObstacle() {
    this.add.image(512, 384, "explode");
    this.pop.play();
    this.music.stop();
    setTimeout(() => {
      this.scene.start("GameOver");
      this.scene.stop("Game");
    }, 1200);
    this.clearInterval();
  }
  // helper function to create obstacles at random intervals/positions
  createObstacle() {
    // if (this. != "Game") return;
    const newRock = this.obstacle
      .create(Math.random() * 1000, 0, "rock")
      .refreshBody();
    newRock.scale = 0.25;
    this.physics.add.overlap(
      this.player,
      newRock,
      this.hitObstacle,
      null,
      this
    );
    this.rockGroup.push(newRock);
  }

  startInterval() {
    this.intervalId = setInterval(() => {
      this.createObstacle();
    }, Phaser.Math.Between(2000, 8000));
  }

  clearInterval() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
