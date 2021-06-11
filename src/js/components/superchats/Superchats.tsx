import React, {Component} from 'react';
import {connect} from 'react-redux';
import CoinSidebar from '../CoinSidebar';

import '../../../css/superchats.scss';

import checkStorage from '../../checkStorage';
import { lineage } from '../Icons';
import SuperchatItem from './SuperchatItem';
import SuperchatFeed from './SuperchatFeed';

import Coin from '../Coin';
import { ISuperchat, ISuperchatDaily, ISuperchatHistory } from '../../interfaces/ISuperchats';

import { 
    superchatsActions
} from '../../actions/actions';
import numberWithCommas from '../../numberWithCommas';
import ToggleSwitch from '../ToggleSwitch';

const mapStateToProps = (state:any, props:any) => ({
    userinfo: state.userinfo,
    stats: state.stats,
    superchats: state.superchats
});

const mapDispatchToProps = {
    setCooldown: superchatsActions.setCooldown,
    setSupaDaily: superchatsActions.setSupaDaily,
    setSupaHistory: superchatsActions.setSupaHistory,
    setEnableDanmaku: superchatsActions.setEnableDanmaku
}

enum SuperView {
    panels,
    all,
    earners,
    donators
}

class SuperchatsState {
    activeCoins:Array<any>;
    storageAvailable:boolean;
    activeView:SuperView;
    constructor() {
        this.activeCoins = [];
        this.storageAvailable = false;
        this.activeView = SuperView.panels;
    }
}

interface ISuperchatsProps {
    superchats: {
        daily:{[coin:string]:ISuperchatDaily},
        history:{[coin:string]:ISuperchatHistory},
        cooldown:number,
        enableDanmaku:boolean
    },
    setCooldown: (cooldown:number) => {},
    setSupaDaily: (daily:any) => {},
    setSupaHistory: (history:any) => {},
    setEnableDanmaku: (enableDanmaku:boolean) => {}
}


type sortedEarner = {coin:string, amt:number};
type sortedDonator = {username:string, amt:number};

class SuperchatsBind extends Component<ISuperchatsProps> {
    state:SuperchatsState;
    constructor(props:ISuperchatsProps) {
        super(props);
        this.state = new SuperchatsState();
    }
    componentDidMount() {
        let coinNames:Array<String> = [];
        lineage.forEach((gen:Array<String>) => {
            coinNames = [...coinNames, ...gen]
        });
        this.setState({
            loading:true,
            coinNames,
            storageAvailable:checkStorage()
        }, () => {
            if(this.state.storageAvailable) {
                let stored = localStorage.getItem("nasfaq:activeSupers");
                if(stored !== null) {
                    let coins:Array<any> = JSON.parse(stored);
                    this.setState({
                        activeCoins:coins
                    });
                }
            }
        });
    }

    toggleCoin(coin:string) {
        let active = [...this.state.activeCoins];

        const index = active.indexOf(coin);
        if(index === -1) {
            active.push(coin);
        } else {
            active.splice(index, 1);
        }
        this.setState({
            activeCoins:active
        })
        if(this.state.storageAvailable) {
            localStorage.setItem("nasfaq:activeSupers", JSON.stringify(active));
        }
    }

    getTopDonators() {
        let daily = {...this.props.superchats.daily};
        let totals:{[key:string]:number} = {};

        // This contains the per-coin total temporarily
        let tempTotals:ISuperchatDaily;
        
        // This will temporarily store the UIDs for each user 
        // that superchatted to a certain coin
        let keys:Array<string> 
        let coins:Array<string> = Object.keys(daily);
        // For each coin
        for (let ii = 0; ii < coins.length; ii++) {

            // Grab the superchat daily
            tempTotals = daily[coins[ii]];

            // Grab all the associated UIDs
            keys = Object.keys(tempTotals.userTotals);

            // Collate their donations to that chuuba into their total amount
            for (let jj = 0; jj < keys.length; jj++) {
                let username = tempTotals.userTotals[keys[jj]].username;
                if (totals[username] === undefined) {
                    totals[username] = tempTotals.userTotals[keys[jj]].total;
                } else {
                    totals[username] += tempTotals.userTotals[keys[jj]].total;
                }
            }
        }

        let sorted:Array<sortedDonator> = [];
        Object.keys(totals).forEach((username:string) => {
            sorted.push({
                username,
                amt:totals[username]
            })
        });
        sorted.sort((a:sortedDonator, b:sortedDonator) => {
            return b.amt - a.amt;
        });
        return sorted;

    }

