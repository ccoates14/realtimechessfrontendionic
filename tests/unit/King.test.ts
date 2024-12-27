import { ChessBoard } from "../src/ChessBoard";
import { Bishop } from "../src/pieces/Bishop";
import { King } from "../src/pieces/King";
import { Knight } from "../src/pieces/Knight";
import { Pawn } from "../src/pieces/Pawn";
import { Queen } from "../src/pieces/Queen";
import { Rook } from "../src/pieces/Rook";


describe("King test", () => {
    let board: ChessBoard;

    beforeEach(() => {
        board = new ChessBoard();
    });

    it('should be able to move one square in any direction', () => {
        expect(board.movePiece('e1', 'e2')).toBe(true);
        expect(board.movePiece('e2', 'f2')).toBe(true);
        expect(board.movePiece('f2', 'f1')).toBe(true);
        expect(board.movePiece('f1', 'e1')).toBe(true);
    });
});

describe('King.isInCheck', () => {
    let board: ChessBoard;
  
    beforeEach(() => {
      board = new ChessBoard();
      board.setupBoard();
    });
  
    test('should detect pawn attacking the king', () => {
      const king = new King('King', 'white', board);
      const pawn = new Pawn('Pawn', 'black', board);
  
      board.placePiece(king, 'e4');
      board.placePiece(pawn, 'd5');
  
      expect(king.isInCheck(board)).toBe(true);
    });
  
    test('should detect knight attacking the king', () => {
      const king = new King('King', 'white', board);
      const knight = new Knight('Knight', 'black', board);
  
      board.placePiece(king, 'e4');
      board.placePiece(knight, 'g5');
  
      expect(king.isInCheck(board)).toBe(true);
    });
  
    test('should detect bishop attacking the king diagonally', () => {
      const king = new King('King', 'white', board);
      const bishop = new Bishop('Bishop', 'black', board);
  
      board.placePiece(king, 'e4');
      board.placePiece(bishop, 'b7');
  
      expect(king.isInCheck(board)).toBe(true);
    });
  
    test('should detect rook attacking the king horizontally', () => {
      const king = new King('King', 'white', board);
      const rook = new Rook('Rook', 'black', board);
  
      board.placePiece(king, 'e4');
    
      board.placePiece(null, 'e7');
      board.placePiece(rook, 'e8');
  
      expect(king.isInCheck(board)).toBe(true);
    });
  
    test('should detect queen attacking the king diagonally and straight', () => {
      const king = new King('King', 'white', board);
      const queen = new Queen('Queen', 'black', board);
  
      board.placePiece(king, 'e4');

      board.placePiece(null, 'g2');
      board.placePiece(queen, 'h1');
  
      expect(king.isInCheck(board)).toBe(true);
    });
  
    test('should detect no check when king is safe', () => {
      const king = new King('King', 'white', board);
      const pawn = new Pawn('Pawn', 'black', board);
  
      board.placePiece(king, 'e3');
      board.placePiece(pawn, 'f5');
  
      expect(king.isInCheck(board)).toBe(false);
    });
  
    test('should detect no check if path is blocked by another piece', () => {
      const king = new King('King', 'white', board);
      const rook = new Rook('Rook', 'black', board);
      const blockingPawn = new Pawn('Pawn', 'white', board);
  
      board.placePiece(king, 'e4');
      board.placePiece(rook, 'e8');
      board.placePiece(blockingPawn, 'e6');
  
      expect(king.isInCheck(board)).toBe(false);
    });
  
    test('should detect multiple threats to the king', () => {
      const king = new King('King', 'white', board);
      const rook = new Rook('Rook', 'black', board);
      const knight = new Knight('Knight', 'black', board);
  
      board.placePiece(king, 'e4');
      board.placePiece(rook, 'e8');
      board.placePiece(knight, 'g5');
  
      expect(king.isInCheck(board)).toBe(true);
    });
  });