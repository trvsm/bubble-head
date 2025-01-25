import { Scene } from "phaser";
import { responsivePositioning } from "../plugins/responsive";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    this.positioning = responsivePositioning(this.game);

    this.positioning.addBackgroundToScene(this);

    this.add
      .text(
        this.positioning.getCenteredPositionX(),
        this.getLogoY(),
        "Bubble Head",
        {
          font: `bold ${this.getLogoFontSize()}px sans-serif`,
          color: "#fff",
          stroke: "#fff",
          strokeThickness: 3,
        }
      )
      .setOrigin(0.5, 0.5);

    this.add
      .text(
        this.positioning.getCenteredPositionX(),
        this.getLogoY() + 100,
        "Click the Screen to Start",
        {
          fontFamily: "Arial Black",
          fontSize: 38,
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 8,
          align: "center",
        }
      )
      .setOrigin(0.5, 0.5);

    this.input.once("pointerdown", () => {
      this.scene.start("Game");
    });
  }

  getLogoY() {
    let y = Phaser.Math.Clamp(this.game.scale.height / 4, 80, 150);
    return y;
  }
  getLogoFontSize() {
    let fontSize = 72 * this.positioning.getScaleY();
    fontSize = Phaser.Math.Clamp(fontSize, 48, 72);
    return fontSize;
  }
}
