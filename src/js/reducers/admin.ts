import { handleActions } from 'redux-actions';

const admin = handleActions(
    {
        SET_ADMIN_USERS: (state:any, action:any) => ({
            ...state,
            users: action.payload.users
        }),
        SET_ADMIN_FILTERS: (state:any, action:any) => ({
            ...state,
            filters: action.payload.filters
        }),
        SET_ADMIN_REPORTS: (state:any, action:any) => ({
            ...state,
            reports: action.payload.reports
        }),
        SET_ADMIN_ADJUSTMENT_CONTROLS: (state:any, action:any) => ({
            ...state,
            adjustmentControls: action.payload.adjustmentControls
        }),
    },
    {
        users: undefined,
        filters: undefined,
        reports: undefined,
        adjustmentControls: undefined
    }
)

export { admin as default }