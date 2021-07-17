export interface IItem {
    itemType:string,
    aquiredTimestamp:number,
    lastPurchasePrice:number,
    quantity:number
}

export interface IItemType {
    name:string,
    description:string,
    modifier:string,
    modifierMult:number
}

export interface IItemCatalogue {
    [item:string]: IItemType
}

export type UserItems = Array<IItem>;