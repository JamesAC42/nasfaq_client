import React, { Component } from 'react';
import '../../../css/tabbedpage.scss';
import '../../../css/activity.scss';
import { ITransaction } from '../../interfaces/ITransaction';
import { Socket } from 'socket.io-client'
import { connect } from 'react-redux';

import ina from '../../../images/ina.png';
import {lineage} from '../Icons';

import Coin from '../Coin';
import { ICoinInfo } from '../../interfaces/ICoinInfo';

import {TransactionStats, TransactionItem, DateUpdater} from './Stats';

export enum activeView {
    history,
    dividends,
    myHistory,
    recentHistory
}

const mapStateToProps = (state:any, props:any) => ({
    userinfo: state.userinfo,
    session: state.session,
    stats: state.stats,
    socket: state.socket
});

interface ActivityProps {
    userinfo: {
        id:string,
        loaded:boolean,
        admin:boolean
    },
    session: {
        loggedin: boolean
    },
    stats: {
        coinInfo: ICoinInfo
    },
    socket: {
        socket:any
    }
}

class ActivityState {
    todayHistory: Array<ITransaction>;
    pastHistory: any;
    recentHistory: Array<ITransaction>;
    activeView: activeView;
    activeDay: Date;
    activePage:number;
    dividends:any;
    refreshing:boolean;

    todayRetrieved:boolean;
    retrievingPast:boolean;
    constructor() {
        this.todayHistory = [];
        this.recentHistory = [];
        this.pastHistory = {};
        this.activeDay = new Date();
        this.activeView = activeView.recentHistory;
        this.activePage = 0;
        this.dividends = {};
        this.refreshing = true;
        this.todayRetrieved = false;
        this.retrievingPast = false;
    }
}

