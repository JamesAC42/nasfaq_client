import React, { Component } from 'react';
import '../../css/login.scss';
import { Redirect } from 'react-router';

import ReCAPTCHA from 'react-google-recaptcha';
import { InputItem, PasswordItem } from './InputItem';
import Button from './Button';

import PasswordResetState from './state/ResetPasswordState';
import validateEmail from '../validateEmail';

type formEvent = React.ChangeEvent<HTMLInputElement>;

class ResetPassword extends Component {

    state: PasswordResetState;
    recaptchaRef: any;
    constructor(props: any) {
        super(props);
        this.state = new PasswordResetState();
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

    updateResetValues = (a:formEvent) => {
        this.setState({
            ...this.state,
            passwordReset: {
                ...this.state.passwordReset,
                [a.target.name] : a.target.value
            }
        });
    }

    getAuthCode = () => {
        if(this.state.captchaToken === null) {
            if(this.recaptchaRef.current !== null) {
                this.setState({
                    resetting:false
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
        if(!validateEmail(this.state.getAuthCode.email)) {
            this.setState({
                ...this.state,
                error: {
                    ...this.state.error,
                    authCode: 'Invalid email address'
                }
            });
            return;
        }
        fetch('/api/sendPasswordResetCode/', {
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

    reset = () => {
        if(this.state.captchaToken === null) {
            if(this.recaptchaRef.current !== null) {
                this.setState({
                    resetting:true
                }, () => {
                    this.recaptchaRef.current.execute();
                })
                return;
            }
        }
        if(!validateEmail(this.state.passwordReset.email)) {
            this.setState({
                ...this.state,
                error: {
                    ...this.state.error,
                    reset: 'Invalid email address'
                }
            });
            return;
        }
        if(
            this.state.passwordReset.email === '' ||
            this.state.passwordReset.password === '' ||
            this.state.passwordReset.passwordConfirm === '' ||
            this.state.passwordReset.code === '') {
            this.setState({
                ...this.state,
                error: {
                    ...this.state.error,
                    reset: 'Invalid input'
                }
            });
            return;
        }
        if(this.state.passwordReset.password !==
            this.state.passwordReset.passwordConfirm) {
            this.setState({
                ...this.state,
                error: {
                    ...this.state.error,
                    reset: 'Passwords do not match'
                }
            });
            return;
        }
        if(this.state.passwordReset.password.length < 8) {
            this.setState({
                ...this.state,
                error: {
                    ...this.state.error,
                    reset: 'Password must be at least 8 characters.'
                }
            })
        }
        fetch('/api/resetPassword/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...this.state.passwordReset,
                captchaToken: this.state.captchaToken
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.setState({
                    resetResult:"Password has been changed. Redirecting...",
                    error: {
                        authCode: '',
                        reset: ''
                    }
                }, () => {
                    setTimeout(() => {
                        this.setState({
                            redirect:true
                        })
                    }, 3000);
                })
            } else {
                if(this.recaptchaRef.current !== null) {
                    this.recaptchaRef.current.reset();
                }
                this.setState({
                    ...this.state,
                    captchaToken: null,
                    error: {
                        ...this.state.error,
                        reset: data.error
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
            if(this.state.resetting) {
                this.reset();
            } else {
                this.getAuthCode();
            }
        })
    }

    render() {

        if(this.state.redirect) {
            return(
                <Redirect to="/login" />
            )
        }

        return(
            <div className="login-outer">
                <div className="login-inner login-inner-pwreset">
                    <div className="login-backdrop"></div>
                    <div className="modal login-modal flex-row flex-stretch">
                        <div className="login flex-col flex-stretch">
                            <div className="modal-header login-header">
                                Reset Password
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
                                    value={this.state.passwordReset.email} 
                                    maxLength={200}
                                    name={"email"}
                                    updateValue={this.updateResetValues} />

                                <div className="input-label">New Password</div>
                                <PasswordItem
                                    value={this.state.passwordReset.password} 
                                    maxLength={200}
                                    name={"password"}
                                    updateValue={this.updateResetValues} />
                                
                                <div className="input-label">Re-enter Password</div>
                                <PasswordItem
                                    value={this.state.passwordReset.passwordConfirm} 
                                    maxLength={200}
                                    name={"passwordConfirm"}
                                    updateValue={this.updateResetValues} />

                                <div className="input-label">Auth Code</div>
                                <InputItem 
                                    value={this.state.passwordReset.code} 
                                    maxLength={200}
                                    name={"code"}
                                    updateValue={this.updateResetValues} />

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
                                    onClick={this.reset}
                                    className="inverse">
                                        UPDATE
                                </Button>
                            </div>
                            
                            <div className="reset-result">
                                {this.state.resetResult}
                            </div>
                            <div className="reset-error">
                                {this.state.error.reset}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ResetPassword;