interface IGetAuthCode {
    email:string
}

interface IPasswordReset {
    email:string,
    password:string,
    passwordConfirm:string,
    code:string
}

interface IPasswordResetState {
    getAuthCode:IGetAuthCode,
    passwordReset:IPasswordReset,
    error: { authCode: string, reset: string };
}

class PasswordResetState implements IPasswordResetState {
    getAuthCode:IGetAuthCode;
    passwordReset:IPasswordReset;
    captchaToken:string | null;
    resetting:boolean;
    codeResult:string;
    resetResult:string;
    redirect:boolean;
    error: { authCode: string, reset: string };
    constructor() {
        this.getAuthCode = {
            email: ''
        };
        this.passwordReset = {
            email: '',
            password: '',
            passwordConfirm:'',
            code: ''
        };
        this.redirect = false;
        this.captchaToken = null;
        this.resetting = false;
        this.error = {
            authCode: '',
            reset: ''
        };
        this.codeResult = '';
        this.resetResult = '';
    }
}

export default PasswordResetState;