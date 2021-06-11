import React, { Component } from 'react';

import { connect } from 'react-redux';
import { 
    BiUpArrow,
    BiDownArrow
} from 'react-icons/bi';
import {
    GoDash
} from 'react-icons/go';
import {
    BsCaretRightFill
} from 'react-icons/bs';
import { Line } from 'react-chartjs-2';
import Button from './Button';

import Coin from './Coin';
import numberWithCommas from '../numberWithCommas';
import {IWallet} from '../interfaces/IWallet';
import { datasetTemplate } from './DatasetTemplate';

import StatRowItem from './StatRowItem';
import graphEntryFromTodayPrices from '../graphEntryFromTodayPrices';
import { ICoinDataCollection, ICoinHistory } from '../interfaces/ICoinInfo';
import getTransactionStatus from '../getTransactionStatus';
import ToggleSwitch from './ToggleSwitch';

interface BoardItemProps {
    name: string;
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
    rangeToday: boolean,
    closeBoard: () => {},
    toggleRangeToday: (coin:string, setTo:boolean) => {}
}

class BoardItemState {

    statsVisible:boolean;
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
        this.statsVisible = false;
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

class BoardItemBind extends Component<BoardItemProps> {

    state: BoardItemState;
    intervalId:any;

    constructor(props:BoardItemProps) {
        super(props);
        this.state = new BoardItemState();
    }

    formatName(name:string) {
        let coin = name === "luna" ? "himemoriluna" : name;
        return coin;
    }
    
