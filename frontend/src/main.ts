/* eslint-disable @typescript-eslint/no-non-null-assertion */
import "./style.css";

import { setupCounter } from "./counter.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<div class="h-[100vh] bg-black flex items-center justify-center">
	<div class="flex flex-col gap-5 px-[80px] py-[30px] border border-white w-[40%] items-center">
		
	<h1 class="text-white text-[35px] font-bold text-center mb-[20px]">ft_transcendence login</h1>
     
		<button id="counter" type="button" class="w-[60%] bg-blue-500 text-white py-2 px-4">
			Counter Button
		</button>
       
		<div id="google_sign_in" class="w-[60%]">
		</div>
       
		<p class="text-white text-center">You have opened <span id="test">0</span> times.</p>
		<p class="text-green-400 font-bold text-center">This is very tailwind</p>
	</div>
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
