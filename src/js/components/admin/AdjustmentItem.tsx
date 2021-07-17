import React, {Component} from 'react';

import Coin from '../Coin';
import AdjustmentRadio from './AdjustmentRadio';

export enum AdjustmentType {
    DEFAULT,
    NONE,
    BASE
}

interface AdjustmentItemProps {
    coin:string,
    adjustmentType:AdjustmentType,
    onUpdate: (coin:string, type:AdjustmentType) => void
}

type formEvent = React.ChangeEvent<HTMLInputElement>;
class AdjustmentItem extends Component<AdjustmentItemProps> {
    coinName(coin:string) {
        return coin === "himemoriluna" ? "luna" : coin;
    }
    handleClick(type:AdjustmentType) {
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
                            checked={this.props.adjustmentType === AdjustmentType.DEFAULT} 
                            coin={this.coinName(this.props.coin)}
                            onClick={(type:AdjustmentType) => this.handleClick(type)}
                            value={AdjustmentType.DEFAULT}/>
                    </div>
                </td>
                <td>
                    <div className="radio-outer flex center-child">
                        <AdjustmentRadio
                            checked={this.props.adjustmentType === AdjustmentType.NONE} 
                            coin={this.coinName(this.props.coin)}
                            onClick={(type:AdjustmentType) => this.handleClick(type)}
                            value={AdjustmentType.NONE}/>
                    </div>
                </td>
                <td>
                    <div className="radio-outer flex center-child">
                        <AdjustmentRadio
                            checked={this.props.adjustmentType === AdjustmentType.BASE} 
                            coin={this.coinName(this.props.coin)}
                            onClick={(type:AdjustmentType) => this.handleClick(type)}
                            value={AdjustmentType.BASE}/>
                    </div>
                </td>
            </tr>
        )
    }
}

export default AdjustmentItem;