import {ICoinInfo} from './interfaces/ICoinInfo';

const graphEntryFromHistory = (coin:string, history:Array<ICoinInfo>) => {

    let prices = [];
    let owned = [];
    let labels = [];

    let histLength = history.length;

    for(let i = 0; i < histLength; i++) {

        let info:ICoinInfo = history[i];

        if(info.data[coin] !== undefined) {
            let price = info.data[coin].price;
            let inCir = info.data[coin].inCirculation;
            let date = new Date(info.timestamp).toLocaleDateString();
    
            prices.push(price);
            owned.push(inCir);
            labels.push(date);
        }

    }
    return {
        prices,
        owned,
        labels
    };
}

export default graphEntryFromHistory;