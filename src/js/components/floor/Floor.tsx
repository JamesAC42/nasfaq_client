import React, { Component } from 'react';
import { Socket } from 'socket.io-client';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import {
    roomId,
    FloorSpace,
    Room,
    ChatLog,
    MetaMessage,
    IMessage
} from '../../interfaces/IChat';

import Sidebar from './Sidebar';
import RoomContainer from './RoomContainer';

import '../../../css/floor/floor.scss';
import { 
    floorActions,
    socketActions
} from '../../actions/actions';

interface FloorProps {
    session: {
        loggedin: boolean
    },
    match: {
        params: any
    },
    userinfo: {
        username: string
    },
    floor: {
        floorSpace: FloorSpace | null,
        chatLog: [],
        activeRoom: Room | null
    },
    socket: {
        socket:any,
        query:any
    },
    setFloorSpace: (floorSpace:FloorSpace) => {},
    setChatLog: (chat: ChatLog) => {},
    setLoading: (loading: boolean) => {},
    setActiveRoom: (room: Room) => {},
    setPostCooldown: (post: number) => {},
    setRoomCooldown: (room: number) => {},
    setSocketQuery: (query:{}) => {}
}

const mapStateToProps = (state:any, props:any) => ({
    session: state.session,
    userinfo: state.userinfo,
    floor: state.floor,
    socket: state.socket
});

const mapDispatchToProps = {
    setFloorSpace: floorActions.setFloorSpace,
    setChatLog: floorActions.setChatLog,
    setLoading: floorActions.setLoading,
    setActiveRoom: floorActions.setActiveRoom,
    setPostCooldown: floorActions.setPostCooldown,
    setRoomCooldown: floorActions.setRoomCooldown,
    setSocketQuery: socketActions.setSocketQuery
}

class FloorState {
    collapseRooms: boolean;
    constructor() {
        this.collapseRooms = false;
    }
}

class FloorBind extends Component<FloorProps> {

    state:FloorState;
    constructor(props:FloorProps) {
        super(props);
        this.state = new FloorState();
    }

    toggleRoomsCollapsed() {
        this.setState({
            collapseRooms:!this.state.collapseRooms
        });
    }

    reconnect() {
		let s = this.props.socket.socket;
		if(s !== null) {
            this.listenData(s);

            if(this.props.floor.activeRoom !== null) {
                if(this.props.floor.activeRoom.id !== this.props.socket.query.room) {
                    this.props.setSocketQuery({
                        ...this.props.socket.query,
                        room: this.props.floor.activeRoom.id
                    })
                }
            } else {
                let query = {...this.props.socket.query};
                if(query.room !== undefined) {
                    delete query.room;
                    this.props.setSocketQuery(query);
                }
            }
        }
	}

    filterMessages(chatLog: Array<IMessage>) {
        let newMetaMessages: Array<MetaMessage> = [];

        let myMessages:Array<string> = [];
        chatLog.forEach((message:IMessage) => {
            if(message.username === this.props.userinfo.username) {
                myMessages.push(message.id.toString());
            }
        });

        chatLog.forEach((message:IMessage) => {
            let newMessage: MetaMessage = {
                id: message.id,
                timestamp: message.timestamp,
                username: message.username,
                text: message.text,
                mentions: message.mentions,
                replies: [],
                isMe:false,
                you:false
            }
            if(newMessage.username === this.props.userinfo.username) {
                newMessage.isMe = true;
            }
            message.mentions.forEach((post:string) => {
                if(myMessages.indexOf(post) !== -1) newMessage.you = true;
            })
            chatLog.forEach((messageB:IMessage) => {
                if(messageB.mentions.indexOf(message.id.toString()) !== -1) {
                    newMessage.replies.push(messageB.id.toString());
                }
            })
            newMetaMessages.push(newMessage);
        });

        this.props.setChatLog(newMetaMessages);

    }

