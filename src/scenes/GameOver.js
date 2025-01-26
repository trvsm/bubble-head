import { Scene } from "phaser";
import { responsivePositioning } from "../plugins/responsive";

export class GameOver extends Scene {
  constructor() {
    super("GameOver");
  }

  create() {
    this.positioning = responsivePositioning(this.game);

    this.cameras.main.setBackgroundColor(0xff0000);

    this.add
      .text(
        this.positioning.getCenteredPositionX(),
        this.positioning.getCenteredPositionY(),
        "Game Over",
        this.positioning.getFontLarge()
      )
      .setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.scene.start("MainMenu");
    });
  }
}
