import './style.css';

// import kaboom from 'kaboom';
import kaboom from 'https://unpkg.com/kaboom@3000/dist/kaboom.mjs'; /**/

const DEV = (import.meta.env && import.meta.env.DEV);

// for vite dev
if (DEV) {
  if (window['reload']) {
    window.location = window.location;
  }

  window['reload'] = true;
}

// *-------------------------* Welcom to govnkode *----------------------------*
// init engine
const kaboomCtx = kaboom({
  global: false,

  width: 1366,
  height: 768,
  letterbox: true,

  font: 'pixelify',

  debug: DEV
});

// sprites
kaboomCtx.loadSprite('house', 'sprites/house.png');
kaboomCtx.loadSprite('pipe_a', 'sprites/pipe_a.png');
kaboomCtx.loadSprite('pipe_b', 'sprites/pipe_b.png');
kaboomCtx.loadSprite('pipe_c', 'sprites/pipe_c.png');
kaboomCtx.loadSprite('bg', 'sprites/bg.png');
kaboomCtx.loadSprite('player', 'sprites/player.png');
kaboomCtx.loadSprite('point', 'sprites/point.png');
kaboomCtx.loadSprite('snow', 'sprites/snow.png');
kaboomCtx.loadSprite('doomer', 'sprites/doomer.png');
kaboomCtx.loadSprite('mbg', 'sprites/mbg.png');

// sound
kaboomCtx.loadSound('chris_toy', 'sounds/chris_toy.mp3');
kaboomCtx.loadSound('snow_steam', 'sounds/snow_steam.mp3');
kaboomCtx.loadSound('wind', 'sounds/wind.mp3');

kaboomCtx.volume(0.8);

// fonst
kaboomCtx.loadFont('pixelify', 'fonts/PixelifySans-Regular.ttf');

// global bg
kaboomCtx.setBackground(0, 0, 0);