    getChat(room:string) {
        this.props.setLoading(true);
        this.props.setChatLog([]);
        fetch(`/api/getChatLog?room=${room}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            this.props.setLoading(false);
            this.filterMessages(data.chatLog);
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    getFloor(): Promise<boolean> {
        return new Promise((resolve:any, reject:any) => {
            fetch('/api/getFloor', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                let floor:FloorSpace = data.floor;
                this.props.setFloorSpace(floor);
                resolve(true);
            })
            .catch(error => {
                console.error('Error: ' +  error);
            })
        })
    }

    listenData(socket:Socket) {
        if(!socket.hasListeners('roomUpdate')) {
            socket.on('roomUpdate', (data:any) => {
                this.filterMessages(data);
            })
        }
        if(!socket.hasListeners('floorUpdate')) {
            socket.on('floorUpdate', (data:string) => {
                this.props.setFloorSpace(JSON.parse(data));
                if(this.props.floor.activeRoom !== null) {
                    this.setActiveRoom(this.props.floor.activeRoom.id);
                }
            })
        }
    }

    setActiveRoom(room:roomId) {
        return new Promise((resolve:any, reject:any) => {
            this.props.floor.floorSpace?.rooms.forEach((r:Room) => {
                if(r.id === room) {
                    this.props.setActiveRoom({...r});
                    resolve(true);
                }
            });
        })
    }

    getCooldowns() {
        fetch('/api/getCooldown', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            let cooldown = data.cooldown;
            this.props.setPostCooldown(cooldown.post);
            this.props.setRoomCooldown(cooldown.room);
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    componentDidMount() {

        this.getCooldowns();
        if(this.props.match.params.room !== undefined) {
            this.getFloor()
            .then(() => {
                this.setActiveRoom(this.props.match.params.room)
                .then(() => {
                    this.getChat(this.props.match.params.room);
                    this.reconnect();
                });
            });
        } else {
            this.getFloor();
            this.reconnect();
        }
    }

    componentWillUnmount() {
		if(this.props.socket.socket !== null) {
            this.props.socket.socket.removeAllListeners("roomUpdate");
            this.props.socket.socket.removeAllListeners("floorUpdate");
        }

        let query = {...this.props.socket.query};
        if(query.room !== undefined) {
            delete query.room;
        }
        this.props.setSocketQuery(query);
    }

    componentDidUpdate(prevProps:FloorProps, prevState:FloorState) {
        if(this.props.match.params.room !== prevProps.match.params.room) {
            if(this.props.match.params.room !== undefined) {
                if(this.props.floor.floorSpace !== null) {
                    let roomid = this.props.match.params.room;
                    this.setActiveRoom(roomid)
                        .then(() => {
                            this.reconnect();
                        });
                    this.getChat(roomid);
                    this.setState({
                        collapseRooms:true
                    });
                }
            }
        }
        if(this.props.floor.floorSpace !== null && prevProps.floor.floorSpace === null) {
            let roomid = this.props.match.params.room;
            this.setActiveRoom(roomid);
        }
        if(this.props.socket.socket !== prevProps.socket.socket) {
            this.reconnect();
        }
    }

    render() {

        if(!this.props.session.loggedin) {
            let r = 'floor';
            if(this.props.match.params.room !== undefined) {
                r += "+" + this.props.match.params.room;
            }
            return(
                <Redirect to={`/login/${r}`} />
            )
        }

        if(this.props.floor.activeRoom !== null
            && this.props.match.params.room === undefined) {
                return(
                    <Redirect to={`/login/${'floor+' + this.props.floor.activeRoom.id}`} />
                )
            }

        return(
            <div className="container floor-outer">
                <div className="container-inner floor-container">
                    <Sidebar 
                        collapsed={this.state.collapseRooms}/>
                    <RoomContainer 
                        toggleCollapsed={() => this.toggleRoomsCollapsed()}/>                    
                </div>
            </div>
        )
    }
}

const Floor = connect(
    mapStateToProps,
    mapDispatchToProps
)(FloorBind);

export default Floor;