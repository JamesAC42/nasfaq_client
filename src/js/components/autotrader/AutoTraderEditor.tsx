import React, {Component} from "react";
import '../../../css/autotrader.scss';
import Coin from "../Coin";

import { autotraderActions } from '../../actions/actions';
import {connect} from 'react-redux';

import {AutoTraderRule} from '../../interfaces/AutoTraderRule';
import ToggleSwitch from '../ToggleSwitch';
import {DragDropContext, Droppable } from 'react-beautiful-dnd';

import {lineage} from '../Icons';
import {
    MdClose
} from 'react-icons/md';
import {
    FiChevronDown,
    FiChevronUp
} from 'react-icons/fi';
import { ICoinDataCollection } from "../../interfaces/ICoinInfo";
import { IWallet } from "../../interfaces/IWallet";
import { TransactionType } from "../../interfaces/ITransaction";
import numberWithCommas from "../../numberWithCommas";
import storageAvailable from "../../checkStorage";
import TradeRuleItem from "./TradeRuleItem";

const mapStateToProps = (state:any, props:any) => ({
    autotrader: state.autotrader,
    session:state.session,
    userinfo:state.userinfo,
    stats:state.stats
});

const mapDispatchToProps = {
    setRunning:autotraderActions.setRunning,
    setRules:autotraderActions.setRules
}

interface AutoTraderEditorProps {
    autotrader: {
        running:boolean,
        rules:Array<AutoTraderRule>,
        nextTradeTime:number
    },
    stats: {
        coinInfo: ICoinDataCollection
    },
    userinfo: {
        wallet: IWallet,
        loaded:boolean
    },
    session: {
        loggedin: boolean
    },
    toggleVisible: () => void,
    setRunning: (running:boolean) => {}
    setRules: (rules:Array<AutoTraderRule>) => {},
}

class AutoTraderEditorState {
    showInfo:boolean;
    timeRemaining:{minutes:number, seconds:number};
    constructor() {
        this.showInfo = false;
        this.timeRemaining = {minutes:0, seconds:0};
    }
}

class AutoTraderEditorBind extends Component<AutoTraderEditorProps> {

    state:AutoTraderEditorState;
    interval:any;
    constructor(props:AutoTraderEditorProps) {
        super(props);
        this.state = new AutoTraderEditorState();
    }

    onDragEnd = (result:any) => {
        const {destination, source} = result;
        if(!destination) return;
        if(
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) return;
        
        let rulesCopy = [...this.props.autotrader.rules];
        let oldRule = {...rulesCopy[source.index]};
        rulesCopy.splice(source.index, 1);
        rulesCopy.splice(destination.index, 0, oldRule);
        this.props.setRules(rulesCopy);

        this.saveRules(rulesCopy, this.props.autotrader.running);
    }

    saveRules(rules:any, running:boolean) {
        if(storageAvailable()) {
            localStorage.setItem("nasfaq:autotrader", JSON.stringify({
                rules,
                running
            }))
        }
    }

    rulesContainCoin(coin:string) {
        let rules = [...this.props.autotrader.rules];
        let index = -1;
        rules.forEach((r:AutoTraderRule, i:number) => {
            if(r.coin === coin) index = i;
        });
        return index;
    }

    toggleCoin(coin:string) {

        let rules = [...this.props.autotrader.rules];
        let index = this.rulesContainCoin(coin);
        if(index === -1) {
            let currentQuant = this.getMyQuant(coin);
            rules.push({
                coin,
                type:TransactionType.BUY,
                stepQuantity:1,
                targetQuantity:currentQuant
            });
        } else {
            rules.splice(index, 1);
        }

        this.props.setRules(rules);
        this.saveRules(rules, this.props.autotrader.running);

    }

    clearAllCoins() {
        let newRules:Array<AutoTraderRule> = [];
        this.props.setRules(newRules);
        this.saveRules(newRules, this.props.autotrader.running);
    }

    toggleAutoTrader(setTo?:boolean) {
        let newStatus = setTo === undefined ?
            !this.props.autotrader.running : setTo;
        this.props.setRunning(newStatus);
        this.saveRules(this.props.autotrader.rules, newStatus);
    }

    setTargetQuantity(index:number, quantity:number) {
        let rules = [...this.props.autotrader.rules];
        rules[index].targetQuantity = quantity;
        let myQuant = this.getMyQuant(rules[index].coin);
        if(quantity < myQuant) {
            rules[index].type = TransactionType.SELL;
        } else if(quantity > myQuant) {
            rules[index].type = TransactionType.BUY;
        }
        this.props.setRules(rules);
        this.saveRules(rules, this.props.autotrader.running);
    }

    setStepQuantity(index:number, quantity:number) {
        let rules = [...this.props.autotrader.rules];
        rules[index].stepQuantity = quantity;
        this.props.setRules(rules);
        this.saveRules(rules, this.props.autotrader.running);
    }

    getCoinClass(coin:string) {
        if(this.rulesContainCoin(coin) !== -1) {
            return 'coin-outer';
        } else {
            return 'coin-outer coin-outer-inactive';
        }
    }

