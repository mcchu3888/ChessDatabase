import React, { useEffect, useState } from "react";
import { Board } from "./chessBoard";
import BoardUI from "./Board"
import MoveList from "./MoveList"
import CapturedPieceContainer from "./CapturedPieceContainer"
import NewGameModal from "./NewGameModal"
import Database from "./database"
import Statistics from "./statistics"
import "./App.css";

const createNewBoard = () => {
  const newBoard = new Board()
  newBoard.setToStartPosition()
  return newBoard
}

const App = () => {
  const [board, setBoard] = useState(createNewBoard)
  const [metadata, setMetadata] = useState("")

  const createNewGame = () => {
    board.startNewGame()
    setBoard(board.clone())
  }

  return (
    <main  >
      {board.gameResult !== "undecided" && 
      <NewGameModal 
        gameResult={board.gameResult}
        createNewGame={createNewGame}/>}
      <div id="game-container">  
      <BoardUI setBoard={setBoard} board={board} setMetadata={setMetadata}/>
      
      <div id="move-list-captured-pieces-wrapper">
        {/* <CapturedPieceContainer 
          capturedPieces={board.blackCapturedPieces}/> */}
          <div id="metadata"> {metadata} </div>
        <MoveList moveList={board.fullGame} currentMove={board.playedMoveList.length-1}/>
        {/* <CapturedPieceContainer 
          capturedPieces={board.whiteCapturedPieces}/> */}
        <Statistics FEN={board.FEN} setBoard={setBoard} board={board} setMetadata={setMetadata}/>
        <Database FEN={board.FEN} setBoard={setBoard} board={board} setMetadata={setMetadata}/>
      </div>
      
    
      </div>
    </main>
  );
}

export default App;