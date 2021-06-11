import React, {Component} from 'react';

import {
    BiRadioCircleMarked,
    BiRadioCircle
} from 'react-icons/bi';

interface StatRowItemProps {
    toggleActive: () => void,
    activeStat: string,
    label: string,
    name: string,
    value: string
}

class StatRowItem extends Component<StatRowItemProps> {
    render() {
        const active = this.props.activeStat === this.props.name ?
            "active" : "";
        const dir = parseInt(this.props.value) < 0 ? "decrease" : "increase";
        return(
            <div 
                className="stat-row"
                onClick={() => this.props.toggleActive()}>
                <div className="stat-label"><span>{this.props.label}</span></div>
                <div className={`stat-data ${dir}`}><span>
                    { this.props.value }
                </span></div>
                <div className="toggle-stat center-child">
                        {
                            active ?
                            <BiRadioCircleMarked /> : <BiRadioCircle />
                        }
                </div>
            </div>
        )
    }
}

export default StatRowItem;