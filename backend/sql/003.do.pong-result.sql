CREATE TABLE IF NOT EXISTS PONG_MATCH (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    match_type TEXT NOT NULL,

    user1_email TEXT,
    user1_result INTEGER,

    user2_email TEXT,
    user2_result INTEGER,

    user3_email TEXT,
    user3_result INTEGER,

    user4_email TEXT,
    user4_result INTEGER
);
