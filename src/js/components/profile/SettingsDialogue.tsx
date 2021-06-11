import React, { Component } from 'react';
import { connect } from 'react-redux';
import { userinfoActions } from '../../actions/actions';
import {
    BiX
} from 'react-icons/bi';
import Button from '../Button';
import ToggleSwitch from '../ToggleSwitch';

const mapDispatchToProps = {
    setSettings: userinfoActions.setSettings
}
const mapStateToProps = (state:any, props:any) => ({
    userinfo: state.userinfo
});

interface SettingsDialogueProps {
    visible:boolean,
    userinfo: {
        settings:any
    },
    toggle: () => void,
    setSettings: (settings:string) => {}
}

class SettingsDialogueState {
    walletIsPublic: boolean;
    constructor() {
        this.walletIsPublic = false;
    }
}

class SettingsDialogueBind extends Component<SettingsDialogueProps> {

    state:SettingsDialogueState;
    constructor(props:SettingsDialogueProps) {
        super(props);
        this.state = new SettingsDialogueState();
    }

    componentDidMount() {
        if(this.props.userinfo.settings !== null) {
            let settings = JSON.parse(this.props.userinfo.settings);
            this.setState({walletIsPublic: settings.walletIsPublic});
        }
    }

    saveSettings() {

        const settings = {
            walletIsPublic: this.state.walletIsPublic
        }
        fetch('/api/updateSettings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({settings})
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.props.setSettings(JSON.stringify(settings));
                this.props.toggle();
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    toggleWalletPublic(set?:boolean) {
        let newSet = (set === undefined) ? !this.state.walletIsPublic : set;
        this.setState({
            walletIsPublic: newSet
        });
    }

    render() {
        if(!this.props.visible) return null;
        let walletIsPublic = this.state.walletIsPublic;
        if(walletIsPublic === undefined) {
            walletIsPublic = false;
        }
        return(
            <div className="dialogue center-child">
                <div className="dialogue-container settings-dialogue">
                    <div
                        onClick={() => this.props.toggle()} 
                        className="exit-dialogue center-child">
                        <BiX/>
                    </div>
                    <div className="dialogue-header">
                        Settings
                    </div>
                    <div className="settings-row">
                        <div className="settings-label">
                            Make wallet public
                        </div>
                        <div className="settings-control">
                            <ToggleSwitch
                                onLabel={"Public"}
                                offLabel={"Private"}
                                switchState={walletIsPublic}
                                onToggle={(setTo?:boolean) => this.toggleWalletPublic(setTo)} />
                        </div>
                    </div>
                    <div className="settings-row save-row">
                        <Button 
                            className="green inverse"
                            onClick={() => this.saveSettings()}>
                                Save
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
}

const SettingsDialogue = connect(
    mapStateToProps,
    mapDispatchToProps
)(SettingsDialogueBind);

export default SettingsDialogue;