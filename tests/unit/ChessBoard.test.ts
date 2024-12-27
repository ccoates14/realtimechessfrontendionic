import {ChessBoard} from '../src/ChessBoard';
import { Bishop } from '../src/pieces/Bishop';
import { King } from '../src/pieces/King';
import { Knight } from '../src/pieces/Knight';
import { Pawn } from '../src/pieces/Pawn';
import { Queen } from '../src/pieces/Queen';
import { Rook } from '../src/pieces/Rook';

describe('ChessBoard', () => {
  let board: ChessBoard;

  beforeEach(() => {
    board = new ChessBoard();
    board.setupBoard();
  });

  test('should place all white pieces in their correct positions', () => {
    expect(board.board[7][0]).toBeInstanceOf(Rook); // a1
    expect(board.board[7][1]).toBeInstanceOf(Knight); // b1
    expect(board.board[7][2]).toBeInstanceOf(Bishop); // c1
    expect(board.board[7][3]).toBeInstanceOf(Queen); // d1
    expect(board.board[7][4]).toBeInstanceOf(King); // e1
    expect(board.board[7][5]).toBeInstanceOf(Bishop); // f1
    expect(board.board[7][6]).toBeInstanceOf(Knight); // g1
    expect(board.board[7][7]).toBeInstanceOf(Rook); // h1

    for (let file = 0; file < 8; file++) {
      expect(board.board[6][file]).toBeInstanceOf(Pawn); // a2 through h2
    }
  });

  test('should place all black pieces in their correct positions', () => {
    expect(board.board[0][0]).toBeInstanceOf(Rook); // a8
    expect(board.board[0][1]).toBeInstanceOf(Knight); // b8
    expect(board.board[0][2]).toBeInstanceOf(Bishop); // c8
    expect(board.board[0][3]).toBeInstanceOf(Queen); // d8
    expect(board.board[0][4]).toBeInstanceOf(King); // e8
    expect(board.board[0][5]).toBeInstanceOf(Bishop); // f8
    expect(board.board[0][6]).toBeInstanceOf(Knight); // g8
    expect(board.board[0][7]).toBeInstanceOf(Rook); // h8

    for (let file = 0; file < 8; file++) {
      expect(board.board[1][file]).toBeInstanceOf(Pawn); // a7 through h7
    }
  });

  test('should leave all other squares empty', () => {
    for (let rank = 2; rank < 6; rank++) {
      for (let file = 0; file < 8; file++) {
        expect(board.board[rank][file]).toBeNull();
      }
    }
  });

  test('should correctly move a piece', () => {
    expect(board.board[6][4]).toBeInstanceOf(Pawn); // e2 (white pawn)
    expect(board.board[4][4]).toBeNull(); // e4 (empty)

    board.movePiece('e2', 'e4'); // Move white pawn from e2 to e4

    expect(board.board[6][4]).toBeNull(); // e2 should now be empty
    expect(board.board[4][4]).toBeInstanceOf(Pawn); // e4 should now have the pawn
  });

  test('should not allow invalid moves', () => {
    expect(board.board[7][4]).toBeInstanceOf(King); // e1 (white king)
    const moveSuccessful = board.movePiece('e1', 'e3'); // Invalid king move

    expect(moveSuccessful).toBe(false);
    expect(board.board[7][4]).toBeInstanceOf(King); // e1 should still have the king
    expect(board.board[5][4]).toBeNull(); // e3 should still be empty
  });

  test('should track if a king is in checkmate', () => {
    const board = new ChessBoard();
    board.setupBoard();
  
    const whiteKing = new King('King', 'white', board);
    const blackQueen = new Queen('Queen', 'black', board);
    const blackRook = new Rook('Rook', 'black', board);
  
    // Place pieces in a checkmate scenario
    board.placePiece(whiteKing, 'h1'); // White King in the corner
    board.placePiece(blackQueen, 'g2'); // Black Queen delivering check
    board.placePiece(blackRook, 'h2'); // Black Rook blocking any escape
  
    expect(board.isKingInCheckMate(whiteKing)).toBe(true); // King is in checkmate
  });
});