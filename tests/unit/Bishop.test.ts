import { ChessBoard } from "../src/ChessBoard";


describe("Bishop test", () => {
    let board: ChessBoard;

    beforeEach(() => {
        board = new ChessBoard();
    });

    test('cannot skip piece', () => {
        expect(board.movePiece('c1', 'e3')).toBe(false);

    })

    test('can only move diagonally', () => {
        expect(board.movePiece('c1', 'c2')).toBe(false);
    })

    test('cannot move to new position with same team', () => {
        expect(board.movePiece('c1', 'd2')).toBe(false);
    })

    test('can move to new position with other team', () => {
        const startingBishop = board.board[7][2];
        console.log(startingBishop?.name);

        board.board[7][2] = null;

        board.placePiece(startingBishop!, 'd3');

        expect(board.movePiece('d3', 'h7')).toBe(true);
    })

})
