import ChessBoard from "../ChessBoard";

export abstract class ChessPiece {
    constructor(public name: string, public color: string, public board: ChessBoard, public timeout: number, public hasMoved: boolean = false) {
    }

    public isValidMove(_: string, end: string) {
      const [endRow, endCol] = this.board.getCoordinates(end);
      const endPiece = this.board.board[endRow][endCol];
      if (endPiece && endPiece.color === this.color) return false;
      return true;
    };
  
    protected parsePosition(pos: string): [number, number] {
      return [pos.charCodeAt(0) - 'a'.charCodeAt(0), parseInt(pos[1]) - 1];
    }

    //this is stupid but whatever for now this is fine
    public getCoordinates(): [number, number] {
      let rowCor = -1;
      let colCor = -1;

      const board = this.board.board;

      for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++){
          if(board[i][j] === this){
            rowCor = i;
            colCor = j;
            return [rowCor, colCor];
          }
        }
      }

      return [rowCor, colCor];
    }

    public abstract getValidMoves(): string[];

    getSlidingMoves(row: number, col: number, board: ChessBoard, directions: number[][]): string[] {
      const moves: string[] = [];
      for (const [dx, dy] of directions) {
        let r = row + dx;
        let c = col + dy;
        while (board.isWithinBounds(r, c)) {
          const targetPiece = board.getPieceAtCoordinates(r, c);
          if (!targetPiece) {
            moves.push(board.formatPosition(r, c));
          } else {
            if (targetPiece.color !== this.color) {
              moves.push(board.formatPosition(r, c));
            }
            break; // Stop sliding in this direction
          }
          r += dx;
          c += dy;
        }
      }
      return moves;
    }
  }