import React, {Component} from 'react';

import { connect } from 'react-redux';
import { adminActions } from '../../actions/actions';

import DividendToggleItem from './DividendToggleItem';

const mapStateToProps = (state:any, props:any) => ({
    admin:state.admin
});

const mapDispatchToProps = {
    setDividendToggles: adminActions.setDividendToggles
};

interface DividendTogglesProps {
    admin: {
        dividendToggles:any
    },
    setDividendToggles: (dividendToggles:any) => {}
}

class DividendTogglesBind extends Component<DividendTogglesProps> {

    updateDividendToggle(coin:string, payState:string) {
        let toggles = {...this.props.admin.dividendToggles};
        if(toggles[coin] === payState) return;
        fetch('/api/setDividendToggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                coin
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                if(toggles[coin] === '1') {
                    toggles[coin] = '0';
                } else {
                    toggles[coin] = '1';
                }
                this.props.setDividendToggles(toggles);
            } else {
                console.log(data);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    render() {
        if(this.props.admin.dividendToggles === undefined) return null;

        const coins = Object.keys(this.props.admin.dividendToggles);
        coins.sort();
        return(
            <div className="adjustment-container">
                <div className="control-header">
                    Dividend Toggles
                </div>
                <div className="control-description">
                    Toggle whether each coin will pay dividends.
                </div>
                <div className="adjustment-inner flex flex-col flex-center">
                    <table className="adjustment-table">
                        <thead>
                            <tr className="table-subheader">
                                <td></td>
                                <td>Coin</td>
                                <td className="type-header">Will Pay</td>
                                <td className="type-header">Will Not Pay</td>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            coins.map((coin:string) => 
                                <DividendToggleItem 
                                    key={coin}
                                    coin={coin}
                                    payState={this.props.admin.dividendToggles[coin]}
                                    onUpdate={(coin:string, payState:string) => this.updateDividendToggle(coin, payState)}/>
                            )
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

const DividendToggles = connect(
    mapStateToProps, 
    mapDispatchToProps
)(DividendTogglesBind);

export default DividendToggles;