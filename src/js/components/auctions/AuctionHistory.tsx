import React, {Component} from 'react';

import { IAuctionHistoryEntry } from './IAuction';
import {connect} from 'react-redux';
import {ItemImages} from '../ItemImages';

import '../../../css/auctions/auctionhistory.scss';

import {
    AiFillCloseCircle
} from 'react-icons/ai';
import { Line } from 'react-chartjs-2';
import { datasetTemplate } from '../DatasetTemplate';
import {
    auctionsActions
} from '../../actions/actions';
import fetchData from '../../fetchData';
import numberWithCommas from '../../numberWithCommas';

const mapDispatchToProps = {
    setAuctionPriceHistory:auctionsActions.setAuctionPriceHistory,
}

const mapStateToProps = (state:any) => ({
    auctions: state.auctions
})

interface AuctionHistoryProps {
    auctions: {
        pastAuctions:Array<IAuctionHistoryEntry>,
        auctionPriceHistory:{[key:string]:Array<number>}
    },
    setAuctionPriceHistory: (auctionPriceHistory:any) => {}
}

class AuctionHistoryState {
    showPriceHistory:boolean;
    itemHistory:string;
    graphData:any;
    constructor() {
        this.showPriceHistory = false;
        this.itemHistory = '';
        this.graphData = {};
    }
}

class AuctionHistoryBind extends Component<AuctionHistoryProps> {

    state:AuctionHistoryState;
    constructor(props:AuctionHistoryProps) {
        super(props);
        this.state = new AuctionHistoryState();
    }

    setGraphData(priceHistory:Array<number>) {

        let datasets: Array<any> = [];
        let dataset = {...datasetTemplate};
        let data:any = {};

        dataset.label = "Price";
        data.labels = [];
        dataset.data = priceHistory;

        for(let i = 0; i < priceHistory.length; i++) {
            data.labels.push(i);
        }

        datasets.push(dataset);
        data.datasets = datasets;
        this.setState({
            graphData:data
        });

    }

    showPriceHistory(item:string) {

        if(this.props.auctions.auctionPriceHistory[item]) {

            this.setGraphData(this.props.auctions.auctionPriceHistory[item]);
            this.setState({
                showPriceHistory:true,
                itemHistory:item
            });

        } else {
            this.setGraphData([]);
            fetchData('/api/getAuctionPriceHistory?item=' + item)
            .then((data:any) => {
                if(data.success) {
                    let priceHistory = data.itemPriceHistory.history;
                    let auctionPriceHistory = {...this.props.auctions.auctionPriceHistory};
                    auctionPriceHistory[item] = priceHistory;
                    this.props.setAuctionPriceHistory(auctionPriceHistory);
                    this.setGraphData(priceHistory);
                    this.setState({
                        showPriceHistory:true,
                        itemHistory:item
                    });
                }

            })
        }

    }

    render() {
        return(
            <div className="auction-history">
                {
                    this.state.showPriceHistory ?
                    <div className="auction-price-history-chart">
                        <div className="close-price-chart">
                            <div 
                                className="close-price-chart-button"
                                onClick={() => this.setState({showPriceHistory:false})}>
                                <AiFillCloseCircle />
                            </div>
                        </div>
                        <div className="price-chart-header">
                            Price History for {this.state.itemHistory}
                        </div>
                        <Line 
                            data={this.state.graphData} 
                            options={{
                                animation: {
                                    duration: 300
                                },
                                easing: "easeInOutCubic",
                                scales: {
                                    xAxes: [{
                                        ticks: {
                                            display:true,
                                            fontFamily:"WorkSansSemiBold"
                                        }
                                    }],
                                    yAxes: [{
                                        ticks: {
                                            fontFamily:"WorkSansSemiBold"
                                        }
                                    }]
                                }
                            }}/> 
                    </div> : null
                }
                { 
                    this.props.auctions.pastAuctions.length > 0 ?
                    <table>
                        <thead>
                            <tr className="auction-history-header">
                                <td>Completion Time</td>
                                <td>Item</td>
                                <td>Amount</td>
                                <td>Seller</td>
                                <td>Bidder</td>
                                <td>Bid Amount</td>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.props.auctions.pastAuctions.map((auction:IAuctionHistoryEntry, index:number) =>
                                    <tr className="auction-history-entry" key={auction.item + index}>
                                        <td className="auction-history-expiration">
                                            {new Date(auction.expiration).toLocaleString()}
                                        </td>
                                        <td className="auction-history-item"
                                        onClick={() => this.showPriceHistory(auction.item)}>
                                            <img src={ItemImages[auction.item]} alt={auction.item} />
                                            {auction.item}
                                        </td>
                                        <td className="auction-history-amount">
                                            {auction.amount}
                                        </td>
                                        <td className="auction-history-seller">
                                            {auction.seller}
                                        </td>
                                        <td className="auction-history-bidder">
                                            {auction.bidder}
                                        </td>
                                        <td className="auction-history-bid">
                                            ${numberWithCommas(auction.currentBid)}
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                    :
                    <div className="no-past-auctions">
                        No Past Auctions!
                    </div>
                }
            </div>
        )
    }

}

const AuctionHistory = connect(
    mapStateToProps,
    mapDispatchToProps,
)(AuctionHistoryBind);

export default AuctionHistory;