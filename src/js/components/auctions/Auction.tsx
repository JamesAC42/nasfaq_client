import React, {Component} from 'react';

import {ItemImages} from '../ItemImages';
import '../../../css/auctions/auction.scss';

import {
    AiOutlineEye,
    AiFillEye
} from 'react-icons/ai';
import {
    IoIosArrowBack
} from 'react-icons/io';
import { Link } from 'react-router-dom';

class Auction extends Component {

    render() {
        return(
            <div className="container auction-detail-container">
                <div className="auctions-back">
                    <Link to="/auctions">
                    <IoIosArrowBack style={{verticalAlign: 'middle'}}/> Back to Auctions
                    </Link>
                </div>
                <div className="auction-background"></div>
                <div className="auction-detail-outer">
                    <div className="auction-item-info">
                        <div className="auction-item-name">
                            Marine's Hat
                        </div>
                        <div className="auction-seller">
                            Seller: mogu
                        </div>
                        <div className="auction-item-image">
                            <div className="auction-item-image-container">
                                <img src={ItemImages["MarineHat"]}/>
                            </div>
                            <div className="auction-item-quantity">
                                x10
                            </div>
                        </div>
                    </div>
                    <div className="auction-actions">
                        <div className="current-bid">
                            <div className="current-bid-amount">
                                Current Bid: $87,000
                            </div>
                            <div className="current-bid-bidder">
                                Bidder: mogu
                            </div>
                        </div>
                        <div className="last-outbid">
                            <div className="last-outbid-amount">
                                Previous Bid: $50,000
                            </div>
                            <div className="last-outbid-bidder">
                                Outbid: tft
                            </div>
                        </div>
                        <div className="bid-metrics">
                            <div className="remaining-time">
                                00:00:01:56
                            </div>
                            <div className="auction-watching">
                                8 <AiOutlineEye />
                            </div>
                        </div>
                        <div className="auction-log">
                            <div className="auction-log-item">
                                <span className="auction-log-timestamp">
                                    10/12/2012 04:23:01
                                </span>
                                <span className="auction-log-username">
                                mogu{" "}
                                </span>
                                bid {" "}
                                <span className="auction-log-amount">
                                $10,000
                                </span>
                            </div>
                            <div className="auction-log-item">
                                <span className="auction-log-timestamp">
                                    10/12/2012 04:23:01
                                </span>
                                <span className="auction-log-username">
                                mogu{" "}
                                </span>
                                bid {" "}
                                <span className="auction-log-amount">
                                $10,000
                                </span>
                            </div>
                            <div className="auction-log-item">
                                <span className="auction-log-timestamp">
                                    10/12/2012 04:23:01
                                </span>
                                <span className="auction-log-username">
                                mogu{" "}
                                </span>
                                bid {" "}
                                <span className="auction-log-amount">
                                $10,000
                                </span>
                            </div>
                            <div className="auction-log-item">
                                <span className="auction-log-timestamp">
                                    10/12/2012 04:23:01
                                </span>
                                <span className="auction-log-username">
                                mogu{" "}
                                </span>
                                bid {" "}
                                <span className="auction-log-amount">
                                $10,000
                                </span>
                            </div>
                            <div className="auction-log-item">
                                <span className="auction-log-timestamp">
                                    10/12/2012 04:23:01
                                </span>
                                <span className="auction-log-username">
                                mogu{" "}
                                </span>
                                bid {" "}
                                <span className="auction-log-amount">
                                $10,000
                                </span>
                            </div>
                            <div className="auction-log-item">
                                <span className="auction-log-timestamp">
                                    10/12/2012 04:23:01
                                </span>
                                <span className="auction-log-username">
                                mogu{" "}
                                </span>
                                bid {" "}
                                <span className="auction-log-amount">
                                $10,000
                                </span>
                            </div>
                            <div className="auction-log-item">
                                <span className="auction-log-timestamp">
                                    10/12/2012 04:23:01
                                </span>
                                <span className="auction-log-username">
                                mogu{" "}
                                </span>
                                bid {" "}
                                <span className="auction-log-amount">
                                $10,000
                                </span>
                            </div>
                            <div className="auction-log-item">
                                <span className="auction-log-timestamp">
                                    10/12/2012 04:23:01
                                </span>
                                <span className="auction-log-username">
                                mogu{" "}
                                </span>
                                bid {" "}
                                <span className="auction-log-amount">
                                $10,000
                                </span>
                            </div>
                            <div className="auction-log-item">
                                <span className="auction-log-timestamp">
                                    10/12/2012 04:23:01
                                </span>
                                <span className="auction-log-username">
                                mogu{" "}
                                </span>
                                bid {" "}
                                <span className="auction-log-amount">
                                $10,000
                                </span>
                            </div>
                            <div className="auction-log-item">
                                <span className="auction-log-timestamp">
                                    10/12/2012 04:23:01
                                </span>
                                <span className="auction-log-username">
                                mogu{" "}
                                </span>
                                bid {" "}
                                <span className="auction-log-amount">
                                $10,000
                                </span>
                            </div>
                            <div className="auction-log-item">
                                <span className="auction-log-timestamp">
                                    10/12/2012 04:23:01
                                </span>
                                <span className="auction-log-username">
                                mogu{" "}
                                </span>
                                bid {" "}
                                <span className="auction-log-amount">
                                $10,000
                                </span>
                            </div>
                            
                        </div>
                        <div className="auction-bid-container">
                            <input type="text" placeholder="Enter bid $ amount..."/>
                            <div className="submit-bid">
                                Place Bid
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}

export default Auction;