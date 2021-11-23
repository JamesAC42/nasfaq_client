export interface IAuctionItem {
    auctionID: string,
    expiration: number,
    item: string,
    amount: number, 
    seller: string,
    sellerid: string,
    bidder: string,
    bidderid: string,
    currentBid: number,
    lastOutbid: string,
    lastBid: number
}

export interface IAuctionHistoryEntry {
    expiration: number,
    item: string, 
    amount: number,
    sellerID: string,
    seller: string,
    bidderID: string,
    bidder: string
    currentBid: number
}

export interface IAuctionFeedItem {
    timestamp:number,
    username:string,
    bid:number
}

export interface IAuctionMessage {
    timestamp:number,
    username:string,
    message:string
}

export interface IAuctionNotificationItem {
    timestamp:number,
    seller:string,
    bidder:string,
    item:string,
    amount:number,
    bid:number
}

export type IAuctionHistory = Array<IAuctionHistoryEntry>