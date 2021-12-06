import React, {Component} from 'react';
import '../../../css/themes/snowfallsettings.scss';
import storageAvailable from '../../checkStorage';
import {connect} from 'react-redux';
import { snowfallActions } from '../../actions/actions';

const mapStateToProps = (state:any) => ({
    snowfall: state.snowfall
});

const mapDispatchToProps = {
    setSnowSpeed: snowfallActions.setSnowSpeed,
    setSnowSize: snowfallActions.setSnowSize,
    setSnowAmount: snowfallActions.setSnowAmount
}

class SnowfallSettingsState {
    amount:number;
    speed:number;
    size:number;
    constructor() {
        this.amount = 0.5;
        this.speed = 0.5;
        this.size = 0.5;
    }
}

interface SnowfallSettingsProps {
    snowfall: {
        snowSize:number,
        snowSpeed:number,
        snowAmount:number
    },
    setSnowSpeed: (speed:any) => {},
    setSnowSize: (size:any) => {},
    setSnowAmount: (amount:any) => {},
}

class SnowfallSettingsBind extends Component<SnowfallSettingsProps> {

    state:SnowfallSettingsState;
    constructor(props:SnowfallSettingsProps) {
        super(props);
        this.state = new SnowfallSettingsState();
    }

    handleChange(e:any) {
        this.setState({[e.target.name]: parseFloat(e.target.value)})    
    }

    componentDidMount() {
        this.setState({
            amount:this.props.snowfall.snowAmount,
            speed:this.props.snowfall.snowSpeed,
            size:this.props.snowfall.snowSize
        })
    }

    updateSettings() {
        this.props.setSnowAmount(this.state.amount);
        this.props.setSnowSize(this.state.size);
        this.props.setSnowSpeed(this.state.speed);

        if(storageAvailable()) {
            const snowSettings = {
                snowAmount:this.state.amount,
                snowSize:this.state.size,
                snowSpeed:this.state.speed
            }
            localStorage.setItem('nasfaq:snowfallSettings', JSON.stringify(snowSettings));
        }
    }

    render() {
        return(
            <div 
                className="snowfall-settings flex flex-col flex-stretch">
                <div className="snowfall-settings-header">Snow Settings</div>
                <div className="snowfall-settings-row flex flex-row">
                    <div className="snowfall-settings-label">Snow Amount</div>
                    <div className="snowfall-settings-input">
                        <input 
                            name="amount" 
                            type="range" 
                            min={0} 
                            max={1} 
                            value={this.state.amount} 
                            step={0.01} 
                            onChange={(e) => this.handleChange(e)}/>
                    </div>
                </div>
                <div className="snowfall-settings-row flex flex-row">
                    <div className="snowfall-settings-label">Snow Speed</div>
                    <div className="snowfall-settings-input">
                        <input 
                            name="speed" 
                            type="range" 
                            min={0.01} 
                            max={1} 
                            value={this.state.speed} 
                            step={0.01} 
                            onChange={(e) => this.handleChange(e)}/>
                    </div>
                </div>
                <div className="snowfall-settings-row flex flex-row">
                    <div className="snowfall-settings-label">Snow Size</div>
                    <div className="snowfall-settings-input">
                        <input 
                            name="size" 
                            type="range" 
                            min={0.01} 
                            max={1} 
                            value={this.state.size} 
                            step={0.01} 
                            onChange={(e) => this.handleChange(e)}/>
                    </div>
                </div>
                <div className="snowfall-settings-row flex flex-center">
                    <div 
                        className="set-snowfall-settings"
                        onClick={() => this.updateSettings()}>Update</div>
                </div>
            </div>
        )
    }

}

const SnowfallSettings = connect(
    mapStateToProps,
    mapDispatchToProps,
)(SnowfallSettingsBind);

export default SnowfallSettings;