export interface IMyCoin {
    amt:number,
    timestamp:number,
    meanPurchasePrice:number
}

export interface IWallet {
    balance:number,
    coins: {
        [key:string]:IMyCoin
    }
}