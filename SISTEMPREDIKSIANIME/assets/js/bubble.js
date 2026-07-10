/*====================================================

Anime Recommendation System
Bubble Engine
Version 1.0

====================================================*/

"use strict";

/*====================================================

CONFIGURATION

====================================================*/

const BubbleConfig = {

    desktopCount: 80,

    tabletCount: 55,

    mobileCount: 35,

    minSize: 12,

    maxSize: 110,

    minDuration: 10,

    maxDuration: 26,

    minDelay: 0,

    maxDelay: 18,

    glowChance: 0.18,

    blurChance: 0.30,

    opacityMin: 0.20,

    opacityMax: 0.80,

    swayDistance: 40,

    zIndex: -1

};


/*====================================================

UTILITIES

====================================================*/

const BubbleUtils = {

    random(min, max){

        return Math.random() * (max - min) + min;

    },

    randomInt(min, max){

        return Math.floor(

            Math.random() * (max - min + 1)

        ) + min;

    },

    chance(percent){

        return Math.random() < percent;

    },

    clamp(value, min, max){

        return Math.min(

            Math.max(value, min),

            max

        );

    }

};


/*====================================================

BUBBLE CLASS

====================================================*/

class Bubble{

    constructor(container){

        this.container = container;

        this.element = document.createElement("div");

        this.initialize();

    }


    initialize(){

        this.randomize();

        this.applyStyle();

        this.container.appendChild(this.element);

    }


    randomize(){

        this.size = BubbleUtils.random(

            BubbleConfig.minSize,

            BubbleConfig.maxSize

        );

        this.left = BubbleUtils.random(0,100);

        this.duration = BubbleUtils.random(

            BubbleConfig.minDuration,

            BubbleConfig.maxDuration

        );

        this.delay = BubbleUtils.random(

            BubbleConfig.minDelay,

            BubbleConfig.maxDelay

        );

        this.opacity = BubbleUtils.random(

            BubbleConfig.opacityMin,

            BubbleConfig.opacityMax

        );

        this.glow = BubbleUtils.chance(

            BubbleConfig.glowChance

        );

        this.blur = BubbleUtils.chance(

            BubbleConfig.blurChance

        );

        this.direction = BubbleUtils.chance(.5)

            ? 1

            : -1;

    }


    applyStyle(){

        this.element.className = "bubble";

        this.element.style.width =

            `${this.size}px`;

        this.element.style.height =

            `${this.size}px`;

        this.element.style.left =

            `${this.left}%`;

        this.element.style.opacity =

            this.opacity;

        this.element.style.animationDuration =

            `${this.duration}s`;

        this.element.style.animationDelay =

            `-${this.delay}s`;

        this.element.style.zIndex =

            BubbleConfig.zIndex;

        if(this.glow){

            this.element.classList.add(

                "bubble-glow"

            );

        }

        if(this.blur){

            this.element.classList.add(

                "depth-1"

            );

        }else{

            this.element.classList.add(

                "depth-3"

            );

        }

        if(this.size < 20){

            this.element.classList.add(

                "bubble-xs"

            );

        }

        else if(this.size < 35){

            this.element.classList.add(

                "bubble-sm"

            );

        }

        else if(this.size < 60){

            this.element.classList.add(

                "bubble-md"

            );

        }

        else if(this.size < 90){

            this.element.classList.add(

                "bubble-lg"

            );

        }

        else{

            this.element.classList.add(

                "bubble-xl"

            );

        }

    }

}

/*====================================================

BUBBLE GENERATOR

====================================================*/

class BubbleGenerator{

    constructor(){

        this.container = null;

        this.bubbles = [];

        this.total = this.getBubbleCount();

    }


    /*==============================================

    CREATE CONTAINER

    ==============================================*/

    createContainer(){

        let container = document.querySelector(".bubble-container");

        if(!container){

            container = document.createElement("div");

            container.className = "bubble-container";

            document.body.appendChild(container);

        }

        this.container = container;

    }


    /*==============================================

    DEVICE DETECTION

    ==============================================*/

    getBubbleCount(){

        const width = window.innerWidth;

        if(width <= 768){

            return BubbleConfig.mobileCount;

        }

        if(width <= 1200){

            return BubbleConfig.tabletCount;

        }

        return BubbleConfig.desktopCount;

    }


    /*==============================================

    CREATE BUBBLES

    ==============================================*/

