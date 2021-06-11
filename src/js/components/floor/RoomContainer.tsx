import React, { Component } from 'react';

import MessageContainer from './MessageContainer';
import {Loading} from '../Loading';
import Replies from './Replies';

import { connect } from 'react-redux';
import { ChatLog, MetaMessage, Room } from '../../interfaces/IChat';

import '../../../css/floor/roomcontainer.scss';

import {
    BsPencilSquare
} from 'react-icons/bs';
import {
    HiOutlineTrash
} from 'react-icons/hi';
import {
    CgList
} from 'react-icons/cg';
import { floorActions } from '../../actions/actions';
import ReplySource from './ReplySource';

const mapStateToProps = (state:any, props:any) => ({
    floor: state.floor,
    userinfo: state.userinfo
});

const mapDispatchToProps = {
    setReplyStack: floorActions.setReplyStack,
    setRepliesVisible: floorActions.setRepliesVisible,
    setPostCooldown: floorActions.setPostCooldown,
    setActiveRoom: floorActions.setActiveRoom,
    setChatLog: floorActions.setChatLog
}

interface RoomContainerProps {
    floor: {
        activeRoom: Room | null,
        chatLog: Array<MetaMessage>,
        loading: boolean,
        cooldown: {
            post:number
        }
    },
    userinfo: {
        loaded:boolean,
        username:string,
        admin:boolean
    },
    setReplyStack: (stack:Array<any>) => void,
    setRepliesVisible: (visible:boolean) => void,
    setPostCooldown: (post:number) => void,
    setActiveRoom: (room:Room | null) => void,
    setChatLog: (chat: ChatLog) => void,
    toggleCollapsed: () => void
}

class RoomContainerState {
    newPostNotifVisible: boolean;
    scrolledToBottom: boolean;
    newPostCount: number;
    messageInputVisible:boolean;
    inputMessage: string;
    metaMessages: Array<MetaMessage>;
    error:string;
    now:number;
    constructor() {
        this.newPostNotifVisible = false;
        this.scrolledToBottom = true;
        this.newPostCount = 0;
        this.messageInputVisible = false;
        this.inputMessage = "";
        this.metaMessages = [];
        this.error = "";
        this.now = new Date().getTime();
    }
}

type formEvent = React.ChangeEvent<HTMLTextAreaElement>;

class RoomContainerBind extends Component<RoomContainerProps> {

    state:RoomContainerState;
    intervalId:any;
    private textarea = React.createRef<HTMLTextAreaElement>();
    private bumper = React.createRef<HTMLDivElement>();

    constructor(props:RoomContainerProps) {
        super(props);
        this.state = new RoomContainerState();
    }
    
