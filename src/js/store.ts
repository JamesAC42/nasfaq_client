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

let initState = {
    settings: {
        darkMode: false,
        marketSwitch: true
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
        loaded: false
    },
    stats: {
        stats: {},
        coinHistory: [],
        coinInfo: {},
        leaderboard: [],
        oshiboard: {}
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
    }
}

const holoReducer = combineReducers({
    settings,
    session,
    stats,
    userinfo,
    floor,
    transactions,
    superchats
});

const configureStore = (reducer:any, initState:{}) => {
    return createStore(reducer, initState);
}

export default configureStore(holoReducer, initState);