import React, { Component } from 'react';
import Button from '../Button';
import { PasswordItem } from '../InputItem';

interface DeleteAccountDialogueProps {
    visible: boolean,
    deleted: () => void,
    toggle: () => void
}

class DeleteAccountDialogueState {
    password:string;
    error:string;
    constructor() {
        this.password = "";
        this.error = "";
    }
}
type formEvent = React.ChangeEvent<HTMLInputElement>;

class DeleteAccountDialogue extends Component<DeleteAccountDialogueProps> {
    
    state:DeleteAccountDialogueState;
    constructor(props:DeleteAccountDialogueProps) {
        super(props);
        this.state = new DeleteAccountDialogueState();
    }
    updatePassword = (e:formEvent) => {
        this.setState({
            ...this.state,
            password:e.target.value
        });
    }
    deleteAccount() {
        if(this.state.password === "") {
            this.setState({error:"You must enter your password"});
            return;
        }
        fetch('/api/deleteOwnAccount/', {
            method: 'POST',
            body: JSON.stringify({
                password:this.state.password
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.props.deleted();
            } else {
                this.setState({
                    password:"",
                    error:data.message
                })
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    render() {
        if(!this.props.visible) return null;
        return(
            <div className="dialogue center-child">
                <div className="dialogue-container delete-dialogue">
                    <div className="delete-message">
                        Are you sure you want to delete your account? You can't undo this!
                    </div>
                    <div className="input-label">Password</div>
                        <PasswordItem
                            value={this.state.password} 
                            maxLength={200}
                            name={"password"}
                            updateValue={this.updatePassword} />
                    <div className="delete-options">
                        <Button 
                            className="red inverse"
                            onClick={() => this.deleteAccount()}>
                                Delete
                        </Button>
                        <Button 
                            className="green inverse"
                            onClick={() => this.props.toggle()}>
                                Cancel
                        </Button>
                    </div>
                    <div className="delete-error">{this.state.error}</div>
                </div>
            </div>
        )
    }
}

export default DeleteAccountDialogue;