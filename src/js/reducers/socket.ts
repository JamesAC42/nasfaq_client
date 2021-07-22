import { handleActions } from 'redux-actions';

const socket = handleActions(
    {
        SET_SOCKET: (state:any, action:any) => ({
            ...state,
            socket: action.payload.socket
        }),
        REMOVE_SOCKET: (state:any, action:any) => ({ 
            ...state,
            socket: null
        }),
        SET_SOCKET_QUERY: (state:any, action:any) => ({ 
            ...state,
            query: action.payload.query
        })
    },
    {
        socket: null,
        query: {}
    }
)

export { socket as default }