    generate(){

        this.createContainer();

        this.clear();

        this.total = this.getBubbleCount();

        for(let i = 0; i < this.total; i++){

            const bubble = new Bubble(this.container);

            this.randomPosition(bubble, i);

            this.bubbles.push(bubble);

        }

    }


    /*==============================================

    RANDOM POSITION

    ==============================================*/

    randomPosition(bubble, index){

        bubble.element.style.left =
            `${BubbleUtils.random(0,100)}%`;

        bubble.element.style.bottom =
            `${BubbleUtils.random(-250,-20)}px`;

        bubble.element.style.animationDelay =
            `-${BubbleUtils.random(0,25)}s`;

        bubble.element.style.animationDuration =
            `${BubbleUtils.random(
                BubbleConfig.minDuration,
                BubbleConfig.maxDuration
            )}s`;

        bubble.element.dataset.index = index;

    }


    /*==============================================

    CLEAR

    ==============================================*/

    clear(){

        if(!this.container) return;

        this.container.innerHTML = "";

        this.bubbles = [];

    }


    /*==============================================

    REBUILD

    ==============================================*/

    rebuild(){

        this.generate();

    }


    /*==============================================

    RANDOMIZE AGAIN

    ==============================================*/

    randomizeAll(){

        this.bubbles.forEach((bubble,index)=>{

            bubble.randomize();

            bubble.applyStyle();

            this.randomPosition(bubble,index);

        });

    }


    /*==============================================

    GET RANDOM BUBBLE

    ==============================================*/

    getRandomBubble(){

        if(this.bubbles.length === 0){

            return null;

        }

        return this.bubbles[

            BubbleUtils.randomInt(

                0,

                this.bubbles.length-1

            )

        ];

    }

}


/*====================================================

INITIAL INSTANCE

====================================================*/

const BubbleEngine = new BubbleGenerator();

/*====================================================

ANIMATION ENGINE

====================================================*/

class BubbleAnimation{

    constructor(generator){

        this.generator = generator;

        this.animationId = null;

        this.running = false;

        this.lastTime = performance.now();

        this.delta = 0;

    }

    /*==============================================

    START

    ==============================================*/

    start(){

        if(this.running) return;

        this.running = true;

        this.lastTime = performance.now();

        this.animate();

    }

    /*==============================================

    STOP

    ==============================================*/

    stop(){

        this.running = false;

        cancelAnimationFrame(this.animationId);

    }

    /*==============================================

    MAIN LOOP

    ==============================================*/

    animate = (time = performance.now()) => {

        if(!this.running) return;

        this.delta = time - this.lastTime;

        this.lastTime = time;

        this.update();

        this.animationId = requestAnimationFrame(this.animate);

    }

    /*==============================================

    UPDATE

    ==============================================*/

    update(){

        this.generator.bubbles.forEach((bubble)=>{

            this.moveBubble(bubble);

            this.checkRespawn(bubble);

        });

    }

    /*==============================================

    MOVE BUBBLE

    ==============================================*/

    moveBubble(bubble){

        const el = bubble.element;

        let y = parseFloat(

            el.dataset.y || 0

        );

        let x = parseFloat(

            el.dataset.x || bubble.left

        );

        let angle = parseFloat(

            el.dataset.angle || BubbleUtils.random(0,360)

        );

        y += 0.35;

        angle += 0.03;

        const sway =

            Math.sin(angle)

            * BubbleConfig.swayDistance;

        el.style.transform =

            `translate(${sway}px,-${y}px)`;

        el.dataset.y = y;

        el.dataset.angle = angle;

        el.dataset.x = x;

    }

    /*==============================================

    AUTO RESPAWN

    ==============================================*/

    checkRespawn(bubble){

        const limit =

            window.innerHeight +

            bubble.size +

            300;

        const y =

            parseFloat(

                bubble.element.dataset.y || 0

            );

        if(y > limit){

            this.respawn(bubble);

        }

    }

    /*==============================================

    RESPAWN

    ==============================================*/

    respawn(bubble){

        bubble.randomize();

        bubble.applyStyle();

        bubble.element.style.left =

            `${BubbleUtils.random(0,100)}%`;

        bubble.element.style.bottom =

            `${BubbleUtils.random(-250,-80)}px`;

        bubble.element.dataset.y = 0;

        bubble.element.dataset.angle =

            BubbleUtils.random(0,360);

    }

}


/*====================================================

CREATE ENGINE

====================================================*/

const BubbleAnimator =

