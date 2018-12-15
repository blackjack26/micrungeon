import { Difficulty } from '../minigames';
import Random from '../util/Random';
import { Edge } from '../globals';
import TILES from '../dungeon/TileMappings';

/**
 * This class manages the battle and combat logic.
 */
export default class Battle {
  /**
   * Creates the battle room
   * @param {Room} room The room the battle is occurring in
   * @param {number} edge The edge the player entered from
   * @param {Phaser.Scene} scene The current scene
   */
  constructor( room, edge, scene ) {
    this.room = room;
    this.startEdge = edge;
    this.scene = scene;
    this.currentEnemy = null;

    // Cheats
    // TODO: DELETE THESE
    this.scene.input.keyboard.createCombo( 'KILL', { deleteOnMatch: true } );
    this.scene.input.keyboard.on( 'keycombomatch', ( event ) => {
      this.slayAll();
    } );
  }

  /**
   * Updates the battle
   */
  update() {
    if ( this.currentEnemy === null ) {
      this.currentEnemy = this.scene.enemyGroup.getChildren()[ 0 ];
      this.enemyIndex = 0;
    }
    else if ( this.playerTurn ) {
      if ( this.scene.keys.down.isDown || this.scene.keys.right.isDown ) {
        this.currentEnemy.deselect();
        this.enemyIndex--;
        if ( this.enemyIndex < 0 ) {
          this.enemyIndex = this.scene.enemyGroup.countActive() - 1;
        }
        this.currentEnemy =
          this.scene.enemyGroup.getChildren()[ this.enemyIndex ];
        this.currentEnemy.select();
        this.scene.input.keyboard.resetKeys();
      }
      else if ( this.scene.keys.up.isDown || this.scene.keys.left.isDown ) {
        this.currentEnemy.deselect();
        this.enemyIndex++;
        if ( this.enemyIndex >= this.scene.enemyGroup.countActive() ) {
          this.enemyIndex = 0;
        }
        this.currentEnemy =
          this.scene.enemyGroup.getChildren()[ this.enemyIndex ];
        this.currentEnemy.select();
        this.scene.input.keyboard.resetKeys();
      }
      else if ( this.scene.keys.space.isDown ) {
        this.playMinigame( this.currentEnemy );
        this.scene.input.keyboard.resetKeys();
      }
    }
  }

  /**
   * Slays all of the enemies
   */
  slayAll() {
    this.currentEnemy = null;
    this.playerTurn = false;

    const enemies = this.scene.enemyGroup.getChildren();
    for ( let i = enemies.length - 1; i >= 0; i-- ) {
      enemies[ i ].injure( enemies[ i ].health );
    }
    this.scene.endCombat();
  }

  /**
   * Begins combat inside of the a battle room
   * @return {Promise} The promise when the battle has been initialized
   */
  begin() {
    this.scene.input.keyboard.resetKeys();
    this.centerCameraToRoom();
    return this.lockRoom()
      .then( () => this.room.spawnEnemies( this.startEdge, this.scene ) )
      .then( () => {
        this.scene.enemyGroup.getChildren().forEach( ( enemy ) => {
          enemy.on( 'pointerdown', () => {
            this.playMinigame( enemy );
          } );
          enemy.on( 'pointerover', () => {
            this.currentEnemy.deselect();
            this.currentEnemy = enemy;
            this.currentEnemy.select();
            this.enemyIndex =
              this.scene.enemyGroup.getChildren().indexOf( enemy );
          } );
        } );
      } )
      .then( () => {
        this.movePlayer();
        this.active = true;
        this.playerTurn = true;
        this.enemyIndex = 0;
        this.currentEnemy = this.scene.enemyGroup
          .getChildren()[ this.enemyIndex ];
        this.currentEnemy.select();
      } );
  }

  /**
   * Ends the combat inside of the battle room
   * @return {Promise} The promise when the battle has ended
   */
  end() {
    this.unlockRoom();
    return this.centerCameraOnPlayer()
      .then( () => {
        this.active = false;
      } );
  }

  /**
   * Moves the player to face enemies
   */
  movePlayer() {
    const callback = () => { this.scene.player.movementDisabled = true; };
    if ( this.startEdge === Edge.TOP ) {
      this.scene.player.setDestination(
        this.scene.map.tileToWorldX( this.room.centerX + 0.5 ),
        this.scene.map.tileToWorldY(
          this.room.centerY + 0.5 - this.room.height / 4 ),
        callback
      );
    }
    else if ( this.startEdge === Edge.RIGHT ) {
      this.scene.player.setDestination(
        this.scene.map.tileToWorldX(
          this.room.centerX + 0.5 + this.room.width / 4 ),
        this.scene.map.tileToWorldY( this.room.centerY + 0.5 ),
        callback
      );
    }
    else if ( this.startEdge === Edge.BOTTOM ) {
      this.scene.player.setDestination(
        this.scene.map.tileToWorldX( this.room.centerX + 0.5 ),
        this.scene.map.tileToWorldY(
          this.room.centerY + 0.5 + this.room.height / 4 ),
        callback
      );
    }
    else if ( this.startEdge === Edge.LEFT ) {
      this.scene.player.setDestination(
        this.scene.map.tileToWorldX(
          this.room.centerX + 0.5 - this.room.width / 4 ),
        this.scene.map.tileToWorldY( this.room.centerY + 0.5 ),
        callback
      );
    }
  }

