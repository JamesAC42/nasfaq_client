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

    returnImage(coin:string) {
        if(coin === "blank") return <FaUserAlt />;
        return <img src={iconMap[coin]} alt={coin}/>
        /*
        if(coin === "rushia") {
            return(
                <div>
                    <img src={iconMap[coin]} alt="rushia_butterfly" />
                    <img src={iconMap["calliope"]} className="small-calli" alt="rushia_skull" />
                </div>
            )
        } else {
        }
        */
    }

    render() {
        let className = this.props.className !== undefined ?
            this.props.className : "";
        return(
            <div 
                className={`coin ${this.props.name} ${className}`}
                title={this.props.name}
                onClick={() => {
                    if(this.props.onClick) this.props.onClick();
                }}>
                {
                    this.returnImage(this.props.name)
                }
            </div>
        )
    }
}

export default Coin;