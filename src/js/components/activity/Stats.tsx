import React, { Component } from 'react';
import Calendar from 'react-calendar';

import Coin from '../Coin';
import {lineage} from '../Icons';
import { ITransaction, TransactionType } from '../../interfaces/ITransaction';
import {
    BsCaretDownFill
} from 'react-icons/bs';
import {
    RiRefreshLine
} from 'react-icons/ri';
import  {
    BsFillPauseFill,
    BsFillPlayFill
} from 'react-icons/bs';

import numberWithCommas from '../../numberWithCommas';
import {activeView} from './Activity';

import { Line } from 'react-chartjs-2';
import { datasetTemplate } from '../DatasetTemplate';

interface TransactionItemProps {
    transaction:ITransaction,
    admin:boolean,
    mine:boolean,
    activeView: activeView,
    currentPrice: String
}

export class TransactionItem extends Component<TransactionItemProps> {
    render() {
        let time = new Date(this.props.transaction.timestamp)
            .toLocaleTimeString();
        let type = this.props.transaction.type === 0 ? "BUY" : "SELL"
        let typeClass = this.props.transaction.type === 0 ? "buy" : "sell";
        let name = this.props.transaction.coin;
        let price = 'N/A';
        // Check if the transaction either has had no price recorded or isn't complete yet. Non-complete transactions will
        // have Number.NEGATIVE_INFINITY as their value
        if ((this.props.transaction.price !== undefined) 
            && (this.props.transaction.price !== Number.NEGATIVE_INFINITY) 
            && (this.props.transaction.price !== null)) {
            price = "$" + numberWithCommas(this.props.transaction.price);
        }
        //if (Profile.props.userinfo.id !== undefined) {
        //    if (Profile.props.userinfo.id === Profile.props.transaction.userid) {
        //        transacID = Navbar.props.userinfo.username;
        //    }
        //}

        let center = "";

        if(name === "himemoriluna") name = "luna"; 
        return(
            <div className={`transaction-container ${this.props.mine ? "transaction-mine" : ""}`}>
                <div className="transaction-timestamp">{time}</div>
                <div className="transaction-coin">
                    <Coin name={name} />
                </div>
                <div className="transaction-name">{name.toUpperCase()}</div>
                {
                    // need to check functionality to make the user see their own name displayed
                    // if it is their UID, display their name
                    
                    // If the user is an admin, this will get replaced with the userid itself,
                    // hopefully
                    this.props.admin ?
                    <div className="transaction-userid">{this.props.transaction.userid}</div>
                    : null
                }
                <div className={`transaction-type ${typeClass} flex flex-row flex-center`}>
                    <div className={`transaction-type-span ${center}`}>
                        {type}
                    </div>
                    <div 
                        className="transaction-price"
                        title={`Current Price: $${this.props.currentPrice}`}>
                        {price}
                    </div>
                </div>
            </div>
        )
    }
}

interface DateUpdaterProps {
    activeDay:Date,
    onUpdate:(date:Date) => void
}

class DateUpdaterState {
    calendarActive:boolean;
    constructor() {
        this.calendarActive = false;
    }
}

export class DateUpdater extends Component<DateUpdaterProps> {
    state:DateUpdaterState;
    constructor(props:DateUpdaterProps) {
        super(props);
        this.state = new DateUpdaterState();
        this.onClick = this.onClick.bind(this);
    }
    toggleActive() {
        this.setState({
            calendarActive: !this.state.calendarActive
        })
    }
    onClick(value:any) {
        this.props.onUpdate(value);
    }
    render() {
        let active = this.state.calendarActive ? "date-updater-active" : "";
        return(
            <div className={`date-updater ${active}`}>
                <div 
                    className="date-active"
                    onClick={() => this.toggleActive()}>
                    {this.props.activeDay.toLocaleDateString()}
                    <BsCaretDownFill/>
                </div>
                
                <Calendar 
                    calendarType="US"
                    onClickDay={(value:any) => this.onClick(value)}
                    defaultValue={this.props.activeDay}
                    maxDate={new Date()}
                    className={"date-updater-calendar"}/>
            </div>
        )
    }
}

interface TransactionStatsProps {
    transactions: Array<ITransaction>,
    activeView: activeView,
    activeDay: Date
}
class TransactionStatsState {
    activeCoin:string;
    graphData:any;
    stats:any;
    spinRefresh:boolean;
    pauseGraphUpdate:boolean;
    constructor() {
        this.activeCoin = "";
        this.graphData = {};
        this.stats = {};
        this.spinRefresh = false;
        this.pauseGraphUpdate = false;
    }
}

