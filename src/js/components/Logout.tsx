import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';

import { 
    sessionActions,
    userinfoActions
} from '../actions/actions';

const mapStateToProps = (state:any, props:any) => ({
    session: state.session
});

const mapDispatchToProps = {
    logout: sessionActions.logout,
    unload: userinfoActions.unload
}

interface LogoutState {
    redirect: boolean
}

interface LogoutProps {
    session: {
        loggedin:boolean
    },
    logout: () => {},
    unload: () => {}
}

class LogoutBind extends Component<LogoutProps> {
    state: LogoutState;
    constructor(props:LogoutProps) {
        super(props);
        this.state = {
            redirect: false
        }
    }
    componentDidMount() {
        if(!this.props.session.loggedin) return;
        fetch('/api/destroySession', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.setState({redirect: true});
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }
    componentWillUnmount() {
        this.props.unload();
        this.props.logout();
    }
    render() {
        if(this.state.redirect || !this.props.session.loggedin) {
            return(
                <Redirect to="/" />
            )
        } else {
            return null;
        }
    }
}

const Logout = connect(
    mapStateToProps,
    mapDispatchToProps
)(LogoutBind);

export default Logout;