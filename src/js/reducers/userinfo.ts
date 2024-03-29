import { handleActions } from 'redux-actions';

const userinfo = handleActions(
    {
        SET_USERNAME: (state:any, action:any) => ({
            ...state,
            username: action.payload.username
        }),
        SET_EMAIL: (state:any, action:any) => ({
            ...state,
            email: action.payload.email
        }),
        SET_ID: (state:any, action:any) => ({
            ...state,
            id: action.payload.id
        }),
        SET_WALLET: (state:any, action:any) => ({
            ...state,
            wallet: action.payload.wallet
        }),
        SET_LOADED: (state:any, action:any) => ({
            ...state,
            loaded:true
        }),
        SET_PERFORMANCE: (state:any, action:any) => ({
            ...state,
            performance:action.payload.performance
        }),
        SET_ICON: (state:any, action:any) => ({
            ...state,
            icon: action.payload.icon
        }),
        SET_ADMIN: (state:any, actions:any) => ({
            ...state,
            admin: actions.payload.admin
        }),
        SET_VERIFIED: (state:any, actions:any) => ({
            ...state,
            verified: actions.payload.verified
        }),
        SET_SETTINGS: (state:any, actions:any) => ({
            ...state,
            settings: actions.payload.settings
        }),
        SET_MUTED: (state:any, actions:any) => ({
            ...state,
            muted: actions.payload.muted
        }),
        SET_COLOR: (state:any, actions:any) => ({
            ...state,
            color: actions.payload.color
        }),
        SET_ITEMS: (state:any, actions:any) => ({
            ...state,
            items: actions.payload.items
        }),
        SET_BROKER_FEE_TOTAL: (state:any, actions:any) => ({
            ...state,
            brokerFeeTotal:actions.payload.brokerFeeTotal
        }),
        SET_BROKER_FEE_CREDITS: (state:any, actions:any) => ({
            ...state,
            brokerFeeCredits:actions.payload.brokerFeeCredits
        }),
        SET_HAT: (state:any, actions:any) => ({
            ...state,
            hat: actions.payload.hat
        }),
        UNLOAD: (state:any, action:any) => ({
            username:undefined,
            email:undefined,
            wallet:undefined,
            performance:undefined,
            icon:undefined,
            admin:undefined,
            verified:undefined,
            settings:undefined,
            muted:undefined,
            items:{},
            loaded:false,
            brokerFeeTotal: 0,
            brokerFeeCredits: 0,
            hat:undefined
        })
    },
    {
        username:undefined,
        email:undefined,
        wallet:undefined,
        id:undefined,
        performance:undefined,
        icon: undefined,
        admin: undefined,
        verified:undefined,
        settings:undefined,
        color:undefined,
        muted:undefined,
        items:[],
        loaded:false,
        brokerFeeTotal:0,
        brokerFeeCredits:0,
        hat:undefined
    }
)

export { userinfo as default }