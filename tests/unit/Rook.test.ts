import { ChessBoard } from "../src/ChessBoard";


describe("Rook test", () => {
    let board: ChessBoard;

    beforeEach(() => {
        board = new ChessBoard();
    });

    it('should be able to move horizontally', () => {
        expect(board.movePiece('a2', 'a4')).toBe(true);
        expect(board.movePiece('a1', 'a3')).toBe(true);
    });

    it('should be able to move vertically', () => {
        expect(board.movePiece('a2', 'a4')).toBe(true);
        expect(board.movePiece('a1', 'a3')).toBe(true);
    });

    it('should not be able to move diagonally', () => {
        expect(board.movePiece('a2', 'b3')).toBe(false);
    });

    it('should not be able to move like a knight', () => {
        expect(board.movePiece('a2', 'b4')).toBe(false);
    });

    it('should not be able to skip over pieces', () => {
        expect(board.movePiece('a2', 'a4')).toBe(true);
        expect(board.movePiece('a1', 'a3')).toBe(true);
        expect(board.movePiece('a3', 'a5')).toBe(false);
    });
});