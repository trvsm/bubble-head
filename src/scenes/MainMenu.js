import { Scene } from "phaser";
import { responsivePositioning } from "../plugins/responsive";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    this.positioning = responsivePositioning(this.game);
    this.music = this.sound.add("music", { loop: true, volume: 0.5 }); // can add more in this config args; speed, mute, volume
    this.music.play();

    this.add
      .text(
        this.positioning.getCenteredPositionX(),
        this.getLogoY(),
        "Bubble Head",
        this.positioning.getFontLarge()
      )
      .setOrigin(0.5, 1);

    this.add
      .text(
        this.positioning.getCenteredPositionX(),
        this.getLogoY() + 10 * this.positioning.getScaleY(),
        "Tap the screen to Start\n\nTilt your head to move the bubble. Avoid the obstacles and see how far you can get without popping!",
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
