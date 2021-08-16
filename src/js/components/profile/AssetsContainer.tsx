import React, {Component} from 'react';

import Asset from './ProfileAsset';

interface AssetsContainerProps {
    uniqueAssets:number,
    coins:Array<any>,
    showMuted:boolean,
    verified:boolean
}

class AssetsContainer extends Component<AssetsContainerProps> {

    render() {
        return(
            <div className="container-section">
                <div className="section-background"></div>
                <div className="section-content">
                    <div className="header">
                        My Assets
                    </div>
                    {
                        this.props.uniqueAssets > 0 ?
                        <div className="assets">
                            <div className="asset-header">
                                <div className="header-name"></div>
                                <div className="header-shares">My Shares</div>
                                <div className="header-value">Ask</div>
                                <div className="header-value">Bid</div>
                                <div className="header-delta"></div>
                                <div className="header-spacer"></div>
                            </div>
                            {
                                this.props.coins.map((item:any, index:any) =>
                                    <Asset
                                        coin={item}
                                        muted={this.props.showMuted}
                                        key={index}
                                        verified={this.props.verified}/>
                                )
                            }
                        </div>
                        :
                        <div className="no-assets">
                            You don't own any coins!
                        </div>
                    }
                </div>
            </div>
        )
    }
}

export default AssetsContainer;