import { ChessBoard } from "../src/ChessBoard";


describe("Queen test", () => {
    let board: ChessBoard;

    beforeEach(() => {
        board = new ChessBoard();
    });

    it('should be able to move horizontally', () => {
        board.placePiece(board.getPiece('d1'), 'd3');
        expect(board.movePiece('d3', 'h3')).toBe(true);
    });

    it('should be able to move vertically', () => {
        board.placePiece(null, 'd2');
        expect(board.movePiece('d1', 'd5')).toBe(true);
    });

    it('should be able to move diagonally', () => {
        board.placePiece(null, 'e2');
        expect(board.movePiece('d1', 'h5')).toBe(true);
    });

    it('should not be able to move like a knight', () => {
        expect(board.movePiece('d1', 'e3')).toBe(false);
    });

    it('should not be able to skip over pieces', () => {
        expect(board.movePiece('d1', 'h5')).toBe(false); 
    });
});