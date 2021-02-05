/*
    Получаем доступ к нужному объекту DOM по классу
  */
const select = (selector, all = false) => {
    return (all) ? document.querySelectorAll(selector) : document.querySelector(selector);
};

/*
    Получаем рандомное целое число из заданного диапазона
*/
const random = (min, max) => {
    let rand = min + Math.random() * (max - min);
    return Math.round(rand);  
};

/*
    Функция для отправки запроса к API
*/
const f = async (url, method, data = null) => {
    const API = 'http://pocket-diary.ru/api';

    let options = {
        method: method.toUpperCase(),
        mode: 'cors',
        headers: {
            'Content-Type': "application/json"
        }
    };

    if (method === "POST") options.body = data;

    let response = await fetch(`${API}${url}`, options);

    return {
        body: await response.json(),
        code: response.status
    };
};

/*
    Старт игры по нажатию на кнопку "Начать игру"
 */
$('.form__btn[name="start"]').click(function (e) {
    e.preventDefault(); // отключаем стандартное поведение формы

    let name = $('.form__input[name="name"]').val(); // получаем имя игрока из формы
    if (name === "") { // проверка заполненения имени
        $('.alert__message').text('Имя должно быть заполнено!'); // если поле пустое, выдаем ошибку
        $('.alert__message').removeClass('hidden');
    } else { // если всё ок
        playerStats.name = name; // заносим в объект с инфой об игре имя
        playerStats.hp = 100; // ставим очки здоровья по умолчанию
        playerStats.points = 0; // обнуляем счёт

        // в зависимости от выбранного персонажа меняем изображение профиля и цвет интерфейса с помощью css классов
        if (playerStats.character === 1) {
            $('.player__profile').attr({
                src: sprites.im_profile,
            });

            $('.play__btn').removeClass('ca');
            $('.play__btn').addClass('im');

            $('.end-screen hr').removeClass('ca');
            $('.end-screen hr').addClass('im');

            $('.end-points').removeClass('ca');
            $('.end-points').addClass('im');

            $('.records').removeClass('ca');
            $('.records').addClass('im');
        } else {
            $('.player__profile').attr({
                src: sprites.ca_profile,
            });

            $('.play__btn').removeClass('im');
            $('.play__btn').addClass('ca');

            $('.end-screen hr').removeClass('im');
            $('.end-screen hr').addClass('ca');

            $('.end-points').removeClass('im');
            $('.end-points').addClass('ca');

            $('.records').removeClass('im');
            $('.records').addClass('ca');
        }

        // выводим нужные данные в интерфейс
        $('.player__name').text(playerStats.name);
        $('.points').text(playerStats.points);
        $('.hp-count').text(`${playerStats.hp} HP`);
        select('.hp-line').style.width = `${playerStats.hp}%`;

        // закрываем стартовый экран
        $('.blur').addClass('hidden');
        $('.start-screen').addClass('hidden');

        game(); // начинаем игру
    }
});

/*
    Управление
 */
const controls = () => {
    // отлавливаем моменты нажатия на кнопку
    document.body.addEventListener('keydown', (e) => {
        console.log(e.keyCode);

        switch (e.keyCode) {
            case 39: // нажата стрелка вправо
                playerRun.status = true;
                playerRun.right = true;
                break;
            case 37: // нажата стрелка влево
                playerRun.status = true;
                playerRun.right = false;
                break;
            case 38: // нажата стрелка вверх
                if (playerStats.pos.y === 0) playerJump.status = true;
                break;
            case 32: // нажат пробел
                if (select('.bullet', true).length <= 1) attack();
                break;
            case 27:
                togglePause();
                break;
        }
    });

    // отлавливаем момент отпускания кнопки
    document.body.addEventListener('keyup', (e) => {
        switch (e.keyCode) {
            case 39: // отпущена стрелка вправо
                playerRun.status = false;
                break;
            case 37: // отпущена стрелка влево
                playerRun.status = false;
                break;
        }
    });
};

/*
    Интервалы
 */
