import React, {Component} from 'react';
import '../../../css/auctions/auctions.scss';

import DropdownInput from '../DropdownInput';
import AuctionPreview from './AuctionPreview';

class Auctions extends Component {
    render() {
        return(
            <div className="container fill">
                <div className="auction-page-container container-inner">
                    <div className="auctions-title flex flex-col center-child">
                        <div className="auctions-title-text">auctions</div>
                        <div className="auctions-description">bid on rare items!</div>
                    </div>
                    <div className="auction-filters flex flex-row flex-center">
                        <DropdownInput 
                            label=""
                            options={["1 day", "1 week", "1 month"]}
                            default="1 day"
                            onChange={(val:any) => {console.log(val)}} />
                    </div>
                    <div className="auction-container">
                        <AuctionPreview
                            item="MarineHat"
                            seller="mogu"
                            bidders={6}
                            quantity={1}
                            expiration={new Date()}
                            bid={40000} />
                        <AuctionPreview
                            item="OkayuHat"
                            seller="mogu"
                            bidders={6}
                            quantity={1}
                            expiration={new Date()}
                            bid={40000} />
                        <AuctionPreview
                            item="AquaEnergyDrink"
                            seller="mogu"
                            bidders={6}
                            quantity={1}
                            expiration={new Date()}
                            bid={40000} />
                        <AuctionPreview
                            item="WatsonConcoction"
                            seller="mogu"
                            bidders={6}
                            quantity={1}
                            expiration={new Date()}
                            bid={40000} />
                        <AuctionPreview
                            item="Jeb"
                            seller="mogu"
                            bidders={6}
                            quantity={1}
                            expiration={new Date()}
                            bid={40000} />
                        <AuctionPreview
                            item="MioOmamori"
                            seller="mogu"
                            quantity={1}
                            bidders={6}
                            expiration={new Date()}
                            bid={40000} />
                        <AuctionPreview
                            item="RushiaHat"
                            seller="mogu"
                            quantity={1}
                            bidders={6}
                            expiration={new Date()}
                            bid={40000} />
                        <AuctionPreview
                            item="Jeb"
                            seller="mogu"
                            bidders={6}
                            quantity={1}
                            expiration={new Date()}
                            bid={40000} />
                        <AuctionPreview
                            item="MioOmamori"
                            seller="mogu"
                            quantity={1}
                            bidders={6}
                            expiration={new Date()}
                            bid={40000} />
                        <AuctionPreview
                            item="RushiaHat"
                            seller="mogu"
                            quantity={1}
                            bidders={6}
                            expiration={new Date()}
                            bid={40000} />
                        <AuctionPreview
                            item="Jeb"
                            seller="mogu"
                            bidders={6}
                            quantity={1}
                            expiration={new Date()}
                            bid={400000000} />
                        <AuctionPreview
                            item="MioOmamori"
                            seller="mogu"
                            quantity={1}
                            bidders={6}
                            expiration={new Date()}
                            bid={40000} />
                        <AuctionPreview
                            item="RushiaHat"
                            seller="mogu"
                            quantity={1}
                            bidders={6}
                            expiration={new Date()}
                            bid={40000} />
                    </div>
                </div>
            </div>
        )
    }
}

export default Auctions;