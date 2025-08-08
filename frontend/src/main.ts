/* eslint-disable @typescript-eslint/no-non-null-assertion */
import "./style.css";

import { setupCounter } from "./counter.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<div class="bg-gray-950 text-white min-h-screen inter-font flex flex-col items-center justify-center">
	
	<!-- Project title -->
	<div class="mb-40">
		<div class="h-1 bg-yellow-400 w-full mb-6"></div>
		<h1 class="text-6xl pixel-font tracking-widest text-center">
			FT_TRANSCENDENCE
		</h1>
		<div class="h-1 bg-yellow-400 w-full mt-6"></div>
	</div>
	
	<!-- Button container -->
	<div class="flex flex-col space-y-6">
		
		<div id="google_sign_in">
		</div>

		<button type="button" class="py-2 rounded-full text-center font-semibold text-lg bg-yellow-400 text-black hover:bg-yellow-300 hover:-translate-y-1 transition duration-200">
			About
		</button>

		<button id="counter" type="button" class="py-2 rounded-full text-center font-semibold text-lg bg-yellow-400 text-black hover:bg-yellow-300 hover:-translate-y-1 transition duration-200">
			About
		</button>
		
	</div>
</div>
`;

// document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
// <div class="h-[100vh] bg-black flex items-center justify-center">
//     <div class="flex flex-col gap-5 px-[80px] py-[30px] border border-white w-[40%] items-center">

//     <h1 class="text-white text-[35px] font-bold text-center mb-[20px]">ft_transcendence login</h1>

//         <button id="counter" type="button" class="w-[60%] bg-blue-500 text-white py-2 px-4">
//             Counter Button
//         </button>

//         <div id="google_sign_in" class="w-[60%]">
//         </div>

//         <p class="text-white text-center">You have opened <span id="test">0</span> times.</p>
//         <p class="text-green-400 font-bold text-center">This is very tailwind</p>
//     </div>
// </div>
// `;

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);