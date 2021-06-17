import { handleActions } from 'redux-actions';

const settings = handleActions(
    {
        TOGGLE_DARKMODE: (state:any, action:any) => {
            return {
                ...state,
                darkMode: action.payload.enabled
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
        darkMode: false,
        marketSwitch: true,
        tradeNotifications: true
    }
)

export { settings as default }