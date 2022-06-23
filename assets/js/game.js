function init() {
    playerStats.sprites.left = (playerStats.character === 1) ? sprites.im_left : sprites.ca_left
    playerStats.sprites.right = (playerStats.character === 1) ? sprites.im_right : sprites.ca_right

    gameZone.innerHTML += `<div class="player"></div>`

    player = select('.player')
    player.style.backgroundImage = `url(${playerStats.sprites.right})`

    gameZoneStats.center = gameZone.getBoundingClientRect().width / 2

    playerJump.finalPosition = playerStats.position.y - playerJump.height
}

function controls() {
    document.body.addEventListener('keydown', (e) => {
        console.log(e.keyCode)

        switch (e.keyCode) {
            case 37:
                playerRun.status = true
                playerRun.right = false
                break
            case 39:
                playerRun.status = true
                playerRun.right = true
                break
            case 38:
                if (playerStats.position.y === 0) playerJump.status = true
                break
        }
    })

    document.body.addEventListener('keyup', (e) => {
        switch (e.keyCode) {
            case 37:
                playerRun.status = false
                break
            case 39:
                playerRun.status = false
                break
            case 38:
                break
        }
    })
}

function startIntervals() {
    intervals.player.run = setInterval(() => {
        if (playerRun.status === true) {
            if (playerRun.right === true) {
                player.style.backgroundImage = `url(${playerStats.sprites.right})`

                if (playerStats.position.x >= gameZoneStats.center) {
                    bgPosition -= playerRun.step
                    document.body.style.backgroundPositionX = `${bgPosition}px`
                } else {
                    playerStats.position.x += playerRun.step
                    player.style.left = `${playerStats.position.x}px`
                }
            } else {
                player.style.backgroundImage = `url(${playerStats.sprites.left})`

                if (playerStats.position.x >= 0) {
                    playerStats.position.x -= playerRun.step
                    player.style.left = `${playerStats.position.x}px`
                }
            }
        }
    }, 1000 / 60)

    intervals.player.sprites = setInterval(() => {
        if (playerRun.status === true) {
            if (playerRun.right === true) {
                playerStats.sprites.pos -= playerStats.width
                player.style.backgroundPositionX = `${playerStats.sprites.pos}px`
            } else {
                playerStats.sprites.pos += playerStats.width
                player.style.backgroundPositionX = `${playerStats.sprites.pos}px`
            }
        }
    }, 200)

    intervals.player.jump = setInterval(() => {
        if (playerJump.status === true) {
            if (playerStats.position.y > playerJump.finalPosition) {
                playerStats.position.y -= playerJump.speed
                player.style.top = `${playerStats.position.y}px`
            } else playerJump.status = false
        } else {
            if (playerStats.position.y < 0) {
                playerStats.position.y += playerJump.speed
                player.style.top = `${playerStats.position.y}px`
            }
        }
    }, 1000 / 60)
}

function game() {
    init()
    controls()
    startIntervals()
}

function select(selector, all = false) {
    return (all === true) ? document.querySelectorAll(selector) : document.querySelector(selector)
}

const sprites = {
    im_left: 'assets/img/sprites/iron-man_left.png',
    im_right: 'assets/img/sprites/iron-man_right.png',
    ca_left: 'assets/img/sprites/captain-america_left.png',
    ca_right: 'assets/img/sprites/captain-america_right.png',
}

let player,
    playerStats = {
        width: 512 / 4,
        height: 180,
        sprites: {
            left: '',
            right: '',
            pos: 0,
        },
        position: {
            x: 0,
            y: 0,
        },
        character: 2, // 1 - Железный человек, 2 - Капитан Америка
        name: '',
        hp: 100,
        points: 0,
        kills: 0,
    },
    playerRun = {
        status: false,
        right: true,
        step: 5
    },
    gameZone = select('.game-zone'),
    intervals = {
        player: {
            run: '',
            sprites: '',
            jump: ''
        }
    },
    gameZoneStats = {
        center: 0
    },
    bgPosition = 0,
    playerJump = {
        status: false,
        height: 200,
        finalPosition: 0,
        speed: 20
    }

game()