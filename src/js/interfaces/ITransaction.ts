export enum TransactionType {
    BUY,
    SELL
}

export interface Order {
    coin:string,
    quantity:number,
    type:TransactionType
}

export interface ITransaction {
    type: TransactionType,
    coin: string,
    userid: string,
    quantity: number,
    timestamp: number,
    completed: boolean,
    price: number
}