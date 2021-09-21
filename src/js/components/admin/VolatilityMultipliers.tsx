import React, {Component} from 'react';

import { connect } from 'react-redux';
import { adminActions } from '../../actions/actions';

import VolatilityItem from './VolatilityItem';

const mapStateToProps = (state:any, props:any) => ({
    admin:state.admin
});

const mapDispatchToProps = {
    setVolatilityMultipliers: adminActions.setVolatilityMultipliers
};

interface VolatilityMultipliersProps {
    admin: {
        volatilityMultipliers:any
    },
    setVolatilityMultipliers: (volatilityMultipliers:any) => {}
}

class VolatilityMultipliersBind extends Component<VolatilityMultipliersProps> {

    updateMultiplier(coin:string, multiplier:number) {
        let multipliers = {...this.props.admin.volatilityMultipliers};
        multipliers[coin] = multiplier;
        this.props.setVolatilityMultipliers(multipliers);
    }

    render(){
        if(this.props.admin.volatilityMultipliers === undefined) return null;

        const coins = Object.keys(this.props.admin.volatilityMultipliers);
        coins.sort();
        return(
            <div className="adjustment-container">
                <div className="control-header">
                    Volatility Multipliers
                </div>
                <div className="control-description">
                    Tune how volatile each coin is.
                </div>
                <div className="adjustment-inner flex flex-col flex-center">
                    <table className="adjustment-table">
                        <thead>
                            <tr className="table-subheader">
                                <td></td>
                                <td>Coin</td>
                                <td className="type-header">Multiplier</td>
                                <td className="type-header"></td>
                                <td className="type-header"></td>
                                <td className="type-header"></td>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            coins.map((coin:string) => 
                                <VolatilityItem 
                                    key={coin}
                                    coin={coin}
                                    multiplier={this.props.admin.volatilityMultipliers[coin]}
                                    onUpdate={(coin:string, multiplier:number) => this.updateMultiplier(coin, multiplier)}/>
                            )
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

const VolatilityMultipliers = connect(
    mapStateToProps,
    mapDispatchToProps
)(VolatilityMultipliersBind);

export default VolatilityMultipliers;