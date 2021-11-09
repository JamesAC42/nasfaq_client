import React, {Component} from 'react';
import '../../../css/auctions/auctions.scss';

import {connect} from 'react-redux';

import DropdownInput from '../DropdownInput';
import AuctionPreview from './AuctionPreview';
import AuctionHistory from './AuctionHistory';
import CreateAuction from './CreateAuction';
import { IAuctionHistory, IAuctionItem } from './IAuction';
import { Redirect } from 'react-router';
import BuyLicense from './BuyLicense';

import AuctionInfo from './AuctionInfo';

import {
    AiOutlineInfoCircle
} from 'react-icons/ai';
import { auctionsActions } from '../../actions/actions';
import storageAvailable from '../../checkStorage';

const mapStateToProps = (state:any) => ({
    userinfo:state.userinfo,
    session:state.session,
    auctions:state.auctions,
    itemcatalogue:state.itemcatalogue
});

const mapDispatchToProps = {
    setAuctionSubscriptions: auctionsActions.setAuctionSubscriptions
}

enum AuctionView {
    LIVE,
    PAST
}

enum AuctionSort {
    Price,
    ExpirationTime,
    Item,
    Seller,
    Bidder
}

class AuctionFilters {
    myBids:boolean;
    mySales:boolean;
    watching:boolean;
    item:string|null;
    hasBid:boolean;
    noBidders:boolean;
    sortMethod:AuctionSort;
    constructor() {
        this.myBids = false;
        this.mySales = false;
        this.watching = false; 
        this.item = null;
        this.hasBid = false;
        this.noBidders = false;
        this.sortMethod = AuctionSort.ExpirationTime;
    }
}

class AuctionsState {
    activeView: AuctionView;
    showCreateWindow: boolean;
    showBuyLicenseWindow: boolean;
    showInfoWindow: boolean;
    showFilters: boolean;
    showItemSelect: boolean;
    filters:AuctionFilters;
    constructor() {
        this.showInfoWindow = false;
        this.activeView = AuctionView.LIVE;
        this.showCreateWindow = false;
        this.showBuyLicenseWindow = false;
        this.showFilters = false;
        this.showItemSelect = false;
        this.filters = new AuctionFilters();
    } 
}

interface AuctionsProps {
    userinfo: {
        items:any,
        loaded:boolean,
        username:string,
        id:string
    },
    session: {
        loggedin: boolean
    },
    auctions: {
        activeAuctions:Array<IAuctionItem>,
        subscriptions:Array<string>
    },
    itemcatalogue: any,
    setAuctionSubscriptions: (subscriptions:any) => {}
}

class AuctionsBind extends Component<AuctionsProps> {
    state:AuctionsState;
    constructor(props:AuctionsProps) {
        super(props);
        this.state = new AuctionsState();
    }
    selectTabClass(view:AuctionView) {
        return `view-select-tab ${this.state.activeView === view ? "active" : ""}`
    }
    setView(view:AuctionView) {
        this.setState({activeView:view});
    }
    hasLicense() {
        let items = this.props.userinfo.items;
        if(items['license'] === undefined) {
            return false;
        } else {
            for(let i = 0; i < items['license'].length; i++) {
                if(items['license'][i].itemType === "AuctionLicense") {
                    return true;
                }
            }
            return false;
        }
    }
    filterAuctions() {
        let activeAuctions = [...this.props.auctions.activeAuctions];
        let filters = {...this.state.filters};

        let union:Array<IAuctionItem> = [];
        let atLeastOneFilter = false;
        if(filters.myBids) {
            union = [...union, ...activeAuctions.filter((a:IAuctionItem) => {
                return a.bidderid === this.props.userinfo.id
            })];
            atLeastOneFilter = true;
        }
        if(filters.mySales) {
            union = [...union, ...activeAuctions.filter((a:IAuctionItem) => {
                return a.sellerid === this.props.userinfo.id
            })]
            atLeastOneFilter = true;
        }
        if(filters.watching) {
            this.props.auctions.subscriptions.forEach((s:string) => {
                activeAuctions.forEach((a:IAuctionItem) => {
                    if(a.auctionID === s) {
                        union.push({...a})
                    }
                })
            })
            atLeastOneFilter = true;
        }
        if(filters.hasBid) {
            union = [...union, ...activeAuctions.filter((a:IAuctionItem) => {
                return a.bidder !== null
            })]
            atLeastOneFilter = true;
        }
        if(filters.noBidders) {
            union = [...union, ...activeAuctions.filter((a:IAuctionItem) => {
                return a.bidder === null
            })]
            atLeastOneFilter = true;
        }
        if(!atLeastOneFilter) {
            union = [...activeAuctions];
        }
        if(filters.item !== null) {
            union = union.filter((a:IAuctionItem) => {
                return a.item === filters.item
            })
        }

        let auctionHash:{[key:string]:IAuctionItem} = {};
        for(let j = 0; j < union.length; j++) {
            auctionHash[union[j].auctionID] = {...union[j]}
        }
        let auctionSet:Array<IAuctionItem> = [];
        Object.keys(auctionHash).forEach((auctionID:string) => {
            auctionSet.push(auctionHash[auctionID]);
        })

        if(filters.sortMethod === AuctionSort.Bidder) {
            auctionSet.sort((a:IAuctionItem, b:IAuctionItem) => {
                if(a.bidder === null) {
                    return -1;
                }
                if(b.bidder === null) {
                    return 1;
                }
                return ('' + a.bidder).localeCompare(b.bidder);
            })
        }
        if(filters.sortMethod === AuctionSort.Seller) {
            auctionSet.sort((a:IAuctionItem, b:IAuctionItem) => {
                return ('' + a.seller).localeCompare(b.seller);
            })
        }
        if(filters.sortMethod === AuctionSort.ExpirationTime) {
            auctionSet.sort((a:IAuctionItem, b:IAuctionItem) => {
                return a.expiration - b.expiration;
            })
        }
        if(filters.sortMethod === AuctionSort.Price) {
            auctionSet.sort((a:IAuctionItem, b:IAuctionItem) => {
                return a.currentBid - b.currentBid;
            })
        }
        if(filters.sortMethod === AuctionSort.Item) {
            auctionSet.sort((a:IAuctionItem, b:IAuctionItem) => {
                return ('' + a.item).localeCompare(b.item);
            })
        }
        return auctionSet;
    }

