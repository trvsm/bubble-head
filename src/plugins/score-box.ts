class ScoreKeeper {
  _currentScore: number = 0;
  _scoreHistory: number[] = [];
  _highScore: number = 0;
  _isNewHighScore: boolean = false;

  _scoreBoxElement: HTMLDivElement;
  _scoreElement: HTMLSpanElement;

  constructor() {
    this._scoreBoxElement = document.getElementById(
      "score-box"
    ) as HTMLDivElement;
    this._scoreElement = document.getElementById("score") as HTMLSpanElement;
  }

  get currentScore() {
    return this._currentScore;
  }

  setScore(newScore: number) {
    this._currentScore = newScore;
    this._scoreElement.innerText = newScore.toString();
  }

  resetScore() {
    if (!this._currentScore) return;
    this._scoreHistory.push(this._currentScore);
    if (this._currentScore > this._highScore) {
      this._highScore = this._currentScore;
      this._isNewHighScore = true;
    } else {
      this._isNewHighScore = false;
    }
    this._currentScore = 0;
    this._scoreElement.innerText = "0";
  }

  hideScoreBox() {
    this._scoreBoxElement.style.display = "none";
  }

  showScoreBox() {
    this._scoreBoxElement.style.display = "block";
  }

  getScores() {
    return {
      scores: this._scoreHistory,
      highScore: this._highScore,
      isNewHighScore: this._isNewHighScore,
      lastScore: this._scoreHistory[this._scoreHistory.length - 1],
    };
  }
}

export const scoreKeeper = new ScoreKeeper();
