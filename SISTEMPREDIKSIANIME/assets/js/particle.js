/*====================================================

Anime Recommendation System
Particle Engine
Version 1.0

====================================================*/

"use strict";

/*====================================================

PARTICLE CONFIGURATION

====================================================*/

const ParticleConfig = {

    desktopCount: 90,

    tabletCount: 60,

    mobileCount: 35,

    minSize: 2,

    maxSize: 10,

    minDuration: 18,

    maxDuration: 45,

    minOpacity: 0.10,

    maxOpacity: 0.70,

    blurChance: 0.35,

    glowChance: 0.20,

    twinkleChance: 0.30,

    zIndex: -2

};


/*====================================================

UTILITIES

====================================================*/

const ParticleUtils = {

    random(min,max){

        return Math.random() * (max-min) + min;

    },

    randomInt(min,max){

        return Math.floor(

            Math.random() * (max-min+1)

        ) + min;

    },

    chance(percent){

        return Math.random() < percent;

    }

};


/*====================================================

PARTICLE CLASS

====================================================*/

class Particle{

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

        this.size = ParticleUtils.random(

            ParticleConfig.minSize,

            ParticleConfig.maxSize

        );

        this.left = ParticleUtils.random(0,100);

        this.opacity = ParticleUtils.random(

            ParticleConfig.minOpacity,

            ParticleConfig.maxOpacity

        );

        this.duration = ParticleUtils.random(

            ParticleConfig.minDuration,

            ParticleConfig.maxDuration

        );

        this.delay = ParticleUtils.random(0,20);

        this.glow = ParticleUtils.chance(

            ParticleConfig.glowChance

        );

        this.blur = ParticleUtils.chance(

            ParticleConfig.blurChance

        );

        this.twinkle = ParticleUtils.chance(

            ParticleConfig.twinkleChance

        );

    }

    applyStyle(){

        this.element.className = "particle";

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

            ParticleConfig.zIndex;

        if(this.blur){

            this.element.classList.add(

                "particle-blur"

            );

        }

        if(this.glow){

            this.element.classList.add(

                "particle-glow"

            );

        }

        if(this.twinkle){

            this.element.classList.add(

                "particle-twinkle"

            );

        }

        if(this.size <= 3){

            this.element.classList.add(

                "particle-xs"

            );

        }

        else if(this.size <= 5){

            this.element.classList.add(

                "particle-sm"

            );

        }

        else if(this.size <= 7){

            this.element.classList.add(

                "particle-md"

            );

        }

        else{

            this.element.classList.add(

                "particle-lg"

            );

        }

    }

}

/*====================================================

PARTICLE GENERATOR

====================================================*/

class ParticleGenerator{

    constructor(){

        this.container = null;
        this.particles = [];
        this.total = this.getParticleCount();

    }

    /*==============================================

    CREATE CONTAINER

    ==============================================*/

    createContainer(){

        let container = document.querySelector(".particle-container");

        if(!container){

            container = document.createElement("div");

            container.className = "particle-container";

            document.body.appendChild(container);

        }

        this.container = container;

    }

    /*==============================================

    DEVICE DETECTION

    ==============================================*/

    getParticleCount(){

        const width = window.innerWidth;

        if(width <= 768){

            return ParticleConfig.mobileCount;

        }

        if(width <= 1200){

            return ParticleConfig.tabletCount;

        }

        return ParticleConfig.desktopCount;

    }

    /*==============================================

    GENERATE PARTICLES

    ==============================================*/

    generate(){

        this.createContainer();

        this.clear();

        this.total = this.getParticleCount();

        for(let i = 0; i < this.total; i++){

            const particle = new Particle(this.container);

            this.randomPosition(particle,i);

            this.particles.push(particle);

        }

    }

    /*==============================================

    RANDOM POSITION

    ==============================================*/

    randomPosition(particle,index){

        particle.element.style.left =
            `${ParticleUtils.random(0,100)}%`;

        particle.element.style.bottom =
            `${ParticleUtils.random(-150,window.innerHeight)}px`;

        particle.element.style.animationDuration =
            `${ParticleUtils.random(
                ParticleConfig.minDuration,
                ParticleConfig.maxDuration
            )}s`;

        particle.element.style.animationDelay =
            `-${ParticleUtils.random(0,25)}s`;

        particle.element.dataset.index = index;

        particle.element.dataset.y =
            ParticleUtils.random(0,window.innerHeight);

        particle.element.dataset.angle =
            ParticleUtils.random(0,360);

    }

