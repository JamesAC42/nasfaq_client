import React, { Component } from 'react';

import { connect } from 'react-redux';
import { adminActions } from '../../actions/actions';

import ToggleSwitch from '../ToggleSwitch';
import Button from '../Button';

const mapStateToProps = (state:any, props:any) => ({
    admin:state.admin
});

const mapDispatchToProps = {
    setOverbought: adminActions.setOverbought,
    setOversold: adminActions.setOversold,
    setBogrationLevel: adminActions.setBogrationLevel,
    setUpwardsReductionLevel: adminActions.setUpwardsReductionLevel
};

interface AdjustmentParameterProps {
    admin: {
        overbought: boolean,
        oversold: boolean,
        bogrationLevel: string,
        upwardsReductionLevel: string
    },
    setOverbought: (overbought: boolean) => {}
    setOversold: (oversold: boolean) => {}
    setBogrationLevel: (bogrationLevel: string) => {}
    setUpwardsReductionLevel: (upwardsReductionLevel: string) => {}
}

type formEvent = React.ChangeEvent<HTMLInputElement>;
class AdjustmentParametersBind extends Component<AdjustmentParameterProps> {
    saveInput() {
        let overbought = this.props.admin.overbought ? 1 : 0;
        let oversold = this.props.admin.oversold ? 1 : 0;
        let bogrationLevel = parseFloat(this.props.admin.bogrationLevel);
        let upwardsReductionLevel = parseFloat(this.props.admin.upwardsReductionLevel);
        if(isNaN(bogrationLevel) || isNaN(upwardsReductionLevel)) {
            alert("Invalid input");
            return;
        }
        if(bogrationLevel < 0 || bogrationLevel > 1) {
            alert("Invalid input");
            return;
        }
        if(upwardsReductionLevel < 0 || upwardsReductionLevel > 1) {
            alert("Invalid input");
            return;
        }

        fetch('/api/setAdjustmentParams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                overbought,
                oversold,
                bogrationLevel,
                upwardsReduction: upwardsReductionLevel
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                alert("Success!");
            } else {
                console.log(data);
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
            alert('Error: ' + error);
        })

    }
    render() {
        return(
            <div className="adjust-params-container">
                <Button
                    className={"green inverse"}
                    onClick={() => this.saveInput()}>Save</Button>
                <div className="flex-row flex-center">
                    Overbought:
                    <ToggleSwitch
                        onLabel={"ON"}
                        offLabel={"OFF"}
                        switchState={this.props.admin.overbought}
                        className={""}
                        onToggle={() => {
                            this.props.setOverbought(!this.props.admin.overbought);
                        }} />
                    Oversold:
                    <ToggleSwitch
                        onLabel={"ON"}
                        offLabel={"OFF"}
                        switchState={this.props.admin.oversold}
                        className={""}
                        onToggle={() => {
                            this.props.setOversold(!this.props.admin.oversold);
                        }} />
                </div>
                <div className="flex-row flex-center">
                    Bogration Level:
                    <input
                        type="text"
                        value={this.props.admin.bogrationLevel}
                        className="volatility-input"
                        onChange={(e:formEvent) => {
                            this.props.setBogrationLevel(e.target.value)
                        }} />
                    Upwards Reduction Level:
                    <input
                        type="text"
                        value={this.props.admin.upwardsReductionLevel}
                        className="volatility-input"
                        onChange={(e:formEvent) => {
                            this.props.setUpwardsReductionLevel(e.target.value)
                        }} />
                </div>
            </div>
        );
    }
}

const AdjustmentParameters = connect(
    mapStateToProps,
    mapDispatchToProps
)(AdjustmentParametersBind);

export default AdjustmentParameters;
