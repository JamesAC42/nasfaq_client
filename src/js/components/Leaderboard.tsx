import React, { Component } from 'react';

import '../../css/tabbedpage.scss';
import '../../css/leaderboard.scss';
import numberWithCommas from '../numberWithCommas';
import { lineage } from './Icons';

import crown from '../../images/crown.svg';
import goldmedal from '../../images/goldmedal.svg';
import silvermedal from '../../images/silvermedal.svg';
import bronzemedal from '../../images/bronzemedal.svg';

import botangangimari from '../../images/botangangimari.png';
import witchsora from '../../images/witchsora.png';

import { connect } from 'react-redux';
import Coin from './Coin';
import LoadingSmall from './LoadingSmall';
import ToggleSwitch from './ToggleSwitch';

import { ItemImages } from './ItemImages';

import {
    FaWallet
} from 'react-icons/fa';
import {
    BsBagFill
} from 'react-icons/bs';
import { IWallet } from '../interfaces/IWallet';
import { ICoinInfo } from '../interfaces/ICoinInfo';
import { UserItems, IItem } from '../interfaces/IItem';
import fetchData from '../fetchData';
import { Themes } from '../Themes';

interface LeaderboardUser {
    userid:string,
    username:string,
    icon:string,
    networth:number,
    walletIsPublic:boolean,
    hasItems:boolean,
    color:string,
    hat:string
}

interface IOshiInfo {
    totalOwned:number,
    directors: Array<{
        username:string,
        icon:string,
        amtOwned:number,
        color:string,
        hat:string
    }>
}

interface IOshiboard {
    timestamp:number,
    coins: {
        [coin:string] : IOshiInfo
    }
}

interface LeaderboardUserProps {
    index:number,
    userinfo: {
        username:string,
        loaded:boolean
    },
    item: LeaderboardUser
}

class LeaderboardUserState {
    walletVisible: boolean;
    wallet:IWallet | null;
    itemsVisible: boolean;
    items: UserItems | null;
    loadingWallet:boolean;
    loadingItems:boolean;
    constructor() {
        this.walletVisible = false;
        this.wallet = null;
        this.loadingWallet = false;
        this.loadingItems = false;
        this.itemsVisible = false;
        this.items = null;
    }
}

