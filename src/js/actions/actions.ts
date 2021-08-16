import { createActions } from 'redux-actions';

export const settingsActions = createActions(
    {
        TOGGLE_DARKMODE: enabled => ({ enabled }),
        SET_MARKET_SWITCH: open => ({ open }),
        SET_TRADE_NOTIFICATIONS: tradeNotifications => ({ tradeNotifications })
    }
)

export const sessionActions = createActions(
    {},
    "LOGIN",
    "LOGOUT"
)

export const statsActions = createActions(
    {
        SET_STATS: stats => ({ stats }),        
        SET_HISTORY: coinHistory=> ({ coinHistory }),        
        SET_COIN_INFO: coinInfo => ({ coinInfo }),        
        SET_LEADERBOARD: leaderboard => ({ leaderboard }),
        SET_OSHIBOARD: oshiboard => ({ oshiboard }),
        SET_GACHABOARD: gachaboard => ({ gachaboard })
    }
)

export const userinfoActions = createActions(
    {
        SET_USERNAME: username => ({ username }),
        SET_EMAIL: email => ({ email }),
        SET_ID: id => ({ id }),
        SET_WALLET: wallet => ({ wallet }),
        SET_ICON: icon => ({ icon }),
        SET_PERFORMANCE: performance => ({ performance }),
        SET_ADMIN: admin => ({ admin }),
        SET_VERIFIED: verified => ({ verified }),
        SET_SETTINGS: settings => ({ settings }),
        SET_COLOR: color => ({ color }),
        SET_ITEMS: items => ({ items }),
        SET_MUTED: muted => ({ muted })
    },
    "SET_LOADED",
    "UNLOAD"
)

export const transactionActions = createActions(
    {
        ADD_TRANSACTION: transaction => ({ transaction })
    },
    "REMOVE_TRANSACTION"
)

export const floorActions = createActions(
    {
        SET_FLOOR_SPACE: floorSpace => ({ floorSpace }),
        SET_ACTIVE_ROOM: activeRoom => ({ activeRoom }),
        SET_CHAT_LOG: chat => ({ chat }),
        SET_REPLIES_VISIBLE: visible => ({ visible }),
        SET_REPLIES: replies => ({ replies }),
        SET_REPLY_STACK: replyStack => ({ replyStack }),
        SET_LOADING: loading => ({ loading }),
        SET_POST_COOLDOWN: post => ({ post }),
        SET_ROOM_COOLDOWN: room => ({ room }),
        SET_REPLY_SOURCE: message => ({ message }),
        SET_REPLY_SOURCE_COORDS: coords => ({ coords })
    }
)

export const superchatsActions = createActions(
    {
        SET_COOLDOWN: cooldown => ({ cooldown }),
        SET_SUPA_DAILY: daily => ({ daily }),
        SET_SUPA_HISTORY: history => ({ history }),
        SET_ENABLE_DANMAKU: enableDanmaku => ({ enableDanmaku })
    }
)

export const autotraderActions = createActions(
    {
        SET_RUNNING: running => ({ running }),
        SET_RULES: rules => ({ rules })
    }
)

export const itemcatalogueActions = createActions(
    {
        SET_CATALOGUE: catalogue => ({ catalogue })
    }
)

export const adminActions = createActions(
    {
        SET_ADMIN_USERS: users => ({ users }),
        SET_ADMIN_FILTERS: filters => ({ filters }),
        SET_ADMIN_REPORTS: reports => ({ reports }),
        SET_ADMIN_ADJUSTMENT_CONTROLS: adjustmentControls => ({ adjustmentControls }),
    }
)

export const gachaActions = createActions(
    {
        SET_RECEIVED_ITEMS: receivedItems => ({ receivedItems })
    }
)

export const socketActions = createActions(
    {
        SET_SOCKET: socket => ({ socket }),
        SET_SOCKET_QUERY: query => ({ query })
    },
    "REMOVE_SOCKET"
)