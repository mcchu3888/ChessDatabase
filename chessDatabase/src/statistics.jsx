import axios from "axios"
import React, { useState, useEffect } from "react";
import { findPiece } from "./pieces"
import _ from 'lodash';

export default function Statistics({FEN, board, setBoard, setMetadata})
{
    const [games, setGames] = useState([])
    const [moves, setMoves] = useState([])

    useEffect(()=>{
        const fetchGames = async () =>{
          try{
            const move_num = board.playedMoveList.length + 1
            const res = await axios.get("http://localhost:8800/stats/" + FEN + "/" + move_num)
            setGames(res.data)
          } catch(err){
            console.log(err)
          }
        }
        fetchGames()
      }, [FEN])
    
    // convert moves to notation
    // hold moves in dictionary 
    // values are a list of win rates 

    const handleClick = (move) => {
      const fromSquare = [move["from_square_row"], move["from_square_col"]]
      const toSquare = [move["to_square_row"], move["to_square_col"]]
      board.selectPieceToMove(fromSquare)
      const targetSquare = toSquare
      if (move["promotion_choice"]){
          const pieceType = move["promotion_choice"]
          let pieceColor 
          move["move_num"] % 2 === 0 ? pieceColor = "black" : pieceColor = "white"
          const promotionChoice = findPiece(pieceColor, pieceType)
          board.movePiece(targetSquare, promotionChoice)
      }
      else
      {
          board.movePiece(targetSquare)
      }
      
      board.generateFEN()
      setBoard(board.clone())
      if(!_.isEqual(board.playedMoveList[board.playedMoveList.length - 1], board.fullGame[board.playedMoveList.length - 1]))
      {
        board.fullGame = board.playedMoveList
        setBoard(board.clone())
        setMetadata("")
      }
    }

    
    return(
        <div id="move-list"> 
            {games.map((move, index) => 
            <button key={index} onClick={() => handleClick(move)}> {move.notation} &emsp; 
            {Math.round((move.white_wins / move.num_of_games) * 1000) / 10}% | {Math.round((move.black_wins / move.num_of_games) * 1000) / 10}% | &nbsp;
            {Math.round((move.draw / move.num_of_games) * 1000) / 10}% | {move.num_of_games} </button>)}
        </div>
    )
}