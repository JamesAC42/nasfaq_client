import { handleActions } from 'redux-actions';

const admin = handleActions(
    {
        SET_ADMIN_USERS: (state:any, action:any) => ({
            ...state,
            users: action.payload.users
        }),
        SET_ADMIN_FILTERS: (state:any, action:any) => ({
            ...state,
            filters: action.payload.filters
        }),
        SET_ADMIN_REPORTS: (state:any, action:any) => ({
            ...state,
            reports: action.payload.reports
        }),
        SET_ADMIN_ADJUSTMENT_CONTROLS: (state:any, action:any) => ({
            ...state,
            adjustmentControls: action.payload.adjustmentControls
        }),
        SET_SPAM_TRACKER: (state:any, action:any) => ({
            ...state,
            spamTracker: action.payload.spamTracker
        }),
        SET_DIVIDEND_TOGGLES: (state:any, action:any) => ({
            ...state,
            dividendToggles: action.payload.dividendToggles
        }),
        SET_VOLATILITY_MULTIPLIERS: (state:any, action:any) => ({
            ...state,
            volatilityMultipliers: action.payload.volatilityMultipliers
        }),
        SET_BROKER_FEE: (state:any, action:any) => ({
            ...state,
            brokerFee: action.payload.brokerFee
        }),
        SET_OVERBOUGHT: (state:any, action:any) => ({
            ...state,
            overbought: action.payload.overbought
        }),
        SET_OVERSOLD: (state:any, action:any) => ({
            ...state,
            oversold: action.payload.oversold
        }),
        SET_BOGRATION_LEVEL: (state:any, action:any) => ({
            ...state,
            bogrationLevel: action.payload.bogrationLevel
        }),
        SET_UPWARDS_REDUCTION_LEVEL: (state:any, action:any) => ({
            ...state,
            upwardsReductionLevel: action.payload.upwardsReductionLevel
        })
    },
    {
        users: undefined,
        filters: undefined,
        reports: undefined,
        adjustmentControls: undefined,
        spamTracker: undefined,
        dividendToggles: undefined,
        volatilityMultipliers: undefined,
        brokerFee:undefined,
        overbought: false,
        oversold: false,
        bogrationLevel: 0,
        upwardsReductionLevel: 0
    }
)

export { admin as default }
