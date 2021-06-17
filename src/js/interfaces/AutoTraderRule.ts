import { TransactionType } from "./ITransaction";

export interface AutoTraderRule {
    coin:string,
    type:TransactionType,
    targetQuantity:number
}