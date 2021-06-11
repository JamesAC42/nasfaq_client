import React, { Component } from 'react';
import { connect } from 'react-redux';

import Coin from '../Coin';
import iconMap from '../Icons';
import { userinfoActions } from '../../actions/actions';
import {
    BiX
} from 'react-icons/bi';

const mapDispatchToProps = {
    setIcon: userinfoActions.setIcon
}

interface UpdateIconDialogueProps {
    visible:boolean,
    toggle: () => void,
    setIcon: (icon:string) => {}
}

class UpdateIconDialogueBind extends Component<UpdateIconDialogueProps> {
    
    updateIcon(icon:string) {
        fetch('/api/setIcon/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                icon
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.props.setIcon(icon);
                this.props.toggle();
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    render() {
        let icons = Object.keys(iconMap);
        icons.push("blank");

        if(!this.props.visible) return null;
        return(
            <div className="dialogue center-child">
                <div className="dialogue-container">
                    <div
                        onClick={() => this.props.toggle()} 
                        className="exit-dialogue center-child">
                        <BiX/>
                    </div>
                    <div className="dialogue-header">
                        Change Icon
                    </div>
                    <div className="icon-container">
                        {
                            icons.map((coin:string, index:number) => 
                                <Coin 
                                    name={coin} 
                                    key={coin} 
                                    onClick={() => this.updateIcon(coin)}/>
                            )
                        }
                    </div>
                </div>
            </div>
        )
    }
}

const UpdateIconDialogue = connect(
    null,
    mapDispatchToProps
)(UpdateIconDialogueBind);

export default UpdateIconDialogue;