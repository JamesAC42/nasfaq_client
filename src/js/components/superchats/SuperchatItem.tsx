import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ISuperchat, ISuperchatDaily, ISuperchatHistory } from '../../interfaces/ISuperchats';
import numberWithCommas from '../../numberWithCommas';
import Coin from '../Coin';
import SuperchatInput from './SuperchatInput';

import {
    RiMoneyDollarBoxLine
} from 'react-icons/ri';
import {
    TiChartBar
} from 'react-icons/ti';
import Superchat from './Superchat';

const mapStateToProps = (state:any, props:any) => ({
    userinfo: state.userinfo,
    session: state.session,
    superchats: state.superchats
});

interface ISuperchatItemProps {
    userinfo: {

    },
    session: {
        loggedin:boolean
    },
    superchats: {
        daily: {[coin:string]:ISuperchatDaily},
        history: {[coin:string]:ISuperchatHistory}
    },
    coin:string
} 

class SuperchatItemState {
    showInput:boolean;
    rankView:boolean;
    constructor() {
        this.showInput = false;
        this.rankView = false;
    }
}

class SuperchatItemBind extends Component<ISuperchatItemProps> {
    state:SuperchatItemState;
    constructor(props:ISuperchatItemProps) {
        super(props);
        this.state = new SuperchatItemState();
    }
    toggleInput() {
        this.setState({
            showInput: !this.state.showInput
        })
    }
    toggleRankView() {
        this.setState({
            rankView:!this.state.rankView
        })
    }
    getRankedDonators():Array<any> {
        let coin = this.props.coin === "luna" ? "himemoriluna" : this.props.coin;
        let daily:ISuperchatDaily = {...this.props.superchats.daily[coin]};
        let users = Object.keys(daily.userTotals);
        let ranking:Array<any> = [];
        users.forEach((user:string) => {
            ranking.push({
                username:daily.userTotals[user].username,
                total:daily.userTotals[user].total
            })
        });
        ranking.sort((userA:any, userB:any) => {
            return userB.total - userA.total;
        });
        return ranking;
    }
    sortSuperchats() {
        let coin = this.props.coin === "luna" ? "himemoriluna" : this.props.coin;
        let supers:Array<ISuperchat> = [...this.props.superchats.history[coin].superchats];
        supers.sort((s1:ISuperchat, s2:ISuperchat) => {
            return s1.timestamp - s2.timestamp;
        });
        return supers;
    }
    render() {
        if(this.props.superchats.history === undefined) return null;
        if(this.props.superchats.daily === undefined) return null;
        let coin = this.props.coin === "luna" ? "himemoriluna" : this.props.coin;
        return(
            <div className="superchat-item">
                <div className="superchat-header flex flex-row flex-center">
                    <Coin name={this.props.coin} />
                    <div className="superchat-name">
                        {this.props.coin.toUpperCase()}
                    </div>
                    <div className="today-earnings">
                        ${numberWithCommas(Math.round(this.props.superchats.daily[coin].total * 100) / 100)}
                    </div>
                </div>
                <div className="superchat-list-container">

                    {
                        !this.state.rankView ?
                        this.sortSuperchats().map((item:ISuperchat) => 
                            <Superchat
                                key={item.expiration} 
                                item={item}>
                                <div className="superchat-message">
                                    {item.message}
                                </div>
                            </Superchat>
                        ) : null
                    }

                    {
                        this.props.superchats.history[coin].superchats.length === 0
                        && !this.state.rankView ?
                        <div className="no-superchats">
                            {this.props.coin.toUpperCase()} has not received any superchats today, or they have all expired.
                        </div> : null
                    }

                    {
                        this.state.rankView ?
                        <div className="rank-view-header">
                            {this.props.coin.toLowerCase()}'s Top Donators Today
                        </div> : null
                    }
                    {
                        this.state.rankView ?
                        this.getRankedDonators().map((item:any, index:number) => 
                            <div 
                                className="donator-rank-item"
                                key={item.username}>
                                <div className="donator-rank-rank">
                                {index + 1}.
                                </div>
                                <div className="donator-rank-username">
                                {item.username}
                                </div>
                                <div className="donator-rank-total">
                                ${numberWithCommas(Math.round(item.total * 100) / 100)}
                                </div>
                            </div>    
                        ) : null
                    }
                </div>
                <div 
                    className={`superchat-input-container ${
                        this.state.showInput ? "superchat-input-visible" : ""
                    }`}>
                    {
                        !this.state.showInput ?
                        <div className="sc-open-input-outer">
                            {
                                this.props.session.loggedin ? 
                                <div 
                                    className="sc-open-input sc-input-control-btn"
                                    onClick={() => this.toggleInput()}>
                                    SEND A SUPERCHAT
                                </div> : null
                            }
                            <div 
                                className="toggle-rank-view"
                                onClick={() => this.toggleRankView()}>
                                {
                                    this.state.rankView ? 
                                    <TiChartBar style={{verticalAlign:"middle"}}/>
                                    :
                                    <RiMoneyDollarBoxLine style={{verticalAlign:"middle"}}/>
                                }
                            </div>
                        </div> : null
                    }
                    {
                        this.state.showInput ?
                        <SuperchatInput 
                            toggleInput={() => this.toggleInput()}
                            coin={this.props.coin}/> : null 
                    }
                </div>
            </div>
        )
    }

}

const SuperchatItem = connect(
    mapStateToProps
)(SuperchatItemBind);

export default SuperchatItem;