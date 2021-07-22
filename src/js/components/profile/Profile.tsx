import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';

import '../../../css/profile/profile.scss';
import '../../../css/profile/items.scss';
import '../../../css/dialogue.scss';

import numberWithCommas from '../../numberWithCommas';

import { Line } from 'react-chartjs-2';
import Coin from '../Coin';

import {lineage} from '../Icons';

import Asset from './ProfileAsset';
import DeleteAccountDialogue from './DeleteAccountDialogue';
import UpdateIconDialogue from './UpdateIconDialogue';
import NotVerified from './NotVerified';
import UserInfoFormItem from './UserInfoFormItem';
import SettingsDialogue from './SettingsDialogue';
import MutedMessage from './MutedMessage';

import { 
    BiUpArrow,
    BiDownArrow
} from 'react-icons/bi';
import {
    HiOutlineTrash
} from 'react-icons/hi';
import {
    BsGearFill
} from 'react-icons/bs';

import {
    FaCoins
} from 'react-icons/fa';
import {IMyCoin, IWallet} from '../../interfaces/IWallet';
import { UserItems, IItemCatalogue } from '../../interfaces/IItem';
import {IPerformance, IPerformanceHistory} from '../../interfaces/Performance';

import { datasetTemplate } from '../DatasetTemplate';
import { ICoinDataCollection, ICoinHistory } from '../../interfaces/ICoinInfo';
import { Loading } from '../Loading';
import { Link } from 'react-router-dom';
import Items from './Items';

const mapStateToProps = (state:any, props:any) => ({
    session: state.session,
    userinfo: state.userinfo,
    stats: state.stats,
    itemcatalogue: state.itemcatalogue
});

interface ProfileProps {
    session: {
        loggedin: boolean
    },
    userinfo: {
        username:string,
        email:string,
        wallet:IWallet,
        icon:string,
        verified:boolean,
        loaded:boolean,
        muted:string,
        items:UserItems,
        performance:IPerformanceHistory
    },
    itemcatalogue:IItemCatalogue,
    stats: {
        stats: {
            [key:string]:any
        },
        coinHistory: ICoinHistory,
        coinInfo: ICoinDataCollection
    }
}

class ProfileState {
    iconDialogueVisible: boolean;
    deleteAccountDialogueVisible: boolean;
    settingsDialogueVisible: boolean;
    username:string;
    email:string;
    redirect:boolean;
    error:string;
    coins:Array<string>;
    constructor() {
        this.iconDialogueVisible = false;
        this.deleteAccountDialogueVisible = false;
        this.settingsDialogueVisible = false;
        this.redirect = false;
        this.username = "";
        this.email = "";
        this.error = "";
        this.coins = [];
    }
}

class ProfileBind extends Component<ProfileProps> {

    state: ProfileState;

    constructor(props:ProfileProps) {
        super(props);
        this.state = new ProfileState();
    }

    getNetWorth() {
        let wallet:IWallet = this.props.userinfo.wallet;
        let coins = Object.keys(wallet.coins);
        let netWorth:number = wallet.balance;
        coins.forEach((coin:string) => {
            if(this.props.stats.coinInfo.data[coin] !== undefined) {
                let value = this.props.stats.coinInfo.data[coin].price;
                netWorth += value * wallet.coins[coin].amt;
            }
        })
        return Math.round(netWorth * 100) / 100;
    }

    getGraphData() {
        
        if(!this.props.userinfo.loaded) return;
        let datasets: Array<any> = [];
        let dataset = {...datasetTemplate};
        let data:any = {};

        dataset.label = "Performance History";

        let labels:any = [];
        let values:any = [];
        let performance:IPerformanceHistory = this.props.userinfo.performance;
        performance.forEach((day:IPerformance) => {
            labels.push(new Date(day.timestamp).toLocaleDateString());
            values.push(day.worth);
        })

        labels.push(new Date().toLocaleString());
        values.push(this.getNetWorth());

        data.labels = labels;
        dataset.data = values;

        datasets.push(dataset);
        data.datasets = datasets;
        return data;
    }

    deleted() {
        this.setState({redirect:true})
    }

    toggleIconDialogue() {
        this.setState({
            iconDialogueVisible: !this.state.iconDialogueVisible
        });
        return;
    }

    toggleDeleteDialogue() {
        this.setState({
            deleteAccountDialogueVisible: !this.state.deleteAccountDialogueVisible
        });
    }

