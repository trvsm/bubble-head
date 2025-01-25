import { Scene } from "phaser";
import { responsivePositioning } from "../plugins/responsive";

export class GameOver extends Scene {
  constructor() {
    super("GameOver");
  }

  create() {
    this.positioning = responsivePositioning(this.game);

    this.cameras.main.setBackgroundColor(0xff0000);

    this.positioning.addBackgroundToScene(this).setAlpha(0.5);

    this.add
      .text(
        this.positioning.getCenteredPositionX(),
        this.positioning.getCenteredPositionY(),
        "Game Over",
        {
          fontFamily: "Arial Black",
          fontSize: 64,
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 8,
          align: "center",
        }
      )
      .setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.scene.start("MainMenu");
    });
  }
}
