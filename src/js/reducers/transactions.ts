import { handleActions } from 'redux-actions';

const transactions = handleActions(
    {
        ADD_TRANSACTION: (state:any, action:any) => ([
            ...state,
            action.payload.transaction
        ]),
        REMOVE_TRANSACTION: (state:any, action:any) => ([
            ...state.slice(1)
        ])
    },
    []
)

export { transactions as default }