const startIntervals = () => {
    intervals.player.run = setInterval(() => {
        if (playerRun.status) {
            if (playerRun.right) {
                player.style.backgroundImage = `url(${playerStats.sprites.right})`;

                if (playerStats.pos.x >= gameZoneStats.center) {
                    bgPos -= playerRun.step;
                    document.body.style.backgroundPositionX = `${bgPos}px`;


                    let platforms = select('.platform', true),
                        medkits = select('.medkit', true),
                        enemies = select('.enemy', true);

                    platforms.forEach(platform => {
                        platform.style.left = `${platform.getBoundingClientRect().left - playerRun.step}px`; 

                        if (platform.getBoundingClientRect().right < 0) gameZone.removeChild(platform);
                    });

                    medkits.forEach(medkit => {
                        medkit.style.left = `${medkit.getBoundingClientRect().left - playerRun.step}px`; 

                        if (medkit.getBoundingClientRect().right < 0) gameZone.removeChild(medkit);
                    });


                    enemies.forEach(enemy => {
                        enemy.style.left = `${enemy.getBoundingClientRect().left - playerRun.step}px`; 
                    });

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

            let medkits = select('.medkit', true);
            
            medkits.forEach(medkit => {
                if (
                    medkit.getBoundingClientRect().bottom >= player.getBoundingClientRect().top &&
                    medkit.getBoundingClientRect().left <= player.getBoundingClientRect().right &&
                    medkit.getBoundingClientRect().right >= player.getBoundingClientRect().left &&
                    playerStats.hp !== 100
                ) {
                    gameZone.removeChild(medkit);
                    changeHP(medkitStats.hpBonus);
                }
            })
        } else {
            if (playerStats.pos.y < 0) {
                playerStats.pos.y += playerJump.speed;
                player.style.top = `${playerStats.pos.y}px`;
            }
        }
    }, fps);
    intervals.player.bullets = setInterval(() => {
        let bulletsLeft = select('.bullet.left', true),
            bulletsRight = select('.bullet.right', true);

        const bulletStartPos = playerStats.pos.x;

        bulletsLeft.forEach((bullet) => {
            bullet.style.left = `${bullet.getBoundingClientRect().left - playerWeapon.speed}px`;

            if (
                bullet.getBoundingClientRect().left < bulletStartPos - 350
            ) {
                if (playerStats.character === 1) {
                    gameZone.removeChild(bullet);
                } else {
                    $(bullet).removeClass('left');
                    $(bullet).addClass('right');
                    $(bullet).addClass('returned');
                }
            }

            if (
                bullet.getBoundingClientRect().left < player.getBoundingClientRect().left + bullet.getBoundingClientRect().width &&
                ($(bullet).hasClass('returned') && $(bullet).hasClass('left')) &&
                playerStats.character === 2
            ) gameZone.removeChild(bullet);
            
        });

        bulletsRight.forEach((bullet) => {
            bullet.style.left = `${bullet.getBoundingClientRect().left + playerWeapon.speed}px`;

            if (
                bullet.getBoundingClientRect().right > bulletStartPos + 350
            ) {
                if (playerStats.character === 1) {
                    gameZone.removeChild(bullet);
                } else {
                    $(bullet).removeClass('right');
                    $(bullet).addClass('left');
                    $(bullet).addClass('returned');
                }
            }

            if (
                bullet.getBoundingClientRect().right > player.getBoundingClientRect().right - bullet.getBoundingClientRect().width &&
                ($(bullet).hasClass('returned') && $(bullet).hasClass('right')) &&
                playerStats.character === 2
            ) gameZone.removeChild(bullet);
        });
    }, fps);


    intervals.enemies.spawn = setInterval(() => {
        const enemyCharacter = random(1, 2), // рандомно выбираем персонажа врага: 1 - Смерть, 2 - Дарт Мол
            enemySprite = (enemyCharacter === 1) ? sprites.enemy_death_left : sprites.enemy_maul_left,
            enemiesCount = select('.enemy', true).length,
            bossCount = select('.boss', true).length;
        if (
            enemiesCount < 5 &&
            (playerStats.kills === 0 || playerStats.kills % 10 !== 0)
        ) {
            gameZone.innerHTML += `<div class="enemy left" style="background-image: url(${enemySprite}); left: ${enemiesSpawn.spawnPosX}px; width: ${enemiesStats.width}px; height: ${enemiesStats.height}px"></div>`;
        } 

        if (
            (playerStats.kills > 0 && playerStats.kills % 10 === 0) &&
            bossCount === 0
        ) {
            bossStats.hp = 1000;
            bossStats.sprites.pos = 0;

            gameZone.innerHTML += `<div class="boss left" style="background-image: url(${bossStats.sprites.left}); left: ${enemiesSpawn.spawnPosX + bossStats.width}px; width: ${bossStats.width}px; height: ${bossStats.height}px"></div>`;
    
            $('.boss-hp-count').text(`${bossStats.hp} HP`);
            select('.boss-hp-line').style.width = `${bossStats.hp / 10}%`;
            $('.boss-info').removeClass('hidden');            

            boss = select('.boss');
        }

        player = select('.player');
    }, enemiesSpawn.spawnInterval);

    intervals.enemies.move = setInterval(() => {
        const enemiesLeft = select('.enemy.left', true),
            enemiesRight = select('.enemy.right', true),
            bulletsRight = select('.bullet.right', true);

        enemiesRight.forEach((enemy) => {
            enemy.style.left = `${enemy.getBoundingClientRect().left + enemiesStats.speed}px`; 

            if (
                enemy.getBoundingClientRect().left >= gameZoneStats.width - enemiesStats.width ||
                playerStats.pos.x >= gameZoneStats.center
            ) {
                $(enemy).removeClass('right');
                $(enemy).addClass('left');

                enemy.style.backgroundImage = (enemy.style.backgroundImage === `url("${sprites.enemy_death_right}")`) ? `url(${sprites.enemy_death_left})` : `url(${sprites.enemy_maul_left})`;
            }

            // if (
            //     enemy.getBoundingClientRect().right <= player.getBoundingClientRect().right ||
            //     enemy.getBoundingClientRect().top <= player.getBoundingClientRect().bottom
            // ) {
            //     playerStats.pos.x -= 100;
            //     player.style.left = `${playerStats.pos.x}px`;

            //     enemy.style.left = `${enemy.getBoundingClientRect().left + 100}px`;
            //     changeHP(-10);
            // }

            bulletsRight.forEach((bullet) => {
                if (bullet.getBoundingClientRect().right >= enemy.getBoundingClientRect().left) {
                    gameZone.removeChild(bullet);
                    gameZone.removeChild(enemy);

                    playerStats.kills ++;
                    changePoints(enemiesStats.killAward);
                }
            });
        });

        enemiesLeft.forEach((enemy) => {
            enemy.style.left = `${enemy.getBoundingClientRect().left - enemiesStats.speed}px`; 

            if (
                enemy.getBoundingClientRect().left <= gameZoneStats.center &&
                !(playerStats.pos.x >= gameZoneStats.center)
            ) {
                $(enemy).removeClass('left');
                $(enemy).addClass('right');

                enemy.style.backgroundImage = (enemy.style.backgroundImage === `url("${sprites.enemy_death_left}")`) ? `url(${sprites.enemy_death_right})` : `url(${sprites.enemy_maul_right})`;
            } 

            if (
                enemy.getBoundingClientRect().left <= player.getBoundingClientRect().right
            ) {
                playerStats.pos.x -= 100;
                player.style.left = `${playerStats.pos.x}px`;

                enemy.style.left = `${enemy.getBoundingClientRect().left + 100}px`;
                changeHP(-10);
            }

            bulletsRight.forEach((bullet) => {
                if (bullet.getBoundingClientRect().right >= enemy.getBoundingClientRect().left) {
                    gameZone.removeChild(bullet);
                    gameZone.removeChild(enemy);

                    playerStats.kills ++;
                    changePoints(enemiesStats.killAward);
                }
            });
        });
    }, fps);

    intervals.enemies.sprite = setInterval(() => {
        const enemiesLeft = select('.enemy.left', true),
            enemiesRight = select('.enemy.right', true);

        enemiesRight.forEach((enemy) => {
            enemiesStats.bgRightPos += enemiesStats.width;

            enemy.style.backgroundPositionX = `${enemiesStats.bgRightPos}px`; 

            if (enemiesStats.bgRightPos > 512) {
                enemiesStats.bgRightPos = 0;
            }
        });

        enemiesLeft.forEach((enemy) => {
            enemiesStats.bgLeftPos -= enemiesStats.width;

            enemy.style.backgroundPositionX = `${enemiesStats.bgLeftPos}px`; 

            if (enemiesStats.bgLeftPos < -512) {
                enemiesStats.bgLeftPos = 0;
            }
        });
    }, 200);

    intervals.boss.move = setInterval(() => {
        let bossCount = select('.boss', true).length,
            bulletsRight = select('.bullet.right', true),
            bulletsLeft = select('bullet.left', true);

        if (bossCount !== 0) {
            if (bossMove.right) {
                if (boss.getBoundingClientRect().left >= gameZoneStats.width - bossStats.width) {
                    bossMove.right = false;
                    boss.style.backgroundImage = `url(${bossStats.sprites.left})`;
                } else boss.style.left = `${boss.getBoundingClientRect().left + bossMove.speed}px`;

                if (boss.getBoundingClientRect().right >= player.getBoundingClientRect().left) {
                    playerStats.pos.x += 300;
                    player.style.left = `${playerStats.pos.x}px`;
                    changeHP(-bossStats.damage);
                }

                bulletsLeft.forEach((bullet) => {
                    if (bullet.getBoundingClientRect().left <= boss.getBoundingClientRect().right) {
                        gameZone.removeChild(bullet);
                        
                        bossStats.hp -= playerWeapon.damage;

                        $('.boss-hp-count').text(`${bossStats.hp} HP`);
                        select('.boss-hp-line').style.width = `${bossStats.hp / 10}%`;

                        if (bossStats.hp <= 0) {
                            gameZone.removeChild(boss);
                            changePoints(bossStats.killAward);
                            playerStats.kills ++;

                            $('.boss-info').addClass('hidden');
                        }
                    }
                });
            } else {
                if (boss.getBoundingClientRect().left <= 0) {
                    bossMove.right = true;
                    boss.style.backgroundImage = `url(${bossStats.sprites.right})`;
                } else boss.style.left = `${boss.getBoundingClientRect().left - bossMove.speed}px`;

                if (boss.getBoundingClientRect().left <= player.getBoundingClientRect().right) {
                    playerStats.pos.x -= 300;
                    player.style.left = `${playerStats.pos.x}px`;
                    changeHP(-bossStats.damage);
                }

                bulletsRight.forEach((bullet) => {
                    if (bullet.getBoundingClientRect().right >= boss.getBoundingClientRect().left) {
                        gameZone.removeChild(bullet);
                        
                        bossStats.hp -= playerWeapon.damage;

                        $('.boss-hp-count').text(`${bossStats.hp} HP`);
                        select('.boss-hp-line').style.width = `${bossStats.hp / 10}%`;

                        if (bossStats.hp <= 0) {
                            gameZone.removeChild(boss);
                            changePoints(bossStats.killAward);
                            playerStats.kills ++;

                            $('.boss-info').addClass('hidden');
                        }
                    }
                });
            }
        }
    }, fps);

    intervals.boss.sprite = setInterval(() => {
        let bossCount = select('.boss', true).length;

        if (bossCount !== 0) {
            if (bossMove.right) {
                bossStats.sprites.pos -= bossStats.width;
                boss.style.backgroundPositionX = `${bossStats.sprites.pos}px`;
            } else {
                bossStats.sprites.pos += bossStats.width;
                boss.style.backgroundPositionX = `${bossStats.sprites.pos}px`;
            }
        }
    }, 300);

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

const stopIntervals = () => {
    clearInterval(intervals.player.run);
    clearInterval(intervals.player.jump);
    clearInterval(intervals.player.sprite);
    clearInterval(intervals.player.bullets);
    clearInterval(intervals.enemies.spawn);
    clearInterval(intervals.enemies.move);
    clearInterval(intervals.enemies.sprite);
    clearInterval(intervals.boss.move);
    clearInterval(intervals.boss.sprite);
    clearInterval(intervals.timer);
};

/*
    Атака
 */
const attack = () => {
    if (playerStats.character === 1) {
        gameZone.innerHTML += `<div 
            class="bullet impulse ${(playerRun.right) ? 'right' : 'left'}" 
            style="background-image: url(${playerWeapon.sprite}); top: ${playerStats.pos.y + (playerStats.height / 2 - 10)}px;left: ${playerStats.pos.x + (playerStats.width / 2)}px;width:${playerWeapon.width}px;height: ${playerWeapon.height}px"></div>`;
    } else {
        gameZone.innerHTML += `<div class="bullet shield ${(playerRun.right) ? 'right' : 'left'}"
            style="background-image: url(${playerWeapon.sprite}); top: ${playerStats.pos.y + (playerStats.height / 2 - 10)}px;left: ${playerStats.pos.x + (playerStats.width / 2)}px;width:${playerWeapon.width}px;height: ${playerWeapon.height}px"></div>`;
    }

    player = select('.player');
    boss = select('.boss');
};

const changeHP = (hp) => {
    if (
        hp > 0 && playerStats.hp <= 90 ||
        hp < 0
    ) {
        playerStats.hp += hp;
    } else if (
        hp > 0 && 
        (playerStats.hp > 90 && playerStats.hp <= 100)
    ) playerStats.hp = 100;
    

    $('.hp-count').text(`${playerStats.hp} HP`);
    select('.hp-line').style.width = `${playerStats.hp}%`;

    if (playerStats.hp <= 0) gameOver();
};

const changePoints = (points) => {
    playerStats.points += points;

    $('.points').text(playerStats.points);
}

const gameOver = async () => {
    stopIntervals();

    $('.end-points').text(playerStats.points * 30 - (timer.minutes * 60 + timer.seconds));

    let resultId = await sendResult(),
        results = await getAllResults();

    showResults(resultId, results);

    $('.blur').removeClass('hidden');
    $('.end-screen').removeClass('hidden');
};


const sendResult = async () => {
    const data = {
        name: playerStats.name,
        score: playerStats.points * 30 - (timer.minutes * 60 + timer.seconds)
    };

    let response = await f('/game', 'POST', JSON.stringify(data));

    return response.body.record.id;
};

const getAllResults = async () => {
    let response = await f('/game', 'GET');

    return response.body.records;
};

const showResults = (playerResultId, results) => {
    let resultsTable = select('.records');

    resultsTable.innerHTML = ` 
        <tr class="records-row ${ (playerStats.character === 1) ? 'im' : 'ca' }">
            <th class="records-header ${ (playerStats.character === 1) ? 'im' : 'ca' } place">Место</th>
            <th class="records-header ${ (playerStats.character === 1) ? 'im' : 'ca' } player-name">Игрок</th>
            <th class="records-header ${ (playerStats.character === 1) ? 'im' : 'ca' } player-score">Счёт</th>
        </tr>
    `;

    results.forEach((result, index) => {
        if (
            result.id !== playerResultId &&
            index < 9
        ) {
            resultsTable.innerHTML += `
                <tr class="records-row ${ (playerStats.character === 1) ? 'im' : 'ca' }">
                    <td class="records-desc ${ (playerStats.character === 1) ? 'im' : 'ca' } place">${ index + 1 }</td>
                    <td class="records-desc ${ (playerStats.character === 1) ? 'im' : 'ca' } player-name">${ result.name }</td>
                    <th class="records-desc ${ (playerStats.character === 1) ? 'im' : 'ca' } player-score">${ result.score }</th>
                </tr>
            `;
        } else if (
            result.id === playerResultId &&
            index < 9
        ) {
            resultsTable.innerHTML += `
                <tr class="records-row current ${ (playerStats.character === 1) ? 'im' : 'ca' }">
                    <td class="records-desc ${ (playerStats.character === 1) ? 'im' : 'ca' } place">${ index + 1 }</td>
                    <td class="records-desc ${ (playerStats.character === 1) ? 'im' : 'ca' } player-name">${ result.name }</td>
                    <th class="records-desc ${ (playerStats.character === 1) ? 'im' : 'ca' } player-score">${ result.score }</th>
                </tr>
            `;
        } else if (
            result.id !== playerResultId &&
            index >= 9
        ) {
            return;
        } else if (
            result.id === playerResultId &&
            index >= 9
        ) {
            resultsTable.innerHTML += `
                <tr class="records-row current ${ (playerStats.character === 1) ? 'im' : 'ca' }">
                    <td class="records-desc ${ (playerStats.character === 1) ? 'im' : 'ca' } place">${ index + 1 }</td>
                    <td class="records-desc ${ (playerStats.character === 1) ? 'im' : 'ca' } player-name">${ result.name }</td>
                    <th class="records-desc ${ (playerStats.character === 1) ? 'im' : 'ca' } player-score">${ result.score }</th>
                </tr>
            `;
        }
    });
}


const spawnPlatforms = () => {
    let platformSpawnPoint = 0;

    for (let i = 0; i <= platformStats.count; i++) {
        let platformType = random(1, 2),
            spawnMedkitOrNot = random(0, 1);

        gameZone.innerHTML += `<div class="platform" style="background-image: url(${ (platformType === 1) ? sprites.platform_ground : sprites.platform_dirt }); left: ${ platformSpawnPoint }px;"></div>`;

        if (spawnMedkitOrNot === 1 && select('.medkit', true).length < 2) {
            gameZone.innerHTML += `<div class="medkit" style="background-image: url(${ sprites.medkit }); left: ${ platformSpawnPoint + platformStats.width / 2 - medkitStats.width / 2}px"></div>`
        }

        platformSpawnPoint += random(300, 600);
    } 

    player = select('.player');
    boss = select('.boss');  
}

const togglePause = () => {
    pause = !pause;

    if (pause) {
        stopIntervals();

        $('.blur').removeClass('hidden');
        $('.pause-screen').removeClass('hidden');
    } else {
        startIntervals();

        $('.blur').addClass('hidden');
        $('.pause-screen').addClass('hidden');
    }
}

/*
    Инициализация
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

    enemiesSpawn.spawnPosX = gameZoneStats.width - enemiesStats.width;

    spawnPlatforms();
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
    Все спрайты
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

    enemy_death_left: "assets/img/sprites/enemy-death_left.png",
    enemy_death_right: "assets/img/sprites/enemy-death_right.png",
    enemy_maul_left: "assets/img/sprites/enemy-maul_left.png",
    enemy_maul_right: "assets/img/sprites/enemy-maul_right.png",

    boss_left: "assets/img/sprites/boss_left.png",
    boss_right: "assets/img/sprites/boss_right.png",

    platform_ground: "assets/img/sprites/platform_1.png",
    platform_dirt: "assets/img/sprites/platform_2.png",

    medkit: "assets/img/sprites/medkit.png"
};


/*
    Все параметры, настройки
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
        character: 1, // 1 - Железный человек, 2 - Капитан Америка
        name: 'Тварына',
        points: 0,
        hp: 100,
        kills: 0,
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
        speed: 15,
        currentPlatform: false
    },
    playerWeapon = {
        type: 'impulse',
        sprite: '',
        speed: 10,
        width: 0,
        height: 0,
        damage: 100
    },
    enemiesStats = {
        speed: 5,
        width: 520 / 4,
        height: 176,
        killAward: 100,
        bgRightPos: 0,
        bgLeftPos: 0
    },
    enemiesSpawn = {
        spawnPosX: 0,
        spawnInterval: 2000
    },
    boss,
    bossStats = {
        sprites: {
            left: sprites.boss_left,
            right: sprites.boss_right,
            pos: 0
        },
        width: 640 / 4,
        height: 216,
        hp: 1000,
        damage: 25,
        killAward: 1000
    },
    bossMove = {
        right: false,
        speed: 3
    },
    gameZone = select('.game-zone'),
    gameZoneStats = {
        width: gameZone.getBoundingClientRect().width,
        center: 0
    },
    platformStats = {
        width: 256,
        height: 64,
        count: 10
    },
    medkitStats = {
        width: 74,
        height: 74,
        count: 2,
        hpBonus: 10
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
        enemies: {
            spawn: '',
            move: '',
            sprite: ''
        },
        boss: {
            move: '',
            sprite: ''
        },
        timer: ''
    },
    bgPos = 0,
    fps = 1000 / 60
    pause = false;

/*
    Механика выбора игрового персонажа
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

/*
    Начать игру заново
*/
$('.play__btn[name="again"]').click(function () {
    gameZone.innerHTML = '';

    timer.minutes = 0;
    timer.seconds = 0;

    playerStats.sprites.pos = 0;

    playerStats.pos.x = 0;
    playerStats.pos.y = 0;

    playerStats.character = 1;

    playerStats.kills = 0;

    $('.end-screen').addClass('hidden');
    $('.start-screen').removeClass('hidden');
});

//game();