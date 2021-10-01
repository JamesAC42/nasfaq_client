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
import Gacha from './components/gacha/Gacha';
import Docs from './components/docs/Docs';

import SessionHandler from './components/SessionHandler';
import SocketHandler from './components/SocketHandler';

import fetchData from './fetchData';

import { parseCoinHistory } from './parsers';
import checkStorage from './checkStorage';

import {lineage} from './components/Icons';

import { connect } from 'react-redux';

import { 
  settingsActions, 
  statsActions, 
  itemcatalogueActions,
  multicoinSaveActions
} from './actions/actions';

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
  setMarketSwitch: settingsActions.setMarketSwitch,
  setItemCatalogue: itemcatalogueActions.setCatalogue,
  setBrokerTotal: statsActions.setBrokerTotal,
  setMulticoinSave: multicoinSaveActions.setMulticoinSave,
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
  setMarketSwitch: (open:boolean) => {},
  setItemCatalogue: (catalogue:any) => {},
  setBrokerTotal: (brokerTotal:any) => {},
  setMulticoinSave: (multicoinSave:any) => {}
}

const adjustmentTime = {
  HOUR:9,
  MINUTE:5
}

class AppBind extends Component<AppProps> {

  componentDidMount() {
    fetchData('/api/getLeaderboard?leaderboard&oshiboard')
    .then((data:any) => {
      this.props.setLeaderboard(data.leaderboard.leaderboard);
      this.props.setOshiboard(data.oshiboard);
    });
    fetchData('/api/getItemCatalogue')
    .then((data:any) => {
      if(data.success) {
        this.props.setItemCatalogue(data.catalogue);
      }
    });

    fetchData('/api/getMarketInfo?all&history&brokerFeeTotal')
    .then((data:any) => {
      this.props.setCoinInfo(data.coinInfo);
      this.props.setMarketSwitch(data.marketSwitch);
      this.props.setBrokerTotal(data.brokerFeeTotal);
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
        fetchData('/api/getStats')
        .then((data:any) => {
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
      }
    });

    if(checkStorage()) {
      
      let multicoinSave = localStorage.getItem("nasfaq:multicoinSave");
      if(multicoinSave !== null) {
        let multicoinSaveData = JSON.parse(multicoinSave);
        let updated = false;
        lineage.forEach((gen:Array<string>) => {
          gen.forEach((coin:string) => {
            if(multicoinSaveData[coin] === undefined) {
              multicoinSaveData[coin] = {buy:1, sell:1};
              updated = true;
            }
          })
        })
        this.props.setMulticoinSave(multicoinSaveData);
        if(updated) {
          localStorage.setItem("nasfaq:multicoinSave", JSON.stringify(multicoinSaveData))
        }
      } else {
        let newMulticoin:{[coin:string]:any} = {};
        lineage.forEach((gen:Array<string>) => {
          gen.forEach((coin:string) => {
            newMulticoin[coin] = {buy:1, sell:1}
          })
        });
        this.props.setMulticoinSave(newMulticoin);
        localStorage.setItem("nasfaq:multicoinSave", JSON.stringify(newMulticoin));
      }
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
            path="/gacha"
            component={Gacha}/>

          <Route
            exact
            path="/docs"
            component={Docs}>
          </Route>

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
