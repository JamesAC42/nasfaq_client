import React, { Component } from 'react';
import Button from '../Button';

interface DeleteAccountDialogueProps {
    visible: boolean,
    deleted: () => void,
    toggle: () => void
}

class DeleteAccountDialogue extends Component<DeleteAccountDialogueProps> {
    
    deleteAccount() {
        fetch('/api/deleteOwnAccount/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.props.deleted();
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
                        Are you sure you want to delete your account?
                    </div>
                    <div className="delete-options">
                        <Button 
                            className="red inverse"
                            onClick={() => this.deleteAccount()}>
                                Yes
                        </Button>
                        <Button 
                            className="green inverse"
                            onClick={() => this.props.toggle()}>
                                Cancel
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
}

export default DeleteAccountDialogue;