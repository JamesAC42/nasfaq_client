import {
    ITodayPricesItem
} from './interfaces/ICoinInfo';

const graphEntryFromTodayPrices = (history:any) => {

    let prices = [];
    let owned = [];
    let labels = [];

    let tpLength = history.length;
    let lastTime = history[tpLength - 1].timestamp;

    for(let i = 0; i < tpLength; i++) {

        let item:ITodayPricesItem = history[i];
        let date = new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

        prices.push(item.price);
        owned.push(item.inCirculation);
        labels.push(date);

    }

    return {
        prices,
        owned,
        labels,
        lastTime
    };

}

export default graphEntryFromTodayPrices;