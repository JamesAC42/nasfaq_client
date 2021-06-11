import React, { Component } from 'react';
import iconMap from './Icons';

import {
    FaUserAlt
} from 'react-icons/fa';

class CoinProps {
    name: string;
    className?: string;
    onClick?: () => any;
    constructor() {
        this.name = "";
        this.className = "";
        this.onClick = () => {};
    }
}

class Coin extends Component<CoinProps> {

    render() {
        let className = this.props.className !== undefined ?
            this.props.className : "";
        return(
            <div 
                className={`flex center-child coin ${this.props.name} ${className}`}
                title={this.props.name}
                onClick={() => {
                    if(this.props.onClick) this.props.onClick();
                }}>
                {
                    this.props.name === "blank" ?
                    <FaUserAlt />
                    :
                    <img src={iconMap[this.props.name]} alt={this.props.name}/>
                }
            </div>
        )
    }
}

export default Coin;