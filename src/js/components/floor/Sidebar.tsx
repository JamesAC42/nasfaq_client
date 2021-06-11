import React, { Component } from 'react';

import { connect } from 'react-redux';

import {
    FloorSpace,
    Room
} from '../../interfaces/IChat';

import RoomLink from './RoomLink';
import {
    BiRefresh
} from 'react-icons/bi';

import '../../../css/floor/sidebar.scss';
import { floorActions } from '../../actions/actions';

const mapStateToProps = (state:any, props:any) => ({
    floor: state.floor
});

const mapDispatchToProps = {
    setRoomCooldown: floorActions.setRoomCooldown
}

interface SidebarProps {
    floor: {
        floorSpace: FloorSpace | null,
        activeRoom: Room | null,
        cooldown: {
            room:number
        }
    },
    collapsed:boolean,
    setRoomCooldown: (room:number) => void
}

class SidebarState {
    newRoomSubject:string;
    newRoomOpening:string;
    searchInput:string;
    activeFloorSpace: Array<Room> | null;
    toggleSpin: boolean;
    error:string;
    now:number;
    constructor() {
        this.newRoomOpening = "";
        this.newRoomSubject = "";
        this.searchInput = "";
        this.activeFloorSpace = null;
        this.toggleSpin = false;
        this.error = "";
        this.now = new Date().getTime();
    }
}

type inputEvent = React.ChangeEvent<HTMLInputElement>;
type formEvent = React.ChangeEvent<HTMLTextAreaElement>;

class SidebarBind extends Component<SidebarProps> {

    state:SidebarState;
    intervalId:any;
    constructor(props:SidebarProps) {
        super(props);
        this.state = new SidebarState();
    }

    componentDidMount() {
        this.intervalId = setInterval(() => {
            this.setState({
                now: new Date().getTime()
            })
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    componentDidUpdate(prevProps: SidebarProps, prevState: SidebarState) {
        if(prevState.activeFloorSpace === null 
            && this.props.floor.floorSpace !== null) {
            this.setState({activeFloorSpace: [...this.props.floor.floorSpace.rooms]})
        }
    }

    createRoom() {
        if(this.state.newRoomSubject === '') {
            return;
        }
        if(this.state.newRoomOpening === '') {
            return;
        }
        fetch('/api/addRoom/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject: this.state.newRoomSubject,
                openingText: this.state.newRoomOpening
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.setState({
                    newRoomSubject:'',
                    newRoomOpening:'',
                    error:'',
                });
                this.props.setRoomCooldown(new Date().getTime());
                setTimeout(() => {
                    this.refreshRooms();
                }, 300);
            } else {
                this.setState({
                    error:data.prompt
                })
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    handleRefreshClick() {
        this.spin();
        this.refreshRooms();
    }

    refreshRooms() {

        if(this.props.floor.floorSpace !== null) {
            let rooms = [...this.props.floor.floorSpace.rooms];
            if(this.state.searchInput !== "") {
                rooms = this.filterRooms(rooms);
            }
            this.setState({activeFloorSpace: rooms});
        }
    }

    filterRooms(filterRooms:Array<Room>) {
        let filteredRooms:Array<Room> = [];
        filterRooms.forEach((room:Room) => {
            if(room.subject.indexOf(this.state.searchInput) !== -1
            || room.opening.indexOf(this.state.searchInput) !== -1) {
                filteredRooms.push(room);
            }
        });
        return filteredRooms;
    }

    updateSearch(a:inputEvent) {
        this.setState({
            searchInput: a.target.value
        }, () => {
            this.refreshRooms();
        });
    }

    handleText(a:formEvent | inputEvent) {
        this.setState({
            [a.target.name]:a.target.value
        });
    }

    spin() {
        this.setState({
            toggleSpin:true
        }, () => {
            setTimeout(() => {
                this.setState({
                    toggleSpin:false
                });
            }, 300)
        })
    }

    cooldownTimer() {
        let cooldown = this.props.floor.cooldown.room;
        let now = this.state.now;

        let elapsed = (now - cooldown) / 1000;

        if(elapsed >= (60 * 5) || elapsed < 0) {
            return null;
        } else {
            return(
                <span className="cooldown-timer">
                    {300 - Math.round(elapsed)}
                </span>
            )
        }
    }

    noActiveRooms() {
        if(this.state.activeFloorSpace === null) {
            return null;
        } else {
            if(this.state.activeFloorSpace.length === 0) {
                return(
                    <div className="no-rooms">
                        <div>NO ROOMS</div>
                    </div>
                )
            }
        }
    }

    render() {
        let spinClass = `room-list-refresh ${this.state.toggleSpin ? "spin" : ""}`;
        let roomSelectClass = "room-select";
        if(!this.props.collapsed) roomSelectClass += " room-select-visible";
        return (
            <div className={roomSelectClass}>
                <div className="room-list-header">
                    <div className="new-room-outer">
                        <input 
                            name="newRoomSubject"
                            value={this.state.newRoomSubject}
                            placeholder="Subject"
                            maxLength={200}
                            onChange={(
                                ev: inputEvent
                            ): void => this.handleText(ev)}/>
                        <textarea 
                            name="newRoomOpening"
                            value={this.state.newRoomOpening}
                            placeholder="Opening"
                            maxLength={2000}
                            onChange={(
                                ev: formEvent
                            ): void => this.handleText(ev)}>
                        </textarea>
                        <div 
                            className="submit-message-button"
                            onClick={() => this.createRoom()}>
                            Create Room
                            {this.cooldownTimer()}
                        </div>
                        {
                            this.state.error !== "" ?
                            <div className="error-msg">
                                {this.state.error}
                            </div> : null
                        }
                    </div>
                    <div className="room-list-filter">
                        <div 
                            className={spinClass}
                            onClick={() => this.handleRefreshClick()}>
                            <BiRefresh />
                        </div>
                        <input
                            name="searchInput"
                            value={this.state.searchInput}
                            placeholder="Search..."
                            maxLength={500}
                            onChange={(
                                ev: inputEvent
                            ): void => this.updateSearch(ev)}
                            type="text"/>
                    </div>
                </div>
                <div className="room-list-contents">
                    {
                        this.state.activeFloorSpace !== null ?
                        this.state.activeFloorSpace.map((room:Room) =>
                            <RoomLink key={room.id} room={room} />
                        ) : null
                    }
                    {
                        this.noActiveRooms()
                    }
                </div>
            </div>
        )
    }
}

const Sidebar = connect(
    mapStateToProps,
    mapDispatchToProps
)(SidebarBind);

export default Sidebar;