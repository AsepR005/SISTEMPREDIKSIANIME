/*====================================================

Anime Recommendation System
Parallax Engine
Version 1.0

====================================================*/

"use strict";

/*====================================================

PARALLAX CONFIGURATION

====================================================*/

const ParallaxConfig = {

    enabled: true,

    intensity: 25,

    smoothness: 0.08,

    heroIntensity: 35,

    bubbleIntensity: 12,

    particleIntensity: 18,

    glowIntensity: 45,

    backgroundIntensity: 8,

    mobileBreakpoint: 768,

    useDeviceOrientation: true,

    fpsLimit: 60

};


/*====================================================

UTILITIES

====================================================*/

const ParallaxUtils = {

    clamp(value,min,max){

        return Math.min(

            Math.max(value,min),

            max

        );

    },

    lerp(start,end,amount){

        return start + (end-start) * amount;

    },

    map(value,inMin,inMax,outMin,outMax){

        return (

            (value-inMin)

            *

            (outMax-outMin)

        )

        /

        (inMax-inMin)

        +

        outMin;

    }

};


/*====================================================

MOUSE TRACKER

====================================================*/

class MouseTracker{

    constructor(){

        this.x = window.innerWidth / 2;

        this.y = window.innerHeight / 2;

        this.targetX = this.x;

        this.targetY = this.y;

        this.normalX = 0;

        this.normalY = 0;

        this.initialize();

    }

    initialize(){

        window.addEventListener(

            "mousemove",

            this.onMove.bind(this)

        );

        window.addEventListener(

            "mouseleave",

            this.reset.bind(this)

        );

    }

    onMove(event){

        this.targetX = event.clientX;

        this.targetY = event.clientY;

        this.normalX =

            (

                event.clientX

                /

                window.innerWidth

            )

            *2-1;

        this.normalY =

            (

                event.clientY

                /

                window.innerHeight

            )

            *2-1;

    }

    update(){

        this.x = ParallaxUtils.lerp(

            this.x,

            this.targetX,

            ParallaxConfig.smoothness

        );

        this.y = ParallaxUtils.lerp(

            this.y,

            this.targetY,

            ParallaxConfig.smoothness

        );

    }

    reset(){

        this.targetX =

            window.innerWidth/2;

        this.targetY =

            window.innerHeight/2;

    }

}


/*====================================================

GLOBAL TRACKER

====================================================*/

const Mouse =

new MouseTracker();

/*====================================================

PARALLAX ENGINE

PART 2

Layer Register
Animation Loop
Smooth Movement

====================================================*/

class ParallaxEngine{

    constructor(){

        this.layers = [];

        this.running = false;

        this.animationId = null;

    }

    /*==============================================

    REGISTER LAYER

    ==============================================*/

    register(selector,intensity){

        const element = document.querySelector(selector);

        if(!element) return;

        this.layers.push({

            element,

            intensity,

            currentX:0,

            currentY:0,

            targetX:0,

            targetY:0

        });

    }

    /*==============================================

    REGISTER MULTIPLE

    ==============================================*/

    registerAll(){

        this.register(

            ".hero-image",

            ParallaxConfig.heroIntensity

        );

        this.register(

            ".hero-glass-card",

            18

        );

        this.register(

            ".floating-stats",

            14

        );

        this.register(

            ".hero-glow",

            ParallaxConfig.glowIntensity

        );

        this.register(

            ".background-gradient",

            ParallaxConfig.backgroundIntensity

        );

        this.register(

            ".bubble-container",

            ParallaxConfig.bubbleIntensity

        );

        this.register(

            ".particle-container",

            ParallaxConfig.particleIntensity

        );

    }

    /*==============================================

    START

    ==============================================*/

    start(){

        if(this.running) return;

        this.running = true;

        this.animate();

    }

    /*==============================================

    STOP

    ==============================================*/

    stop(){

        this.running = false;

        cancelAnimationFrame(

            this.animationId

        );

    }

    /*==============================================

    MAIN LOOP

    ==============================================*/

