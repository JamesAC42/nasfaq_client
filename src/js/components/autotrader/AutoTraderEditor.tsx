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
        rules:Array<AutoTraderRule>
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

class AutoTraderEditorBind extends Component<AutoTraderEditorProps> {

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
        return numberWithCommas(this.props.stats.coinInfo.data[name].price);
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

    render() {
        if(!this.props.session.loggedin) return null;
        if(!this.props.userinfo.loaded) return null;
        let allCoins:Array<string> = [];
        lineage.forEach((gen:Array<string>) => {
            allCoins = [...allCoins, ...gen];
        });
        return(
            <DragDropContext
                onDragEnd={this.onDragEnd}>
                <div className="auto-trader-editor">
                    <div className="auto-trader-inner">
                        <div
                            onClick={() => this.props.toggleVisible()} 
                            className="close-auto-trader">
                            <MdClose />
                        </div>
                        <div className="auto-trader-header">
                            auto-trader
                        </div>
                        <div className="auto-trader-description">
                            Use the auto-trader to carry out trades for you. 
                            It will only simulate player actions and will not 
                            bypass cooldown or transfer more than 1 of each coin at a time. 
                            The trader will run through the list of trading 
                            rules and make all valid trades in the order they are listed
                            until the desired quantity is reached or all liquid/coins are 
                            expended. It is subject to all limitations 
                            that a normal player is subject to. The auto-trader is a 
                            purely client-side tool. It will not operate if the website 
                            is not open (the editor can be closed). 
                        </div>
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
                                                quantity={this.getMyQuant(d.coin)}
                                                meanPurchasePrice={this.getMeanPurchasePrice(d.coin)}
                                                targetQuantity={d.targetQuantity}
                                                timestamp={this.getTimestamp(d.coin)}
                                                type={d.type}
                                                index={index}
                                                key={d.coin}
                                                setTargetQuantity={(index:number, quantity:number) => 
                                                    this.setTargetQuantity(index, quantity)} />
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