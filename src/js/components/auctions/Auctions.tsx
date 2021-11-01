import React, {Component} from 'react';
import '../../../css/auctions/auctions.scss';

import {connect} from 'react-redux';

import DropdownInput from '../DropdownInput';
import AuctionPreview from './AuctionPreview';
import AuctionHistory from './AuctionHistory';
import CreateAuction from './CreateAuction';
import { IAuctionItem } from './IAuction';
import { Redirect } from 'react-router';
import BuyLicense from './BuyLicense';

import AuctionInfo from './AuctionInfo';

import {
    AiOutlineInfoCircle
} from 'react-icons/ai';

const mapStateToProps = (state:any) => ({
    userinfo:state.userinfo,
    session:state.session,
    auctions:state.auctions
})

enum AuctionView {
    LIVE,
    PAST
}

class AuctionsState {
    activeView: AuctionView;
    showCreateWindow: boolean;
    showBuyLicenseWindow: boolean;
    showInfoWindow: boolean;
    constructor() {
        this.showInfoWindow = false;
        this.activeView = AuctionView.LIVE;
        this.showCreateWindow = false;
        this.showBuyLicenseWindow = false;
    } 
}

interface AuctionsProps {
    userinfo: {
        items:any,
        loaded:boolean
    },
    session: {
        loggedin: boolean
    },
    auctions: {
        activeAuctions:Array<IAuctionItem>
    }
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
    render() {
        if(!this.props.userinfo.loaded) return null;
        if(!this.props.session.loggedin) return <Redirect to="/login/auctions"/>;
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
                    <div className="auction-container">
                    {
                        this.state.activeView === AuctionView.LIVE ?
                        <>
                            {
                                this.props.auctions.activeAuctions.map((item:IAuctionItem) => 
                                <AuctionPreview
                                    key={item.auctionID}
                                    auction={item}/>
                                )
                            }
                            { 
                                this.props.auctions.activeAuctions.length === 0 ?
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
        )
    }
}

const Auctions = connect(mapStateToProps)(AuctionsBind);

export default Auctions;