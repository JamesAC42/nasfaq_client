import React, {Component} from 'react';

import {endpoints} from './endpoints';

import "../../../css/docs.scss";

class DocsState {
    activePage:string;
    constructor() {
        this.activePage = endpoints[0].name;
    }
}

class Docs extends Component {
    state:DocsState;
    constructor(props:any){
        super(props);
        this.state = new DocsState();
    }
    setActivePage(name:string) {
        this.setState({activePage:name});
    }
    getActiveEndpoint() {
        for(let i = 0; i < endpoints.length; i++) {
            if(endpoints[i].name === this.state.activePage) {
                return endpoints[i];
            }
        }
    }
    render() {
        let endpointInfo:any = this.getActiveEndpoint();
        return(
            <div className="container fill">
                <div className="container-inner flex-col flex-stretch">
                    <div className="admin-header">
                        API Documentation
                    </div>
                    <div className="admin-space flex-row">
                        <div className="admin-panel-select">

                            <div className="tabbed-view-select">
                                {
                                    endpoints.map((endpoint:any) => 
                                        <div 
                                            className={`view-item ${endpoint.name === this.state.activePage ? "view-item-active":""}`}
                                            onClick={() => this.setActivePage(endpoint.name)}>
                                                {endpoint.name}
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <div className="docs-panel flex flex-col flex-stretch">
                            <div className="endpoint-name">
                                {endpointInfo.name}
                            </div>
                            <div className="endpoint-description">
                                {endpointInfo.description}
                            </div>
                            <div className="endpoint-url">
                                <span className="title">
                                    URL: 
                                </span>{" " + endpointInfo.url}
                            </div>
                            <div className="endpoint-type">
                                <span className="title">
                                    Type:
                                </span>{" " + endpointInfo.type}
                            </div>
                            <div className="endpoint-parameters">
                                <span className="title">
                                    Parameters:
                                </span>{" " + endpointInfo.parameters}
                            </div>
                            <div className="endpoint-response">
                                <span className="title">
                                    Response:
                                </span>{" " + endpointInfo.response}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Docs;