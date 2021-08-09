import { handleActions } from 'redux-actions';

const gacha = handleActions(
    {
        SET_RECEIVED_ITEMS: (state:any, action:any) => ({
            ...state,
            receivedItems: action.payload.receivedItems
        }),
    },
    {
        receivedItems: []
    }
)

export { gacha as default }