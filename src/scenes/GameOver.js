import { Scene } from "phaser";
import { responsivePositioning } from "../plugins/responsive";
import { scoreKeeper } from "../plugins/score-box";

export class GameOver extends Scene {
  constructor() {
    super("GameOver");
  }

  create() {
    this.positioning = responsivePositioning(this.game);

    const sb = scoreKeeper;

    this.add
      .text(
        this.positioning.getCenteredPositionX(),
        this.positioning.getCenteredPositionY() -
          48 * this.positioning.getScaleY(),
        "You Popped!",
        this.positioning.getFontLarge()
      )
      .setOrigin(0.5, 1);

    const { highScore, isNewHighScore, lastScore } = sb.getScores();

    this.add
      .text(
        this.positioning.getCenteredPositionX(),
        this.positioning.getCenteredPositionY() -
          24 * this.positioning.getScaleY(),
        `Click to play again.\n\n${
          !highScore && !lastScore
            ? ""
            : `${
                isNewHighScore
                  ? "A new high score!"
                  : `High Score: ${highScore}`
              }\n\nYour score: ${lastScore}`
        }`,
        this.positioning.getFontRegular()
      )
      .setOrigin(0.5, 0);

    this.input.once("pointerdown", () => {
      this.scene.start("MainMenu");
    });
  }

  update() {}
}
