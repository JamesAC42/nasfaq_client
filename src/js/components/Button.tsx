import React, { Component } from 'react';

class ButtonProps {
    onClick?: () => any;
    className?: string;
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
        return(
            <div 
                className={`button ${this.props.className} ${buttonActive}`}>
                <div className="button-inner">
                    <div className="button-background">
                    </div>
                    <div 
                        className="button-container"
                        onClick={() => {
                            if(this.props.onClick) this.props.onClick();
                        }}
                        onMouseDown={() => this.buttonPress()}
                        onMouseUp={() => this.buttonRelease()}
                        onMouseLeave={() => this.buttonRelease()}>
                        {this.props.children}
                    </div>
                </div>
            </div>
        )
    }
}

export default Button;