export function startGame (startButton: HTMLButtonElement) {
  startButton.addEventListener('click', () => {
  window.location.href = '/game.html';
});
}
