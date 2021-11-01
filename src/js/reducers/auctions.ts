import { handleActions } from 'redux-actions';

const auctions = handleActions(
    {
        SET_ACTIVE_AUCTIONS: (state:any, action:any) => ({
            ...state,
            activeAuctions: action.payload.activeAuctions
        }),
        SET_PAST_AUCTIONS: (state:any, action:any) => ({
            ...state,
            pastAuctions: action.payload.pastAuctions
        }),
        SET_AUCTION_FEEDS: (state:any, actions:any) => ({
            ...state,
            auctionFeeds: actions.payload.auctionFeeds
        }),
        SET_AUCTION_SUBSCRIPTIONS: (state:any, actions:any) => ({
            ...state,
            subscriptions: actions.payload.subscriptions
        }),
        SET_AUCTION_PRICE_HISTORY: (state:any, actions:any) => ({
            ...state,
            auctionPriceHistory: actions.payload.auctionPriceHistory
        }),
        SET_AUCTION_NOTIFICATIONS: (state:any, actions:any) => ({
            ...state,
            auctionNotifications: actions.payload.auctionNotifications
        })
    },
    {
        activeAuctions:[],
        pastAuctions:[],
        auctionFeeds:{},
        subscriptions: [],
        auctionPriceHistory: {},
        auctionNotifications: []
    }
)

export { auctions as default }