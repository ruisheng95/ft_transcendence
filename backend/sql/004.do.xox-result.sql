CREATE TABLE IF NOT EXISTS XOX (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    date TEXT NOT NULL DEFAULT (date('now')),

    left_name TEXT NOT NULL,
    left_result INTEGER NOT NULL,

    right_name TEXT NOT NULL,
    right_result INTEGER NOT NULL
);

-- NOTE result: 0-tie 1-lose 2-win