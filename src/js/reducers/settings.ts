import { handleActions } from 'redux-actions';

const settings = handleActions(
    {
        SET_THEME: (state:any, action:any) => {
            return {
                ...state,
                theme: action.payload.theme
            }
        },
        SET_MARKET_SWITCH: (state:any, action:any) => {
            return {
                ...state,
                marketSwitch: action.payload.open
            }
        },
        SET_TRADE_NOTIFICATIONS: (state:any, action:any) => {
            return {
                ...state,
                tradeNotifications: action.payload.tradeNotifications
            }
        }
    },
    {
        theme: 0,
        marketSwitch: true,
        tradeNotifications: true
    }
)

export { settings as default }