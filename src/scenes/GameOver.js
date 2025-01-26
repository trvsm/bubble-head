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

    const over = this.add
      .image(
        this.positioning.getCenteredPositionX(),
        this.getLogoY() -50 * this.positioning.getScaleY(),
        "gameover"
      )
      .setOrigin(0.5, 1);

    over.setDisplaySize(
      this.positioning.getScaleX() * 768,
      this.positioning.getScaleX() * 768
    );

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
      this.scene.start("Game");
    });
  }

  getLogoY() {
    let y = this.game.scale.height / 2;
    return y;
  }
}