    /*==============================================

    CLEAR

    ==============================================*/

    clear(){

        if(!this.container) return;

        this.container.innerHTML = "";

        this.particles = [];

    }

    /*==============================================

    REBUILD

    ==============================================*/

    rebuild(){

        this.generate();

    }

    /*==============================================

    RANDOMIZE ALL

    ==============================================*/

    randomizeAll(){

        this.particles.forEach((particle,index)=>{

            particle.randomize();

            particle.applyStyle();

            this.randomPosition(particle,index);

        });

    }

    /*==============================================

    GET RANDOM PARTICLE

    ==============================================*/

    getRandomParticle(){

        if(this.particles.length === 0){

            return null;

        }

        return this.particles[
            ParticleUtils.randomInt(
                0,
                this.particles.length - 1
            )
        ];

    }

    /*==============================================

    ADD PARTICLE

    ==============================================*/

    addParticle(){

        const particle = new Particle(this.container);

        this.randomPosition(
            particle,
            this.particles.length
        );

        this.particles.push(particle);

    }

    /*==============================================

    REMOVE LAST PARTICLE

    ==============================================*/

    removeParticle(){

        if(this.particles.length === 0){

            return;

        }

        const particle = this.particles.pop();

        particle.element.remove();

    }

}


/*====================================================

CREATE ENGINE

====================================================*/

const ParticleEngine =

new ParticleGenerator();

/*====================================================

PARTICLE ANIMATION ENGINE

PART 3

Floating Motion
Twinkle
Respawn
Physics

====================================================*/

class ParticleAnimation{

    constructor(generator){

        this.generator = generator;

        this.animationId = null;

        this.running = false;

        this.lastTime = performance.now();

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

        this.lastTime = time;

        this.update();

        this.animationId = requestAnimationFrame(this.animate);

    };

    /*==============================================

    UPDATE

    ==============================================*/

    update(){

        this.generator.particles.forEach((particle)=>{

            this.move(particle);

            this.twinkle(particle);

            this.checkRespawn(particle);

        });

    }

    /*==============================================

    FLOATING MOTION

    ==============================================*/

    move(particle){

        const el = particle.element;

        let y = parseFloat(

            el.dataset.y || 0

        );

        let angle = parseFloat(

            el.dataset.angle || 0

        );

        let speed = parseFloat(

            el.dataset.speed || ParticleUtils.random(0.2,0.7)

        );

        y += speed;

        angle += 0.015;

        const sway = Math.sin(angle) * 25;

        el.style.transform =

            `translate(${sway}px,-${y}px)`;

        el.dataset.y = y;

        el.dataset.angle = angle;

        el.dataset.speed = speed;

    }

    /*==============================================

    TWINKLE EFFECT

    ==============================================*/

    twinkle(particle){

        if(!particle.twinkle) return;

        const alpha =

            0.25 +

            Math.sin(

                performance.now() * 0.002 +

                particle.left

            ) * 0.35;

        particle.element.style.opacity =

            Math.max(0.08, alpha);

    }

    /*==============================================

    AUTO RESPAWN

    ==============================================*/

    checkRespawn(particle){

        const limit =

            window.innerHeight +

            particle.size +

            120;

        const y = parseFloat(

            particle.element.dataset.y || 0

        );

        if(y > limit){

            this.respawn(particle);

        }

    }

    /*==============================================

    RESPAWN

    ==============================================*/

    respawn(particle){

        particle.randomize();

        particle.applyStyle();

        particle.element.style.left =

            `${ParticleUtils.random(0,100)}%`;

        particle.element.style.bottom =

            `${ParticleUtils.random(-120,-20)}px`;

        particle.element.dataset.y = 0;

        particle.element.dataset.angle =

            ParticleUtils.random(0,360);

        particle.element.dataset.speed =

            ParticleUtils.random(0.2,0.7);

    }

    /*==============================================

    PAUSE

    ==============================================*/

    pause(){

        this.stop();

    }

    /*==============================================

    RESUME

    ==============================================*/

    resume(){

        this.start();

    }

}


/*====================================================

CREATE ANIMATION ENGINE

====================================================*/

const ParticleAnimator =

new ParticleAnimation(

    ParticleEngine

);

/*====================================================

PARTICLE PERFORMANCE ENGINE

PART 4

Performance
Resize
Visibility API
Low Memory Mode

====================================================*/

class ParticlePerformance{

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

        this.handleFocus();

