import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';

import '../../../css/admin.scss';
import { adminActions } from '../../actions/actions';

import Users from './Users';
import Filters from './Filters';
import Reports from './Reports';
import AdjustmentControls from './AdjustmentControls';
import DownloadPane from './DownloadPane';
import SpamTracker from './SpamTracker';
import DividendToggles from './DividendToggles';
import VolatilityMultipliers from './VolatilityMultipliers';
import ClearSessions from './ClearSessions';
import BrokerFee from './BrokerFee';

import ToggleSwitch from '../ToggleSwitch';

const mapStateToProps = (state:any, props:any) => ({
    userinfo:state.userinfo,
    session:state.session,
    settings:state.settings,
    admin:state.admin
});

const mapDispatchToProps = {
    setAdminUsers: adminActions.setAdminUsers,
    setAdminFilters: adminActions.setAdminFilters,
    setAdminReports: adminActions.setAdminReports,
    setAdminAdjustmentControls: adminActions.setAdminAdjustmentControls,
    setSpamTracker: adminActions.setSpamTracker,
    setDividendToggles: adminActions.setDividendToggles,
    setVolatilityMultipliers: adminActions.setVolatilityMultipliers,
    setBrokerFee: adminActions.setBrokerFee
};

interface AdminProps {
    userinfo: {
        username:string,
        admin:boolean
    },
    session: {
        loggedin:boolean
    },
    settings: {
        marketSwitch:boolean
    },
    admin: {
        users: Array<any>,
        filters: any,
        reports: Array<any>,
        adjustmentControls: any, 
        volatilityMultipliers: any
    },
    setAdminFilters: (filters:any) => {},
    setAdminReports: (reports:any) => {},
    setAdminUsers: (users:any) => {},
    setAdminAdjustmentControls: (adjustmentControls:any) => {},
    setSpamTracker: (spamTracker:any) => {},
    setDividendToggles: (dividendToggles:any) => {},
    setVolatilityMultipliers: (setVolatilityMultipliers:any) => {},
    setBrokerFee: (brokerFee:any) => {}
}

enum AdminPanels {
    USERS,
    REPORTS,
    FILTERS,
    ADJUSTMENT_CONTROLS,
    SPAM_TRACKER,
    DIVIDEND_TOGGLES,
    VOLATILITY_MULTIPLIERS,
    BROKER_FEE,
    CLEAR_SESSIONS,
    DATA
}

class AdminState {
    active:AdminPanels
    constructor() {
        this.active = AdminPanels.USERS;
    }
}

class AdminBind extends Component<AdminProps> {
    state:AdminState;
    constructor(props:AdminProps) {
        super(props);
        this.state = new AdminState();
    }
    componentDidMount() {
        fetch('/api/getAdminInfo', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.props.setAdminUsers(data.users);
                this.props.setAdminFilters(data.filters.words);
                this.props.setAdminReports(data.reports);
                this.props.setAdminAdjustmentControls(data.adjustmentToggles);
                this.props.setSpamTracker(data.spamTracker);
                this.props.setDividendToggles(data.dividendToggles);
                this.props.setVolatilityMultipliers(data.volatilityMultipliers);
                this.props.setBrokerFee(data.brokerFee);
            } else {
                console.log(data);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }
    toggleMarketSwitch() {
        fetch('/api/setMarketSwitch', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(!data.success) {
                console.log("Error setting market switch");
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }
    marketSwitchClass() {
        return this.props.settings.marketSwitch ? "on" : "off"
    }
    setActiveView(v:number) {
        if(this.props.admin.users === undefined) return;
        this.setState({active:v});
    }
    renderPanel() {
        if(this.state.active === AdminPanels.USERS) {
            return <Users />;
        } else if(this.state.active === AdminPanels.FILTERS) {
            return <Filters />;
        } else if(this.state.active === AdminPanels.ADJUSTMENT_CONTROLS) {
            return <AdjustmentControls />;
        } else if(this.state.active === AdminPanels.REPORTS) {
            return <Reports />;
        } else if(this.state.active === AdminPanels.DATA) {
            return <DownloadPane />;
        } else if(this.state.active === AdminPanels.DIVIDEND_TOGGLES) {
            return <DividendToggles />;
        } else if(this.state.active === AdminPanels.VOLATILITY_MULTIPLIERS) {
            return <VolatilityMultipliers />;
        } else if(this.state.active === AdminPanels.BROKER_FEE) {
            return <BrokerFee />;
        } else if(this.state.active === AdminPanels.CLEAR_SESSIONS) {
            return <ClearSessions />;
        } else if(this.state.active === AdminPanels.SPAM_TRACKER) {
            return <SpamTracker />;
        } else {
            return null;
        }
    }
    render() {
        if(!this.props.session.loggedin) {
            return(
                <Redirect to='/login/admin'/>
            )
        }
        if(!this.props.userinfo.admin) {
            return(
                <Redirect to='/' />
            )
        }
        const panelNames = ["Users", "Reports", "Filters", "Adjustment Controls", "Spam Tracker", "Dividend Toggles", "Volatility Multipliers", "Broker Fee", "Clear Sessions", "Data Download"];
        return(
            <div className="container fill">
                <div className="container-inner flex-col flex-stretch">
                    <div className="admin-header">
                        Admin
                    </div>
                    <div className="admin-space flex-row">
                        <div className="admin-panel-select">
                            <div className="tabbed-view-select">
                                {
                                    panelNames.map((panel:string, index:number) => 
                                    <div 
                                        key={panel}
                                        className={`view-item ${index === this.state.active ? 'view-item-active' : ''}`}
                                        onClick={() => this.setActiveView(index)}>
                                        {panel}
                                    </div>
                                    )
                                }
                            </div>
                        </div>
                        <div className="admin-panel flex flex-col flex-stretch">
                            {
                                this.renderPanel()
                            }
                        </div>
                    </div>
                    <div className="market-switch flex flex-row flex-center">
                        Market Status: 
                        <ToggleSwitch
                            onLabel={"OPEN"}
                            offLabel={"CLOSED"}
                            switchState={this.props.settings.marketSwitch}
                            className={""}
                            onToggle={() => this.toggleMarketSwitch()} />
                    </div>
                </div>
            </div>
        )
    }
} 

const Admin = connect(
    mapStateToProps,
    mapDispatchToProps
)(AdminBind);

export default Admin;