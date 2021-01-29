/*
    Query selector
 */
const select = (selector, all = false) => {
    return (all) ? document.querySelectorAll(selector) : document.querySelector(selector);
};

/*
    Start game
 */
$('.form__btn[name="start"]').click(function (e) {
    e.preventDefault();

    let name = $('.form__input[name="name"]').val();
    if (name === "") {
        $('.alert__message').text('Имя должно быть заполнено!');
        $('.alert__message').removeClass('hidden');
    } else {
        playerStats.name = name;
        playerStats.hp = 100;
        playerStats.points = 0;

        if (playerStats.character === 1) {
            $('.character__img').attr({
                src: sprites.im_profile,
            });
        } else {
            $('.character__img').attr({
                src: sprites.ca_profile,
            });
        }

        $('.player__name').text(playerStats.name);
        $('.points').text(playerStats.points);

        $('.blur').addClass('hidden');
        $('.start-screen').addClass('hidden');

        game();
    }
});

/*
    Controls
 */
const controls = () => {
    document.body.addEventListener('keydown', (e) => {
        console.log(e.keyCode);

        switch (e.keyCode) {
            case 39: // right
                playerRun.status = true;
                playerRun.right = true;
                break;
            case 37: // left
                playerRun.status = true;
                playerRun.right = false;
                break;
            case 38: // jump
                if (playerStats.pos.y === 0) playerJump.status = true;
                break;
            case 32: // attack
                attack();
                break;
        }
    });

    document.body.addEventListener('keyup', (e) => {
        switch (e.keyCode) {
            case 39: // right
                playerRun.status = false;
                break;
            case 37: // left
                playerRun.status = false;
                break;
        }
    });
};

/*
    Intervals
 */
const startIntervals = () => {
    intervals.player.run = setInterval(() => {
        if (playerRun.status) {
            if (playerRun.right) {
                player.style.backgroundImage = `url(${playerStats.sprites.right})`;

                if (playerStats.pos.x >= gameZoneStats.center) {
                    bgPos -= playerRun.step;
                    document.body.style.backgroundPositionX = `${bgPos}px`;
                } else {
                    playerStats.pos.x += playerRun.step;
                    player.style.left = `${playerStats.pos.x}px`;
                }
            } else {
                player.style.backgroundImage = `url(${playerStats.sprites.left})`;

                if (playerStats.pos.x > 0) {
                    playerStats.pos.x -= playerRun.step;
                    player.style.left = `${playerStats.pos.x}px`;
                }
            }
        }
    }, fps);
    intervals.player.sprite = setInterval(() => {
        if (playerRun.status) {
            if (playerRun.right) {
                playerStats.sprites.pos -= playerStats.width;
                player.style.backgroundPositionX = `${playerStats.sprites.pos}px`;

                playerStats.sprites.pos = (playerStats.sprites.pos < -512) ? 0 : playerStats.sprites.pos;
            } else {
                playerStats.sprites.pos += playerStats.width;
                player.style.backgroundPositionX = `${playerStats.sprites.pos}px`;

                playerStats.sprites.pos = (playerStats.sprites.pos > 512) ? 0 : playerStats.sprites.pos;
            }
        }
    }, 200);
    intervals.player.jump = setInterval(() => {
        if (playerJump.status) {
            if (playerStats.pos.y > playerJump.finalPos) {
                playerStats.pos.y -= playerJump.speed;
                player.style.top = `${playerStats.pos.y}px`;
            } else playerJump.status = false;
        } else {
            if (playerStats.pos.y < 0) {
                playerStats.pos.y += playerJump.speed;
                player.style.top = `${playerStats.pos.y}px`;
            }
        }
    }, fps);
    intervals.player.bullets = setInterval(() => {
        let bullets = select('.bullet', true);

        bullets.forEach((bullet) => {
            bullet.style.left = `${bullet.getBoundingClientRect().left - playerWeapon.speed}px`;
        });
    }, fps);


    intervals.timer = setInterval(() => {
        timer.seconds ++;

        if (timer.seconds >= 60) {
            timer.minutes ++;
            timer.seconds = 0;
        }

        if (timer.seconds < 10) {
            $('.seconds').text(`0${timer.seconds}`);
        } else {
            $('.seconds').text(`${timer.seconds}`);
        }

        if (timer.minutes < 10) {
            $('.minutes').text(`0${timer.minutes}`);
        } else {
            $('.minutes').text(`${timer.minutes}`);
        }
    }, 1000);
};

