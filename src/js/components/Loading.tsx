import React, {Component} from 'react';
import '../../css/loading.scss';

export class Loading extends Component {
    render(){
        return(
            <div className="loading-outer">
                <div className="loading">
                    <div className="loading-inner">
                        <div className="loading-ball"></div>
                        <div className="loading-ball"></div>
                        <div className="loading-ball"></div>
                        <div className="loading-ball"></div>
                    </div>
                </div>
            </div>
        )
    }
}