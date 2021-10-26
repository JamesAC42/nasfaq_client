import React, {Component} from 'react';
import '../../../css/auctions/auctions.scss';

import DropdownInput from '../DropdownInput';
import AuctionPreview from './AuctionPreview';
import CreateAuction from './CreateAuction';
import { IAuctionItem } from './IAuction';


let auctions:Array<IAuctionItem> = [
    {
        auctionID: "abcdef",
        expiration: new Date().getTime() + 1000 * 60 * 60 * 30,
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
        expiration: new Date().getTime() + 1000 * 60 * 60 * 10,
        item: "HaachamaTarantula",
        amount: 10, 
        sellerID: "sellerId",
        sellerUsername: "tft",
        bidderID: "bidderId",
        bidderUsername: "tft",
        currentBid: 80768,
        lastOutbidID: "lastoutbidId",
        lastOutbidUsername: "cypher",
        lastBid: 60000
    },
    {
        auctionID: "abcdef",
        expiration: new Date().getTime() + 1000 * 60 * 60 * 1,
        item: "YellowCard",
        amount: 2, 
        sellerID: "sellerId",
        sellerUsername: "cypher",
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
        item: "KiryuKaiBadge",
        amount: 2, 
        sellerID: "sellerId",
        sellerUsername: "yfp",
        bidderID: "bidderId",
        bidderUsername: "tft",
        currentBid: 80768,
        lastOutbidID: "lastoutbidId",
        lastOutbidUsername: "cypher",
        lastBid: 60000
    },
    {
        auctionID: "abcdef",
        expiration: new Date().getTime() + 1000 * 60 * 60 * 10,
        item: "MumeiHat",
        amount: 2, 
        sellerID: "sellerId",
        sellerUsername: "mofumofu",
        bidderID: "bidderId",
        bidderUsername: "tft",
        currentBid: 80768,
        lastOutbidID: "lastoutbidId",
        lastOutbidUsername: "cypher",
        lastBid: 60000
    },
    {
        auctionID: "abcdef",
        expiration: new Date().getTime() + 1000 * 60 * 60 * 10,
        item: "PekoraHat",
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

enum AuctionView {
    LIVE,
    PAST
}

class AuctionsState {
    activeView: AuctionView;
    showCreateWindow: boolean;
    constructor() {
        this.activeView = AuctionView.LIVE;
        this.showCreateWindow = false;
    } 
}

class Auctions extends Component {
    state:AuctionsState;
    constructor(props:any) {
        super(props);
        this.state = new AuctionsState();
    }
    selectTabClass(view:AuctionView) {
        return `view-select-tab ${this.state.activeView === view ? "active" : ""}`
    }
    setView(view:AuctionView) {
        this.setState({activeView:view});
    }
    render() {
        return(
            <div className="container fill">
                <div className="auction-page-container container-inner">
                    <div className="auctions-title flex flex-col center-child">
                        <div className="auctions-title-text">auctions</div>
                        <div className="auctions-description">bid on rare items!</div>
                    </div>
                    <div className="auction-filters flex flex-row flex-center">
                        <div className="view-select">
                            <div 
                                className={this.selectTabClass(AuctionView.LIVE)}
                                onClick={() => this.setView(AuctionView.LIVE)}>
                                    Live Auctions
                            </div>

                            <div 
                                className={this.selectTabClass(AuctionView.PAST)}
                                onClick={() => this.setView(AuctionView.PAST)}>
                                    Past Auctions
                            </div>
                        </div>
                        <div 
                            className="add-auction-button"
                            onClick={() => this.setState({showCreateWindow: !this.state.showCreateWindow})}>
                            Create Auction
                        </div>
                    </div>
                    { this.state.showCreateWindow ?
                        <CreateAuction /> : null
                    }
                    <div className="auction-container">
                    {
                        this.state.activeView === AuctionView.LIVE ?
                        <>
                            {
                                auctions.map((item:IAuctionItem) => 
                                <AuctionPreview
                                    auction={item}/>
                                )
                            }
                        </>
                        :
                        <div>PAST AUCTIONS</div>
                    }
                    </div>
                </div>
            </div>
        )
    }
}

export default Auctions;