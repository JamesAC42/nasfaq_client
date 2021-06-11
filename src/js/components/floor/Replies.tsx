import React, { Component } from 'react';
import '../../../css/floor/replies.scss';

import Message from './Message';
import { connect } from 'react-redux';
import { 
    floorActions
} from '../../actions/actions';
import {
    RiArrowGoBackFill
} from 'react-icons/ri';
import { MetaMessage } from '../../interfaces/IChat';

const mapStateToProps = (state:any, props:any) => ({
    floor: state.floor,
    userinfo: state.userinfo
});

const mapDispatchToProps = {
    setRepliesVisible: floorActions.setRepliesVisible,
    setReplyStack: floorActions.setReplyStack
}

interface RepliesProps {
    floor: {
        chatLog: Array<MetaMessage> ,
        replyStack: Array<number>,
        repliesVisible: boolean
    },
    setReplyStack: (replies:Array<number>) => void,
    setRepliesVisible: (visible:boolean) => void,
    mention: (post:string) => void
}

class RepliesState {
    opMessage: MetaMessage | null;
    replies: Array<MetaMessage>
    constructor() {
        this.opMessage = null;
        this.replies = [];
    }
}

class RepliesBind extends Component<RepliesProps> {

    state:RepliesState;
    constructor(props:RepliesProps) {
        super(props);
        this.state = new RepliesState();
    }

    getReplies() {
        if(this.props.floor.replyStack.length === 0) return;

        let stack = this.props.floor.replyStack;
        let chatLog = this.props.floor.chatLog;
        let opMessageId = stack[stack.length - 1];
        let replies: Array<MetaMessage> = [];
        for(let i = 0; i < chatLog.length; i++) {
            if(opMessageId === chatLog[i].id) {
                this.setState({opMessage: {...chatLog[i]}});
            }
            if(chatLog[i].mentions.indexOf(opMessageId.toString()) !== -1) {
                replies.push(chatLog[i]);
            }
        }
        this.setState({
            replies
        });
    }

    componentDidMount() {
        this.getReplies();
    }

    componentDidUpdate(prevProps:RepliesProps) {
        if(this.props.floor.replyStack.length !== prevProps.floor.replyStack.length
            || this.props.floor.chatLog.length !== prevProps.floor.chatLog.length) {
            this.getReplies();
        }
    }

    hideReplies() {
        this.props.setReplyStack([]);
        this.props.setRepliesVisible(false);
    }

    upReplies() {
        let replyStack = [...this.props.floor.replyStack];
        replyStack.pop();
        if(replyStack.length === 0) {
            this.props.setRepliesVisible(false);
        }
        this.props.setReplyStack(replyStack);
    }

    render() {

        if(!this.props.floor.repliesVisible) return null;

        return(
            <div 
                className="replies-container">
                <div className="replies-container-inner">
                    <div 
                        className="replies-container-background"
                        onClick={() => this.hideReplies()}></div>
                    <div className="replies-modal">
                        <div className="replies-modal-inner">
                        <div className="replies-modal-content">
                            {
                                this.state.opMessage !== null ?
                                <div className="op-reply-message">
                                    <Message 
                                        index={0}
                                        op={true}
                                        msgid={this.state.opMessage.id.toString() + "-reply"}
                                        key={this.state.opMessage.id} 
                                        mention={(post:string) => this.props.mention(post)}
                                        message={this.state.opMessage}/>
                                </div> : null
                            }
                            {
                                this.state.replies.map((message:MetaMessage, index:number) =>
                                    <Message
                                        index={index + 1}
                                        op={false}
                                        msgid={message.id.toString() + "-reply"}
                                        key={message.id}
                                        mention={(post:string) => this.props.mention(post)}
                                        message={message} />
                                )
                            }
                        </div>
                        <div className="replies-modal-background">
                        </div>
                        <div 
                            className="replies-up"
                            onClick={() => this.upReplies()}>
                            <RiArrowGoBackFill />
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const Replies = connect(
    mapStateToProps,
    mapDispatchToProps
)(RepliesBind);

export default Replies;