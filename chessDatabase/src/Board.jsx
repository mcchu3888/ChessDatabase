import React, { useState, useEffect } from "react";
import { findPiece } from "./pieces"
import GameOptionsBar from "./GameOptionsBar"
import PromotionModal from "./PromotionModal"
import _ from 'lodash';
import axios from "axios"

export default function BoardUI({board, setBoard, setMetadata}){

  const [pieceToMove, setPieceToMove] = useState(null)

  const [gameDisplay, setGameDisplay] = 
    useState({
      playerPerspective: "black", 
      boardPosition: board.squares})

  const [pawnPromotion, setPawnPromotion] = 
    useState({
      pawnIsPromoting: false,
      color: null,
      promotionSquare: null})
  
  const [loadedGameMoves, setGame] = useState([])

  const getCoordinates = (coordinates) => {
    const stringCoordinates = coordinates.split(",")
    return stringCoordinates.map(coordinates => parseInt(coordinates))
  }

  const getSquaresClass = (square) => {
    let squareClass
    square.piece ? squareClass = "square contains-piece" : squareClass = "square"
    return squareClass
  }

  const isLightSquare = (coordinate) => {
    return ((coordinate[0] + coordinate[1]) % 2 === 0)
  }

  const move = (square) => {
    const squaresCoordinates = getCoordinates(square.currentTarget.getAttribute("coordinate"))
    const squareHasPiece = (square.currentTarget.getAttribute("piece") !== null)
    if (squareHasPiece && pieceToMove === null){
      
      const whoseTurn = board.determineWhoseTurn()
      const piecesColor = board.getPiecesColor(squaresCoordinates)
      const correctPlayersTurn = (whoseTurn === piecesColor)
      if (!correctPlayersTurn) { return }
      board.selectPieceToMove(squaresCoordinates)
      
      const clickedPiecesMoves = board.selectedPiece.possibleMoves
      if (clickedPiecesMoves.length === 0) { return }
      setPieceToMove("selected")
    }
    
    if (pieceToMove === "selected")
    {
      const pawnWillPromote = board.checkForPromotion(squaresCoordinates)
      if(pawnWillPromote){
        renderPromotionModal(board.selectedPiece.piece.color, squaresCoordinates)
      } else {
        const possibleSquares = board.selectedPiece.possibleMoves
        const boolean = board.arrayContainsSquare(possibleSquares, squaresCoordinates)
      board.movePiece(squaresCoordinates)
      board.generateFEN()
      setBoard(board.clone())
      if(boolean && !_.isEqual(board.playedMoveList[board.playedMoveList.length - 1], board.fullGame[board.playedMoveList.length - 1]))
      {
        board.fullGame = board.playedMoveList
        setBoard(board.clone())
        setMetadata("")
      }
      setPieceToMove(null)
      }
    } 
  }

  const renderPromotionModal = (color, promotionSquare) => {
    setPawnPromotion(
      {pawnIsPromoting: true,
      color: color,
      promotionSquare: promotionSquare})
  }

  const promote = (toSquare, promotionChoice) => {
    board.movePiece(toSquare, promotionChoice)
    setBoard(board.clone())
    setPieceToMove(null)
    setPawnPromotion(
      {pawnIsPromoting: false,
       color: null,
       promotionSquare: null})
  }

  const createNewGame = () => {
    board.startNewGame()
    setBoard(board.clone())
  }

  const flipBoard = () => {
    const updatedPosition = {}
    const boardToFlip = board.squares
    const flippedBoard = []
    
    if (gameDisplay.playerPerspective === "black"){
      for (let row = 7; row >= 0; row--){
        const boardRow = []
        for (let col = 7; col >= 0; col --){
          boardRow.push(boardToFlip[row][col])
        }
        flippedBoard.push(boardRow)
      }
      updatedPosition.playerPerspective = "white"
      updatedPosition.boardPosition = flippedBoard
      setGameDisplay(updatedPosition)
      return
    }

    if(gameDisplay.playerPerspective === "white"){
      for (let row = 0; row <= 7; row++){
        const boardRow = []
        for (let col = 0; col <= 7; col++){
          boardRow.push(boardToFlip[row][col])
        }
        flippedBoard.push(boardRow)
      }
      updatedPosition.playerPerspective = "black"
      updatedPosition.boardPosition = flippedBoard
      setGameDisplay(updatedPosition)
      return
    }
  }

  const takeback = () => {
    const movesToPlayBack = board.playedMoveList.slice(0, -1)
    createNewGame()
    for (let i = 0; i < movesToPlayBack.length; i++){
      board.selectPieceToMove(movesToPlayBack[i].fromSquare)
      const targetSquare = movesToPlayBack[i].toSquare
      if (movesToPlayBack[i].moveData.promotionChoice){
        const pieceType = movesToPlayBack[i].moveData.promotionChoice
        const pieceColor = movesToPlayBack[i].piece.color
        const promotionChoice = findPiece(pieceColor, pieceType)
        return board.movePiece(targetSquare, promotionChoice)
      }
      board.movePiece(targetSquare)
    }
    board.fullGame = movesToPlayBack
    board.generateFEN()
    setBoard(board.clone())
  }

  const moveback = event => {
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

    if(event.keyCode === 37 && board.playedMoveList.length !== 0)
    {
      const moveList = board.playedMoveList.slice(0,-1)
      const full = board.fullGame
      createNewGame()
      playBoard(moveList)
      board.fullGame = full
      board.generateFEN()
      setBoard(board.clone())
    }

    if(event.keyCode === 39 && board.playedMoveList.length !== board.fullGame.length)
    {
      const moveList = board.fullGame.slice(0, board.playedMoveList.length+1)
      const full = board.fullGame
      createNewGame()
      playBoard(moveList)
      board.fullGame = full
      board.generateFEN()
      setBoard(board.clone())
    }

    //up start game
    if(event.keyCode === 38 && board.playedMoveList.length !== 0)
    {
      const full = board.fullGame
      createNewGame()
      board.fullGame = full
      board.generateFEN()
      setBoard(board.clone())
    }

    //down end game 
    if(event.keyCode === 40 && board.playedMoveList.length !== board.fullGame.length)
    {
      const full = board.fullGame
      createNewGame()
      playBoard(full)
      board.fullGame = full
      board.generateFEN()
      setBoard(board.clone())
    }
  }

  const changeTheme = (lightSquareChoice, darkSquareChoice, highlightChoice) => {
    document.documentElement.style.setProperty("--light-square", lightSquareChoice)
    document.documentElement.style.setProperty("--dark-square", darkSquareChoice)
    document.documentElement.style.setProperty("--highlight", highlightChoice)
  }
  
  useEffect(()=>{
    const fetchGame = async ()=>{
      try{
        const gamenum = "2"
        const res = await axios.get("http://localhost:8800/game/" + gamenum)
        setGame(res.data)
      } catch(err){
        console.log(err)
      }
    }
    fetchGame()
  }, [])

  const loadGame = () => {
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
    board.fullGame = board.playedMoveList
    board.generateFEN()
    setBoard(board.clone())
  }

  return (
    <>
      <GameOptionsBar 
        createNewGame={createNewGame}
        flipBoard={flipBoard} 
        takeback={takeback}
        changeTheme={changeTheme}
        loadGame={loadGame}/>

      {pawnPromotion.pawnIsPromoting && <PromotionModal
        promotionData={pawnPromotion}
        board={board}
        promote={promote}/>}
      
      <table 
        id="board"
        cellSpacing="0"
        tabIndex ={0} onKeyDown={moveback}>
        <tbody>
        {gameDisplay.boardPosition.map((row, index) =>
          <tr 
            className="board-row"
            key={index}>
            {row.map((square) => 
              <td 
                className={getSquaresClass(square)}
                coordinate={square.coordinate}
                piece={square.piece}
                key={square.coordinate} 
                style={{
                  backgroundColor: isLightSquare(square.coordinate) ? "var(--light-square)" : "var(--dark-square)",
                  opacity: square.isLastPlayedMove ? 0.6 : 1.0
                  }}
                onClick={(e) => move(e)}>
                  {square.piece && square.piece.symbol}   
                  {square.isPossibleMove && 
                    <span className="possible-move"></span>}       </td>)}
            </tr>)}
        </tbody>
      </table>
    </>
    )
}