  /**
   * Stops player movement and centers the camera in the battle room
   */
  centerCameraToRoom() {
    const duration = 750;
    const { centerX, centerY } = this.room;
    const cX = this.scene.map.tileToWorldX( centerX + 0.5 );
    const cY = this.scene.map.tileToWorldY( centerY + 0.5 );

    this.scene.player.movementDisabled = true;

    const camera = this.scene.cameras.main;
    camera.stopFollow();
    camera.pan( cX, cY, duration, 'Linear' );
  }

  /**
   * Centers the camera on the player
   * @return {Promise} The promise when the camera has been centered
   */
  centerCameraOnPlayer() {
    const duration = 750;
    this.scene.cameras.main.pan( this.scene.player.x, this.scene.player.y,
      duration, 'Linear' );
    return new Promise( ( resolve ) => {
      setTimeout( () => {
        this.scene.cameras.main.startFollow( this.scene.player );
        this.scene.player.movementDisabled = false;
        resolve();
      }, duration );
    } );
  }

  /**
   * Adds the doors to the room to lock the player in for battle
   * @return {Promise} The promise when the room has been locked
   */
  lockRoom() {
    const duration = 750;
    const { x, y, doors } = this.room;
    const camera = this.scene.cameras.main;

    return new Promise( ( resolve, reject ) => {
      setTimeout( () => {
        camera.shake( 200, 0.0025 );
        doors.forEach( ( door ) => {
          // Top or Bottom
          if ( door.edge === Edge.TOP || door.edge === Edge.BOTTOM ) {
            this.scene.stuffLayer.putTilesAt( TILES.GATE.HORIZONTAL,
              x + door.x - 1, y + door.y );
          }
          // Left or Right
          else if ( door.edge === Edge.LEFT || door.edge === Edge.RIGHT ) {
            this.scene.stuffLayer.putTilesAt( TILES.GATE.VERTICAL,
              x + door.x, y + door.y - 1 );
          }
        } );
        this.scene.stuffCollider.update();
        this.scene.player.movementDisabled = false;
        resolve();
      }, duration );
    } );
  }

  /**
   * Removes the doors from the room
   */
  unlockRoom() {
    const { x, y, doors } = this.room;
    doors.forEach( ( door ) => {
      // Top or Bottom
      if ( door.edge === Edge.TOP || door.edge === Edge.BOTTOM ) {
        this.scene.stuffLayer.removeTileAt( x + door.x - 1, y + door.y );
        this.scene.stuffLayer.removeTileAt( x + door.x, y + door.y );
        this.scene.stuffLayer.removeTileAt( x + door.x + 1, y + door.y );
      }
      // Left or Right
      else if ( door.edge === Edge.LEFT || door.edge === Edge.RIGHT ) {
        this.scene.stuffLayer.removeTileAt( x + door.x, y + door.y - 1 );
        this.scene.stuffLayer.removeTileAt( x + door.x, y + door.y );
      }
    } );
  }

  /**
   * Opens the given mini game and pauses the game until mini game is over
   * @param {Enemy} enemy The enemy spawning the mini game
   * @param {number} difficulty The difficulty of the mini game
   */
  playMinigame( enemy, difficulty = Difficulty.EASY ) {
    if ( !this.playerTurn ) {
      return;
    }

    const name = enemy.getRandomMiniGame();
    this.minigame = {
      game: this.scene.scene.get( name ),
      enemy: enemy
    };
    if ( !this.minigame.game ) {
      return;
    }

    this.scene.scene
      .launch( name, {
        parent: this,
        difficulty: difficulty
      } )
      .bringToTop( name )
      .pause();
  }

  /**
   * Stops the current mini game and resumes the game
   * @param {object} result The result of the mini game
   */
  continueCombat( result ) {
    const { win, damage } = result;

    this.scene.scene.stop( this.minigame.game.key );
    this.scene.input.keyboard.resetKeys();
    this.scene.scene.resume();

    // Win
    if ( win ) {
      this.scene.player.attack( this.minigame.enemy, damage );
      if ( this.scene.enemyGroup.countActive() === 0 ) {
        this.scene.endCombat();
        this.playerTurn = false;
      }
      else {
        this.playerTurn = true;
        if ( !this.minigame.enemy.active ) {
          setTimeout( () => {
            this.enemyIndex = 0;
            this.currentEnemy = this.scene.enemyGroup
              .getChildren()[ this.enemyIndex ];
            this.currentEnemy.select();
          }, 200 );
        }
      }
    }
    // Lose
    else {
      // Enemies attack
      this.playerTurn = false;
      this.performEnemyAttack( this.scene.enemyGroup.getChildren(), 0 )
        .then( () => {
          this.playerTurn = true;
        } );
    }
  }

  /**
   * Performs an enemy attack
   * @param {Enemy[]} enemies The enemies attacking
   * @param {number} index The index of the attacking enemy
   * @return {Promise} The promise when the enemy is done attacking
   */
  performEnemyAttack( enemies, index ) {
    this.scene.cameras.main.shake( 200, 0.0025 );
    this.scene.cameras.main.flash( 200, 150, 0, 0 );

    const r = new Random();
    const damage = r.randInt( 1, 3 );
    enemies[ index ].attack( this.scene.player, damage );
    // Player is dead
    if ( !this.scene.player.alive ) {
      this.scene.gameOver();
      return Promise.resolve();
    }

    // Wait 750ms, then have next enemy attack #Recursion
    return new Promise( ( resolve ) => {
      setTimeout( () => {
        // No more enemies
        if ( index === enemies.length - 1 ) {
          resolve();
        }
        // Next enemy attack
        else {
          this.performEnemyAttack( enemies, index + 1 )
            .then( () => resolve() );
        }
      }, 750 );
    } );
  }
}