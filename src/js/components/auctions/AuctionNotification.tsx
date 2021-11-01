import React, {Component} from 'react';
import {connect} from 'react-redux';

import '../../../css/auctions/auctionnotifications.scss';
import { auctionsActions } from '../../actions/actions';
import numberWithCommas from '../../numberWithCommas';
import {ItemImages} from '../ItemImages';
import { IAuctionNotificationItem } from './IAuction';

const mapStateToProps = (state:any) => ({
    auctions:state.auctions,
    session:state.session,
    settings:state.settings
});

const mapDispatchToProps = {
    setAuctionNotifications: auctionsActions.setAuctionNotifications,
}

interface AuctionNotificationsProps {
    auctions: {
        auctionNotifications: Array<IAuctionNotificationItem>,
    },
    settings: {
        tradeNotifications: boolean
    },
    session: {
        loggedin: boolean
    },
    setAuctionNotifications: (auctionNotifications:any) => {}
}

class AuctionNotificationsBind extends Component<AuctionNotificationsProps> {

    intervalId:any;
    componentDidMount() {
        this.intervalId = setInterval(() => {
            let notifs = [...this.props.auctions.auctionNotifications];
            if(notifs !== undefined) {
                if(notifs.length > 0) {
                    let recentNotif = notifs[0];
                    let now = new Date().getTime();
                    if((now - recentNotif.timestamp) > 5000) {
                        notifs.splice(0, 1);
                    }
                    this.props.setAuctionNotifications(notifs);
                }
            }
        },5000)
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    render() {
        if(!this.props.session.loggedin) return null;
        if(!this.props.settings.tradeNotifications) return <div></div>;

        return(
            <div className="auction-notifications-outer">
                {
                    this.props.auctions.auctionNotifications.map((item:IAuctionNotificationItem) => 
                    <div className="auction-notification-item" key={item.timestamp}>
                        <div className="item-img">
                            <img src={ItemImages[item.item]} alt={item.item}/>
                        </div>
                        <div className="notif-desc">
                            <span className="bidder">{item.bidder}</span>
                            <span>bid</span>
                            <span className="bid-amount">${numberWithCommas(item.bid)}</span>
                            <span>for</span>
                            <span className="seller">{item.seller}</span>'s
                            <span className="item-amount">{item.amount}x</span>
                            <span className="item">{item.item}</span>
                        </div>
                    </div>
                    )
                }
            </div>
        )
    }

}

const AuctionNotifications = connect(
    mapStateToProps,
    mapDispatchToProps
)(AuctionNotificationsBind);

export default AuctionNotifications;