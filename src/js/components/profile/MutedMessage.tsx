import React, { Component } from 'react';

interface MutedMessageProps {
    muted: {
        muted:boolean,
        until:number,
        message:string
    }
}
class MutedMessage extends Component<MutedMessageProps> {
    render() {
        let timestamp = new Date(this.props.muted.until).toLocaleString();
        return(
            <div className="container-section">
                <div className="section-background"></div>
                <div className="section-content">
                    <div className="muted-msg">
                    You have been muted from posting in the chat and making transactions until {timestamp}.
                    <br/>Reason: {this.props.muted.message}
                    </div>
                </div>
            </div>
        )
    }
}

export default MutedMessage;