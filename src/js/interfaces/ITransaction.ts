export enum TransactionType {
    BUY,
    SELL
}

export interface ITransaction {
    type: TransactionType,
    coin: string,
    userid: string,
    timestamp: number,
    completed: boolean,
    price: number
}