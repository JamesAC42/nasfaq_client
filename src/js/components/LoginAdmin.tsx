import React, { Component } from 'react';
import '../../css/login.scss';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';

import ReCAPTCHA from 'react-google-recaptcha';
import { InputItem, PasswordItem } from './InputItem';
import { 
    sessionActions,
    userinfoActions
} from '../actions/actions';
import Button from './Button';

import LoginAdminState from './state/LoginAdminState';


interface LoginAdminProps {
    session : {
        loggedin: boolean
    },
    setUsername: (username:string) => {},
    setEmail: (email:string) => {},
    setWallet: (wallet:any) => {},
    setIcon: (icon:string) => {},
    setId: (id:string) => {},
    setPerformance: (performance:any) => {},
    setLoaded: () => {},
    setAdmin: (admin:boolean) => {},
    setVerified: (verified:boolean) => {},
    setMuted: (muted:any) => {},
    setSettings: (settings:any) => {},
    login: () => {},
    setItems: (items:any) => {},
    setBrokerFeeTotal: (brokerFeeTotal:any) => {},
    setBrokerFeeCredits: (brokerFeeCredits:any) => {},
    match: {
        params: {
            from:string
        }
    }
}

const mapStateToProps = (state: any, props: any) => ({
    session: state.session
})

const mapDispatchToProps = {
    login: sessionActions.login,
    setUsername: userinfoActions.setUsername,
    setEmail: userinfoActions.setEmail,
    setId: userinfoActions.setId,
    setWallet: userinfoActions.setWallet,
    setIcon: userinfoActions.setIcon,
    setPerformance: userinfoActions.setPerformance,
    setLoaded: userinfoActions.setLoaded,
    setVerified: userinfoActions.setVerified,
    setAdmin: userinfoActions.setAdmin,
    setMuted: userinfoActions.setMuted,
    setSettings: userinfoActions.setSettings,
    setItems: userinfoActions.setItems,
    setBrokerFeeTotal: userinfoActions.setBrokerFeeTotal,
    setBrokerFeeCredits: userinfoActions.setBrokerFeeCredits,
}

type formEvent = React.ChangeEvent<HTMLInputElement>;

class LoginAdminBind extends Component<LoginAdminProps> {

    state: LoginAdminState;
    recaptchaRef: any;
    constructor(props: LoginAdminProps) {
        super(props);
        this.state = new LoginAdminState();
        this.recaptchaRef = React.createRef();
    }

    updateGetAuthCodeValues = (a:formEvent) => {
        this.setState({
            ...this.state,
            getAuthCode: {
                ...this.state.getAuthCode,
                [a.target.name] : a.target.value
            }
        });
    }

    updateLoginValues = (a:formEvent) => {
        this.setState({
            ...this.state,
            loginAdmin: {
                ...this.state.loginAdmin,
                [a.target.name] : a.target.value
            }
        });
    }

    
    setData(data:any) {
        this.props.setUsername(data.username);
        this.props.setEmail(data.email);
        this.props.setWallet(data.wallet);
        this.props.setIcon(data.icon);
        this.props.setId(data.id);
        this.props.setPerformance(data.performance);
        this.props.setVerified(data.verified);
        this.props.setAdmin(data.admin);
        this.props.setMuted(data.muted);
        this.props.setSettings(data.settings);
        this.props.setLoaded();
        this.props.setItems(JSON.parse(data.items));
        this.props.setBrokerFeeTotal(data.brokerFeeTotal);
        this.props.setBrokerFeeCredits(data.taxCredits);
        this.props.login();
    }