/*
    Attack
 */
const attack = () => {
    if (playerStats.character === 1) {
        gameZone.innerHTML += `<div 
            class="bullet impulse" 
            style="background-image: url(${playerWeapon.sprite}); top: ${playerStats.pos.y + (playerStats.height / 2 - 10)}px;left: ${playerStats.pos.x + (playerStats.width / 2)}px;width:${playerWeapon.width}px;height: ${playerWeapon.height}px"></div>`;
    } else {
        gameZone.innerHTML += `<div class="bullet shield"
            style="background-image: url(${playerWeapon.sprite}); top: ${playerStats.pos.y + (playerStats.height / 2 - 10)}px;left: ${playerStats.pos.x + (playerStats.width / 2)}px;width:${playerWeapon.width}px;height: ${playerWeapon.height}px"></div>`;
    }

    player = select('.player');
};

/*
    Initialization
 */
const init = () => {
    playerStats.sprites.left = (playerStats.character === 1) ? sprites.im_left : sprites.ca_left;
    playerStats.sprites.right = (playerStats.character === 1) ? sprites.im_right : sprites.ca_right;

    playerWeapon.sprite = (playerStats.character === 1) ? sprites.impulse : sprites.shield;
    playerWeapon.type = (playerStats.character === 1) ? 'impulse' : 'shield';
    playerWeapon.width = (playerStats.character === 1) ? 44 : 64;
    playerWeapon.height = (playerStats.character === 1) ? 24: 64;

    gameZone.innerHTML += `<div class="player"></div>`;

    player = select('.player');
    player.style.backgroundImage = `url(${playerStats.sprites.right})`;
    player.style.width = `${playerStats.width}px`;

    playerJump.finalPos = playerStats.pos.y - playerJump.height;

    gameZoneStats.center = gameZoneStats.width / 2;
};

/*
    Global game function
 */
const game = () => {
    init();
    controls();
    startIntervals();
};

/*
    All sprites
 */
const sprites = {
    im_left: "assets/img/sprites/iron-man_left.png",
    im_right: "assets/img/sprites/iron-man_right.png",
    im_profile: "assets/img/sprites/iron-man_profile.png",
    impulse: "assets/img/sprites/impulse.png",
    ca_left: "assets/img/sprites/captain-america_left.png",
    ca_right: "assets/img/sprites/captain-america_right.png",
    ca_profile: "assets/img/sprites/captain-america_profile.png",
    shield: "assets/img/sprites/shield.png",
};

/*
    All params, options
 */
let player,
    playerStats = {
        width: 512 / 4,
        height: 180,
        sprites: {
            left: '',
            right: '',
            pos: 0
        },
        pos: {
            x: 0,
            y: 0
        },
        character: 1, // 1 - Iron Man, 2 - Captain America
        name: '',
        points: 0,
        hp: 100
    },
    playerRun = {
        status: false,
        right: true,
        step: 7
    },
    playerJump = {
        status: false,
        height: 200,
        finalPos: 0,
        speed: 15
    },
    playerWeapon = {
        type: 'impulse',
        sprite: '',
        speed: '',
        width: 0,
        height: 0
    },
    gameZone = select('.game-zone'),
    gameZoneStats = {
        width: gameZone.getBoundingClientRect().width,
        center: 0
    },
    timer = {
        minutes: 0,
        seconds: 0
    },
    intervals = {
        player: {
            run: '',
            jump: '',
            sprite: '',
            bullets: ''
        },
        timer: ''
    },
    bgPos = 0,
    fps = 1000 / 60;

/*
    Character picker
 */
$('.character.im').click(function () {
    playerStats.character = 1;

    $('.character.ca').removeClass('picked');
    $(this).addClass('picked');

    $('.start-screen hr').removeClass('ca');
    $('.start-screen hr').addClass('im');

    $('.form__input').removeClass('ca');
    $('.form__input').addClass('im');

    $('.form__btn').removeClass('ca');
    $('.form__btn').addClass('im');
});
$('.character.ca').click(function () {
    playerStats.character = 2;

    $('.character.im').removeClass('picked');
    $(this).addClass('picked');

    $('.start-screen hr').removeClass('im');
    $('.start-screen hr').addClass('ca');

    $('.form__input').removeClass('im');
    $('.form__input').addClass('ca');

    $('.form__btn').removeClass('im');
    $('.form__btn').addClass('ca');
});

//game();