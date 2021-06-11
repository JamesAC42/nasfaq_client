import { ICoinData } from "./interfaces/ICoinInfo";
import { IWallet } from "./interfaces/IWallet";

import {COOLDOWN} from './components/constants';

const getTransactionStatus = (
        wallet:IWallet,
        coinData:ICoinData, 
        name:string,
        verified:boolean,
        muted:boolean,
        marketSwitch:boolean) => {

    let coins = wallet.coins;
    let amtOwned = (coins[name] === undefined) ? 0 : coins[name].amt;

    const price = coinData.price;

    let buyDisabled = false;
    let sellDisabled = false;
    let lastBought = coins[name] === undefined ? 0 : coins[name].timestamp;
    let balance = wallet.balance;

    buyDisabled = 
        (balance < price)
        || !verified
        || muted
        || !marketSwitch; 
    sellDisabled = 
        (amtOwned <= 0)
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