import React, {Component} from 'react';
import { Draggable } from 'react-beautiful-dnd';
import {
    IoIosArrowDown,
    IoIosArrowUp
} from 'react-icons/io';
import { TransactionType } from '../../interfaces/ITransaction';
import Coin from '../Coin';

interface TradeRuleItemProps {
    coin:string,
    price:string,
    quantity:number,
    targetQuantity:number,
    timestamp:number,
    type:TransactionType,
    index:number,
    setRuleType:(index:number, type:TransactionType) => void,
    setTargetQuantity:(index:number, quantity:number) => void,
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

    render() {
        return(
            <Draggable
                draggableId={this.props.coin}
                index={this.props.index}
                key={this.props.coin}>

                {(providedDrag:any) => (
                <div 
                    className="trade-rule-item" 
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
                        <div className="trade-rule-info">
                            <div className="trade-rule-info-label">Current Price</div>
                            <div className="trade-rule-price">${this.props.price}</div>
                        </div>
                        <div className="trade-rule-info">
                            <div className="trade-rule-info-label">Owned</div>
                            <div className="trade-rule-quant">{this.props.quantity}</div>
                        </div>
                        <div className="trade-rule-type">
                            <div 
                                className={`trade-rule-buy 
                                    ${this.props.type === TransactionType.BUY 
                                        ? '' : 'trade-rule-inactive-type'}`}
                                onClick={() => this.props.setRuleType(this.props.index, TransactionType.BUY)}>
                                    BUY</div>
                            <div 
                                className={`trade-rule-sell 
                                    ${this.props.type === TransactionType.SELL 
                                        ? '' : 'trade-rule-inactive-type'}`}
                                onClick={() => this.props.setRuleType(this.props.index, TransactionType.SELL)}>
                                    SELL</div>
                        </div>
                        <div className="trade-rule-target">
                            <div className="trade-rule-target-label">Target Quantity</div>
                            <input 
                                type="text" 
                                maxLength={4}
                                value={this.props.targetQuantity}
                                onChange={(
                                    ev: inputEvent
                                ): void => this.handleAmt(ev)}/>
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