    getTopEarners() {
        let history = {...this.props.superchats.history};
        let sorted:Array<sortedEarner> = [];
        Object.keys(history).forEach((coin:string) => {
            if(coin !== "choco_alt") {
                sorted.push({
                    coin,
                    amt:history[coin].total
                })
            }
        });
        sorted.sort((a:sortedEarner, b:sortedEarner) => {
            return b.amt - a.amt;
        })
        return sorted;
    }

    getTopRank(ranking:Array<any>, n:number) {
        return ranking.slice(0, Math.min(n, ranking.length));
    }

    getAllSupers() {
        let history = {...this.props.superchats.history};
        let superList:Array<ISuperchat> = [];
        Object.keys(history).forEach((coin:string) => {
            let historyItem:ISuperchatHistory = history[coin];
            superList = [...superList, ...historyItem.superchats];
        });
        superList.sort((a:ISuperchat, b:ISuperchat) => {
            return a.timestamp - b.timestamp;
        });
        return superList.reverse();
    }

    getDonatorRankClass(rank:number) {
        switch(rank) {
            case 0:
                return "first-donator";
            case 1:
                return "second-donator";
            case 2:
                return "third-donator";
            default:
                return "";
        }
    }

    isLoaded() {
        return this.props.superchats.daily !== undefined 
            && this.props.superchats.history !== undefined;
    }

    filterCoin(coin:string) {
        return coin === "himemoriluna" ? "luna" : coin;
    }

    setActiveView(view:SuperView) {
        this.setState({
            activeView:view
        })
    }

    getViewTabClass(view:SuperView) {
        let viewClass = "superchats-view-tab";
        if(view === this.state.activeView) viewClass += " active";
        return viewClass;
    }

    renderActiveView() {
        switch(this.state.activeView) {
            case SuperView.panels:
                return this.state.activeCoins.map((coin:string) => 
                            <SuperchatItem 
                                key={coin}
                                coin={coin}/>
                        );
            case SuperView.all:
                return <SuperchatFeed superchats={this.getAllSupers()}/>;
            case SuperView.donators:
                return (
                    <table className="sc-ranking-table">
                    <tbody>
                    {
                        this.getTopDonators().map(
                            (donator:sortedDonator, index:number) => 
                            <tr key={donator.username}>
                                <td className="rank-number">{index + 1}.</td>
                                <td className="rank-title">{donator.username}</td>
                                <td className="rank-amount">${numberWithCommas(donator.amt)}</td>
                            </tr>
                        )
                    }
                    <tr>
                        <td></td>
                        <td className="table-spacer">
                            <Coin name="hololive"/>
                        </td>
                        <td></td>
                    </tr>
                    </tbody>
                    </table>
                )
            case SuperView.earners:
                return (
                    <table className="sc-ranking-table">
                    <tbody>
                    {
                        this.getTopEarners().map(
                            (earner:sortedEarner, index:number) =>
                            <tr key={earner.coin}>
                                <td className="rank-number">{index + 1}.</td>
                                <td><Coin name={this.filterCoin(earner.coin)}/></td>
                                <td className="rank-title">
                                    {this.filterCoin(earner.coin)}
                                </td>
                                <td className="rank-amount">${numberWithCommas(earner.amt)}</td>
                            </tr>
                        )
                    }
                    </tbody>
                    </table>
                )
            default:
                return null;
        }
    }

    toggleDanmaku(setTo?:boolean) {
        let enabled = setTo !== undefined ? setTo : !this.props.superchats.enableDanmaku;
        this.props.setEnableDanmaku(enabled);
        if(this.state.storageAvailable) {
            localStorage.setItem("nasfaq:danmakuEnabled", JSON.stringify(enabled));
        }
    }

    renderSpacer() {
        
        let shouldRender = 
            (this.state.activeView === SuperView.panels && this.state.activeCoins.length === 0)
            || (this.state.activeView === SuperView.all && this.getAllSupers().length === 0);
        if(shouldRender) {
            return(
                <div className="billboard-spacer flex flex-row flex-center">
                    <Coin name={"roboco"} />
                </div>
            )
        } else return null;
    }