new BubbleAnimation(

    BubbleEngine

);

/*====================================================

BUBBLE VISUAL ENGINE
PART 4

Glow
Depth
Performance
Random Style

====================================================*/

class BubbleVisualEngine{

    constructor(generator){

        this.generator = generator;

    }

    /*==============================================

    APPLY VISUAL

    ==============================================*/

    apply(bubble){

        this.resetClass(bubble);

        this.applyDepth(bubble);

        this.applyGlow(bubble);

        this.applyOpacity(bubble);

        this.applyBlur(bubble);

        this.applyShadow(bubble);

    }

    /*==============================================

    RESET CLASS

    ==============================================*/

    resetClass(bubble){

        bubble.element.className = "bubble";

    }

    /*==============================================

    DEPTH

    ==============================================*/

    applyDepth(bubble){

        const depth = BubbleUtils.randomInt(1,4);

        bubble.element.classList.add(

            `depth-${depth}`

        );

        bubble.depth = depth;

    }

    /*==============================================

    GLOW

    ==============================================*/

    applyGlow(bubble){

        if(BubbleUtils.chance(

            BubbleConfig.glowChance

        )){

            bubble.element.classList.add(

                "bubble-glow"

            );

        }

        if(BubbleUtils.chance(.08)){

            bubble.element.classList.add(

                "bubble-neon"

            );

        }

    }

    /*==============================================

    OPACITY

    ==============================================*/

    applyOpacity(bubble){

        bubble.element.style.opacity =

            BubbleUtils.random(

                BubbleConfig.opacityMin,

                BubbleConfig.opacityMax

            );

    }

    /*==============================================

    BLUR

    ==============================================*/

    applyBlur(bubble){

        if(BubbleUtils.chance(

            BubbleConfig.blurChance

        )){

            bubble.element.style.filter =

                "blur(3px)";

        }else{

            bubble.element.style.filter =

                "blur(0px)";

        }

    }

    /*==============================================

    SHADOW

    ==============================================*/

    applyShadow(bubble){

        if(BubbleUtils.chance(.30)){

            bubble.element.classList.add(

                "bubble-shadow"

            );

        }

    }

    /*==============================================

    RANDOMIZE VISUAL

    ==============================================*/

    randomize(){

        this.generator.bubbles.forEach(

            bubble=>{

                this.apply(bubble);

            }

        );

    }

}



/*====================================================

PERFORMANCE ENGINE

====================================================*/

class BubblePerformance{

    constructor(generator){

        this.generator = generator;

    }

    /*==============================================

    FPS CHECK

    ==============================================*/

    optimize(){

        const width = window.innerWidth;

        if(width < 768){

            this.reduceEffects();

        }

    }

    /*==============================================

    MOBILE EFFECT

    ==============================================*/

    reduceEffects(){

        this.generator.bubbles.forEach(

            bubble=>{

                bubble.element.style.filter =

                    "none";

                bubble.element.style.boxShadow =

                    "none";

            }

        );

    }

    /*==============================================

    RANDOM CLEANUP

    ==============================================*/

    cleanup(){

        this.generator.bubbles.forEach(

            bubble=>{

                bubble.element.style.willChange =

                    "transform";

            }

        );

    }

}



/*====================================================

CREATE INSTANCES

====================================================*/

const BubbleVisual =

new BubbleVisualEngine(

    BubbleEngine

);

const BubbleOptimizer =

new BubblePerformance(

    BubbleEngine

);

/*====================================================

BUBBLE LIFECYCLE ENGINE
PART 5

Resize
Visibility API
Orientation
Memory Optimization

====================================================*/

class BubbleLifecycle{

    constructor(generator, animator){

        this.generator = generator;
        this.animator = animator;

        this.resizeTimer = null;

        this.initialize();

    }

    /*==============================================

    INITIALIZE

    ==============================================*/

    initialize(){

        this.handleResize();

        this.handleVisibility();

        this.handleOrientation();

        this.handleFocus();

    }

    /*==============================================

    WINDOW RESIZE

    ==============================================*/

    handleResize(){

        window.addEventListener("resize",()=>{

            clearTimeout(this.resizeTimer);

            this.resizeTimer = setTimeout(()=>{

                this.generator.rebuild();

                BubbleVisual.randomize();

                BubbleOptimizer.optimize();

            },300);

        });

    }

    /*==============================================

    PAGE VISIBILITY

    ==============================================*/

