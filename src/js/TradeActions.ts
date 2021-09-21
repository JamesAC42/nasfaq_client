import { Order } from "./interfaces/ITransaction";

export const tradeCoins = (orders:Array<Order>) => {
    fetch('/api/trade/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            orders
        })
    })
    .then(response => response.json())
    .then(data => {
        //console.log(new Date().toLocaleString());
        if(data.success) {
            //this.updateTransactionStatus();
            //console.log(data);
        } else {
            console.log("fail: ", data);
        }
    })
    .catch(error => {
        console.error('Error: ' +  error);
    })
}