// game scene
kaboomCtx.scene('game', () => {
  // pipe consts
  const PIPE_OPEN_WIDTH = 132;
  const PIPE_MIN_WIDTH = 75;
  const PIPE_HEIGHT = 64;
  const PIPE_FLY_ZONE_HEIGHT = 320;
  // game consts
  const GAME_AREA_WIDTH = 600;
  const WORLD_SPEED = 150;
  // houses consts
  const HOUSE_WIDTH = 700;
  const HOUSE_HEIGHT = 600;
  const HOUSE_OFFSET_X = 25;
  const HOUSE_RIGHT_OFFSET_Y = -200;
  // player consts
  const PLAYER_ACCELERATION = 300;
  const PLAYER_FRICTION = 190;
  const PLAYER_MAX_SPEED = 320;
  const PLAYER_WIDTH = 40;

  // points consts
  const POINT_WIDTH = 24; //
  // const POINT_HEIGHT = 24;
  const POINT_RANDOM_FACTOR_NUMBER = 100;
  const POINT_SWING_DISTANCE = 20;
  const POINT_SWING_SPEED = 5;
  const POINT_AREA_SCALE = 1.1;

  // score consts
  const SCORE_LABEL_POS_X = 24;
  const SCORE_LABEL_POS_Y = 24;

  let housesCount = 3;
  let pipesCount = 8;
  let score = 0;
  let lose = false;

  // sound wind
  const soundWind = kaboomCtx.play('wind', {
    loop: true,
    seek: 5
  });

  // camera
  kaboomCtx.camPos(
    GAME_AREA_WIDTH/2,
    kaboomCtx.height()/2
  );

  // root node
  const game = kaboomCtx.add([
    kaboomCtx.timer()
  ]);

  // background picture
  game.add([
    kaboomCtx.pos(
      GAME_AREA_WIDTH/2,
      0
    ),

    kaboomCtx.sprite('bg', {
      height: kaboomCtx.height()
    }),

    kaboomCtx.anchor('top')

  ]);

  function spawnHouses(count) {
    for (let i = 0; i < count; i++) {
      // house left
      game.add([
        kaboomCtx.pos(HOUSE_OFFSET_X, i*HOUSE_HEIGHT),

        kaboomCtx.sprite('house', {
          width: HOUSE_WIDTH,
          height: HOUSE_HEIGHT
        }),

        kaboomCtx.anchor('topright'),

        'house'
      ]);

      // house right
      game.add([
        kaboomCtx.pos(
          GAME_AREA_WIDTH - HOUSE_OFFSET_X,
          i*HOUSE_HEIGHT + HOUSE_RIGHT_OFFSET_Y
        ),

        kaboomCtx.sprite('house', {
          width: HOUSE_WIDTH,
          height: HOUSE_HEIGHT,

          flipX: true
        }),

        'house'
      ]);
    }
  }

  function genHousesCount() {
    return Math.ceil(
      kaboomCtx.height()/HOUSE_HEIGHT + 2
    );
  }

  housesCount = genHousesCount();
  spawnHouses(housesCount);

  kaboomCtx.onUpdate('house', (house) => {
    if (house.pos.y + house.height < 0) {
      house.pos.y += HOUSE_HEIGHT*housesCount;
    }
  });

  function genPipeWidths() {
    const w1 = kaboomCtx.rand(
      PIPE_MIN_WIDTH,
      (GAME_AREA_WIDTH - PIPE_MIN_WIDTH - PIPE_OPEN_WIDTH)
    );

    const w2 = (GAME_AREA_WIDTH - w1 - PIPE_OPEN_WIDTH);

    return [
      w1, w2
    ];
  }

  function spawnPipesAndPoints(height, count) {
    for (let i = 0; i < count; i++) {
      const randPosPoint = kaboomCtx.randi(0, 3);
      const widths = genPipeWidths();

      // pipe 1 fragment A
      game.add([
        kaboomCtx.pos(0, height),

        kaboomCtx.sprite('pipe_a', {
          height: PIPE_HEIGHT
        }),

        kaboomCtx.anchor('topright'),

        'pipe'
      ]);

      // pipe 1 fragment B
      game.add([
        kaboomCtx.pos(0, height),

        kaboomCtx.sprite('pipe_b', {
          width: widths[0],
          height: PIPE_HEIGHT
        }),

        kaboomCtx.area(),

        'pipe',
        'main'
      ]);

      // pipe 1 fragment C
      game.add([
        kaboomCtx.pos(widths[0], height),

        kaboomCtx.sprite('pipe_c', {
          height: PIPE_HEIGHT
        }),

        kaboomCtx.area(),

        'pipe'
      ]);

      // -------------------------------------------------------------------
      // pipe 2 fragment A
      game.add([
        kaboomCtx.pos(
          widths[0] + PIPE_OPEN_WIDTH + widths[1],
          height
        ),

        kaboomCtx.sprite('pipe_a', {
          height: PIPE_HEIGHT,

          flipX: true
        }),

        'pipe'
      ]);

      // pipe 2 fragment B
      game.add([
        kaboomCtx.pos(widths[0] + PIPE_OPEN_WIDTH, height),

        kaboomCtx.sprite('pipe_b', {
          width: widths[1],
          height: PIPE_HEIGHT,

          flipX: true
        }),

        kaboomCtx.area(),

        'pipe'
      ]);

      // pipe 2 fragment C
      game.add([
        kaboomCtx.pos(widths[0] + PIPE_OPEN_WIDTH, height),

        kaboomCtx.sprite('pipe_c', {
          height: PIPE_HEIGHT,

          flipX: true
        }),

        kaboomCtx.area(),

        kaboomCtx.anchor('topright'),

        'pipe'
      ]);

      // *-----------------* Generator game points *------------------*

      const randPosFactor = kaboomCtx.randi(
        0,
        POINT_RANDOM_FACTOR_NUMBER
      );

      // pipe open
      if (randPosPoint === 0) {
        game.add([
          kaboomCtx.pos(
            widths[0] + PIPE_OPEN_WIDTH/2,
            height + PIPE_HEIGHT/2
          ),

          // kaboomCtx.rect(POINT_WIDTH, POINT_HEIGHT),
          kaboomCtx.sprite('point', {
            width: POINT_WIDTH,
            // height: PIPE_HEIGHT
          }),

          kaboomCtx.area({
            scale: POINT_AREA_SCALE
          }),

          kaboomCtx.anchor('center'),

          'point'
        ]);
      // pipe left
      } else if (randPosPoint === 1) {
        game.add([
          kaboomCtx.pos(
            GAME_AREA_WIDTH/4 + randPosFactor,
            height + PIPE_HEIGHT + PIPE_FLY_ZONE_HEIGHT/2
          ),

          // kaboomCtx.rect(POINT_WIDTH, POINT_HEIGHT),
          kaboomCtx.sprite('point', {
            width: POINT_WIDTH,
            // height: PIPE_HEIGHT
          }),

          kaboomCtx.area({
            scale: POINT_AREA_SCALE
          }),

          kaboomCtx.anchor('center'),

          'point'
        ]);
      // pipe right
      } else if (randPosPoint == 2) {
        game.add([
          kaboomCtx.pos(
            GAME_AREA_WIDTH - GAME_AREA_WIDTH/4 - randPosFactor,
            height + PIPE_HEIGHT + PIPE_FLY_ZONE_HEIGHT/2
          ),

          // kaboomCtx.rect(POINT_WIDTH, POINT_HEIGHT),
          kaboomCtx.sprite('point', {
            width: POINT_WIDTH,
            // height: PIPE_HEIGHT
          }),

          kaboomCtx.area({
            scale: POINT_AREA_SCALE
          }),

          kaboomCtx.anchor('center'),

          'point'
        ]);
      } else {/* no points */}


      height += (PIPE_HEIGHT + PIPE_FLY_ZONE_HEIGHT);
    }
  }

  function genPipesCount() {
    return Math.ceil(
      kaboomCtx.height()/(PIPE_HEIGHT + PIPE_FLY_ZONE_HEIGHT) + 2
    );
  }
  pipesCount = genPipesCount();

  spawnPipesAndPoints(kaboomCtx.height(), pipesCount);

  kaboomCtx.onUpdate('pipe', (pipe) => {
    if (pipe.pos.y + pipe.height < 0) {
      // spawn new pipe
      if (pipe.is('main')) {
        spawnPipesAndPoints(
          pipe.pos.y + (PIPE_HEIGHT + PIPE_FLY_ZONE_HEIGHT)*pipesCount,
          1
        );
      }

      // destroy offscreen pipe
      kaboomCtx.destroy(pipe);
    }
  });

  kaboomCtx.onUpdate('point', (point) => {
    if (point.pos.y + point.height/2 < 0) { kaboomCtx.destroy(point); }

    // swing points
    point.pos.y += kaboomCtx.wave(

      -POINT_SWING_DISTANCE,
      POINT_SWING_DISTANCE,

      (kaboomCtx.time()*POINT_SWING_SPEED)

    )*kaboomCtx.dt();
  });

  // *----------------* World *---------------*
  // update world
  game.onUpdate(() => {
    const speed = WORLD_SPEED*kaboomCtx.dt();

    const houses = game.get('house');
    const pipes = game.get('pipe');
    const points = game.get('point');

    // update houses
    houses.forEach((house) => {
      house.pos.y -= speed;
    });

    // update pipes
    pipes.forEach((pipe) => {
      pipe.pos.y -= speed;
    });

    // upadate points
    points.forEach((point) => {
      point.pos.y -= speed;
    });
  });

  // ---------------------------------------------------------------
  // player
  const player = game.add([
    kaboomCtx.pos(
      GAME_AREA_WIDTH/2,

      kaboomCtx.height()/4
    ),

    kaboomCtx.sprite('player', {
      width: PLAYER_WIDTH
    }),

    kaboomCtx.area({
      scale: 0.65
    }),

    kaboomCtx.anchor('center'),

    kaboomCtx.z(24),

    {
      isMovingLeft: false,
      isMovingRight: false,

      speed: 0
    }
  ]);

  player.onUpdate(() => {
    const dt = kaboomCtx.dt();
    const acceleration = PLAYER_ACCELERATION*dt;
    const friction = PLAYER_FRICTION*dt;
    // player moving
    if (player.isMovingLeft) {
      // left acceleration
      player.speed -= acceleration;
    } else if (player.isMovingRight) {
      // right acceleration
      player.speed += acceleration;
    } else {
      // friction
      if (player.speed < 0) {
        // left
        player.speed += friction;
        if (player.speed > 0) player.speed = 0;
      } else if (player.speed > 0) {
        // right
        player.speed -= friction;
        if (player.speed < 0) player.speed = 0;
      }
    }

    // max player speed
    if (player.speed < -PLAYER_MAX_SPEED) {
      player.speed = -PLAYER_MAX_SPEED;
    } else if (player.speed > PLAYER_MAX_SPEED) {
      player.speed = PLAYER_MAX_SPEED;
    }

    if ((player.pos.x - player.width/4) < 0) {
      player.pos.x = player.width/4;
      player.speed = -player.speed;
      // player.speed = 0;
    }
    if ((player.pos.x + player.width/4) > GAME_AREA_WIDTH) {
      player.pos.x = GAME_AREA_WIDTH - player.width/4;
      player.speed = -player.speed;
      // player.speed = 0;
    }

    player.pos.x += player.speed*dt;
  });

  // player moving left
  kaboomCtx.onKeyDown((key) => {
    if (
      key === 'left' ||
      key === 'a' ||
      key === 'ф'
    ) {
      player.isMovingLeft = true;
    }
  });
  kaboomCtx.onKeyRelease((key) => {
    if (
      key === 'left' ||
      key === 'a' ||
      key === 'ф'
    ) {
      player.isMovingLeft = false;
    }
  });

  // player moving right
  kaboomCtx.onKeyDown((key) => {
    if (
      key === 'right' ||
      key === 'd' ||
      key === 'в'
    ) {
      player.isMovingRight = true;
    }
  });
  kaboomCtx.onKeyRelease((key) => {
    if (
      key === 'right' ||
      key === 'd' ||
      key === 'в'
    ) {
      player.isMovingRight = false;
    }
  });

  // collide pipe
  player.onCollide('pipe', () => {
    lose = true;
    game.paused = true;

    kaboomCtx.play('snow_steam');
    kaboomCtx.shake(5);

    soundWind.stop();

    kaboomCtx.wait(1, () => {
      kaboomCtx.go( /* go to menu */
        'menu',
        score
      );
    });
  });

  const scoreLabel = kaboomCtx.add([
    kaboomCtx.pos(
      GAME_AREA_WIDTH - SCORE_LABEL_POS_X,
      SCORE_LABEL_POS_Y
    ),

    kaboomCtx.text(score),

    kaboomCtx.z(999),

    kaboomCtx.scale(1.3),

    kaboomCtx.anchor('topright')
  ]);

  function addScore() {
    score++;
    scoreLabel.text = score;

    kaboomCtx.play('chris_toy');
  }

  player.onCollide('point', (point) => {
    addScore();
    kaboomCtx.destroy(point);
  });

  const pauseLabel = kaboomCtx.add([
    kaboomCtx.pos(
      GAME_AREA_WIDTH/2,
      kaboomCtx.height()/2
    ),

    kaboomCtx.text('pause'),

    kaboomCtx.scale(1.2),

    kaboomCtx.z(999),

    kaboomCtx.anchor('center')
  ]);

  pauseLabel.hidden = true;

  // pause
  kaboomCtx.onKeyPress((key) => {
    if ((key === 'p' || key === 'з') && !lose) {
      game.paused = !game.paused;

      if (game.paused) {
        pauseLabel.hidden = false;
        soundWind.paused = true;
      } else {
        pauseLabel.hidden = true;
        soundWind.paused = false;
      }
    }
  });
});

