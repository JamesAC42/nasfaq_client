import React, { Component } from 'react';

import '../../css/loadingsmall.scss';

class LoadingSmall extends Component {
    render() {
        return(
            <div className="loading-small-outer">
                <div className="loading-small-section">
                    <div className="loading-small-bubble"></div>
                </div>
                <div className="loading-small-section">
                    <div className="loading-small-bubble"></div>
                </div>
                <div className="loading-small-section">
                    <div className="loading-small-bubble"></div>
                </div>
                <div className="loading-small-section">
                    <div className="loading-small-bubble"></div>
                </div>
            </div>
        )
    }
}

export default LoadingSmall;