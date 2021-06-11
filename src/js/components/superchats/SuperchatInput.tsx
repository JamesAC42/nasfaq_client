import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    MdClose
} from 'react-icons/md';
import { IWallet } from '../../interfaces/IWallet';

import {scPropMap} from './superchatTypes';

import { 
    superchatsActions,
    userinfoActions
} from '../../actions/actions';
import Superchat from './Superchat';
import { ISuperchat } from '../../interfaces/ISuperchats';

const mapStateToProps = (state:any, props:any) => ({
    userinfo: state.userinfo,
    session: state.session,
    superchats: state.superchats
});

const mapDispatchToProps = {
    setCooldown: superchatsActions.setCooldown,
    setWallet: userinfoActions.setWallet
}

interface ISuperchatInputProps {
    userinfo: {
        wallet:IWallet,
        loaded:boolean,
        username:string,
        icon:string
    },
    session: {
        loggedin:boolean
    },
    superchats: {
        cooldown: number
    },
    coin:string,
    toggleInput: () => void,
    setCooldown: (cooldown:number) => {},
    setWallet: (wallet:IWallet) => {}
}

class SuperchatInputState {
    messageText:string;
    dragging:boolean;
    superAmt:number;
    timeRemaining:number;
    error:string;
    constructor() {
        this.messageText = "";
        this.dragging = false;
        this.superAmt = 100;
        this.timeRemaining = 0;
        this.error = "";
    }
}

type formEvent = React.ChangeEvent<HTMLTextAreaElement>;
type inputEvent = React.ChangeEvent<HTMLInputElement>;
type mouseEvent = React.MouseEvent<HTMLDivElement>;
type scPropType = string | number;

class SuperchatInputBind extends Component<ISuperchatInputProps> {
    
    intervalId:any;
    private textarea = React.createRef<HTMLTextAreaElement>();
    private textinput = React.createRef<HTMLInputElement>();

    state:SuperchatInputState;

    constructor(props:ISuperchatInputProps) {
        super(props);
        this.state = new SuperchatInputState();
    }

