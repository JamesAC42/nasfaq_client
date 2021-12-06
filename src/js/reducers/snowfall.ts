import { handleActions } from 'redux-actions';

const snowfall = handleActions(
    {
        SET_SHOW_SNOW_NOTIFICATION: (state:any, action:any) => {
            return {
                ...state,
                showSnowNotification: action.payload.showSnowNotification
            }  
        },
        SET_SNOW_SIZE: (state:any, action:any) => {
            return {
                ...state,
                snowSize: action.payload.snowSize
            }  
        },
        SET_SNOW_SPEED: (state:any, action:any) => {
            return {
                ...state,
                snowSpeed: action.payload.snowSpeed
            }  
        },
        SET_SNOW_AMOUNT: (state:any, action:any) => {
            return {
                ...state,
                snowAmount: action.payload.snowAmount
            }  
        },
        SET_SHOW_SNOW_SETTINGS: (state:any, action:any) => {
            return { 
                ...state,
                showSnowSettings:action.payload.showSnowSettings
            }
        }
    },
    {
        showNotification:false,
        showSnowSettings:false,
        snowSize:0.1,
        snowSpeed:0.3,
        snowAmount:0.5
    }
)

export { snowfall as default }