import React, {Component} from 'react';
import { Draggable } from 'react-beautiful-dnd';
import {
    IoIosArrowDown,
    IoIosArrowUp
} from 'react-icons/io';
import { Order, TransactionType } from '../../interfaces/ITransaction';
import numberWithCommas from '../../numberWithCommas';
import Coin from '../Coin';

import {
    BiPlus,
    BiMinus
} from 'react-icons/bi';

interface TradeRuleItemProps {
    pendingOrder:Array<Order>,
    coin:string,
    price:number,
    saleValue:number,
    volume:number,
    quantity:number,
    stepQuantity:number,
    meanPurchasePrice:number,
    balance:number,
    targetQuantity:number,
    timestamp:number,
    type:TransactionType,
    index:number,
    setTargetQuantity:(index:number, quantity:number) => void,
    setStepQuantity:(index:number, quantity:number) => void,
}

class TradeRuleItemState {
    remainingTime:number;
    constructor(){
        this.remainingTime = 0;
    }
}

type inputEvent = React.ChangeEvent<HTMLInputElement>;

class TradeRuleItem extends Component<TradeRuleItemProps> {

    intervalId:any;
    state:TradeRuleItemState;
    constructor(props:TradeRuleItemProps) {
        super(props);
        this.state = new TradeRuleItemState();
    }
    handleAmt(a:inputEvent) {
        let amt:number;
        if(a.target.value.length === 0) {
            amt = 0;
        } else {
            let textv:string = a.target.value;
            if(textv.slice(-1) === ".") textv = textv + "0";
            amt = parseFloat(textv);
        }
        if(isNaN(amt)) amt = 0;
        if(amt < 0) amt = -1 * amt;
        amt = Math.round(amt);
        this.props.setTargetQuantity(this.props.index, amt);
    }

    increment(n:number) {
        let target = this.props.targetQuantity;
        target += n;
        if(target < 0) target = 0;
        if(target > 99999) target = 99999;
        this.props.setTargetQuantity(this.props.index, target);
    }

    incrementStep(n:number) {
        let step = this.props.stepQuantity;
        step += n;
        if(step < 1) step = 1;
        if(step > 5) step = 5;
        this.props.setStepQuantity(this.props.index, step);
    }

    getCooldownWidth() {
        let total = 1000 * 60 * 10;
        return (this.state.remainingTime / total) * 100;
    }

    setRemainingTime() {
        let targetTime = this.props.timestamp + (1000 * 60 * 10);
        let remaining = targetTime - new Date().getTime();
        if(remaining < 0) {
            remaining = 0;
        }
        this.setState({
            remainingTime:remaining
        })
    }

    componentDidMount() {
        this.setRemainingTime();
        this.intervalId = setInterval(() => {
            this.setRemainingTime();
        }, 4000);
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    renderTradeRuleType() {
        if(this.props.quantity === this.props.targetQuantity) {
            return <div className="trade-rule-done">DONE</div>
        } else {
            if(this.props.type === TransactionType.BUY) {
                return(
                    <div className={`trade-rule-buy`}>
                        BUY</div>
                )
            } else {
                return(
                    <div className={`trade-rule-sell `}>
                    SELL</div>
                )
            }
        }
    }

    render() {
        let className = "trade-rule-item";
        if(this.props.quantity === this.props.targetQuantity) {
            className += " trade-rule-neutral";
        } else {
            if(this.props.targetQuantity > this.props.quantity) {
                className += " trade-rule-buy";
            } else {
                className += " trade-rule-sell";
            }
        }

        let inOrder = false;
        for(let i = 0; i < this.props.pendingOrder.length; i++) {
            let coin = this.props.pendingOrder[i].coin;
            if(coin === "himemoriluna") coin = "luna"
            if(coin === this.props.coin) {
                inOrder = true;
                break;
            }
        }
        if(!inOrder)
            className += " trade-rule-disabled";

        return(
            <Draggable
                draggableId={this.props.coin}
                index={this.props.index}
                key={this.props.coin}>

                {(providedDrag:any) => (
                <div
                    className={className}
                    {...providedDrag.draggableProps}
                    ref={providedDrag.innerRef}>
                    <div className="trade-rule-item-content">
                        <div
                            className="trade-priority flex flex-col flex-center"
                            {...providedDrag.dragHandleProps}>
                            <IoIosArrowUp />
                            <IoIosArrowDown />
                        </div>
                        <div className="trade-rule-coin">
                            <Coin name={this.props.coin}/>
                        </div>
                        <div
                            className="trade-rule-info"
                            title={"Mean purchase price: $" + numberWithCommas(this.props.meanPurchasePrice)}>
                            <div className="trade-rule-info-label">Current Price</div>
                            <div className="trade-rule-price">${numberWithCommas(this.props.price)}</div>
                        </div>
                        <div
                            className="trade-rule-info"
                            title={"Mean purchase price: $" + numberWithCommas(this.props.meanPurchasePrice)}>
                            <div className="trade-rule-info-label">Sale Value</div>
                            <div className="trade-rule-price">${numberWithCommas(this.props.saleValue)}</div>
                        </div>
                        <div
                            className="trade-rule-info">
                            <div className="trade-rule-info-label">Volume</div>
                            <div className="trade-rule-volume">{numberWithCommas(this.props.volume)}</div>
                        </div>
                        <div className="trade-rule-info">
                            <div className="trade-rule-info-label">Owned</div>
                            <div className="trade-rule-quant">{this.props.quantity}</div>
                        </div>
                        <div className="trade-rule-type">
                            {this.renderTradeRuleType()}
                        </div>
                        <div className="trade-rule-step-quant">
                            <div className="trade-rule-step-label">Step Quantity</div>
                            <div className="step-outer">
                                <div className="step-quant flex center-child">
                                    {this.props.stepQuantity}
                                </div>
                                <div className="step-change-quant-outer">
                                    <div className="step-increase" onClick={() => this.incrementStep(1)}><BiPlus/></div>
                                    <div className="step-decrease" onClick={() => this.incrementStep(-1)}><BiMinus/></div>
                                </div>
                            </div>
                        </div>
                        <div className="trade-rule-target">
                            <div className="trade-rule-target-label">Target Quantity</div>
                            <div className="target-input">
                                <div className="decrement" title="Subtract 100" onClick={() => this.increment(-100)}><BiMinus/></div>
                                <div className="decrement" title="Subtract 10" onClick={() => this.increment(-10)}><BiMinus/></div>
                                <div className="decrement" title="Subtract 1" onClick={() => this.increment(-1)}><BiMinus/></div>
                                <input
                                    type="text"
                                    maxLength={5}
                                    value={this.props.targetQuantity}
                                    onChange={(
                                        ev: inputEvent
                                    ): void => this.handleAmt(ev)}/>
                                <div className="increment"
                                title="Add 1" onClick={() => this.increment(1)}><BiPlus/></div>
                                <div className="increment" title="Add 10" onClick={() => this.increment(10)}><BiPlus/></div>
                                <div className="increment" title="Add 100" onClick={() => this.increment(100)}><BiPlus/></div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="trade-rule-item-cooldown"
                        style={{
                            width:this.getCooldownWidth() + "%"
                        }}>
                    </div>
                </div>
                )}
            </Draggable>
        )
    }
}

export default TradeRuleItem;
