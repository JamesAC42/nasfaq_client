import React, {Component} from 'react';
import {connect} from 'react-redux';

import snowflake1 from '../../../images/snowflakes/snowflake-1.png';
import snowflake2 from '../../../images/snowflakes/snowflake-2.png';
import snowflake3 from '../../../images/snowflakes/snowflake-3.png';
import snowflake4 from '../../../images/snowflakes/snowflake-4.png';
import snowflake5 from '../../../images/snowflakes/snowflake-5.png';

const mapStateToProps = (state:any) => ({
    snowfall: state.snowfall
})

interface SnowflakeSprite {
    image:number,
    x:number,
    y:number,
    amplitude:number,
    period:number,
    distance:number
}

interface SnowfallProps {
    snowfall: {
        snowSize:number,
        snowSpeed:number,
        snowAmount:number
    }
}

class SnowfallBind extends Component<SnowfallProps> {

    canvasref:any;
    snowflakes:Array<any>;
    snowflakeImages:Array<any>;
    fallingFlakes:Array<SnowflakeSprite>;
    ctx:any;
    animRef:any;
    constructor(props:any) {
        super(props);
        this.canvasref = React.createRef();
        this.snowflakes = [
            snowflake1,
            snowflake2,
            snowflake3,
            snowflake4,
            snowflake5
        ];
        
        this.snowflakeImages = []
        this.snowflakes.forEach((sf:any) => {
            const snowflakeimg = new Image();
            snowflakeimg.src = sf;
            this.snowflakeImages.push(snowflakeimg);
        })

        this.fallingFlakes = [];
        
    }
    componentDidUpdate(prevProps:SnowfallProps) {
        if(
            this.props.snowfall.snowAmount !== prevProps.snowfall.snowAmount ||
            this.props.snowfall.snowSize !== prevProps.snowfall.snowSize ||
            this.props.snowfall.snowSpeed !== prevProps.snowfall.snowSpeed) {
            
            window.cancelAnimationFrame(this.animRef);
            if(this.props.snowfall.snowAmount > 0) {
                this.animRef = window.requestAnimationFrame(this.renderSnow);
            } else {
                this.fallingFlakes = [];
                this.ctx.clearRect(0, 0, this.canvasref.current.width, this.canvasref.current.height);
            }
        }
    }
    renderSnow = () => {

        let canvasWidth = this.canvasref.current.width;
        let canvasHeight = this.canvasref.current.height;

        let snowflakeAmt = this.props.snowfall.snowAmount * 1000;

        if(this.fallingFlakes.length < snowflakeAmt) {
            for(let i = 0; i < snowflakeAmt - this.fallingFlakes.length; i++) {
                let d = Math.random();
                if(d > 0.7) {
                    const newFlake:SnowflakeSprite = {
                        image: Math.floor(Math.random() * this.snowflakeImages.length),
                        x: Math.floor(Math.random() * canvasWidth),
                        y: -50,
                        period: Math.floor(Math.random() * 100) + 250,
                        amplitude: Math.floor(Math.random() * 10),
                        distance: Math.random()
                    }
                    this.fallingFlakes.push(newFlake);
                }
            }
        }

        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        for(let i = 0; i < this.fallingFlakes.length; i++) {

            let flake = this.fallingFlakes[i];
            let size = ((flake.distance) * 20) + (this.props.snowfall.snowSize * 30);
            let speed = (flake.distance * 2) + (this.props.snowfall.snowSpeed * 1.3);

            let period = (1 - flake.distance) * flake.period + 100;
            let amplitude = flake.distance * flake.amplitude;
            let xTransform = Math.sin(((flake.y % period) / period) * 2 * Math.PI) * amplitude;

            this.ctx.drawImage(this.snowflakeImages[flake.image], flake.x + xTransform, flake.y, size, size);
            flake.y += speed;

            if(flake.y > canvasHeight + size) {
                this.fallingFlakes.splice(i, 1);
                i--;
            }
        }

        this.animRef = window.requestAnimationFrame(this.renderSnow);

    }
    componentDidMount() {
        this.ctx = this.canvasref.current.getContext('2d');
        if(this.props.snowfall.snowAmount > 0) {
            this.animRef = window.requestAnimationFrame(this.renderSnow);
        }
    }
    componentWillUnmount() {
        window.cancelAnimationFrame(this.animRef);
    }
    render() {
        return(
            <div className="snowfall-container">
                <canvas 
                    ref={this.canvasref}
                    height={window.innerHeight}
                    width={window.innerWidth}
                    style={
                        {
                            pointerEvents:'none',
                            zIndex: 100000,
                            position:'absolute',
                            top:'50%',
                            left:'50%',
                            transform:'translate(-50%, -50%)'
                        }
                    }></canvas>
            </div>
        )
    }
}

const Snowfall = connect(mapStateToProps)(SnowfallBind);

export default Snowfall;