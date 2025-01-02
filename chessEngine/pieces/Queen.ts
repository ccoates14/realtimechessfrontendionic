import { ChessPiece } from "./ChessPiece";

export class Queen extends ChessPiece {
    isValidMove(start: string, end: string): boolean {
        const [startRow, startCol] = this.board.getCoordinates(start);
        const [endRow, endCol] = this.board.getCoordinates(end);
      
        // Queen moves like a rook or bishop
        const isStraight = startRow === endRow || startCol === endCol;
        const isDiagonal = Math.abs(startRow - endRow) === Math.abs(startCol - endCol);
      
        if (!isStraight && !isDiagonal) return false;
      
        // Check path
        return this.board.isPathClear(start, end);
      }

      getValidMoves(): string[] {
        const [row, col] = this.getCoordinates();
        const directions = [
          [1, 0], [-1, 0], [0, 1], [0, -1], // Rook-like moves
          [1, 1], [-1, -1], [1, -1], [-1, 1], // Bishop-like moves
        ];
        return this.getSlidingMoves(row, col, this.board, directions);
      }
  }
  