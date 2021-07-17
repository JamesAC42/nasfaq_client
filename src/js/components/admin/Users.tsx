import React, { Component } from 'react';

import Calendar from 'react-calendar';
import { connect } from 'react-redux';
import Button from '../Button';
import { adminActions } from '../../actions/actions';

const mapStateToProps = (state:any, props:any) => ({
    admin:state.admin
});

const mapDispatchToProps = {
    setAdminUsers: adminActions.setAdminUsers
};

interface IMuted {
    muted:boolean,
    until:number,
    message:string
}

interface UserItem {
    icon:string,
    id:string,
    email:string,
    ip:string | null,
    muted:string | null,
    settings: string,
    username: string,
    verified: boolean,
    wallet: string
}

class UsersState {
    userToDelete: string;
    usernameToDelete: string;
    deleteDialogueVisible: boolean;
    userToMute: string;
    usernameToMute: string;
    muteDialogueVisible: boolean;
    muteUntilDate:Date;
    muteMessage:string;
    constructor(){
        this.userToDelete = '';
        this.usernameToDelete = '';
        this.deleteDialogueVisible = false;
        this.userToMute = '';
        this.usernameToMute = '';
        this.muteDialogueVisible = false;
        this.muteUntilDate = new Date();
        this.muteMessage = '';
    }
}

interface UsersProps {
    admin: {
        users: Array<any>,
        filters: any,
        reports: Array<any>,
        adjustmentControls: any
    },
    setAdminUsers: (users:any) => {}
}


