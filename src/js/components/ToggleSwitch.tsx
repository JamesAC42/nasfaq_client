import React, {Component} from 'react';

interface ToggleSwitchProps {
    onLabel:string,
    offLabel:string,
    switchState:boolean,
    className?:string,
    onToggle:(setTo?:boolean) => void
}

class ToggleSwitch extends Component<ToggleSwitchProps> {
    getSwitchClass() {
        return this.props.switchState ? "on" : "";
    }
    render() {
        return(
            <div className={`toggle-outer ${this.props.className}`}>
                <div 
                    className="tp-label"
                    onClick={() => this.props.onToggle(true)}>
                    {this.props.onLabel}
                </div>
                <div 
                    className="tp-switch-outer"
                    onClick={() => this.props.onToggle()}>
                    <div className="tp-switch-bar">
                    </div>
                    <div className={`tp-switch-circle ${this.getSwitchClass()}`}>
                    </div>
                </div>
                <div 
                    className="tp-label"
                    onClick={() => this.props.onToggle(false)}>
                    {this.props.offLabel}
                </div>
            </div>
        )
    }
}

export default ToggleSwitch;