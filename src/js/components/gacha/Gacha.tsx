import React, {Component} from 'react';
import { Redirect } from 'react-router';

import '../../../css/gacha/gacha.scss';
import fubukiLucky from '../../../images/fubuki_lucky.png';
import fubukiUnlucky from '../../../images/fubuki_unlucky.png';

import {ItemImages} from '../ItemImages';

import dice from '../../../images/dice.png';
import akispread from '../../../images/akispread.jpg';
import GachaButton from './GachaButton';
import {IoMdPricetag} from 'react-icons/io';

import {connect} from 'react-redux';
import { IWallet } from '../../interfaces/IWallet';
import { IItemCatalogue } from '../../interfaces/IItem';

import { NothingTerms } from './Nothing';
import {
    userinfoActions
} from '../../actions/actions';

const yebsound = require('../../../sound/yeb.mp3');
const om3tcw = require('../../../sound/om3tcw.mp3');
const tsunomaki = require('../../../sound/tsunomaki.mp3');
const ohno = require('../../../sound/ohnojesas.mp3');
const yabe = require('../../../sound/yabe.mp3');
const polbleh = require('../../../sound/polbleh.mp3');
const likeyonut = require('../../../sound/likeyonut.mp3');

const audios:any = {
    yebsound,
    om3tcw,
    tsunomaki,
    ohno,
    yabe,
    polbleh,
    likeyonut
}

const mapStateToProps = (state:any) => ({
    userinfo: state.userinfo,
    session: state.session,
    gacha: state.gacha,
    itemcatalogue: state.itemcatalogue
})

const mapDispatchToProps = {
    setWallet: userinfoActions.setWallet
}

interface GachaProps {
    userinfo: {
        wallet: IWallet,
        loaded: boolean
    },
    session: {
        loggedin: boolean
    },
    gacha: {
        receivedItems: Array<string>
    },
    itemcatalogue: IItemCatalogue,
    setWallet: (wallet:IWallet) => {}
}

class GachaState {
    rolling:boolean;
    init:boolean;
    nothingTerm:string;
    constructor() {
        this.rolling = false;
        this.init = true;
        this.nothingTerm = '';
    }
}

class GachaBind extends Component<GachaProps> {

    state:GachaState;
    audioRefs:any;
    constructor(props:GachaProps) {
        super(props);
        this.state = new GachaState();
        this.audioRefs = {};
        Object.keys(audios).forEach((audio:string) => {
            this.audioRefs[audio] = React.createRef();
        });
    }

