import React, {Component} from 'react';
import { connect } from 'react-redux';

import { adminActions } from '../../actions/actions';
import fetchData from '../../fetchData';

const mapStateToProps = (state:any, props:any) => ({
    admin:state.admin
});

const mapDispatchToProps = {
    setSpamTracker: adminActions.setSpamTracker
};

interface SpamTrackerProps {
    admin: {
        spamTracker:any
    },
    setSpamTracker: (spamTracker:any) => {}
}

class SpamTrackerBind extends Component<SpamTrackerProps> {
    refreshSpam() {
        fetchData('/api/getSpamTracker/')
        .then((data:any) => {
            if(data.success) {
                this.props.setSpamTracker(data.spamTracker);
            } else {
                console.log(data);
            }
        })
    }
    render() {
        return(
            <div className="admin-users-pane flex-col flex-stretch">
                <div className="control-header">
                    Spam Tracker
                </div>
                <div className="control-description">
                    Users who make frequent trade requests before their cooldown is up.
                </div>
                <div className="spam-tracker-inner flex flex-col flex-center">
                    <div 
                        className="refresh-spam"
                        onClick={() => this.refreshSpam()}>
                        Refresh
                    </div>
                    <table className="spam-table">
                        <thead>
                            <tr>
                                <td>Rank</td>
                                <td>UserID</td>
                                <td>Request Count</td>
                            </tr>
                        </thead>
                        <tbody>
                            {
                            this.props.admin.spamTracker.map((item:any, index:number) =>
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>{item.userid}</td>
                                    <td>{item.count}</td>
                                </tr>
                            )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

const SpamTracker = connect(
    mapStateToProps,
    mapDispatchToProps
)(SpamTrackerBind);

export default SpamTracker;