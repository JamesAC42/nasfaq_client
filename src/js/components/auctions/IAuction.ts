export interface IAuctionItem {
    auctionID: string,
    expiration: number,
    item: string,
    amount: number, 
    sellerID: string,
    sellerUsername: string,
    bidderID: string,
    bidderUsername: string,
    currentBid: number,
    lastOutbidID: string,
    lastOutbidUsername: string,
    lastBid: number
}

export interface IAuctionHistoryEntry {
    expiration: number,
    item: string, 
    sellerID: string,
    sellerUsername: string,
    bidderID: string,
    bidderUsername: string
    currentBid: number
}

export type IAuctionHistory = Array<IAuctionHistoryEntry>