    componentDidMount() {
        this.intervalId = setInterval(() => {
            this.setState({
                now: new Date().getTime()
            })
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    cooldownTimer() {
        
        let cooldown = this.props.floor.cooldown.post;
        let now = this.state.now;

        let elapsed = (now - cooldown) / 1000;

        if(elapsed >= (60 * 1) || elapsed < 0) {
            return null;
        } else {
            return(
                <span className="cooldown-timer">
                    {60 - Math.round(elapsed)}
                </span>
            )
        }
    }

    toggleMessageInputVisible() {
        this.setState({
            messageInputVisible: !this.state.messageInputVisible
        });
    }

    handleText(a:formEvent) {
        this.setState({
            [a.target.name]:a.target.value
        });
    }

    componentDidUpdate(prevProps:RoomContainerProps, prevState:RoomContainerState) {
        if(this.props.floor.activeRoom !== null
            && prevProps.floor.activeRoom !== null) {
            if(this.props.floor.activeRoom.id !== prevProps.floor.activeRoom.id) {
                this.setState({
                    newPostCount: 0,
                    scrolledToBottom:true
                });
                this.props.setRepliesVisible(false);
                this.props.setReplyStack([]);
            } else {
                if(this.props.floor.chatLog.length !== prevProps.floor.chatLog.length) {

                    if(!this.state.scrolledToBottom) {
                        if(prevProps.floor.chatLog.length > 0) {
                            let newPostCount = 
                                this.props.floor.chatLog.length - prevProps.floor.chatLog.length;
                            this.setState({
                                newPostNotifVisible:true,
                                newPostCount: this.state.newPostCount + newPostCount
                            });
                        }
                    } else {
                        if(this.bumper.current) 
                            this.bumper.current.scrollIntoView();
                    }
                }
            }
        }
    }

    sendMessage() {
        if(this.props.floor.activeRoom === null) {
            return;
        }
        if(this.state.inputMessage === "") {
            return;
        }
        fetch('/api/addMessage/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: this.state.inputMessage,
                room: this.props.floor.activeRoom.id
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.setState({
                    inputMessage:'',
                    error:''
                });
                let d = new Date().getTime();
                this.props.setPostCooldown(d);
            } else {
                this.setState({
                    error:data.prompt
                })
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    removeRoom() {
        if(!this.props.userinfo.admin) return;
        if(this.props.floor.activeRoom === null) return;
        fetch('/api/removeRoom/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomid: this.props.floor.activeRoom.id
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.props.setActiveRoom(null);
                this.props.setChatLog([]);
            } else {
                this.setState({
                    error:data.prompt
                })
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    mention(post:string) {
        let message = this.state.inputMessage;
        message += ">>" + post + "\n";

        let selection = window.getSelection();
        if(selection !== null) {
            if(selection.type !== 'None') {
                let sText = selection.toString();
                if(sText !== '') {
                    let lines = sText.split('\n');
                    lines.forEach((line:string) => {
                        if(line !== "" && line !== "\r") {
                            message += ">" + line + "\n";
                        } else {
                            message += "\n";
                        }
                    })
                }
            }
        }

        this.setState({
            inputMessage:message
        }, () => {
            if(this.textarea.current !== null) {
                this.textarea.current.focus({
                    preventScroll:true
                });
                if(!this.state.messageInputVisible) {
                    this.toggleMessageInputVisible();
                }
            }
        })
    }

    hideNewPostNotif() {
        this.setState({
            newPostNotifVisible:false,
            newPostCount:0
        });
    }

    checkScroll() {
        if(this.bumper.current !== null) {
            let rect = this.bumper.current.getBoundingClientRect();
            let top = rect.top;
            let bottom = rect.bottom;
            let isVisible = (top >= 0) && (bottom <= window.innerHeight);

            this.setState({scrolledToBottom:isVisible});
            if(isVisible) {
                this.setState({
                    newPostNotifVisible: false,
                    newPostCount: 0
                });
            }
        }
    }

    render() {
        return(
            
            <div 
                className="room-container"
                onScroll={() => this.checkScroll()}>
                <div className="room-header">
                    <div 
                        className="room-name"
                        title={this.props.floor.activeRoom?.subject}>
                        {this.props.floor.activeRoom?.subject}
                    </div>
                    <div className="participants" title="Participants">
                        {this.props.floor.activeRoom?.posters.length}
                    </div>
                    <div className="message-count" title="Posts">
                        {this.props.floor.activeRoom?.posts}
                    </div>
                    {
                        this.props.userinfo.admin && this.props.floor.activeRoom !== null ?
                        <div
                            className="remove-room"
                            onClick={() => this.removeRoom()}>
                            <HiOutlineTrash style={{verticalAlign:'middle'}}/>
                        </div> : null
                    }
                    <div 
                        className="collapse-room-list"
                        onClick={() => this.props.toggleCollapsed()}>
                        <CgList style={{verticalAlign:'middle'}} />
                    </div>
                </div>
                <div className="message-container">
                    <div className="message-container-inner">
                        {
                            this.state.newPostNotifVisible ? 
                            <div 
                                className="new-messages-notif"
                                onClick={() => this.hideNewPostNotif()}>
                                {this.state.newPostCount + " "} 
                                new 
                                {this.state.newPostCount === 1 ? " post" : " posts"}
                            </div> : null
                        }
                        <MessageContainer
                            mention={(post:string) => this.mention(post)}/>
                        {
                            this.props.floor.loading ?
                            <Loading /> : null
                        }
                        {
                            this.props.floor.activeRoom === null
                            && !this.props.floor.loading ?
                            <div className="no-room">
                                <div>NO ROOM SELECTED</div>
                            </div> : null
                        }
                        <div className="bumper" ref={this.bumper}></div>
                        
                    </div>
                </div>
                <div className={`message-input ${this.state.messageInputVisible ? 
                    "message-input-visible" : ""}`}>
                    <div className="message-input-inner">
                        <div 
                            className="toggle-message-input"
                            onClick={() => this.toggleMessageInputVisible()}>
                            <BsPencilSquare />
                        </div>
                        <textarea
                            ref={this.textarea}
                            name="inputMessage"
                            value={this.state.inputMessage}
                            placeholder="Text here..."
                            maxLength={2000}
                            onChange={(
                                ev: formEvent
                            ): void => this.handleText(ev)}>
                        </textarea>
                        <div className="input-control">
                            <div className="character-count">
                                {this.state.inputMessage.length} / 2000
                            </div>
                            {
                                this.state.error !== "" ?
                                <div className="error-msg">
                                    {this.state.error}
                                </div> : null
                            }
                            <div 
                                className="submit-message-button"
                                onClick={() => this.sendMessage()}>
                                Send
                                {this.cooldownTimer()}
                            </div>
                        </div>
                    </div>
                </div>
                <Replies mention={(post:string) => this.mention(post)}/>
                <ReplySource />
            </div>
        )
    }
}

const RoomContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(RoomContainerBind);

export default RoomContainer;