import { Scene } from "phaser";
import { FacePad } from "../plugins/facepad";
import { responsivePositioning } from "../plugins/responsive";
import { isCircleIntersectingTriangle } from "../plugins/triangle-circle-intersect";

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
    this.currentVelocity = 1;
  }

  create() {
    this.player;
    this.cursors;
    this.bgTile;
    this.bgWall;
    this.obstacle;
    this.rock;
    this.rockGroup = [];
    this.cliffs = [];

    this.fp = FacePad;
    /**
     * SOUND EFFECTS: background music & bubble pop
     */
    this.music = this.sound.add("music", { loop: true }); // can add more in this config args; speed, mute, volume
    this.music.play();
    this.pop = this.sound.add("pop");

    this.positioning = responsivePositioning(this.game);
    /**
     * TILED BACKGROUND
     */
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

    /**
     * DISPLAY PLAYER INSTRUCTIONS ON BACKGROUND
     */
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

    /**
     * PLAYER BUBBLE, stay on screen
     */
    this.player = this.physics.add.sprite(
      this.positioning.getCenteredPositionX(),
      this.positioning.getCenteredPositionY(),
      "bubble"
    );
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    this.player.scale = 3;

    /**
     * ANIMATIONS
     */
    // animate player bubble
    this.animate = this.anims.create({
      key: "idle",
      frames: [{ key: "bubble" }, { key: "frame2" }, { key: "frame4" }],
      frameRate: 8,
      repeat: -1,
    });

    this.player.play("idle");
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

    const playerScale = this.positioning.getScaledSprite(
      BUBBLE_SIZE.WIDTH,
      BUBBLE_SIZE.HEIGHT
    );
    this.player.setDisplaySize(playerScale.width, playerScale.height);

    /**
     * OBSTACLES
     */
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
    // move the rock, refresh to update physics body
    this.rockGroup.forEach((rock) => {
      rock.setPosition(rock.x, rock.y + this.currentVelocity);
      rock.refreshBody();
    });

    // Move the cliffs
    this.cliffs.forEach((cliff) => {
      cliff.setPosition(cliff.x, cliff.y + this.currentVelocity);
      cliff.refreshBody();
    });

    // Use FacePad Value
    const val = this.fp.value;
    this.player.setVelocityX(val * 10);
  }
  hitObstacle() {
    this.player.play("pop");
    this.pop.play();
    this.music.stop();
    this.currentVelocity = 0;
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

  checkIfCliffAndPlayerCollides(player, cliff) {
    const rightAngleCorner = cliff.x === 0 ? "top-left" : "top-right";

    const res = isCircleIntersectingTriangle(
      {
        height: cliff.displayHeight,
        width: cliff.displayWidth,
        x:
          rightAngleCorner === "top-right"
            ? cliff.x - cliff.displayWidth / 2
            : cliff.x + cliff.displayWidth / 2,
        y: cliff.y + cliff.displayHeight / 2,
      },
      {
        height: player.displayHeight,
        width: player.displayWidth,
        x: player.x,
        y: player.y,
      },
      rightAngleCorner
    );

    return res;
  }

  createCliff() {
    const random = Math.random();
    const side = random < 0.5 ? "l" : "r";

    const newCliff = this.obstacle
      .create(0, -256, `cliff-${side}`)
      .refreshBody();

    newCliff.setScale(this.positioning.getScaleX());
    if (side === "l") {
      newCliff.setOrigin(0, 0);
    } else {
      newCliff.setOrigin(1, 0);
      newCliff.setX(this.game.scale.width);
    }
    this.physics.add.overlap(
      this.player,
      newCliff,
      this.hitObstacle,
      this.checkIfCliffAndPlayerCollides,
      this
    );

    this.cliffs.push(newCliff);
  }

  startInterval() {
    this.intervalId = setInterval(() => {
      const random = Math.random();
      this.createCliff();

      if (random < 0.25) {
        this.createCliff();
      } else {
        this.createObstacle();
      }
    }, Phaser.Math.Between(2000, 8000));

    this.velocityIntervalId = setInterval(() => {
      // Increment the velocity every second
      this.currentVelocity += 0.1;
    }, 1000);
  }

  clearInterval() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.velocityIntervalId !== null) {
      clearInterval(this.velocityIntervalId);
      this.velocityIntervalId = null;
      // Reset the velocity
      this.currentVelocity = 1;
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
