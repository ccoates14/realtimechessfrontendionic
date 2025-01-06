import { ChessPiece } from "./ChessPiece";

export class Knight extends ChessPiece {
    isValidMove(start: string, end: string): boolean {
        if (!super.isValidMove(start, end)) return false;

        const [startRow, startCol] = this.board.getCoordinates(start);
        const [endRow, endCol] = this.board.getCoordinates(end);
      
        const rowDiff = Math.abs(startRow - endRow);
        const colDiff = Math.abs(startCol - endCol);
    
        // Knight moves in L-shapes
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      }

      getValidMoves(): string[] {
        const [row, col] = this.getCoordinates();
        const moves = [
          [2, 1], [1, 2], [-1, 2], [-2, 1],
          [-2, -1], [-1, -2], [1, -2], [2, -1],
        ];
        return moves
          .map(([dx, dy]) => [row + dx, col + dy])
          .filter(([r, c]) => this.board.isWithinBounds(r, c) && (!this.board.getPieceAtCoordinates(r, c) || this.board.getPieceAtCoordinates(r, c)?.color !== this.color))
          .map(([r, c]) => this.board.formatPosition(r, c));
      }
  }
  