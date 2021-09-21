import React, {Component} from 'react';

class ClearSessionsState {
    result:string;
    constructor() {
        this.result = "";
    }
}

class ClearSessions extends Component {
    state:ClearSessionsState;
    constructor(props:any) {
        super(props);
        this.state = new ClearSessionsState();
    }
    clearSessions() {
        fetch('/api/clearSessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.setState({result: "Sessions cleared."});
            } else {
                console.log(data);
                this.setState({result: "Error clearing sessions."});
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    render() {
        return(
            
            <div className="download-pane flex-col flex-center">
                <div className="control-header">
                    Clear
                </div>
                <div className="control-description">
                    Clear all user session, requiring re-login.
                </div>
                <a onClick={() => this.clearSessions()}>Clear</a>
                <p>{this.state.result !== "" ? this.state.result : ""}</p>
            </div>
        )
    }
}

export default ClearSessions;