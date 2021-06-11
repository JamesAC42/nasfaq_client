import React, { Component } from 'react';
import '../../css/transactionUpdater.scss';

import { connect } from 'react-redux';
import Coin from './Coin';

import {
    transactionActions
} from '../actions/actions';
import { ITransaction, TransactionType } from '../interfaces/ITransaction';

const mapStateToProps = (state:any, props:any) => ({
    transactions:state.transactions
});

const mapDispatchToProps = {
    removeTransaction: transactionActions.removeTransaction
}

interface TransactionUpdaterProps {
    transactions: Array<ITransaction>,
    removeTransaction: () => {}
}

interface TransactionItemProps {
    transaction:ITransaction,
    removeTransaction: () => {}
}

class TransactionItem extends Component<TransactionItemProps> {

    componentDidMount() {
        setTimeout(() => {
            this.props.removeTransaction();
        }, 5000);
    }
    
    transactionMessage(t:ITransaction) {
        let name = t.coin;
        if(name === "himemoriluna") name = "luna";
        let type = t.type === TransactionType.BUY ? "BUY" : "SELL";
        let status = t.completed ? "COMPLETED" : "PENDING";
        let m = `${type} on ${name} ${status}`;
        return m;
    }

    render() {
        let name = this.props.transaction.coin;
        if(name === "himemoriluna") name = "luna";
        return(
            <div className="transaction-item">
                <Coin name={name} />
                <div className="transaction-message">
                    { this.transactionMessage(this.props.transaction) }
                </div>
            </div>
        )
    }

}

class TransactionUpdaterBind extends Component<TransactionUpdaterProps> {

    componentDidMount() {
        setInterval(() => {
            if(this.props.transactions.length > 0) {
                if(this.props.transactions !== undefined) {
                    let now = new Date().getTime();
                    if((now - this.props.transactions[0].timestamp) > 5000) {
                        this.props.removeTransaction();
                    }
                }
            }
        },5000)
    }

    render() {

        return (
            <div className="transactions-container">
                {
                    this.props.transactions.map((transaction:ITransaction, index:number) => 
                        <TransactionItem 
                            key={index + ":" + transaction.timestamp}
                            transaction={transaction}
                            removeTransaction={() => this.props.removeTransaction()}
                            />
                    )
                }
            </div>
        )
    }

}

const TransactionUpdater = connect(
    mapStateToProps,
    mapDispatchToProps
)(TransactionUpdaterBind);

export default TransactionUpdater;