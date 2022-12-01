import express from "express"
import mysql from "mysql"
import cors from "cors"

const app = express()

const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Chuyourfood1",
    databse:"chess_database"
})

db.query("use chess_database")

app.use(express.json())
app.use(cors())

app.get("/", (req,res)=> {
    res.json("hello this is the backend")
})

app.get("/game/:num", (req,res) => {
    const gameId = req.params.num
    const q = "SELECT * FROM Games WHERE game_num=?"
    db.query(q, [gameId], (err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get("/gameFEN/:fen", (req, res) => {
    const current_FEN = req.params.fen
    const q = "SELECT * FROM Metadata INNER JOIN (SELECT game_num FROM Games WHERE FEN=? LIMIT 10) as t ON t.game_num = Metadata.game_num"
    db.query(q, [current_FEN], (err, data) => {
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get("/stats/:fen/:num", (req, res) => {
    const current_FEN = req.params.fen
    const move_num = req.params.num
    const q = 
    "SELECT notation, from_square_row, from_square_col, to_square_row, to_square_col," + 
    " COUNT(CASE WHEN result = '1-0' THEN 1 END) as white_wins, COUNT(CASE WHEN result = '0-1' THEN 1 END) as black_wins," + 
    " COUNT(CASE WHEN result = '1/2-1/2' THEN 1 END) as draw, COUNT(result) as num_of_games" + 
    " FROM Games WHERE FEN = ? AND move_num = ?"
    + " GROUP BY notation ORDER BY num_of_games DESC"
    db.query(q, [current_FEN, move_num], (err, data) => {
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.post("/game1", (req, res) =>{
//to add a game
})

app.listen(8800, () => {
    console.log("connected to backend!")
})