class LeaderboardUserItem extends Component<LeaderboardUserProps> {
    state:LeaderboardUserState;
    constructor(props:LeaderboardUserProps) {
        super(props);
        this.state = new LeaderboardUserState();
    }
    toggleWalletVisible() {
        let walletVisible = !this.state.walletVisible;
        if(this.state.wallet === null) {
            this.setState({loadingWallet:true, walletVisible});

            let url = `/api/getUserWallet?userid=${this.props.item.userid}`;
            fetchData(url)
            .then((data:any) => {
                if(data.success) {
                    this.setState({
                        wallet:data.wallet,
                        loadingWallet:false
                    })
                } else {
                    this.setState({walletVisible:false})
                }
            })
            .catch(error => {
                console.error('Error: ' +  error);
            })
        } else {
            this.setState({walletVisible});
        }
    }
    toggleItemsVisible() {
        let itemsVisible = !this.state.itemsVisible;
        if(this.state.items === null) {
            this.setState({loadingItems:true, itemsVisible});

            fetchData(`/api/getUserItems?userid=${this.props.item.userid}`)
            .then((data:any) => {
                if(data.success) {
                    this.setState({
                        items:data.items,
                        loadingItems:false
                    })
                } else {
                    this.setState({itemsVisible:false});
                }
            })
            .catch(error => {
                console.error('Error: ' +  error);
            })
        } else {
            this.setState({itemsVisible});
        }
    }
    filterName(name:string) {
        return name === "himemoriluna" ? "luna" : name;
    }
    plural(s:string, amt:number) {
        if(amt === 1) return s;
        return s + "s";
    }
    renderWallet(){
        if(this.state.wallet === null) return null;

        let totalCoins = 0;
        let uniqueCoins = 0;
        let coinsOwned = Object.keys(this.state.wallet.coins);
        coinsOwned = coinsOwned.filter((coin:string) => {
            if(this.state.wallet !== null) {
                return this.state.wallet.coins[coin].amt > 0
            } else { return false; }
        })
        coinsOwned.forEach((coin:string) => {
            uniqueCoins++;
            if(this.state.wallet !== null) {
                totalCoins += this.state.wallet.coins[coin].amt;
            }
        })
        coinsOwned.sort();
        return(
            <div className="wallet-inner">
                <div className="wallet-statistics flex flex-row center-child">
                    <div className="wallet-stat-item">
                        <span className="stat-number">
                            {totalCoins}
                        </span> {this.plural("Total Coin", totalCoins)}
                    </div>
                    <div className="wallet-stat-item">
                        <span className="stat-number">
                            {uniqueCoins}
                        </span> {this.plural("Unique Coin", uniqueCoins)}
                    </div>
                </div>
                <div className="wallet-inner-coins">
                    {
                        coinsOwned.map((coin:string) =>
                            <div
                                className="wallet-item"
                                key={coin}>
                                <Coin name={this.filterName(coin)}/>
                                <div className="wallet-coin-amt">
                                    {this.state.wallet?.coins[coin].amt}
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        )
    }
    getItemList() {
        let itemNames:Array<IItem> = [];
        if(this.state.items) {
            Object.keys(this.state.items).forEach((itemType:string) => {
                if(this.state.items) {
                    this.state.items[itemType].forEach((item:IItem) => {
                        itemNames.push(item);
                    })
                }
            })
        }
        return itemNames;
    }
    renderItems() {
        if(this.state.items === null) return null;

        let uniqueItems = 0;
        let totalItems = 0;
        Object.keys(this.state.items).forEach((itemType:string) => {
            uniqueItems += this.state.items ? this.state.items[itemType].length : 0;
            if(this.state.items) {
                this.state.items[itemType].forEach((item:IItem) => {
                    totalItems += item.quantity;
                })
            }
        });
        let itemList = this.getItemList();
        return (
            <div className="items-inner">
                <div className="item-statistics flex flex-row center-child">
                    <div className="item-stat-item">
                        <span className="stat-number">
                            {totalItems}
                        </span> {this.plural("Total Item", totalItems)}
                    </div>
                    <div className="item-stat-item">
                        <span className="stat-number">
                            {uniqueItems}
                        </span> {this.plural("Unique Item", uniqueItems)}
                    </div>
                </div>
                <div className="items-inner-items">
                    {
                        itemList.map((item:IItem) =>
                            <div
                                key={item.itemType}
                                className="user-item flex center-child">
                                <div
                                    className="item-image flex center-child"
                                    title={item.itemType}>
                                    <img src={ItemImages[item.itemType]} alt={item.itemType}/>
                                </div>
                                <div className="item-quantity flex center-child">
                                    x {item.quantity}
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        )
    }
    renderHat() {
        if(this.props.item.hat) {
            return(
                <div className="user-hat-container">
                    <img
                        src={ItemImages[this.props.item.hat]}
                        alt={this.props.item.hat}
                        className={"user-hat " + this.props.item.hat}/>
                </div>
            )
        }
    }
    render() {
        let lbclass = 'user-row';
        if(this.props.userinfo.loaded) {
            if(this.props.userinfo.username === this.props.item.username) {
                lbclass += ' user-row-me';
            }
        }
        let nw = numberWithCommas(this.props.item.networth);
        if(nw[0] === "-") {
            nw = "-$" + nw.slice(1);
        } else {
            nw = "$" + nw;
        }
        let networthClass = this.props.item.networth <= 0 ? "net-worth debt" : "net-worth";

        return(
            <div
                className={lbclass}
                key={this.props.item.username}>
                <div className="user-rank-info">
                    <div className="user-rank">
                        {this.props.index + 1}
                    </div>
                    <div className="user-icon center-child">
                        {this.renderHat()}
                        <Coin name={this.props.item.icon} />
                    </div>
                    <div
                        className={`username ${this.props.item.color}`}
                        title={this.props.item.username}>
                            <div className="username-inner">
                            {this.props.item.username}
                            </div>
                    </div>
                    {
                        this.props.item.walletIsPublic ?
                        <div
                            className="show-wallet umami--click--view-wallet"
                            title="Show wallet"
                            onClick={() => this.toggleWalletVisible()}>
                            <FaWallet style={{verticalAlign: 'middle'}}/>
                        </div> : null
                    }
                    {
                        this.props.item.hasItems ?
                        <div
                            className="show-items"
                            title="Show items"
                            onClick={() => this.toggleItemsVisible()}>
                            <BsBagFill style={{verticalAlign: 'middle'}}/>
                        </div> : null
                    }
                    <div className={networthClass}>
                        {nw}
                    </div>
                </div>
                {
                    this.state.walletVisible ?
                    <div className="user-rank-wallet">
                        {this.state.loadingWallet ?
                            <div className="loading-container">
                                <LoadingSmall/>
                            </div> : this.renderWallet()}
                    </div> : null
                }
                {
                    this.state.itemsVisible ?
                    <div className="user-rank-items">
                        {this.state.loadingItems ?
                            <div className="loading-container">
                                <LoadingSmall/>
                            </div> : this.renderItems()}
                    </div> : null
                }
            </div>
        )
    }
}

interface OshiboardItemProps {
    name:string,
    data:IOshiInfo,
    inCirculation:number
}

class OshiboardItem extends Component<OshiboardItemProps> {

    badge(place:number) {
        if(place === 0) {
            return <img className="badge" src={crown} alt="crown" />;
        } else if(place === 1) {
            return <img className="badge" src={goldmedal} alt="gold medal" />;
        } else if(place === 2) {
            return <img className="badge" src={silvermedal} alt="silver medal" />;
        } else if(place === 3) {
            return <img className="badge" src={bronzemedal} alt="bronze medal" />;
        }else {
            return null;
        }
    }

    render() {
        if(this.props.data === undefined) return null;
        let name = this.props.name === "himemoriluna" ? "luna" : this.props.name;

        let totalInCirculation = this.props.inCirculation === 0 ? 1 : this.props.inCirculation;
        let marketShare = this.props.data.totalOwned / totalInCirculation;
        marketShare = Math.round(marketShare * 10000) / 100;
        if(Number.isNaN(marketShare)) marketShare = 0;

        return (
            <div className="oshiboard-item flex flex-row flex-stretch">
                <div className="oshi-info flex flex-col flex-center">
                    <div className="oshi-coin">
                        <Coin name={name} />
                    </div>
                    <div className="oshi-name">
                        {name}
                    </div>
                    <div className="oshi-total-owned">
                        Directors own
                        <span className="oshi-stat">
                            {" " + this.props.data.totalOwned + " "}
                        </span>
                        coin{this.props.data.totalOwned === 1 ? " " : "s "}
                        total.
                    </div>
                    <div className="oshi-market-share">
                        <span className="oshi-stat">
                        {marketShare + "% "}
                        </span>
                        market share
                    </div>
                    <div className="oshi-in-circulation">
                        out of
                        <span className="oshi-stat">
                            {" " + this.props.inCirculation + " "}
                        </span>
                        currently in circulation
                    </div>
                </div>
                <div className="directors flex flex-col">
                    {
                        this.props.data.directors.length === 0 ?
                        <div className="no-directors">
                            {name} is not anyone's oshi at the moment.
                        </div> : null
                    }
                    {
                        this.props.data.directors.map((d:any, i:number) =>
                            <div
                                className="director flex flex-row flex-center"
                                key={i}>
                                <div className="director-badge">
                                    {this.badge(i)}
                                </div>
                                <div className="director-icon">
                                    <div className="user-hat-container">
                                        <img
                                            src={ItemImages[d.hat]}
                                            alt={d.hat}
                                            className={"user-hat " + d.hat}/>
                                    </div>
                                    <Coin name={d.icon} />
                                </div>
                                <div className={`director-username ${d.color}`}>
                                    {d.username}
                                </div>
                                <div className="director-amt-owned">
                                    <span className="oshi-stat">
                                        {d.amtOwned + " "}
                                    </span>
                                    coin{d.amtOwned === 1 ? "" : "s"}
                                </div>
                                <div className="director-percent-share">
                                    <span className="oshi-stat">
                                        {Math.round((d.amtOwned / totalInCirculation) * 10000) / 100}
                                        {"% "}
                                    </span>
                                    market share
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        )
    }
}

enum activeView {
    leaderboard,
    oshiboard
}

interface LeaderboardProps {
    stats: {
        coinInfo: ICoinInfo,
        leaderboard: Array<LeaderboardUser>,
        oshiboard: IOshiboard
    },
    userinfo: {
        loaded: boolean,
        username: string
    },
    settings: {
        theme: Themes
    }
}
const mapStateToProps = (state:any, props:any) => ({
    stats: state.stats,
    userinfo: state.userinfo,
    settings: state.settings
});

class Filters {
    username: string;
    rankMin: number;
    rankMax: number;
    worthMin: number;
    worthMax: number;
    icon: string;
    public: boolean;
    private: boolean;
    coin: string;
    coinMin: number;
    coinMax: number;
    item: string;
    itemMin: number;
    itemMax: number;
    filtersOn: boolean;
    constructor() {
        this.username = "";
        this.rankMin = 0;
        this.rankMax = Infinity;
        this.worthMin = 0;
        this.worthMax = Infinity;
        this.icon = "";
        this.public = true;
        this.private = true;
        this.coin = "";
        this.coinMin = 0;
        this.coinMax = Infinity;
        this.item = "";
        this.itemMin = 0;
        this.itemMax = Infinity;
        this.filtersOn = false;
    }
}

class LeaderboardState {
    activeView:activeView;
    activePage: number;
    pageSize: number;
    showFilters: boolean;
    filters: Filters;
    filteredLeaderboard: Array<LeaderboardUser>;
    constructor() {
        this.activeView = activeView.leaderboard;
        this.activePage = 0;
        this.pageSize = 500;
        this.showFilters = false;
        this.filters = new Filters();
        this.filteredLeaderboard = [];
    }
}

type formEvent = React.ChangeEvent<HTMLInputElement>;
class LeaderboardBind extends Component<LeaderboardProps> {
    state:LeaderboardState;
    constructor(props:LeaderboardProps) {
        super(props);
        this.state = new LeaderboardState();
    }
    componentDidMount() {
        this.applyFilters();
    }
    componentDidUpdate(props:LeaderboardProps) {
        if(this.props.stats.leaderboard !== props.stats.leaderboard)
            this.applyFilters();
    }
    filterOut(user:LeaderboardUser, i:number) {
        let filters = this.state.filters;
        if(filters.username !== "")
            if(user.username.indexOf(filters.username) === -1)
                return true;
        if(filters.rankMin <= filters.rankMax && filters.rankMin > 0)
            if(i < filters.rankMin || i > filters.rankMax)
                return true;
        if(filters.worthMin <= filters.worthMax)
            if(user.networth < filters.worthMin || user.networth > filters.worthMax)
                return true;
        if(filters.icon !== "")
            if(user.icon !== filters.icon)
                return true;
        // maybe rethink this one what happens if neither? empty?
        // if(!(filters.public && filters.private))
        //     if(filters.public && !user.walletIsPublic || filters.private && user.walletIsPublic)
        //         return true;
        // need fetch for wallet and items
        // if(filters.coin !== "" && filters.coinMin <= filters.coinMax && filters.coinMin > 0) {
        //     if()
        // }
        // if(filters.item !== "" && filters.itemMin <= filters.itemMax && filters.itemMin > 0) {
        //     if()
        // }
        return false;
    }
    applyFilters() {
        let leaderboard = this.props.stats.leaderboard;
        let filters = this.state.filters;
        if(filters.filtersOn) {
            for(let i = 0; i < leaderboard.length; i++)
                if(this.filterOut(leaderboard[i], i + 1)) {
                    leaderboard.splice(i, 1);
                    i--;
                }
        }
        this.setState({filteredLeaderboard:leaderboard})
    }
    updateFilter(propName:string, value:any) {
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                [propName]: value
            }
        })
    }
    changeActiveView(view:number) {
        this.setState({
            activeView:view
        })
    }
    setActivePage(index:number) {
        this.setState({activePage:index});
    }
    getPagedUsers(users:Array<LeaderboardUser>) {
        let visibleUsers = [];
        let indexStart = this.state.pageSize * this.state.activePage;
        let indexEnd = indexStart + this.state.pageSize;
        if(indexEnd >= users.length) {
            visibleUsers = users.slice(indexStart);
        } else {
            visibleUsers = users.slice(indexStart, indexEnd)
        }
        return visibleUsers;
    }
    renderLeaderboard() {
        if(this.state.activeView === activeView.leaderboard) {
            let visibleUsers = this.getPagedUsers(this.state.filteredLeaderboard);
            let pageOffset = this.state.pageSize * this.state.activePage;
            return (
                visibleUsers.map((item:LeaderboardUser, index:number) =>
                    <LeaderboardUserItem
                        key={item.username}
                        userinfo={this.props.userinfo}
                        index={index + pageOffset}
                        item={item} />
                )
            )
        } else {
            return null;
        }
    }
    renderOshiboard() {
        if(this.props.stats.coinInfo.data === undefined) return null;
        if(this.state.activeView === activeView.oshiboard) {
            let oshiboard = this.props.stats.oshiboard;
            if(oshiboard.coins === undefined) return null;
            let coinNames:Array<string> = [];
            lineage.forEach((gen:Array<string>) => {
                coinNames = [...coinNames, ...gen]
            })
            coinNames = coinNames.map((coin:string) => {
                return coin === "luna" ? "himemoriluna" : coin;
            })
            return (
                <div className="oshiboard-outer">
                    <div className="oshiboard-description">
                        Each Holo's board of directors, made of the top 5 users
                        who hold the respective coin as their oshi.
                    </div>
                    {
                        coinNames.map((coin:string, index:number) =>
                            <OshiboardItem
                                key={index}
                                name={coin}
                                data={oshiboard.coins[coin]}
                                inCirculation={this.props.stats.coinInfo.data[coin].inCirculation} />
                        )
                    }
                </div>
            )
        } else {
            return null;
        }
    }
    getCornerImage() {
        if(this.props.settings.theme === Themes.HALLOWEEN) {
            return witchsora;
        } else {
            return botangangimari;
        }
    }
    getImageClass() {
        let cname = "corner-img bl ";
        if(this.props.settings.theme === Themes.HALLOWEEN) {
            cname += "witchsora";
        }
        return cname;
    }
    toggleFilters() {
        this.setState({showFilters:!this.state.showFilters})
    }
    render() {
        let titles = ["LEADERBOARD", "OSHIBOARD"];
        let activeTitle = titles[this.state.activeView];
        let leaderboardClass = this.state.activeView === 0 ? "view-item-active" : "";
        let oshiboardClass = this.state.activeView === 1 ? "view-item-active" : "";

        let leaderboardAmt = this.state.filteredLeaderboard.length;
        let pageAmt = Math.ceil(leaderboardAmt / this.state.pageSize);

        return(
            <div className="container tabbed-outer">
                <div className="tabbed-view-select">
                    <div
                        className={`view-item ${leaderboardClass}`}
                        onClick={() => this.changeActiveView(activeView.leaderboard)}>
                        LEADERBOARD
                    </div>
                    <div
                        className={`view-item ${oshiboardClass}`}
                        onClick={() => this.changeActiveView(activeView.oshiboard)}>
                        OSHIBOARD
                    </div>
                </div>
                <div className="tabbed-content">
                    <div className="tabbed-content-container">
                        <div className="tabbed-content-background"></div>
                        <div className="tabbed-content-content">
                            <div className="header">
                                {activeTitle}
                            </div>
                            {
                                this.state.activeView === activeView.leaderboard ?
                                    <div className="filter-container">
                                        <div className="filter-button" onClick={
                                            () => this.toggleFilters()
                                        }>
                                            Filter
                                        </div>
                                        {
                                            this.state.showFilters ?
                                            <div>
                                                <div>
                                                    Search for user <input
                                                    className="text-input"
                                                    type="text"
                                                    value={this.state.filters.username}
                                                    onChange={(e:formEvent) => {this.updateFilter("username", e.target.value)}} />
                                                </div>
                                                <div>
                                                    Rank <input
                                                    className="text-input"
                                                    type="text"
                                                    value={this.state.filters.rankMin}
                                                    onChange={(e:formEvent) => {
                                                        let val = e.target.value === "" ? 0 : parseInt(e.target.value)
                                                        if(!isNaN(val)) this.updateFilter("rankMin", val)
                                                    }} /> - <input
                                                    className="text-input"
                                                    type="text"
                                                    value={this.state.filters.rankMax}
                                                    onChange={(e:formEvent) => {
                                                        let val = e.target.value === "" ? 0 : parseInt(e.target.value)
                                                        if(!isNaN(val)) this.updateFilter("rankMax", val)
                                                    }} />
                                                </div>
                                                <div>
                                                    Net worth <input
                                                    className="text-input"
                                                    type="text"
                                                    value={this.state.filters.worthMin}
                                                    onChange={(e:formEvent) => {
                                                        let val = e.target.value === "" ? 0 : parseFloat(e.target.value)
                                                        if(!isNaN(val)) this.updateFilter("worthMin", val)
                                                    }} /> - <input
                                                    className="text-input"
                                                    type="text"
                                                    value={this.state.filters.worthMax}
                                                    onChange={(e:formEvent) => {
                                                        let val = e.target.value === "" ? 0 : parseFloat(e.target.value)
                                                        if(!isNaN(val)) this.updateFilter("worthMax", val)
                                                    }} />
                                                </div>
                                                <div>
                                                    Icon selector (maybe new component)
                                                </div>
                                                <div>
                                                    Has [coin dropdown] with quantity <input
                                                    className="text-input"
                                                    type="text"
                                                    value={this.state.filters.coinMin}
                                                    onChange={(e:formEvent) => {
                                                        let val = e.target.value === "" ? 0 : parseInt(e.target.value)
                                                        if(!isNaN(val)) this.updateFilter("coinMin", val)
                                                    }} /> - <input
                                                    className="text-input"
                                                    type="text"
                                                    value={this.state.filters.coinMax}
                                                    onChange={(e:formEvent) => {
                                                        let val = e.target.value === "" ? 0 : parseInt(e.target.value)
                                                        if(!isNaN(val)) this.updateFilter("coinMax", val)
                                                    }} />
                                                </div>
                                                <div>
                                                    Has [item dropdown] with quantity <input
                                                    className="text-input"
                                                    type="text"
                                                    value={this.state.filters.itemMin}
                                                    onChange={(e:formEvent) => {
                                                        let val = e.target.value === "" ? 0 : parseInt(e.target.value)
                                                        if(!isNaN(val)) this.updateFilter("itemMin", val)
                                                    }} /> - <input
                                                    className="text-input"
                                                    type="text"
                                                    value={this.state.filters.itemMax}
                                                    onChange={(e:formEvent) => {
                                                        let val = e.target.value === "" ? 0 : parseInt(e.target.value)
                                                        if(!isNaN(val)) this.updateFilter("itemMax", val)
                                                    }} />
                                                </div>
                                                Filtering:
                                                <ToggleSwitch
                                                onLabel={"ON"}
                                                offLabel={"OFF"}
                                                switchState={this.state.filters.filtersOn}
                                                onToggle={() => this.updateFilter("filtersOn", !this.state.filters.filtersOn)} />
                                                <button onClick={() => this.applyFilters()}>Apply Filters</button>
                                            </div>
                                            : null
                                        }

                                    </div>
                                : null
                            }
                            {
                                this.state.activeView === activeView.leaderboard
                                && this.state.filteredLeaderboard.length > this.state.pageSize ?
                                    <div className="pagenav">
                                    {
                                        [...Array(pageAmt)].map((item:number, index:number) =>
                                            <div
                                            className={`page-select
                                                ${index === this.state.activePage ? "active-page" : ""}`
                                            }
                                            key={index}
                                            onClick={() => this.setActivePage(index)}>
                                                {index + 1}</div>
                                        )
                                    }
                                    </div>
                                : null
                            }
                            {this.renderLeaderboard()}
                            {this.renderOshiboard()}
                        </div>
                    </div>
                </div>
                <img className={this.getImageClass()} src={this.getCornerImage()} alt="botan"/>
            </div>
        )
    }
}

const Leaderboard = connect(
    mapStateToProps
)(LeaderboardBind);

export default Leaderboard;
