/*====================================================

Anime Recommendation System
Scroll Engine
Version 1.0

====================================================*/

"use strict";

/*====================================================

SCROLL CONFIGURATION

====================================================*/

const ScrollConfig = {

    smoothBehavior: true,

    heroFadeDistance: 500,

    navbarBlurPoint: 60,

    revealOffset: 120,

    backToTopOffset: 400,

    progressHeight: 4,

    animationDuration: 600

};


/*====================================================

SCROLL ENGINE

====================================================*/

class ScrollEngine{

    constructor(){

        this.scrollY = window.scrollY;

        this.lastScrollY = window.scrollY;

        this.ticking = false;

        this.initialize();

    }

    /*==============================================

    INITIALIZE

    ==============================================*/

    initialize(){

        this.enableSmoothScroll();

        this.listenScroll();

    }

    /*==============================================

    SMOOTH SCROLL

    ==============================================*/

    enableSmoothScroll(){

        if(!ScrollConfig.smoothBehavior){

            return;

        }

        document.documentElement.style.scrollBehavior =

            "smooth";

    }

    /*==============================================

    SCROLL LISTENER

    ==============================================*/

    listenScroll(){

        window.addEventListener(

            "scroll",

            ()=>{

                this.scrollY = window.scrollY;

                if(!this.ticking){

                    requestAnimationFrame(()=>{

                        this.update();

                        this.ticking = false;

                    });

                    this.ticking = true;

                }

            },

            {

                passive:true

            }

        );

    }

    /*==============================================

    UPDATE

    ==============================================*/

    update(){

        this.lastScrollY = this.scrollY;

    }

}


/*====================================================

CREATE ENGINE

====================================================*/

const ScrollSystem =

new ScrollEngine();

/*====================================================

SCROLL EFFECT ENGINE

PART 2

Navbar
Scroll Progress
Hero Fade

====================================================*/

class ScrollEffects{

    constructor(engine){

        this.engine = engine;

        this.navbar = document.querySelector(".navbar");

        this.hero = document.querySelector(".hero");

        this.progress = document.querySelector(".scroll-progress");

    }

    /*==============================================

    UPDATE

    ==============================================*/

    update(){

        this.updateNavbar();

        this.updateProgress();

        this.updateHero();

    }

    /*==============================================

    NAVBAR EFFECT

    ==============================================*/

    updateNavbar(){

        if(!this.navbar) return;

        const scroll = this.engine.scrollY;

        if(scroll > ScrollConfig.navbarBlurPoint){

            this.navbar.classList.add(

                "navbar-scrolled"

            );

        }else{

            this.navbar.classList.remove(

                "navbar-scrolled"

            );

        }

    }

    /*==============================================

    SCROLL PROGRESS

    ==============================================*/

    updateProgress(){

        if(!this.progress) return;

        const height =

            document.documentElement.scrollHeight

            -

            window.innerHeight;

        const percent =

            (this.engine.scrollY / height) * 100;

        this.progress.style.width =

            `${Math.min(percent,100)}%`;

    }

    /*==============================================

    HERO FADE

    ==============================================*/

    updateHero(){

        if(!this.hero) return;

        const distance =

            ScrollConfig.heroFadeDistance;

        const scroll =

            Math.min(

                this.engine.scrollY,

                distance

            );

        const opacity =

            1 - (scroll / distance);

        const translate =

            scroll * 0.35;

        const scale =

            1 - (scroll / 2500);

        this.hero.style.opacity =

            opacity;

        this.hero.style.transform = `

            translateY(${translate}px)

            scale(${scale})

        `;

    }

}


/*====================================================

CREATE EFFECT ENGINE

====================================================*/

const ScrollEffectsEngine =

new ScrollEffects(

    ScrollSystem

);


/*====================================================

EXTEND UPDATE

====================================================*/

ScrollSystem.previousUpdate =

ScrollSystem.update;

ScrollSystem.update = function(){

    this.previousUpdate();

    ScrollEffectsEngine.update();

};

