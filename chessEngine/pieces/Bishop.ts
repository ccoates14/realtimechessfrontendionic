import { ChessPiece } from "./ChessPiece";

export class Bishop extends ChessPiece {
    isValidMove(start: string, end: string): boolean {
        if (!super.isValidMove(start, end)) return false;
        
        const [startRow, startCol] = this.board.getCoordinates(start);
        const [endRow, endCol] = this.board.getCoordinates(end);
      
        // Bishop moves diagonally
        if (Math.abs(startRow - endRow) !== Math.abs(startCol - endCol)) return false;
      
        // Check path
        return this.board.isPathClear(start, end);
      }


      getValidMoves(): string[] {
        const [row, col] = this.getCoordinates();
        const directions = [
          [1, 1], [-1, -1], [1, -1], [-1, 1],
        ];
        return this.getSlidingMoves(row, col, this.board, directions);
      }
  }