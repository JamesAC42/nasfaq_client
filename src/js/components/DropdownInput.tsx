import React, {Component} from 'react';

import "../../css/dropdown.scss";

import {
    BsCaretDownFill
} from 'react-icons/bs';

interface DropdownOptionsProps {
    visible:boolean,
    options:Array<any>,
    update:(val:any) => void
}

class DropdownOptions extends Component<DropdownOptionsProps> {
    render() {
        if(!this.props.visible) return null;
        return(
            <div className="dropdown-options">
                {
                    this.props.options.map((o, index) => 
                    <div
                        className="dropdown-option"
                        onClick={() => this.props.update(o)}
                        key={index}>
                        {o}
                    </div>    
                    )
                }
            </div>
        )
    }
}

interface DropdownProps {
    label:string,
    options: Array<any>,
    default:any,
    onChange: (val:any) => void
}

class DropdownState {
    optionsVisible:boolean;
    selected:any;
    constructor() {
        this.optionsVisible = false;
        this.selected = '';
    }
}

class DropdownInput extends Component<DropdownProps> {
    state:DropdownState;
    constructor(props:DropdownProps) {
        super(props);
        this.state = new DropdownState();
    }
    toggleOptionsVisible() {
        let vis = !this.state.optionsVisible;
        this.setState({
            optionsVisible: vis
        })
    }
    componentDidMount() {
        this.setState({
            selected:this.props.default
        })
    }
    update(val:any) {
        this.setState({
            optionsVisible:false,
            selected:val
        });
        this.props.onChange(val);
    }
    render() {
        return(
            <div className="dropdown-container flex flex-row flex-center">
                <div className="dropdown-label">
                    {this.props.label}
                </div>
                <div className="filter-item dropdown-outer">
                    <div 
                        className="dropdown-selected flex flex-row flex-center"
                        onClick={
                            () => this.toggleOptionsVisible()
                        }>
                        <div className="selected-option">
                            {this.state.selected}
                        </div>
                        <div className="dropdown-arrow">
                            <BsCaretDownFill style={{verticalAlign:"middle"}}/>
                        </div>
                    </div>
                    <DropdownOptions
                        visible={this.state.optionsVisible}
                        options={this.props.options}
                        update={(val:any) => this.update(val)} />
                </div>
            </div>
        )
    }
}

export default DropdownInput;