// menu scene
kaboomCtx.scene('menu', (score = 0) => {
  let started = false;
  /**/
  kaboomCtx.add([
    kaboomCtx.pos(
      kaboomCtx.width()/2 + 60,
      -100
    ),

    kaboomCtx.sprite('bg', {
      height: kaboomCtx.height()
    }),

    kaboomCtx.anchor('top')
  ]);

  kaboomCtx.add([
    kaboomCtx.pos(
      kaboomCtx.width()/2,
      kaboomCtx.height()/2
    ),

    kaboomCtx.sprite('mbg', {
      height: kaboomCtx.height()
    }),

    kaboomCtx.anchor('center')
  ]);

  kaboomCtx.add([
    kaboomCtx.pos(
      0,
      kaboomCtx.height()
    ),

    kaboomCtx.sprite('doomer', {
      width: kaboomCtx.width()/3
    }),

    kaboomCtx.anchor('botleft')
  ]);

  const pics = [
    {
      name: 'player',
      size: {
        width: 75,
        height: 0
      }
    },
    {
      name: 'point',
      size: {
        width: 50,
        height: 0
      }
    },
    {
      name: 'snow',
      size: {
        width: 85,
        height: 0
      }
    }
  ];

  const variant = pics[ (kaboomCtx.randi(0, 3)) ];

  //
  kaboomCtx.add([

    kaboomCtx.pos(
      kaboomCtx.width()/2,
      kaboomCtx.height()/2 - 125
    ),

    kaboomCtx.sprite(variant.name, {
      width: variant.size.width,
      height: variant.size.height,

    }),

    kaboomCtx.anchor('center')
  ]);

  // score
  kaboomCtx.add([

    kaboomCtx.pos(
      kaboomCtx.width()/2,
      kaboomCtx.height()/2
    ),

    kaboomCtx.text(score),
    kaboomCtx.scale(1.7),

    kaboomCtx.anchor('center')
  ]);

  // hint
  kaboomCtx.add([

    kaboomCtx.pos(
      kaboomCtx.width()/2,
      kaboomCtx.height() - 48
    ),

    kaboomCtx.text('Press any key to start the game.'),

    kaboomCtx.scale(0.8),

    kaboomCtx.anchor('bot'),

    'hint'
  ]);

  // control hint
  kaboomCtx.add([

    kaboomCtx.pos(
      kaboomCtx.width() - 12,
      kaboomCtx.height() - 12
    ),

    kaboomCtx.text('Key A - move left\nKey D - move right\nKey P - pause'),

    kaboomCtx.scale(0.5),

    kaboomCtx.anchor('botright')
  ]);

  kaboomCtx.onUpdate('hint', (hint) => {
    hint.pos.y += (
      kaboomCtx.wave(-10, 10, kaboomCtx.time())*kaboomCtx.dt()
    );
  });

  function playGame() {
    if (started) return;
    started = true;

    kaboomCtx.wait(0.3, () => {
      kaboomCtx.go('game');
    });
  }

  // play game
  kaboomCtx.onKeyPress(() => { playGame(); });
});

kaboomCtx.onLoad(() => {
  kaboomCtx.go('menu'); // go menu
});
