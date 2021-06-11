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
        }
    },
    {
        darkMode: false,
        marketSwitch: true
    }
)

export { settings as default }