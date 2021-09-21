import React, {Component} from 'react';

import Coin from '../Coin';
import AdjustmentRadio from './AdjustmentRadio';

interface AdjustmentItemProps {
    coin:string,
    payState:string,
    onUpdate: (coin:string, type:string) => void
}

type formEvent = React.ChangeEvent<HTMLInputElement>;
class DividendToggleItem extends Component<AdjustmentItemProps> {
    coinName(coin:string) {
        return coin === "himemoriluna" ? "luna" : coin;
    }
    handleClick(type:string) {
        this.props.onUpdate(this.props.coin, type);
    }
    render() {
        return(
            <tr 
                className="adjustment-coin-row">
                <td className="adjustment-coin-row-coin">
                    <Coin name={this.coinName(this.props.coin)}/>
                </td>
                <td>{this.coinName(this.props.coin).toUpperCase()}</td>
                <td>
                    <div className="radio-outer flex center-child">
                        <AdjustmentRadio
                            checked={this.props.payState === '1'} 
                            coin={this.coinName(this.props.coin)}
                            onClick={(payState:string) => this.handleClick(payState)}
                            value={'1'}/>
                    </div>
                </td>
                <td>
                    <div className="radio-outer flex center-child">
                        <AdjustmentRadio
                            checked={this.props.payState === '0'} 
                            coin={this.coinName(this.props.coin)}
                            onClick={(payState:string) => this.handleClick(payState)}
                            value={'0'}/>
                    </div>
                </td>
            </tr>
        )
    }
}

export default DividendToggleItem;