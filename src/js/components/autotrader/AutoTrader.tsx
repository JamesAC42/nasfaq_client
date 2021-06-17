import React, {Component} from 'react';

import { connect } from 'react-redux';
import { autotraderActions } from '../../actions/actions';

import {AutoTraderRule} from '../../interfaces/AutoTraderRule';
import { IWallet } from '../../interfaces/IWallet';
import storageAvailable from '../../checkStorage';
import { ICoinDataCollection } from '../../interfaces/ICoinInfo';
import getTransactionStatus from '../../getTransactionStatus';
import { TransactionType } from '../../interfaces/ITransaction';
import { buyCoin, sellCoin } from '../../TradeActions';

const mapStateToProps = (state:any, props:any) => ({
    autotrader: state.autotrader,
    userinfo:state.userinfo,
    stats:state.stats,
    settings:state.settings,
    session:state.session
});

const mapDispatchToProps = {
    setRunning:autotraderActions.setRunning,
    setRules:autotraderActions.setRules
}

interface AutoTraderProps {
    autotrader: {
        running:boolean,
        rules:Array<AutoTraderRule>
    },
    userinfo: {
        wallet:IWallet,
        verified:boolean,
        muted:any,
        loaded:boolean
    },
    stats: {
        coinInfo:ICoinDataCollection
    },
    settings: {
        marketSwitch:boolean
    },
    session: {
        loggedin:boolean
    },
    setRunning: (running:boolean) => {}
    setRules: (rules:Array<AutoTraderRule>) => {},
}

class AutoTraderBind extends Component<AutoTraderProps> {
    intervalId:any;
    constructor(props:AutoTraderProps) {
        super(props);
    }
    filterName(name:string) {
        return (name === "luna") ? "himemoriluna" : name;
    }
    canTrade(coin:string) {
        
        let name = this.filterName(coin);

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

        return getTransactionStatus(
            this.props.userinfo.wallet,
            this.props.stats.coinInfo.data[name],
            name,
            this.props.userinfo.verified,
            showMuted,
            this.props.settings.marketSwitch
        )
    }
    makeTrades() {
        if(!this.props.session.loggedin) return;
        if(!this.props.userinfo.loaded) return;
        const rules = [...this.props.autotrader.rules];

        let wallet:IWallet = {...this.props.userinfo.wallet};
        let delayT = 0;
        for(let i = 0; i < rules.length; i++) {
            let rule:AutoTraderRule = rules[i];
            const {coin, type, targetQuantity} = rule;
            let {
                buyDisabled,
                sellDisabled,
                timeRemaining
            } = this.canTrade(coin);
            let name = coin === "luna" ? "himemoriluna" : coin;

            let currentAmount;
            if(wallet.coins[name] === undefined) {
                currentAmount = 0;
            } else {
                currentAmount = wallet.coins[name].amt;
            }

            if(timeRemaining === 0) {
                if(type === TransactionType.BUY) {
                    if(!buyDisabled && targetQuantity > currentAmount) {
                        setTimeout(() => {
                            buyCoin(name);
                        }, (delayT++) * 1000);
                    }
                } else if(type === TransactionType.SELL) {
                    if(!sellDisabled && targetQuantity < currentAmount) {
                        setTimeout(() => {
                            sellCoin(name);
                        }, (delayT++) * 1000);
                    }
                }
            }
        }
    }
    componentDidUpdate(prevProps:AutoTraderProps) {
        if(prevProps.autotrader.running !== this.props.autotrader.running) {
            if(this.props.autotrader.running) {
                this.intervalId = setInterval(() => {
                    this.makeTrades();
                }, 5000);
            } else {
                clearInterval(this.intervalId);
            }
        }
        if(!prevProps.userinfo.loaded && this.props.userinfo.loaded) {
            this.loadSave();
        }
    }
    loadSave() {
        if(storageAvailable()) {
            const storageAutoTrader = localStorage.getItem("nasfaq:autotrader");
            if(storageAutoTrader !== null) {
                const storedData = JSON.parse(storageAutoTrader);
                const {running, rules} = storedData;
                this.props.setRules(rules);
                this.props.setRunning(running);
            }
        }
    }
    componentDidMount() {
        if(this.props.userinfo.loaded) {
            this.loadSave();
        }
    }
    componentWillUnmount() {
        if(this.intervalId !== undefined) {
            clearInterval(this.intervalId);
        }
    }
    render() {
        if(!this.props.session.loggedin) return null;
        if(!this.props.userinfo.loaded) return null;
        return (
            <div></div>
        );
    }
}

const AutoTrader = connect(
    mapStateToProps,
    mapDispatchToProps
)(AutoTraderBind);

export default AutoTrader;