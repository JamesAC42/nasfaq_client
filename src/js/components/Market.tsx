import React, { Component } from 'react';

import '../../css/market.scss';
import iconMap, { lineage } from './Icons';

import checkStorage from '../checkStorage';
import { connect } from 'react-redux';

import {IWallet} from '../interfaces/IWallet';
import tako from '../../images/tako.png';
import fubogki from '../../images/fubogki.png';

import BoardItem from './BoardItem';
import DropdownInput from './DropdownInput';

import AutoTraderEditor from './autotrader/AutoTraderEditor';

import CoinSidebar from './CoinSidebar';

import {
    FaSortAmountDownAlt,
    FaSortAmountUpAlt
} from 'react-icons/fa';

import {
    AiFillSchedule
} from 'react-icons/ai';

import {
    RiLayoutGridFill
} from 'react-icons/ri';

import {
    HiOutlineViewList
} from 'react-icons/hi';

import { Loading } from './Loading';
import { ICoinDataCollection, ICoinHistory } from '../interfaces/ICoinInfo';
import CompactBoardItem from './CompactBoardItem';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

const mapMarketStateToProps = (state:any, props:any) => ({
    userinfo: state.userinfo,
    stats: state.stats,
    session: state.session
});
type formEvent = React.ChangeEvent<HTMLInputElement>;

enum SortMethod {
    NONE,
    ALPH,
    PRICE,
    GEN,
    CHANGE,
    PCHANGE,
    MINE,
    VOLUME,
    SUBS,
    DSUBS,
    WSUBS,
    VIEWS,
    DVIEWS,
    WVIEWS
}

interface MarketProps {
    userinfo: {
        loaded: boolean,
        wallet: IWallet
    },
    session: {
        loggedin: boolean
    },
    stats: {
        stats: {
            [key:string]:any
        },
        coinHistory: ICoinHistory,
        coinInfo: ICoinDataCollection
    }
}

class MarketState {
    activeCoins: Array<any>;
    storageAvailable: boolean;
    loading:boolean;
    showSearchBar:boolean;
    coinNames:Array<string>;
    sortMethod:SortMethod | null;
    reverseSort:boolean;
    filterAbove:number;
    filterBelow:number;
    compactView:boolean;
    showAutoTrader:boolean;
    constructor() { 
        this.activeCoins = [];
        this.storageAvailable = false;
        this.loading = false;
        this.coinNames = [];
        this.showSearchBar = false;
        this.sortMethod = SortMethod.GEN;
        this.reverseSort = false;
        this.filterAbove = Number.NEGATIVE_INFINITY;
        this.filterBelow = Number.POSITIVE_INFINITY;
        this.compactView = false;
        this.showAutoTrader = false;
    }
}

class MarketBind extends Component<MarketProps> {

    state: MarketState;

    constructor(props:MarketProps) {
        super(props);
        this.state = new MarketState();
    }

    getLastTime(history:Array<any>) {

        return history[history.length - 1].timestamp;

    }

    search = (a:formEvent) => {

        if(a.target.value === "") return;

        let coins = [...this.state.coinNames];
        let matches:Array<string> = [];
        
        coins.forEach((coin:string) => {
            if(coin.startsWith(a.target.value)) {
                matches.push(coin);
            }
        })

        let coinMatch = document.getElementById(matches[0]);
        if(coinMatch !== null) {
            let options:any = navigator.userAgent.indexOf("Firefox") > 0 ?
                {behavior:"smooth"} : {behavior:"auto"}
            coinMatch.scrollIntoView(options);
        }

    }

    toggleAutoTrader() {
        this.setState({
            showAutoTrader: !this.state.showAutoTrader
        });
    }

    getCoinPrice(coin:string) {
        let name = coin === "luna" ? "himemoriluna" : coin;
        let coinInfo:ICoinDataCollection = this.props.stats.coinInfo;
        return coinInfo.data[name].price;
    }
    
    getCoinVolume(coin:string) {
        let name = coin === "luna" ? "himemoriluna" : coin;
        let coinInfo:ICoinDataCollection = this.props.stats.coinInfo;
        return coinInfo.data[name].inCirculation;
    }

