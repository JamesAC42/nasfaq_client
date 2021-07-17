import React, {Component} from 'react';

import  {
    HiOutlineTrash
} from 'react-icons/hi';
import {
    ImCheckmark
} from 'react-icons/im';

interface Report {
    id:string,
    madeBy:string,
    timestamp:number,
    message: {
        roomId: string,
        id: string,
        timestamp: number,
        username: string,
        text: string
    }
}

interface ReportProps {
    report:Report,
    index:number,
    removeReport:(index:number) => void
}

class ReportState {
    deleteResults:string;
    constructor() {
        this.deleteResults = '';
    }
}

class Report extends Component<ReportProps> {
    state:ReportState;
    constructor(props:ReportProps) {
        super(props);
        this.state = new ReportState();
    }
    deleteReport(reportId:string) {
        fetch('/api/deleteReport', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reportId
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.props.removeReport(this.props.index);
            } else {
                console.log(data);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }
    deleteMessage(roomid:string, messageid:string, username:string) {
        fetch('/api/deleteMessage/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomid,
                messageid,
                username
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.setState({
                    deleteResults: "Message deleted"
                });
            } else {
                this.setState({
                    deleteResults:data.message
                })
            }
            setTimeout(() => {
                this.setState({
                    deleteResults: ""
                })
            }, 3000);
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }
    render() {
        const report = this.props.report;
        return(
            <div className="report-item">
                <div className="report-made-by">
                    <span className="report-label">Report by: </span>
                    {report.madeBy}
                </div>
                <div className="report-timestamp">
                    <span className="report-label">Made on: </span>
                    {new Date(report.timestamp).toString()}
                </div>
                <div className="report-message-author">
                    <span className="report-label">Message author: </span>
                    {report.message.username}
                </div>
                <div className="report-message-id">
                    <span className="report-label">Message #: </span>
                    {report.message.id}
                </div>
                <div className="report-message-timestamp">
                    <span className="report-label">Message timestamp: </span>
                    {new Date(report.message.timestamp).toString()}
                </div>
                <div className="report-message-link">
                    <span className="report-label">Room link: </span>
                    <a href={`/floor/${report.message.roomId}#${report.message.id}`}>View</a>
                </div>
                <div 
                    className="report-message-text"
                    dangerouslySetInnerHTML={{__html: report.message.text}}>
                </div>
                <div className="report-actions flex-row flex-center">
                    <div 
                        className="delete-report"
                        onClick={() => this.deleteReport(report.id)}
                        title="Delete Report">
                        <ImCheckmark style={{verticalAlign:'middle'}}/>
                    </div>
                    <div 
                        onClick={() => this.deleteMessage(
                            report.message.roomId, 
                            report.message.id, 
                            report.message.username)}
                        className="delete-reported-message"
                        title="Delete Message">
                        <HiOutlineTrash style={{verticalAlign:'middle'}}/>
                    </div>
                </div>
                {
                    this.state.deleteResults !== '' ?
                    <div className="report-delete-message-results">
                        {this.state.deleteResults}
                    </div> : null
                }
            </div>
        )
    }
}

export default Report;
