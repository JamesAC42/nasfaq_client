import React, { Component } from 'react';
import { MetaMessage } from '../../interfaces/IChat';
import Message from './Message';
import { connect } from 'react-redux';
import '../../../css/floor/replySource.scss';

const mapStateToProps = (state:any, props:any) => ({
    floor: state.floor
});

interface ReplySourceProps {
    floor: {
        replySource: string | null,
        chatLog: Array<MetaMessage>,
        replySourceCoords: {
            x: number,
            y: number
        }
    }
}

class ReplySourceBind extends Component<ReplySourceProps> {
    mentionStop() {
        return;
    }
    getMessage(id:string):MetaMessage {
        let chat:any = null;
        let chatLog = this.props.floor.chatLog;
        for(let i = 0; i < chatLog.length; i++) {
            if(chatLog[i].id.toString() === id) {
                chat = {...chatLog[i]}
                break;
            }
        }
        return chat;
    }
    render() {
        if(this.props.floor.replySource === null) {
            return null;
        } else {
            const message: MetaMessage = this.getMessage(this.props.floor.replySource);
            if(message === null) {
                return null;
            } else {
                let {x, y} = this.props.floor.replySourceCoords;
                let yTransform = y < 150 ? `calc(${y}px + 10px)` : `calc(${y}px - 100% - 10px)`;
                let position = `translate(${x}px, ${yTransform}`;
                return(
                    <div 
                        className="reply-source"
                        style={{
                            transform:position
                        }}>
                        <Message
                            index={0}
                            op={false}
                            msgid={message.id.toString() + "-reply-source"}
                            key={message.id}
                            mention={() => this.mentionStop()}
                            message={message} />
                    </div>
                )
            }
        }
    }
}

const ReplySource = connect(
    mapStateToProps
)(ReplySourceBind);

export default ReplySource;