    roll(bulk?:boolean) {
        if(this.state.rolling) return;
        let balance = this.props.userinfo.wallet.balance;
        if(bulk && balance < 10000) return;
        if(balance < 1000) return;

        if(this.audioRefs.tsunomaki.current) {
            this.audioRefs.tsunomaki.current.currentTime = 5;
            this.audioRefs.tsunomaki.current.play();
        }

        let deduct = bulk ? 10000 : 1000;
        let wallet = {...this.props.userinfo.wallet};
        wallet.balance -= deduct;
        this.props.setWallet(wallet);

        if(this.state.init) {
            this.setState({init:false})
        }
        this.setState({
            rolling:true
        }, () => {
            setTimeout(() => {

                let items = [...this.props.gacha.receivedItems];
                let cashTotal = 0;
                items.forEach((item:string) => {
                    if(item === "Cash") cashTotal++;
                });
                let wallet = {...this.props.userinfo.wallet};
                wallet.balance += cashTotal * 500;
                this.props.setWallet(wallet);

                if(this.audioRefs.tsunomaki.current) {
                    this.audioRefs.tsunomaki.current.pause();
                }
                if(items.indexOf("Jeb") !== -1) {
                    if(this.audioRefs.yebsound.current) {
                        this.audioRefs.yebsound.current.currentTime = 0;
                        this.audioRefs.yebsound.current.play();
                    }
                }
                if(items.indexOf("RisuNuts") !== -1) {
                    if(this.audioRefs.likeyonut.current) {
                        this.audioRefs.likeyonut.current.currentTime = 0;
                        this.audioRefs.likeyonut.current.play();
                    }
                }
                if(items.indexOf("ZenlossMiko") !== -1) {
                    if(this.audioRefs.om3tcw.current) {
                        this.audioRefs.om3tcw.current.currentTime = 0;
                        this.audioRefs.om3tcw.current.play();
                    }
                }

                if(items.length === 0) {
                    this.setState({nothingTerm:this.getNothingTerm()});
                    let d = Math.random();
                    if(d < 0.33) {
                        if(this.audioRefs.ohno.current) {
                            this.audioRefs.ohno.current.currentTime = 0;
                            this.audioRefs.ohno.current.play();
                        }
                    } else if(d < 0.66) {
                        if(this.audioRefs.yabe.current) {
                            this.audioRefs.yabe.current.currentTime = 0;
                            this.audioRefs.yabe.current.play();
                        }
                    } else {
                        if(this.audioRefs.polbleh.current) {
                            this.audioRefs.polbleh.current.currentTime = 0;
                            this.audioRefs.polbleh.current.play();
                        }
                    }
                }

                this.setState({rolling:false});

            }, 5000);
            let url = '/api/rollGacha';
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bulk: bulk ? true : false
                })
            })
            .then(response => response.json())
            .then(data => {
                if(!data.success) {
                    console.log(data);
                }
            })
            .catch(error => {
                console.error('Error: ' +  error);
            })
        });
    }

    buttonInactiveClass(price:number) {
        if(!this.props.userinfo.loaded) return 'inactive';
        if(this.props.userinfo.wallet) {
            if(this.state.rolling || this.props.userinfo.wallet.balance < price) {
                return 'inactive';
            } else {
                return '';
            }
        } else {
            return 'inactive';
        }
    }

    getItemName(name:string) {
        if(name === "Cash") {
            return "$500"
        }
        return this.props.itemcatalogue[name].name;
    }

    getNothingTerm() {
        return NothingTerms[Math.floor(Math.random() * NothingTerms.length)];
    }

    render() {
        if(!this.props.session.loggedin) {
            return(
                <Redirect to="/login/gacha" />
            )
        }
        return(
            <div className="container gacha-container">

                <audio ref={this.audioRefs.yebsound}>
                    <source src={yebsound}></source>
                </audio>
                <audio ref={this.audioRefs.om3tcw}>
                    <source src={om3tcw}></source>
                </audio>
                <audio ref={this.audioRefs.tsunomaki}>
                    <source src={tsunomaki}></source>
                </audio>
                <audio ref={this.audioRefs.ohno}>
                    <source src={ohno}></source>
                </audio>
                <audio ref={this.audioRefs.likeyonut}>
                    <source src={likeyonut}></source>
                </audio>
                <audio ref={this.audioRefs.polbleh}>
                    <source src={polbleh}></source>
                </audio>
                
                <div className="gacha-header-container flex center-child">
                    <div className="gacha-header-inner">
                        <div className="gacha-header-title">gacha</div>
                        <div className="gacha-header-subtitle">Take a chance and receive unique collectable items!</div>
                    </div>
                    <div className="gacha-background">
                        <img src={akispread} alt=""/>
                    </div>
                </div>

                <div className="gacha-panel">


                    <div className="button-row flex flex-row flex-center">

                        <div className="button-container">
                            <div className="button-price">
                                <IoMdPricetag style={{verticalAlign: 'middle'}}/>
                                <div className="roll-price">
                                    1,000
                                </div>
                            </div>
                            <GachaButton
                                className={this.buttonInactiveClass(1000)}
                                rolling={this.state.rolling}
                                onClick={() => this.roll()}>
                                    ROLL
                            </GachaButton>
                        </div>
                        <div className="button-container">
                            <div className="button-price">
                                <IoMdPricetag style={{verticalAlign: 'middle'}}/>
                                <div className="roll-price">
                                    10,000
                                </div>
                            </div>
                            <GachaButton 
                                className={"gacha-ten " + this.buttonInactiveClass(10000)}
                                rolling={this.state.rolling}
                                onClick={() => this.roll(true)}>
                                    ROLL 10
                            </GachaButton>
                        </div>
                    </div>

                    <div className="drop-box flex flex-row flex-center">

                        {
                            this.state.rolling ?
                            <div 
                                className={`rolling-icon flex center-child `
                                    + (this.state.rolling ? "rolling" : "")}>
                                <img src={dice} alt="Dice"/>
                            </div> : null
                        }

                    </div>

                    {
                        !this.state.rolling && !this.state.init ?
                        <div className="drop-container flex flex-col">
                            <div className="drop-container-header">
                                You received:
                            </div>
                            <div className="drop-container-items">
                                {
                                    this.props.gacha.receivedItems.map((item:string, index:number) => 
                                        <div
                                            key={index} 
                                            className={"drop-item " + (item !== "Cash" ? "rare" : "")}>
                                            <div className="drop-item-image">
                                                <img src={ItemImages[item]} alt={item}/>
                                            </div>
                                            <div className="drop-item-name">
                                                {this.getItemName(item)}
                                            </div>
                                        </div>
                                    )
                                }
                                {
                                    this.props.gacha.receivedItems.length === 0 ?
                                    <div className="no-items">
                                        {this.state.nothingTerm}
                                    </div> : null
                                }
                            </div>
                        </div> : null
                    }

                    {
                        this.state.init ?
                        <div className="init-message">
                        </div> : null
                    }

                </div>

                <div 
                    className={"friend-box " + (this.state.rolling ? "anticipation" : "")}>
                    <img src={
                        !this.state.rolling && 
                        this.props.gacha.receivedItems.length === 0 &&
                        !this.state.init ?
                        fubukiUnlucky : fubukiLucky
                    } alt="Fubuki"/>
                </div>

            </div>
        )
    }

}

const Gacha = connect(
    mapStateToProps,
    mapDispatchToProps
)(GachaBind);

export default Gacha;