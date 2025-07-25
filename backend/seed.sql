DROP TABLE IF EXISTS FRIEND_LIST;
DROP TABLE IF EXISTS USER;

INSERT INTO USER (EMAIL, USERNAME, AVATAR, RATING, WINNING_STREAK, TOTAL_WIN, TOTAL_LOSE)
VALUES 
    ('friend5@example.com', 'Abu', 'https://i.pravatar.cc/150?img=2', 0, 0, 0, 0),
    ('friend6@example.com', 'Zoo', 'https://i.pravatar.cc/150?img=2', 0, 0, 0, 0),
    ('friend7@example.com', 'Josh', 'https://i.pravatar.cc/150?img=2', 0, 0, 0, 0);


INSERT INTO FRIEND_LIST (USER_EMAIL, FRIEND_EMAIL)
VALUES 
    ('friend5@example.com', 'friend7@example.com'),
    ('friend7@example.com', 'friend5@example.com'),
    ('friend5@example.com', 'friend6@example.com'),
    ('friend6@example.com', 'friend5@example.com');