import React, {Component} from 'react';

import {ItemImages} from '../ItemImages';
import '../../../css/auctions/auction.scss';

import {connect} from 'react-redux';
import { Redirect } from 'react-router';

import {
    AiOutlineEye,
    AiFillEye
} from 'react-icons/ai';
import {
    RiSendPlaneFill
} from 'react-icons/ri';
import {
    GiPayMoney
} from 'react-icons/gi';
import {
    IoIosArrowBack
} from 'react-icons/io';
import { Link } from 'react-router-dom';
import { IAuctionItem, IAuctionFeedItem, IAuctionMessage } from './IAuction';
import numberWithCommas from '../../numberWithCommas';
import { IWallet } from '../../interfaces/IWallet';
import { auctionsActions, userinfoActions } from '../../actions/actions';
import storageAvailable from '../../checkStorage';
import fetchData from '../../fetchData';

const mapStateToProps = (state:any) => ({
    auctions:state.auctions,
    itemcatalogue:state.itemcatalogue,
    session:state.session,
    userinfo:state.userinfo
});

const mapDispatchToProps = {
    setWallet: userinfoActions.setWallet,
    setItems: userinfoActions.setItems,
    setAuctionSubscriptions: auctionsActions.setAuctionSubscriptions,
    setAuctionFeeds: auctionsActions.setAuctionFeeds,
}

interface AuctionProps {
    auctions: {
        activeAuctions:Array<IAuctionItem>,
        auctionFeeds:any,
        subscriptions: []
    },
    session: {
        loggedin:boolean
    },
    itemcatalogue: any,
    match: {
        params: any
    },
    userinfo: {
        id:string,
        wallet:IWallet
    },
    setWallet: (wallet:IWallet) => {},
    setItems: (items:any) => {},
    setAuctionSubscriptions: (subscriptions:any) => {},
    setAuctionFeeds: (feeds:any) => {}
}

class AuctionState {
    timeRemaining:string;
    timeColor:string;
    bid:string;
    message:string;
    bidError:string;
    redirect:boolean;
    constructor() {
        this.timeRemaining = "";
        this.timeColor = "";
        this.bid = "";
        this.message = "";
        this.bidError = "";
        this.redirect = false;
    }
}

class AuctionBind extends Component<AuctionProps> {

    intervalId:any;
    state:AuctionState;
    constructor(props:AuctionProps) {
        super(props);
        this.state = new AuctionState();
    }
    componentDidMount() {
        this.updateTimeRemaining()
        this.intervalId = setInterval(() => {
            this.updateTimeRemaining()
        }, 1000)
        let auctionFeeds:any = {...this.props.auctions.auctionFeeds};
        let auctionid:string = this.props.match.params.auctionid;
        if(!auctionFeeds[auctionid]) {
            fetchData('/api/getAuctionFeed?auctionid=' + auctionid)
            .then((data:any) => {
                if(data.success) {
                    auctionFeeds[auctionid] = data.feed;
                    this.props.setAuctionFeeds(auctionFeeds);
                }
            })
        }
    }
    componentWillUnmount() {
        clearInterval(this.intervalId);
    }
    getAuction(activeAuctions:any) {
        const auctionID:string = this.props.match.params.auctionid;
        let auction:IAuctionItem|null = null;

        for(let i = 0; i < activeAuctions.length; i++) {
            if(activeAuctions[i].auctionID === auctionID) {
                auction = activeAuctions[i];
            }
        }
        return auction;
    }
    componentWillUpdate(prevProps:AuctionProps) {

        let activeAuctionsOld = this.getAuction(prevProps.auctions.activeAuctions);
        let activeAuctionsCurrent = this.getAuction(this.props.auctions.activeAuctions);

        if(activeAuctionsCurrent === null && activeAuctionsOld !== null) {
            this.setState({redirect:true});
        }

    }
    
    formatNumber(t:number) {
        return t < 10 ? "0" + t : t.toString();
    }