    componentDidMount() {
        this.intervalId = setInterval(this.updateRemaining, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    updateRemaining = () => {
        let now = new Date().getTime();
        if(now > this.props.superchats.cooldown) {
            this.setState({
                timeRemaining: 0
            })
        } else {
            this.setState({
                timeRemaining: Math.round((this.props.superchats.cooldown - now) / 1000)
            })
        }
    }
    
    handleText(a:formEvent) {
        this.setState({
            [a.target.name]:a.target.value
        }, () => this.resizeMessageBox());
    }
    handleAmt(a:inputEvent) {
        let amt:number;
        if(a.target.value.length === 0) {
            amt = 0;
        } else {
            let textv:string = a.target.value;
            if(textv.slice(-1) === ".") textv = textv + "0"; 
            amt = parseFloat(textv);
        }
        if(isNaN(amt)) amt = 0;
        if(amt < 0) amt = -1 * amt;
        amt = Math.round(amt);
        this.setState({
            [a.target.name]:amt
        }, () => this.checkOverflow());
    }
    setDragging(e:mouseEvent, s:boolean) {
        e.stopPropagation();
        this.getMousePercent(e);
        this.setState({dragging:s});
    }
    resizeMessageBox() {
        if(this.textarea.current !== null) {
            this.textarea.current.style.height = "";
            this.textarea.current.style.height = this.textarea.current.scrollHeight + "px";
        }
    }
    checkOverflow() {
        let maxChar:number = this.getSuperProp("chars") as number;
        if(this.state.messageText.length > maxChar) {
            let sliced = this.state.messageText.slice(0, maxChar);
            this.setState({
                messageText:sliced
            }, () => this.resizeMessageBox());
        }
    }
    getMousePercent(e:mouseEvent) {
        e.stopPropagation();
        if(!this.state.dragging) return;

        const node = e.target as HTMLElement;
        const rect = node.getBoundingClientRect();
        
        const x = e.clientX - rect.left;
        const width = node.offsetWidth;
        const percent = Math.round((x / width) * 10000) / 100;
        
        if(percent < 0 || percent > 100) return;
        
        let discreet = Math.round(percent / 25); 
        let superAmt = scPropMap.prices[discreet];
        superAmt = superAmt === 1 ? 100 : superAmt;
        this.setState({
            superAmt
        }, () => this.checkOverflow())
    }
    getStyleOffset() {
        let superAmt = this.state.superAmt;
        let prices = scPropMap.prices;
        if(superAmt < prices[0]) return 0;
        let offset = -25;
        for(let i = 0; i < prices.length; i++) {
            if(superAmt >= prices[i]) {
                offset += 25;
            } else {
                break;
            }
        }
        return offset.toString() + "%";
    }
    getSuperProp(prop:keyof typeof scPropMap) {
        let superAmt = this.state.superAmt;
        let prices = scPropMap.prices;
        let propList = scPropMap[prop];
        let propResult = propList[0];
        for(let i = 1; i < prices.length + 1; i++) {
            if(superAmt >= prices[i - 1]) {
                propResult = propList[i - 1];
            }
        }
        return propResult;
    }
    validSuper() {
        if(!this.props.userinfo.loaded) return false;
        return this.state.superAmt <= this.props.userinfo.wallet.balance
            && this.state.messageText.length > 0
            && this.state.superAmt >= 1
            && this.state.timeRemaining === 0;
    }
    sendSuperchat() {
        if(!this.validSuper()) return;
        let name = this.props.coin === "luna" ? "himemoriluna" : this.props.coin; 
        fetch('/api/buySuperchat/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                coin: name,
                amount: this.state.superAmt,
                message: this.state.messageText
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.props.setCooldown(new Date().getTime() + (1000 * 10));
                let balance = this.props.userinfo.wallet.balance;
                balance -= this.state.superAmt;
                this.props.setWallet({
                    ...this.props.userinfo.wallet,
                    balance
                });
                this.props.toggleInput();
            } else {
                let errorMessage = "Invalid superchat";
                if(data.reason === 'filter') 
                    errorMessage = "You probably shouldn't say that.";
                this.setState({
                    error:errorMessage
                }, () => {
                    setTimeout(() => {
                        this.setState({
                            error:""
                        })
                    }, 3000);
                })
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }
    generateMockSuper() {
        let mock:ISuperchat = {
            coin:'',
            userid:'',
            username:this.props.userinfo.username,
            usericon:this.props.userinfo.icon,
            timestamp:0,
            expiration:0,
            amount:this.state.superAmt,
            message:''
        }
        return mock;
    }
    render() {
        if(!this.props.session.loggedin) return null;
        return(
            <div className="sc-input-outer">
                <div 
                    className="sc-input-header flex flex-row flex-center">
                    <div 
                        className="sc-input-close"
                        onClick={() => this.props.toggleInput()}>
                        <MdClose style={{verticalAlign:"middle"}}/>
                    </div>
                    <div className="sc-input-header-title">
                        Send a Superchat
                    </div>
                </div>
                <div className="sc-input-info flex flex-row">
                    <div className="sc-input-expiration-time">
                        {this.getSuperProp("expiration")}
                    </div>
                    <div className="sc-input-characters">
                        {this.state.messageText.length}/{this.getSuperProp("chars")}
                    </div>
                </div>
                <div className="sc-input-preview">
                    <Superchat item={this.generateMockSuper()}>
                        <div className="superchat-message">
                            <textarea 
                                ref={this.textarea}
                                name="messageText"
                                value={this.state.messageText}
                                id="sc-msg-txtarea"
                                placeholder="Your message here..."
                                maxLength={this.getSuperProp("chars") as number}
                                onChange={(
                                    ev: formEvent
                                ): void => this.handleText(ev)}>
                            </textarea>
                        </div>
                    </Superchat>
                </div>
                <div className="sc-input-amount flex flex-row flex-center">
                    $
                    <input 
                        ref={this.textinput}
                        type="text"
                        name="superAmt"
                        value={this.state.superAmt}
                        maxLength={10}
                        onChange={(
                            ev: inputEvent
                        ): void => this.handleAmt(ev)} />
                </div>
                <div 
                    className="sc-input-slider"
                    onMouseDown={
                        (e:mouseEvent) => this.setDragging(e, true)
                    }
                    onMouseUp={
                        (e:mouseEvent) => this.setDragging(e, false)
                    }
                    onMouseMove={
                        (e:mouseEvent) => this.getMousePercent(e)
                    }
                    onMouseLeave={
                        (e:mouseEvent) => this.setDragging(e, false)   
                    }>
                    <div className="slider-bar">
                        <div className="slider-bar-inner">
                            <div 
                                className={`slider-knob ${this.state.dragging ? "dragging" : ""}`}
                                style={{
                                    left: this.getStyleOffset()
                                }}></div>
                            <div 
                                className="slider-fill"
                                style={{
                                    width: this.getStyleOffset()
                                }}></div>

                            <div className="slider-tick"></div>
                            <div className="slider-tick"></div>
                            <div className="slider-tick"></div>
                            <div className="slider-tick"></div>
                            <div className="slider-tick"></div>
                        </div>
                    </div>
                </div>
                <div 
                    className={`sc-input-control-btn sc-input-send-btn 
                                ${this.validSuper() ? '':'sc-input-send-btn-invalid'}`}
                    onClick={() => this.sendSuperchat()}>
                    {
                        this.state.error !== "" ?
                        this.state.error : "SEND"
                    }
                    {
                        this.state.timeRemaining > 0 ?
                        <div className="sc-time-remaining">
                            {this.state.timeRemaining}
                        </div> : null
                    }
                </div>
            </div>
        )
    }
}

const SuperchatInput = connect(
    mapStateToProps,
    mapDispatchToProps
)(SuperchatInputBind);

export default SuperchatInput;