    getAuthCode = () => {
        if(this.state.captchaToken === null) {
            if(this.recaptchaRef.current !== null) {
                this.setState({
                    loggingIn:false
                }, () => {
                    this.recaptchaRef.current.execute();
                })
            }
            return;
        }
        if(
            this.state.getAuthCode.email === '') {
            this.setState({
                ...this.state,
                error: {
                    ...this.state.error,
                    authCode: 'Invalid input'
                }
            });
            return;
        }
        fetch('/api/sendAuthCode/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...this.state.getAuthCode,
                captchaToken: this.state.captchaToken
            })
        })
        .then(response => response.json())
        .then(data => {
            if(this.recaptchaRef.current !== null) {
                this.recaptchaRef.current.reset();
            }
            if(data.success) {
                this.setState({
                    catpchaToken: null,
                    codeResult: "Code sent to email.",
                    error: {
                        ...this.state.error,
                        authCode: ''
                    }
                })
            } else {
                this.setState({
                    ...this.state,
                    captchaToken: null,
                    error: {
                        ...this.state.error,
                        authCode: data.error
                    }
                })
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    login = () => {
        if(this.state.captchaToken === null) {
            if(this.recaptchaRef.current !== null) {
                this.setState({
                    loggingIn:true
                }, () => {
                    this.recaptchaRef.current.execute();
                })
                return;
            }
        }
        if(
            this.state.loginAdmin.email === '' ||
            this.state.loginAdmin.password === '' ||
            this.state.loginAdmin.code === '') {
            this.setState({
                ...this.state,
                error: {
                    ...this.state.error,
                    login: 'Invalid input'
                }
            });
            return;
        }
        fetch('/api/loginAdmin/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...this.state.loginAdmin,
                captchaToken: this.state.captchaToken
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.setData(data);
            } else {
                if(this.recaptchaRef.current !== null) {
                    this.recaptchaRef.current.reset();
                }
                this.setState({
                    ...this.state,
                    captchaToken: null,
                    error: {
                        ...this.state.error,
                        login: data.error
                    }
                })
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }

    
    onCaptchaChange(value:string | null) {
        this.setState({
            captchaToken:value
        }, () => {
            if(this.state.loggingIn) {
                this.login();
            } else {
                this.getAuthCode();
            }
        })
    }

    render() {

        if(this.props.session.loggedin === undefined) return null;
        if(this.props.session.loggedin) {
            return(
                <Redirect to="/profile" />
            )
        }

        return(
            <div className="login-outer">
                <div className="login-inner login-inner-admin">
                    <div className="login-backdrop"></div>
                    <div className="modal login-modal flex-row flex-stretch">
                        <div className="login flex-col flex-stretch">
                            <div className="modal-header login-header">
                                Administrator Login
                            </div>

                            <div className="login-input-container flex-col flex-stretch">
                                
                                <div className="input-label">Email</div>
                                <InputItem 
                                    value={this.state.getAuthCode.email} 
                                    maxLength={200}
                                    name={"email"}
                                    updateValue={this.updateGetAuthCodeValues} />

                            </div>

                            <div className="login-submit-container center-child">
                                <Button 
                                    onClick={this.getAuthCode}
                                    className="inverse">
                                        CODE
                                </Button>
                            </div>
                            
                            <div className="code-result">
                                {this.state.codeResult}
                            </div>
                            <div className="login-error">
                                {this.state.error.authCode}
                            </div>

                            <div className="login-input-container flex-col flex-stretch">
                                
                                <div className="input-label">Email</div>
                                <InputItem 
                                    value={this.state.loginAdmin.email} 
                                    maxLength={200}
                                    name={"email"}
                                    updateValue={this.updateLoginValues} />

                                <div className="input-label">Password</div>
                                <PasswordItem
                                    value={this.state.loginAdmin.password} 
                                    maxLength={200}
                                    name={"password"}
                                    updateValue={this.updateLoginValues} />

                                <div className="input-label">Auth Code</div>
                                <InputItem 
                                    value={this.state.loginAdmin.code} 
                                    maxLength={200}
                                    name={"code"}
                                    updateValue={this.updateLoginValues} />

                            </div>

                            <form action="">
                                <ReCAPTCHA
                                    ref={this.recaptchaRef}
                                    size="invisible"
                                    sitekey="6LdPspwaAAAAADbGKzR1g2hbLadc0yaFZGyJBUrz"
                                    onChange={(token:string | null) => this.onCaptchaChange(token)}/>
                            </form>

                            <div className="login-submit-container center-child">
                                <Button 
                                    onClick={this.login}
                                    className="inverse">
                                        LOG IN
                                </Button>
                            </div>
                            <div className="login-error">
                                {this.state.error.login}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const LoginAdmin = connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginAdminBind);

export default LoginAdmin;