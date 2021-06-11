import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';

import '../../../css/admin.scss';
import Button from '../Button';
import Calendar from 'react-calendar';

import Report from './Report';
import ToggleSwitch from '../ToggleSwitch';

const mapStateToProps = (state:any, props:any) => ({
    userinfo:state.userinfo,
    session:state.session,
    settings:state.settings
});

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
    }
}

class AdminState {
    users: Array<UserItem>;
    userToDelete: string;
    usernameToDelete: string;
    deleteDialogueVisible: boolean;
    userToMute: string;
    usernameToMute: string;
    muteDialogueVisible: boolean;
    muteUntilDate:Date;
    muteMessage:string;
    filters:string;
    reports:Array<any>;
    updatedFilters:boolean;
    constructor() {
        this.users = [];
        this.userToDelete = '';
        this.usernameToDelete = '';
        this.deleteDialogueVisible = false;
        this.userToMute = '';
        this.usernameToMute = '';
        this.muteDialogueVisible = false;
        this.muteUntilDate = new Date();
        this.muteMessage = '';
        this.filters = '';
        this.reports = [];
        this.updatedFilters = false;
    }
}

type formEvent = React.ChangeEvent<HTMLTextAreaElement>;
class AdminBind extends Component<AdminProps> {
    state:AdminState;
    constructor(props:AdminProps) {
        super(props);
        this.state = new AdminState();
    }
    textFromFilters(words:any) {
        if(Array.isArray(words)) {
            let text = '';
            words.forEach((w:string) => {
                text += w + "\n";
            });
            return text;
        } else {
            let text = '';
            Object.keys(words).forEach((w:string) => {
                text += w + "\n";
            });
            return text;
        }
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
                this.setState({
                    users:data.users,
                    filters:this.textFromFilters(data.filters.words),
                    reports:data.reports
                });
            } else {
                console.log(data);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
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
                let users = [...this.state.users];
                for(let n = 0; n < users.length; n++) {
                    if(users[n].id === userid) {
                        users.splice(n, 1);
                        this.setState({
                            users,
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
                let users = [...this.state.users];
                for(let n = 0; n < users.length; n++) {
                    if(users[n].id === userid) {
                        users[n].muted = JSON.stringify(muted);
                        this.setState({
                            users,
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
    saveFilters() {
        let filterString = this.state.filters;
        let words = filterString.split("\n");
        words = words.filter((phrase:string) => {
            return phrase !== '';
        });
        fetch('/api/updateFilters', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                words
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.setState({
                    updatedFilters:true
                });
                setTimeout(() => {
                    this.setState({
                        updatedFilters:false
                    })
                }, 2000);
            } else {
                console.log(data);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }
    removeReport(index:number) {
        let reports = [...this.state.reports];
        reports.splice(index,1);
        this.setState({
            reports
        })
    }
    updateMuteUntilDate(date:Date) {
        this.setState({
            muteUntilDate:date
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
    handleText(a:formEvent) {
        this.setState({
            [a.target.name]:a.target.value
        });
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
        return(
            <div className="container fill">
                <div className="container-inner flex-col flex-stretch">
                    <div className="admin-header">
                        Admin
                    </div>
                    <div className="admin-space flex-row flex-stretch">
                        <div className="word-filters-container flex-col flex-center">
                            <div className="control-header">
                                Filters
                            </div>
                            <div className="control-description">
                                Add words/ phrases to be filtered from the chat. Separate individual words/phrases by a newline.
                            </div>
                            <div className="filter-textarea flex-row flex-stretch">
                                <textarea 
                                    className="admin-textarea"
                                    id="wordfilter"
                                    name="filters"
                                    placeholder="Filters..."
                                    onChange={(
                                        ev: formEvent
                                    ): void => this.handleText(ev)}
                                    value={this.state.filters}>
                                </textarea>
                            </div>
                            <div className="save-button flex-col flex-center">
                                <Button
                                    className="green inverse"
                                    onClick={() => this.saveFilters()}>
                                        {
                                        this.state.updatedFilters ?
                                        "Saved" : "Save"
                                        }
                                </Button>
                            </div>
                        </div>
                        <div className="reports-container">
                            <div className="control-header">
                                Reports
                            </div>
                            <div className="control-description">
                                View and close reports that have come in from users.
                            </div>
                            {
                                this.state.reports.length === 0 ?
                                <div className="no-reports">
                                    No reports currently
                                </div> : null
                            }
                            <div className="reports-inner">
                                {
                                    this.state.reports.map((report:Report, index:number) => 
                                        <Report
                                            removeReport={(index:number) => this.removeReport(index)}
                                            index={index}
                                            report={report}
                                            key={report.id} />
                                    )
                                }
                            </div>
                        </div>
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
                                        <tr>
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
                                        this.state.users.map((user:UserItem, index:number) => 
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
    mapStateToProps
)(AdminBind);

export default Admin;