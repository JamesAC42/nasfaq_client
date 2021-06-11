interface ILogin {
    email:string,
    password:string
}

interface IFilter {
    ogey: string,
    abayo: string,
    towa: string
}

interface IRegister {
    email:string,
    username:string,
    password:string,
    passwordConfirm:string
}

interface ILoginState {
    login:ILogin,
    register:IRegister,
    filter:IFilter,
    error: { login: string, register: string };
}

class LoginState implements ILoginState {
    login: ILogin;
    register: IRegister;
    filter:IFilter;
    showFilter:boolean;
    captchaToken:string | null;
    loggingIn:boolean;
    error: { login: string, register: string };
    constructor() {
        this.showFilter = false;
        this.captchaToken = null;
        this.login = {
            email: '',
            password: '',
        };
        this.register = {
            email: '',
            username: '',
            password: '',
            passwordConfirm: ''
        };
        this.loggingIn = false;
        this.filter = {
            ogey: '',
            abayo: '',
            towa: ''
        };
        this.error = {
            login: '',
            register: ''
        }
    }
}

export default LoginState;