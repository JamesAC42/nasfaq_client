import { handleActions } from 'redux-actions';

const stats = handleActions(
    {
        SET_STATS: (state:any, action:any) => ({
            ...state,
            stats:action.payload.stats
        }),
        SET_HISTORY: (state:any, action:any) => ({
            ...state,
            coinHistory:action.payload.coinHistory
        }),
        SET_COIN_INFO: (state:any, action:any) => ({
            ...state,
            coinInfo:action.payload.coinInfo
        }),
        SET_LEADERBOARD: (state:any, action:any) => ({
            ...state,
            leaderboard:action.payload.leaderboard
        }),
        SET_OSHIBOARD: (state:any, action:any) => ({
            ...state,
            oshiboard:action.payload.oshiboard
        })
    },
    {
        stats: {},
        coinHistory: [],
        coinInfo: {},
        leaderboard: [],
        oshiboard: {}
    }
)

export { stats as default }