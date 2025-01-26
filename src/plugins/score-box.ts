export function scoreBox() {
  const scoreBox = document.getElementById("score-box") as HTMLDivElement;
  const score = document.getElementById("score") as HTMLSpanElement;

  return {
    setScore(newScore: number) {
      score.innerText = newScore.toString();
    },
    hideScore() {
      scoreBox.style.display = "none";
    },
    showScore() {
      scoreBox.style.display = "block";
    },
  };
}
