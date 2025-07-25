-- script to fill data.db
-- do sqlite3 data.db < seed.sql

INSERT INTO USER (EMAIL, USERNAME, AVATAR, RATING, WINNING_STREAK, TOTAL_WIN, TOTAL_LOSE)
VALUES
    ('friend1@example.com', 'abu123', 'https://i.pravatar.cc/150?img=2', 0, 0, 0, 0),
    ('friend2@example.com', 'abu12ajdh', 'https://i.pravatar.cc/150?img=2', 0, 0, 0, 0),
    ('friend3@example.com', 'mariadiami', 'https://i.pravatar.cc/150?img=2', 0, 0, 0, 0),
    ('friend4@example.com', 'marianiani', 'https://i.pravatar.cc/150?img=2', 0, 0, 0, 0), 
    ('friend5@example.com', 'mariakevin', 'https://i.pravatar.cc/150?img=2', 0, 0, 0, 0),
    ('friend6@example.com', 'faris', 'https://i.pravatar.cc/150?img=2', 0, 0, 0, 0),
    ('friend7@example.com', 'jun567kevin', 'https://i.pravatar.cc/150?img=2', 0, 0, 0, 0),
    ('friend8@example.com', 'kevin1234', 'https://i.pravatar.cc/150?img=2', 0, 0, 0, 0),
    ('friend9@example.com', 'lee333', 'https://i.pravatar.cc/150?img=2', 0, 0, 0, 0),
    ('friend10@example.com', 'mariashuk', 'https://i.pravatar.cc/150?img=2', 0, 0, 0, 0);


INSERT INTO FRIEND_LIST (USER_EMAIL, FRIEND_EMAIL)
VALUES 
    ('friend5@example.com', 'friend7@example.com'),
    ('friend7@example.com', 'friend5@example.com'),
    ('friend5@example.com', 'friend6@example.com'),
    ('friend6@example.com', 'friend5@example.com');