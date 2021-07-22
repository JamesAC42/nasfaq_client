import React, {Component} from 'react';
import {connect} from 'react-redux';
import '../../../css/danmaku.scss';
import { Socket } from 'socket.io-client';
import checkStorage from '../../checkStorage';
import {
    PRICES_LIST,
    COLORS_LIST,
    danmaku_settings,
    SupaQueue,
    ISuperchatBullet
} from './superchatTypes';
import { ISuperchat, ISuperchatDaily, ISuperchatHistory } from '../../interfaces/ISuperchats';
import { 
    superchatsActions
} from '../../actions/actions';
import Superchat from './Superchat';
const mapDispatchToProps = {
    setCooldown: superchatsActions.setCooldown,
    setSupaDaily: superchatsActions.setSupaDaily,
    setSupaHistory: superchatsActions.setSupaHistory,
    setEnableDanmaku: superchatsActions.setEnableDanmaku
}

const mapStateToProps = (state:any, props:any) => ({
    session: state.session,
    superchats: state.superchats,
    socket: state.socket
});

class SuperchatDanmakuState {
    supaQueue:{[type:string]:SupaQueue};
    constructor() {
        this.supaQueue = {}
    }
}

interface SuperchatDanmakuProps {
    superchats: {
        daily:{[coin:string]:ISuperchatDaily},
        history:{[coin:string]:ISuperchatHistory},
        enableDanmaku:boolean
    },
    session: {
        loggedin:boolean
    },
    socket: {
        socket:any
    },
    setCooldown: (cooldown:number) => {},
    setSupaDaily: (daily:any) => {},
    setSupaHistory: (history:any) => {},
    setEnableDanmaku: (enableDanmaku:boolean) => {}
}

type CompQueue = {[type:string]:SupaQueue};

class SuperchatDanmakuBind extends Component<SuperchatDanmakuProps> {
    state:SuperchatDanmakuState;
    expirationInterval:any;
    movementInterval:any;
    constructor(props:SuperchatDanmakuProps) {
        super(props);
        this.state = new SuperchatDanmakuState();
    }

    isLoaded() {
        return this.props.superchats.daily !== undefined 
            && this.props.superchats.history !== undefined;
    }

    componentDidMount() {
        this.connectSocket();
        
        if(this.isLoaded()) return;

        fetch('/api/getSuperchats', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.props.setSupaDaily(data.daily);
                this.props.setSupaHistory(data.history);

                this.generateQueue(data.history);

                this.expirationInterval = setInterval(() => {
                    this.removeExpired();
                }, 10000);
                
                if(this.props.superchats.enableDanmaku) {
                    this.startMovementLoop();
                }
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })

