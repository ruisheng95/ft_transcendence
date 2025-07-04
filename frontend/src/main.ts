/* eslint-disable @typescript-eslint/no-non-null-assertion */
import "./style.css";
import typescriptLogo from "./typescript.svg";
import viteLogo from "/vite.svg";
import { setupCounter } from "./counter.ts";
import { startGame } from "./startgame.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p>You have opened <span id="test"></span> times.</p>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
    <p class="text-3xl font-bold underline text-blue-300">This is very tailwind</p>
    <p>
      <button id="entergame" type="button" >Click here to start game</button>
    </p>
      <div id="google_sign_in" class="absolute top-4 right-4"></div>
  </div>
`;
fetch(`http://127.0.0.1:3000`)
  .then((response) => response.json())
  .then((json) => {
    const testDiv = document.querySelector<HTMLDivElement>("#test");
    if (testDiv) {
      testDiv.innerHTML = json.root;
    }
  });

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);
startGame(document.querySelector<HTMLButtonElement>("#entergame")!);