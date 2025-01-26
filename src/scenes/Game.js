import { Scene } from "phaser";
import { FacePad } from "../plugins/facepad";
import { responsivePositioning } from "../plugins/responsive";
import { isCircleIntersectingTriangle } from "../plugins/triangle-circle-intersect";
import { scoreKeeper } from "../plugins/score-box";

const LEAF_SIZE = {
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
  }

  create() {
    this.intervalId = null;
    this.currentVelocity = 1;

    this.viewWidth = this.game.scale.width;
    this.viewHeight = this.game.scale.height;

    this.player;
    this.bgTile;
    this.bgWall;
    this.obstacle;
    this.leafs = [];
    this.cliffs = [];
    this.hands = [];
    this.anvil;

    this.scoreBox = scoreKeeper;
    this.scoreBox.showScoreBox();
    this.cooldown = false;

    this.fp = FacePad;
    /**
     * SOUND EFFECTS: background music & bubble pop
     */
    this.pop = this.sound.add("pop");
    this.whistle = this.sound.add("whistle");

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
     * PLAYER BUBBLE, stay on screen
     */
    this.player = this.physics.add.sprite(
      this.positioning.getCenteredPositionX(),
      this.positioning.getCenteredPositionY(),
      "bubble"
    );
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    this.player.setDepth(1);
    this.player.setData("lives", 0);

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
        { key: "leaf" },
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
    // Add obstacles and start the game
    this.startInterval();
  }

  update() {
    // move the rock, refresh to update physics body
    if (this.anvil) {
      this.anvil.setPosition(
        this.anvil.x,
        this.anvil.y + 10 * this.currentVelocity
      );
      this.anvil.refreshBody();
    }

    // Move the leafs
    this.leafs.forEach((leaf) => {
      const swayLeft = leaf.getData("swayLeft");
      let position = leaf.getData("position");
      const maxSway = leaf.getData("maxSway");
      let newX;
      if (swayLeft) {
        newX = leaf.x - 1;
        position -= 1;
      } else {
        newX = leaf.x + 1;
        position += 1;
      }

      leaf.setPosition(newX, leaf.y + this.currentVelocity * 0.5);
      leaf.setData("position", position);
      if (position > maxSway) {
        const randomMax = Math.round(Math.max(Math.random() * 50, 30));
        leaf.setData("swayLeft", true);
        leaf.setData("maxSway", randomMax);
      } else if (position < -1 * maxSway) {
        leaf.setData("swayLeft", false);
        const randomMax = Math.round(Math.max(Math.random() * 50, 30));
        leaf.setData("maxSway", randomMax);
      }
      leaf.refreshBody();
    });

    // Move the cliffs
    this.cliffs.forEach((cliff) => {
      cliff.setPosition(cliff.x, cliff.y + this.currentVelocity * 1.2);
      cliff.refreshBody();
    });

    // Move the hands
    this.hands.forEach((hand) => {
      hand.setPosition(
        hand.texture.key === "hand-l"
          ? hand.getData("inward")
            ? hand.x + this.currentVelocity
            : hand.x - this.currentVelocity
          : hand.getData("inward")
          ? hand.x - this.currentVelocity
          : hand.x + this.currentVelocity,
        hand.y + this.currentVelocity
      );
      if (hand.texture.key === "hand-l" && hand.x > -0) {
        hand.setData("inward", false);
      } else if (hand.texture.key === "hand-l" && hand.x < -120) {
        hand.setData("inward", true);
      } else if (
        hand.texture.key === "hand-r" &&
        hand.x < this.game.scale.width - 1
      ) {
        hand.setData("inward", false);
      } else if (
        hand.texture.key === "hand-r" &&
        hand.x > this.game.scale.width + 120
      ) {
        hand.setData("inward", true);
      }
      hand.refreshBody();
    });

    // Use FacePad Value
    const val = this.fp.xValue;
    // Move the bubble left and right based on the value
    this.player.setVelocityX(val * 10);

    // When the player is happy, then we let the bubble start to bounce
    if (this.player.y > this.game.scale.height - 48) {
      this.player.setVelocityY(
        Math.max(-this.fp.yValue * 100 * this.currentVelocity, -300)
      );
    }

    // Clean up the obstacles that are off screen
    this.leafs = this.leafs.filter((leaf) => {
      return leaf.y < this.game.scale.height + 48;
    });

    this.cliffs = this.cliffs.filter((cliff) => {
      return cliff.y < this.game.scale.height + 256;
    });

    this.hands = this.hands.filter((hand) => {
      return hand.y < this.game.scale.height + 48;
    });

    const numberOfObstaclesPassed =
      this.leafs.filter((leaf) => leaf.y > this.player.y).length +
      this.cliffs.filter((cliff) => cliff.y > this.player.y).length +
      this.hands.filter((hand) => hand.y > this.player.y).length;

    this.scoreBox.setScore(
      this.scoreBox.currentScore + numberOfObstaclesPassed
    );
  }

  hitObstacle() {
    if (this.cooldown) return;
    if (this.player.getData("lives") > 0) {
      // decrement lives
      // debounce the function
      this.cooldown = true;
      this.player.setData("lives", this.player.getData("lives") - 1);
      setTimeout(() => {
        this.cooldown = false;
      }, 800);
      return;
    }
    if (!this.currentVelocity) return;
    this.player.play("pop");
    this.anvil = null;
    this.pop.play({ volume: 1 });
    this.currentVelocity = 0;
    setTimeout(() => {
      this.scene.start("GameOver");
      this.scene.stop("Game");
      this.scoreBox.resetScore();
      this.scoreBox.hideScoreBox();
    }, 1200);
    this.clearInterval();
  }

  /**
   * Create a leaf obstacle
   */
  createLeaf() {
    const newLeaf = this.obstacle
      .create(Math.random() * this.game.scale.width, 0, "leaf")
      .setData("swayLeft", true)
      .setData("position", 0)
      .setData("maxSway", 50)
      .refreshBody();
    newLeaf.play("leaf");

    const leafScale = this.positioning.getScaledSprite(
      LEAF_SIZE.WIDTH,
      LEAF_SIZE.HEIGHT,
      0.33
    );
    newLeaf.setDisplaySize(leafScale.width, leafScale.height);
    this.physics.add.overlap(
      this.player,
      newLeaf,
      this.hitObstacle,
      null,
      this
    );
    this.leafs.push(newLeaf);
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

    newCliff.setScale(this.positioning.getScaleX() * 1.75);
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

  createHand() {
    const random = Math.random();
    const side = random < 0.5 ? "l" : "r";

    const newHand = this.obstacle.create(-120, -48, `hand-${side}`);
    newHand
      .setData("inward", true)

      .refreshBody();

    newHand.setScale(this.positioning.getScaleX());

    if (side === "l") {
      newHand.setOrigin(0, 0);
    } else {
      newHand.setOrigin(1, 0);
      newHand.setX(this.game.scale.width);
    }
    this.physics.add.overlap(
      this.player,
      newHand,
      this.hitObstacle,
      null,
      this
    );

    this.hands.push(newHand);
  }

  createAnvil() {
    this.anvil = null;

    const newAnvil = this.obstacle
      .create(Math.random() * this.game.scale.width, -1200, "anvil")
      .refreshBody();
    const anvilScale = this.positioning.getScaledSprite(96, 42, 1.5);
    newAnvil.setDisplaySize(anvilScale.width, anvilScale.height);

    this.physics.add.overlap(
      this.player,
      newAnvil,
      this.hitObstacle,
      null,
      this
    );
    this.anvil = newAnvil;
    this.whistle.play({ rate: 0.3 });
  }

  startInterval() {
    this.intervalId = setInterval(() => {
      if (!this.currentVelocity) return;
      const random = Math.random();
      if (random < 0.05) {
        this.createAnvil();
      }
      if (random < 0.3) {
        this.createHand();
      } else if (random < 0.45) {
        this.createCliff();
      } else {
        this.createLeaf();
      }
    }, 4200 / (this.currentVelocity * 1.07 ** 4));

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
