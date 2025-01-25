import { Scene } from "phaser";
// import { EventBus } from "./EventBus";

export class Game extends Scene {
  constructor() {
    super("Game");
    this.player;
    this.cursors;
    this.bgTile;
    this.cloudTile;
    this.moreClouds;
    this.obstacle;
    this.rock;
    this.rockGroup = [];
  }

  create() {
    // add tiled background for scrolling
    this.bgTile = this.add.tileSprite(0, 0, 1024, 768, "background");
    this.bgTile.scale = 3;
    this.cloudTile = this.add.tileSprite(512, 384, 1024, 768, "cloud");
    this.cloudTile.scale = 1.5;
    this.moreClouds = this.add.tileSprite(-512, 384, 1024, 384, "cloud");
    this.moreClouds.scale = 2;

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

    // add bubble, that won't fall off screen
    this.player = this.physics.add.sprite(512, 768, "bubble");
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    this.player.scale = 0.15;

    this.obstacle = this.physics.add.staticGroup();
    // add rock obstacle every 2-8 seconds
    setInterval(() => {
      this.createObstacle();
    }, Phaser.Math.Between(2000, 8000));

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // move the tile background
    this.bgTile.tilePositionY -= 1;
    this.cloudTile.tilePositionY -= 0.8;
    this.moreClouds.tilePositionY -= 0.5;
    // move the rock, refresh to update physics body
    this.rockGroup.forEach((rock) => {
      rock.setPosition(rock.x, rock.y + 1);
      rock.refreshBody();
    });

    // move the bubble on keys
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-120);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(120);
    }
  }
  hitObstacle() {
    this.scene.start("GameOver");
  }
  // helper function to create obstacles at random intervals/positions
  createObstacle() {
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
}
