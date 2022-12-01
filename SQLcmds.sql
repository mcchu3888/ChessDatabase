CREATE TABLE `chess_database`.`Metadata` (
  `game_num` INT NOT NULL,
  `white_name` VARCHAR(45) NOT NULL,
  `black_name` VARCHAR(45) NOT NULL,
  `white_elo` INT NULL,
  `black_elo` INT NULL,
  `result` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`game_num`));

CREATE TABLE `Games` (
  `game_num` int(11) NOT NULL,
  `result` VARCHAR(45) NOT NULL,
  `move_num` int(11) NOT NULL,
  `notation` varchar(10) NOT NULL,
  `from_square_row` int(11) NOT NULL,
  `from_square_col` int(11) NOT NULL,
  `to_square_row` int(11) NOT NULL,
  `to_square_col` int(11) NOT NULL,
  `promotion_choice` varchar(45) DEFAULT NULL,
  `FEN` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SHOW VARIABLES LIKE 'local_infile';
SET GLOBAL local_infile = 1;
SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

LOAD DATA LOCAL INFILE 'Users/michaelchu/Desktop/lichess_database/csv_files/metadata.csv' INTO TABLE Metadata
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\r\n';

LOAD DATA LOCAL INFILE 'Users/michaelchu/Desktop/lichess_database/csv_files/game_data.csv' INTO TABLE Games
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\r\n';

CREATE INDEX FENcheck ON Games(FEN, game_num);
CREATE INDEX gamesNUM ON Games(game_num);
CREATE INDEX search ON Games(FEN, move_num, notation, from_square_row, from_square_col, to_square_row, to_square_col, result);

SELECT notation, from_square_row, from_square_col, to_square_row, to_square_col,
COUNT(CASE WHEN result = '1-0' THEN 1 END) as white_wins, COUNT(CASE WHEN result = '0-1' THEN 1 END) as black_wins,
COUNT(CASE WHEN result = '1/2-1/2' THEN 1 END) as draw, COUNT(result) as num_of_games
FROM Games WHERE FEN = ? AND move_num = ?
GROUP BY notation ORDER BY num_of_games DESC;

SELECT * FROM Metadata INNER JOIN 
(SELECT game_num FROM Games WHERE FEN=? LIMIT 10) as t ON t.game_num = Metadata.game_num;