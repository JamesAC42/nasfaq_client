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
    intervals:any;
    constructor(props:AutoTraderProps) {
        super(props);
        this.intervals = {};
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

        for(let i = 0; i < rules.length; i++) {

            let rule:AutoTraderRule = rules[i];
            const {coin, type, targetQuantity} = rule;
            this.intervals[coin] =  setInterval(() => {
                let wallet:IWallet = {...this.props.userinfo.wallet};
                let {
                    buyDisabled,
                    sellDisabled,
                    timeRemaining
                } = this.canTrade(coin);

                let name = this.filterName(coin);
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
                            }, i * 100);
                        }
                    } else if(type === TransactionType.SELL) {
                        if(!sellDisabled && targetQuantity < currentAmount) {
                            setTimeout(() => {
                                sellCoin(name);
                            }, i * 100)
                        }
                    }
                }
            }, 5000);
        }
    }
    componentDidUpdate(prevProps:AutoTraderProps) {
        if(prevProps.autotrader.running !== this.props.autotrader.running) {
            this.clearIntervals();
            if(this.props.autotrader.running) {
                this.makeTrades();
            }
        }
        if(prevProps.autotrader.rules !== this.props.autotrader.rules) {
            this.clearIntervals();
            if(this.props.autotrader.running) {
                this.makeTrades();
            }
        }
        if(!prevProps.userinfo.loaded && this.props.userinfo.loaded) {
            this.loadSave();
        }
        if(prevProps.userinfo.loaded && !this.props.userinfo.loaded) {
            this.clearIntervals();
        }
    }
    loadSave() {
        if(storageAvailable()) {
            const storageAutoTrader = localStorage.getItem("nasfaq:autotrader");
            if(storageAutoTrader !== null) {
                const storedData = JSON.parse(storageAutoTrader);
                const {rules} = storedData;
                this.props.setRules(rules);
                this.props.setRunning(false);
            }
        }
    }
    componentDidMount() {
        if(this.props.userinfo.loaded) {
            this.loadSave();
        }
    }
    clearIntervals() {
        Object.keys(this.intervals).forEach((coin:string) => {
            if(this.intervals[coin] !== undefined) {
                clearInterval(this.intervals[coin]);
                delete this.intervals[coin];
            }
        });
    }
    componentWillUnmount() {
        this.clearIntervals();
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