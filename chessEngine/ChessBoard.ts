import { Bishop } from "./pieces/Bishop";
import { ChessPiece } from "./pieces/ChessPiece";
import { King } from "./pieces/King";
import { Knight } from "./pieces/Knight";
import { Pawn } from "./pieces/Pawn";
import { Queen } from "./pieces/Queen";
import { Rook } from "./pieces/Rook";

export default class ChessBoard {
    static BOARD_SIZE = 8;
    board: (ChessPiece | null)[][] = Array.from({ length: ChessBoard.BOARD_SIZE }, () => Array(ChessBoard.BOARD_SIZE).fill(null));
    winners: string[] = []; // in the future I might make the game so that there are more then 2 players
  
    constructor() {
      this.setupBoard();
    }
  
    setupBoard() {
      const whitePieces = {
        rooks: ['a1', 'h1'],
        knights: ['b1', 'g1'],
        bishops: ['c1', 'f1'],
        queen: 'd1',
        king: 'e1', 
        pawns: ['a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'],
      };
    
      const blackPieces = {
        rooks: ['a8', 'h8'],
        knights: ['b8', 'g8'],
        bishops: ['c8', 'f8'],
        queen: 'd8',
        king: 'e8',
        pawns: ['a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7'],
      };
    
      // Place white pieces
      whitePieces.rooks.forEach((pos) => this.placePiece(new Rook('Rook', 'white', this), pos));
      whitePieces.knights.forEach((pos) => this.placePiece(new Knight('Knight', 'white', this), pos));
      whitePieces.bishops.forEach((pos) => this.placePiece(new Bishop('Bishop', 'white', this), pos));
      this.placePiece(new Queen('Queen', 'white', this), whitePieces.queen);
      this.placePiece(new King('King', 'white', this), whitePieces.king);
      whitePieces.pawns.forEach((pos) => this.placePiece(new Pawn('Pawn', 'white', this), pos));
    
      // Place black pieces
      blackPieces.rooks.forEach((pos) => this.placePiece(new Rook('Rook', 'black', this), pos));
      blackPieces.knights.forEach((pos) => this.placePiece(new Knight('Knight', 'black', this), pos));
      blackPieces.bishops.forEach((pos) => this.placePiece(new Bishop('Bishop', 'black', this), pos));
      this.placePiece(new Queen('Queen', 'black', this), blackPieces.queen);
      this.placePiece(new King('King', 'black', this), blackPieces.king);
      blackPieces.pawns.forEach((pos) => this.placePiece(new Pawn('Pawn', 'black', this), pos));
    }
  
    placePiece(piece: ChessPiece | null, position: string) {
      const [file, rank] = this.parsePosition(position);
      this.board[rank][file] = piece;
    }
  
    movePiece(start: string, end: string): boolean {
      if (!this.validateMovePositionString(start)) {
        throw new Error(`Invalid start position for move: ${start}`);
      }
      if (!this.validateMovePositionString(end)) {
        throw new Error(`Invalid end position for move: ${end}`);
      }

      const [startFile, startRank] = this.parsePosition(start);
      const [endFile, endRank] = this.parsePosition(end);

      const startPiece = this.board[startRank][startFile];
      // const endPiece = this.board[endRank][endFile];

      if (!startPiece) {
        throw new Error(`No piece found at position ${start}`);
      }
  
      if (startPiece.isValidMove(start, end)) {
        this.board[endRank][endFile] = startPiece;
        this.board[startRank][startFile] = null;

        const opponentColor = startPiece.color === 'white' ? 'black' : 'white';
        const king = this.getKing(startPiece.color);
        const opponentKing = this.getKing(opponentColor);

        // if (king === null) {
          
        // } else if (opponentKing === null) {
        // }

        // if (king.isInCheck(this)) {
        //   //undo move
        //   this.board[startRank][startFile] = startPiece;
        //   this.board[endRank][endFile] = endPiece;
  
        //   console.log(`Invalid move for ${startPiece.name}, would put king in check`);
        // } else {
        //   if (this.isKingInCheckMate(opponentKing)) {
        //     this.losers.push(opponentKing);
        //   }

        //   startPiece.hasMoved = true;
        //   return true;
        // }

        if (king === null) {
          this.winners.push(opponentColor);
        } else if (opponentKing === null) {
          this.winners.push(startPiece.color);
        }

        return true;
      }
  
      console.log(`Invalid move for ${startPiece.name}`);
      return false;
    }

    isPathClear(start: string, end: string): boolean {
      const startCoords = this.getCoordinates(start);
      const endCoords = this.getCoordinates(end);
    
      const [startRow, startCol] = startCoords;
      const [endRow, endCol] = endCoords;
    
      const rowStep = Math.sign(endRow - startRow);
      const colStep = Math.sign(endCol - startCol);
    
      let currentRow = startRow + rowStep;
      let currentCol = startCol + colStep;
    
      while (currentRow !== endRow || currentCol !== endCol) {
        if (this.board[currentRow][currentCol] !== null) {
          return false; // Path is blocked
        }
        currentRow += rowStep;
        currentCol += colStep;
      }

      //check end position is not same team
      if (this.board[endRow][endCol] !== null) {
        if (this.board[endRow][endCol]?.color === this.board[startRow][startCol]?.color) {
          return false;
        }
      }
    
      return true; // Path is clear
    }

