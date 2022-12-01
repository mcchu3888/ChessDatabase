import axios from "axios"
import React, { useState, useEffect } from "react";
import { findPiece } from "./pieces"

export default function Database({FEN, board, setBoard, setMetadata}){
    const [games, setGames] = useState([])

    useEffect(()=>{
        const fetchGames = async () =>{
          try{
            const res = await axios.get("http://localhost:8800/gameFEN/" + FEN)
            setGames(res.data)
          } catch(err){
            console.log(err)
          }
        }
        fetchGames()
      }, [FEN])

    
    //   useEffect(()=>{
    //     const fetchGame = async ()=>{
    //       try{
    //         const gamenum = "2"
    //         const res = await axios.get("http://localhost:8800/game/" + gamenum)
    //         setGame(res.data)
    //       } catch(err){
    //         console.log(err)
    //       }
    //     }
    //     fetchGame()
    //   }, [])

    const createNewGame = () => {
    board.startNewGame()
    setBoard(board.clone())
    }

    const loadGame = (loadedGameMoves) => {
        const playBoard = (moveList) => {
            for(let i = 0; i < moveList.length; i++)
            {
                board.selectPieceToMove(moveList[i].fromSquare)
                const targetSquare = moveList[i].toSquare
                if (moveList[i].moveData.promotionChoice){
                  const pieceType = moveList[i].moveData.promotionChoice
                  const pieceColor = moveList[i].piece.color
                  const promotionChoice = findPiece(pieceColor, pieceType)
                  board.movePiece(targetSquare, promotionChoice)
                }
                else
                {
                  board.movePiece(targetSquare)
                }
            }
          }

        const partial = board.playedMoveList
        createNewGame()
        for(let i = 0; i < loadedGameMoves.length; i++)
        {
            const fromSquare = [loadedGameMoves[i]["from_square_row"], loadedGameMoves[i]["from_square_col"]]
            const toSquare = [loadedGameMoves[i]["to_square_row"], loadedGameMoves[i]["to_square_col"]]
            board.selectPieceToMove(fromSquare)
            const targetSquare = toSquare
            if (loadedGameMoves[i]["promotion_choice"]){
                const pieceType = loadedGameMoves[i]["promotion_choice"]
                let pieceColor 
                loadedGameMoves[i]["move_num"] % 2 === 0 ? pieceColor = "black" : pieceColor = "white"
                const promotionChoice = findPiece(pieceColor, pieceType)
                board.movePiece(targetSquare, promotionChoice)
            }
            else
            {
                board.movePiece(targetSquare)
            }
        }
        const full = board.playedMoveList
        setBoard(board.clone())

        createNewGame()
        playBoard(partial)
        board.fullGame = full
        board.generateFEN()
        setBoard(board.clone())
    }

    const getGame = async (game) => {
        try{
            const res = await axios.get("http://localhost:8800/game/" + game.game_num)
            loadGame(res.data)
            const str = game.white_name + " (" + game.white_elo + ") vs. " 
            + game.black_name + " (" + game.black_elo + ") " + game.result
            setMetadata(str)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div id="game-list">
           {games.map((game, index) => 
            <button key={index} onClick={() => getGame(game)}> {game.white_name} ({game.white_elo}) 
            vs. {game.black_name} ({game.black_elo}) &nbsp; {game.result} </button>)}
        </div>
    )
}