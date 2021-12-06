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
import itemmarketprices from './reducers/itemMarketPrices';
import auctions from './reducers/auctions';
import snowfall from './reducers/snowfall';

let initState = {
    socket: {
        socket: null,
        query: {}
    },
    settings: {
        theme: 0,
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
        brokerTotal: 0,
        brokerFee:0,
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
        expectedBalance:0,
        rules:[],
        pendingOrder:[]
    },
    itemcatalogue: {},
    itemmarketprices: {},
    auctions: {
        activeAuctions:[],
        pastAuctions:[],
        auctionFeeds:{},
        subscriptions:[],
        auctionPriceHistory:{},
        auctionNotifications:[]
    },
    admin: {
        users: undefined,
        filters: undefined,
        reports: undefined,
        adjustmentControls: undefined,
        spamTracker: undefined,
        dividendToggles: undefined,
        volatilityMultipliers: undefined,
        overbought: false,
        oversold: false,
        bogrationLevel: 0,
        upwardsReductionLevel: 0
    },
    gacha: {
        receivedItems: []
    },
    multicoinSave: {},
    snowfall: {
        showSnowNotification:false,
        showSnowSettings:false,
        snowSize:0.1,
        snowSpeed:0.3,
        snowAmount:0.5
    }
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
    itemmarketprices,
    auctions,
    admin,
    gacha,
    snowfall,
    multicoinSave
});

const configureStore = (reducer:any, initState:{}) => {
    return createStore(reducer, initState);
}

export default configureStore(holoReducer, initState);
