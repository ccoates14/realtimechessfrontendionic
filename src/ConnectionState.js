

const ConnectionState = {
    GET_CONNECTION: 'GET_CONNECTION',
    QUEUE_FOR_GAME: 'QUEUE_FOR_GAME',
    CREATE_GAME: 'CREATE_GAME',
    START_GAME: 'START_GAME',
    WEB_SOCKET_CREATED: 'WEB_SOCKET_CREATED',
    GAME_OVER: 'GAME_OVER'
};

export default ConnectionState;

/*

Connect to server and retrieve player id -> GET_CONNECTION

Queue player for game -> QUEUE_FOR_GAME

Player is in game -> IN_GAME

Web socket is created -> WEB_SOCKET_CREATED
    

Game is over -> GAME_OVER

*/