    toggleSettingsDialogue() {
        this.setState({
            settingsDialogueVisible: !this.state.settingsDialogueVisible
        });
    }
    
    formatPrice(price:number):String {
        let priceString = '';
        if(price < 0) priceString += "-";
        priceString += "$" + numberWithCommas(Math.round(Math.abs(price) * 100) / 100);
        return priceString;
    }

    filterCoinsFromWallet(wallet:any) {
        let coins = Object.keys(wallet.coins);
        let activeCoins = coins.filter((c:string) => {
            return wallet.coins[c].amt > 0;
        })
        return activeCoins;
    }

    componentDidMount() {
        if(this.props.userinfo.wallet !== undefined) {
            let activeCoins = this.filterCoinsFromWallet(this.props.userinfo.wallet);
            this.sortCoins(activeCoins);
            this.setState({
                coins:activeCoins
            })
        }
    }

    componentDidUpdate(prevProps:ProfileProps) {
        let activePrev = this.filterCoinsFromWallet(prevProps.userinfo.wallet);
        let activeNow = this.filterCoinsFromWallet(this.props.userinfo.wallet);
        if(activePrev.length !== activeNow.length) {
            this.sortCoins(activeNow);
            this.setState({
                coins:activeNow
            })
        }
    }

    sortCoins(coins:Array<string>) {
        let gen:Array<string> = [];
        lineage.forEach((g:Array<any>) => {
            gen = [...gen, ...g];
        })
        gen = gen.map((coin:string) => {
            if(coin === "luna") {
                return "himemoriluna";
            } else {
                return coin;
            }
        })
        coins.sort((a:string, b:string) => {
            return gen.indexOf(a) - gen.indexOf(b);
        })
    }

