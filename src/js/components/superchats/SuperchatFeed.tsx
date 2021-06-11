import React, {Component} from 'react';
import { ISuperchat } from '../../interfaces/ISuperchats';
import "../../../css/superchatfeeditem.scss";
import Superchat from './Superchat';
import Coin from '../Coin';

interface SuperchatFeedProps {
    superchats:Array<ISuperchat>
}

type scCategory = {
    coin:string,
    supers:Array<ISuperchat>
}
class SuperchatFeed extends Component<SuperchatFeedProps> {
    generateFormattedFeed():Array<scCategory> {
        let superchats = this.props.superchats;
        let categorized:Array<scCategory> = [];
        let i = 0;
        let currentCoin = null;
        while(i < superchats.length) {
            if(currentCoin !== superchats[i].coin) {
                categorized.push({
                    coin:superchats[i].coin,
                    supers:[superchats[i]]
                })
                currentCoin = superchats[i].coin;
            } else {
                categorized[categorized.length - 1].supers.push(superchats[i]);
            }
            i++;
        }
        return categorized;
    }
    filterCoin(coin:string) {
        return coin === "himemoriluna" ? "luna" : coin;
    }
    renderCategory(coinC:scCategory, index:number) {
        return(
            <table
                key={index} 
                className="superchat-feed">
                <tbody>
                {
                    coinC.supers.map((sc:ISuperchat, index:number) => 
                        <tr key={index}>
                            <td className="sc-feed-coin">
                                {
                                    index === 0 ?
                                    <Coin name={this.filterCoin(sc.coin)}/> : null
                                }
                            </td>
                            <td className="sc-feed-superchat">
                                <Superchat item={sc}>
                                    <div className="superchat-message">
                                        {sc.message}
                                    </div>
                                </Superchat>
                            </td>
                            <td className="sc-feed-timestamp">
                                {
                                    new Date(sc.timestamp).toLocaleTimeString()
                                }
                            </td>
                        </tr>
                    )
                }
                </tbody>
            </table>
        )
    }
    render() {
        return(
            <div className="superchat-feed-outer">
                {
                    this.generateFormattedFeed().map((coinC:scCategory, index:number) => 
                        this.renderCategory(coinC, index)
                    )
                }
                
                <div className="superchat-feed-spacer">
                    <Coin name={"hololive"} />
                </div>
            </div>
        )
    }
}

export default SuperchatFeed;