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
        })
    },
    {
        running:false,
        rules:[]
    }
)

export { autotrader as default }