import React, { Component } from 'react';
import "../../css/home.scss";
import { Link } from 'react-router-dom';
import Button from './Button';

class HomeState {
    xP: number;
    yP: number;
    constructor() {
        this.xP = 0;
        this.yP = 0;
    }
}

export default class Home extends Component {

    state:HomeState;

    constructor(props:any) {
        super(props);
        this.state = new HomeState();
    }

    getPosition(e: any) {
        const xP = e.clientX / e.currentTarget.offsetWidth;
        const yP = e.clientY / e.currentTarget.offsetHeight;
        this.setState({
            xP,
            yP
        });
    }

    render() {

        const medTransformX = Math.round((1 - this.state.xP) * 80);
        const medTransformY = Math.round((1 - this.state.yP) * 100);
        const medTransformString = `translate(calc(${medTransformX}px), calc(${medTransformY}px))`;
        const lgTransformX = Math.round((1 - this.state.xP) * 250);
        const lgTransformY = Math.round((1 - this.state.yP) * 200);
        const lgTransformString = `translate(calc(${lgTransformX}px), calc(${lgTransformY}px))`;
        

        return(
            <div 
                className="container fill"
                onMouseMove={(e) => this.getPosition(e)}>
                <div 
                    className="circle circle-md"
                    style={{
                        transform:medTransformString
                    }}></div>
                <div
                    className="circle circle-lg"
                    style={{
                        transform:lgTransformString
                    }}></div>
                <div className="title-banner">
                    <div className="title-banner-inner">
                        <div className="header">
                            nasfaq
                        </div>
                        <div className="nav-buttons">
                            <Link to="/login">
                                <Button>Login</Button>
                            </Link>
                            <Link to="/market">
                                <Button>Numbers</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}