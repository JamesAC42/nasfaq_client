interface IGetAuthCode {
    email:string
}

interface ILoginAdmin {
    email:string,
    password:string,
    code:string
}

interface ILoginAdminState {
    getAuthCode:IGetAuthCode,
    loginAdmin:ILoginAdmin,
    error: { authCode: string, login: string };
}

class LoginAdminState implements ILoginAdminState {
    getAuthCode:IGetAuthCode;
    loginAdmin:ILoginAdmin;
    captchaToken:string | null;
    loggingIn:boolean;
    codeResult:string;
    error: { authCode: string, login: string };
    constructor() {
        this.getAuthCode = {
            email: ''
        };
        this.loginAdmin = {
            email: '',
            password: '',
            code: ''
        };
        this.captchaToken = null;
        this.loggingIn = false;
        this.error = {
            authCode: '',
            login: ''
        };
        this.codeResult = '';
    }
}

export default LoginAdminState;