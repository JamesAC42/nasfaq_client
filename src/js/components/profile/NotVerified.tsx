import React, { Component } from 'react';

class NotVerified extends Component {
    render() {
        return(
            <div className="container-section">
                <div className="section-background"></div>
                <div className="section-content">
                    <div className="not-verified-msg">
                    You must verify your account in order to trade and post on the floor.
                    Please check your email for the verification link. If you just did it, try refreshing.
                    </div>
                </div>
            </div>
        )
    }
}

export default NotVerified;