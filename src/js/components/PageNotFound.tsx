import React, { Component } from 'react';
import '../../css/pagenotfound.scss';

class PageNotFound extends Component {
    render() {
        return(
            <div className="container center-child">
                <div className="notfound-message">
                The page you are looking for does not exist!
                </div>
            </div>
        )
    }
}

export default PageNotFound;