export class TransactionStats extends Component<TransactionStatsProps> {
    state:TransactionStatsState;
    constructor(props:TransactionStatsProps) {
        super(props);
        this.state = new TransactionStatsState();
    }
    getStatClass(stat:any) {
        if(stat.buy === 0 && stat.sell === 0) {
            return "transaction-stat-item inactive";
        } else {
            return "transaction-stat-item";
        }
    }
    togglePauseGraph() {
        this.setState({
            pauseGraphUpdate:!this.state.pauseGraphUpdate
        });
    }
    setActiveCoin(coin:string) {
        if(this.props.activeView === activeView.recentHistory) return;
        if(this.state.stats[coin].buy === 0 && this.state.stats[coin].sell === 0)
            return;
        let newActive = this.state.activeCoin === coin ? "" : coin;
        this.setState({
            activeCoin:newActive
        },() => {
            this.getGraphData();
        })
    }

    /**
     * Generates a new stats object based on the active
     * transactions list.
     */
    generateStats(transactions:Array<ITransaction>) {
        let stats:any = {};
        let allCoins:Array<string> = [];

        lineage.forEach((gen:any) => {
            allCoins = [...allCoins, ...gen];
        });

        allCoins.forEach((coin:string) => {
            let name = coin === "luna" ? "himemoriluna" : coin;
            stats[name] = {
                buy:0,
                sell:0
            }
        });

        transactions.forEach((transaction:ITransaction) => {
            if(transaction.type === TransactionType.BUY) {
                stats[transaction.coin].buy++;
            } else {
                stats[transaction.coin].sell++;
            }
        })
        this.setState({
            stats
        })
    }

