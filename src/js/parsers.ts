import { ICoinInfo } from "./interfaces/ICoinInfo";

export const parseCoinHistory = (history:any) => {
    let historyObject:any = {};
    history.forEach((hEntry:ICoinInfo) => {
        let date = new Date(hEntry.timestamp).toLocaleDateString();
        Object.keys(hEntry.data).forEach((coin:string) => {
            let coinItem:any = hEntry.data[coin];
            if(historyObject[coin] === undefined) {
                historyObject[coin] = {
                    labels: [],
                    inCirculation: [],
                    price: []
                }
            }
            historyObject[coin].labels.push(date);
            historyObject[coin].inCirculation.push(coinItem.inCirculation);
            historyObject[coin].price.push(coinItem.price);
        })
    });
    return historyObject;
}