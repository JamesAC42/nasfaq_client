import React, {Component} from 'react';
import { Room } from '../../interfaces/IChat';
import {Link} from 'react-router-dom';

interface RoomLinkProps {
    room: Room
}

class RoomLink extends Component<RoomLinkProps> {
    render() {
        const room = this.props.room;
        return(
            <div className="room-item room-item-select">
                <Link to={`/floor/${room.id}`}>
                    <div className="room-info-bar">
                        <div className="room-subject" title={room.subject}>
                            {room.subject}
                        </div>
                        <div className="room-stats" title="Posters/Posts">
                            {room.posters.length}/ 
                            {room.posts}
                        </div>
                    </div>
                    <div className="room-preview">
                        {room.opening}
                    </div>
                </Link>
            </div>
        )
    }
}

export default RoomLink;