type formEvent = React.ChangeEvent<HTMLTextAreaElement>;
class UsersBind extends Component<UsersProps> {
    state:UsersState;
    constructor(props:UsersProps) {
        super(props);
        this.state = new UsersState();
    }
    handleText(a:formEvent) {
        this.setState({
            [a.target.name]:a.target.value
        });
    }
    toggleDeleteDialogue(id:string, username:string) {
        let visible = !this.state.deleteDialogueVisible;
        this.setState({
            userToDelete:id,
            usernameToDelete:username,
            deleteDialogueVisible:visible
        })
    }
    toggleMuteDialogue(id:string, username:string) {
        let visible = !this.state.muteDialogueVisible;
        this.setState({
            userToMute:id,
            usernameToMute:username,
            muteDialogueVisible:visible
        })
    }
    deleteAccount() {
        let userid = this.state.userToDelete;
        fetch('/api/deleteAccountAdmin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                deleteUserId:userid
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                let users = [...this.props.admin.users];
                for(let n = 0; n < users.length; n++) {
                    if(users[n].id === userid) {
                        users.splice(n, 1);
                        this.props.setAdminUsers(users);
                        this.setState({
                            deleteDialogueVisible:false
                        });
                        break;
                    }
                }
            } else {
                console.log(data);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }
    
    formatMuted(muted:any) {
        if(muted === null) return <td>No</td>;
        muted = JSON.parse(muted);
        if(!muted.muted) return <td>No</td>;
        if(muted.until < new Date().getTime()) {
            return <td>No</td>
        }
        let untilTimestamp = new Date(muted.until).toLocaleString();
        let message = muted.message;
        return(
            <td className="table-muted">
                Until: {untilTimestamp}<br/>
                Message: {message}
            </td>
        )
    }
    muteUser() {
        let muted:IMuted = {
            muted:true,
            until:this.state.muteUntilDate.getTime(),
            message:this.state.muteMessage
        }
        let userid = this.state.userToMute;
        fetch('/api/updateUserMuted', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mutedBody:muted,
                userid
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                let users = [...this.props.admin.users];
                for(let n = 0; n < users.length; n++) {
                    if(users[n].id === userid) {
                        users[n].muted = JSON.stringify(muted);
                        this.props.setAdminUsers(users);
                        this.setState({
                            muteDialogueVisible:false
                        });
                        break;
                    }
                }
            } else {
                console.log(data);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }
    updateMuteUntilDate(date:Date) {
        this.setState({
            muteUntilDate:date
        })
    }
    render() {
        if(this.props.admin.users === undefined) return null;
        return(        
            <div className="admin-users-pane flex-col flex-stretch">
                <div className="control-header">
                    Users
                </div>
                <div className="control-description">
                    Mute or delete user accounts
                </div>
                <div className="admin-users-container">
                    <table>
                        <thead>
                            <tr className="users-container-header">
                                <th>#</th>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>IP</th>
                                <th>Muted</th>
                                <th>Verified</th>
                                <th>Icon</th>
                                <th>Mute User</th>
                                <th>Delete Account</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            this.props.admin.users.map((user:UserItem, index:number) => 
                                <tr
                                    key={user.id} 
                                    className="user-outer">
                                        <td>{index + 1}</td>
                                        <td className="table-id">{user.id}</td>
                                        <td className="table-username">{user.username}</td>
                                        <td className="table-email">{user.email}</td>
                                        <td className="table-ip">{user.ip === null ? "None" : user.ip}</td>
                                        {this.formatMuted(user.muted)}
                                        <td>{user.verified ? "Yes" : "No"}</td>
                                        <td>{user.icon}</td>
                                        <td className="table-action-item center-child">
                                            <div 
                                            className="user-action-btn mute-user"
                                            onClick={() => this.toggleMuteDialogue(user.id, user.username)}>
                                            Mute User
                                            </div>
                                        </td>
                                        <td className="table-action-item center-child">
                                            <div 
                                            className="user-action-btn delete-user"
                                            onClick={() => this.toggleDeleteDialogue(user.id, user.username)}>
                                            Delete
                                            </div>
                                        </td>
                                </tr>
                            )
                        }
                        </tbody>
                    </table>
                </div>

                {
                    this.state.deleteDialogueVisible ? 
                    <div className="delete-dialogue flex-row flex-center">
                        <div className="delete-dialogue-header">
                            Delete {this.state.usernameToDelete}?
                        </div>
                        <div className="delete-button-confirm-container flex-row flex-center">
                            <Button 
                                className="green inverse"
                                onClick={() => this.deleteAccount()}>
                                    Delete
                            </Button>
                            <Button 
                                className="red inverse"
                                onClick={() => this.toggleDeleteDialogue('', '')}>
                                    Cancel
                            </Button>
                        </div>
                    </div> : null
                }
                {
                    this.state.muteDialogueVisible ? 
                    <div className="mute-dialogue flex-col flex-stretch">
                        <div className="mute-dialogue-header">
                            Mute {this.state.usernameToMute}
                        </div>
                        <div className="mute-dialogue-actions flex-row flex-stretch">
                            <div className="mute-message flex-col">
                                <div className="mute-message-header">
                                    Reason/ Message:
                                </div>
                                <textarea 
                                    className="admin-textarea"
                                    id="mutemessage"
                                    placeholder="Message..."
                                    name="muteMessage"
                                    onChange={(
                                        ev: formEvent
                                    ): void => this.handleText(ev)}>
                                </textarea>
                            </div>
                            <div className="mute-until">
                                <div className="mute-until-header">
                                    Mute until:
                                </div>
                                <div className="mute-until-input">
                                <Calendar 
                                    calendarType="US"
                                    onClickDay={(value:any) => this.updateMuteUntilDate(value)}
                                    defaultValue={this.state.muteUntilDate}
                                    className={"date-updater-calendar"}/>
                                </div>
                            </div>
                        </div>
                        <div className="mute-confirm flex-row flex-center">
                            <Button 
                                className="green inverse"
                                onClick={() => this.muteUser()}>
                                Confirm
                            </Button>
                            <Button 
                                className="red inverse"
                                onClick={() => this.toggleMuteDialogue('', '')}>
                                Cancel
                            </Button>
                        </div>
                    </div> : null
                }
            </div>
        )
    }
}

const Users = connect(
    mapStateToProps,
    mapDispatchToProps
)(UsersBind);

export default Users;