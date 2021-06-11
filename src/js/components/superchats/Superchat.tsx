import React, {Component} from 'react';
import { ISuperchat } from '../../interfaces/ISuperchats';
import numberWithCommas from '../../numberWithCommas';
import Coin from '../Coin';
import {PRICES_LIST, COLORS_LIST} from './superchatTypes';

interface SuperchatProps {
    item:ISuperchat
}
class Superchat extends Component<SuperchatProps> {
    getColorFromAmount(amt:number) {
        let color = COLORS_LIST[0];
        for(let i = PRICES_LIST.length - 1; i >= 0; i--) {
            if(amt >= PRICES_LIST[i]) {
                color = COLORS_LIST[i];
                break;
            }
        }
        return color;
    }
    render() {
        return(
            <div 
                className={`superchat sc-${this.getColorFromAmount(this.props.item.amount)}`}>
                <div className="superchat-donator">
                    <Coin name={this.props.item.usericon} />
                    <div className="superchat-info">
                        <div className="superchat-username">
                            {this.props.item.username}
                        </div>
                        <div className="superchat-amt">
                            ${numberWithCommas(Math.round(this.props.item.amount * 100)/100)}
                        </div>
                    </div>
                </div>
                { this.props.children }
            </div>
        )
    }
}

export default Superchat;