    animate = ()=>{

        if(!this.running) return;

        Mouse.update();

        this.updateLayers();

        this.animationId =

        requestAnimationFrame(

            this.animate

        );

    }

    /*==============================================

    UPDATE ALL

    ==============================================*/

    updateLayers(){

        this.layers.forEach(layer=>{

            this.updateLayer(layer);

        });

    }

    /*==============================================

    UPDATE LAYER

    ==============================================*/

    updateLayer(layer){

        layer.targetX =

            Mouse.normalX

            *

            layer.intensity;

        layer.targetY =

            Mouse.normalY

            *

            layer.intensity;

        layer.currentX =

            ParallaxUtils.lerp(

                layer.currentX,

                layer.targetX,

                ParallaxConfig.smoothness

            );

        layer.currentY =

            ParallaxUtils.lerp(

                layer.currentY,

                layer.targetY,

                ParallaxConfig.smoothness

            );

        layer.element.style.transform =

            `translate3d(${layer.currentX}px, ${layer.currentY}px, 0)`;

    }

}


/*====================================================

CREATE ENGINE

====================================================*/

const Parallax =

new ParallaxEngine();

/*====================================================

PARALLAX HERO ENGINE

PART 3

Hero Image
Glass Card
Floating Stats
Smart Transform System

====================================================*/

class HeroParallax{

    constructor(engine){

        this.engine = engine;

    }

    /*==============================================

    UPDATE

    ==============================================*/

    update(){

        this.updateHeroImage();

        this.updateGlassCard();

        this.updateFloatingStats();

        this.updateHeroGlow();

    }

    /*==============================================

    HERO IMAGE

    ==============================================*/

    updateHeroImage(){

        const hero = document.querySelector(".hero-image");

        if(!hero) return;

        const rotateY = Mouse.normalX * 10;

        const rotateX = -Mouse.normalY * 8;

        const moveX = Mouse.normalX * 18;

        const moveY = Mouse.normalY * 12;

        hero.style.transform = `

            perspective(1200px)

            translate3d(${moveX}px,${moveY}px,0)

            rotateX(${rotateX}deg)

            rotateY(${rotateY}deg)

            scale(1.02)

        `;

    }

    /*==============================================

    GLASS CARD

    ==============================================*/

    updateGlassCard(){

        const card = document.querySelector(".hero-glass-card");

        if(!card) return;

        const moveX = Mouse.normalX * 12;

        const moveY = Mouse.normalY * 10;

        const rotate = Mouse.normalX * 4;

        card.style.transform = `

            translate3d(${moveX}px,${moveY}px,0)

            rotate(${rotate}deg)

        `;

    }

    /*==============================================

    FLOATING STATS

    ==============================================*/

    updateFloatingStats(){

        document

        .querySelectorAll(".floating-stat")

        .forEach((item,index)=>{

            const factor = index + 1;

            const x = Mouse.normalX * factor * 5;

            const y = Mouse.normalY * factor * 5;

            item.style.transform = `

                translate3d(${x}px,${y}px,0)

            `;

        });

    }

    /*==============================================

    HERO GLOW

    ==============================================*/

    updateHeroGlow(){

        const glow = document.querySelector(".hero-glow");

        if(!glow) return;

        const x = Mouse.normalX * 40;

        const y = Mouse.normalY * 40;

        glow.style.transform = `

            translate3d(${x}px,${y}px,0)

            scale(1.05)

        `;

    }

}


/*====================================================

SMART PARALLAX UPDATE

====================================================*/

const HeroEffects =

new HeroParallax(

    Parallax

);


/*====================================================

EXTEND ENGINE

====================================================*/

Parallax.originalUpdateLayers =

Parallax.updateLayers;

Parallax.updateLayers = function(){

    this.originalUpdateLayers();

    HeroEffects.update();

};

/*====================================================

PARALLAX BACKGROUND ENGINE

PART 4

Bubble Layer
Particle Layer
Glow Layer
Background Layer
Depth Effect

====================================================*/

class BackgroundParallax{

    constructor(){

        this.layers = [];

        this.initialize();

    }

    /*==============================================

    INITIALIZE

    ==============================================*/

