import React, { Component } from 'react';
import '../../css/login.scss';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';

import validateEmail from '../validateEmail';

import ReCAPTCHA from 'react-google-recaptcha';

import LoginState from './state/LoginState';
import { InputItem, PasswordItem } from './InputItem';
import { 
    sessionActions,
    userinfoActions
} from '../actions/actions';

import Button from './Button';

import {
    IoMdArrowDropupCircle
} from 'react-icons/io';
import { Link } from 'react-router-dom';

interface LoginProps {
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
    setSettings: userinfoActions.setSettings
}

type formEvent = React.ChangeEvent<HTMLInputElement>;

class LoginBind extends Component<LoginProps> {

    state: LoginState;
    recaptchaRef: any;
    constructor(props: LoginProps) {
        super(props);
        this.state = new LoginState();
        this.recaptchaRef = React.createRef();
    }

    updateLoginValues = (a:formEvent) => {
        this.setState({
            ...this.state,
            login: {
                ...this.state.login,
                [a.target.name] : a.target.value
            }
        });
    }

    updateRegisterValues = (a:formEvent) => {
        this.setState({
            ...this.state,
            register: {
                ...this.state.register,
                [a.target.name] : a.target.value
            }
        });
    }

    updateFilterValues = (a:formEvent) => {
        this.setState({
            ...this.state,
            filter: {
                ...this.state.filter,
                [a.target.name] : a.target.value
            }
        })
    }

    toggleFilterPane() {
        this.setState({
            showFilter: !this.state.showFilter
        })
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
        this.props.login();
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
            this.state.login.email === '' ||
            this.state.login.password === '') {
            this.setState({
                ...this.state,
                error: {
                    ...this.state.error,
                    login: 'Invalid email or password'
                }
            });
            return;
        }
        fetch('/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...this.state.login,
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

    register = () => {
        if(this.state.captchaToken === null) {
            if(this.recaptchaRef.current !== null) {
                this.setState({
                    loggingIn:false
                }, () => {
                    this.recaptchaRef.current.execute();
                })
                return;
            }
        }
        if(
            this.state.register.email === '' ||
            this.state.register.username === '' ||
            this.state.register.password === '' ||
            this.state.register.passwordConfirm === '' ||
            this.state.filter.ogey === '' ||
            this.state.filter.abayo === '' ||
            this.state.filter.towa === ''
        ) {
            this.setState({
                ...this.state,
                error: {
                    ...this.state.error,
                    register: 'Invalid input'
                }
            });
            return;
        }
        if(!validateEmail(this.state.register.email)) {
            this.setState({
                ...this.state,
                error: {
                    ...this.state.error,
                    register: 'Invalid email address'
                }
            });
            return;
        }
        if(
            this.state.register.password !==
            this.state.register.passwordConfirm
        ) {
            this.setState({
                ...this.state,
                error: {
                    ...this.state.error,
                    register: 'Passwords do not match'
                }
            });
            return;
        }
        fetch('/api/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...this.state.register,
                filter: {
                    ...this.state.filter
                },
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
                        register: data.error
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
                this.register();
            }
        })
    }

    render() {
        if(this.props.session.loggedin === undefined) return null;
        if(this.props.session.loggedin) {
            let params:string = this.props.match.params.from;
            if(params !== undefined) {
                let paramParts = params.split("+");
                let r;
                if(paramParts[0] === "floor") {
                    r = "/floor";
                    if(paramParts.length > 1) {
                        r += "/" + paramParts[1];
                    }
                } else {
                    r = "/" + paramParts[0];
                }
                return(
                    <Redirect to={r} />
                )
            } else {
                return(
                    <Redirect to="/profile" />
                )
            }
        }

        let registerClass = "register flex-col flex-stretch";
        if(this.state.showFilter) registerClass += " show-filter";

        return(
            <div className="login-outer">
                <div className="login-inner">
                    <div className="login-backdrop"></div>
                    <div className="modal login-modal flex-row flex-stretch">
                        <div className="login flex-col flex-stretch">
                            <div className="modal-header login-header">
                                Login
                            </div>
                            <div className="login-input-container flex-col flex-stretch">
                                
                                <div className="input-label">Email</div>
                                <InputItem 
                                    value={this.state.login.email} 
                                    maxLength={200}
                                    name={"email"}
                                    updateValue={this.updateLoginValues} />

                                <div className="input-label">Password</div>
                                <PasswordItem 
                                    value={this.state.login.password}
                                    maxLength={200}
                                    name={"password"}
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
                            <div className="reset-link">
                                <Link to="/resetPassword">
                                    Forgot Password    
                                </Link>
                            </div>
                            <div className="login-error">
                                {this.state.error.login}
                            </div>
                        </div>
                        <div className={registerClass}>
                            <div className="modal-header register-header">
                                Register
                            </div>
                            <div className="login-input-container flex-col flex-stretch">
                                
                                <div className="input-label">Email Address</div>
                                <InputItem 
                                    value={this.state.register.email} 
                                    maxLength={250} 
                                    name={"email"}
                                    updateValue={this.updateRegisterValues} />

                                <div className="input-label">Username</div>
                                <InputItem 
                                    value={this.state.register.username}
                                    maxLength={50}
                                    name={"username"}
                                    updateValue={this.updateRegisterValues} />

                                <div className="input-label">Password</div>
                                <PasswordItem
                                    value={this.state.register.password} 
                                    maxLength={200}
                                    name={"password"}
                                    updateValue={this.updateRegisterValues} />

                                <div className="input-label">Confirm Password</div>
                                <PasswordItem
                                    value={this.state.register.passwordConfirm} 
                                    maxLength={200}
                                    name={"passwordConfirm"}
                                    updateValue={this.updateRegisterValues} />

                            </div>
                            <div className="login-submit-container center-child">
                                <Button
                                    className="inverse"
                                    onClick={() => this.toggleFilterPane()}>
                                    REGISTER
                                </Button>
                            </div>
                                <div className="placeholder-link">
                                    <Link to="/login">
                                        you can't see me
                                    </Link>
                                </div>
                            <div className="login-error">
                            </div>

                            <div className="register-filter">
                                <div className="register-filter-inner center-child">
                                    <div className="input-label">ogey</div>
                                    <InputItem 
                                        value={this.state.filter.ogey}
                                        maxLength={50}
                                        name={"ogey"}
                                        updateValue={this.updateFilterValues} />
                                    <div className="input-label">abayo</div>
                                    <InputItem 
                                        value={this.state.filter.abayo}
                                        maxLength={50}
                                        name={"abayo"}
                                        updateValue={this.updateFilterValues} />
                                    <div className="input-label">towa...</div>
                                    <InputItem 
                                        value={this.state.filter.towa}
                                        maxLength={50}
                                        name={"towa"}
                                        updateValue={this.updateFilterValues} />

                                    <div className="login-submit-container center-child">
                                        <Button
                                            className="inverse"
                                            onClick={this.register}>
                                            GO
                                        </Button>
                                    </div>
                                    
                                    <div className="login-error">
                                        {this.state.error.register}
                                    </div>

                                    <div 
                                        className="hide-filter-pane center-child"
                                        onClick={() => this.toggleFilterPane()}>
                                        <IoMdArrowDropupCircle />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const Login = connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginBind);

export default Login;
