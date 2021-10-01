import React, {Component} from 'react';
import {IItemCatalogue, UserItems, IItem} from '../../interfaces/IItem';
import { ItemImages } from '../ItemImages';

import {connect} from 'react-redux';
import { userinfoActions } from '../../actions/actions';
const mapStateToProps = (state:any) => ({
    userinfo: state.userinfo
})
const mapDispatchToProps = {
    setColor: userinfoActions.setColor,
    setHat: userinfoActions.setHat
}

interface IItemProps {
    item:IItem,
    catalogue:IItemCatalogue,
    userinfo:{
        color:string,
        hat:string
    },
    setColor: (c:string) => {},
    setHat: (h:string) => {}
}

class ItemState {
    showItemSetting:boolean;
    constructor() {
        this.showItemSetting = false
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
    "gray",
    "default"
];

class ItemBind extends Component<IItemProps> {
    state:ItemState;
    constructor(props:IItemProps) {
        super(props);
        this.state = new ItemState();
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
    handleItemClick() {
        this.setState({showItemSetting:!this.state.showItemSetting});
    }

    isActive(color:string) {
        if(color === this.props.userinfo.color) {
            return "active";
        } else {
            return "";
        }
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

    setHat() {
        let equipped = this.props.userinfo.hat === this.props.item.itemType;
        const hat = equipped ? "none" : this.props.item.itemType;
        fetch('/api/setUserLeaderboardHat/', {
            method: 'POST',
            body: JSON.stringify({
                hat
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                if(equipped) {
                    this.props.setHat('');
                } else {
                    this.props.setHat(hat);
                }
            } else {
                console.log(data);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    getImageClass() {
        if(
            this.props.item.itemType === "Jeb" ||
            this.props.catalogue[this.props.item.itemType].modifier === "Hat"
        ) {
            let cn = 'item-image item-clickable';
            if(this.props.item.itemType === this.props.userinfo.hat) {
                cn += ' hat-equipped';
            }
            return cn;
        } else {
            return 'item-image';
        }
    }
    render() {
        return(
            <tr key={this.props.item.itemType}>
                <td>
                    <div className={"item-name"}>
                        {this.getName(this.props.item)}
                    </div>
                    <img 
                        src={ItemImages[this.props.item.itemType]} 
                        alt={this.props.item.itemType}
                        className={this.getImageClass()}
                        title={this.getName(this.props.item)}
                        onClick={() => this.handleItemClick()}/>
                    {
                        this.props.item.itemType === this.props.userinfo.hat ?
                        <div className="hat-equipped"></div> : null
                    }
                    {
                        this.props.item.itemType === 'Jeb' && this.state.showItemSetting ? 
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
                    {
                        this.props.catalogue[this.props.item.itemType].modifier === "Hat"
                        && this.state.showItemSetting ?
                        <div className="hat-toggle flex center-child">
                            <div 
                                className="hat-toggle-inner"
                                onClick={() => this.setHat()}>
                                { 
                                    this.props.item.itemType === this.props.userinfo.hat ? 
                                    "Unequip" : "Equip"
                                }
                            </div>
                        </div> : null
                    }
                </td>
                <td>{this.props.item.quantity}</td>
                <td>{this.getDescription(this.props.item)}</td>
            </tr>
        )
    }
}

const Item = connect(
    mapStateToProps,
    mapDispatchToProps,
)(ItemBind)

export default Item;