    render() { 
        let rankedDonators:Array<sortedDonator> = 
            this.isLoaded() ? this.getTopRank(this.getTopDonators(), 5) : [];
        let rankedEarners:Array<sortedEarner> = 
            this.isLoaded() ? this.getTopRank(this.getTopEarners(), 3) : [];
        return(
            <div className="container fill">
                <div className="container-inner">
                    <CoinSidebar
                        toggleCoin={(coin:string) => this.toggleCoin(coin)}
                        activeCoins={this.state.activeCoins} />
                    <div className="superchats-outer center-child">
                        <div className="superchats-container">
                            <div className="superchats-billboard flex flex-col flex-center">
                                <div className="superchats-title">superchats</div>
                                <div className="superchats-description">
                                    Send your oshi a superchat with your earnings!*
                                </div>
                                <div className="superchats-disclaimer">
                                    *Not real superchats
                                </div>
                                <div className="superchats-leaders flex flex-row flex-stretch">
                                    <div className="top-earner flex flex-col flex-stretch">
                                        <div className="top-earner-title">Top Earners</div>
                                        <div className="top-earners-container flex flex-row flex-stretch">
                                            <div className="earner second-earner">
                                                {
                                                    rankedEarners.length > 1 ?
                                                    <Coin name={this.filterCoin(rankedEarners[1].coin)} /> : <div className="earner-placeholder"></div>
                                                }
                                                <div className="earner-amt">
                                                    {
                                                        rankedEarners.length > 1 ?
                                                        "$" + numberWithCommas(Math.round(rankedEarners[1].amt * 100) / 100)
                                                        : null
                                                    }
                                                </div>
                                            </div>
                                            <div className="earner first-earner">
                                                {
                                                    rankedEarners.length > 0 ?
                                                    <Coin name={this.filterCoin(rankedEarners[0].coin)} /> : <div className="earner-placeholder"></div>
                                                }
                                                <div className="earner-amt">
                                                    {
                                                        rankedEarners.length > 0 ?
                                                        "$" + numberWithCommas(Math.round(rankedEarners[0].amt * 100) / 100)
                                                        : null
                                                    }
                                                </div>
                                            </div>
                                            <div className="earner third-earner">
                                                {
                                                    rankedEarners.length > 2 ?
                                                    <Coin name={this.filterCoin(rankedEarners[2].coin)} /> : <div className="earner-placeholder"></div>
                                                }
                                                <div className="earner-amt">
                                                    {
                                                        rankedEarners.length > 2 ?
                                                        "$" + numberWithCommas(Math.round(rankedEarners[2].amt * 100) / 100)
                                                        : null
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="top-donator-container">
                                        <div className="top-donator-title">Top Donators</div>
                                        {
                                            rankedDonators.map((item:sortedDonator, index:number) => 
                                                <div 
                                                    className={`top-donator ${this.getDonatorRankClass(index)}`}
                                                    key={item.username}>
                                                    <span className="donator-rank">{index + 1}.</span>
                                                    {" " + item.username}
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                                <div className="superchats-view-select flex flex-row">
                                    <div 
                                        className={this.getViewTabClass(SuperView.panels)}
                                        onClick={() => this.setActiveView(SuperView.panels)}>Panels</div>
                                    <div 
                                        className={this.getViewTabClass(SuperView.all)}
                                        onClick={() => this.setActiveView(SuperView.all)}>All</div>
                                    <div 
                                        className={this.getViewTabClass(SuperView.earners)}
                                        onClick={() => this.setActiveView(SuperView.earners)}>Top Earners</div>
                                    <div 
                                        className={this.getViewTabClass(SuperView.donators)}
                                        onClick={() => this.setActiveView(SuperView.donators)}>Top Donators</div>
                                </div>

                                <div className="superchat-settings flex flex-row flex-center">
                                    <div className="superchats-settings-label">
                                    弾幕:
                                    </div>
                                    <ToggleSwitch
                                        onLabel={"ON"}
                                        offLabel={"OFF"}
                                        switchState={this.props.superchats.enableDanmaku}
                                        onToggle={(setTo?:boolean) => this.toggleDanmaku(setTo)}/>
                                </div>
                            </div>
                            
                            {this.renderSpacer()}
                            {this.renderActiveView()}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const Superchats = connect(
    mapStateToProps,
    mapDispatchToProps
)(SuperchatsBind);

export default Superchats;