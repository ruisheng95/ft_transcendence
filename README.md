# ft_transcendence

Final 42 School project: a full-stack web application bringing the classic Pong game into the browser, enriched with modern features like authentication, multiplayer, AI and user dashboards.

This project was built using `Node.js` + `Fastify` for the backend, `TypeScript` + `TailwindCSS` for the frontend and SQLite for the database.

## Features

<img width="1920" height="1032" alt="firefox_jqACBUFGnh" src="https://github.com/user-attachments/assets/a8a3858e-5a4e-42fd-b92d-a3c4d4940040" />

- Registration: Users can sign up with their Google account.

<img width="1920" height="1032" alt="firefox_u05u5Qpj1N" src="https://github.com/user-attachments/assets/bdeaeee9-e3b2-459a-b773-fa1d0174b1ab" />

- Users can set a unique username.

- Upload custom avatars or fallback to a default avatar.

- Supports 3 languages (English, Malay, Chinese).

<img width="1920" height="1032" alt="firefox_zrC0KEY2nB" src="https://github.com/user-attachments/assets/7e4cf4e7-d637-4ff6-a38f-b7544c38890e" />

- Pong Modes (1v1, 2v2, Tournament, VS AI)
- Supports local and online play.

<img width="1920" height="1032" alt="firefox_iEtOs6EvqF" src="https://github.com/user-attachments/assets/56b4135f-4189-4b5a-bb40-042c20362905" />

- Players can view their statistics (Rating Total Win, Total Lose, Winning Streak, etc).
- See match history with opponents, game type, and date.

<img width="1920" height="1032" alt="firefox_GoDlOx2C74" src="https://github.com/user-attachments/assets/c5c6bde3-15d9-4aa0-ab1d-4d358bcea7f7" />

- Players can add or remove friends.
- See friends’ online/offline status in real-time.

## Technologies Used

- Backend: Node.js, Fastify

- Frontend: TypeScript + TailwindCSS

- Database: SQLite

- Auth: Google Sign-In

- Other: Docker


## Setup & Installation

1. Clone the repository

```sh
git clone https://github.com/ruisheng95/ft_transcendence.git
cd ft_transcendence
```

2. Set up Google Sign-In API Key
- Open the Makefile and replace "changeme" with your actual Google Client ID:
```Makefile
build:
	@GOOGLE_CLIENT_ID="changeme" docker-compose -f docker-compose.yml build
```


3. Run the project with Docker

```sh
make
```

4. Access the application
```
https://localhost:3001
```
