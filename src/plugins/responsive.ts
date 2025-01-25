export function responsivePositioning(game: Phaser.Game) {
  return {
    get vw() {
      return game.scale.width;
    },
    get vh() {
      return game.scale.height;
    },
    getScaleY() {
      return game.scale.height / 720;
    },
    getScaleX() {
      return game.scale.width / 1024;
    },
    getCenteredPositionX() {
      return game.scale.width / 2;
    },
    getCenteredPositionY() {
      return game.scale.height / 2;
    },
    addBackgroundToScene(scene: Phaser.Scene, key: string = "background") {
      return scene.add
        .image(0, 0, key)
        .setDisplaySize(game.scale.width, game.scale.height)
        .setDisplayOrigin(0, 0);
    },

    getFontSizeRegular() {},

    getFontRegular() {
      const fontSize = 16 * this.getScaleY();
      return {
        fontFamily: "Arial Black",
        fontSize,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8 * this.getScaleX(),
        align: "center",
      };
    },
  };
}