        this.handleOrientation();

    }

    /*==============================================

    WINDOW RESIZE

    ==============================================*/

    handleResize(){

        window.addEventListener("resize",()=>{

            clearTimeout(this.resizeTimer);

            this.resizeTimer = setTimeout(()=>{

                this.generator.rebuild();

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

                    this.animator.pause();

                }

                else{

                    this.animator.resume();

                }

            }

        );

    }

    /*==============================================

    WINDOW FOCUS

    ==============================================*/

    handleFocus(){

        window.addEventListener("blur",()=>{

            this.animator.pause();

        });

        window.addEventListener("focus",()=>{

            this.animator.resume();

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

                },250);

            }

        );

    }

    /*==============================================

    LOW MEMORY MODE

    ==============================================*/

    enableLowMemory(){

        this.generator.particles.forEach(

            particle=>{

                particle.element.style.filter = "none";

                particle.element.style.boxShadow = "none";

                particle.element.style.mixBlendMode = "normal";

            }

        );

    }

    /*==============================================

    RESTORE EFFECT

    ==============================================*/

    restoreEffects(){

        this.generator.randomizeAll();

    }

    /*==============================================

    FPS OPTIMIZATION

    ==============================================*/

    optimize(){

        const width = window.innerWidth;

        if(width <= 768){

            this.enableLowMemory();

        }

    }

    /*==============================================

    WILL CHANGE

    ==============================================*/

    applyPerformanceHints(){

        this.generator.particles.forEach(

            particle=>{

                particle.element.style.willChange =

                    "transform, opacity";

            }

        );

    }

}


/*====================================================

PARTICLE CONTROLLER

====================================================*/

class ParticleController{

    constructor(generator, animator){

        this.generator = generator;

        this.animator = animator;

    }

    start(){

        this.generator.generate();

        ParticleOptimizer.optimize();

        ParticleOptimizer.applyPerformanceHints();

        this.animator.start();

    }

    stop(){

        this.animator.stop();

    }

    restart(){

        this.stop();

        this.generator.rebuild();

        this.animator.start();

    }

    destroy(){

        this.stop();

        this.generator.clear();

    }

    pause(){

        this.animator.pause();

    }

    resume(){

        this.animator.resume();

    }

}


/*====================================================

CREATE INSTANCES

====================================================*/

const ParticleOptimizer =

new ParticlePerformance(

    ParticleEngine,

    ParticleAnimator

);


const ParticleSystem =

new ParticleController(

    ParticleEngine,

    ParticleAnimator

);

/*====================================================

PARTICLE ENGINE
PART 5

Developer API
Debug
Auto Initialize
Destroy
Restart

====================================================*/


/*==============================================

VERSION

==============================================*/

ParticleSystem.version = "1.0.0";

ParticleSystem.author = "Anime Recommendation System";

ParticleSystem.debug = false;


/*==============================================

INFORMATION

==============================================*/

ParticleSystem.info = function(){

    return{

        version: this.version,

        particles: this.generator.particles.length,

        width: window.innerWidth,

        height: window.innerHeight,

        running: this.animator.running

    };

};


/*==============================================

DEBUG MODE

==============================================*/

ParticleSystem.enableDebug = function(){

    this.debug = true;

    console.log("========== Particle Engine ==========");

    console.table(this.info());

};


ParticleSystem.disableDebug = function(){

    this.debug = false;

};


/*==============================================

ADD PARTICLE

==============================================*/

ParticleSystem.addParticle = function(){

    this.generator.addParticle();

};


/*==============================================

REMOVE PARTICLE

==============================================*/

ParticleSystem.removeParticle = function(){

    this.generator.removeParticle();

};


/*==============================================

SET AMOUNT

==============================================*/

ParticleSystem.setAmount = function(amount){

    ParticleConfig.desktopCount = amount;

    this.restart();

};


/*==============================================

LOW MEMORY

==============================================*/

ParticleSystem.enableLowMemory = function(){

    ParticleOptimizer.enableLowMemory();

};


ParticleSystem.restoreEffects = function(){

    ParticleOptimizer.restoreEffects();

};


/*==============================================

RESET

==============================================*/

ParticleSystem.reset = function(){

    this.destroy();

    this.start();

};


/*==============================================

AUTO START

==============================================*/

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        ParticleSystem.start();

    }

);


/*==============================================

GLOBAL API

==============================================*/

window.ParticleSystem = ParticleSystem;


/*==============================================

EXPORT

==============================================*/

if(typeof module !== "undefined"){

    module.exports = ParticleSystem;

}


/*====================================================

END OF FILE

assets/js/particle.js

====================================================*/