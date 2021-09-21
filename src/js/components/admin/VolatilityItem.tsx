import React, {Component} from 'react';

import Coin from '../Coin';

interface VolatilityItemProps {
    coin:string,
    multiplier:any,
    onUpdate: (coin:string, multiplier:any) => void
}

class VolatilityItemState {
    changed:boolean;
    error:string;
    constructor() {
        this.changed = false;
        this.error = "";
    }
}

type formEvent = React.ChangeEvent<HTMLInputElement>;
class VolatilityItem extends Component<VolatilityItemProps> {
    state:VolatilityItemState;

    constructor(props:VolatilityItemProps) {
        super(props);
        this.state = new VolatilityItemState();
    }

    coinName(coin:string) {
        return coin === "himemoriluna" ? "luna" : coin;
    }
    handleChange(e:formEvent) {
        let val = e.target.value;
        this.props.onUpdate(this.props.coin, val);
        this.setState({changed:true, error:""});
    }
    updateVolatility() {
        let multiplier = this.props.multiplier;
        if(multiplier === "") {
            this.setState({error:"Invalid multiplier"});
            return;
        }
        let m = parseFloat(multiplier);
        if(isNaN(m)) {
            this.setState({error:"Invalid multiplier"});
            return;
        }
        this.props.onUpdate(this.props.coin, m);
        fetch('/api/setVolatilityMultiplier', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                coin:this.props.coin, 
                multiplier:m
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.setState({
                    error:"",
                    changed:false
                })
            } else {
                this.setState({
                    error:data.message,
                    changed:false
                });
                this.props.onUpdate(this.props.coin, 1);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }
    getMultiplierStyle() {

        let m = this.props.multiplier;
        if(typeof(m) === "string") {
            m = parseFloat(m);
        }
        let width = m > 2 ? 100 : (m / 2) * 100;
        
        let color;
        if(width < 10) {
            color = "rgb(73, 81, 202)";
        } else if(width < 25) {
            color = "rgb(56, 119, 235)";
        } else if(width < 40) {
            color = "rgb(50, 194, 238)";
        } else if(width <= 50) {
            color = "rgb(41, 255, 130)";
        } else if(width < 65) {
            color = "rgb(149, 255, 62)";
        } else if(width < 80) {
            color = "rgb(255, 236, 63)";
        } else if(width < 90) {
            color = "rgb(255, 156, 63)";
        } else {
            color = "rgb(255, 63, 63)";
        }

        return {
            width:`${width}%`,
            background:`${color}`
        }

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
                        <input 
                            type="text"
                            value={this.props.multiplier} 
                            className="volatility-input"
                            onChange={(e:formEvent) => this.handleChange(e)}/>
                    </div>
                </td>
                <td>
                    <div className="radio-outer flex center-child">
                        <div className="multiplier-indicator">
                            <div 
                                className="multiplier-indicator-inner"
                                style={this.getMultiplierStyle()}></div>
                        </div>
                    </div>
                </td>
                <td>
                    {
                        this.state.changed ? 
                        <div className="flex center-child">
                            <div 
                                className="volatility-update-btn"
                                onClick={() => this.updateVolatility()}>
                                Update
                            </div>
                        </div> : null
                    }
                </td>
                <td>
                    {
                        this.state.error !== "" ? 
                        <div className="flex center-child">
                            <div className="volatility-error">
                                {this.state.error}
                            </div>
                        </div> : null
                    }
                </td>
            </tr>
        )
    }
}

export default VolatilityItem;