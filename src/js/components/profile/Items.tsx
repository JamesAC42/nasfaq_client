import React, {Component} from 'react';
import {IItemCatalogue, UserItems, IItem} from '../../interfaces/IItem';
import { ItemImages } from '../ItemImages';

import {connect} from 'react-redux';

import { 
    userinfoActions
} from '../../actions/actions';

const mapStateToProps = (state:any) => ({
    userinfo: state.userinfo
})

const mapDispatchToProps = {
    setColor: userinfoActions.setColor
}

interface ItemsProps {
    useritems:UserItems,
    catalogue:IItemCatalogue,
    userinfo: {
        color: string
    },
    setColor: (color:string) => {},
}

class ItemsState {
    showJebSwatch: boolean;
    constructor() {
        this.showJebSwatch = false;
    }
}

const swatchColors:Array<string> = [
    "red",
    "pink",
    "lime",
    "blue",
    "purple",
    "orange",
    "yellow",
    "green",
    "magenta",
    "gray"
];

class ItemsBind extends Component<ItemsProps> {
    state:ItemsState;
    constructor(props:ItemsProps) {
        super(props);
        this.state = new ItemsState();
    }
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
    handleItemClick(itemType:string) {
        if(itemType !== 'Jeb') return;
        this.setState({showJebSwatch:!this.state.showJebSwatch});
    }
    setColor(color:string) {

        fetch('/api/setUserLeaderboardColor/', {
            method: 'POST',
            body: JSON.stringify({
                color
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.props.setColor(color);
            } else {
                console.log(data);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })

    }

    isActive(color:string) {
        if(color === this.props.userinfo.color) {
            return "active";
        } else {
            return "";
        }
    }
    render() {
        if(this.props.catalogue === undefined) return null;
        let itemsList:Array<IItem> = [];
        Object.keys(this.props.useritems).forEach((itemType:string) => {
            itemsList = [...itemsList, ...this.props.useritems[itemType]]
        })
        return(
        <div className="container-section">
            <div className="section-background"></div>
            <div className="section-content">
                <div className="header">
                    My Items
                </div>
                <div className="items">
                    {
                        itemsList.length === 0 ?
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
                            itemsList.map((item:IItem) => 
                                <tr key={item.itemType}>
                                    <td>
                                        <div className="item-name">
                                            {this.getName(item)}
                                        </div>
                                        <img 
                                            src={ItemImages[item.itemType]} 
                                            alt={item.itemType}
                                            className={`item-image ${item.itemType === 'Jeb' ? 'jeb-img' : ''}`}
                                            title={this.getName(item)}
                                            onClick={() => this.handleItemClick(item.itemType)}/>
                                        {
                                            item.itemType === 'Jeb' && this.state.showJebSwatch ? 
                                            <div className="jeb-swatch">
                                                <div className="jeb-swatch-inner">
                                                    {
                                                        swatchColors.map((color:string) => 
                                                            <div 
                                                                className={`swatch-color ${this.isActive(color)} ${color}`}
                                                                key={color}
                                                                onClick={() => this.setColor(color)}>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </div> : null
                                        }
                                    </td>
                                    <td>{item.quantity}</td>
                                    <td>{this.getDescription(item)}</td>
                                </tr>
                            )
                            }
                            </tbody>
                        </table>
                    }
                </div>
            </div>
        </div>
        )
    }
}

const Items = connect(
    mapStateToProps,
    mapDispatchToProps
)(ItemsBind);

export default Items;