/* eslint-disable @typescript-eslint/no-explicit-any */

const bm_texts = {
	//header
	header_game: "Permainan",
	header_menu: "Menu",
	header_pong: "Pong",
	header_tic_tac_toe: "Tic-Tac-Toe",
	header_settings: "Seting",
	header_friends: "Kawan",
	header_logout: "Log Keluar",

	// 1v1
	online_1v1_button: "Online",
	local_1v1_button: "Main Tempatan",
	pong1v1_desc: "Klasik 1-lawan-1, kalahkan lawan anda dalam pertarungan",

	// 2v2
	online_2v2_button: "Online",
	local_2v2_button: "Main Tempatan",
	pong2v2_desc: "Bergabung dengan rakan dan hancurkan persaingan",

	// Tournament
	pongTournament_desc: "Daki carta. Setiap pemain bertanding dalam 2 pusingan untuk tentukan juara",
	online_tournament_button: "Online",
	local_tournament_button: "Main Tempatan",

	// Practice
	vs_AI_desc: "Berlatih dan asah kemahiran anda dengan menentang AI",
	vs_AI_game_button: "Lawan AI",

	// Player stats
	playerstats_button_text: "Statistik Pemain",

	// Friends page
	addfriend_search_bar: "Cari nama kawan",

	// Settings page
	settings_profile_text: "Profil",
	settings_language_text: "Bahasa",
	edit_profile: "Edit",

	// Player stats
	playerstats_match_history: "Sejarah Perlawanan",
	playerstats_date: "Tarikh",
	playerstats_match_type: "Jenis Perlawanan",
	playerstats_players: "Pemain",
	playerstats_result: "Keputusan",
	playerstats_satistics: "Statistik",
	playerstats_rating_header: "Penarafan",
	playerstats_winstreak_header: "Rantaian Kemenangan",
	playerstats_total_matches_header: "Jumlah Perlawanan",
	playerstats_total_wins_header: "Jumlah Kemenangan",
	playerstats_total_loss_header: "Jumlah Kekalahan",
	playerstats_total_winrate_header: "Kadar Kemenangan",
	playerstats_game_selection_footer: "Pilihan Permainan",

	// Error messages
	"Alphabets, numbers or '_' only": "Huruf, nombor atau '_' sahaja",
	"search input too short": "Carian terlalu pendek",
	"search input too long": "Carian terlalu panjang",
	"invalid character in search input": "Aksara tidak sah dalam carian",
	"name must be minimum 5 characters": "Nama mesti sekurang-kurangnya 5 aksara",
	"name must be maximum 30 characters": "Nama tidak boleh melebihi 30 aksara",
	"only letters, numbers, and '_' allowed": "Hanya huruf, nombor dan '_' dibenarkan",
	"username already exists": "Nama pengguna sudah wujud",
	"internal server error": "Ralat dalaman pelayan",
	"please provide either a name or avatar to update": "Sila berikan sama ada nama atau avatar untuk dikemas kini",
	"server error": "Ralat pelayan",
	"Invalid session": "Sesi tidak sah",
	"User not found": "Pengguna tidak ditemui",
	"Already friends with this user": "Anda sudah berkawan dengan pengguna ini",
	"You are not friends with this user": "Anda tidak berkawan dengan pengguna ini",
	"Database error occurred": "Ralat pangkalan data berlaku",
	"input name too long": "name terlalu panjang",
	"Error: Please choose an image file only": "Ralat: Sila pilih fail imej sahaja",

	//other strings
	"No match history yet": "Belum ada sejarah perlawanan"
}

const en_texts = {
	header_game: "Game",
	header_menu: "Menu",
	header_pong: "Pong",
	header_tic_tac_toe: "Tic-Tac-Toe",
	header_settings: "Settings",
	header_friends: "Friends",
	header_logout: "Logout",

	// 1v1
	online_1v1_button: "Online",
	local_1v1_button: "Local Play",
	pong1v1_desc: "Classic 1-on-1 clash outplay your rival in a duel",

	// 2v2
	online_2v2_button: "Online",
	local_2v2_button: "Local Play",
	pong2v2_desc: "Team up with a friend and crush the competition",

	// Tournament
	pongTournament_desc: "Climb the bracket. Each player competes in 2 rounds to determine the winner",
	online_tournament_button: "Online",
	local_tournament_button: "Local Play",

	// Practice
	vs_AI_desc: "Train up and sharpen your skills by battling the AI",
	vs_AI_game_button: "vs AI",

	// Player stats
	playerstats_button_text: "Player stats",

	// Friends page
	addfriend_search_bar: "Search friend's name",

	// Settings page
	settings_profile_text: "Profile",
	settings_language_text: "Language",
	edit_profile: "Edit",

	// Player stats
	playerstats_match_history: "Match History",
	playerstats_date: "Date",
	playerstats_match_type: "Match Type",
	playerstats_players: "Players",
	playerstats_result: "Result",
	playerstats_satistics: "Statistics",
	playerstats_rating_header: "Rating",
	playerstats_winstreak_header: "Winning Streak",
	playerstats_total_matches_header: "Total Matches",
	playerstats_total_wins_header: "Total Wins",
	playerstats_total_loss_header: "Total Losses",
	playerstats_total_winrate_header: "Win Rate",
	playerstats_game_selection_footer: "Game Selection"
}

let current_language = "english";
localStorage.setItem("current_language", "english");

function change_language_to_bm()
{
	for(const key in bm_texts)
	{
		const element = document.getElementById(key);
		if(!element) throw new Error("change lang elements not found");

		if(element.tagName === 'INPUT') //checks if the element is "input" type
			(element as HTMLInputElement).placeholder = (bm_texts as any)[key];
		else
			element.textContent = (bm_texts as any)[key]; 
	}
}

function change_language_to_en()
{
	for(const key in bm_texts)
	{
		const element = document.getElementById(key);
		if(!element) throw new Error("change lang elements not found");

		if(element.tagName === 'INPUT')
			(element as HTMLInputElement).placeholder = (en_texts as any)[key];
		else
			element.textContent = (en_texts as any)[key]; 
	}
}

export function handle_language_change(language: string)
{
	current_language = language;
	localStorage.setItem("current_language", current_language);

	if(language === "malay")
		change_language_to_bm();
	else if(language === "english")
		change_language_to_en();
}

export function translate_text(text: string)
{
	if (current_language === "malay")
	{
		if (text in bm_texts)
			return (bm_texts as any)[text];
	}
	return text;
}