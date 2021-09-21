import { handleActions } from 'redux-actions';

const multicoinSave = handleActions(
    {
        SET_MULTICOIN_SAVE: (state:any, action:any) => ({
            ...action.payload.multicoinSave
        }),
    },
    {}
)

export { multicoinSave as default }