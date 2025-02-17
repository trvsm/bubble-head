import { Physics } from "phaser";
import { Boot } from "./scenes/Boot";
import { Game } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
  type: Phaser.AUTO,
  // width: 1024,
  // height: 768,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: "game-container",
  backgroundColor: "#028af8",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, Preloader, MainMenu, Game, GameOver],
  // add physics to use Arcade Physics
  // physics has dynamic (move via forces) and static (just position & size) bodies
  // groups: group & control as a unit, can check collison as group
  // groups can create (child) game objects; physics enabled objects create physics children
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  input: {
    gamepad: true,
  },
};

export default new Phaser.Game(config);
