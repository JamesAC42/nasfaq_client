export interface ICoinItem {
    coin:string,
    price:number,
    saleValue:number,
    inCirculation:number
}

export interface ICoinInfo {
    timestamp: number,
    data: {
        [key:string]: ICoinItem
    }
}

export interface ICoinHistory {
    [coin:string] : {
        labels: Array<any>,
        price: Array<any>,
        inCirculation: Array<any>
    }
}

export interface ITodayPricesItem {
    timestamp:number,
    price:number,
    inCirculation:number
}

export interface ICoinData extends ICoinItem {
    history:Array<ITodayPricesItem>
}

export interface ICoinDataCollection {
    timestamp:number,
    data: {
        [coin:string]: ICoinData
    }
}

//export type TodayPrices = Array<ITodayPricesItem>