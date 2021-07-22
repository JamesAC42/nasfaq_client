import React, {Component} from "react";
import { io, Socket } from 'socket.io-client'

import {
    statsActions,
    userinfoActions,
    transactionActions,
    settingsActions,
    socketActions
} from '../actions/actions';
import { connect } from 'react-redux';
import { ITransaction } from "../interfaces/ITransaction";
import { IWallet } from "../interfaces/IWallet";
import { ICoinDataCollection, ICoinInfo } from "../interfaces/ICoinInfo";
import checkStorage from '../checkStorage';

const mapStateToProps = (state:any, props:any) => ({
    session: state.session,
    userinfo: state.userinfo,
    stats: state.stats,
    socket: state.socket
});

const mapDispatchToProps = {
    setStats: statsActions.setStats,
    setHistory: statsActions.setHistory,
    setCoinInfo: statsActions.setCoinInfo,
    setTodayPrices: statsActions.setTodayPrices,
    setLeaderboard: statsActions.setLeaderboard,
    setOshiboard: statsActions.setOshiboard,
    addTransaction: transactionActions.addTransaction,
    setWallet: userinfoActions.setWallet,
    setMarketSwitch: settingsActions.setMarketSwitch,
    setItems: userinfoActions.setItems,
    setSocket: socketActions.setSocket,
    removeSocket: socketActions.removeSocket
}

interface SocketHandlerProps {
    session: {
        loggedin: boolean
    },
    userinfo: {
        id:string,
        wallet: IWallet
    },
    stats: {
        coinInfo:ICoinDataCollection,
        coinHistory:any,
        stats:any
    },
    socket: {
        socket: any,
        query: any
    },
    setStats: (stats:{}) => {},
    setHistory: (coinHistory:{}) => {},
    setCoinInfo: (coinInfo: {}) => {},
    setTodayPrices: (todayPrices:{}) => {},
    setLeaderboard: (leaderboard:{}) => {},
    setOshiboard: (oshiboard:{}) => {}
    
    setWallet: (wallet:any) => {},
    addTransaction: (transaction:ITransaction) => {},

    setMarketSwitch: (open:boolean) => {},
    
    setItems: (items:any) => {},
    setSocket: (socket:any) => {},
    removeSocket: () => {}
}

class SocketHandlerBind extends Component<SocketHandlerProps> {
	
    reconnect() {
        let s = this.props.socket.socket;
        if(s !== null) s.disconnect();

        let loggedin = false;
        if(
            this.props.session.loggedin && 
            this.props.userinfo.id !== undefined) {   
            loggedin = true;
        }

        let query = {...this.props.socket.query};
        if(loggedin) {
            query.user = this.props.userinfo.id
        }

        //const socketUrl = 'http://localhost:3500';
        //const socketPath = '';
        const socketUrl = 'https://nasfaq.biz';
        const socketPath = '/socket';
        let newSocket = io(socketUrl, {
            path: socketPath,
            query
        });
        
        this.listenData(newSocket);
        if(loggedin) this.listenTransaction(newSocket);

        this.props.setSocket(newSocket);
    }

    componentDidUpdate(prevProps:SocketHandlerProps) {
        if(
            prevProps.session.loggedin !== this.props.session.loggedin ||
            prevProps.socket.query !== this.props.socket.query) {
                this.reconnect();
            }
    }

    listenTransaction(socket:Socket) {
        socket.on('transactionUpdate', (data:any) => {
            let transactions:Array<ITransaction> = data.transactions;
            transactions.forEach((t:ITransaction) => {
                this.props.addTransaction(t);
            })
            if(data.wallet !== null) {
                this.props.setWallet(data.wallet);
            }
        })
    }

    parseCoinInfo(data:any) {
        let coinInfo = {...this.props.stats.coinInfo};
        let coinData = coinInfo.data[data.coin];
        if(coinData === undefined) return;
        coinData.inCirculation = data.info.inCirculation;
        coinData.price = data.info.price;
        coinData.saleValue = data.info.saleValue;

        coinInfo.data[data.coin] = coinData;
        this.props.setCoinInfo(coinInfo);
    }