    initialize(){

        this.layers = [

            {

                selector: ".background-gradient",

                intensity: 6,

                scale: 1.03

            },

            {

                selector: ".bubble-container",

                intensity: 12,

                scale: 1

            },

            {

                selector: ".particle-container",

                intensity: 18,

                scale: 1

            },

            {

                selector: ".hero-glow",

                intensity: 28,

                scale: 1.08

            },

            {

                selector: ".hero-circle",

                intensity: 22,

                scale: 1.05

            }

        ];

    }

    /*==============================================

    UPDATE

    ==============================================*/

    update(){

        this.layers.forEach(layer=>{

            this.move(layer);

        });

    }

    /*==============================================

    MOVE LAYER

    ==============================================*/

    move(layer){

        const element = document.querySelector(

            layer.selector

        );

        if(!element) return;

        const moveX =

            Mouse.normalX

            *

            layer.intensity;

        const moveY =

            Mouse.normalY

            *

            layer.intensity;

        element.style.transform = `

            translate3d(

                ${moveX}px,

                ${moveY}px,

                0

            )

            scale(${layer.scale})

        `;

    }

    /*==============================================

    RESET

    ==============================================*/

    reset(){

        this.layers.forEach(layer=>{

            const element =

            document.querySelector(

                layer.selector

            );

            if(!element) return;

            element.style.transform =

            "translate3d(0,0,0) scale(1)";

        });

    }

}


/*====================================================

DEPTH ENGINE

====================================================*/

class DepthEngine{

    constructor(){

        this.enabled = true;

    }

    update(){

        if(!this.enabled) return;

        this.depthBubble();

        this.depthParticle();

    }

    depthBubble(){

        document

        .querySelectorAll(".bubble")

        .forEach((bubble,index)=>{

            const offset =

                Math.sin(

                    performance.now()

                    *0.0006

                    + index

                ) * 4;

            bubble.style.transform +=

                ` translateY(${offset}px)`;

        });

    }

    depthParticle(){

        document

        .querySelectorAll(".particle")

        .forEach((particle,index)=>{

            const offset =

                Math.cos(

                    performance.now()

                    *0.0008

                    + index

                ) * 2;

            particle.style.transform +=

                ` translateX(${offset}px)`;

        });

    }

}


/*====================================================

CREATE INSTANCES

====================================================*/

const BackgroundEffects =

new BackgroundParallax();

const DepthEffects =

new DepthEngine();


/*====================================================

EXTEND PARALLAX UPDATE

====================================================*/

Parallax.previousUpdate =

Parallax.updateLayers;

Parallax.updateLayers = function(){

    this.previousUpdate();

    HeroEffects.update();

    BackgroundEffects.update();

    DepthEffects.update();

};

/*====================================================

PARALLAX PERFORMANCE ENGINE

PART 5

Performance
Resize
Visibility
Mobile
FPS Optimization

====================================================*/

class ParallaxPerformance{

    constructor(engine){

        this.engine = engine;

        this.resizeTimer = null;

        this.mobile = false;

        this.initialize();

    }

    /*==============================================

    INITIALIZE

    ==============================================*/

    initialize(){

        this.detectDevice();

        this.handleResize();

        this.handleVisibility();

        this.handleFocus();

    }

    /*==============================================

    DEVICE

    ==============================================*/

    detectDevice(){

        this.mobile =

            window.innerWidth <=

            ParallaxConfig.mobileBreakpoint;

    }

    /*==============================================

    RESIZE

    ==============================================*/

    handleResize(){

        window.addEventListener(

            "resize",

            ()=>{

                clearTimeout(

                    this.resizeTimer

                );

                this.resizeTimer =

                setTimeout(()=>{

                    this.detectDevice();

                    this.engine.layers=[];

                    this.engine.registerAll();

                },250);

            }

        );

    }

    /*==============================================

    VISIBILITY

    ==============================================*/

    handleVisibility(){

        document.addEventListener(

            "visibilitychange",

            ()=>{

                if(document.hidden){

                    this.engine.stop();

                }

                else{

                    this.engine.start();

                }

            }

        );

    }