class ActivityBind extends Component<ActivityProps> {
    state:ActivityState;
    intervalId:any;
    constructor(props:ActivityProps) {
        super(props);
        this.state = new ActivityState();
    }
    connectSocket() {
        let s = this.props.socket.socket;
		if(s !== null) {
		    this.listen(s);
        }
    }
    listen(socket:Socket) {
        socket.on('historyUpdate', (data:any) => {
            let recentHistory = [JSON.parse(data), ...this.state.recentHistory];
            this.setState({
                recentHistory
            });
        }) 
        socket.on('historyRefresh', (dataString:any) => {
            let data = JSON.parse(dataString);
            this.setState({
                todayHistory:data.transactions,
                activeDay: new Date(),
                activePage: 0
            })
        })
    }
    setHistory(transactions:Array<ITransaction>) {
        let recentHistory:Array<ITransaction> = [];
        let nowDate:Date = new Date();
        let nowMinutes = nowDate.getMinutes();
        let block = Math.floor(nowMinutes / 15) * 15;
        while(transactions.length > 0) {

            let currentHour = nowDate.getHours();
            let transactStamp = new Date(transactions[0].timestamp);
            if(currentHour !== transactStamp.getHours()) break;
            
            let transactMinutes = transactStamp.getMinutes();
            if(transactMinutes >= block && transactMinutes <= nowMinutes) {
                recentHistory.push(transactions[0]);
                transactions.splice(0, 1);
            } else {
                break;
            }
        }
        this.setState({
            todayHistory: transactions,
            recentHistory
        }); 
    }
    getTodayHistory() {
        if(!this.state.todayRetrieved) {
            fetch('/api/getHistory', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    let transactions:Array<ITransaction> = data.history.transactions;
                    transactions.reverse();
                    transactions.filter((t:ITransaction) => {
                        return t.coin !== "choco_alt";
                    });
                    this.setHistory(transactions);
                    this.setState({
                        todayRetrieved: true
                    })
                }
            })
        }
    }
    componentDidMount() {
        this.connectSocket();
        
        this.intervalId = setInterval(() => {
            this.refreshRecentTransactions();
        }, 1000 * 10);

        fetch('/api/getHistory?recent', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                let transactions:Array<ITransaction> = data.history.transactions;
                transactions.reverse();
                transactions.filter((t:ITransaction) => {
                    return t.coin !== "choco_alt";
                });
                this.setHistory(transactions);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
        fetch('/api/getDividends', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.setState({
                    dividends:data.dividends
                })
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }
    componentDidUpdate(prevProps:ActivityProps, prevState:ActivityState) {
        if(this.state.activeDay !== prevState.activeDay) {
            this.setState({
                activePage:0
            });
        }
        if(prevProps.socket.socket !== this.props.socket.socket) {
            if(this.props.socket.socket !== null) {
                this.listen(this.props.socket.socket);
            }
        }
    }
    updateActiveDay(date:Date) {
        this.setState({
            activeDay:date
        })
    }
    setActivePage(index:number) {
        this.setState({
            activePage:index
        })
    }

    refreshRecentTransactions() {
        let nowT = new Date().getMinutes();
        if(nowT % 15 === 0 && !this.state.refreshing) {
            let newHist = [...this.state.recentHistory, ...this.state.todayHistory];
            this.setState({
                recentHistory:[],
                todayHistory:newHist
            });
            this.setState({
                refreshing: true
            })
        } else {
            this.setState({
                refreshing:false
            })
        }
    }

    renderDividends() {
        let coinsf:Array<Array<any>> = [];
        lineage.forEach((gen:any) => {
            coinsf = [...coinsf, gen.map((coin:string) => {
                return {
                    display:coin,
                    number: coin === "luna" ? "himemoriluna" : coin
                }
            })]
        });
        for(let i = 0; i < coinsf.length; i++) {
            let gen:Array<any> = coinsf[i];
            gen = gen.filter((coin:any) => {
                return this.state.dividends.payouts[coin.number] !== undefined
            });
            coinsf[i] = gen;
        }
        if(this.state.dividends.timestamp === undefined || this.state.dividends.timestamp === 0) {
            return(
                <div className="no-dividends">
                    No dividends have been paid yet.
                </div>
            )
        }

        return(
            <div className="dividends">
                <div className="dividends-header">
                    Paid on: {new Date(this.state.dividends.timestamp).toLocaleString()}
                </div>
                {
                    coinsf.map((gen:any, i:number) => 
                    <div
                        key={i} 
                        className="dividend-generation flex flex-row">
                        {
                            gen.map((coin:any) => 
                            <div 
                                className="dividend-item"
                                key={coin.display}>
                                <div className="dividend-coin-outer">
                                    <Coin name={coin.display} />
                                </div>
                                <div className="dividend-amt">
                                    ${Math.round(this.state.dividends.payouts[coin.number] * 100) / 100}
                                </div>
                            </div>
                            )
                        }
                    </div>
                    )
                }
            </div>
        )
    }

    retrievePastHistory(date:Date):Promise<Array<ITransaction>> {
        return new Promise((resolve:any, reject:any) => {
            fetch('/api/getHistory?timestamp=' + date.getTime(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    let pastHistory = {...this.state.pastHistory};
                    pastHistory[date.getTime()] = data.history;
                    this.setState({
                        pastHistory,
                        retrievingPast:false
                    });
                    resolve(data.history.transactions);
                }
            })
            .catch(error => {
                console.error('Error: ' +  error);
                resolve([]);
            })
        });
    }

    /**
     * Sets the list of active transactions in the state based on
     * the active date. 
     */
    getTransactions() {

        if(this.state.activeView === activeView.dividends) {
            return [];
        }

        let today = false;

        let transactions:Array<ITransaction> = [];
        if(this.state.activeView === activeView.recentHistory) {
         
            transactions = [...this.state.recentHistory];

        } else {

            if(new Date().getTime() - this.state.activeDay.getTime() < (1000 * 60 * 60 * 24)) {

                transactions = [...this.state.todayHistory];
                today = true;

            } else {

                let histItem:any = this.state.pastHistory[this.state.activeDay.getTime()];
                if(histItem === undefined) {
                    
                    if(!this.state.retrievingPast) {
                        this.setState({
                            retrievingPast:true
                        }, () => {
                            this.retrievePastHistory(this.state.activeDay);
                        })
                    }
                    transactions = [];

                } else {
                    
                    transactions = [...histItem.transactions];
                    
                }
            }
        }

        if(this.state.activeView === activeView.myHistory) {
            
            if(today) {
                transactions = [...this.state.recentHistory, ...transactions];
            }

            transactions = transactions.filter((t:ITransaction) => {
                return t.userid === this.props.userinfo.id;
            })
        }
        return transactions;

    }

    getCurrentCoinPrice(coin:string):String {
        if(this.props.stats.coinInfo.data !== undefined) {
            return this.props.stats.coinInfo.data[coin].price.toString();
        } else {
            return "";
        }
    }

    componentWillUnmount() {
        if(this.props.socket.socket !== null) {
            this.props.socket.socket.removeAllListeners("historyUpdate");
            this.props.socket.socket.removeAllListeners("historyRefresh");
        }
    }

    changeActiveView(view:number) {

        if(view === activeView.history) {
            if(!this.state.todayRetrieved) {
                this.getTodayHistory();
            }
        }
        this.setState({
            activeView:view
        })
    }

    getPagedTransactions(transactions:Array<ITransaction>, pageSize:number) {
        let visibleTransactions = [];
        let indexStart = pageSize * this.state.activePage;
        let indexEnd = indexStart + pageSize;
        if(indexEnd >= transactions.length) {
            visibleTransactions = transactions.slice(indexStart);
        } else {
            visibleTransactions = transactions.slice(indexStart, indexEnd)
        }
        return visibleTransactions;

    }

    render() {
        let titles = ["HISTORY", "DIVIDENDS", "MY HISTORY", "RECENT HISTORY"];
        let activeTitle = titles[this.state.activeView];
        let historyClass = this.state.activeView === 0 ? "view-item-active" : "";
        let dividendsClass = this.state.activeView === 1 ? "view-item-active" : "";
        let myHistoryClass = this.state.activeView === 2 ? "view-item-active" : "";
        let recentHistoryClass = this.state.activeView === 3 ? "view-item-active" : "";
        
        let pageSize = 1500;
        let allTransactions = this.getTransactions();
        let visibleTransactions = this.getPagedTransactions(allTransactions, pageSize);
        let pageAmt = Math.ceil(allTransactions.length / pageSize);

        return(
            <div className="container tabbed-outer">
                <div className="tabbed-view-select">
                    <div
                        className={`view-item ${dividendsClass}`}
                        onClick={() => this.changeActiveView(activeView.dividends)}>
                        DIVIDENDS
                    </div>
                    {
                        this.props.session.loggedin ?
                        <div 
                            className={`view-item ${myHistoryClass}`}
                            onClick={() => this.changeActiveView(activeView.myHistory)}>
                            MY HISTORY
                        </div> : null
                    }
                    <div
                        className={`view-item ${recentHistoryClass}`}
                        onClick={() => this.changeActiveView(activeView.recentHistory)}>
                        RECENT HISTORY
                    </div>
                    <div
                        className={`view-item ${historyClass}`}
                        onClick={() => this.changeActiveView(activeView.history)}>
                        HISTORY
                    </div>
                </div>
                <div className="tabbed-content">

                    <div className="tabbed-content-container">
                        <div className="tabbed-content-background"></div>
                        <div className="tabbed-content-content">
                            <div className="header">
                                {activeTitle}
                                {
                                    this.state.activeView === activeView.history
                                    || this.state.activeView === activeView.myHistory ?
                                    <DateUpdater
                                        activeDay={this.state.activeDay}
                                        onUpdate={(date:Date) => this.updateActiveDay(date)} /> : null
                                }
                            </div>
                            {
                                this.state.activeView !== activeView.dividends ?
                                <TransactionStats
                                    activeDay={this.state.activeDay}
                                    transactions={allTransactions}
                                    activeView={this.state.activeView}/> : null
                            }
                            {
                                visibleTransactions.length === 0 && 
                                this.state.activeView !== activeView.dividends ? 
                                <div className="no-transactions">
                                    NO TRANSACTIONS
                                </div>:null
                            }
                            {
                                this.state.activeView === activeView.dividends ? 
                                this.renderDividends() : null
                            }
                            {
                                allTransactions.length > pageSize ? 
                                <div className="transaction-pagenav">
                                    {
                                        [...Array(pageAmt)].map((item:number, index:number) => 
                                            <div 
                                            className={`page-select 
                                                ${index === this.state.activePage ? "active-page" : ""}`
                                            }
                                            onClick={() => this.setActivePage(index)}>
                                                {index + 1}</div>
                                        )
                                    }
                                </div>:null
                            }
                            {
                                visibleTransactions.map((t:ITransaction, index:number) => 
                                    <TransactionItem 
                                        transaction={t}
                                        admin={this.props.userinfo.admin}
                                        mine={(t.userid === this.props.userinfo.id 
                                                && (this.state.activeView === activeView.history
                                                    || this.state.activeView === activeView.recentHistory))}
                                        key={index + ":" + t.timestamp + t.userid + t.coin} 
                                        activeView={this.state.activeView}
                                        currentPrice={this.getCurrentCoinPrice(t.coin)}/>
                                )
                            }
                        </div>
                    </div>
                </div>
                <img className="corner-img bl ina-bino" src={ina} alt="ina"/>
            </div>
        )
    }
}

const Activity = connect(
    mapStateToProps
)(ActivityBind);
  
export default Activity;