    addHistoryItem(info:ICoinInfo) {
        let history = {...this.props.stats.coinHistory};
        let date = new Date(info.timestamp).toLocaleDateString();
        Object.keys(info.data).forEach((coin:string) => {
            if(history[coin] === undefined) {
                history[coin] = {
                    labels:[],
                    inCirculation:[],
                    price:[]
                }
            }
            history[coin].labels.push(date);
            history[coin].inCirculation.push(info.data[coin].inCirculation);
            history[coin].price.push(info.data[coin].price);
        })
        this.props.setHistory(history);
        if(checkStorage()) {
            let cachedStatsString = localStorage.getItem("nasfaq:stats");
            if(cachedStatsString === null) {
                let newStats = {
                    timestamp:new Date().getTime(),
                    stats:this.props.stats.stats, 
                    history
                }
                localStorage.setItem("nasfaq:stats", JSON.stringify(newStats));
            } else {
                let cachedStats = JSON.parse(cachedStatsString);
                cachedStats.timestamp = new Date().getTime();
                cachedStats.history = history;
                localStorage.setItem("nasfaq:stats", JSON.stringify(cachedStats));
            }
        }
    }

    parsePriceUpdate(data:any) {
        let coinInfo:ICoinDataCollection = {...this.props.stats.coinInfo};
        let history = [...coinInfo.data[data.coin].history];
        history.push(data.priceStamp);
        coinInfo.data[data.coin].history = history;
        this.props.setCoinInfo(coinInfo);
    }

    appendStatisticsUpdate(data:any) {
        let oldStats:any = {...this.props.stats.stats};
        Object.keys(oldStats).forEach((coin:string) => {
            let coinStats:any = oldStats[coin];
            Object.keys(coinStats).forEach((statType:string) => {

                let newData = data[coin][statType].data[0];
                let newLabel = data[coin][statType].labels[0];
                oldStats[coin][statType].data.push(newData);
                oldStats[coin][statType].labels.push(newLabel);

            })
        })
        this.props.setStats(oldStats);
        if(checkStorage()) {
            let cachedStatsString = localStorage.getItem("nasfaq:stats");
            if(cachedStatsString === null) {
                let newStats = {
                    timestamp:new Date().getTime(),
                    stats:oldStats, 
                    history:this.props.stats.coinHistory
                }
                localStorage.setItem("nasfaq:stats", JSON.stringify(newStats));
            } else {
                let cachedStats = JSON.parse(cachedStatsString);
                cachedStats.timestamp = new Date().getTime();
                cachedStats.stats = oldStats;
                localStorage.setItem("nasfaq:stats", JSON.stringify(cachedStats));
            }
        }
    }

    listenData(socket:Socket) {
        socket.on('coinPriceUpdate', (data:any) => {
            this.parseCoinInfo(data);
        })
        
        socket.on('statisticsUpdate', (data:any) => {
            this.appendStatisticsUpdate(JSON.parse(data));
        })
        
        socket.on('coinHistoryUpdate', (data:any) => {
            this.addHistoryItem(JSON.parse(data));
        })

        socket.on('todayPricesUpdate', (data:any) => {
            this.parsePriceUpdate(JSON.parse(data));
        })

        socket.on('leaderboardUpdate', (data:any) => {
            this.props.setLeaderboard(JSON.parse(data).leaderboard);
        })

        socket.on('oshiboardUpdate', (data:any) => {
            this.props.setOshiboard(JSON.parse(data))
        })

        socket.on('dividendUpdate', (data:any) => {
            this.props.setWallet(data);
        })

        socket.on('marketSwitch', (data:any) => {
            this.props.setMarketSwitch(data);
        })

        socket.on('itemsUpdate', (data:any) => {
            this.props.setItems(data);
        })
    }

    componentDidMount() {
        this.reconnect();
    }

    componentWillUnmount() {
		let s = this.props.socket.socket;
		if(s !== null) s.disconnect();
        this.props.removeSocket();
    }

    render() {
        return <div></div>;
    }
}

const SocketHandler = connect(
	mapStateToProps,
	mapDispatchToProps
)(SocketHandlerBind);

export default SocketHandler;