    filterName(coin:string) {
        return coin === "luna" ? "himemoriluna" : coin;
    }

    getCoinPrice(coin:string) {
        let name = this.filterName(coin);
        return this.props.stats.coinInfo.data[name].price;
    }

    getCoinVolume(coin:string) {
        let name = this.filterName(coin);
        return this.props.stats.coinInfo.data[name].inCirculation;
    }

    getCoinSaleValue(coin:string) {
        let name = this.filterName(coin);
        return this.props.stats.coinInfo.data[name].saleValue;
    }

    getMyQuant(coin:string) {
        let wallet:IWallet = {...this.props.userinfo.wallet};
        let name = this.filterName(coin);
        if(wallet.coins[name] === undefined) {
            return 0;
        } else {
            return wallet.coins[name].amt;
        }
    }

    getBalance() {
        return this.props.userinfo.wallet.balance;
    }

    getMeanPurchasePrice(coin:string) {
        let wallet:IWallet = {...this.props.userinfo.wallet};
        let name = this.filterName(coin);
        if(wallet.coins[name] === undefined) {
            return 0;
        } else {
            return Math.round(wallet.coins[name].meanPurchasePrice * 100) / 100;
        }
    }

    getTimestamp(coin:string) {
        let wallet:IWallet = {...this.props.userinfo.wallet};
        let name = this.filterName(coin);
        if(wallet.coins[name] === undefined) {
            return 0;
        } else {
            return wallet.coins[name].timestamp;
        }
    }

    updateTimeRemaining() {

        let timeRemaining = (this.props.autotrader.nextTradeTime - new Date().getTime()) / 1000;
        if(timeRemaining < 0) timeRemaining = 0;

        let minutes = Math.floor(timeRemaining / 60);
        let seconds = Math.floor(timeRemaining - (minutes * 60));

        this.setState({timeRemaining: {
            minutes, seconds
        }});

    }

