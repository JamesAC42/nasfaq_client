import React, {Component} from 'react';
import '../../../css/auctions/auctions.scss';

import DropdownInput from '../DropdownInput';
import AuctionPreview from './AuctionPreview';
import { IAuctionItem } from './IAuction';


let auctions:Array<IAuctionItem> = [
    {
        auctionID: "abcdef",
        expiration: new Date().getTime() + 1000 * 60 * 60 * 10,
        item: "MarineHat",
        amount: 2, 
        sellerID: "sellerId",
        sellerUsername: "mogu",
        bidderID: "bidderId",
        bidderUsername: "tft",
        currentBid: 80768,
        lastOutbidID: "lastoutbidId",
        lastOutbidUsername: "cypher",
        lastBid: 60000
    },
    {
        auctionID: "abcdef",
        expiration: new Date().getTime() + 1000 * 60 * 60 * 24,
        item: "WatsonConcoction",
        amount: 2, 
        sellerID: "sellerId",
        sellerUsername: "mogu",
        bidderID: "bidderId",
        bidderUsername: "tft",
        currentBid: 80768,
        lastOutbidID: "lastoutbidId",
        lastOutbidUsername: "cypher",
        lastBid: 60000
    },
    {
        auctionID: "abcdef",
        expiration: new Date().getTime() + 1000 * 60 * 60 * 24 * 3,
        item: "MioOmamori",
        amount: 2, 
        sellerID: "sellerId",
        sellerUsername: "mogu",
        bidderID: "bidderId",
        bidderUsername: "tft",
        currentBid: 80768,
        lastOutbidID: "lastoutbidId",
        lastOutbidUsername: "cypher",
        lastBid: 60000
    },
    {
        auctionID: "abcdef",
        expiration: new Date().getTime() + 1000 * 60,
        item: "FubukiHat",
        amount: 2, 
        sellerID: "sellerId",
        sellerUsername: "mogu",
        bidderID: "bidderId",
        bidderUsername: "tft",
        currentBid: 80768,
        lastOutbidID: "lastoutbidId",
        lastOutbidUsername: "cypher",
        lastBid: 60000
    },
];

class Auctions extends Component {
    render() {
        return(
            <div className="container fill">
                <div className="auction-page-container container-inner">
                    <div className="auctions-title flex flex-col center-child">
                        <div className="auctions-title-text">auctions</div>
                        <div className="auctions-description">bid on rare items!</div>
                    </div>
                    <div className="auction-filters flex flex-row flex-center">
                        <DropdownInput 
                            label=""
                            options={["1 day", "1 week", "1 month"]}
                            default="1 day"
                            onChange={(val:any) => {console.log(val)}} />
                    </div>
                    <div className="auction-container">
                    {
                        auctions.map((item:IAuctionItem) => 
                        <AuctionPreview
                            auction={item}/>
                        )
                    }
                    </div>
                </div>
            </div>
        )
    }
}

export default Auctions;