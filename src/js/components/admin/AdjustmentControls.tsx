import React, { Component } from 'react';

import { connect } from 'react-redux';
import { adminActions } from '../../actions/actions';

import AdjustmentItem, {AdjustmentType} from './AdjustmentItem';

const mapStateToProps = (state:any, props:any) => ({
    admin:state.admin
});

const mapDispatchToProps = {
    setAdminAdjustmentControls: adminActions.setAdminAdjustmentControls
};

interface AdjustmentProps {
    admin: {
        adjustmentControls:any
    },
    setAdminAdjustmentControls: (adjustmentControls:any) => {}
}

class AdjustmentControlsBind extends Component<AdjustmentProps> {
    updateAdjustmentType(coin:string, type:AdjustmentType) {
        let adjustmentControls = {...this.props.admin.adjustmentControls};
        adjustmentControls[coin] = type;
        fetch('/api/setAdjustmentToggles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                adjustmentControls
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.props.setAdminAdjustmentControls(adjustmentControls);
            } else {
                console.log(data);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }
    render() {
        if(this.props.admin.adjustmentControls === undefined) return null;

        const coins = Object.keys(this.props.admin.adjustmentControls);
        coins.sort();
        return(
            <div className="adjustment-container">
                <div className="control-header">
                    Adjustment Controls
                </div>
                <div className="control-description">
                    Set the adjustment behavior of each coin.
                </div>
                <div className="adjustment-inner flex flex-col flex-center">
                    <table className="adjustment-table">
                        <thead>
                            <tr className="table-header">
                                <td></td>
                                <td></td>
                                <td colSpan={3}>Behavior</td>
                            </tr>
                            <tr className="table-subheader">
                                <td></td>
                                <td>Coin</td>
                                <td className="type-header">Default</td>
                                <td className="type-header">Do Not Adjust</td>
                                <td className="type-header">Return to Base</td>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            coins.map((coin:string) => 
                                <AdjustmentItem 
                                    key={coin}
                                    coin={coin}
                                    adjustmentType={this.props.admin.adjustmentControls[coin]}
                                    onUpdate={(coin:string, type:AdjustmentType) => this.updateAdjustmentType(coin, type)}/>
                            )
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

const AdjustmentControls = connect(
    mapStateToProps,
    mapDispatchToProps
)(AdjustmentControlsBind);

export default AdjustmentControls;