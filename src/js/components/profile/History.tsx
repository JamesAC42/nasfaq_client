import React, {Component} from 'react';

import { Line } from 'react-chartjs-2';

interface HistoryProps {
    performanceData:any
}

class History extends Component<HistoryProps> {

    render() {
        return(
            <div className="container-section">
                <div className="section-background"></div>
                <div className="section-content">
                    <div className="header">
                        History
                    </div>
                    <div className="profile-history">
                        <Line data={this.props.performanceData} />
                    </div>
                </div>
            </div>
        )
    }
}

export default History;