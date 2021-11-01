import React, {Component} from 'react';

import "../../../css/auctions/auctioninfo.scss";

class AuctionInfo extends Component {

    render() {
        return(
            <div className="auction-info">
                <div className="auction-info-header">
                    info
                </div>
                <div className="auction-info-content">
                    <p>
                        The <span className="broker">Gacha</span> page is a place where you can dump your hard earned money into a computer algorithm, while praying to the mystical RNjesas, hoping to earn something worth your money. Do you want a hat? A fancy name? An item or two blessed by your oshi? Well, you can do it here. There is both a single and 10 draw, priced accordingly, allowing you to try your luck. This page also tracks the money you have spent so you can see just how far the sunken cost fallacy can take you!
                    </p>
                    <p>
                        The <span className="broker">Auctions</span> page is where you can sell your hard earned gacha items or acquire that which RNjesas has fated you not to have. All auctions that expire are completed every 15 minutes or extended if someone bids on it or if there are no bids and the seller chooses not to cancel the auction. All bids are subject to a 5% non-refundable tax as well. Note that all items and bids are held by the broker until the auction expires, at which point they are transferred to the buyer and seller respectively. All actions have a 1 minute cooldown in order to prevent spamming.
                    </p>
                    <p>
                        While buying requires no auction license, selling does. This is to prevent new accounts being made simply to spam their starting cash in the gacha in hopes of earning a desireable item and selling it to oneself when nobody is looking. Auction licenses can be acquired using the "Buy License" button on the top left corner, following that you may place sales of your items using the button, which now reads "Create Auction". Here you may decide how many you wish to sell, the minimum bid and the expiration, with a minimum of 2 hours and a maximum of 3 days. Do note that you must be careful when setting the expiration! If you overrun this period with no sales you'll be charged an extension fee of $1,000 per 15 minutes! You may decide to cancel an auction instead for 50% of your minimum bid or $5,000, whichever is greater. Note that you cannot cancel the auction in the last 15 minutes of your auction.
                    </p>
                    <p>
                        When buying, you may follow an auction without bidding by subscribing to it using the eye-shaped icon on the lower right hand side of the auction listing in the "Live Auctions" screen or on the top left hand corner of the details screen of an auction. You can bid by clicking the icon of the auction to enter the details screen and then placing your bid. Do note that the minimum you must outbid the previous bid by is $1,000. Note that all bids are charged with a non-refundable 5% tax! Once you make a bid you are automatically subscribed to the auction and will receive info regarding that auction. If you are outbid, the amount you bid, minus the tax is refunded to you. This is also true if the auction is cancelled by the seller. When you place a bid, you automatically extend an auction by 15 minutes, this is to prevent last minute competition from snatching the item.
                    </p>
                    <p>
                        The "Past Auctions" sub-page allows you to see past auctions, clicking on an item brings up its price history as well, showing you how much the item was sold for in the past.
                    </p>
                </div>
            </div>
        )
    }

}

export default AuctionInfo;