import { Scene } from "phaser";
import { responsivePositioning } from "../plugins/responsive";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    this.positioning = responsivePositioning(this.game);

    //  A simple progress bar. This is the outline of the bar.
    this.add
      .rectangle(
        this.positioning.getCenteredPositionX(),
        this.positioning.getCenteredPositionY(),
        this.getBarContainerWidth(),
        32
      )
      .setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(
      this.getBarPositionX(),
      this.positioning.getCenteredPositionY(),
      this.getBarWidth(0),
      28,
      0xffffff
    );

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = this.getBarWidth(progress);
    });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath("assets");
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.
    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start("MainMenu");
  }

  getBarContainerWidth() {
    return 468 * this.positioning.getScaleX();
  }

  getBarPositionX() {
    return (512 - 230) * this.positioning.getScaleX();
  }

  getBarWidth(progress) {
    return (4 + 460 * progress) * this.positioning.getScaleX();
  }
}
