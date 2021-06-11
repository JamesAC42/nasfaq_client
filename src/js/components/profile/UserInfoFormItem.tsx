import React, { Component } from 'react';
import { connect } from 'react-redux';
import { userinfoActions } from '../../actions/actions';

import {
    ImCheckmark
} from 'react-icons/im';

const mapStateToProps = (state:any, props:any) => ({
    userinfo: state.userinfo
});

const mapDispatchToProps = {
    setUsername: userinfoActions.setUsername,
    setEmail: userinfoActions.setEmail,
    setVerified: userinfoActions.setVerified
}

interface UserInfoFormItemProps {
    userinfo: {
        username: string,
        email: string,
        loaded: boolean
    },
    setUsername: (username:string) => {},
    setEmail: (email:string) => {},
    setVerified: (verified:boolean) => {}
}

class UserInfoFormItemState {
    error:string;
    username:string;
    email:string;
    constructor() {
        this.username = "";
        this.email = "";
        this.error = "";
    }
}

type formEvent = React.ChangeEvent<HTMLInputElement>;
class UserInfoFormItemBind extends Component<UserInfoFormItemProps> {

    state: UserInfoFormItemState;

    constructor(props:UserInfoFormItemProps) {
        super(props);
        this.state = new UserInfoFormItemState();
    }

    componentDidMount() {
        if(this.props.userinfo.loaded) {
            this.setState({
                username:this.props.userinfo.username,
                email:this.props.userinfo.email
            })
        }
    }

    updateForm(a:formEvent) {
        this.setState({
            [a.target.name]:a.target.value
        });
    }

    sendRequest(url:string, body:any):Promise<any> {
        return new Promise((resolve:any, reject:any) => {
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })
            .then(response => response.json())
            .then(data => {
                resolve(data);
            })
            .catch(error => {
                console.error('Error: ' +  error);
            })
        })
    }
    
    updateUsername() {

        if(this.state.username === "") {
            this.setState({error: "Invalid username"});
            return;
        }
        if(this.state.username.length > 50) {
            this.setState({error: "Username too long"});
            return;
        }
        this.sendRequest(
            '/api/changeUsername', 
            {username: this.state.username}
        ).then((data:any) => {
            if(data.success) {
                this.props.setUsername(this.state.username);
                this.setState({
                    error: ""
                })
            } else {
                this.setState({
                    username: this.props.userinfo.username,
                    error: data.message
                })
            }
        })
    }

    updateEmail() {
        
        if(this.state.email === "") {
            this.setState({error: "Invalid email"});
            return;
        }
        this.sendRequest(
            '/api/changeEmail', 
            {email: this.state.email}
        ).then((data:any) => {
            if(data.success) {
                this.props.setEmail(this.state.email);
                this.props.setVerified(false);
                this.setState({
                    error: ""
                })
            } else {
                this.setState({
                    email: this.props.userinfo.email,
                    error: data.message
                })
            }
        })
    }

    render() {
        return(
            <div>
                <div 
                    className="profile-name"
                    title={this.props.userinfo.username}>
                    <input
                        type="text"
                        name="username"
                        value={this.state.username}
                        maxLength={50}
                        onChange={(
                            ev: React.ChangeEvent<HTMLInputElement>,
                        ): void => this.updateForm(ev)}/>
                    <div 
                        className="confirm-change"
                        onClick={() => this.updateUsername()}>
                        <ImCheckmark style={{verticalAlign:'middle'}}/>
                    </div>
                </div>
                <div className="profile-email">
                    <input 
                        type="text"
                        name="email"
                        value={this.state.email}
                        maxLength={50}
                        onChange={(
                            ev: React.ChangeEvent<HTMLInputElement>,
                        ): void => this.updateForm(ev)}/>
                    <div 
                        className="confirm-change"
                        onClick={() => this.updateEmail()}>
                        <ImCheckmark style={{verticalAlign:'middle'}}/>
                    </div>
                </div>
                <div className="input-error">
                    {this.state.error}
                </div>
            </div>
        )
    }
}

const UserInfoFormItem = connect(
    mapStateToProps,
    mapDispatchToProps
)(UserInfoFormItemBind);

export default UserInfoFormItem;