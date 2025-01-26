import { Scene } from "phaser";
import { FacePad } from "../plugins/facepad";
import { responsivePositioning } from "../plugins/responsive";

const ROCK_SIZE = {
  WIDTH: 600,
  HEIGHT: 389,
};

const BUBBLE_SIZE = {
  WIDTH: 1024,
  HEIGHT: 1024,
};

export class Game extends Scene {
  constructor() {
    super("Game");
    this.intervalId = null;
  }

  create() {
    this.player;
    this.cursors;
    this.bgTile;
    this.bgWall;
    this.obstacle;
    this.rock;
    this.rockGroup = [];
    this.fp = FacePad;
    // sound effects: background music & bubble pop
    this.music = this.sound.add("music", { loop: true }); // can add more in this config args; speed, mute, volume
    this.music.play();
    this.pop = this.sound.add("pop");

    this.positioning = responsivePositioning(this.game);
    // add tiled background for scrolling
    this.bgTile = this.add
      .tileSprite(
        0,
        0,
        this.game.scale.width,
        this.game.scale.height,
        "background"
      )
      .setDepth(0);
    this.bgTile.scale = 4;

    this.bgWall = this.add.tileSprite();

    // Instructions text
    const text = this.add
      .text(
        this.getTopBarTextPositionX(),
        this.getTopBarTextPositionY(),
        "Control the bubble by tilting your head left or right. See how far you can get without popping!",
        {
          ...this.positioning.getFontRegular(),
          wordWrap: {
            width: this.getTopBarTextWidth(),
          },
        }
      )
      .setOrigin(0.5, 0)
      .setDepth(5);

    // The background for the text
    this.add
      .rectangle(
        0,
        0,
        this.game.scale.width,
        this.getTopBarHeight(text.height),
        0x000000,
        0.75
      )
      .setOrigin(0, 0)
      .setDepth(4);

    // add bubble, that won't fall off screen
    this.player = this.physics.add.sprite(
      this.positioning.getCenteredPositionX(),
      this.positioning.getCenteredPositionY(),
      "bubble"
    );
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    this.player.scale = 3;

    // animate player bubble
    this.animate = this.anims.create({
      key: "idle",
      frames: [{ key: "bubble" }, { key: "frame2" }, { key: "frame4" }],
      frameRate: 8,
      repeat: -1,
    });
    // gameover pop animation
    this.popAnimation = this.anims.create({
        key: "pop",
        frames: [{ key: "pop3" }, { key: "pop4" }],
      frameRate: 4,
      repeat: -1,
    });
    // animate leaf
    this.leafAnimation = this.anims.create({
        key: "leaf",
        frames: [
            { key: "rock" },
            { key: "leafFrame2" },
            { key: "leafFrame3" },
            { key: "leafFrame4" },
        ],
        frameRate: 4,
        repeat: -1,
    });

    // run animations
    this.player.play("idle");

    const playerScale = this.positioning.getScaledSprite(
      BUBBLE_SIZE.WIDTH,
      BUBBLE_SIZE.HEIGHT
    );
    this.player.setDisplaySize(playerScale.width, playerScale.height);

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
    this.player.play("pop");
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
    const newRock = this.obstacle
      .create(Math.random() * this.game.scale.width, 0, "rock")
      .refreshBody();
      newRock.play("leaf");

    const rockScale = this.positioning.getScaledSprite(
      ROCK_SIZE.WIDTH,
      ROCK_SIZE.HEIGHT,
      0.33
    );
    newRock.setDisplaySize(rockScale.width, rockScale.height);
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

  getTopBarTextWidth() {
    return this.positioning.getScaleX() * (1024 - 64);
  }

  getTopBarTextPositionX() {
    return this.positioning.getCenteredPositionX();
  }

  getTopBarTextPositionY() {
    return this.positioning.getScaleY() * 16;
  }

  getTopBarHeight(textHeight) {
    return textHeight + 32 * this.positioning.getScaleY();
  }
}
