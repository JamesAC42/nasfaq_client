import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
    sessionActions,
    userinfoActions,
    transactionActions
} from '../actions/actions';

const mapDispatchToProps = {
    login: sessionActions.login,
    logout: sessionActions.logout,
    setUsername: userinfoActions.setUsername,
    setEmail: userinfoActions.setEmail,
    setWallet: userinfoActions.setWallet,
    setId: userinfoActions.setId,
    setLoaded: userinfoActions.setLoaded,
    setPerformance: userinfoActions.setPerformance,
    setIcon: userinfoActions.setIcon,
    addTransaction: transactionActions.addTransaction,
    setVerified: userinfoActions.setVerified,
    setAdmin: userinfoActions.setAdmin,
    setColor: userinfoActions.setColor,
    setMuted: userinfoActions.setMuted,
    setItems: userinfoActions.setItems,
    setSettings: userinfoActions.setSettings
}

interface SessionProps {
    login: () => {},
    logout: () => {},
    setUsername: (username:string) => {},
    setEmail: (email:string) => {},
    setId: (id:string) => {},
    setWallet: (wallet:any) => {},
    setPerformance: (performance:any) => {},
    setLoaded: () => {},
    setIcon: (icon:string) => {},
    setVerified: (verified:boolean) => {},
    setAdmin: (admin:boolean) => {},
    setMuted: (muted:any) => {},
    setColor: (color:string) => {},
    setItems: (items:any) => {},
    setSettings: (settings:any) => {}
}

class SessionHandlerBind extends Component<SessionProps> {

    componentDidMount() {

        fetch('/api/getUserInfo', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'withCredentials':'true'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.loggedout) {
                this.props.logout();
            } else {
                this.props.setEmail(data.email);
                this.props.setUsername(data.username);
                this.props.setWallet(JSON.parse(data.wallet));
                this.props.setId(data.id);
                this.props.setIcon(data.icon);
                this.props.setPerformance(JSON.parse(data.performance));
                this.props.setAdmin(data.admin);
                this.props.setVerified(data.verified);
                this.props.setMuted(data.muted);
                this.props.setColor(data.color);
                this.props.setSettings(data.settings);
                this.props.setItems(JSON.parse(data.items));
                this.props.setLoaded();
                this.props.login();
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    render() {
        return(
            <div>
            </div>
        )
    }
}

const SessionHandler = connect(
    null,
    mapDispatchToProps
)(SessionHandlerBind);

export default SessionHandler;