    setFilterToggle(property:any) {
        this.setState({
            filters: {
                ...this.state.filters,
                ...property
            }
        })
    }

    setSortMethod(e:string) {

        let sortMethod:AuctionSort = AuctionSort.ExpirationTime;
        if(e === 'Price') {
            sortMethod = AuctionSort.Price;
        } else if(e === 'Expiration') {
            sortMethod = AuctionSort.ExpirationTime;
        } else if(e === 'Item') {
            sortMethod = AuctionSort.Item;
        } else if(e === 'Seller') {
            sortMethod = AuctionSort.Seller;
        } else if(e === 'Bidder') {
            sortMethod = AuctionSort.Bidder;
        }
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                sortMethod
            }
        })
    }

    checkBoxClass(property:keyof AuctionFilters) {
        let cn = "checkbox ";
        if(this.state.filters[property]) {
            cn += "active";
        }
        return cn;
    }

    renderItemSelectItem(item:string|null) {
        if(item) {
            if(!this.props.itemcatalogue[item].tradeable) return null;
        }
        return(
            <div 
                className="item-item"
                onClick={() => this.setState({
                    ...this.state,
                    filters: {
                        ...this.state.filters,
                        item
                    },
                    showItemSelect:false
                })}>
                {
                    item? 
                    this.props.itemcatalogue[item].name
                    : "All"
                }
            </div>
        )
    }

    watchAll() {
        let subscriptions:Array<string> = this.props.auctions.activeAuctions.map((a:IAuctionItem) => {return a.auctionID});
        this.props.setAuctionSubscriptions(subscriptions);
        if(storageAvailable()) {
            localStorage.setItem('nasfaq:auction_subscriptions', JSON.stringify(subscriptions));
        }
    }

    watchAllMine() {
        let subscriptions:Array<string> = [];
        this.props.auctions.activeAuctions.forEach((a:IAuctionItem) => {
            if(a.sellerid === this.props.userinfo.id) {
                subscriptions.push(a.auctionID);
            }
        });
        this.props.setAuctionSubscriptions(subscriptions);
        if(storageAvailable()) {
            localStorage.setItem('nasfaq:auction_subscriptions', JSON.stringify(subscriptions));
        }
    }

    unwatchAll() {
        this.props.setAuctionSubscriptions([]);
        if(storageAvailable()) {
            localStorage.setItem('nasfaq:auction_subscriptions', JSON.stringify([]))
        }
    }

    render() {
        if(!this.props.userinfo.loaded) return null;
        if(!this.props.session.loggedin) return <Redirect to="/login/auctions"/>;

        let auctions:Array<IAuctionItem> = this.filterAuctions();

        return(
            <div className="container fill">
                {
                    this.state.showInfoWindow ?
                    <AuctionInfo /> : null
                }
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
                        <div className="left-action-container">
                            { 
                                this.hasLicense() ?
                                <div 
                                    className="add-auction-button"
                                    onClick={() => this.setState({showCreateWindow: !this.state.showCreateWindow})}>
                                    Create Auction
                                </div>
                                :
                                <div 
                                    className="buy-auction-license-button"
                                    onClick={() => this.setState({showBuyLicenseWindow: !this.state.showBuyLicenseWindow})}>
                                    Buy License
                                </div>
                            }
                            <div 
                                className="toggle-filters-button"
                                onClick={() => this.setState({showFilters: !this.state.showFilters})}>{this.state.showFilters ? "Hide " : "Show "} Filters</div>
                        </div>
                        <div 
                            className="info-button"
                            onClick={() => this.setState({showInfoWindow: !this.state.showInfoWindow})}>
                            <AiOutlineInfoCircle />
                        </div>
                    </div>
                    { this.state.showCreateWindow && this.hasLicense() ?
                        <CreateAuction/> : null
                    }
                    { this.state.showBuyLicenseWindow && !this.hasLicense() ?
                        <BuyLicense /> : null
                    }
                    
                    {
                        this.state.showItemSelect && this.state.showFilters ?
                        <div className="item-select-container"> 
                            {this.renderItemSelectItem(null)}
                            {
                                Object.keys(this.props.itemcatalogue).map((item:string) => 
                                    this.renderItemSelectItem(item)
                                )
                            }               
                        </div> : null
                    }

                    <div className="auction-content-outer">
                        {
                            this.state.showFilters ?
                            <div className="auction-filter-controls">


                                <div className="auction-filter-control-row">
                                    <div className="filter-label">My Bids</div>
                                    <div 
                                        className={this.checkBoxClass("myBids")}
                                        onClick={() => this.setFilterToggle({myBids:!this.state.filters.myBids})}></div>
                                </div>
                                <div className="auction-filter-control-row">
                                    <div className="filter-label">My Sales</div>
                                    <div 
                                        className={this.checkBoxClass("mySales")}
                                        onClick={() => this.setFilterToggle({mySales:!this.state.filters.mySales})}></div>
                                </div>
                                <div className="auction-filter-control-row">
                                    <div className="filter-label">Watching</div>
                                    <div 
                                        className={this.checkBoxClass("watching")}
                                        onClick={() => this.setFilterToggle({watching:!this.state.filters.watching})}></div>
                                </div>
                                <div className="auction-filter-control-row">
                                    <div className="filter-label">Item</div>
                                    <div 
                                        className="item-select"
                                        onClick={() => this.setState({
                                            showItemSelect:!this.state.showItemSelect
                                        })}>
                                        {
                                        this.state.filters.item ?
                                        this.state.filters.item : "None"}
                                    </div>
                                </div>
                                <div className="auction-filter-control-row">
                                    <div className="filter-label">Has Bid</div>
                                    <div 
                                        className={this.checkBoxClass("hasBid")}
                                        onClick={() => this.setFilterToggle({hasBid:!this.state.filters.hasBid})}></div>
                                </div>
                                <div className="auction-filter-control-row">
                                    <div className="filter-label">No Bidders</div>
                                    <div 
                                        className={this.checkBoxClass("noBidders")}
                                        onClick={() => this.setFilterToggle({noBidders:!this.state.filters.noBidders})}></div>
                                </div>
                                <div className="auction-filter-control-row">
                                    <div className="filter-label">Sort by</div>
                                    <DropdownInput 
                                        label=""
                                        options={["Price", "Expiration", "Item", "Seller", "Bidder"]}
                                        default={"Expiration"}
                                        onChange={(e) => {this.setSortMethod(e)}}
                                        />
                                </div>
                                <div className="auction-filter-control-row center">
                                    <div 
                                        className="auction-control-button"
                                        onClick={() => this.watchAll()}>
                                        Watch All
                                    </div>
                                    <div 
                                        className="auction-control-button"
                                        onClick={() => this.unwatchAll()}>
                                        Unwatch All
                                    </div>
                                    <div 
                                        className="auction-control-button"
                                        onClick={() => this.watchAllMine()}>
                                        Watch All Mine
                                    </div>
                                </div>
                            </div> : null
                        }
                        <div className="auction-container">
                        {
                            this.state.activeView === AuctionView.LIVE ?
                            <>
                                {
                                    auctions.map((item:IAuctionItem) => 
                                    <AuctionPreview
                                        key={item.auctionID}
                                        auction={item}/>
                                    )
                                }
                                { 
                                    auctions.length === 0 ?
                                    <div className="no-active-auctions">
                                        No Active Auctions!
                                    </div> : null
                                }
                            </>
                            :
                            <AuctionHistory/>
                        }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const Auctions = connect(
    mapStateToProps,
    mapDispatchToProps
)(AuctionsBind);

export default Auctions;