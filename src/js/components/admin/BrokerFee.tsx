import React, {Component} from 'react';

import { connect } from 'react-redux';
import { statsActions } from '../../actions/actions';

const mapStateToProps = (state:any, props:any) => ({
    stats:state.stats
});

const mapDispatchToProps = {
    setBrokerFee: statsActions.setBrokerFee
};

interface BrokerFeeProps {
    stats: {
        brokerFee:any
    },
    setBrokerFee: (brokerFee:any) => {}
}

class BrokerFeeState {
    fee:string;
    constructor() {
        this.fee = '';
    }
}

type formEvent = React.ChangeEvent<HTMLInputElement>;
class BrokerFeeBind extends Component<BrokerFeeProps> {

    state:BrokerFeeState;
    constructor(props:BrokerFeeProps) {
        super(props);
        this.state = new BrokerFeeState();
    }

    componentDidMount() {
        if(this.props.stats.brokerFee !== undefined) {
            this.setState({fee: this.props.stats.brokerFee});
        }
    }

    componentDidUpdate(prevProps:BrokerFeeProps) {
        if(
            prevProps.stats.brokerFee === undefined &&
            this.props.stats.brokerFee !== undefined) {
            this.setState({fee: this.props.stats.brokerFee});
        }
    }

    handleChange(e:formEvent) {

        let fee:string = e.target.value;
        this.setState({fee});

    }

    updateFee() {

        let fee = parseFloat(this.state.fee);
        if(isNaN(fee)) {return;}

        fetch('/api/setBrokerFee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fee
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.props.setBrokerFee(this.state.fee);
                alert("Fee updated successfully.");
            } else {
                console.log(data);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    render() {
        return(
            <div className="adjustment-container">
                <div className="control-header">
                    Broker Fee
                </div>
                <div className="control-description">
                    Set the broker fee.
                </div>
                <div className="adjustment-inner flex flex-col flex-center">
                    <table className="adjustment-table">
                        <thead></thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className="fee-label">Fee</div>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="fee-input"
                                        value={this.state.fee}
                                        onChange={(e:formEvent) => this.handleChange(e)}/>
                                </td>
                                <td>
                                    <div
                                        className="update-fee"
                                        onClick={() => this.updateFee()}>
                                            Update
                                        </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

const BrokerFee = connect(
    mapStateToProps,
    mapDispatchToProps
)(BrokerFeeBind);

export default BrokerFee;
