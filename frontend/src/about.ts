export const about_popup = `

<div id="about_popup" class="bg-gray-100 min-h-screen inter-font hidden">

	<!-- Header -->
	 <div class="bg-gray-950 text-white px-8 flex items-center justify-between">
		<span class="text-3xl font-bold">About</span>
		<div class="flex items-center space-x-4">
			<img class="h-20 object-cover" src="/42-KL.png" alt="42-KL">
			<button id="close_about_button" class="text-white hover:text-red-400 transition-colors">
				X
			</button>
		</div>
	 </div>

	<!-- Content ----------------------------------------------------------->
	<div class="py-16 px-32 grid grid-cols-12 gap-12 items-center">

		<!-- Project Description -->
		<div class="col-span-6 space-y-6 text-lg text-gray-700">
			<p>
				Part of the 42 school curriculum, this project focuses on the design, 
				development, and deployment of a full-stack web application.
			</p>   
			<p>
				The application features a modern take on the classic 1970s Pong 
				game. Players can compete in real-time matches with friends or 
				sharpen their skills in practice mode against AI. Progress can be tracked 
				through detailed analytics and game history.
			</p>
			<p>
				Feeling bored or want a change of pace? Try out our secondary game: 
				<br>Tic-Tac-Toe
			</p>
		</div>

		<!-- Frontend Tech -->
		<div class="bg-white col-span-3 space-y-8 rounded-xl p-8 shadow-md shadow-gray-200">
			<div>
				<i class="fas fa-code text-2xl mr-4"></i>
				<span class="text-2xl font-bold">Frontend</span>
			</div>
			<ul class="list-disc pl-5 space-y-2 text-gray-700">
				<li>HTML5</li>
				<li>Tailwind CSS</li>
				<li>Typescript</li>
			</ul>
			<div class="flex justify-around">
				<img class="w-12 h-12" src="/tailwind.svg" alt="tailwind-logo">
				<img class="w-12 h-12" src="/typescript.svg" alt="typescript-logo">
			</div>
		</div>

		<!-- Backend Tech -->
		<div class="bg-white col-span-3 space-y-8 rounded-xl p-8 shadow-md shadow-gray-200">
			<div>
				<i class="fas fa-server text-2xl mr-4"></i>
				<span class="text-2xl font-bold">Backend</span>
			</div>
			<ul class="list-disc pl-5 space-y-2 text-gray-700">
				<li>Node.js</li>
				<li>Fastify</li>
				<li>Sqlite</li>
			</ul>
			<div class="flex justify-around">
				<img class="w-12 h-12" src="/fastify.svg" alt="tailwind-logo">
				<img class="w-12 h-12" src="/sqlite.svg" alt="typescript-logo">
			</div>
		</div>
	</div>

	<!-- Team Member ---------------------------------------------------------->
	<div class="text-center text-3xl font-bold pb-10">Team members</div>
	
	<div class=" px-32 flex justify-center items-center gap-20">
		<div class="flex flex-col text-center">
			<img class="w-24 h-24 rounded-full object-cover" src="/abinti-a.jpg" alt="member">
			<span class="font-bold text-gray-700 text-lg">Adya</span>
			<span class="text-gray-500">abinti-a</span>
		</div>
		<div class="flex flex-col text-center">
			<img class="w-24 h-24 rounded-full object-cover" src="/cheelim.jpg" alt="member">
			<span class="font-bold text-gray-700 text-lg">Chee Kit</span>
			<span class="text-gray-500">cheelim</span>
		</div>
		<div class="flex flex-col text-center">
			<img class="w-24 h-24 rounded-full object-cover" src="/jpaul.jpg" alt="member">
			<span class="font-bold text-gray-700 text-lg">Jason</span>
			<span class="text-gray-500">jpaul</span>
		</div>
		<div class="flex flex-col text-center">
			<img class="w-24 h-24 rounded-full object-cover" src="/rng.jpg" alt="member">
			<span class="font-bold text-gray-700 text-lg">Rui Sheng</span>
			<span class="text-gray-500">rng</span>
		</div>
	</div>
</div>
`