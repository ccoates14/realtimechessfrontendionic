import { ChessBoard } from "../src/ChessBoard";


describe("Pawn test", () => {
    let board: ChessBoard;

    beforeEach(() => {
        board = new ChessBoard();
    });

    it('should not be able to move backwards', () => {
        expect(board.movePiece('d2', 'd1')).toBe(false);
    })

    it('should not be able to move sideways', () => {
        expect(board.movePiece('d2', 'e2')).toBe(false);
    });

    it('should be able to move two squares on first move', () => {
        expect(board.movePiece('d2', 'd4')).toBe(true);
    });

    it('should be able to move one square after first move', () => {
        board.movePiece('d2', 'd4');
        expect(board.movePiece('d4', 'd5')).toBe(true);
    });

    it('should not be able to move two squares after first move', () => {
        board.movePiece('d2', 'd4');
        expect(board.movePiece('d4', 'd6')).toBe(false);
    });

    it('should not be able to skip over pieces', () => {
        expect(board.movePiece('d2', 'd4')).toBe(true);
        expect(board.movePiece('e2', 'e4')).toBe(true);
        expect(board.movePiece('d4', 'e5')).toBe(false);
    });
});