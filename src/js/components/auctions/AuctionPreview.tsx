import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
    AiOutlineEye,
    AiFillEye
} from 'react-icons/ai';
import {ItemImages} from '../ItemImages';
import numberWithCommas from '../../numberWithCommas';
import { IAuctionItem } from './IAuction';
import { Link } from 'react-router-dom';

const mapStateToProps = (state:any) => ({
    itemcatalogue: state.itemcatalogue
})

interface AuctionPreviewProps {
    auction:IAuctionItem,
    itemcatalogue: any
}

class AuctionPreviewState {
    timeRemaining:string;
    timeColor:string;
    constructor() {
        this.timeRemaining = "";
        this.timeColor = "";
    }
}

class AuctionPreviewBind extends Component<AuctionPreviewProps> {

    intervalId:any;
    state:AuctionPreviewState;
    constructor(props:AuctionPreviewProps) {
        super(props);
        this.state = new AuctionPreviewState();
    }
    componentDidMount() {
        this.updateTimeRemaining()
        this.intervalId = setInterval(() => {
            this.updateTimeRemaining()
        }, 1000)
    }
    componentWillUnmount() {
        clearInterval(this.intervalId);
    }
    formatNumber(t:number) {
        return t < 10 ? "0" + t : t.toString();
    }
    updateTimeRemaining() {
        const now = new Date().getTime();
        const expiration = this.props.auction.expiration;
        const remaining = expiration - now;
        if(remaining <= 0) {
            this.setState({timeRemaining: "Expired", timeColor:"red"});
            return;
        }

        const totalsecs = Math.floor(remaining / 1000);

        const days = Math.floor(totalsecs / 60 / 60 / 24);
        const hours = Math.floor(totalsecs / 60 / 60) % 24;
        const minutes = Math.floor(totalsecs / 60) % 60;
        const seconds = totalsecs % 60;

        const oneday = 60 * 60 * 24;
        const onehour = 60 * 60;
        const oneminute = 60;

        let timeColor = "";
        if(totalsecs <= oneminute) {
            timeColor = "red";
        } else if(totalsecs <= onehour) {
            timeColor = "orange";
        } else if(totalsecs <= oneday) {
            timeColor = "yellow";
        }

        let timeRemaining = 
            this.formatNumber(days) + ":" +
            this.formatNumber(hours) + ":" +
            this.formatNumber(minutes) + ":" +
            this.formatNumber(seconds);
        this.setState({timeRemaining, timeColor})
    }
    
    render() {
        const auction:IAuctionItem = this.props.auction;
        if(this.props.itemcatalogue[auction.item] === undefined) return null;
        return(
            
            <div className="auction-preview">
                <div className="item-auction-thumbnail flex center-child">
                    <Link to={`/auctions/${auction.auctionID}`}>
                    <img src={ItemImages[auction.item]} alt={this.props.itemcatalogue[auction.item].name} />
                    </Link>
                </div>
                <div className="auction-preview-info">
                    <div className="auction-preview-info-name">
                        <Link to={`/auctions/${auction.auctionID}`}>
                        {this.props.itemcatalogue[auction.item].name}
                        </Link>
                    </div>
                    <div className="auction-preview-info-seller">
                        Seller: <span className="highlight">
                            {auction.sellerUsername}
                        </span>
                    </div>
                    <div className="auction-preview-info-quantity">
                        Quantity: <span className="highlight">
                            {auction.amount}
                        </span>
                    </div>
                    <div className="auction-preview-info-time-remaining">
                        <span className={`time-remaining ${this.state.timeColor}`}>{this.state.timeRemaining}</span>
                    </div>
                    <div className="auction-preview-info-current-bid">
                        <span className="auction-preview-price">${numberWithCommas(auction.currentBid)}</span>
                    </div>
                </div>
            </div>
        )
    }
}

const AuctionPreview = connect(mapStateToProps)(AuctionPreviewBind);

export default AuctionPreview;