    getKing(color: string): King | null {
      for (let row = 0; row < ChessBoard.BOARD_SIZE; row++) {
        for (let col = 0; col < ChessBoard.BOARD_SIZE; col++) {
          const piece = this.board[row][col];
          if (piece instanceof King && piece.color === color) {
            return piece;
          }
        }
      }
      
      return null;
    }

    isWithinBounds(row: number, col: number): boolean {
      return row >= 0 && row < ChessBoard.BOARD_SIZE && col >= 0 && col < ChessBoard.BOARD_SIZE;
    }

    isKingInCheckMate(king: King): boolean {
      const [kingRow, kingCol] = king.getCoordinates();
    
      if (kingRow === -1 || kingCol === -1) return false; // King is not on the board
    
      if (!king.isInCheck(this)) {
        return false; // King is not in check, so not in checkmate
      }
    
      // Get all possible moves for the king
      const possibleMoves = [
        [kingRow - 1, kingCol - 1], [kingRow - 1, kingCol], [kingRow - 1, kingCol + 1],
        [kingRow, kingCol - 1],                      [kingRow, kingCol + 1],
        [kingRow + 1, kingCol - 1], [kingRow + 1, kingCol], [kingRow + 1, kingCol + 1],
      ];
    
      for (const [targetRow, targetCol] of possibleMoves) {
        if (this.isWithinBounds(targetRow, targetCol)) {
          const targetPiece = this.getPieceAtCoordinates(targetRow, targetCol);
    
          // Temporarily move the king to the target square
          const originalPiece = targetPiece;
          this.setPieceAtCoordinates(null, kingRow, kingCol); // Remove the king from its current position
          this.setPieceAtCoordinates(king, targetRow, targetCol);
    
          const isStillInCheck = king.isInCheck(this);
    
          // Revert the board to its original state
          this.setPieceAtCoordinates(king, kingRow, kingCol);
          this.setPieceAtCoordinates(originalPiece, targetRow, targetCol);
    
          if (!isStillInCheck) {
            return false; // If the king can escape check, it's not checkmate
          }
        }
      }
    
      // Check if any allied piece can capture or block the threatening piece
      for (const row of Array(8).keys()) {
        for (const col of Array(8).keys()) {
          const piece = this.getPieceAtCoordinates(row, col);
          if (piece && piece.color === king.color && !(piece instanceof King)) {
            for (const move of piece.getValidMoves()) {
              const [moveRow, moveCol] = this.parsePosition(move);
    
              // Temporarily make the move
              const originalPiece = this.getPieceAtCoordinates(moveRow, moveCol);
              this.setPieceAtCoordinates(null, row, col); // Remove the piece from its current position
              this.setPieceAtCoordinates(piece, moveRow, moveCol);
    
              const isKingSafe = !king.isInCheck(this);
    
              // Revert the move
              this.setPieceAtCoordinates(piece, row, col);
              this.setPieceAtCoordinates(originalPiece, moveRow, moveCol);
    
              if (isKingSafe) {
                return false; // If the threat can be countered, it's not checkmate
              }
            }
          }
        }
      }
    
      return true; // If no moves can prevent check, the king is in checkmate
    }

    getPiece(position: string): ChessPiece | null {
      const [row, col] = this.getCoordinates(position);
      return this.board[row][col];
    }

    toString(): string {
      let boardStr = '';
      for (let row = ChessBoard.BOARD_SIZE - 1; row >= 0; row--) {
        for (let col = 0; col < ChessBoard.BOARD_SIZE; col++) {
          const piece = this.board[row][col];
          boardStr += piece ? piece.name.toLowerCase() + piece.color : '.';
          boardStr += ' ';
        }
        boardStr += '\n';
      }
      return boardStr;
    }
  
    parsePosition(pos: string): [number, number] {
      return [pos.charCodeAt(0) - 'a'.charCodeAt(0), ChessBoard.BOARD_SIZE - parseInt(pos[1])];
    }
  
    getCoordinates(position: string): [number, number] {
      const column = position.charAt(0); // 'a' to 'h'
      const row = position.charAt(1); // '1' to '8'
      
      // Convert the column ('a' to 'h') to 0-7 index
      const colIndex = column.charCodeAt(0) - 'a'.charCodeAt(0);
  
      // Convert the row ('1' to '8') to 7-0 index
      const rowIndex = ChessBoard.BOARD_SIZE - parseInt(row);
      return [rowIndex, colIndex];
    }

    getPieceAtCoordinates(row: number, col: number): ChessPiece | null {
      if (!this.isWithinBounds(row, col)) {
        throw new Error(`Coordinates ${row}, ${col} are out of bounds`);
      }

      return this.board[row][col];
    }

    setPieceAtCoordinates(piece: ChessPiece | null, row: number, col: number) {
      if (!this.isWithinBounds(row, col)) {
        throw new Error(`Coordinates ${row}, ${col} are out of bounds`);
      }

      this.board[row][col] = piece;
    }

    formatPosition(row: number, col: number): string {
      if (!this.isWithinBounds(row, col)) {
        throw new Error(`Invalid board coordinates: (${row}, ${col})`);
      }
    
      const file = String.fromCharCode('a'.charCodeAt(0) + col); // Convert column index to file letter
      const rank = (8 - row).toString(); // Convert row index to rank number (0 -> 8, 7 -> 1)
      return `${file}${rank}`;
    }

    validateMovePositionString(position: string): boolean {
      if (position.length !== 2) return false;
      const [file, rank] = position;

      if (file < 'a' || file > 'h') return false;
      if (rank < '1' || rank > '8') return false;

      return true;
    }

    getWinners(): string[] {
      return this.winners;
    }

  }