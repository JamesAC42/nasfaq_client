import React, {Component} from 'react';

interface AdjustmentRadioProps {
    checked:boolean,
    coin:string, 
    value:any,
    onClick: (value:any) => void
}

class AdjustmentRadio extends Component<AdjustmentRadioProps> {
    render() {
        return(
            <div 
                className="radio-button flex center-child"
                onClick={() => this.props.onClick(this.props.value)}>
                {
                    this.props.checked ?
                    <div className="radio-button-inner">
                    </div> : null
                }
            </div>
        )
    }
}

export default AdjustmentRadio;