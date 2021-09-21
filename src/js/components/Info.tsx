import React, { Component } from 'react';
import '../../css/info.scss';
import '../../css/tabbedpage.scss';

import VisibilitySensor from 'react-visibility-sensor';

import {Link} from 'react-router-dom';

import okayu from '../../images/okayuquestion.png';

enum InfoSections {
    About,
    HowTo,
    IPO,
    UI,
    Docs,
    Goal,
    Disclaimer,
    ArtCredits,
    Support,
    News
}

class InfoState {
    news:any;
    activeSection:InfoSections;
    constructor() {
        this.activeSection = InfoSections.About;
        this.news = []
    }
}

class Info extends Component {
    state:InfoState;

    constructor(props:any) {
        super(props);
        this.state = new InfoState();
    }

    componentDidMount() {
        fetch('/api/getNews', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'withCredentials':'true'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                if(data.news !== undefined) {
                    this.setState({news:data.news})
                }
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    updateVisible(section:InfoSections, isVisible:boolean) {
        if(isVisible) {
            setTimeout(() => {
                this.setState({activeSection:section});
            }, 100);
        } else {
            if(Math.abs(section - this.state.activeSection) > 1) {
                return;
            }
            if(section !== InfoSections.News) {
                this.setState({activeSection:section + 1});
            }
        }
    }

    setActive(section:InfoSections) {
        this.setState({activeSection:section});
    }

    getTabClass(section:InfoSections) {
        if(this.state.activeSection === section) {
            return "view-item-active";
        } else {
            return ""
        }
    }

    renderMessages(messages:Array<string>) {
        return(
            <ul>
                {
                    messages.map((m:string, index:number) => 
                    <li key={index}>{m}</li>
                    )
                }
            </ul>
        )
    }
    render() {
        return(
            <div className="container tabbed-outer">
                <div className="container-content info-container">
                    <div className="container-section">
                        <div className="section-background">
                        </div>
                        <div className="section-content">
                            <div className="header">
                                <div className="nasfaq">
                                    nasfaq
                                </div>
                            </div>
                            <VisibilitySensor
                                onChange={(isVisible:boolean) => this.updateVisible(InfoSections.About, isVisible)}>
                                <div id="about">
                                    <div className="subheader">
                                        What is this?
                                    </div>
                                    <p>
                                        nasfaq is a financial market simulator based on the 
                                        performance of the virtual Youtubers under the Hololive 
                                        idol agency. It provides real time statistics on each
                                        performer including subscribers, daily subscribers, and view counts. 
                                        Trading takes place with "coins" that represent each member, of 
                                        which a unique price is calculated periodically based on channel views, 
                                        subscribers, and market demand. Research the Holos' streams, watch them,
                                        support them, and grow your portfolio. Now go out there! Support your oshi!
                                    </p>
                                </div>
                            </VisibilitySensor> 
                            
                            <VisibilitySensor
                                onChange={(isVisible:boolean) => this.updateVisible(InfoSections.HowTo, isVisible)}>
                                <div id="howtoplay">

                                    <div className="subheader">
                                        How to Play
                                    </div>
                                    <p>
                                        You do not need to make an account to see how the market is performing, 
                                        but if you want to participate in trading, you must make an account. 
                                    </p>
                                    <p>
                                        New accounts are provided a starting balance 
                                        of 10 times the mean price of all coins. Your balance is your liquid asset used for handling trades.
                                        Transactions are managed by the <span className="broker"> Broker</span>. When you start a transaction, 
                                        the <span className="broker"> Broker</span> will determine if you have sufficient balance/ assets to
                                        make the transaction. If you do, the transaction will be completed,
                                        your wallet will be updated, and the broker will adjust the market ask/bid prices accordingly.
                                        The ask price is how much you will need to pay in order to purchase that coin. The bid price is what you
                                        will receive if you decide to sell a share. All coin prices displayed are updated
                                        in real time, so you will always be paying/ receiving the amount that you see.
                                        The <span className="broker"> Broker</span> adjusts the ask/ bid prices of each coin
                                        on a transaction-by-transaction basis. Consecutive purchases of a coin raise the value,
                                        while consecutive sales decrease the value. 
                                        The <span className="broker"> Broker</span> will take a fee of 5% of the coin's asking price on each purchase of said coin. Donating money through the superchats system will earn you an equivalent amount of credits that will be used to pay the fees in place of your balance.  
                                        A running log of transactions that have occurred throughout the day, as well as the price and quantity 
                                        that they were performed at, can be viewed on the Activity page.
                                    </p>
                                    <p>
                                        You can buy and sell up to 5 coins at once. Use the tabs that appear on the side of the buy and sell buttons to change the quantity to be traded. You can also set the quantity in the autotrader. If trading more than 1 coin at once, you will be charged a 10% fee per coin on the total order. For example, buying 4 coins at $1000 each will cost a total of $1000 * 4 * 1.45 (additional 5% broker fee) = $5800. Selling 5 coins at $1000 each would require a fee of $5000 * 0.5 = $2500. If you have 0 credits, this means you would then receive a total of $2500 in liquid for selling those coins. If you have credits, the fee would be taken out of your credit total rather than your balance and you would receive the full $5000. Credits also apply to the fee for buying. Each coin has a cooldown period of 10 minutes starting from when you begin the 
                                        transaction. This is to promote smart trading and prevent market dumps. You can view how the 
                                        price of a coin has changed over the past 24 hours on the coin's market module on the market 
                                        page. A coin's price will be added to the graph every 16 transactions, or on each quarter hour if more
                                        than 15 minutes have passed since the last tick; whichever comes first. 
                                    </p>
                                    <p>
                                        In addition to the price updates that occur as a result of shifts in demand, the prices will
                                        receive an adjustment once daily at 9:05am ET based on the Youtuber's channel performance.
                                        The end-of-day market price is taken into account when determining how much to adjust.
                                        If a bullish coin is experiencing a bubble, it will adjust downwards towards a base value determined by performance. A bearish coin
                                        that is currently undervalued will adjust upwards by a performance variable factor, 
                                        rewarding those who held an 
                                        undervalued coin. Adjustments seek to "make up" for
                                        ground that hasn't been covered by demand-based adjustments alone. In this way, users are forced
                                        to make smarter decisions on which coins they should hold based on their own assessment
                                        of a coin's fundamental value. 
                                    </p>
                                    <p>
                                        Once a week on Saturday 0:00 ET, users will receive a dividend payment from the coins in his wallet.
                                        The amount of cash added to your balance for a particular coin is a function of the amount you
                                        own and the chuuba's channel performance in the past week. It is independent of the market performance  
                                        of that coin. Seek high performance coins in order to optimize your weekly payoffs - changes
                                        in net worth are impacted by both capital gains and dividend deposits. 
                                        Analyze trends, anticipate changes, and watch the market closely to maximize your 
                                        worth. Remember, sometimes it's not the biggest Holos that will make you the most!
                                    </p>
                                    <p>
                                        A user's net worth is calculated as 
                                        <span className="code">(balance) + (amount of coin owned * coin value)</span>
                                        for each coin in their wallet. As a coin's value changes, so will any users who own that coin's net worth.
                                        You can view the ranking of users by their net worth on the leaderboard page. The oshiboard displays the 
                                        "board of directors" of each coin. It is composed of the top 5 users who hold that coin as their oshi (meaning
                                        it holds a plurality of their wallet).
                                    </p>
                                </div>
                            </VisibilitySensor>

                            <VisibilitySensor
                                onChange={(isVisible:boolean) => this.updateVisible(InfoSections.IPO, isVisible)}>
                                <div id="ipos">
                                        <div className="subheader">
                                            IPOs
                                        </div>
                                    <p>
                                        When a new generation or chuuba is announced, an initial public offering (IPO) of the coin will be released to the market shortly thereafter. The initial behavior of these coins is different than normal coins. First, the new coins will not adjust until the first adjustment after their debut. Until then, their price is completely player driven. At the first adjustment after debut, they will be brought to a base price which is calculated based on the channel performance compared to the rest of the market up until that point. This base price is independent of the coin's market performance. It is the individual players' responsibility to gauge where that base price will be in order to determine whether to sell, buy, or hold and ensure gains. After that and from then on, the coins will behave as normal coins.
                                    </p>    
                                </div>
                            </VisibilitySensor>


                            <VisibilitySensor
                                onChange={(isVisible:boolean) => this.updateVisible(InfoSections.UI, isVisible)}>
                                <div id="ui">
                                    <div className="subheader">
                                        About the UI
                                    </div>
                                    <p>
                                        The <span className="broker">Market</span> page allows users to view an overview of the entire market at once.
                                        All coins are sorted by generation and windows for each can be opened by clicking on the icons. Each coin's window
                                        includes their current Ask and Bid prices, as well as graphs of the different metrics you may be interested in. Clicking
                                        on the triangle will open up the overview/selection menu. Each of these metrics may be selected in order to see a graph of
                                        their history. Additionally, clicking on the magnifying glass in the upper left hand side opens up more options for sorting, 
                                        searching and viewing of the coins. Clicking on the icon in the bottom right hand side of this menu will toggle between compact
                                        view and graph view.
                                        Clicking on the bottom icon gives access to an autotrader function, allowing one to automatically conduct
                                        large volume trades. Of note here is that one must always turn off the autotrader when making changes to the target amounts.
                                        As a safeguard against erroneous behavior the autotrader will automatically pause in the event of two tabs being opened. Please
                                        ensure the autotrader is only active in one tab before proceeding. Note this behavior does not extend to browsing in Private mode
                                        so please take extra care.
                                    </p>
                                    <p>
                                        The <span className="broker">Activity</span> page shows live updates of what is going on in the market as well as gives insights
                                        into your own actions. The Dividends tab shows the last dividend payout for each of the coins. The My History tab shows your past
                                        transactions and the History page shows the transactions of the market as a whole. Your own transactions are highlighted. Note that
                                        you can pause the updating of the activity page with the pause button on the top right of the graph, as well as refresh using the
                                        refresh button.
                                    </p>
                                    <p>
                                        The <span className="broker">Floor</span> page is a forum where users may post about the game. You may create a new room/thread or 
                                        join in the discussion of an existing room/thread. You may report posts on the floor that you feel are breaking the rules, 
                                        however, please understand that the moderation team is quite small and it may take some time to respond.
                                    </p>
                                    <p>
                                        The <span className="broker">Info</span> page you are currently on will show the most up to date tutorial of the game written by the
                                        developers and also has our changelog, where you may read a brief overview of what has changed between updates.
                                    </p>
                                    <p>
                                        The <span className="broker">Leaderboard</span> page shows the current leaderboards for net worth as well as the Oshiboard, where the 
                                        Board of Directors for each coin is shown.
                                    </p>
                                    <p>
                                        The <span className="broker">Superchats</span> page is where you can spend money on superchats for each coin. Each coin has a live feed
                                        that displays the superchats being bought. There are 5 tiers of superchats available to purchase - blue, green, yellow, magenta, and red.
                                        Higher tiers cost more, last longer in the feed, and allow more characters in the message. Each feed also displays a ranking of that coin's 
                                        top donators of the day, and the total amount they've earned that day. The banner at the top shows the top 3 earners of all time, and the 
                                        top 5 donators overall of that day. 
                                    </p>
                                    <p>
                                        The <span className="broker">Profile</span> page allows you to change your username and icon by clicking on them. It also allows you to 
                                        change your password as well as delete your account. To the right of this is your current net worth as well as a summary of your assets. 
                                        Below this is a graph showing your net worth over time, as well as your currently owned assets, sorted by generation. 
                                        You can also choose to make your wallet public on the leaderboard by clicking on the settings icon. 
                                    </p>
                                    <p>
                                        The <span className="broker">Navbar</span> shows the current time in New York which is what the market uses for adjustments, dividends, etc. 
                                        You'll also see your current balance here and the logout button. The Sun/Moon icon toggles between day and night modes for the page. If the 
                                        market is closed, you will also see this alert on the top right corner.
                                    </p>
                                </div>
                            </VisibilitySensor>

                            <VisibilitySensor
                                onChange={(isVisible:boolean) => this.updateVisible(InfoSections.Docs, isVisible)}>
                                <div id="docs">
                                        <div className="subheader">
                                            API Documentation
                                        </div>
                                    <p>
                                        You can find documentation on the API endpoints <Link to="/docs">here</Link>
                                    </p>
                                </div>
                            </VisibilitySensor>

                            <VisibilitySensor
                                onChange={(isVisible:boolean) => this.updateVisible(InfoSections.Goal, isVisible)}>
                                <div id="ourgoal">
                                        <div className="subheader">
                                            Our Goal
                                        </div>
                                    <p>
                                        NASFAQ is a fun game, but it also serves a purpose - to encourage
                                        you to seek out and watch Holos who you otherwise wouldn't pay as much
                                        attention to. We want people to not only 
                                        appreciate their favorite Holos, but to learn more about Hololive
                                        as a whole. Remember - in stocks, knowledge is power. Knowing the Holos, their
                                        schedules, which streams were fun, etc., will give you an edge over other traders!
                                        Sometimes, the best option might be to encourage others to watch the talent
                                        you're investing in! Tip: High numbers don't guarantee profits. It's often in the 
                                        overlooked chuubas where the true profits lie.
                                    </p>
                                </div>
                            </VisibilitySensor>

                            <VisibilitySensor
                                onChange={(isVisible:boolean) => this.updateVisible(InfoSections.Disclaimer, isVisible)}>
                                <div id="disclaimer">
                                        <div className="subheader">
                                            Disclaimer
                                        </div>
                                    <p>
                                        nasfaq is not affiliated with Cover Corporation in any way. It is completely fan-made. 
                                        The numbers here mean nothing in the real world. Please,
                                        do not take this as a direct indication of the intrinsic value of a Hololive
                                        talent. Each talent is deserving of your support, so please leave whatever qualms 
                                        you may have about their numbers here. Additionally, If you
                                        have questions, concerns, or would like to help support the website, please email  
                                        <a href="mailto:nasfaqsite@gmail.com"> nasfaqsite@gmail.com</a>. All usernames and
                                        posts on the floor are owned by the user.
                                    </p>
                                </div>
                            </VisibilitySensor>


                            <VisibilitySensor
                                onChange={(isVisible:boolean) => this.updateVisible(InfoSections.ArtCredits, isVisible)}>
                                <div id="artcredits">

                                        <div className="subheader">
                                            Art Credits
                                        </div>
                                    <ul>
                                        <li>
                                            Angry Botan - <a href="https://twitter.com/kukie_nyan">@kukie_nyan</a>
                                        </li>
                                        <li>
                                            Various anonymous artists
                                        </li>
                                    </ul>
                                    <p>
                                        *If you are the artist of one of the images and would like the piece removed or to be credited, please contact us at our email.
                                    </p>
                                </div>
                            </VisibilitySensor>
                        </div>
                    </div>


                    <VisibilitySensor
                        onChange={(isVisible:boolean) => this.updateVisible(InfoSections.Support, isVisible)}>
                        <div className="container-section" id="support">
                            <div className="section-background">
                            </div>
                            <div className="section-content kofi-container">
                                    <div className="header">
                                        <div className="nasfaq">
                                            support the site!
                                        </div>
                                    </div>
                                <div className="kofi-container">
                                    <a href='https://ko-fi.com/L3L446W4T' target='_blank'>
                                        <img 
                                            height='36' 
                                            style={{border:'0px',height:'36px'}} 
                                            src='https://cdn.ko-fi.com/cdn/kofi2.png?v=2'
                                            alt='Buy Me a Coffee at ko-fi.com' /></a>
                                </div>
                            </div>
                        </div>
                    </VisibilitySensor>

                    <div className="container-section" id="news">
                        <div className="section-background">
                        </div>
                        <div className="section-content">
                            <VisibilitySensor
                                onChange={(isVisible:boolean) => this.updateVisible(InfoSections.News, isVisible)}>
                                <div className="header">
                                    <div className="nasfaq">
                                        news
                                    </div>
                                </div>
                            </VisibilitySensor>
                            {
                                this.state.news.length === 0 ?
                                <p>No news!</p> : null
                            }
                            {
                                this.state.news.map((item:any) => 
                                    <div key={new Date(item.date).getTime()}>
                                        <div className="subheader">
                                            {item.date}
                                        </div>
                                        {this.renderMessages(item.messages)}
                                    </div>
                                )
                            }
                        </div>
                    </div>

                </div>
                
                <div className="tabbed-view-select right">
                    <a href="#about">
                        <div 
                            className={`view-item ${this.getTabClass(InfoSections.About)}`}
                            onClick={() => this.setActive(InfoSections.About)}>
                            What is this?
                        </div>
                    </a>
                    <a href="#howtoplay">
                        <div 
                            className={`view-item ${this.getTabClass(InfoSections.HowTo)}`}
                            onClick={() => this.setActive(InfoSections.HowTo)}>
                            How to Play
                        </div>
                    </a>
                    <a href="#ipos">
                        <div 
                            className={`view-item ${this.getTabClass(InfoSections.IPO)}`}
                            onClick={() => this.setActive(InfoSections.IPO)}>
                            IPOs
                        </div>
                    </a>
                    <a href="#ui">
                        <div 
                            className={`view-item ${this.getTabClass(InfoSections.UI)}`}
                            onClick={() => this.setActive(InfoSections.UI)}>
                            About the UI
                        </div>
                    </a>
                    <a href="#docs">
                        <div 
                            className={`view-item ${this.getTabClass(InfoSections.Docs)}`}
                            onClick={() => this.setActive(InfoSections.Docs)}>
                            API
                        </div>
                    </a>
                    <a href="#ourgoal">
                        <div 
                            className={`view-item ${this.getTabClass(InfoSections.Goal)}`}
                            onClick={() => this.setActive(InfoSections.Goal)}>
                            Our Goal
                        </div>
                    </a>
                    <a href="#disclaimer">
                        <div 
                            className={`view-item ${this.getTabClass(InfoSections.Disclaimer)}`}
                            onClick={() => this.setActive(InfoSections.Disclaimer)}>
                            Disclaimer
                        </div>
                    </a>
                    <a href="#artcredits">
                        <div 
                            className={`view-item ${this.getTabClass(InfoSections.ArtCredits)}`}
                            onClick={() => this.setActive(InfoSections.ArtCredits)}>
                            Art Credits
                        </div>
                    </a>
                    <a href="#support">
                        <div 
                            className={`view-item ${this.getTabClass(InfoSections.Support)}`}
                            onClick={() => this.setActive(InfoSections.Support)}>
                            Support the Site
                        </div>
                    </a>
                    <a href="#news">
                        <div 
                            className={`view-item ${this.getTabClass(InfoSections.News)}`}
                            onClick={() => this.setActive(InfoSections.News)}>
                            News
                        </div>
                    </a>
                </div>
                <img className="corner-img br okayu-question" src={okayu} alt="okayu"/>
            </div>
        )
    }
}

export default Info;