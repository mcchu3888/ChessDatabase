import React, { useEffect } from "react";

export default function MoveList({moveList, currentMove}){

  useEffect(() => {
    scrollToBottom()
  });

  const xAxis = {
    0: "h",
    1: "g",
    2: "f",
    3: "e",
    4: "d",
    5: "c",
    6: "b",
    7: "a"
  }

  const pieceAbbreviations = {
    "pawn": "",
    "knight": "N",
    "bishop": "B",
    "rook": "R",
    "queen": "Q",
    "king": "K"
  }

  const moveListContainer = document.querySelector("#move-list")

  const scrollToBottom = () => {
    if (moveList.length > 8) {
      moveListContainer.scrollTop = moveListContainer.scrollHeight * Math.floor(currentMove / 2) / (moveList.length / 2) - 80
    }
  }

  const getMoveNumber = (index) => {
    return Math.round(index/2+1)
  }

  const renderMoveNotation = (move, index) => {
    let moveNotation
    if (move.moveData.kingsideCastle) {
      moveNotation = "0 - 0"
    }
    if (move.moveData.queensideCastle) {
      moveNotation = "0 - 0 - 0"
    }
    const wasCastling = (move.moveData.queensideCastle || move.moveData.kingsideCastle)
    if (wasCastling) {
      if (move.moveData.winner) {
        moveNotation += "#"
        return moveNotation
      }
      if (move.moveData.wasACheck) {
        moveNotation += "+"
      }
      return moveNotation
    }
    const pieceAbbreviation = pieceAbbreviations[move.piece.type]
    const endRow = (move.toSquare[0] + 1)
    const endColumn = (xAxis[move.toSquare[1]])
    const capture = move.moveData.wasACapture
    const promotion = move.moveData.promotionChoice
    if(move.piece.type === "pawn"){
      const pawnsStartRow = xAxis[move.fromSquare[1]]
      moveNotation = pawnsStartRow
      if(capture){
        moveNotation += `x${endColumn}${endRow}`
      } else {
        moveNotation += `${endRow}`
      }
      if(promotion){
        moveNotation += `=${pieceAbbreviations[promotion]}`
      } 
    }
    if(move.piece.type !== "pawn"){
      moveNotation = pieceAbbreviation
      if(capture){
        moveNotation += "x"
      }
      moveNotation += `${endColumn}${endRow}`
    }  
    if(move.moveData.gameResult){
      if (move.moveData.gameResult.includes("wins")){
      moveNotation += "#"
      }
      return moveNotation
    }
    if(move.moveData.wasACheck){
      moveNotation += "+"
    }
    return moveNotation
  }

  return (
      <div 
        id="move-list">
        {moveList.map((move, index) => 
          <div 
            key={index}
            className="move-notation"
            style={index==currentMove ? {backgroundColor: 'blue'} : {}}> 
            {index % 2 === 0 && 
            <span className="move-number" >
            {`${getMoveNumber(index)}. `}</span>}
            <span > {renderMoveNotation(move, index)} </span>
            {move.moveData.gameResult === "white wins" && <div>1 - 0</div>}
            {move.moveData.gameResult === "black wins" && <div className="black-wins-result">0 - 1</div>}
            {move.moveData.gameResult === "stalemate" && <div>
            1/2 - 1/2</div>}
          </div>)}
        </div>        
  )
}