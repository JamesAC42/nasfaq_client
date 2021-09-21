import { handleActions } from 'redux-actions';

const autotrader = handleActions(
    {
        SET_RUNNING: (state:any, action:any) => ({
            ...state,
            running:action.payload.running
        }),
        SET_RULES: (state:any, action:any) => ({
            ...state,
            rules: action.payload.rules
        }),
        SET_NEXT_TRADE_TIME: (state:any, action:any) => ({
            ...state,
            nextTradeTime: action.payload.nextTradeTime
        })
    },
    {
        running:false,
        rules:[],
        nextTradeTime:0
    }
)

export { autotrader as default }