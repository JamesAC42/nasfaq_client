import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
    AiOutlineEye,
    AiFillEye
} from 'react-icons/ai';
import {ItemImages} from '../ItemImages';
import numberWithCommas from '../../numberWithCommas';

const mapStateToProps = (state:any) => ({
    itemcatalogue: state.itemcatalogue
})

interface AuctionPreviewProps {
    item:string,
    seller:string,
    bidders:number,
    expiration:Date,
    quantity:number,
    bid:number,
    itemcatalogue: any
}

class AuctionPreviewBind extends Component<AuctionPreviewProps> {

    timeRemaining() {
        const now = new Date().getTime();
        const expiration = this.props.expiration.getTime();
        const remaining = expiration - now;
        if(remaining <= 0) {
            return "Expired";
        }
        const hours = remaining / 1000 / 60 / 60;
        if(hours >= 24) {
            return Math.floor(hours / 24) + " days remaining";
        }
        if(hours > 1) {
            return hours + " hours remaining";
        } else {
            const minutes = remaining / 1000 / 60;
            return minutes + " minutes remaining";
        }
    }
    render() {
        if(this.props.itemcatalogue[this.props.item] === undefined) return null;
        return(
            
            <div className="auction-preview">

                <div className="watch-auction">
                    <AiOutlineEye />
                </div>

                <div className="item-auction-thumbnail flex center-child">
                    <img src={ItemImages[this.props.item]} alt="Marine's Hat" />
                </div>
                <div className="auction-preview-info">
                    <div className="auction-preview-info-name">
                        {this.props.itemcatalogue[this.props.item].name}
                    </div>
                    <div className="auction-preview-info-seller">
                        Seller: <span className="highlight">
                            {this.props.seller}
                        </span>
                    </div>
                    <div className="auction-preview-info-bidders">
                        <span className="highlight">{this.props.bidders}</span> bidders
                    </div>
                    <div className="auction-preview-info-quantity">
                        Quantity: <span className="highlight">
                            {this.props.quantity}
                        </span>
                    </div>
                    <div className="auction-preview-info-time-remaining">
                        <span className="time-remaining">{this.timeRemaining()}</span>
                    </div>
                    <div className="auction-preview-info-current-bid">
                        <span className="auction-preview-price">${numberWithCommas(this.props.bid)}</span>
                    </div>
                </div>
            </div>
        )
    }
}

const AuctionPreview = connect(mapStateToProps)(AuctionPreviewBind);

export default AuctionPreview;