    getMyShares(coin:string) {
        let name = coin === "luna" ? "himemoriluna" : coin;
        let v = this.props.userinfo.wallet.coins[name];
        if(v === undefined) {
            return 0;
        } else {
            return v.amt;
        }
    }

    getCoinStat(coin:string, stat:string) {
        let name = coin === "luna" ? "himemoriluna" : coin;
        let coinStat:any = this.props.stats.stats[name][stat].data.slice(-1)[0];
        return parseInt(coinStat);
    }

    getCoinChange(coin:string) {
        let name = coin === "luna" ? "himemoriluna" : coin;
        let coinInfo:ICoinDataCollection = this.props.stats.coinInfo;
        let currentPrice = coinInfo.data[name].price;
        let previousPrice;
        if(this.props.stats.coinHistory[name] === undefined) {
            previousPrice = currentPrice;
        } else {
            if(this.props.stats.coinHistory[name].price.length > 1) {
                previousPrice = this.props.stats.coinHistory[name].price.slice(-1)[0];
            } else {
                previousPrice = currentPrice;
            }
        }
        let change = Math.round((currentPrice - previousPrice) * 100) / 100;
        return change;
    }

    notLoaded(props:MarketProps) {
        return (
            (props.stats.stats["aki"] === undefined) ||
            (props.stats.coinInfo.data === undefined) ||
            (props.stats.coinHistory["aki"] === undefined));
    }

    loaded(props:MarketProps) {
        return (
            (props.stats.stats["aki"] !== undefined) &&
            (props.stats.coinInfo.data !== undefined) &&
            (props.stats.coinHistory["aki"] !== undefined));
    }

    componentDidUpdate(prevProps:MarketProps) {
        if(this.notLoaded(prevProps) && this.loaded(this.props)) {
            if(this.state.storageAvailable) {
                let storedBoards = localStorage.getItem("nasfaq:activeCoins");
                if(storedBoards !== null) {
    
                    let activeCoins = JSON.parse(storedBoards);
                    this.setState({
                        activeCoins,
                        loading:false
                    })
                } else {
                    this.setState({loading:false});
                }
            }
        }
    }

    hideAll() {
        const activeCoins:any = [];   
        this.setState({
            activeCoins
        })
        if(this.state.storageAvailable) {
            localStorage.setItem("nasfaq:activeCoins", JSON.stringify(activeCoins));
        }
    }

    sortCoins(activeCoins:Array<any>):Array<any> {
        if(this.state.sortMethod === null) {
            return activeCoins;
        }
        let sorted:Array<any> = [...activeCoins];
        if(this.state.sortMethod === SortMethod.ALPH) {
            sorted.sort((a:any, b:any) => 
                a.name.localeCompare(b.name)
            )
        } else if(this.state.sortMethod === SortMethod.GEN) {
            let coinNames:Array<String> = [];
            lineage.forEach((gen:Array<String>) => {
                coinNames = [...coinNames, ...gen]
            })
            sorted.sort((a:any, b:any) => {
                return coinNames.indexOf(a.name) - coinNames.indexOf(b.name)
            });
        } else if(this.state.sortMethod === SortMethod.PRICE) {
            sorted.sort((a:any, b:any) => {
                return this.getCoinPrice(a.name) - 
                    this.getCoinPrice(b.name);
            })
        } else if(this.state.sortMethod === SortMethod.CHANGE) {
            sorted.sort((a:any, b:any) => {
                return this.getCoinChange(a.name) -
                    this.getCoinChange(b.name)
            })
        } else if(this.state.sortMethod === SortMethod.PCHANGE) {
            sorted.sort((a:any, b:any) => {
                return (this.getCoinChange(a.name) / this.getCoinPrice(a.name))
                    - (this.getCoinChange(b.name) / this.getCoinPrice(b.name));
            })
        } else if(this.state.sortMethod === SortMethod.MINE) {
            sorted.sort((a:any, b:any) => {
                return this.getMyShares(a.name) - this.getMyShares(b.name);
            })
        } else if(this.state.sortMethod === SortMethod.VOLUME) {
            sorted.sort((a:any, b:any) => {
                return this.getCoinVolume(a.name) - this.getCoinVolume(b.name);
            })
        } else if(this.state.sortMethod === SortMethod.SUBS) {
            sorted.sort((a:any, b:any) => {
                return this.getCoinStat(a.name, "subscriberCount") 
                - this.getCoinStat(b.name, "subscriberCount");
            })
        } else if(this.state.sortMethod === SortMethod.DSUBS) {
            sorted.sort((a:any, b:any) => {
                return this.getCoinStat(a.name, "dailySubscriberCount") 
                - this.getCoinStat(b.name, "dailySubscriberCount");
            })
        } else if(this.state.sortMethod === SortMethod.WSUBS) {
            sorted.sort((a:any, b:any) => {
                return this.getCoinStat(a.name, "weeklySubscriberCount") 
                - this.getCoinStat(b.name, "weeklySubscriberCount");
            })
        } else if(this.state.sortMethod === SortMethod.VIEWS) {
            sorted.sort((a:any, b:any) => {
                return this.getCoinStat(a.name, "viewCount") 
                - this.getCoinStat(b.name, "viewCount");
            })
        } else if(this.state.sortMethod === SortMethod.DVIEWS) {
            sorted.sort((a:any, b:any) => {
                return this.getCoinStat(a.name, "dailyViewCount") 
                - this.getCoinStat(b.name, "dailyViewCount");
            })
        } else if(this.state.sortMethod === SortMethod.WVIEWS) {
            sorted.sort((a:any, b:any) => {
                return this.getCoinStat(a.name, "weeklyViewCount") 
                - this.getCoinStat(b.name, "weeklyViewCount");
            })
        }
        if(this.state.reverseSort) {
            sorted.reverse();
        }
        return sorted;
    }

