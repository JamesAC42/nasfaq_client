import React, { Component } from 'react';

import { connect } from 'react-redux';
import Coin from '../Coin';
import { IWallet } from '../../interfaces/IWallet';
import numberWithCommas from '../../numberWithCommas';

import Button from '../Button';

import { 
    BiUpArrow,
    BiDownArrow
} from 'react-icons/bi';
import {
    GoDash
} from 'react-icons/go';
import { ICoinData, ICoinDataCollection, ICoinHistory } from '../../interfaces/ICoinInfo';
import getTransactionStatus from '../../getTransactionStatus';

const mapStateToProps = (state:any, props:any) => ({
    stats: state.stats,
    userinfo: state.userinfo,
    settings: state.settings
});

export interface ICoinItem {
    name:string,
    amt:number,
    timestamp:number,
    price:number,
    prevPrice:number
}

interface AssetProps {
    coin:string,
    verified: boolean,
    muted:boolean,
    userinfo: {
        wallet:IWallet
    },
    stats: {
        stats: {
            [key:string]:any
        },
        coinHistory: ICoinHistory,
        coinInfo: ICoinDataCollection
    },
    settings: {
        marketSwitch:boolean
    }
}

class AssetState {
    buyDisabled:boolean;
    sellDisabled:boolean;
    timeRemaining:number;
    constructor() {
        this.timeRemaining = 0;
        this.buyDisabled = true;
        this.sellDisabled = true;
    }
}

class AssetBind extends Component<AssetProps> {
    state:AssetState;
    intervalId:any;

    constructor(props:AssetProps) {
        super(props);
        this.state = new AssetState();
    }
    
    buy(coin:string) {
        if(this.state.buyDisabled || this.state.timeRemaining > 0) return;
        
        let name = coin;
        if(name === "luna") name = "himemoriluna";
        fetch('/api/buyCoin/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                coin: name
            })
        })
        .then(response => response.json())
        .then(data => {
            if(!data.success) {
                console.log(data);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    sell(coin:string) {
        if(this.state.sellDisabled || this.state.timeRemaining > 0) return;
        let name = coin;
        if(name === "luna") name = "himemoriluna";
        fetch('/api/sellCoin/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                coin:name
            })
        })
        .then(response => response.json())
        .then(data => {
            if(!data.success) {
                console.log(data);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    componentDidMount() {
        this.updateTransactionStatus();
        this.intervalId = setInterval(() => {
            this.updateTransactionStatus();
        }, 200);
    }

    componentDidUpdate(prevProps:AssetProps) {
        if(this.props.userinfo.wallet.balance 
            !== prevProps.userinfo.wallet.balance) {
            this.updateTransactionStatus();
        }
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    updateTransactionStatus() {
        
        let name = this.props.coin;
        let coinData:ICoinData = this.props.stats.coinInfo.data[name];
        let {
            timeRemaining,
            buyDisabled,
            sellDisabled
        } = getTransactionStatus(
            this.props.userinfo.wallet,
            coinData,
            name,
            this.props.verified,
            this.props.muted,
            this.props.settings.marketSwitch
        )

        this.setState({
            timeRemaining,
            buyDisabled,
            sellDisabled
        })
    }

    priceDirectionIcon(delta:number) {
        if(delta === 0) {
            return (
                <GoDash style={{verticalAlign: 'middle'}}/>
            )
        }
        if(delta < 0) {
            return(
                <BiDownArrow style={{verticalAlign: 'middle'}}/>
            )
        } else {
            return(
                <BiUpArrow style={{verticalAlign: 'middle'}}/>
            )
        }
    }

    render(){
        
        let name = this.props.coin;
        let coinData:ICoinData = this.props.stats.coinInfo.data[this.props.coin];
        if(name === "himemoriluna") name = "luna";

        const ask = coinData.price;
        const bid = coinData.saleValue;
        let prevPrice;
        let hist = this.props.stats.coinHistory[this.props.coin];
        if(hist === undefined) {
            prevPrice = ask;
        } else {
            prevPrice = hist.price.slice(-1)[0];
        }

        let amt = this.props.userinfo.wallet.coins[this.props.coin].amt;

        const delta = Math.round((ask - prevPrice)*100) / 100;
        const deltaP = Math.round((delta / ask) * 10000) / 100;
        let dir = delta > 0 ? "green" : "red";
        if(delta === 0) dir = "stagnant";

        const meanPurchasePrice = Math.round(this.props.userinfo.wallet.coins[this.props.coin].meanPurchasePrice * 100) / 100;
        
        let buyDisabled = "";
        let sellDisabled = "";
        if(this.state.buyDisabled) buyDisabled = "disabled";
        if(this.state.sellDisabled) sellDisabled = "disabled";

        return(
            <div className="asset-row">
                <div className="asset-item">
                    <Coin name={name} />
                    <div className="asset-item-name">{name.toUpperCase()}</div>
                </div>
                <div className="asset-shares">
                    {amt}
                </div>
                <div className="asset-value">
                    <div className="asset-value-inner">
                        <div 
                            className={"asset-value-data " + dir}
                            title={`Mean purchase price: ${meanPurchasePrice}`}>
                            ${numberWithCommas(ask)}
                        </div>
                    </div>
                </div>
                <div className="asset-value">
                    <div className="asset-value-inner">
                        <div
                            className={"asset-value-data " + dir}>
                            ${numberWithCommas(bid)}
                        </div>
                    </div>
                </div>
                
                <div className="asset-delta">
                    <div className={"asset-delta " + dir}>
                        <span className="arrow">
                            {this.priceDirectionIcon(delta)}
                        </span>
                        ${numberWithCommas(Math.abs(delta))}
                    </div>
                    <div className={"asset-percent " + dir}>
                        <span className="arrow">
                            {this.priceDirectionIcon(delta)}
                        </span>
                        {numberWithCommas(Math.abs(deltaP))}%
                    </div>
                </div>
                <div className="asset-actions">
                    <Button
                        timeRemaining={this.state.timeRemaining}
                        className={`green inverse ${buyDisabled} umami--click--buy`}
                        onClick={() => this.buy(this.props.coin)}>
                            BUY
                    </Button>
                    <Button 
                        timeRemaining={this.state.timeRemaining}
                        className={`red inverse ${sellDisabled} umami--click--sell`}
                        onClick={() => this.sell(this.props.coin)}>
                            SELL
                    </Button>
                </div>
            </div>
        )
    }
}

const Asset = connect(
    mapStateToProps
)(AssetBind);

export default Asset;