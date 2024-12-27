import { ChessBoard } from "../src/ChessBoard";
import { Pawn } from "../src/pieces/Pawn";


describe("Knight test", () => {
    let board: ChessBoard;

    beforeEach(() => {
        board = new ChessBoard();
    });

    it('should be able to move in L-shape', () => {
        expect(board.movePiece('b1', 'c3')).toBe(true);
    });

    it('should not be able to move in straight line', () => {
        expect(board.movePiece('b1', 'b3')).toBe(false);
    });

    it('should not be able to move diagonally', () => {
        expect(board.movePiece('b1', 'c2')).toBe(false);
    });

    it('should not be able to move to the same square', () => {
        expect(board.movePiece('b1', 'b1')).toBe(false);
    });

    it('should not be able to move to a square occupied by a piece of the same color', () => {
        expect(board.movePiece('b1', 'c3')).toBe(true);
        expect(board.movePiece('g8', 'f6')).toBe(true);

        board.placePiece(new Pawn('Pawn', 'white', board), 'e4');
        expect(board.movePiece('c3', 'e4')).toBe(false);

        board.placePiece(new Pawn('Pawn', 'black', board), 'e4');
        expect(board.movePiece('f6', 'e4')).toBe(false);
    });

    it('should be able to move to a square occupied by a piece of the opposite color', () => {
        expect(board.movePiece('b1', 'c3')).toBe(true);
        expect(board.movePiece('g8', 'f6')).toBe(true);
        expect(board.movePiece('c3', 'e4')).toBe(true);
        expect(board.movePiece('f6', 'e4')).toBe(true);
    });
});