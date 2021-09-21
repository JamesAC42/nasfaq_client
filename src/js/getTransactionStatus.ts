import { ICoinData } from "./interfaces/ICoinInfo";
import { IWallet } from "./interfaces/IWallet";

import {COOLDOWN} from './components/constants';

const getTransactionStatus = (
        wallet:IWallet,
        coinData:ICoinData, 
        name:string,
        verified:boolean,
        muted:boolean,
        buyQuantity:number,
        sellQuantity:number,
        credits:number,
        marketSwitch:boolean) => {

    let coins = wallet.coins;
    let amtOwned = (coins[name] === undefined) ? 0 : coins[name].amt;

    const price = coinData.price;
    const saleValue = coinData.saleValue;

    let buyDisabled = false;
    let sellDisabled = false;
    let lastBought = coins[name] === undefined ? 0 : coins[name].timestamp;
    let balance = wallet.balance;

    let sellRate = 0;
    if(sellQuantity > 1) {
        sellRate = sellQuantity * 0.1;
    }
    let buyRate = 0;
    if(buyQuantity > 1) {
        buyRate = (buyQuantity * 0.1) + 0.05;
    }

    let buyFee = Math.max((buyQuantity * price * buyRate) - credits, 0);
    let sellFee = Math.max((sellQuantity * saleValue * sellRate) - credits, 0);

    let buyTotal = (buyQuantity * price) + buyFee;

    buyDisabled = 
        (balance < buyTotal)
        || !verified
        || muted
        || !marketSwitch; 
    sellDisabled = 
        (amtOwned < sellQuantity)
        || (balance + (sellQuantity * saleValue) < sellFee)
        || !verified
        || muted
        || !marketSwitch;

    let timeRemaining = 0;
    const now = new Date().getTime();
    const e = (1000 * 60 * COOLDOWN);
    if((now - lastBought) < e) {
        timeRemaining = e - (now - lastBought);
    }
    
    return {
        timeRemaining,
        buyDisabled,
        sellDisabled
    }

}

export default getTransactionStatus;