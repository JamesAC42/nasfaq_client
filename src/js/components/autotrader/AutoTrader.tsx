import React, {Component} from 'react';

import { connect } from 'react-redux';
import { autotraderActions } from '../../actions/actions';

import {AutoTraderRule} from '../../interfaces/AutoTraderRule';
import { IWallet } from '../../interfaces/IWallet';
import storageAvailable from '../../checkStorage';
import { ICoinDataCollection } from '../../interfaces/ICoinInfo';
import getTransactionStatus from '../../getTransactionStatus';
import { Order, TransactionType } from "../../interfaces/ITransaction";
import { tradeCoins } from '../../TradeActions';

const mapStateToProps = (state:any, props:any) => ({
    autotrader: state.autotrader,
    userinfo:state.userinfo,
    stats:state.stats,
    settings:state.settings,
    session:state.session
});

const mapDispatchToProps = {
    setRunning:autotraderActions.setRunning,
    setRules:autotraderActions.setRules,
    setNextTradeTime:autotraderActions.setNextTradeTime,
    setExpectedBalance:autotraderActions.setExpectedBalance,
    setPendingOrder:autotraderActions.setPendingOrder
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
        loaded:boolean,
        brokerFeeCredits:number
    },
    stats: {
        coinInfo:ICoinDataCollection
        brokerFee:number;
    },
    settings: {
        marketSwitch:boolean
    },
    session: {
        loggedin:boolean
    },
    setRunning: (running:boolean) => {}
    setRules: (rules:Array<AutoTraderRule>) => {},
    setNextTradeTime: (nextTradeTime:number) => {},
    setExpectedBalance: (expectedBalance:number) => {},
    setPendingOrder: (pendingOrder:Array<Order>) => {},
}

class AutoTraderBind extends Component<AutoTraderProps> {
    timeout:any;
    failsafe:any;
    constructor(props:AutoTraderProps) {
        super(props);
        this.timeout = undefined;
        this.failsafe = undefined;
    }
    filterName(name:string) {
        return (name === "luna") ? "himemoriluna" : name;
    }
    canTrade(coin:string, runningBalance:number) {

        let name = this.filterName(coin);

        let pseudoWallet = {...this.props.userinfo.wallet};
        pseudoWallet.balance = runningBalance;

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

        let quantity = 1;
        this.props.autotrader.rules.forEach((r:AutoTraderRule) => {
            if(r.coin === coin && r.stepQuantity !== undefined) {
                quantity = r.stepQuantity;
            }
        })

        return getTransactionStatus(
            pseudoWallet,
            this.props.stats.coinInfo.data[name],
            name,
            this.props.userinfo.verified,
            showMuted,
            quantity,
            quantity,
            this.props.userinfo.brokerFeeCredits,
            this.props.settings.marketSwitch,
            this.props.stats.brokerFee
        )
    }
    scheduleTrades() {
        if(!this.props.session.loggedin) return;
        if(!this.props.userinfo.loaded) return;
        const rules = [...this.props.autotrader.rules];

        let wallet:IWallet = {...this.props.userinfo.wallet};
        let now = new Date().getTime();

        let maxCooldown = 0;
        for(let i = 0; i < rules.length; i++) {

            let name = this.filterName(rules[i].coin);

            let timestamp = 0;
            if (wallet.coins[name] !== undefined) {
                timestamp = wallet.coins[name].timestamp;
            }

            let nextTrade = timestamp + (1000 * 60 * 10);
            let delay = nextTrade - now;

            if(delay > maxCooldown) {
                maxCooldown = delay;
            }
        }

        this.props.setNextTradeTime(new Date().getTime() + maxCooldown);

        let runningBalance = wallet.balance;

        let orders:Array<Order> = [];

        //console.log(`Autotrader: Generating order list...`);
        rules.forEach((rule:AutoTraderRule) => {

            let name = this.filterName(rule.coin);
            let {
                buyDisabled,
                sellDisabled,
                timeRemaining
            } = this.canTrade(name, runningBalance);

            //console.log(`Autotrader for ${name}: buyDisabled: ${buyDisabled}, sellDisabled: ${sellDisabled}, timeRemaining: ${timeRemaining}`)
            let currentAmount;
            if(wallet.coins[name] === undefined) {
                currentAmount = 0;
            } else {
                currentAmount = wallet.coins[name].amt;
            }

            //console.log(`Autotrader for ${name}: currentAmount: ${currentAmount}, targetQuantity: ${rule.targetQuantity}`);
            if((timeRemaining - maxCooldown) <= 0) {
                let step = rule.stepQuantity !== undefined ? rule.stepQuantity : 1;
                if(rule.type === TransactionType.BUY) {
                    if(!buyDisabled && rule.targetQuantity > currentAmount) {
                        //console.log(`Autotrader for ${name}: Adding to order list...`)
                        let quantity = Math.min(rule.targetQuantity - currentAmount, step);
                        runningBalance -= (1 + this.props.stats.brokerFee + .1 * (quantity ===  1 ? 0 : quantity)) * (quantity * this.props.stats.coinInfo.data[name].price);
                        orders.push({coin:name, quantity, type:TransactionType.BUY})
                    }
                } else if(rule.type === TransactionType.SELL) {
                    if(!sellDisabled && rule.targetQuantity < currentAmount) {
                        //console.log(`Autotrader for ${name}: Adding to order list...`)
                        let quantity = Math.min(currentAmount - rule.targetQuantity, step);
                        runningBalance += (1 - .1 * (quantity ===  1 ? 0 : quantity)) * (quantity * this.props.stats.coinInfo.data[name].saleValue);
                        orders.push({coin:name, quantity, type:TransactionType.SELL})
                    }
                }
            }
        });

        this.timeout = setTimeout(() => {
            //console.log(`Autotrader: Order list: `, orders);

            if(orders.length > 0) {
                //console.log(`Autotrader: Trading...`);
                tradeCoins(orders);
            }
        }, maxCooldown + 100);

        this.props.setExpectedBalance(runningBalance);
        this.props.setPendingOrder(orders);

        clearTimeout(this.failsafe);
        this.failsafe = setTimeout( this.scheduleTrades.bind(this), maxCooldown + 60150);
    }

    componentDidUpdate(prevProps:AutoTraderProps) {
        if(
            prevProps.autotrader.running !== this.props.autotrader.running ||
            prevProps.autotrader.rules !== this.props.autotrader.rules ||
            prevProps.userinfo.wallet !== this.props.userinfo.wallet) {
            clearTimeout(this.timeout);
            clearTimeout(this.failsafe);
            if(this.props.autotrader.running) {
                this.scheduleTrades();
            }
        }
        if(!prevProps.userinfo.loaded && this.props.userinfo.loaded) {
            this.loadSave();
        }
        if(prevProps.userinfo.loaded && !this.props.userinfo.loaded) {
            clearTimeout(this.timeout);
            clearTimeout(this.failsafe);
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
    componentWillUnmount() {
        clearTimeout(this.timeout);
        clearTimeout(this.failsafe);
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
