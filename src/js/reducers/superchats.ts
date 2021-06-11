import { handleActions } from 'redux-actions';

const superchats = handleActions(
    {
        SET_COOLDOWN: (state:any, action:any) => ({
            ...state,
            cooldown: action.payload.cooldown
        }),
        SET_SUPA_DAILY: (state:any, action:any) => ({
            ...state,
            daily: action.payload.daily
        }),
        SET_ENABLE_DANMAKU: (state:any, action:any) => ({
            ...state,
            enableDanmaku: action.payload.enableDanmaku
        }),
        SET_SUPA_HISTORY: (state:any, action:any) => ({
            ...state,
            history: action.payload.history
        })
    },
    {
        daily: {},
        history: {},
        enableDanmaku: false,
        cooldown: 0
    }
)

export { superchats as default }