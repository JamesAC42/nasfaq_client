import React, {Component} from 'react';
class DownloadPane extends Component {
    render() {
        return(
            <div className="download-pane flex-col flex-center">
                <div className="control-header">
                    Download
                </div>
                <div className="control-description">
                    Download the current data file. Only accessible to administrators. 
                </div>
                <a href="/api/getDataFile" target="__blank">Download</a>
                <p>
                    Note: This reads the file directly from the server, do it sparingly.
                </p>
            </div>
        )
    }
}

export default DownloadPane;