    handleVisibility(){

        document.addEventListener(

            "visibilitychange",

            ()=>{

                if(document.hidden){

                    this.animator.stop();

                }else{

                    this.animator.start();

                }

            }

        );

    }

    /*==============================================

    WINDOW FOCUS

    ==============================================*/

    handleFocus(){

        window.addEventListener("blur",()=>{

            this.animator.stop();

        });

        window.addEventListener("focus",()=>{

            this.animator.start();

        });

    }

    /*==============================================

    DEVICE ORIENTATION

    ==============================================*/

    handleOrientation(){

        window.addEventListener(

            "orientationchange",

            ()=>{

                setTimeout(()=>{

                    this.generator.rebuild();

                    BubbleVisual.randomize();

                },250);

            }

        );

    }

    /*==============================================

    LOW MEMORY MODE

    ==============================================*/

    enableLowMemory(){

        this.generator.bubbles.forEach(

            bubble=>{

                bubble.element.style.filter="none";

                bubble.element.style.boxShadow="none";

                bubble.element.style.backdropFilter="none";

            }

        );

    }

    /*==============================================

    RESTORE EFFECT

    ==============================================*/

    restoreEffects(){

        BubbleVisual.randomize();

    }

}


/*====================================================

PUBLIC CONTROLLER

====================================================*/

class BubbleController{

    constructor(generator,animator){

        this.generator = generator;

        this.animator = animator;

    }

    start(){

        this.generator.generate();

        BubbleVisual.randomize();

        BubbleOptimizer.optimize();

        BubbleOptimizer.cleanup();

        this.animator.start();

    }

    stop(){

        this.animator.stop();

    }

    restart(){

        this.stop();

        this.generator.rebuild();

        BubbleVisual.randomize();

        this.animator.start();

    }

    destroy(){

        this.stop();

        this.generator.clear();

    }

    pause(){

        this.animator.stop();

    }

    resume(){

        this.animator.start();

    }

}


/*====================================================

CREATE LIFECYCLE

====================================================*/

const BubbleLife =

new BubbleLifecycle(

    BubbleEngine,

    BubbleAnimator

);


const BubbleSystem =

new BubbleController(

    BubbleEngine,

    BubbleAnimator

);

/*====================================================

BUBBLE ENGINE
PART 6

Auto Initialize
Developer API
Debug
Destroy
Restart

====================================================*/


/*==============================================

DEVELOPER API

==============================================*/

BubbleSystem.version = "1.0.0";

BubbleSystem.author = "Anime Recommendation System";

BubbleSystem.debug = false;


/*==============================================

GET INFO

==============================================*/

BubbleSystem.info = function(){

    return{

        version: this.version,

        bubbles: this.generator.bubbles.length,

        screenWidth: window.innerWidth,

        screenHeight: window.innerHeight,

        running: this.animator.running

    };

};


/*==============================================

ENABLE DEBUG

==============================================*/

BubbleSystem.enableDebug = function(){

    this.debug = true;

    console.log("========== Bubble Engine ==========");

    console.table(this.info());

};


/*==============================================

DISABLE DEBUG

==============================================*/

BubbleSystem.disableDebug = function(){

    this.debug = false;

};


/*==============================================

ADD BUBBLE

==============================================*/

BubbleSystem.addBubble = function(){

    const bubble = new Bubble(this.generator.container);

    this.generator.randomPosition(

        bubble,

        this.generator.bubbles.length

    );

    BubbleVisual.apply(bubble);

    this.generator.bubbles.push(bubble);

};


/*==============================================

REMOVE LAST BUBBLE

==============================================*/

BubbleSystem.removeBubble = function(){

    if(this.generator.bubbles.length===0){

        return;

    }

    const bubble =

        this.generator.bubbles.pop();

    bubble.element.remove();

};


/*==============================================

SET AMOUNT

==============================================*/

BubbleSystem.setAmount = function(amount){

    BubbleConfig.desktopCount = amount;

    this.restart();

};


/*==============================================

RESET

==============================================*/

BubbleSystem.reset = function(){

    this.destroy();

    this.start();

};


/*==============================================

AUTO START

==============================================*/

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        BubbleSystem.start();

    }

);


/*==============================================

WINDOW API

==============================================*/

window.BubbleSystem = BubbleSystem;


/*==============================================

EXPORT

==============================================*/

if(typeof module !== "undefined"){

    module.exports = BubbleSystem;

}


/*====================================================

END OF FILE

assets/js/bubble.js

====================================================*/