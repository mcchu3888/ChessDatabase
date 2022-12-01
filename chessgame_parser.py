import chess 
import chess.pgn
import csv 
import os

letters_to_number = {"a": 7, "b": 6, "c": 5, "d": 4, "e": 3, "f": 2, "g": 1, "h": 0}
char_to_piece = {"q": "queen", "n":"knight", "b":"bishop", "r":"rook"}

files = os.listdir("./pgn_files")
files.sort()
game_number = 1
with open("./csv_files/game_data.csv", "w", encoding='UTF8', newline='') as csv_file:
    with open("./csv_files/metadata.csv", "w", encoding='UTF8', newline='') as csv_file2:
        writer = csv.writer(csv_file)
        writer2 = csv.writer(csv_file2)
        for myfile in files[1:10]:
            path = "./pgn_files/" + myfile
            pgn = open(path)
            game = chess.pgn.read_game(pgn)
            while game:
                metadata = [game_number]
                metadata.append(game.headers["White"])
                metadata.append(game.headers["Black"])
                metadata.append(game.headers["WhiteElo"])
                metadata.append(game.headers["BlackElo"])
                metadata.append(game.headers["Result"])
                writer2.writerow(metadata)
                move_number = 1
                board = game.board()
                for move in game.mainline_moves():
                    row = [game_number, move_number]
                    row.append(board.san(move))
                    uci = move.uci()
                    row.append(int(uci[1]) - 1)
                    row.append(letters_to_number[uci[0]])
                    row.append(int(uci[3]) - 1)
                    row.append(letters_to_number[uci[2]])
                    
                    if len(uci) == 5:
                        row.append(char_to_piece[uci[4]])
                    else:
                        row.append(None)
                    board.push(move)
                    row.append(board.fen().split(" ")[0])
                    writer.writerow(row)
                    move_number += 1
                game_number += 1
                game = chess.pgn.read_game(pgn)
            pgn.close()
