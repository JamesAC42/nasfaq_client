export interface IBoardItemData {
    price:any, 
    delta:any, 
    deltaP:any, 
    subscriberCount:any, 
    dailySubscriberCount:any, 
    weeklySubscriberCount:any, 
    viewCount:any,  
    dailyViewCount:any, 
    weeklyViewCount:any, 
    totalOwned:any,
    coinHistory:any,
    todayPrices:any,
    timestamp:number
}

export interface BoardItemData extends IBoardItemData { }

export class BoardItemData {
    [key:string]:any;
    constructor() {
        this.price = '';
        this.delta = '';
        this.deltaP = '';
        this.subscriberCount = {};
        this.dailySubscriberCount = {};
        this.weeklySubscriberCount = {};
        this.viewCount = {};
        this.dailyViewCount = {};
        this.weeklyViewCount = {};
        this.totalOwned = {};
        this.coinHistory = {};
        this.todayPrices = {};
        this.timestamp = 0;
    }
}