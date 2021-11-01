import React, {Component} from 'react';
import Button from '../Button';
import "../../../css/auctions/buylicense.scss";
import {ItemImages} from '../ItemImages';

import {connect} from 'react-redux';
import { IWallet } from '../../interfaces/IWallet';
import numberWithCommas from '../../numberWithCommas';
import { userinfoActions } from '../../actions/actions';

const mapDispatchToProps = {
    setWallet: userinfoActions.setWallet,
    setItems: userinfoActions.setItems
}

const mapStateToProps = (state:any) => ({
    userinfo:state.userinfo,
    itemmarketprices:state.itemmarketprices
})

interface BuyLicenseProps {
    userinfo: {
        wallet:IWallet
    },
    itemmarketprices:any,
    setWallet: (wallet:IWallet) => {},
    setItems: (items:{}) => {}
}

class BuyLicenseBind extends Component<BuyLicenseProps> {
    buttonClass() {
        let c = "inverse green ";
        if(this.props.userinfo.wallet.balance < this.props.itemmarketprices['AuctionLicense'].price) {
            c += "disabled";
        }
        return c;
    }
    buyLicense() {
        if(this.props.userinfo.wallet.balance < this.props.itemmarketprices['AuctionLicense'].price) {
            return;
        }
        fetch('/api/placeItemMarketBuy/', {
            method: 'POST',
            body: JSON.stringify({
                item:"AuctionLicense"
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.props.setWallet(data.wallet);
                this.props.setItems(data.inventory);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }
    render() {
        if(this.props.itemmarketprices['AuctionLicense'] === undefined) {
            return null;
        }
        return (
            <div className="buy-auction-license">
                <div className="license-image">
                    <img src={ItemImages["AuctionLicense"]} alt="AuctionLicense" />
                </div>
                <div className="buy-license-action">
                    <div className="buy-license-header">
                        Auction License
                    </div>
                    <div className="buy-license-description">
                        Owning an auction license will allow you to create auctions to sell your items to the highest bidder.
                    </div>
                    <div className="buy-license-price">
                        ${numberWithCommas(this.props.itemmarketprices['AuctionLicense'].price)}
                    </div>
                    <div className="buy-license-buy">
                        <Button 
                            className={this.buttonClass()}
                            onClick={() => this.buyLicense()}>BUY</Button>
                    </div>
                </div>
            </div>
        ) 
    }
}

const BuyLicense = connect(
    mapStateToProps,
    mapDispatchToProps
)(BuyLicenseBind);

export default BuyLicense;