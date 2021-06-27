import React, { Component } from 'react';
import { ICoinDataCollection, ICoinHistory } from '../interfaces/ICoinInfo';
import {IWallet} from '../interfaces/IWallet';

import { 
    BiUpArrow,
    BiDownArrow
} from 'react-icons/bi';
import {
    GoDash
} from 'react-icons/go';

import {
    IoMdCloseCircleOutline
} from 'react-icons/io';
import { connect } from 'react-redux';
import Coin from './Coin';
import Button from './Button';
import getTransactionStatus from '../getTransactionStatus';
import numberWithCommas from '../numberWithCommas';
import { buyCoin, sellCoin } from '../TradeActions';
import { Draggable } from 'react-beautiful-dnd';
interface CompactBoardItemProps {
    name: string;
    index: number;
    session: {
        loggedin: boolean
    },
    stats: {
        stats: {
            [key:string]:any
        },
        coinHistory: ICoinHistory,
        coinInfo: ICoinDataCollection
    },
    userinfo: {
        wallet: IWallet,
        verified: boolean,
        loaded:boolean,
        muted:string
    },
    settings: {
        marketSwitch:boolean
    },
    closeBoard: () => {}
}

class CompactBoardItemState {

    activeStat: string;

    buyDisabled: boolean;
    sellDisabled: boolean;

    timeRemaining: number

    error: string;

    graphData: {
        labels: Array<string>,
        datasets: Array<any>
    };

    constructor() {
        this.activeStat = "price";
        this.buyDisabled = true;
        this.sellDisabled = true;
        this.timeRemaining = 0;
        this.error = '';
        this.graphData = {
            labels: [],
            datasets: []
        }
    }
}

const mapStateToProps = (state:any, props:any) => ({
    settings: state.settings,
    session: state.session,
    stats: state.stats,
    userinfo: state.userinfo
});

class CompactBoardItemBind extends Component<CompactBoardItemProps> {
    
    state:CompactBoardItemState;
    intervalId:any;
    constructor(props:CompactBoardItemProps) {
        super(props);
        this.state = new CompactBoardItemState();
    }
    
    componentDidMount() {
        this.updateTransactionStatus();
        this.intervalId = setInterval(() => {
            this.updateTransactionStatus();
        }, 300);   
    }
    