    render() {
        if(!this.props.session.loggedin) {
            return(
                <Redirect to="/login" />
            )
        }

        let notLoaded = false;
        if(this.props.stats.stats['aki'] === {}) notLoaded = true;
        if(this.props.stats.coinInfo.data === undefined) notLoaded = true;
        if(this.props.stats.coinHistory['aki'] === undefined) notLoaded = true;
        if(!this.props.userinfo.loaded) notLoaded = true;
        if(notLoaded) {
            return (
                <div className="not-loaded-outer">
                    <Loading />;
                </div> 
            ) 
        }

        let uniqueAssets = 0;
        let totalAssets = 0;
        let netWorth = this.getNetWorth();
        
        if(Object.keys(this.props.stats.stats).length === 0) return null;
        
        let coins = Object.keys(this.props.userinfo.wallet.coins);

        coins.forEach((coin:string) => {

            let myCoin:IMyCoin = this.props.userinfo.wallet.coins[coin];
            
            if(myCoin.amt > 0) {
                uniqueAssets++;
                totalAssets += myCoin.amt;
            }

        });

        let performanceData = this.getGraphData();

        let performance:IPerformanceHistory = this.props.userinfo.performance;
        let pLength = performance.length;
        
        let beforeP:IPerformance = performance[pLength - 1];

        let delta = Math.round((netWorth - beforeP.worth) * 100) / 100;
        let deltaP = Math.round((delta / Math.abs(beforeP.worth)) * 10000) / 100;

        let deltaClass = delta > 0 ? "green" : "red";

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
        
        if(this.state.redirect) {
            return(
                <Redirect to="/logout" />
            )
        }

        return(
            <div className="container scroll-space">
                <div className="container-content">
                    <div className="container-section profile-container">
                        <div className="section-background">
                        </div>
                        <div className="section-content">
                            <div className="header">
                                Profile
                            </div>
                            <div className="profile-row">
                                <div className="profile-card profile-personal">
                                    <div
                                        onClick={() => this.toggleIconDialogue()} 
                                        className="profile-icon">
                                        {
                                            this.props.userinfo.icon === "none" ||
                                            this.props.userinfo.icon === null ?
                                            <Coin name={"blank"} />
                                            :
                                            <Coin name={this.props.userinfo.icon} />
                                        }
                                    </div>
                                    
                                    <UserInfoFormItem />

                                    <div className="reset-password">
                                        <Link to="/resetPassword">
                                            Change Password
                                        </Link>
                                    </div>
                                    
                                    <div className="account-actions">
                                        <div 
                                            className="account-action-item delete-account-icon" 
                                            title="Delete Account"
                                            onClick={() => this.toggleDeleteDialogue()}>
                                            <HiOutlineTrash style={{verticalAlign:'middle'}}/>
                                        </div>
                                        <div 
                                            className="account-action-item update-settings"
                                            title="Account Settings"
                                            onClick={() => this.toggleSettingsDialogue()}>
                                            <BsGearFill style={{verticalAlign:'middle'}}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="profile-card profile-balance">
                                    <div className="profile-balance-content">
                                        <div className={"profile-balance-amt"}>
                                            <span className="coin-icon">
                                                <FaCoins style={{verticalAlign: 'middle'}}/>
                                            </span>
                                            {numberWithCommas(Math.round(netWorth * 100)/100)}
                                        </div>
                                        <div className={`delta-networth ${deltaClass}`}>
                                            {
                                                delta > 0 ?
                                                <BiUpArrow style={{verticalAlign: 'middle'}}/>
                                                :
                                                <BiDownArrow style={{verticalAlign: 'middle'}}/>
                                            }
                                            {
                                                "$" + numberWithCommas(Math.abs(delta))
                                            }
                                        </div>
                                        <div className={`delta-p-networth ${deltaClass}`}>
                                            {
                                                deltaP > 0 ?
                                                <BiUpArrow style={{verticalAlign: 'middle'}}/>
                                                :
                                                <BiDownArrow style={{verticalAlign: 'middle'}}/>
                                            }
                                            {
                                                numberWithCommas(Math.abs(deltaP)) + "%"
                                            }
                                        </div>
                                    </div>
                                    <div className="profile-balance-items">
                                        <div className="profile-balance-item">
                                            <div className="data">
                                                {uniqueAssets}
                                            </div>
                                            <div className="label">
                                                Unique Assets
                                            </div>
                                        </div>
                                        <div className="profile-balance-item">
                                            <div className="data">
                                                {totalAssets}
                                            </div>
                                            <div className="label">
                                                Total Assets
                                            </div>
                                        </div>
                                        <div className="profile-balance-item">
                                            <div className=
                                                    {`data ${this.props.userinfo.wallet.balance > 0 
                                                        ? "green" : "red"}`}>
                                                {this.formatPrice(this.props.userinfo.wallet.balance)}
                                            </div>
                                            <div className="label">
                                                Current Balance
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    { this.props.userinfo.verified ? null : <NotVerified />}

                    { showMuted ? <MutedMessage muted={muted}/> : null }
                    
                    <div className="container-section">
                        <div className="section-background"></div>
                        <div className="section-content">
                            <div className="header">
                                History
                            </div>
                            <div className="profile-history">
                                <Line data={performanceData} />
                            </div>
                        </div>
                    </div>

                    <Items
                        useritems={this.props.userinfo.items}
                        catalogue={this.props.itemcatalogue} />

                    <div className="container-section">
                        <div className="section-background"></div>
                        <div className="section-content">
                            <div className="header">
                                My Assets
                            </div>
                            {
                                uniqueAssets > 0 ?
                                <div className="assets">
                                    <div className="asset-header">
                                        <div className="header-name"></div>
                                        <div className="header-shares">My Shares</div>
                                        <div className="header-value">Ask</div>
                                        <div className="header-value">Bid</div>
                                        <div className="header-delta"></div>
                                        <div className="header-spacer"></div>
                                    </div>
                                    {
                                        this.state.coins.map((item:any, index:any) =>
                                            <Asset
                                                coin={item}
                                                muted={showMuted}
                                                key={index}
                                                verified={this.props.userinfo.verified}/>
                                        )
                                    }
                                </div>
                                :
                                <div className="no-assets">
                                    You don't own any coins!
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <UpdateIconDialogue
                    visible={this.state.iconDialogueVisible}
                    toggle={() => this.toggleIconDialogue()} />
                <DeleteAccountDialogue
                    visible={this.state.deleteAccountDialogueVisible}
                    deleted={() => this.deleted()}
                    toggle={() => this.toggleDeleteDialogue()} />
                <SettingsDialogue
                    visible={this.state.settingsDialogueVisible}
                    toggle={() => this.toggleSettingsDialogue()} />
            </div>
        )
    }
}

const Profile = connect(
    mapStateToProps
)(ProfileBind);

export default Profile;