    componentDidMount() {
        this.interval = setInterval(() => {
            this.updateTimeRemaining();
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    getMetrics() {
        let rules:Array<AutoTraderRule> = this.props.autotrader.rules;

        let total:Array<string> = [];
        let buys:Array<string> = [];
        let sells:Array<string> = [];

        rules.forEach((rule:AutoTraderRule) => {
            let myQuant = this.getMyQuant(rule.coin);
            if(rule.targetQuantity > myQuant) {
                if(this.getCoinPrice(rule.coin) <= this.getBalance()) {
                    total.push(rule.coin);
                    buys.push(rule.coin);
                }
            } else if(rule.targetQuantity < myQuant) {
                if(myQuant > 0) {
                    total.push(rule.coin);
                    sells.push(rule.coin);
                }
            }
        });
        return {
            total,
            buys,
            sells
        }
    }

    render() {
        if(!this.props.session.loggedin) return null;
        if(!this.props.userinfo.loaded) return null;
        let allCoins:Array<string> = [];
        lineage.forEach((gen:Array<string>) => {
            allCoins = [...allCoins, ...gen];
        });
        let {
            total,
            buys,
            sells
        } = this.getMetrics();

        let {
            minutes, seconds
        } = this.state.timeRemaining;
        return(
            <DragDropContext
                onDragEnd={this.onDragEnd}>
                <div className="auto-trader-editor">
                    <div 
                        className="auto-trader-background"
                        onClick={() => this.props.toggleVisible()}></div>
                    <div className="auto-trader-inner">
                        <div
                            onClick={() => this.props.toggleVisible()} 
                            className="close-auto-trader">
                            <MdClose />
                        </div>
                        <div className="auto-trader-header">
                            auto-trader
                        </div>
                        <div
                            className="auto-trader-toggle-info"
                            onClick={() => this.setState({showInfo: !this.state.showInfo})}>
                            How to Use 
                            {
                                this.state.showInfo ?
                                <FiChevronUp style={{verticalAlign: 'middle'}}/>
                                :
                                <FiChevronDown style={{verticalAlign: 'middle'}}/>
                            }
                        </div>
                        { this.state.showInfo ?
                        <div className="auto-trader-description">
                            Use the auto-trader to carry out trades for you. 
                            It will only simulate player actions and will not 
                            bypass cooldown or transfer more than 1 of each coin at a time.<br/>
                            Use the coin icons on the left to toggle which coins are to be traded. Their order in the list determines their priority when being traded. To change the order, use the arrow icons on the left of each bar to drag the rule to the desired spot. Each coin will be bought or sold on cooldown until the desired target quantity is reached or until all liquid/ coins have been expended.<br/>
                            Use the text input to enter the desired quantity, or use the buttons on either side to increment or decrement the value.<br/>
                            All trades will be made in bulk, so the coin with the latest cooldown will determine when the next cycle occurs. The auto-trader will wait until all eligible transactions are off cooldown to make the trades. <br/>
                            The auto-trader is subject to all limitations 
                            that a normal player is subject to. The auto-trader is a purely client-side tool. It will not operate if the website is not open (the editor can be closed). <br/>
                            The background progress bar of each rule indicates the cooldown remaining on that coin.
                            Darkened rule items indicate that the coin cannot be traded to the desired quantity at the moment because of insufficient funds or assets.
                            Rules with a green border are being purchased. Rules with a red border are being sold. Rules with a blue border have reached their target quantity. 
                        </div> : null }
                        {
                            this.props.autotrader.running ?
                            <>
                            <div className="trade-metrics">
                                <div className="trade-amounts">
                                    Trading <span className="trade-amount-quant">{total.length}</span> coin
                                    {
                                        total.length === 1 ? "" : "s"
                                    }
                                </div>
                                <div className="trade-amounts">
                                    Buying <span className="trade-amount-quant">{buys.length}</span> coin
                                    {
                                        buys.length === 1 ? "" : "s"
                                    }
                                </div>
                                <div className="trade-amounts">
                                    Selling <span className="trade-amount-quant">{sells.length}</span> coin
                                    {
                                        sells.length === 1 ? "" : "s"
                                    }
                                </div>
                            </div>
                            <div className="trade-summary">
                                {
                                    buys.length > 0 ?
                                    <div className="trade-summary-list">
                                        Buying <span className="trade-summary-names buys">{buys.join(", ")}</span>
                                    </div> : null
                                } 
                                { buys.length > 0 && sells.length > 0 ? "and" : ""}
                                {
                                    sells.length > 0 ?
                                    <div className="trade-summary-list">
                                        Selling <span className="trade-summary-names sells">{sells.join(", ")}</span>
                                    </div> : null
                                }
                                {
                                    total.length > 0 ?
                                    "in" : ""
                                }
                            </div>
                            </>: null
                        }
                        {
                            this.props.autotrader.running 
                            && total.length > 0
                            && (minutes > 0 || seconds > 0) ?
                            <>
                            <div className="trade-countdown">
                            {
                                minutes > 0 ?
                                <>
                                <span className="countdown-number">{minutes}</span> minute{
                                    minutes === 1 ? "" : "s"
                                } 
                                {" "} and {" "}
                                </> : null
                            }

                            <span className="countdown-number">{seconds}</span> second{
                                seconds === 1 ? "" : "s"
                            }. 
                            </div>
                            </> : null
                        }
                        <div className="trade-rules-container">
                            <div className="trader-controls">
                                <div className="trader-actions flex flex-row flex-center">
                                    <div className="trader-actions-label">
                                        Running:
                                    </div>
                                    <ToggleSwitch
                                        onLabel={"On"}
                                        offLabel={"Off"}
                                        switchState={this.props.autotrader.running}
                                        onToggle={(setTo?:boolean) => this.toggleAutoTrader(setTo)}/>
                                </div>
                                <div className="trader-coins">
                                    {
                                    allCoins.map((coin:string) => 
                                        <div 
                                            className={this.getCoinClass(coin)}
                                            onClick={() => this.toggleCoin(coin)}
                                            key={coin}>
                                            {
                                                this.getMyQuant(coin) > 0 ?
                                                <div className="coin-owned-bubble">
                                                </div> : null
                                            }
                                            <Coin name={coin}/>
                                        </div>
                                    )
                                    }
                                </div>
                                <div 
                                    className="clear-all-coins"
                                    onClick={() => this.clearAllCoins()}>
                                    Clear All
                                </div>
                            </div>
                            {
                            this.props.autotrader.rules.length === 0 ?
                            <div className="no-rules">
                                You haven't added any rules yet.
                            </div> 
                            :
                            <Droppable droppableId={"test"}>
                                {(provided) => (
                                <div   
                                    ref={provided.innerRef} 
                                    className="trade-rules-list" 
                                    {...provided.droppableProps}>

                                    {
                                        this.props.autotrader.rules.map((d:AutoTraderRule, index:number) => 
                                        (
                                            <TradeRuleItem
                                                coin={d.coin}
                                                price={this.getCoinPrice(d.coin)}
                                                saleValue={this.getCoinSaleValue(d.coin)}
                                                volume={this.getCoinVolume(d.coin)}
                                                quantity={this.getMyQuant(d.coin)}
                                                stepQuantity={d.stepQuantity ? d.stepQuantity : 1}
                                                meanPurchasePrice={this.getMeanPurchasePrice(d.coin)}
                                                balance={this.getBalance()}
                                                targetQuantity={d.targetQuantity}
                                                timestamp={this.getTimestamp(d.coin)}
                                                type={d.type}
                                                index={index}
                                                key={d.coin}
                                                setTargetQuantity={(index:number, quantity:number) => 
                                                    this.setTargetQuantity(index, quantity)} 
                                                setStepQuantity={(index:number, quantity:number) => 
                                                    this.setStepQuantity(index, quantity)}/>
                                        ))
                                    }

                                    {provided.placeholder}
                                </div>
                                )}
                            </Droppable>
                            }
                        </div>
                    </div>
                </div>
            </DragDropContext>
        );
    }
}

const AutoTraderEditor = connect(
    mapStateToProps,
    mapDispatchToProps
)(AutoTraderEditorBind);

export default AutoTraderEditor;