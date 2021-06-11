import React, { Component } from 'react';

import {COOLDOWN} from './constants';

class ButtonProps {
    onClick?: () => any;
    className?: string;
    timeRemaining?: number;
    constructor() {
        this.onClick = () => {};
        this.className = "";
    }
}

class ButtonState {
    mouseDown: boolean;
    constructor() {
        this.mouseDown = false;
    }
}

class Button extends Component<ButtonProps> {
    state: ButtonState;
    constructor(props:ButtonProps) {
        super(props);
        this.state = new ButtonState();
    }
    buttonPress() {
        this.setState({mouseDown:true})
    }
    buttonRelease() {
        this.setState({mouseDown:false})
    }
    render() {
        const buttonActive = this.state.mouseDown ? "active" : "";
        let timerWidth = 0;
        let remainingString = '';
        if(this.props.timeRemaining) {
            const e = (1000 * 60 * COOLDOWN);
            timerWidth = Math.round((this.props.timeRemaining / e) * 10000) / 100;
            
            let secondsRemaining = Math.floor(this.props.timeRemaining / 1000) % 60;
            let minutesRemaining = Math.floor((this.props.timeRemaining / 1000) / 60);
            if(minutesRemaining > 0) {
                remainingString += minutesRemaining + " minute";
                if(minutesRemaining > 1) remainingString += "s";
                if(secondsRemaining > 0) {
                    remainingString += " and ";
                }
            }
            if(secondsRemaining > 0) {
                remainingString += secondsRemaining + " second";
                if(secondsRemaining > 1) remainingString += "s";
            }
            if(this.props.timeRemaining > 0) {
                remainingString += " remaining";
            }
        }
        
        return(
            <div 
                className={`button ${this.props.className} ${buttonActive}`}
                onClick={() => {
                    if(this.props.onClick) this.props.onClick();
                }}
                onMouseDown={() => this.buttonPress()}
                onMouseUp={() => this.buttonRelease()}
                onMouseLeave={() => this.buttonRelease()}
                title={remainingString}>
                <div className="button-inner">
                    <div className="button-background">
                    </div>
                    <div className="button-container">
                        {this.props.children}
                        <div 
                            className="button-timer"
                            style={{
                                width: timerWidth + "%"
                            }}>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Button;