import { ChessPiece } from "./ChessPiece";

export class Rook extends ChessPiece {
    isValidMove(start: string, end: string): boolean {
        if (!super.isValidMove(start, end)) return false;
        
        const [startRow, startCol] = this.board.getCoordinates(start);
        const [endRow, endCol] = this.board.getCoordinates(end);
      
        // Rook moves in straight lines
        if (startRow !== endRow && startCol !== endCol) return false;
      
        // Check path
        return this.board.isPathClear(start, end);
      }

      getValidMoves(): string[] {
        const [row, col] = this.getCoordinates();
        const directions = [
          [1, 0], [-1, 0], [0, 1], [0, -1],
        ];
        return this.getSlidingMoves(row, col, this.board, directions);
      }
  }
  