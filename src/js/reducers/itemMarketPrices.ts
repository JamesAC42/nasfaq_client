import { handleActions } from 'redux-actions';

const itemmarketprices = handleActions(
    {
        SET_ITEM_MARKET_PRICES: (state:any, action:any) => ({
            ...action.payload.itemMarketPrices
        }),
    },
    {}
)

export { itemmarketprices as default }