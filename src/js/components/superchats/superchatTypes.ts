import { ISuperchat } from "../../interfaces/ISuperchats";

export const PRICES_LIST:Array<number>
= [1, 500, 1000, 5000, 10000];

export const COLORS_LIST:Array<string>
= ["blue", "green", "yellow", "magenta", "red"];

export const EXPIRATION_LIST:Array<string>
= ["1 hour", "3 hours", "8 hours", "16 hours", "24 hours"];

export const CHARS_LIST:Array<number>
= [50, 150, 200, 300, 450];

interface IscPropMap {
    prices:Array<number>,
    colors:Array<string>,
    expiration:Array<string>,
    chars:Array<number>
}

export const scPropMap:IscPropMap = {
    prices: PRICES_LIST,
    colors: COLORS_LIST,
    expiration: EXPIRATION_LIST,
    chars: CHARS_LIST
}

interface IDanmakuSettings {
    interval:number,
    speed:number,
    size:number
}

export const danmaku_settings:
    {[type:string]:IDanmakuSettings} = 
{
    blue: {
        speed: 80,
        size: 0.8,
        interval: 15,
    },
    green: {
        speed: 65,
        size: 0.9,
        interval: 12
    },
    yellow: {
        speed: 50,
        size: 1,
        interval: 10
    },  
    magenta: {
        speed: 40,
        size: 1.1,
        interval: 8
    },
    red: {
        speed: 30,
        size:1.2,
        interval: 5
    }
}

export interface ISuperchatBullet {
    superchat:ISuperchat,
    x:number,
    y:number
}

export interface SupaQueue extends IDanmakuSettings {
    activeIndex:number,
    loopStart:number,
    superchats:Array<ISuperchatBullet>
}