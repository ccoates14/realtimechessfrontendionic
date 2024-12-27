import { ChessPiece } from "./ChessPiece";

export class Pawn extends ChessPiece {
    isValidMove(start: string, end: string): boolean {
        const [startRow, startCol] = this.board.getCoordinates(start);
        const [endRow, endCol] = this.board.getCoordinates(end);
      
        const isFirstMove = this.color === 'white' ? startRow === 6 : startRow === 1;
        const direction = this.color === 'white' ? -1 : 1;
        const isOneStep = endRow === startRow + direction && startCol === endCol;
        const isTwoStep = isFirstMove && endRow === startRow + 2 * direction && startCol === endCol;
      
        if (isTwoStep && !this.board.isPathClear(start, end)) return false;
      
        return isOneStep || isTwoStep;
      }

      getValidMoves(): string[] {
        const [row, col] = this.getCoordinates();
        const moves: string[] = [];
        const direction = this.color === 'white' ? -1 : 1;
      
        // Move forward
        const forwardRow = row + direction;
        if (this.board.isWithinBounds(forwardRow, col) && !this.board.getPieceAtCoordinates(forwardRow, col)) {
          moves.push(this.board.formatPosition(forwardRow, col));
      
          // Double forward on first move
          const doubleForwardRow = row + 2 * direction;
          if (!this.hasMoved && this.board.isWithinBounds(doubleForwardRow, col) && !this.board.getPieceAtCoordinates(doubleForwardRow, col)) {
            moves.push(this.board.formatPosition(doubleForwardRow, col));
          }
        }
      
        // Captures
        const captureOffsets = [[direction, -1], [direction, 1]];
        for (const [dx, dy] of captureOffsets) {
          const targetRow = row + dx;
          const targetCol = col + dy;

          if (this.board.isWithinBounds(targetRow, targetCol)) {
            const targetPiece = this.board.getPieceAtCoordinates(targetRow, targetCol);
            if (targetPiece && targetPiece.color !== this.color) {
              moves.push(this.board.formatPosition(targetRow, targetCol));
            }
          }
        }
      
        return moves;
      }
  }