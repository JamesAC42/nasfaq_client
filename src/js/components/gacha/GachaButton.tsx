import React, {Component} from 'react';

class GachaButtonState {
    pressed:boolean;
    hover:boolean;
    constructor() {
        this.hover = false;
        this.pressed = false;
    }
}

type clickEvent = React.MouseEvent<HTMLDivElement>;

interface GachaButtonProps {
    className?:string;
    rolling:boolean;
    onClick:(e:clickEvent) => void
}

class GachaButton extends Component<GachaButtonProps> {

    state:GachaButtonState;
    constructor(props:GachaButtonProps) {
        super(props);
        this.state = new GachaButtonState();
    }
    
    toggleHover(s:boolean) {
        this.setState({hover:s});
    }

    togglePressed(s:boolean) {
        if(this.props.rolling) return;
        this.setState({pressed:s});
    }

    onMouseDown(e:clickEvent) {
        if(this.props.rolling) return;
        this.togglePressed(true);
    }

    onMouseUp(e:clickEvent) {
        if(this.props.rolling) return;
        this.props.onClick(e);
        this.togglePressed(false);
    }

    render() {

        let backgroundClass = 'gacha-button-background';
        if(this.state.hover) {
            backgroundClass += ' gacha-button-background-hover';
        }
        let buttonClass = 'gacha-button-inner';
        if(this.state.pressed) {
            buttonClass += ' gacha-button-inner-pressed';
        }

        return(
            <div 
                className={"gacha-button " 
                    + (this.props.className ? this.props.className : "")}
                onMouseEnter={() => this.toggleHover(true)}
                onMouseLeave={() => this.toggleHover(false)}>
                <div className={backgroundClass}></div>
                <div 
                    className={buttonClass}
                    onMouseDown={(e:clickEvent) => this.onMouseDown(e)}
                    onMouseUp={(e:clickEvent) => this.onMouseUp(e)}>
                        {this.props.children}
                </div>
            </div>
        )
    }
}

export default GachaButton;