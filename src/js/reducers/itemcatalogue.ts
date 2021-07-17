import { handleActions } from 'redux-actions';

const itemcatalogue = handleActions(
    {
        SET_CATALOGUE: (state:any, action:any) => ({
            ...action.payload.catalogue
        }),
    },
    {}
)

export { itemcatalogue as default }