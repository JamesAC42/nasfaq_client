import {
    createStore,
    combineReducers
} from 'redux';

import settings from './reducers/settings';
import session from './reducers/session';
import stats from './reducers/stats';
import userinfo from './reducers/userinfo';
import transactions from './reducers/transactions';
import floor from './reducers/floor';
import superchats from './reducers/superchats';
import autotrader from './reducers/autotrader';
import itemcatalogue from './reducers/itemcatalogue';
import admin from './reducers/admin';
import socket from './reducers/socket';
import gacha from './reducers/gacha';
import multicoinSave from './reducers/multicoinSave';

let initState = {
    socket: {
        socket: null,
        query: {}
    },
    settings: {
        darkMode: false,
        marketSwitch: true,
        tradeNotifications: true
    },
    session: {
        loggedin: undefined,
    },
    userinfo: {
        username: undefined,
        email: undefined,
        wallet: undefined,
        icon: undefined,
        id:undefined,
        performance: undefined,
        verified: undefined,
        admin: undefined,
        settings: undefined,
        muted: undefined,
        color: undefined,
        loaded: false,
        items: {},
        brokerFeeTotal: 0,
        brokerFeeCredits: 0,
        hat: undefined
    },
    stats: {
        stats: {},
        coinHistory: [],
        coinInfo: {},
        leaderboard: [],
        oshiboard: {},
        gachaboard: [],
        brokerTotal: 0
    },
    floor: {
        floorSpace: null,
        activeRoom: null,
        chatLog: [],
        repliesVisible: false,
        replies: [],
        replyStack: [],
        replySource: null,
        replySourceCoords: {
            x: 0,
            y: 0
        },
        loading: false,
        cooldown: {
            room: 0,
            post: 0
        }
    },
    transactions: [],
    superchats: {
        daily: undefined,
        history: undefined,
        enableDanmaku: false,
        cooldown: 0
    },
    autotrader: {
        running:false,
        nextTradeTime:0,
        rules:[]
    },
    itemcatalogue: {},
    admin: {
        users: undefined,
        filters: undefined,
        reports: undefined,
        adjustmentControls: undefined,
        spamTracker: undefined,
        dividendToggles: undefined,
        volatilityMultipliers: undefined,
        brokerFee: undefined
    },
    gacha: {
        receivedItems: []
    },
    multicoinSave: {}
}

const holoReducer = combineReducers({
    socket,
    settings,
    session,
    stats,
    userinfo,
    floor,
    transactions,
    superchats,
    autotrader,
    itemcatalogue,
    admin,
    gacha,
    multicoinSave
});

const configureStore = (reducer:any, initState:{}) => {
    return createStore(reducer, initState);
}

export default configureStore(holoReducer, initState);