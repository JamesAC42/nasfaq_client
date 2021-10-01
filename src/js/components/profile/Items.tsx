import React, {Component} from 'react';
import {IItemCatalogue, UserItems, IItem} from '../../interfaces/IItem';
import Item from './Item';

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

class ItemsBind extends Component<ItemsProps> {
    state:ItemsState;
    constructor(props:ItemsProps) {
        super(props);
        this.state = new ItemsState();
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
                                <Item item={item} catalogue={this.props.catalogue}/>
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