import React, {Component} from 'react';
import { MetaMessage, Room } from '../../interfaces/IChat';
import { connect } from 'react-redux';

import '../../../css/floor/message.scss';
import { 
    floorActions
} from '../../actions/actions';
import  {
    HiOutlineTrash
} from 'react-icons/hi';
import {
    AiOutlineCaretDown
} from 'react-icons/ai';

interface MessageProps {
    message: MetaMessage,
    index: number,
    op: boolean,
    msgid: string,
    floor: {
        activeRoom: Room,
        replyStack: Array<number>,
        repliesVisible: boolean
    },
    userinfo: {
        username: string,
        admin: boolean
    },
    mention: (post:string) => void,
    setRepliesVisible: (visible:boolean) => void,
    setReplyStack: (replyStack: Array<number>) => void,
    setReplySource: (message: string | null) => void,
    setReplySourceCoords: (coords: {}) => void
}

class MessageState {
    elapsedString:string;
    reportVisible:boolean;
    reportMessage:string;
    constructor() {
        this.elapsedString = '';
        this.reportVisible = false;
        this.reportMessage = "Report";
    }
}

const mapStateToProps = (state:any, props:any) => ({
    floor: state.floor,
    userinfo: state.userinfo
});

const mapDispatchToProps = {
    setRepliesVisible: floorActions.setRepliesVisible,
    setReplyStack: floorActions.setReplyStack,
    setReplySource: floorActions.setReplySource,
    setReplySourceCoords: floorActions.setReplySourceCoords
}

type clickEvent = React.MouseEvent<HTMLDivElement>;

class MessageBind extends Component<MessageProps> {
    
    state:MessageState;
    constructor(props:MessageProps) {
        super(props);
        this.state = new MessageState();
    }
    niceTimestamp(timestamp:number) {
        return new Date(timestamp).toLocaleString();
    }

    plural(num:number) {
        return num === 1 ? "" : "s";
    }

    showReplies(e:clickEvent) {
        let replyStack = [...this.props.floor.replyStack];
        if(replyStack.length > 0) {
            if(replyStack[replyStack.length - 1] === this.props.message.id) {
                return;
            }
        }
        replyStack.push(this.props.message.id);
        this.props.setReplyStack(replyStack);
        if(!this.props.floor.repliesVisible) {
            this.props.setRepliesVisible(true);
        }
        e.stopPropagation();
    }

    deleteMessage() {
        if(!this.props.userinfo.admin) return;
        fetch('/api/deleteMessage/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomid: this.props.floor.activeRoom.id,
                messageid: this.props.message.id,
                username: this.props.message.username
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    reportMessage(e:React.MouseEvent<HTMLDivElement>) {
        const report = {
            message: {
                roomId: this.props.floor.activeRoom.id,
                id: this.props.message.id,
                timestamp: this.props.message.timestamp,
                username: this.props.message.username,
                text: this.props.message.text
            }
        }
        fetch('/api/addReport/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({report})
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.setState({
                    reportMessage:"Reported"
                });
            } else {
                this.setState({
                    reportMessage:"Cannot report: " + data.prompt
                });
            }
            setTimeout(() => {
                this.setState({
                    reportMessage:"Report",
                    reportVisible:false
                });
            }, 3000);
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
        e.stopPropagation();
    }

    toggleReportVisible() {
        this.setState({
            reportVisible:!this.state.reportVisible
        })
    }

    getElapsedTime() {

        let seconds = Math.floor((new Date().getTime() - this.props.message.timestamp) / 1000);
        let secondsR = seconds % 60;
        let minutes = Math.floor(seconds / 60);
        let minutesR = minutes % 60;
        let hours = Math.floor(minutes / 60);
        let hoursR = hours % 24;
        let days = Math.floor(hours / 24);

        let elapsedString = '';
        if(days > 0) elapsedString += `${days} day${this.plural(days)}, `;
        if(hours > 0) elapsedString += `${hoursR} hour${this.plural(hoursR)}, `;
        if(minutes > 0) elapsedString += `${minutesR} minute${this.plural(minutesR)}, `;
        elapsedString += `${secondsR} second${this.plural(secondsR)} ago`;

        this.setState({elapsedString})
    }

    componentDidMount() {
        this.bindShowReplySourceActions();
    }

    bindShowReplySourceActions() {
        if(this.props.msgid.indexOf("reply-source") !== -1) return;
        const thisPost:HTMLDivElement = document.getElementById(this.props.msgid) as HTMLDivElement;
        const links:any = thisPost.getElementsByClassName("mention");
        if(links.length) {
            for(let i = 0; i < links.length; i++) {
                const l = links[i];
                l.addEventListener("mousemove", (e:MouseEvent) => {
                    this.props.setReplySourceCoords({
                        x:e.pageX,
                        y:e.pageY
                    })
                });
                l.addEventListener("mouseenter", (e:MouseEvent) => {
                    if(e.target !== null) {
                        let target = e.target as HTMLAnchorElement;
                        let id = target.getAttribute("href");
                        if(id !== null) {
                            id = id.slice(1);
                            this.props.setReplySource(id);
                            this.props.setReplySourceCoords({
                                x:e.pageX,
                                y:e.pageY
                            })
                        }
                    }
                })
                l.addEventListener("mouseleave", (e:MouseEvent) => {
                    if(e.target !== null) {
                        this.props.setReplySource(null);
                        //this.props.setReplySourceCoords({x:0,y:0})
                    }
                })
            }
        }
    }

    render() {

        let message = this.props.message;

        let messageClass = "message";
        if(this.props.op) messageClass += " op";
        if(this.props.message.isMe) messageClass += " me";
        if(this.props.message.you) messageClass += " you";

        let replyLabel = (message.replies.length === 1) ? " reply" : " replies";

        return(
            <div className={messageClass} id={this.props.msgid}>
                <div className="message-info">
                    <div className="message-user">{message.username}</div>
                    <div 
                        className="message-timestamp"
                        onMouseEnter={() => this.getElapsedTime()}
                        title={this.state.elapsedString}>
                            {this.niceTimestamp(message.timestamp)}
                    </div>
                    <div
                        onClick={() => this.props.mention(message.id.toString())}
                        onMouseDown={(e:clickEvent) => e.preventDefault()}
                        className="message-id">
                            #{message.id}
                    </div>
                    <div 
                        className="report-msg-btn"
                        onClick={() => this.toggleReportVisible()}>
                        <AiOutlineCaretDown style={{verticalAlign:'middle'}}/>
                        {
                            this.state.reportVisible ?
                            <div 
                                className="report-btn-confirm"
                                onClick={(e:React.MouseEvent<HTMLDivElement>) => this.reportMessage(e)}>
                                {this.state.reportMessage}
                            </div> : null
                        }
                    </div>
                    {
                        this.props.userinfo.admin ?
                        <div 
                            className="delete-message"
                            onClick={() => this.deleteMessage()}>
                            <HiOutlineTrash style={{verticalAlign:'middle'}}/>
                        </div> : null
                    }
                </div>
                <div 
                    className="message-text" 
                    dangerouslySetInnerHTML={{__html: message.text}}>
                </div>
                { 
                    message.replies.length > 0 ?
                    <div 
                        className="message-replies">
                        <span 
                            className="message-replies-inner"
                            onClick={(e:clickEvent) => this.showReplies(e)}>
                            {message.replies.length + replyLabel}
                        </span>
                    </div> : null
                }
            </div>
        )
    }
}

const Message = connect(
    mapStateToProps,
    mapDispatchToProps
)(MessageBind);

export default Message;