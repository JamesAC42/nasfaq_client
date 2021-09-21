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
        }),
        SET_GACHABOARD: (state:any, action:any) => ({
            ...state,
            gachaboard:action.payload.gachaboard
        }),
        SET_BROKER_TOTAL: (state:any, action:any) => ({
            ...state,
            brokerTotal:action.payload.brokerTotal
        })
    },
    {
        stats: {},
        coinHistory: [],
        coinInfo: {},
        leaderboard: [],
        oshiboard: {},
        gachaboard: [],
        brokerTotal: 0
    }
)

export { stats as default }