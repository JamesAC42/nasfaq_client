import React, {Component} from 'react';
import '../../../css/themes/snowfallsettings.scss';
import {
    snowfallActions
} from '../../actions/actions';
import {connect} from 'react-redux';


const mapDispatchToProps = {
    setShowSnowNotification: snowfallActions.setShowSnowNotification
}

interface SnowfallNotificationsProps {
    setShowSnowNotification: (show:boolean) => {}
}

class SnowfallNotificationBind extends Component<SnowfallNotificationsProps> {

    componentDidMount() {
        setTimeout(() => {
            this.props.setShowSnowNotification(false)
        }, 8000);
    }

    render() {
        return(
            <div 
                className="snowfall-notification">
                Right click the stocking to adjust the snow.
            </div>
        )
    }
}

const SnowfallNotification = connect(null, mapDispatchToProps)(SnowfallNotificationBind);
export default SnowfallNotification;