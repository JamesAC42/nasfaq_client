import React, {Component} from 'react';
import {IItemCatalogue, UserItems, IItem} from '../../interfaces/IItem';
import { ItemImages } from '../ItemImages';

interface ItemsProps {
    useritems:UserItems,
    catalogue:IItemCatalogue
}

class Items extends Component<ItemsProps> {
    getDescription(item:IItem) {
        if(this.props.catalogue[item.itemType] === undefined) {
            return '';
        } else {
            return this.props.catalogue[item.itemType].description;
        }   
    }
    getName(item:IItem) {
        if(this.props.catalogue[item.itemType] === undefined) {
            return '';
        } else {
            return this.props.catalogue[item.itemType].name;
        }   
    }
    render() {
        if(this.props.catalogue === undefined) return null;
        return(
        <div className="container-section">
            <div className="section-background"></div>
            <div className="section-content">
                <div className="header">
                    My Items
                </div>
                <div className="items">
                    {
                        this.props.useritems.length === 0 ?
                        <div className="no-items">
                            You don't own any items!
                        </div>
                        :
                        <table>
                            <thead>
                                <tr>
                                    <td>Item</td>
                                    <td>Quantity</td>
                                    <td>Description</td>
                                </tr>
                            </thead>
                            <tbody>
                            {
                            this.props.useritems.map((item:IItem) => 
                                <tr key={item.itemType}>
                                    <td>
                                        <div className="item-name">
                                            {this.getName(item)}
                                        </div>
                                        <img 
                                            src={ItemImages[item.itemType]} 
                                            alt={item.itemType}
                                            className="item-image"
                                            title={this.getName(item)}/>
                                    </td>
                                    <td>{item.quantity}</td>
                                    <td>{this.getDescription(item)}</td>
                                </tr>
                            )
                            }
                            </tbody>
                        </table>
                    }
                    <div className="items-blurb">
                        This is a preview of an upcoming item system, where players will be able to auction, bid, and trade a limited number of unique items between themselves.
                    </div>
                </div>
            </div>
        </div>
        )
    }
}

export default Items;