    updateSortMethod(val:string) {
        let newMethod;
        switch(val) {
            case "Generation":
                newMethod = SortMethod.GEN;
                break;
            case "Name":
                newMethod = SortMethod.ALPH;
                break;
            case "Price":
                newMethod = SortMethod.PRICE;
                break;
            case "Change":
                newMethod = SortMethod.CHANGE;
                break;
            case "% Change":
                newMethod = SortMethod.PCHANGE;
                break;
            case "Mine":
                newMethod = SortMethod.MINE;
                break;
            case "Volume":
                newMethod = SortMethod.VOLUME;
                break;
            case "Subs":
                newMethod = SortMethod.SUBS;
                break;
            case "Daily Subs":
                newMethod = SortMethod.DSUBS;
                break;
            case "Weekly Subs":
                newMethod = SortMethod.WSUBS;
                break;
            case "Views":
                newMethod = SortMethod.VIEWS;
                break;
            case "Daily Views":
                newMethod = SortMethod.DVIEWS;
                break;
            case "Weekly Views":
                newMethod = SortMethod.WVIEWS;
                break;
            default:
                newMethod = null;
        }
        this.setState({
            sortMethod:newMethod
        });
    }

    compactSort(method:SortMethod) {
        new Promise((resolve:any, reject:any) => {
            if(this.state.sortMethod === method) {
                this.setState({
                    reverseSort: !this.state.reverseSort
                }, () => resolve())
            } else resolve()
        })
        .then(() => {
            this.setState({
                sortMethod:method
            }, () => {
                this.applyFilters();
            })
        })
    }

    updatePriceFilter(ev:formEvent, min:boolean) {
        let price = parseFloat(ev.target.value);
        if(isNaN(price)) {
            price = min ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
        }
        let key = min ? "filterAbove" : "filterBelow";
        this.setState({
            [key]: price
        })
    }

    showAll() {
        let activeCoins:Array<any> = [];
        lineage.forEach((gen:Array<String>) => {
            activeCoins = [...activeCoins, 
            ...gen.map((coin:String) => {
                return {
                    name:coin,
                    rangeToday:true
                }
            })]
        });
        this.setState({
            loading:true
        }, () => {
            activeCoins = this.filterByPrice(activeCoins);
            activeCoins = this.sortCoins(activeCoins);
            this.setState({
                activeCoins,
                loading:false
            })
            if(this.state.storageAvailable) {
                localStorage.setItem("nasfaq:activeCoins", JSON.stringify(activeCoins));
            }
        })
    }

