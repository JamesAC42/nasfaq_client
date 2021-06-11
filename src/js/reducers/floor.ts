import { handleActions } from 'redux-actions';

const floor = handleActions(
    {
        SET_FLOOR_SPACE: (state:any, action:any) => ({
            ...state,
            floorSpace: action.payload.floorSpace
        }),
        SET_ACTIVE_ROOM: (state:any, action:any) => ({
            ...state,
            activeRoom: action.payload.activeRoom
        }),
        SET_CHAT_LOG: (state:any, action:any) => ({
            ...state,
            chatLog: action.payload.chat
        }),
        SET_REPLIES_VISIBLE: (state:any, action:any) => ({
            ...state,
            repliesVisible: action.payload.visible
        }),
        SET_REPLIES: (state:any, action:any) => ({
            ...state,
            replies: action.payload.replies
        }),
        SET_REPLY_STACK: (state:any, action:any) => ({
            ...state,
            replyStack: action.payload.replyStack
        }),
        SET_LOADING: (state:any, action:any) => ({
            ...state,
            loading: action.payload.loading
        }),
        SET_POST_COOLDOWN: (state:any, action:any) => ({
            ...state,
            cooldown: {
                ...state.cooldown,
                post:action.payload.post
            }
        }),
        SET_ROOM_COOLDOWN: (state:any, action:any) => ({
            ...state,
            cooldown: {
                ...state.cooldown,
                room:action.payload.room
            }
        }),
        SET_REPLY_SOURCE: (state:any, action:any) => ({
            ...state,
            replySource: action.payload.message
        }),
        SET_REPLY_SOURCE_COORDS: (state:any, action:any) => ({
            ...state,
            replySourceCoords: action.payload.coords
        })
    },
    {
        floorSpace: null,
        activeRoom: null,
        chatLog: [],
        repliesVisible: false,
        replies: [],
        replyStack: [],
        replySource: null,
        replySourceCoords: {
            x: 0,
            y: 0
        },
        loading: false,
        cooldown: {
            room: 0,
            post: 0
        }
    }
)

export { floor as default }