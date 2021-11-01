import React, {Component} from 'react';
import "../../../css/auctions/createauction.scss";
import Calendar from 'react-calendar';

import {ItemImages} from '../ItemImages';

import {connect} from 'react-redux';


import {
    userinfoActions,
    auctionsActions
} from '../../actions/actions';
import { Redirect } from 'react-router';

const mapStateToProps = (state:any) => ({
    userinfo: state.userinfo,
    itemcatalogue: state.itemcatalogue,
    auctions: state.auctions
});

const mapDispatchToProps = {
    setItems: userinfoActions.setItems,
    setActiveAuctions: auctionsActions.setActiveAuctions
}

interface CreateAuctionProps {
    userinfo: {
        items:any
    },
    itemcatalogue: any,
    auctions: {
        activeAuctions: any
    },
    setItems: (items:any) => {},
    setActiveAuctions: (activeAuctions:any) => {}
}

class CreateAuctionState {
    selectedItem:any;
    minBid:string;
    sellQuantity:string;
    expirationDay:Date;
    expirationTime:string;
    auctionError:string;
    redirect:string;
    constructor() {
        this.selectedItem = null;
        this.minBid = "1000";
        this.sellQuantity = "1";
        let nextHour = (new Date().getHours() + 2) % 24;
        this.expirationDay = new Date(new Date().getTime() + (1000 * 60 * 60 * 2))
        let nextHourString = `${nextHour < 10 ? "0" : ""}${nextHour}`;
        let nextMinutes = new Date().getMinutes();
        this.expirationTime = nextHourString + ":" + `${nextMinutes < 10 ? "0" : ""}${nextMinutes}`;
        this.auctionError = "";
        this.redirect = "";
    }
}

class CreateAuctionBind extends Component<CreateAuctionProps> {

    state:CreateAuctionState;
    constructor(props:CreateAuctionProps) {
        super(props);
        this.state = new CreateAuctionState();
    }
    handleTime(e:any) {
        this.setState({expirationTime: e.target.value});
    }
    setItem(item:string) {
        this.setState({selectedItem:item});
    }
    submit() {
        let date = this.state.expirationDay;
        let hours = this.state.expirationTime.split(":")[0];
        let minutes = this.state.expirationTime.split(":")[1];
        date.setHours(parseInt(hours), parseInt(minutes));

        let bid = parseInt(this.state.minBid);
        if(isNaN(bid) || bid < 1000) {
            this.setState({auctionError:"Invalid bid."})
            return;
        }
        if(!this.state.selectedItem) {
            this.setState({auctionError:"Invalid item."})
            return;
        }
        if(this.getUserItems().indexOf(this.state.selectedItem) === -1) {
            this.setState({auctionError:"You do not own this item."})
            return;
        }
        if(!this.state.sellQuantity) {
            this.setState({auctionError:"Invalid quantity"});
            return;
        }
        let sellQuantity = parseInt(this.state.sellQuantity);
        if(isNaN(sellQuantity)) {
            this.setState({auctionError:"Invalid quantity."});
            return;
        }
        if(sellQuantity < 1 || this.state.selectedItem.quantity < sellQuantity) {
            this.setState({auctionError:"Invalid quantity."});
            return;
        }
        const elapsed = date.getTime() - new Date().getTime();
        if(elapsed < (1000 * 60 * 60 * 2 - (1000 * 60))
            || elapsed > (1000 * 60 * 60 * 24 * 3)) {
                this.setState({auctionError:"Invalid expiration."});
                return;
            }

        fetch('/api/placeAuctionSell/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                item: this.state.selectedItem.itemType,
                amount: sellQuantity,
                minimumBid: bid,
                expiration: date
            })
        })
        .then(response => response.json())
        .then(data => {
            if(!data.success) {
                this.setState({auctionError:data.reason})
            } else {
                this.props.setItems(data.items);
                //let activeAuctions = [...this.props.auctions.activeAuctions, data.auction];
                //this.props.setActiveAuctions(activeAuctions);
                this.setState({selectedItem:null, redirect:data.auction.auctionID});
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }
    getItemClass(item:any) {
        if(!this.state.selectedItem) return "";
        if(this.state.selectedItem.itemType === item.itemType) {
            return "selected-item";
        } else {
            return "";
        }
    }
    getItemQuantity() {
        if(this.state.selectedItem) {
            return this.state.selectedItem.quantity.toString();
        } else return "0";
    }
    getUserItems() {
        let items:Array<any> = [];
        Object.keys(this.props.userinfo.items).forEach((type:any) => {
            items = [...items, ...this.props.userinfo.items[type]];
        });
        items = items.filter((item:any) => {
            return this.props.itemcatalogue[item.itemType].tradeable;
        });
        return items;
    }
    render() {
        if(this.state.redirect) return <Redirect to={"/auctions/" + this.state.redirect} />;
        let items = this.getUserItems();
        return(
            <div className="create-auction-window">
                <div className="auction-item-select flex flex-col flex-center">
                    <div className="auction-item-select-header">
                        My Items
                    </div>
                    <div className="auction-item-select-inner">
                        {
                            items.map((item:any) => {
                                return (
                                item !== "Cash" ? 
                                    <img 
                                        key={item.itemType}
                                        src={ItemImages[item.itemType]} 
                                        onClick={() => {this.setItem(item)}}
                                        className={this.getItemClass(item)}/> : null
                                )}
                            )
                        }
                        {
                            items.length === 0 ?
                            "You don't own any items!" : null
                        }
                    </div>
                </div>
                <div className="auction-item-input">
                    <div className="item-name">Item: {this.state.selectedItem ? this.state.selectedItem.itemType : "none"}</div>
                    <div className="item-amount-owned">Amount owned: {this.state.selectedItem ? this.state.selectedItem.quantity : "0"}</div>
                    <div className="sell-quantity flex flex-row">
                        <div className="sell-quantity-label">
                            Quantity to sell:
                        </div>
                        <input type="number" min="1" max={this.getItemQuantity()} step="1" value={this.state.sellQuantity} onChange={(e) => {
                            this.setState({sellQuantity:e.target.value})
                        }}/>
                    </div>
                    <div className="minimum-bid flex flex-row">
                        <div className="minimum-bid-label">Minimum Bid:</div>
                        <input type="number" min="1000" max="1000000" step="1000" value={this.state.minBid} onChange={(e) => {
                            this.setState({minBid:e.target.value})
                        }}/>
                    </div>
                    <div className="expiration-outer">
                        Expiration: (Minimum 2 hours, Maximum 3 days)
                        <Calendar 
                            calendarType="US"
                            onClickDay={(value:any) => {this.setState({expirationDay:value})}}
                            defaultValue={this.state.expirationDay}
                            className={"date-updater-calendar"}/>
                        <input type="time" className="expiration-time-input" value={this.state.expirationTime} onChange={(e:any) => this.handleTime(e)}/>
                    </div>
                    <div className="create-auction">
                        <div 
                            className="create-auction-button"
                            onClick={() => this.submit()}>
                            Create Auction
                        </div>
                    </div>
                    <div className="create-auction-error">
                        {this.state.auctionError}
                    </div>
                </div>
            </div>
        )
    }
}

const CreateAuction = connect(
    mapStateToProps,
    mapDispatchToProps
)(CreateAuctionBind);

export default CreateAuction;