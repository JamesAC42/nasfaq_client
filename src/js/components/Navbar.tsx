import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import '../../css/navbar.scss';

import numberWithCommas from '../numberWithCommas';
import {IWallet} from '../interfaces/IWallet';

import storageAvailable from '../checkStorage';

import sun from '../../images/sun-black.png';
import moon from '../../images/moon-white.png';

import {withRouter} from 'react-router-dom';

import {
    settingsActions
} from '../actions/actions';

import {
    HiMenu
} from 'react-icons/hi';
import {
    BsCaretDownFill
} from 'react-icons/bs';

const mapStateToProps = (state:any, props:any) => ({
    settings: state.settings,
    session: state.session,
    userinfo: state.userinfo
});

const mapDispatchToProps = {
    toggleDarkmode: settingsActions.toggleDarkmode
}

interface NavbarProps {
    settings: {
        darkMode: boolean,
        marketSwitch: boolean
    },
    session: {
        loggedin: boolean
    },
    location: {
        pathname:string
    },
    userinfo: {
        username:string,
        email:string,
        wallet:IWallet,
        loaded:boolean,
        admin:boolean
    },
    toggleDarkmode: (enabled: boolean) => {}
}

class NavbarState {
    dateTime: string;
    collapsed: boolean;
    showStore: boolean;
    constructor() {
        this.dateTime = "";
        this.collapsed = true;
        this.showStore = false;
    }
}

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatNumber(n: number) {
    return n < 10 ? `0${n}` : n.toString();
}

class NavbarBind extends Component<NavbarProps> {

    state:NavbarState;

    constructor(props:NavbarProps) {
        super(props);
        this.state = new NavbarState();
    }
    toggleCollapsed() {
        this.setState({
            collapsed:!this.state.collapsed
        });
    }
    toggleShowStore() {
        this.setState({
            showStore:!this.state.showStore
        })
    }
    componentDidMount() {
        if(storageAvailable()) {
            if(localStorage['darkMode'] === undefined) return;
            const dark:boolean = JSON.parse(localStorage['darkMode']);
            if(dark) {
                this.props.toggleDarkmode(dark);
            }
        }
        setInterval(() => {
            const etTimeString = new Date().toLocaleString("en-US", {
                timeZone: "America/New_York"
            });
            const date = new Date(etTimeString);
            const day = days[date.getDay()];
            const month = months[date.getMonth()];
            const daynumber = date.getDate();
            const year = date.getFullYear();
            const hour = formatNumber(date.getHours());
            const minute = formatNumber(date.getMinutes());
            const seconds = formatNumber(date.getSeconds());
            const dayString = `${hour}:${minute}:${seconds} on ${day} ${month} ${daynumber}, ${year} [America/New York]`
            this.setState({
                dateTime: dayString
            })
        }, 1000);
    }
    componentDidUpdate(prevProps:NavbarProps) {
        if(prevProps.location.pathname !== this.props.location.pathname) {
            this.setState({collapsed:true});
        }
    }
    handleClick = () => {
        if(storageAvailable()) {
            localStorage['darkMode'] = JSON.stringify(!this.props.settings.darkMode);
        }
        this.props.toggleDarkmode(!this.props.settings.darkMode);
    }
    render() {
        let balance:String = '';
        if(!this.props.userinfo.loaded) {
            balance = '';
        } else {

            if(this.props.userinfo.wallet.balance < 0) {
                balance += "-";
            }
            
            balance += "$" + numberWithCommas(
                Math.round(Math.abs(this.props.userinfo.wallet.balance * 100)) / 100);

        }
        let pathname = this.props.location.pathname;
        let navbarClass = "navbar";
        if(pathname !== undefined) {
            if(pathname.indexOf("floor") === -1) {
                navbarClass = "navbar navbar-shadow"
            }
        }

        return(
            <div className={navbarClass}>
                <div 
                    className="nav-item navbar-collapse"
                    onClick={() => this.toggleCollapsed()}>
                    <HiMenu style={{verticalAlign: "middle"}} />
                </div>
                <div className="nav-item nav-title">
                    <Link to="/">nasfaq</Link>
                </div>
                <div className="nav-item datetime">
                    <div>{this.state.dateTime}
                    </div>
                </div>
                {
                    this.props.userinfo.loaded ? 
                    <div 
                        className="nav-item"
                        title={this.props.userinfo.username}>
                        <span className="username-nav">{this.props.userinfo.username}</span>
                    </div> : null
                }
                {
                    this.props.session.loggedin ?
                    <div className="nav-item balance-tag">
                        <div>
                            <span
                                title="Current Balance" 
                                className={`${this.props.userinfo.wallet.balance < 0 ?
                                "amt-negative" : "amt-positive"}`}>
                                {balance} 
                            </span>
                        </div>
                    </div> : null
                }
                <div className={`nav-pages ${this.state.collapsed ? '' : 'visible'}`}>
                    <div className="nav-item">
                        <Link to="/market">Market</Link>
                    </div>
                    <div className="nav-item">
                        <Link to="/activity">Activity</Link>
                    </div>
                    {
                        this.props.session.loggedin ?
                        <div className="nav-item">
                            <Link to="/floor">Floor</Link>
                        </div> : null
                    }
                    <div className="nav-item">
                        <Link to="/info">Info</Link>
                    </div>
                    <div className="nav-item">
                        <Link to="/leaderboard">Leaderboard</Link>
                    </div>
                    <div className="nav-item">
                        <Link to="/superchats">Supers</Link>
                    </div>
                    {
                        this.props.session.loggedin ?
                        <div className="nav-item">
                            <Link to="/profile">Profile</Link>
                        </div> : null
                    }
                    {
                        this.props.userinfo.admin ?
                        <div className="nav-item admin-nav-item">
                            <Link to="/admin">Admin</Link>
                        </div> : null
                    }
                    {
                        this.props.session.loggedin ?
                        <div className="nav-item">
                            <Link to="/logout">Logout</Link>
                        </div> : null
                    }
                    {
                        !this.props.session.loggedin?
                        <div className="nav-item">
                            <Link to="/login">Login</Link>
                        </div> : null
                    }
                    <div className="nav-item nav-item-toggle-dark">
                        <img 
                        src={
                            this.props.settings.darkMode ?
                                moon : sun
                        } 
                        alt={"darkmode-img"} 
                        className="darkmode-img" 
                        onClick={(
                            ev: React.MouseEvent,
                        ): void => {this.handleClick()}}/>
                    </div>
                </div>
                {
                    !this.props.settings.marketSwitch ?
                    <div className="market-closed-banner flex flex-row flex-center">
                        MARKET CLOSED
                    </div> : null
                }
            </div>
        )
    }
}

const Navbar = connect(
    mapStateToProps,
    mapDispatchToProps
)(NavbarBind);
  
export default withRouter(Navbar);