    filterByPrice(activeCoins:Array<any>) {
        let filtered = activeCoins.filter((coin:any) => {
            let price = this.getCoinPrice(coin.name);
            return this.state.filterAbove <= price 
                && this.state.filterBelow >= price;
        });
        return filtered;
    }

    toggleReverseSort() {
        this.setState({
            reverseSort: !this.state.reverseSort
        })
    }

    legacyTransform(activeCoins:Array<any>) {
        activeCoins = activeCoins.map((coin:any) => {
            if((typeof coin) === 'string') {
                return {
                    name:coin,
                    rangeToday:true
                }
            } else {
                return coin
            }
        });
        return activeCoins;
    }

    applyFilters() {
        this.setState({
            loading:true
        }, () => {
            let activeCoins = [...this.state.activeCoins];
            activeCoins = this.legacyTransform(activeCoins);
            activeCoins = this.filterByPrice(activeCoins);
            activeCoins = this.sortCoins(activeCoins);
            this.setState({
                activeCoins,
                loading:false
            })
            if(this.state.storageAvailable) {
                localStorage.setItem("nasfaq:activeCoins", JSON.stringify(activeCoins));
            }
        })
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
                if(this.loaded(this.props)) {
                    let stored = localStorage.getItem("nasfaq:activeCoins");
                    if(stored !== null) {
                        let boards:Array<any> = JSON.parse(stored);
                        this.setState({
                            activeCoins:boards,
                            loading:false
                        });
                    } else {
                        this.setState({loading:false});
                    }
                } else {
                    this.setState({loading:false});
                }
                let compact = localStorage.getItem("nasfaq:compactView");
                if(compact !== null) {
                    this.setState({
                        compactView:JSON.parse(compact)
                    })
                }
            }
        });
    }

    toggleCompact() {
        let toggled = !this.state.compactView;
        this.setState({
            compactView:toggled
        });
        if(this.state.storageAvailable) {
            localStorage.setItem("nasfaq:compactView", JSON.stringify(toggled));
        }
    }

    toggleCoin(coin:string) {
        if(this.state.loading) return;
        let active = [...this.state.activeCoins];

        let activeNames:Array<string> = this.getActiveCoinNames();

        const index = activeNames.indexOf(coin);
        let tcResult = new Promise((resolve:any, reject:any) => {
            if(index === -1) {

                const newActive = {
                    name:coin,
                    rangeToday: true
                };

                active.push(newActive);
                resolve(active);

            } else {
                active.splice(index, 1);
                resolve(active);
            }
        })
        tcResult.then((activeCoins:any) => {
            this.setState({
                activeCoins
            })
            if(this.state.storageAvailable) {
                localStorage.setItem("nasfaq:activeCoins", JSON.stringify(activeCoins));
            }
        })
        .catch(() => {
            console.log("data wasn't loaded");
        })
    }

    getActiveCoinNames() {
        const active = [...this.state.activeCoins];
        const activeNames = active.map((activeCoin:any) => {
            if((typeof activeCoin) === "string") {
                return activeCoin;
            } else {
                return activeCoin.name;
            }
        });
        return activeNames;
    }

    toggleCoinRange(coin:string, setTo:boolean) {

        const active = [...this.state.activeCoins];
        const activeNames:Array<string> = this.getActiveCoinNames();
        if(activeNames.indexOf(coin) === -1) {
            return;
        }
        const newActiveCoin = {
            name:coin,
            rangeToday:setTo
        };
        let activeIndex = activeNames.indexOf(coin);
        active[activeIndex] = newActiveCoin;

        this.setState({
            activeCoins:active
        });
        
        if(this.state.storageAvailable) {
            localStorage.setItem("nasfaq:activeCoins", JSON.stringify(active));
        }
    }

    renderBoardItem(coin:any, index:number) {
        let coinname:string;
        let range:boolean;
        if((typeof coin) === "string") {
            coinname = coin;
            range = true;
        } else {
            coinname = coin.name;
            range = coin.rangeToday;
        }
        return (
            <BoardItem 
                toggleRangeToday={(c:string, setTo:boolean) => 
                    this.toggleCoinRange(c, setTo)}
                index={index}
                rangeToday={range}
                closeBoard={() => this.toggleCoin(coinname)}
                name={coinname}
                key={coinname}/>
        )
    }

    renderCompactBoardItem(coin:any, index:number) {
        let coinname:string;
        if((typeof coin) === "string") {
            coinname = coin;
        } else {
            coinname = coin.name;
        }
        return(
            <CompactBoardItem
                closeBoard={() => this.toggleCoin(coinname)}
                name={coinname}
                index={index}
                key={coinname} />
        )
    }

    onDragEnd(result:any) {
        
        const {destination, source} = result;
        if(!destination) return;
        if(
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) return;

        let active = [...this.state.activeCoins];
        let thing:any;
        if(typeof active[source.index] === "string") {
            thing = active[source.index];
        } else {
            thing = {...active[source.index]}
        }
        active.splice(source.index, 1);
        active.splice(destination.index, 0, thing);
        this.setState({
            activeCoins:active
        });
        
        if(this.state.storageAvailable) {
            localStorage.setItem("nasfaq:activeCoins", JSON.stringify(active));
        }
        
    }

    renderBoards() {
        if(this.state.loading) return null;
        if(this.notLoaded(this.props)) return null;
        if(this.state.compactView) {
            return(
                this.state.activeCoins.length > 0 ?
                <DragDropContext
                    onDragEnd={(result:any) => this.onDragEnd(result)}>
                    <div className="compact-board-container">
                        <table>
                            <thead>
                                <tr className="compact-board-header">
                                    <th></th>
                                    <th></th>
                                    <th onClick={() => this.compactSort(SortMethod.ALPH)}></th>
                                    {this.props.session.loggedin ? <th></th> : null}
                                    {this.props.session.loggedin ? <th></th> : null}
                                    <th onClick={() => this.compactSort(SortMethod.PRICE)}>Ask</th>
                                    <th onClick={() => this.compactSort(SortMethod.PRICE)}>Bid</th>
                                    <th onClick={() => this.compactSort(SortMethod.CHANGE)}>Change</th>
                                    <th onClick={() => this.compactSort(SortMethod.PCHANGE)}>% Change</th>
                                    {
                                        this.props.session.loggedin ? 
                                        <th onClick={() => this.compactSort(SortMethod.MINE)}>
                                            My Shares
                                        </th> : null
                                    }
                                    <th onClick={() => this.compactSort(SortMethod.VOLUME)}>Volume</th>
                                    <th onClick={() => this.compactSort(SortMethod.SUBS)}>Subscribers</th>
                                    <th onClick={() => this.compactSort(SortMethod.DSUBS)}>Daily Subs</th>
                                    <th onClick={() => this.compactSort(SortMethod.WSUBS)}>Weekly Subs</th>
                                    <th onClick={() => this.compactSort(SortMethod.VIEWS)}>Views</th>
                                    <th onClick={() => this.compactSort(SortMethod.DVIEWS)}>Daily Views</th>
                                    <th onClick={() => this.compactSort(SortMethod.WVIEWS)}>Weekly Views</th>
                                </tr>
                            </thead>
                            <Droppable droppableId={"compact-board-items"}>
                                {(provided) => (
                                <tbody
                                    ref={provided.innerRef} 
                                    {...provided.droppableProps}>
                                    {
                                        this.state.activeCoins.map((item:any, index:number) => 
                                            this.renderCompactBoardItem(item, index)
                                        )
                                    }
                                </tbody>
                                )}
                            </Droppable>
                        </table>
                    </div>
                </DragDropContext>
                :
                <div className="no-coins">NO COINS SELECTED</div>
            )
        } else {
            return(
                this.state.activeCoins.length > 0 ?
                <div className="board-container">
                    {
                        this.state.activeCoins.map((item:any, index:number) => 
                            this.renderBoardItem(item, index)
                        )
                    }
                </div>
                :
                <div className="no-coins">NO COINS SELECTED</div>
            )
        }
    }

    render() {
        let searchbarClass = this.state.showSearchBar ? "visible" : "";
        let sortMethods = ["Price", "Generation", "Name", "Change", "% Change", 
                                "Volume", "Subs", "Daily Subs", "Weekly Subs", "Views", "Daily Views", "Weekly Views"];
        if(this.props.session.loggedin) sortMethods.splice(5, 0, "Mine");
        return(
            <div className="container fill">
                <div className="container-inner">

                    {
                        this.state.showAutoTrader ?
                        <AutoTraderEditor 
                            toggleVisible={() => this.toggleAutoTrader()}/> 
                        : null
                    }

                    <div className="tako-box">
                        <img src={tako} alt="tako" className="tako"/>
                    </div>
                    <div className={`coin-searchbar ${searchbarClass}`}>
                        <div className={`coin-searchbar-inner`}>
                            <input 
                                type="text"
                                className="search-input"
                                placeholder="Search..."
                                onChange={(
                                    ev: formEvent,
                                ): void => this.search(ev)}/>
                                
                            <div className="toggle-all-boards flex flex-row flex-stretch">
                                <div 
                                    className="show-all"
                                    onClick={() => this.showAll()}>
                                    Show All
                                </div>
                                <div 
                                    className="hide-all"
                                    onClick={() => this.hideAll()}>
                                    Hide All
                                </div>
                            </div>
                            <div className="sort-method flex flex-row flex-center">
                                <DropdownInput
                                    label="Sort by: "
                                    options={sortMethods}
                                    default={"Generation"}
                                    onChange={(val:any) => this.updateSortMethod(val)} />
                                <div 
                                    className="sort-ordering"
                                    title={this.state.reverseSort ? "Decreasing" : "Increasing"}
                                    onClick={() => this.toggleReverseSort()}>
                                    {
                                        this.state.reverseSort ?
                                        <FaSortAmountDownAlt/>
                                        :
                                        <FaSortAmountUpAlt/>
                                    }
                                </div>
                            </div>
                            <div className="price-range flex flex-row flex-stretch">
                                <div className="price-input-container flex flex-col flex-center">
                                    <div className="price-filter-label">
                                        Minimum Price
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="$" 
                                        className="price-filter"
                                        onChange={(
                                            ev: formEvent,
                                        ): void => this.updatePriceFilter(ev, true)}/>
                                </div>
                                <div className="price-input-container flex flex-col flex-center">
                                    <div className="price-filter-label">
                                        Maximum Price
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="$" 
                                        className="price-filter"
                                        onChange={(
                                            ev: formEvent,
                                        ): void => this.updatePriceFilter(ev, false)}/>
                                </div>
                            </div>
                            <div className="apply-filter-outer flex flex-row flex-center">
                                <div 
                                    className="apply-filter-btn"
                                    onClick={() => this.applyFilters()}>
                                    Apply to Active
                                </div>
                                <div 
                                    className="toggle-compact"
                                    title={this.state.compactView ?
                                        "Compact View" : "Module View"}
                                    onClick={() => this.toggleCompact()}>
                                    {
                                        this.state.compactView ?
                                        <HiOutlineViewList style={{verticalAlign:"middle"}}/>
                                        :
                                        <RiLayoutGridFill style={{verticalAlign:"middle"}}/>
                                    }
                                </div>
                            </div>
                            <div className="toggle-auto-trader flex flex-row flex-center">
                                <div
                                    onClick={() => this.toggleAutoTrader()} 
                                    className="toggle-auto-trader-button">
                                    <AiFillSchedule />
                                </div>
                            </div>
                            
                            <div
                                className="searchbar-tab"
                                onClick={() => this.setState({
                                    showSearchBar:!this.state.showSearchBar
                                })}>
                                <img src={iconMap.amelia} alt="Search"/>
                            </div>
                        </div>
                    </div>
                    <CoinSidebar
                        toggleCoin={(coin:string) => this.toggleCoin(coin)}
                        activeCoins={this.state.activeCoins} />
                    <div className="board-outer center-child">
                        {
                            this.state.loading ?
                            <div className="not-loaded"><Loading /></div> : null
                        }
                        {
                            this.renderBoards()
                        }
                    </div> 
                </div>
            </div>
        )
    }
}

const Market = connect(
    mapMarketStateToProps,
    null
)(MarketBind);

export default Market;
