export interface ISuperchat {
    coin: string,
    userid: string,
    username: string,
    usericon: string,
    timestamp: number,
    expiration: number,
    amount: number,
    message: string
}

export interface ISuperchatDaily {
    total:number,
    userTotals:{
        [uid:string]: {
            username:string,
            total:number
        }
    }
}

export interface ISuperchatHistory {
    coin:string,
    total:number,
    superchats: Array<ISuperchat>
}