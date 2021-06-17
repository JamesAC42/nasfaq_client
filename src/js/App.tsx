import React, { Component } from 'react';

import '../css/master.scss';

import Home from './components/Home';
import Profile from './components/profile/Profile';
import Market from './components/Market';
import Leaderboard from './components/Leaderboard';
import Login from './components/Login';
import Logout from './components/Logout';
import Navbar from './components/Navbar';
import PageNotFound from './components/PageNotFound';
import TransactionUpdater from './components/TransactionUpdater';
import Activity from './components/activity/Activity';
import VerifyAccount from './components/VerifyAccount';
import Floor from './components/floor/Floor';
import Admin from './components/admin/Admin';
import Announcement from './components/Announcement';
import ResetPassword from './components/ResetPassword';
import Superchats from './components/superchats/Superchats';
import SuperchatDanmaku from './components/superchats/SuperchatDanmaku';
import AutoTrader from './components/autotrader/AutoTrader';

import SessionHandler from './components/SessionHandler';
import SocketHandler from './components/SocketHandler';

import { parseCoinHistory } from './parsers';
import checkStorage from './checkStorage';

import { connect } from 'react-redux';

import { settingsActions, statsActions } from './actions/actions';

import {
  Switch,
  Route
} from 'react-router-dom';
import Info from './components/Info';
import LoginAdmin from './components/LoginAdmin';

const mapStateToProps = (state:any, props:any) => ({
  settings: state.settings
});

const mapDispatchToProps = {
  setStats: statsActions.setStats,
  setHistory: statsActions.setHistory,
  setCoinInfo: statsActions.setCoinInfo,
  setLeaderboard: statsActions.setLeaderboard,
  setOshiboard: statsActions.setOshiboard,
  setMarketSwitch: settingsActions.setMarketSwitch
}

interface AppProps {
  settings: {
    darkMode: boolean
  },
  setStats: (stats:{}) => {},
  setHistory: (coinHistory:{}) => {},
  setCoinInfo: (coinInfo: {}) => {},
  setLeaderboard: (leaderboard:{}) => {},
  setOshiboard: (oshiboard:{}) => {},
  setMarketSwitch: (open:boolean) => {}
}

const adjustmentTime = {
  HOUR:9,
  MINUTE:5
}

class AppBind extends Component<AppProps> {

  componentDidMount() {
    fetch('/api/getMarketInfo', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        this.props.setCoinInfo(data.coinInfo);
        this.props.setMarketSwitch(data.marketSwitch);
    })
    .catch(error => {
        console.error('Error: ' +  error);
    })
    fetch('/api/getLeaderboard', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        this.props.setLeaderboard(data.leaderboard.leaderboard);
        this.props.setOshiboard(data.oshiboard);
    })
    .catch(error => {
        console.error('Error: ' +  error);
    })

    let shouldRequest = false;
    if(checkStorage()) {
      let cachedStatsStore = localStorage.getItem("nasfaq:stats");
      if(cachedStatsStore !== null) {
        let cachedStats = JSON.parse(cachedStatsStore);

        const minToMil = 60 * 1000;
        const hoursMilli = adjustmentTime.HOUR * 60 * minToMil;
        const minMilli = adjustmentTime.MINUTE * minToMil;
        const jumpBack = hoursMilli + minMilli;

        let statsTimestamp = cachedStats.timestamp - jumpBack;
        const storedTimeString = new Date(statsTimestamp).toLocaleString("en-US", {
          timeZone: "America/New_York"
        });
        const storedDay = new Date(storedTimeString).getDay();

        const nowTimestamp = new Date().getTime() - jumpBack;
        const nowTimeString = new Date(nowTimestamp).toLocaleString("en-US", {
          timeZone: "America/New_York"
        });
        const nowDay = new Date(nowTimeString).getDay();

        if(nowDay !== storedDay) {
          shouldRequest = true;
        } else {
          this.props.setStats(cachedStats.stats);
          this.props.setHistory(cachedStats.history);
        }
      } else {
        shouldRequest = true;
      }
    } else {
      shouldRequest = true;
    }
    
    if(shouldRequest) {
      fetch('/api/getStats', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
          this.props.setStats(data.stats);
          let coinHistory = parseCoinHistory(JSON.parse(data.coinHistory));
          this.props.setHistory(coinHistory);
          
          if(checkStorage()) {
            localStorage.setItem("nasfaq:stats", JSON.stringify({
              timestamp:new Date().getTime(),
              stats:data.stats,
              history:coinHistory
            }))
          }
      })
      .catch(error => {
          console.error('Error: ' +  error);
      })
    }
  }
  

  render() {

    return(
      <div className={
        this.props.settings.darkMode ?
        "dark" : ""
      }>

        <SessionHandler />
        <SocketHandler />

        <Navbar />

        <TransactionUpdater />
        <SuperchatDanmaku />

        <AutoTrader />

        <Announcement />

        <Switch>

          <Route 
            exact 
            path="/" 
            component={Home}/>

          <Route
            exact
            path="/info"
            component={Info}/>

          <Route 
            exact
            path="/profile"
            component={Profile}/>
          
          <Route 
            exact
            path="/market"
            component={Market}/>

          <Route
            exact
            path="/floor/:room?"
            component={Floor}/>
          
          <Route
            exact
            path="/activity"
            component={Activity}/>

          <Route 
            exact
            path="/leaderboard"
            component={Leaderboard}/>
          
          <Route 
            exact
            path="/login/:from?"
            component={Login}/>

          <Route
            exact
            path="/loginAdmin"
            component={LoginAdmin}/>
          
          <Route 
            exact
            path="/logout"
            component={Logout}/>

          <Route
            exact
            path="/admin"
            component={Admin}/>
          
          <Route
            exact
            path="/resetPassword"
            component={ResetPassword}/>

          <Route
            exact
            path="/superchats"
            component={Superchats}/>

          <Route
            exact
            path="/verifyAccount/:userid/:key"
            component={VerifyAccount}/>

          <Route component={PageNotFound}/>

        </Switch>

      </div>
    )
  }
}

const App = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppBind);

export default App;
