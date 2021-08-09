export interface IItem {
    itemType:string,
    acquiredTimestamp:number,
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

export type UserItems = {[type:string]:Array<IItem>}