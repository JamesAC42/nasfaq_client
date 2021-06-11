import React, {Component} from 'react';
import { MetaMessage } from '../../interfaces/IChat';

import { connect } from 'react-redux';
import Message from './Message';

import '../../../css/floor/messagecontainer.scss';

interface MessageContainerProps {
    floor: {
        activeRoom: any,
        loading:boolean,
        chatLog: Array<MetaMessage>,
        repliesVisible: boolean
    },
    mention: (post:string) => void
}

const mapStateToProps = (state:any, props:any) => ({
    floor: state.floor
});

class MessageContainerBind extends Component<MessageContainerProps> {

    render() {
        let messagesClass = 
            "messages " + (this.props.floor.repliesVisible ? "blur" : "");
        return(
            <div className={messagesClass}>
                {
                    this.props.floor.chatLog.length === 0 && 
                    this.props.floor.activeRoom !== null &&
                    !this.props.floor.loading ?
                    <div className="no-messages">
                        There is nothing here yet.
                    </div> : null
                }
                {
                    this.props.floor.chatLog.map((message:MetaMessage, index:number) => 
                        <Message
                            index={index}
                            op={index === 0}
                            msgid={message.id.toString()}
                            key={message.id}
                            mention={(post:string) => this.props.mention(post)}
                            message={message} />
                    )
                }
            </div>
        )
    }
}

const MessageContainer = connect(
    mapStateToProps
)(MessageContainerBind);

export default MessageContainer;