    /*==============================================

    WINDOW FOCUS

    ==============================================*/

    handleFocus(){

        window.addEventListener(

            "blur",

            ()=>{

                this.engine.stop();

            }

        );

        window.addEventListener(

            "focus",

            ()=>{

                this.engine.start();

            }

        );

    }

    /*==============================================

    MOBILE MODE

    ==============================================*/

    update(){

        if(this.mobile){

            this.disableHeavyEffect();

        }

    }

    disableHeavyEffect(){

        document

        .querySelectorAll(

            ".bubble-container,.particle-container"

        )

        .forEach(el=>{

            el.style.willChange="auto";

        });

    }

    enableDesktopMode(){

        document

        .querySelectorAll(

            ".bubble-container,.particle-container"

        )

        .forEach(el=>{

            el.style.willChange="transform";

        });

    }

}


/*====================================================

FPS MONITOR

====================================================*/

class FPSMonitor{

    constructor(){

        this.lastTime=performance.now();

        this.frame=0;

        this.fps=60;

    }

    update(){

        this.frame++;

        const now=performance.now();

        if(now-this.lastTime>=1000){

            this.fps=this.frame;

            this.frame=0;

            this.lastTime=now;

        }

    }

}


/*====================================================

CREATE INSTANCES

====================================================*/

const FPS=new FPSMonitor();

const ParallaxOptimizer=

new ParallaxPerformance(

    Parallax

);


/*====================================================

EXTEND ENGINE

====================================================*/

Parallax.previousFrame=

Parallax.animate;

Parallax.animate=function(){

    if(!this.running) return;

    Mouse.update();

    FPS.update();

    ParallaxOptimizer.update();

    this.updateLayers();

    this.animationId=

    requestAnimationFrame(

        this.animate.bind(this)

    );

};

/*====================================================

PARALLAX ENGINE
PART 6

Developer API
Auto Initialize
Destroy
Restart
Debug

====================================================*/


/*==============================================

VERSION

==============================================*/

Parallax.version = "1.0.0";

Parallax.author = "Anime Recommendation System";

Parallax.debug = false;


/*==============================================

INFO

==============================================*/

Parallax.info = function(){

    return{

        version : this.version,

        layers : this.layers.length,

        running : this.running,

        fps : FPS.fps,

        screen : {

            width : window.innerWidth,

            height : window.innerHeight

        }

    };

};


/*==============================================

DEBUG

==============================================*/

Parallax.enableDebug = function(){

    this.debug = true;

    console.clear();

    console.log("========== PARALLAX ENGINE ==========");

    console.table(this.info());

};


Parallax.disableDebug = function(){

    this.debug = false;

};


/*==============================================

ENABLE

==============================================*/

Parallax.enable = function(){

    ParallaxConfig.enabled = true;

    this.start();

};


/*==============================================

DISABLE

==============================================*/

Parallax.disable = function(){

    ParallaxConfig.enabled = false;

    this.stop();

};


/*==============================================

REBUILD

==============================================*/

Parallax.rebuild = function(){

    this.layers = [];

    this.registerAll();

};


/*==============================================

RESET

==============================================*/

Parallax.reset = function(){

    this.stop();

    this.layers = [];

    this.registerAll();

    this.start();

};


/*==============================================

DESTROY

==============================================*/

Parallax.destroy = function(){

    this.stop();

    this.layers.forEach(layer=>{

        if(layer.element){

            layer.element.style.transform = "";

        }

    });

    this.layers = [];

};


/*==============================================

AUTO INITIALIZE

==============================================*/

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        if(

            window.innerWidth >

            ParallaxConfig.mobileBreakpoint

        ){

            Parallax.registerAll();

            Parallax.start();

        }

    }

);


/*==============================================

GLOBAL API

==============================================*/

window.Parallax = Parallax;


/*==============================================

EXPORT

==============================================*/

if(typeof module !== "undefined"){

    module.exports = Parallax;

}


/*====================================================

END OF FILE

assets/js/parallax.js

====================================================*/