    getDetails() {
        let sells = 0;
        let buys = 0;
        let uniqueCoins:Array<string> = [];
        this.props.transactions.forEach((transaction:ITransaction) => {
            if(uniqueCoins.indexOf(transaction.coin) === -1) {
                uniqueCoins.push(transaction.coin);
            }
            if(transaction.type === TransactionType.BUY) {
                buys++;
            } else {
                sells++;
            }
        })
        
        return {
            unique: uniqueCoins.length,
            buys,
            sells
        }
    }
    getGraphData() {
        let data:any = {};
        let datasets: Array<any> = [];
        
        let buysDataset = {...datasetTemplate};
        let sellsDataset = {...datasetTemplate};
        let totalDataset = {...datasetTemplate};

        buysDataset.borderColor = "rgba(77, 182, 108)";
        sellsDataset.borderColor = "rgba(255, 108, 108)";
        
        buysDataset.label = "Purchases";
        sellsDataset.label = "Sales";
        totalDataset.label = "Total";

        let times:any = {};
        let timeList:any = [];
        let firstTime = new Date(this.props.activeDay.toLocaleDateString("en-US", {"timeZone":"America/New_York"})).getTime();
        for(let i = 0; i < 96; i++) {
            let newTime = firstTime + (1000 * 60 * 15 * i);
            times[newTime] = {
                buys:0,
                sells:0
            };
            timeList.push(newTime)
        }

        let transactions:Array<ITransaction> = [...this.props.transactions];

        transactions.forEach((t:ITransaction) => {
            if(this.state.activeCoin === ""
                || (this.state.activeCoin === t.coin)) {
                for(let i = 0; i < timeList.length; i++) {
    
                    let graphT = new Date(timeList[i]);
                    let transactionT = new Date(t.timestamp);
    
                    if((graphT.getHours() > transactionT.getHours())
                        || (
                            (graphT.getHours() === transactionT.getHours())
                            && (graphT.getMinutes() >= transactionT.getMinutes()))) {
                        let j = Math.max(i - 1, 0);
                        if(t.type === TransactionType.BUY) {
                            times[timeList[j]].buys++;
                        } else {
                            times[timeList[j]].sells++;
                        }
                        break;
                    }
                }
            }
        });

        let labels:any = [];
        let buysValues:any = [];
        let sellsValues:any = [];
        let totalValues:any = [];
        timeList.forEach((time:number) => {
    
            labels.push(new Date(time).toLocaleTimeString());
            let timeStat = times[time];
            buysValues.push(timeStat.buys);
            sellsValues.push(timeStat.sells);
            totalValues.push(timeStat.buys + timeStat.sells);

        });
        
        data.labels = labels;
        
        buysDataset.data = buysValues;
        sellsDataset.data = sellsValues;
        totalDataset.data = totalValues;

        datasets = [buysDataset, sellsDataset, totalDataset];
        data.datasets = datasets;
        this.setState({
            graphData:data
        })
    }
    /**
     * Adds a transaction to the stats object and sets the state
     * @param transaction The transaction to add to the stats object
     */
    updateStats(transaction:ITransaction) {
        let stats:any = {...this.state.stats};
        if(transaction.type === TransactionType.BUY) {
            stats[transaction.coin].buy++;
        } else {
            stats[transaction.coin].sell++;
        }
        this.setState({
            stats
        })
    }
    historyGraph() {
        if(this.state.graphData === {}) return null;
        if(this.props.activeView === activeView.recentHistory) return null;
        return(
            <div className="transaction-graph">
                <div className="graph-controls flex flex-row flex-center">
                    <div 
                        className="graph-control"
                        onClick={() => this.togglePauseGraph()}>
                        {
                            this.state.pauseGraphUpdate ?
                            <BsFillPlayFill style={{verticalAlign:"center"}}/>
                            :
                            <BsFillPauseFill style={{verticalAlign:"center"}}/>
                        }
                    </div>
                    <div 
                        className={`graph-control ${this.state.spinRefresh ? "spin" : ""}`}
                        onClick={() => this.refreshGraph()}>
                        <RiRefreshLine style={{verticalAlign:"center"}} />
                    </div>
                </div>
                <Line data={this.state.graphData} options={
                    {
                        maintainAspectRatio: false,
                        animation: {
                            duration: 300
                        },
                        easing: "easeInOutCubic",
                        scales: {
                            yAxes: [{
                                display: true,
                                ticks: {
                                    min:0,
                                    precision:0
                                }
                            }]
                        }
                    }
                }/>
            </div>
        )
    }
    plural(amt:number) {
        return amt === 1 ? "" : "s";
    }
    componentDidMount() {
        this.generateStats(this.props.transactions);
        this.getGraphData();
    }
    componentDidUpdate(prevProps:TransactionStatsProps) {
        if(this.props.transactions.length !== prevProps.transactions.length) {
            if(!this.state.pauseGraphUpdate && this.props.activeView !== activeView.recentHistory) {
                this.getGraphData();
            }
            this.generateStats(this.props.transactions);
        }
    }
    refreshGraph() {
        this.getGraphData();
        this.setState({
            spinRefresh:true
        }, () => {
            setTimeout(() => {
                this.setState({
                    spinRefresh:false
                })
            }, 200)
        })
    }
    render() {
        let coins = Object.keys(this.state.stats);
        let coinname = this.state.activeCoin;
        if(coinname === "himemoriluna") {
            coinname = "luna";
        }
        let {
            unique,
            buys,
            sells
        } = this.getDetails();
        return(
            <div className="transaction-stats">
                <div className={`coin-amts`}>
                    {
                        coins.map((coin:string) => 
                            <div
                                key={coin} 
                                className={this.getStatClass(this.state.stats[coin])}>
                                <Coin 
                                    name={coin === "himemoriluna" ? "luna" : coin}
                                    onClick={() => this.setActiveCoin(coin)}
                                    className={coin === this.state.activeCoin ? "active" : ""}/>
                                <div className="transaction-stat-buy-amt">
                                    {this.state.stats[coin].buy}
                                </div>
                                <div className="transaction-stat-sell-amt">
                                    {this.state.stats[coin].sell}
                                </div>
                            </div>
                        )
                    }
                </div>
                <div className="stat-details">
                    <div className="stat-detail">
                        <span className="stat-quant">
                            {buys + sells + " "}
                        </span>  
                         Total Transaction{this.plural(buys + sells)}
                        </div>
                    <div className="stat-detail">
                        <span className="stat-quant">
                            {buys + " "}
                        </span> 
                         Purchase{this.plural(buys)}
                        </div>
                    <div className="stat-detail">
                        <span className="stat-quant">
                            {sells + " "}
                        </span>  
                         Sale{this.plural(sells)}
                    </div>
                    <div className="stat-detail">
                        <span className="stat-quant">
                            {unique +  " "}
                        </span>  
                         Unique Coin{this.plural(unique)}
                    </div>
                </div>
                {
                    this.props.activeView === activeView.history
                    || this.props.activeView === activeView.myHistory ? 
                    <div className="showing-active-coin">
                        Viewing transaction timeline for
                        <span className="active-coin-label">
                        {
                        this.state.activeCoin === "" ?
                            " all" : " " + coinname
                        }
                        </span>
                    </div> : null
                }
                {
                    this.historyGraph()
                }
            </div>
        )
    }
}