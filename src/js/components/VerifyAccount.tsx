import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import {
    userinfoActions
} from '../actions/actions';

import '../../css/verifyaccount.scss';

const mapDispatchToProps = {
    setVerified: userinfoActions.setVerified
}

interface VerifyAccountProps {
    match: {
        params: any
    },
    setVerified: (verified:boolean) => {}
}

class VerifyAccountState {
    redirect: boolean;
    msgText: string;
    constructor() {
        this.msgText = "";
        this.redirect = false;
    }
}

class VerifyAccountBind extends Component<VerifyAccountProps> {

    state:VerifyAccountState;
    constructor(props:VerifyAccountProps) {
        super(props);
        this.state = new VerifyAccountState();
    }

    componentDidMount() {

        const userid = this.props.match.params.userid;
        const key =  this.props.match.params.key;
        if(userid === undefined || key === undefined) {
            this.setState({redirect:true});
            return;
        }
        
        fetch('/api/verifyEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userid,
                key
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.props.setVerified(true);
                this.setState({
                    msgText: "Account verified"
                });
                setTimeout(() => {
                    this.setState({ redirect:true })
                }, 3000);
            } else {
                this.setState({
                    msgText: data.message
                });
                setTimeout(() => {
                    this.setState({redirect:true});
                }, 3000);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    render() {
        if(this.state.redirect) {
            return(
                <Redirect to="/profile" />
            );
        }
        return(
            <div className="container center-child flex-col">
                <div className="verification-msg">
                {this.state.msgText}
                </div>
                {
                    this.state.msgText !== '' ? 
                    <div className="verification-msg">
                        Redirecting...
                    </div> : null
                }
            </div>
        )
    }

}

const VerifyAccount = connect(
    null,
    mapDispatchToProps
)(VerifyAccountBind);

export default VerifyAccount;