    getLastTime(history:Array<any>) {
        return history[history.length - 1].timestamp;
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

    toggleStats() {
        this.setState({
            statsVisible: !this.state.statsVisible
        });
    }

    toggleRange(setTo?:boolean) {
        
        let b:any;
        if(setTo === undefined) {
            b = !this.props.rangeToday;
        } else {
            b = setTo;
        }
        this.props.toggleRangeToday(this.props.name, b);
        this.setGraphData(this.state.activeStat);
    }

    getSwitchState() {
        return (this.state.activeStat === "price" || this.state.activeStat === "totalOwned")
            && this.props.rangeToday;
    }

    transformPrice(y: number) {
        return Math.round(y * 100000) / 100;
    }

    filterName(name:string) {
        return (name === "luna") ? "himemoriluna" : name;
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
        fetch('/api/buyCoin/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                coin: name
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                //this.updateTransactionStatus();
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
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
        fetch('/api/sellCoin/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                coin:name
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                //this.updateTransactionStatus();
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    setGraphData(type:string) {
        
        let coin = this.formatName(this.props.name);

        let datasets: Array<any> = [];
        let dataset = {...datasetTemplate};
        let data:any = {};

        let priceData = graphEntryFromTodayPrices(this.props.stats.coinInfo.data[coin].history);
        
        switch(type) {
            case "price":
                dataset.label = "Price";
                if(this.props.rangeToday) {
                    data.labels = [...priceData.labels];
                    dataset.data = [...priceData.prices];
                } else {
                    data.labels = [
                        ...this.props.stats.coinHistory[coin].labels, 
                        new Date().toLocaleDateString()];
                    dataset.data = [
                        ...this.props.stats.coinHistory[coin].price, 
                        this.props.stats.coinInfo.data[coin].price];
                }
                break;
            case "totalOwned":
                dataset.label = "Shares in Circulation";
                if(this.props.rangeToday) {
                    data.labels = [...priceData.labels];
                    dataset.data = [...priceData.owned];
                } else {
                    data.labels = [
                        ...this.props.stats.coinHistory[coin].labels, 
                        new Date().toLocaleDateString()];
                    dataset.data = [
                        ...this.props.stats.coinHistory[coin].inCirculation, 
                        this.props.stats.coinInfo.data[coin].inCirculation];
                }
                break;
            default:
                dataset.label = type;
                data.labels = [...this.props.stats.stats[coin][type].labels];
                dataset.data = [...this.props.stats.stats[coin][type].data];
        }

        datasets.push(dataset);
        data.datasets = datasets;
        this.setState({
            graphData:data
        });

    }

    toggleActive(stat: string) {
        this.setGraphData(stat);
        this.setState({
            statsVisible:false,
            activeStat:stat
        });
    }

    componentDidUpdate(prevProps:BoardItemProps) {
        if(this.props.session.loggedin) {
            if(this.props.userinfo.wallet.balance 
                !== prevProps.userinfo.wallet.balance) {
                this.updateTransactionStatus();
            }
        }

        
        let name = this.formatName(this.props.name);
        if(this.props.rangeToday) {
            if(this.state.activeStat === "price" ||
            this.state.activeStat === "totalOwned") {
                let lastPointPrev = 
                    this.state.graphData.labels.slice(-1)[0];
                let lastPointTime = 
                    this.props.stats.coinInfo.data[name].history.slice(-1)[0].timestamp;
                let lastPointNow = 
                    new Date(lastPointTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

                if(lastPointPrev !== lastPointNow) {
                    this.setGraphData(this.state.activeStat);
                }
            }
        }

        if(this.props.rangeToday !== prevProps.rangeToday) {
            this.setGraphData(this.state.activeStat);
        }
    }

    componentDidMount() {
        this.setGraphData("price");
        this.updateTransactionStatus();
        this.intervalId = setInterval(() => {
            this.updateTransactionStatus();
        }, 1000);
        
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

    render() {
        
        if(this.props.stats.coinInfo.data === undefined) return null;
        
        let name = this.formatName(this.props.name);
        let displayName = this.props.name;
        let coinData = this.props.stats.coinInfo.data[name];
        let coinHistory = this.props.stats.coinHistory[name];
        let coinStats = this.props.stats.stats[name];

        if( coinData === undefined ||
            coinHistory === undefined ||
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
        let deltaClass;
        if(delta === 0) {
            deltaClass = "stagnant";
        } else {
            deltaClass = delta < 0 ? "decrease" : "increase";
        }

        const statsClass = this.state.statsVisible ? "active" : "";
        const fullClass = this.props.session.loggedin ? "":"full";

        let amtOwned = "";
        let meanPurchasePrice = null;
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

        return(
            <div className="board-item">
                <div className="board-item-background"></div>
                <div className="board-item-content flex-col">
                    <div 
                        className="close-board"
                        onClick={() => this.props.closeBoard()}>
                            X
                        </div>
                    <div className={`info-bar flex-row flex-center ${deltaClass}`}>
                        <Coin name={displayName}/>
                        <div className="name">{displayName.toUpperCase()}</div>
                        <div className="ask flex-col flex-center">
                            <div className="price-label">
                                ASK
                            </div>
                            <div 
                                className="price-value"
                                title={meanPurchasePrice !== null ? `Mean purchase price: $${meanPurchasePrice}` : undefined}>
                                {"$" + numberWithCommas(price) + " "}
                            </div>
                        </div>
                        <div className="bid flex-col flex-center">   
                            <div className="price-label">
                                BID
                            </div> 
                            <div 
                                className="price-value"
                                title={meanPurchasePrice !== null ? `Mean purchase price: $${meanPurchasePrice}` : undefined}>
                                {"$" + numberWithCommas(saleValue)}
                            </div>
                        </div>
                        <div className="delta">
                            {
                                this.priceDirectionIcon(delta)
                            }
                            ${Math.abs(delta)}
                        </div>
                        <div className="delta">
                            {
                                this.priceDirectionIcon(delta)
                            }
                            {Math.abs(deltaP)}%
                        </div>
                    </div>
                    <div className="action-section flex-row flex-stretch">
                        <div className="graph-container center-child">
                            <Line 
                                data={this.state.graphData} 
                                options={{
                                    animation: {
                                        duration: 300
                                    },
                                    easing: "easeInOutCubic",
                                    scales: {
                                        xAxes: [{
                                            ticks: {
                                                display:true,
                                                fontFamily:"WorkSansSemiBold"
                                            }
                                        }],
                                        yAxes: [{
                                            ticks: {
                                                fontFamily:"WorkSansSemiBold"
                                            }
                                        }]
                                    }
                                }}/> 
                        </div>
                        {
                            this.props.session.loggedin ?
                            <div className="action-container flex-col flex-center">
                                <div className="action-buttons-container flex-col">
                                    <Button
                                        timeRemaining={this.state.timeRemaining}
                                        className={`inverse green ${buyDisabled} umami--click--buy`}
                                        onClick={() => this.buy()}>
                                            BUY
                                    </Button>
                                    <Button 
                                        timeRemaining={this.state.timeRemaining}
                                        className={`inverse red ${sellDisabled} umami--click--sell`}
                                        onClick={() => this.sell()}>
                                            SELL
                                    </Button>
                                </div>
                                <div className="shares flex-col flex-center">
                                    <div className="shares-label">You own</div>
                                    <div className="shares-amount">{amtOwned}</div>
                                    <div className="shares-label">{
                                        amtOwned === "1" ? "share" : "shares"
                                    }</div>
                                </div>
                                {
                                    this.state.error !== '' ?
                                    <div className="action-error-prompt">
                                        <div className="action-error-prompt-inner">
                                            <div className="action-error-prompt-msg">
                                            {this.state.error}
                                            </div>
                                        </div>
                                    </div> : null
                                }
                            </div> : null
                        }
                        {
                            this.state.activeStat === "price" ||
                            this.state.activeStat === "totalOwned" ?
                            <ToggleSwitch
                                onLabel={"24 Hours"}
                                offLabel={"All Time"}
                                switchState={this.getSwitchState()}
                                className={"price-range-toggle"}
                                onToggle={(setTo?:boolean) => this.toggleRange(setTo)} /> : null
                        }
                    </div>
                    <div className={`stats-container flex-col flex-stretch ${statsClass} ${fullClass}`}>
                        <StatRowItem
                            activeStat={this.state.activeStat}
                            label={"Price"}
                            name={"price"}
                            value={numberWithCommas(price)}
                            toggleActive={() => this.toggleActive("price")} />
                        <StatRowItem
                            activeStat={this.state.activeStat}
                            label={"Shares in Circulation"}
                            name={"totalOwned"}
                            value={numberWithCommas(totalOwned)}
                            toggleActive={() => this.toggleActive("totalOwned")} />
                        <StatRowItem
                            activeStat={this.state.activeStat}
                            label={"Subscribers"}
                            name={"subscriberCount"}
                            value={numberWithCommas(subscriberCount)}
                            toggleActive={() => this.toggleActive("subscriberCount")} />
                        <StatRowItem
                            activeStat={this.state.activeStat}
                            label={"Daily Subscribers"}
                            name={"dailySubscriberCount"}
                            value={numberWithCommas(dailySubscriberCount)}
                            toggleActive={() => this.toggleActive("dailySubscriberCount")} />
                        <StatRowItem
                            activeStat={this.state.activeStat}
                            label={"Weekly Subscribers"}
                            name={"weeklySubscriberCount"}
                            value={numberWithCommas(weeklySubscriberCount)}
                            toggleActive={() => this.toggleActive("weeklySubscriberCount")} />
                        <StatRowItem
                            activeStat={this.state.activeStat}
                            label={"Views"}
                            name={"viewCount"}
                            value={numberWithCommas(viewCount)}
                            toggleActive={() => this.toggleActive("viewCount")} />
                        <StatRowItem
                            activeStat={this.state.activeStat}
                            label={"Daily Views"}
                            name={"dailyViewCount"}
                            value={numberWithCommas(dailyViewCount)}
                            toggleActive={() => this.toggleActive("dailyViewCount")} />
                        <StatRowItem
                            activeStat={this.state.activeStat}
                            label={"Weekly Views"}
                            name={"weeklyViewCount"}
                            value={numberWithCommas(weeklyViewCount)}
                            toggleActive={() => this.toggleActive("weeklyViewCount")} />
                        
                    </div>
                    <div 
                        className={`toggle-stats-button center-child ${statsClass} ${fullClass}`}
                        onClick={() => this.toggleStats()}>
                            <BsCaretRightFill/>
                    </div>
                </div>
            </div>
        )
    }
}

const BoardItem = connect(
    mapStateToProps
)(BoardItemBind);

export default BoardItem;