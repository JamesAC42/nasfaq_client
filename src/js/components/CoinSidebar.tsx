import React, { Component } from 'react';

import '../../css/coinsidebar.scss';

import { lineage } from './Icons';
import { connect } from 'react-redux';
import {IWallet} from '../interfaces/IWallet';
import Coin from './Coin';

const mapStateToProps = (state:any, props:any) => ({
    userinfo: state.userinfo
});

interface CoinSidebarProps {
    userinfo: {
        loaded: boolean,
        wallet: IWallet
    },
    activeCoins: Array<any>,
    toggleCoin: (coin:string) => {}
}

class CoinSidebarBind extends Component<CoinSidebarProps> {
    

    getActiveCoinNames() {
        const active = [...this.props.activeCoins];
        const activeNames = active.map((activeCoin:any) => {
            if((typeof activeCoin) === "string") {
                return activeCoin;
            } else {
                return activeCoin.name;
            }
        });
        return activeNames;
    }

    coinActive(coin:string) {
        const coinNames = this.getActiveCoinNames();
        if(coinNames.indexOf(coin) === -1) {
            return "inactive";
        } else {
            return "";
        }
    }

    coinOwned(coin:string) {
        if(!this.props.userinfo.loaded) return "";
        let name = coin;
        if(name === "luna") name = "himemoriluna";
        const coins = Object.keys(this.props.userinfo.wallet.coins);
        if(coins.indexOf(name) !== -1) {
            if(this.props.userinfo.wallet.coins[name].amt > 0) {
                return "owned"
            } else {
                return "";
            }
        } else {
            return "";
        }
    }

    renderGeneration(gen:Array<string>) {
        return gen.map((item:string) => 
            <div 
                id={item}
                className={`coin-container ${this.coinOwned(item)}`}
                key={item}>
                <Coin 
                    name={item}
                    className={this.coinActive(item)}
                    onClick={() => this.props.toggleCoin(item)}/>
            </div>
        )
    }

    render() {
        return(
            <div 
                className="coin-sidebar">
                {
                    lineage.map((gen:Array<string>, index:number) => 
                        <div
                            className="gen-container" 
                            key={index}>
                            {this.renderGeneration(gen)}
                            <div className="gen-spacer"></div>
                        </div>
                    )
                }
            </div>
        )
    }
}

const CoinSidebar = connect(
    mapStateToProps
)(CoinSidebarBind);

export default CoinSidebar;