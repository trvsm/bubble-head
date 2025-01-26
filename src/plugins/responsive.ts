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

    getFontRegular() {
      const fontSize = 24 * this.getScaleY();
      return {
        fontFamily: "Arial Black",
        fontSize,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
        align: "center",
        wordWrap: { width: game.scale.width - 100 * this.getScaleX() },
      };
    },

    getFontLarge() {
      const fontSize = 48 * this.getScaleY();
      return {
        fontFamily: "Arial Black",
        fontStyle: "bold",
        fontSize,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
        wordWrap: { width: game.scale.width - 100 * this.getScaleX() },
      };
    },

    /**
     * Get the scaled width and height for objects
     * @param width The original asset width
     * @param height The original asset height
     * @param scale The scale factor against the screen width
     * @returns
     */
    getScaledSprite(width: number, height: number, scale: number = 0.125) {
      const aspectRatio = width / height;
      const newWidth = width * this.getScaleX() * scale;

      return {
        width: newWidth,
        height: newWidth / aspectRatio,
      };
    },
  };
}
