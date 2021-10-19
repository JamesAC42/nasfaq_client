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
        }),
        SET_EXPECTED_BALANCE: (state:any, action:any) => ({
            ...state,
            expectedBalance: action.payload.expectedBalance
        }),
        SET_PENDING_ORDER: (state:any, action:any) => ({
            ...state,
            pendingOrder: action.payload.pendingOrder
        })
    },
    {
        running:false,
        rules:[],
        nextTradeTime:0,
        expectedBalance:0,
        pendingOrder:[]
    }
)

export { autotrader as default }