    sendBid() {
        let bid = parseInt(this.state.bid);
        if(isNaN(bid)) {
            this.setState({bidError:"Invalid bid."});
            return;
        }
        bid = Math.round(bid);

        let auction = this.getAuction(this.props.auctions.activeAuctions);
        if(auction !== null) {

            if(bid < 1000 + auction.currentBid) {
                this.setState({bidError:"Invalid bid."});
                return;
            } else {

                fetch('/api/placeAuctionBid/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        auctionID:auction.auctionID,
                        item:auction.item,
                        currentBid:bid
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if(!data.success) {
                        this.setState({bidError:data.reason})
                    } else {
                        if(!this.subscribed()) {
                            this.toggleSubscribed();
                        }
                        this.props.setWallet(data.wallet);
                        this.setState({bid:''})
                    }
                })
                .catch(error => {
                    console.error('Error: ' +  error);
                })

            }

        } else {
            this.setState({bidError:"Invalid bid."});
            return;
        }
        
    }
    sendMessage() {
        if(this.state.message.length > 100) {
            this.setState({bidError:"Message too long"});
            return;
        }
        if(this.state.message.length === 0) {
            this.setState({bidError:"Invalid message"});
            return;
        }
        fetch('/api/sendAuctionMessage/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                auctionID:this.props.match.params.auctionid,
                message:this.state.message
            })
        })
        .then(response => response.json())
        .then(data => {
            if(!data.success) {
                this.setState({
                    bidError:data.reason
                })
            } else {
                this.setState({
                    message:""
                })
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    myItem() {
        let auction:IAuctionItem|null = this.getAuction(this.props.auctions.activeAuctions);
        if(auction) {
            return this.props.userinfo.id === auction.sellerid;
        } else {
            return false;
        }
    }

    cancelAuction() {
        if(this.myItem()) {
            if(this.state.timeRemaining === 'Expired') {
                alert("You cannot cancel an expired auction, wait for it to be renewed.");
                return;
            }
            if(window.confirm("Are you sure? You will be charged a cancellation fee of $5000 or 50% of the current highest bid (including the minimum bid), whichever is higher.")) {
                let auction:IAuctionItem|null = this.getAuction(this.props.auctions.activeAuctions);
                if(!auction) return;
    
                fetch('/api/placeAuctionCancel/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        auctionID:auction.auctionID,
                        item:auction.item
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if(!data.success) {
                        this.setState({auctionError:data.reason})
                    } else {
                        this.props.setWallet(data.wallet);
                        this.props.setItems(data.items);
                        this.setState({redirect:true});
                    }
                })
                .catch(error => {
                    console.error('Error: ' +  error);
                })
            }
        }
    }

    updateTimeRemaining() {

        let auction = this.getAuction(this.props.auctions.activeAuctions);
        if(auction === null) return;
        const now = new Date().getTime();
        const expiration = auction.expiration;
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
    renderFeed(auctionID:string) {
        if(this.props.auctions.auctionFeeds[auctionID] === undefined) return null;
        return (
            <>
            {
                this.props.auctions.auctionFeeds[auctionID].map((feedItem:IAuctionFeedItem | IAuctionMessage) =>     
                <div className="auction-log-item" key={feedItem.timestamp}>
                    <span className="auction-log-timestamp">
                        {new Date(feedItem.timestamp).toLocaleString()}
                    </span>
                    <span className="auction-log-username">
                    {feedItem.username}{" "}
                    </span>
                    {
                        'bid' in feedItem ?
                        <>
                        bid {" "}
                        <span className="auction-log-amount">
                        ${numberWithCommas(feedItem.bid)}
                        </span>
                        </>
                        :
                        <span className="auction-log-message">{feedItem.message}</span>
                    }
                </div>
                )
            }
            </>
        )
    }
    subscribed() {
        let subscriptions:Array<string> = [...this.props.auctions.subscriptions];
        let auction:IAuctionItem|null = this.getAuction(this.props.auctions.activeAuctions);
        if(auction) {
            return (subscriptions.indexOf(auction.auctionID) !== -1);
        } else {
            return false;
        }
    }
    toggleSubscribed() {
        let subscriptions:Array<string> = [...this.props.auctions.subscriptions];
        let auction:IAuctionItem|null = this.getAuction(this.props.auctions.activeAuctions);
        if(auction) {
            let index:number = subscriptions.indexOf(auction.auctionID);
            if(index === -1) {
                subscriptions.push(auction.auctionID);
            } else {
                subscriptions.splice(index, 1);
            }
            this.props.setAuctionSubscriptions(subscriptions);

            if(storageAvailable()) {
                localStorage.setItem('nasfaq:auction_subscriptions', JSON.stringify(subscriptions));
            }

        } else {
            return false;
        }
    }
    render() {

        if(this.props.match.params.auctionid === undefined) return <Redirect to="/auctions" />;
        if(!this.props.session.loggedin) return (<Redirect to={"/login/auctions+" + this.props.match.params.auctionid}/>);

        if(this.state.redirect) return (<Redirect to={"/auctions"}/>);

        let auction = this.getAuction(this.props.auctions.activeAuctions);
        if(auction === null && this.props.auctions.activeAuctions.length > 0) 
            return (<Redirect to={"/auctions"}/>);

        if(auction === null) return null;

        return(
            <div className="container auction-detail-container">
                <div className="auctions-back">
                    <Link to="/auctions">
                    <IoIosArrowBack style={{verticalAlign: 'middle'}}/> Back to Auctions
                    </Link>
                </div>
                <div className="auction-background"></div>
                <div className="auction-detail-outer">
                    <div 
                        className="subscription-button"
                        onClick={() => this.toggleSubscribed()}>
                        {
                            this.subscribed() ?
                            <AiFillEye /> : <AiOutlineEye/>
                        }
                    </div>
                    <div className="auction-item-info">
                        <div className="auction-item-name">
                            {this.props.itemcatalogue[auction.item].name}
                        </div>
                        <div className="auction-seller">
                            Seller: {auction.seller}
                        </div>
                        <div className="auction-item-image">
                            <div className="auction-item-image-container">
                                <img src={ItemImages[auction.item]}/>
                            </div>
                            <div className="auction-item-quantity">
                                x{auction.amount}
                            </div>
                        </div>
                    </div>
                    <div className="auction-actions">
                        <div className="current-bid">
                            <div className="current-bid-amount">
                                Current Bid: ${numberWithCommas(auction.currentBid)}
                            </div>
                            <div className="current-bid-bidder">
                                Bidder: {
                                    auction.bidder ?
                                    auction.bidder : "-"
                                }
                            </div>
                        </div>
                        <div className="last-outbid">
                            <div className="last-outbid-amount">
                                Previous Bid: {
                                    auction.lastBid === 0 ?
                                    "-"
                                    :
                                    "$" + numberWithCommas(auction.lastBid)
                                }
                            </div>
                            <div className="last-outbid-bidder">
                                Outbid: {
                                    auction.lastOutbid ?
                                    auction.lastOutbid : "-"
                                }
                            </div>
                        </div>
                        <div className="bid-metrics">
                            <div className="remaining-time">
                                {this.state.timeRemaining}
                            </div>
                            {
                                this.myItem() ?
                                <div 
                                className={"cancel-auction " + (this.state.timeRemaining === 'Expired' ? 
                                "cancel-auction-disabled" : "")}
                                    onClick={() => this.cancelAuction()}>Cancel Auction</div> : null
                            }
                        </div>
                        <div className="auction-log">
                            {this.renderFeed(auction.auctionID)}
                        </div>
                        <div className="auction-bid-container">
                            <input 
                                type="text" 
                                placeholder="Enter bid $ amount..."
                                value={this.state.bid}
                                onChange={(e) => this.setState({bid:e.target.value})}/>
                            <div 
                                className="submit-bid"
                                onClick={() => this.sendBid()}>
                                <GiPayMoney  style={{verticalAlign: 'middle'}}/>
                            </div>
                        </div>
                        <div className="auction-message-container">
                            <input 
                                type="text"
                                placeholder="Send message..."
                                maxLength={100}
                                value={this.state.message}
                                onChange={(e) => this.setState({message:e.target.value})}/>
                            <div 
                                className="send-message-btn"
                                onClick={() => this.sendMessage()}>
                                <RiSendPlaneFill style={{verticalAlign: 'middle'}}/>
                            </div>
                        </div>
                        {
                            this.state.bidError ?
                            <div className="red bid-error">
                                {this.state.bidError}
                            </div> : null
                        }
                    </div>
                </div>
            </div>
        )
    }
}

const Auction = connect(
    mapStateToProps,
    mapDispatchToProps    
)(AuctionBind);

export default Auction;