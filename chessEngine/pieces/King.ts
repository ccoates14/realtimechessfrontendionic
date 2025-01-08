import ChessBoard from "../ChessBoard";
import { Bishop } from "./Bishop";
import { ChessPiece } from "./ChessPiece";
import { Knight } from "./Knight";
import { Pawn } from "./Pawn";
import { Queen } from "./Queen";
import { Rook } from "./Rook";

export class King extends ChessPiece {
  static TIMEOUT = 1;
  
  isValidMove(start: string, end: string): boolean {
    if (!super.isValidMove(start, end)) return false;
    
    const [startFile, startRank] = this.parsePosition(start);
    const [endFile, endRank] = this.parsePosition(end);
    return Math.abs(startFile - endFile) <= 1 && Math.abs(startRank - endRank) <= 1;
  }

  isInCheck(board: ChessBoard): boolean {
    const [row, col] = this.getCoordinates();
  
    if (row === -1 || col === -1) return false; // King is not on the board
  
    // Check for pawn attacks
    const pawnAttackOffsets = this.color === 'white' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
    for (const [rowOffset, colOffset] of pawnAttackOffsets) {
      const targetRow = row + rowOffset;
      const targetCol = col + colOffset;
      
      if (!board.isWithinBounds(targetRow, targetCol)) continue;

      const piece = board.getPieceAtCoordinates(targetRow, targetCol);
      if (piece && piece instanceof Pawn && piece.color !== this.color) {
        return true;
      }
    }
  
    // Check for knight attacks
    const knightMoves = [
      [-2, -1], [-1, -2], [1, -2], [2, -1],
      [2, 1], [1, 2], [-1, 2], [-2, 1],
    ];
    for (const [rowOffset, colOffset] of knightMoves) {
      const targetRow = row + rowOffset;
      const targetCol = col + colOffset;

      if (!board.isWithinBounds(targetRow, targetCol)) continue;

      const piece = board.getPieceAtCoordinates(targetRow, targetCol);
      if (piece && piece instanceof Knight && piece.color !== this.color) {
        return true;
      }
    }
  
    // Check for bishop or queen attacks (diagonal lines)
    const diagonalDirections = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [rowDir, colDir] of diagonalDirections) {
      let targetRow = row + rowDir;
      let targetCol = col + colDir;
      while (board.isWithinBounds(targetRow, targetCol)) {
        const piece = board.getPieceAtCoordinates(targetRow, targetCol);
        if (piece) {
          if (piece.color !== this.color && (piece instanceof Bishop || piece instanceof Queen)) {
            return true;
          }
          break; // Blocked by any piece
        }
        targetRow += rowDir;
        targetCol += colDir;
      }
    }
  
    // Check for rook or queen attacks (straight lines)
    const straightDirections = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [rowDir, colDir] of straightDirections) {
      let targetRow = row + rowDir;
      let targetCol = col + colDir;
      while (board.isWithinBounds(targetRow, targetCol)) {
        const piece = board.getPieceAtCoordinates(targetRow, targetCol);
        if (piece) {
          if (piece.color !== this.color && (piece instanceof Rook || piece instanceof Queen)) {
            return true;
          }
          break; // Blocked by any piece
        }
        targetRow += rowDir;
        targetCol += colDir;
      }
    }
  
    return false; // No threats detected
  }

  public getValidMoves(): string[] {
    const [row, col] = this.getCoordinates();

    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],          [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];
    return directions
      .map(([dx, dy]) => [row + dx, col + dy])
      .filter(([r, c]) => this.board.isWithinBounds(r, c) && (!this.board.getPieceAtCoordinates(r, c) || this.board.getPieceAtCoordinates(r, c)?.color !== this.color))
      .map(([r, c]) => this.board.formatPosition(r, c));
  }

}