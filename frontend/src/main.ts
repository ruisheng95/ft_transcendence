/* eslint-disable @typescript-eslint/no-non-null-assertion */
import "./style.css";

import { about_popup } from "./about.ts";
import { init_language } from "./language.ts";

history.pushState({page: "login"}, "login", "/login");
init_language();

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<div id="login_page" class="bg-gray-950 text-white min-h-screen inter-font flex flex-col items-center justify-center">
	
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

		<button type="button" id="open_about_button" class="py-2 rounded-full text-center font-semibold text-lg bg-yellow-400 text-black hover:bg-yellow-300 hover:-translate-y-1 transition duration-200">
			About
		</button>
		
	</div>
</div>

${about_popup}
`;

//open about page
document.querySelector<HTMLButtonElement>("#open_about_button")?.addEventListener("click", () => {
	document.querySelector<HTMLDivElement>("#about_popup")?.classList.remove("hidden");
	document.querySelector<HTMLDivElement>("#login_page")?.classList.add("hidden");
});

//close about page
document.querySelector<HTMLButtonElement>("#close_about_button")?.addEventListener("click", () => {
	document.querySelector<HTMLDivElement>("#about_popup")?.classList.add("hidden");
	document.querySelector<HTMLDivElement>("#login_page")?.classList.remove("hidden");	
});

// document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
// <div class="h-[100vh] bg-black flex items-center justify-center">
//     <div class="flex flex-col gap-5 px-[80px] py-[30px] border border-white w-[40%] items-center">

//     <h1 class="text-white text-[35px] font-bold text-center mb-[20px]">ft_transcendence login</h1>

//         <div id="google_sign_in" class="w-[60%]">
//         </div>

//         <p class="text-white text-center">You have opened <span id="test">0</span> times.</p>
//         <p class="text-green-400 font-bold text-center">This is very tailwind</p>
//     </div>
// </div>
// `;