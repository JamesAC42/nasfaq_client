import React, {Component} from 'react';
import '../../css/announcement.scss';

import {
    IoMdCloseCircle
} from 'react-icons/io';

class AnnouncementState {
    announcement:string;
    datestring:string;
    visible:boolean;
    constructor() {
        this.announcement = '';
        this.datestring = ''
        this.visible = false;
    }
}
class Announcement extends Component {
    state:AnnouncementState;
    
    constructor(props:any) {
        super(props);
        this.state = new AnnouncementState();
    }

    close() {
        this.setState({
            visible:false
        })
    }

    componentDidMount() {
        fetch('/api/getAnnouncement', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                if(data.announcement.message === "") {
                    return;
                } else {
                    this.setState({
                        announcement: data.announcement.message,
                        datestring: data.announcement.date,
                        visible:true
                    })
                }
            } else {
                this.setState({
                    visible:false
                })
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }
    render() {
        if(!this.state.visible) return null;
        return(
            <div className="announcement-panel">
                <div className="announcement-info">
                    <div className="announcement-header">
                        Announcement:
                    </div>
                    <div className="announcement-date">
                        Date: {this.state.datestring}
                    </div>
                    <div className="announcement-message">
                        {this.state.announcement}
                    </div>
                </div>
                <div 
                    className="announcement-close"
                    onClick={() => this.close()}>
                    <IoMdCloseCircle style={{verticalAlign:'middle'}}/>
                </div>
            </div>
        )
    }
}

export default Announcement;