        if(checkStorage()) {
            let stored = localStorage.getItem("nasfaq:danmakuEnabled");
            if(stored !== null) {
                let enabled:boolean = JSON.parse(stored);
                this.props.setEnableDanmaku(enabled);
            }
        }
    }

    startMovementLoop() {
        this.movementInterval = setInterval(() => {
            this.moveActiveSupers();
        }, 800);
    }

    stopMovementLoop() {
        clearInterval(this.movementInterval);
    }

    typeFromAmount(amount:number) {
        let scType = COLORS_LIST[0];
        for(let i = 1; i < PRICES_LIST.length + 1; i++) {
            if(amount >= PRICES_LIST[i - 1]) {
                scType = COLORS_LIST[i - 1];
            }
        }
        return scType;
    }

    addSuperToQueue(superchat:ISuperchat) {
        let q:CompQueue = {...this.state.supaQueue};
        let superType = this.typeFromAmount(superchat.amount);
        let superQueue:SupaQueue = q[superType];
        superQueue.superchats.push({
            superchat,
            x:window.innerWidth,
            y:Math.random() * (window.innerHeight - 200)
        });
        let now = new Date().getTime();
        if(superQueue.loopStart > now && superQueue.activeIndex === 0) {
            superQueue.activeIndex = superQueue.superchats.length - 1;
            superQueue.loopStart = now;
        }
        this.setState({
            supaQueue:q
        })
    }
    
    generateQueue(history:{[coin:string]:ISuperchatHistory}) {
        let q:CompQueue = {};
        let i = 0;
        let now = new Date().getTime();
        Object.keys(danmaku_settings).forEach((type:string) => {
            q[type] = {
                ...danmaku_settings[type],
                activeIndex: 0,
                superchats: [],
                loopStart: now + (i * 1000)
            };
            i += 1.5;
        })
        Object.keys(history).forEach((coin:string) => {
            let coinHistory = history[coin].superchats;
            coinHistory.forEach((sc:ISuperchat) => {
                let bullet:ISuperchatBullet = {
                    superchat:sc,
                    x:window.innerWidth + 100,
                    y:Math.random() * (window.innerHeight - 200)
                }
                q[this.typeFromAmount(sc.amount)].superchats.push(bullet);
            })
        });
        this.setState({
            supaQueue:q
        })
    }

    componentWillUnmount() {
        clearInterval(this.expirationInterval);
        this.stopMovementLoop();
        if(this.props.socket.socket !== null) {
            this.props.socket.socket.removeAllListeners("superchatUpdate");
            this.props.socket.socket.removeAllListeners("superchatResetDaily");
        }
    }

    componentDidUpdate(prevProps:SuperchatDanmakuProps) {
        if(this.props.session.loggedin && !prevProps.session.loggedin) {
            fetch('/api/getCooldown', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                let cd = 0;
                if(data.cooldown.superchat !== undefined) {
                    cd = data.cooldown.superchat;
                }
                this.props.setCooldown(cd);
            })
            .catch(error => {
                console.error('Error: ' +  error);
            })
        }

        if(this.props.superchats.enableDanmaku !== prevProps.superchats.enableDanmaku) {
            if(this.props.superchats.enableDanmaku) {
                this.startMovementLoop();
            } else {
                this.stopMovementLoop();
            }
        }

        if(prevProps.socket.socket !== this.props.socket.socket) {
            if(this.props.socket.socket !== null) {
                this.listenSuperchat(this.props.socket.socket);
            }
        }
    }

    connectSocket() {
        if(this.props.socket.socket !== null) {
            this.listenSuperchat(this.props.socket.socket);
        }
    }

    listenSuperchat(socket:Socket) {
        socket.on('superchatUpdate', (dataString:string) => {
            let data = JSON.parse(dataString);
            let coin = data.coin;
            let currentDaily = {...this.props.superchats.daily}
            let currentHistory = {...this.props.superchats.history}
            currentDaily[coin].total += data.amount;
            if(currentDaily[coin].userTotals[data.userid] !== undefined) {
                currentDaily[coin].userTotals[data.userid].total += data.amount;
            } else {
                currentDaily[coin].userTotals[data.userid] = {
                    username: data.username,
                    total: data.amount
                } 
            }
            currentHistory[coin].total += data.amount;
            let i = 0;
            while(i < currentHistory[coin].superchats.length) {
                if((currentHistory[coin].superchats[i].expiration > data.expiration)) {
                    break;
                } else {
                    i++;
                }
            }
            currentHistory[coin].superchats.splice(i,0,data);

            this.props.setSupaDaily(currentDaily);
            this.props.setSupaHistory(currentHistory);
            this.addSuperToQueue(data);

        });

        socket.on('superchatResetDaily', (data:any) => {
            let newDaily = {...this.props.superchats.daily};
            Object.keys(newDaily).forEach((coin:string) => {
                newDaily[coin] = {
                    total:0,
                    userTotals: {}
                }
            });
            this.props.setSupaDaily(newDaily);
        })
    }

    removeExpired() {
        let history = {...this.props.superchats.history};
        if(history === undefined) return;
        let now = new Date().getTime();
        Object.keys(history).forEach((coin:string) => {

            let historyItem:ISuperchatHistory = history[coin];
            let supers:Array<ISuperchat> = historyItem.superchats;
            while(supers.length > 0) {
                if(supers[0].expiration < now) {
                    supers.shift();
                } else {
                    break;
                }
            }

            history[coin] = historyItem;

        });
        let queue:{[type:string]:SupaQueue} = {...this.state.supaQueue};
        Object.keys(queue).forEach((type:string) => {
            let superchatList:Array<ISuperchatBullet> = queue[type].superchats;
            let i = 0;
            while(i < superchatList.length) {
                if(superchatList[i].superchat.expiration < now) {
                    superchatList.splice(i, 1);
                    if(i < queue[type].activeIndex) {
                        queue[type].activeIndex -= 1;
                    }
                } else { i++; }
            }
        })
        this.setState({
            supaQueue:queue
        })
        this.props.setSupaHistory(history);
    }

    moveActiveSupers() {
        let q:CompQueue = {...this.state.supaQueue};
        let now = new Date().getTime();
        Object.keys(q).forEach((type:string) => {
            let supaQueue:SupaQueue = q[type];
            if(supaQueue.superchats.length > 0) {
                if(now > supaQueue.loopStart) {
                    let activeBullet = supaQueue.superchats[supaQueue.activeIndex];
                    activeBullet.x -= supaQueue.speed;
                    if(activeBullet.x < -500) {
                        supaQueue.activeIndex += 1;
                        activeBullet.x = window.innerWidth;
                        activeBullet.y = Math.random() * (window.innerHeight - 200)
                        if(supaQueue.activeIndex > supaQueue.superchats.length - 1) {
                            supaQueue.loopStart = new Date().getTime() + (supaQueue.interval * 60 * 1000);
                            supaQueue.activeIndex = 0;
                        }
                    }
                }
            }
        })
        this.setState({
            supaQueue:q
        })
    }

    renderActiveSupers() {
        let q:CompQueue = {...this.state.supaQueue};
        let activeBullets:Array<ISuperchatBullet> = [];
        let now = new Date().getTime();
        Object.keys(q).forEach((type:string) => {
            if(q[type].superchats.length > 0) {
                if(now > q[type].loopStart) {
                    activeBullets.push(q[type].superchats[q[type].activeIndex]);
                }
            }
        });
        return(
                activeBullets.map((bullet:ISuperchatBullet) => 
                    <div 
                        key={bullet.superchat.expiration}
                        className="bullet-container"
                        title={"Superchat for: " + bullet.superchat.coin}
                        style={{
                            top:bullet.y,
                            left:bullet.x
                        }}>
                        <Superchat item={bullet.superchat}>
                            <div className="superchat-message">
                                {bullet.superchat.message}
                            </div>
                        </Superchat>
                    </div>
                )
            
        )
    }

    render() {
        if(!this.props.superchats.enableDanmaku) return null;
        return this.renderActiveSupers();
    }
}

const SuperchatDanmaku = connect(
    mapStateToProps,
    mapDispatchToProps
)(SuperchatDanmakuBind);

export default SuperchatDanmaku;