    componentWillUnmount() {
        clearInterval(this.intervalId);
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

    filterName(name:string) {
        return (name === "luna") ? "himemoriluna" : name;
    }
    
    updateTransactionStatus() {

        if(!this.props.session.loggedin || !this.props.userinfo.loaded)
            return;

        let name = this.filterName(this.props.name);

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

        let {
            timeRemaining,
            buyDisabled,
            sellDisabled
        } = getTransactionStatus(
            this.props.userinfo.wallet,
            this.props.stats.coinInfo.data[name],
            name,
            this.props.userinfo.verified,
            showMuted,
            this.props.settings.marketSwitch
        )

        this.setState({
            timeRemaining,
            buyDisabled,
            sellDisabled
        })
    }

    buy() {
        if(this.state.buyDisabled || this.state.timeRemaining > 0) {
            if(!this.props.userinfo.verified) {
                this.setState({error:'You must verify your account before trading'});
                setTimeout(() => {
                    this.setState({error: ''})
                }, 3000);
            }
            return;
        }
        let name = this.filterName(this.props.name);
        buyCoin(name);
    }

    sell() {
        if(this.state.sellDisabled || this.state.timeRemaining > 0) {
            if(!this.props.userinfo.verified) {
                this.setState({error:'You must verify your account before trading'});
                setTimeout(() => {
                    this.setState({error: ''})
                }, 3000);
            }
            return;
        }
        let name = this.filterName(this.props.name);
        sellCoin(name);
    }

    render() {
        
        if(this.props.stats.coinInfo.data === undefined) return null;
        
        let name = this.filterName(this.props.name);
        let displayName = this.props.name;
        let coinData = this.props.stats.coinInfo.data[name];
        let coinHistory = this.props.stats.coinHistory[name];
        let coinStats = this.props.stats.stats[name];

        if( coinData === undefined ||
            //coinHistory === undefined ||
            coinStats === undefined) return null;

        let price = coinData.price;
        let saleValue = coinData.saleValue;
        let totalOwned = coinData.inCirculation;
        
        let prevPrice;
        if(coinHistory === undefined) {
            prevPrice = price;
        } else {
            prevPrice = coinHistory.price.slice(-1)[0]
        }

        let delta = Math.round((price - prevPrice) * 100) / 100;
        let deltaP = Math.round((delta / price) * 10000) / 100;
        /*
        let deltaClass;
        if(delta === 0) {
            deltaClass = "stagnant";
        } else {
            deltaClass = delta < 0 ? "decrease" : "increase";
        }

        const fullClass = this.props.session.loggedin ? "":"full";
        */
        let amtOwned = "";
        let meanPurchasePrice:number;
        if(this.props.userinfo.loaded) {
            let coins = this.props.userinfo.wallet.coins;
            let name = this.filterName(this.props.name);
            amtOwned = (coins[name] === undefined) ? "0" : coins[name].amt.toString();
            meanPurchasePrice = (coins[name] === undefined)  
                ? 0 : Math.round(this.props.userinfo.wallet.coins[name].meanPurchasePrice * 100) / 100;
        }

        let subscriberCount = coinStats.subscriberCount.data.slice(-1)[0];
        let dailySubscriberCount = coinStats.dailySubscriberCount.data.slice(-1)[0];
        let weeklySubscriberCount = coinStats.weeklySubscriberCount.data.slice(-1)[0];
        let viewCount = coinStats.viewCount.data.slice(-1)[0];
        let dailyViewCount = coinStats.dailyViewCount.data.slice(-1)[0];
        let weeklyViewCount = coinStats.weeklyViewCount.data.slice(-1)[0];

        let buyDisabled = this.state.buyDisabled ? "disabled" : "";
        let sellDisabled = this.state.sellDisabled ? "disabled" : "";

        let dirClass = delta > 0 ? "increase" : "decrease";
        if(delta === 0) dirClass = "stagnant";
        dirClass += " compact-price";
        return(
            <Draggable
                draggableId={this.props.name}
                index={this.props.index}
                key={this.props.name}>

                {(providedDrag:any) => (
                <tr 
                    className="board-item-compact"
                    {...providedDrag.draggableProps}
                    ref={providedDrag.innerRef}>
                    <td 
                        className="compact-close"
                        onClick={() => this.props.closeBoard()}>
                        <IoMdCloseCircleOutline style={{verticalAlign:"middle"}}/>
                    </td>
                    <td
                        {...providedDrag.dragHandleProps}>
                        <Coin name={displayName} />
                    </td>
                    <td className="compact-name">{displayName.toUpperCase()}</td>
                    {
                        this.props.session.loggedin ? 
                        <td>
                            <Button
                                timeRemaining={this.state.timeRemaining}
                                className={`inverse green ${buyDisabled} umami--click--buy`}
                                onClick={() => this.buy()}>
                                    BUY
                            </Button>
                        </td> : null
                    }
                    {
                        this.props.session.loggedin ?
                        <td>
                            <Button 
                                timeRemaining={this.state.timeRemaining}
                                className={`inverse red ${sellDisabled} umami--click--sell`}
                                onClick={() => this.sell()}>
                                    SELL
                            </Button>
                        </td> : null
                    }
                    <td 
                        className={dirClass}
                        title={meanPurchasePrice !== null ? `Mean purchase price: $${meanPurchasePrice}` : undefined}>
                            ${numberWithCommas(price)}</td>
                    <td 
                        className={dirClass}
                        title={meanPurchasePrice !== null ? `Mean purchase price: $${meanPurchasePrice}` : undefined}>
                            ${numberWithCommas(saleValue)}</td>
                    <td className={dirClass}>
                        {this.priceDirectionIcon(delta)}
                        ${numberWithCommas(Math.abs(delta))}
                    </td>
                    <td className={dirClass}>
                        {this.priceDirectionIcon(delta)}
                        {numberWithCommas(Math.abs(deltaP))}%
                    </td>
                    {
                        this.props.session.loggedin ?
                        <td className="compact-volume">{amtOwned}</td> : null
                    }
                    <td className="compact-volume">{totalOwned}</td>
                    <td>{numberWithCommas(subscriberCount)}</td>
                    <td>{numberWithCommas(dailySubscriberCount)}</td>
                    <td>{numberWithCommas(weeklySubscriberCount)}</td>
                    <td>{numberWithCommas(viewCount)}</td>
                    <td>{numberWithCommas(dailyViewCount)}</td>
                    <td>{numberWithCommas(weeklyViewCount)}</td>
                </tr>
                )}
            </Draggable>
        )
    }
}

const CompactBoardItem = connect(
    mapStateToProps
)(CompactBoardItemBind);

export default CompactBoardItem;