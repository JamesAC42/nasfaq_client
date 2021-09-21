import React, { Component } from 'react';
import {connect} from 'react-redux';
import {COOLDOWN} from './constants';
import { IWallet } from '../interfaces/IWallet';
import { ICoinData, ICoinDataCollection } from '../interfaces/ICoinInfo';
import getTransactionStatus from '../getTransactionStatus';
import { Order, TransactionType } from "../interfaces/ITransaction";
import { tradeCoins } from '../TradeActions';

import checkStorage from '../checkStorage';

import { 
    BiPlus,
    BiMinus
} from 'react-icons/bi';
import { multicoinSaveActions } from '../actions/actions';

interface TradeButtonProps {
    type: TransactionType;
    disabled: boolean;
    timeRemaining: number;
    quantity: number;
    updateQuantity: (quant:number) => void;
    trade: () => void;
}

class TradeButtonState {
    mouseDown: boolean;
    constructor() {
        this.mouseDown = false;
    }
}

class TradeButton extends Component<TradeButtonProps> {
    state: TradeButtonState;
    constructor(props:TradeButtonProps) {
        super(props);
        this.state = new TradeButtonState();
    }
    buttonPress() {
        this.setState({mouseDown:true})
    }
    buttonRelease() {
        this.setState({mouseDown:false})
    }
    changeQuantity(dir:number) {
        this.props.updateQuantity(this.props.quantity + dir);
    }
    render() {
        const buttonActive = this.state.mouseDown ? "active" : "";
        let timerWidth = 0;
        let remainingString = '';
        if(this.props.timeRemaining) {
            const e = (1000 * 60 * COOLDOWN);
            timerWidth = Math.round((this.props.timeRemaining / e) * 10000) / 100;
            
            let secondsRemaining = Math.floor(this.props.timeRemaining / 1000) % 60;
            let minutesRemaining = Math.floor((this.props.timeRemaining / 1000) / 60);
            if(minutesRemaining > 0) {
                remainingString += minutesRemaining + " minute";
                if(minutesRemaining > 1) remainingString += "s";
                if(secondsRemaining > 0) {
                    remainingString += " and ";
                }
            }
            if(secondsRemaining > 0) {
                remainingString += secondsRemaining + " second";
                if(secondsRemaining > 1) remainingString += "s";
            }
            if(this.props.timeRemaining > 0) {
                remainingString += " remaining";
            }
        }

        let classNameColor = this.props.type === TransactionType.BUY ? 'green' : 'red';
        let classNameType = this.props.type === TransactionType.BUY ? 'buy' : 'sell';
        let classDisabled = this.props.disabled ? 'disabled' : '';
        let className = `button ${classNameColor} inverse ${classDisabled} umami--click--${classNameType} ${buttonActive}`;
        
        return(
            <div 
                className={className}
                title={remainingString}>
                <div className="button-inner">
                    <div className="button-background">
                    </div>
                    {
                        this.props.quantity > 1 ?
                        <div 
                            className="button-decrement"
                            onClick={() => this.changeQuantity(-1)}><BiMinus /></div>
                        : null
                    }
                    {
                        this.props.quantity < 5 ?
                        <div 
                            className="button-increment"
                            onClick={() => this.changeQuantity(1)}><BiPlus /></div>
                        : null
                    }
                    <div 
                        className="button-container"
                        onClick={() => {
                            this.props.trade()
                        }}
                        onMouseDown={() => this.buttonPress()}
                        onMouseUp={() => this.buttonRelease()}
                        onMouseLeave={() => this.buttonRelease()}>
                        {
                            this.props.type === TransactionType.BUY ?
                            "BUY" : "SELL"
                        }
                        {
                            this.props.quantity > 1 ?
                            " " + this.props.quantity : null
                        }
                        <div 
                            className="button-timer"
                            style={{
                                width: timerWidth + "%"
                            }}>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state:any, props:any) => ({
    stats: state.stats,
    userinfo: state.userinfo,
    settings: state.settings,
    multicoinSave: state.multicoinSave
});

const mapDispatchToProps = {
    setMulticoinSave: multicoinSaveActions.setMulticoinSave
}

interface TradeButtonWrapperProps {
    coin:string,
    className?:string,
    userinfo: {
        wallet:IWallet,
        muted:any,
        verified:boolean,
        brokerFeeCredits:number,
        loaded:boolean
    },
    stats: {
        coinInfo: ICoinDataCollection
    },
    settings: {
        marketSwitch:boolean
    },
    multicoinSave: any,
    setMulticoinSave: (multicoinSave:any) => {}
}

class TradeButtonWrapperState {
    buyDisabled:boolean;
    sellDisabled: boolean;
    timeRemaining: number;
    constructor() {
        this.buyDisabled = true;
        this.sellDisabled = true;
        this.timeRemaining = 0;
    }
}


class TradeButtonWrapperBind extends Component<TradeButtonWrapperProps> {
    intervalId:any;
    state:TradeButtonWrapperState;
    constructor(props:TradeButtonWrapperProps) {
        super(props);
        this.state = new TradeButtonWrapperState();
    }
    
    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    buy() {

        if(this.state.buyDisabled || this.state.timeRemaining > 0) return;
        let name = this.props.coin;
        if(name === "luna") name = "himemoriluna";
        let order:Order = { 
            coin:name,
            quantity:this.props.multicoinSave[this.filterName(this.props.coin)].buy,
            type:TransactionType.BUY
        }

        tradeCoins([order]);
    }

    sell() {

        if(this.state.sellDisabled || this.state.timeRemaining > 0) return;
        let name = this.props.coin;
        if(name === "luna") name = "himemoriluna";
        let order:Order = { 
            coin:name,
            quantity:this.props.multicoinSave[this.filterName(this.props.coin)].sell,
            type:TransactionType.SELL
        }
        tradeCoins([order]);
    }

    componentDidMount() {
        this.updateTransactionStatus();
        this.intervalId = setInterval(() => {
            this.updateTransactionStatus();
        }, 500);
    }

    componentDidUpdate(prevProps:TradeButtonWrapperProps) {
        if(!this.props.userinfo.loaded) return;
        if(this.props.userinfo.wallet.balance 
            !== prevProps.userinfo.wallet.balance) {
            this.updateTransactionStatus();
        }
    }

    updateTransactionStatus() {

        if(!this.props.userinfo.loaded) return;
        
        let showMuted = false;
        let muted:any = this.props.userinfo.muted;
        if(this.props.userinfo.muted !== null) {
            muted = JSON.parse(muted);
            if(muted.until < new Date().getTime()) {
                showMuted = false;
            } else {
                showMuted = true;
            }
        }
        
        let name = this.props.coin;
        if(name === "luna") name = "himemoriluna";
        let coinData:ICoinData = this.props.stats.coinInfo.data[name];
        if(coinData === undefined) return;

        let {buy, sell} = this.props.multicoinSave[this.filterName(this.props.coin)];
        let {
            timeRemaining,
            buyDisabled,
            sellDisabled
        } = getTransactionStatus(
            this.props.userinfo.wallet,
            coinData,
            name,
            this.props.userinfo.verified,
            showMuted,
            buy,
            sell,
            this.props.userinfo.brokerFeeCredits,
            this.props.settings.marketSwitch
        )

        this.setState({
            timeRemaining,
            buyDisabled,
            sellDisabled
        })
    }

    filterName(name:string) {
        return name === "himemoriluna" ? "luna" : name;
    }

    updateQuantity(type:TransactionType, q:number) {
        let multicoinSave:any = {...this.props.multicoinSave};
        if(type === TransactionType.SELL) {
            multicoinSave[this.filterName(this.props.coin)].sell = q;
        } else {
            multicoinSave[this.filterName(this.props.coin)].buy = q;
        }
        this.props.setMulticoinSave(multicoinSave);
        if(checkStorage()) {
            localStorage.setItem("nasfaq:multicoinSave", JSON.stringify(multicoinSave));
        }
    }

    render() {
        if(this.props.multicoinSave[this.filterName(this.props.coin)] === undefined) return null;
        return(
            <div className={"trade-button-container " + this.props.className}>
                <TradeButton
                    type={TransactionType.BUY}
                    disabled={this.state.buyDisabled}
                    timeRemaining={this.state.timeRemaining}
                    quantity={this.props.multicoinSave[this.filterName(this.props.coin)].buy}
                    updateQuantity={(q:number) => this.updateQuantity(TransactionType.BUY, q)}
                    trade={() => this.buy()}>
                </TradeButton>
                <TradeButton
                    type={TransactionType.SELL}
                    disabled={this.state.sellDisabled}
                    timeRemaining={this.state.timeRemaining}
                    quantity={this.props.multicoinSave[this.filterName(this.props.coin)].sell}
                    updateQuantity={(q:number) => this.updateQuantity(TransactionType.SELL, q)}
                    trade={() => this.sell()}>
                </TradeButton>
            </div>
        )
    }
}

const TradeButtonWrapper = connect(
    mapStateToProps,
    mapDispatchToProps
)(TradeButtonWrapperBind);

export default TradeButtonWrapper;