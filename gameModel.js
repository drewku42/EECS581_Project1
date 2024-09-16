/* 
 * Program Name:
 * Game Model Module
 * 
 * Description:
 * This File contains the GameModel, ShipPlacementHandler and MainGameHandler classes for managing game states
 * 
 * Inputs:
 * - Player ship positions, current game states
 * 
 * Outputs:
 * - Transitions to future game state
 * 
 * Code sources:
 * Self, MDN web docs, a couple of Stack overflow answers
 * 
 * Author:
 * Code: Jake Bernard, Alex Doehring, Mark Maloney
 * Documentation: Drew Meyer
 * 
 * Creation Date:
 * 2024-09-08
 * 
 */
import { Orientation, Coord, Ship, ShipSegment, GameCell } from './ships.js';

class GameModel {  // Class object that contains and updates the game state
    constructor() {
        this.gamemode = Object.freeze({     // Enum for Game Mode 
            RuleSelect: 'RuleSelect',       // State following start screen where players select # of ships 
            PlaceShips: 'PlaceShips',       // State where players place/orient their ships
            MainGame: 'MainGame',           // State which alternates between players where players take shots
            GameWin: 'GameWin',             // State after a player has won, prompts play again
            SwitchPlayers: 'SwitchPlayers', // State handling transition between player MainGame state
            TitleScreen: 'TitleScreen'      // State handlnig start screen
        });
    
        this.currentPlayer = null; //initialize 
        this.p1Ships = []; //init array for playerships
        this.p2Ships = [];
        this.unplacedShips = [];
        this.boards = Array.from({ length: 10 }, () => 
            Array.from({ length: 10 }, () => 
                Array.from({ length: 10 }, () => new GameCell())
            )
        );
        this.shipPlacementHandler = null; //init ship handler
        this.mainGameHandler = null; //init main handler 
    }
    
    init() {
        this.gamemode = this.gamemode.TitleScreen;
        this.currentPlayer = Player.P1;
        this.targetPlayer = Player.P2;
        this.p1Ships = [];
        this.p2Ships = [];
        this.unplacedShips = [[]];
        this.boards = Array.from({ length: 10 }, () => 
            Array.from({ length: 10 }, () => 
                Array.from({ length: 10 }, () => new GameCell())
            )
        );

    }


    recieveMessage = function(message) {
        let messageBack = new Message; //initializng message back
        switch(message.code) {
            case MessageToGameModelCode.Advance: // Used in transitions between states | Drew Meyer
                switch (GameModel.gamemode) {    // Check current state to transition to new state
                    
                    // If Title Screen, advance to Rule Select
                    case Gamemode.TitleScreen:
                        messageBack = {
                            code: MessageToUICode.ShowRuleSelect,    // Send UI code for Rule Select
                            content: {
                                gamemode: Gamemode.RuleSelect,   // Send new game mode Rule Select
                                currentPlayer: Player.P1         // Start with player 1
                            }
                        };
                        break;
                    
                    // If Rule Select, advance to Ship Placement
                    case Gamemode.RuleSelect:
                        messageBack = {
                            code: MessageToUICode.ShowRuleSelect,   // Present board to players for ship placement
                            content: {
                                gamemode: Gamemode.PlaceShips,         // Send new game mode Place Ships
                                currentPlayer: Player.P1,              // Start with player 1
                                p1_ships: Player.P1.ships,                  // Player 1's ship array initially empty
                                p2_ships: Player.P2.ships,                  // Player 2's ship array initially empty
                                p1_unplacedShips: Player.P1.unplacedShips,  // Player 1's ships that must be placed
                                p2_unplacedShips: Player.P2.unplacedShips   // Player 2's ships that must be placed
                            }
                        };
                        break;
                    
                    // If Place Ships, advance to Main Game
                    case Gamemode.PlaceShips:
                        messageBack = {
                            code: MessageToUICode.EndPlacementMode,  // Send message to end ship placement
                            content: {
                                gamemode: Gamemode.MainGame,  // Send new game mode Main Game
                                currentPlayer: Player.P1,     // Set current player
                                targetPlayer: Player.P2       // Set target player
                            }
                        };
                        break;

                    case Gamemode.GameWin:
                        messageBack = {
                            code: MessageToUICode.ShowRuleSelect,  // When game ends, start new game
                            content: {
                                gamemode: Gamemode.RuleSelect,   // Send new game mode Rule Select
                                currentPlayer: Player.P1         // Start with player 1
                            }
                        }
                        
                };

            case MessageToGameModelCode.MakeShot:
                    hit_coords = message.content.coords;
                    let cell = boards[targetPlayer][hit_coords.row][hit_coords.col];
                    if(cell.isShotAt === true) {
                        messageBack = {
                            code: MessageToUICode.BadShot,
                            content: {
                              gamemode: Gamemode.MainGame,
                              currentPlayer: currentPlayer,
                              targetPlayer: targetPlayer,
                              isHit: isHit,
                              isShotAt: isShotAt,
                              ships: ships,
                              boards: boards
                            }
                        };
                    }
                    else if (cell === NULL) {
                        messageBack = {
                            code: MessageToUICode.ShotResult, // send back a bad shot message
                            content: {
                                gamemode: Gamemode.MainGame,
                                currentPlayer: currentPlayer,
                                targetPlayer: targetPlayer,
                                ships: ships,
                                isShotAt: true,
                                hitSegment: hitSegment, 
                                destroyedShip: destroyedShip,
                                isWin: false,
                                boards: boards
                            }
                        };
                    } else if (!cell.Segment.isAlive()){
                        P1_Shots.push(coords); // push the coords if valid shot
                        let hit = P2_Ships.some(ship => ship.contains(coords)); // check to see if its a hit
                        if (hit) { //send hit message
                            messageBack = {
                                code: MessageToUICode.ShotResult,
                                content: {
                                    isHit: false,
                                    coords: coords,
                                    currentPlayer: Player.P1,
                                    targetPlayer: Player.P2
                                }
                            }
                        } else {
                            messageBack = { //else send miss message
                                code: MessageToUICode.ShotResult,
                                content: {
                                    result: "miss",
                                    coords: coords,
                                    currentPlayer: Player.P1,
                                    targetPlayer: Player.P2
                                }
                            }
                        }
                }

                break;

            case MessageToGameModelCode.PlaceShip:
                shipToPlace = message.content.shipToPlace;
                index = message.content.shipToPlaceIndex;
                unplacedShips[currentPlayer].splice(index, 1);

                if(currentPlayer == Player.P1) { p1Ships.push_back(shipToPlace); }
                else { p2Ships.push_back(shipToPlace) }

                for(let segment of ship.segments) {
                    if(boards[currentPlayer][segment.position.row][segment.position.col] != null) {
                        boards[currentPlayer][segment.position.row][segment.position.col] = segment;
                    }
                    else {
                        messageBack.code = MessageToUICode.BadPlacement,
                        messageBack.content = { 
                            gamemode: Gamemode.PlaceShips,
                            currentPlayer: Player.P1, // the current player, not always P1
                            ships: ships, // updated ships array
                            unplacedShips: unplacedShips // updated unplacedShips array
                        }
                        return messageBack;
                    }
                }

                messageBack = {
                    code: MessageToUICode.PlacementResult,
                    content: { 
                        gamemode: Gamemode.PlaceShips,
                        currentPlayer: Player.P1, // the current player, not always P1
                        ships: p1Ships, // updated ships array
                        unplacedShips: unplacedShips // updated unplacedShips array
                    }
                }
                break;
            case MessageToGameModelCode.RuleSelect:
                let numShips = message.content.rules; //Initialize how many ships for each player
                unplaced = [[], []] //Initialize unplaced ships array
                for(let i = 1; i <= numShips; i++) {
                    let addShip = new Ship(i, new Coord(0,0), Orientation.Up);
                    unplaced[0].push(addShip);
                    unplaced[1].push(addShip)
                }
                messageBack.content = {
                    gamemode: Gamemode.PlaceShips,
                    currentPlayer: Player.P1,
                    ships: [[]], // array of empty arrays
                    unplacedShips: unPlaced //edit based off of rules given                     
                }

                break;
                case MessageToGameModelCode.StartGame:
                    this.gamemode=this.gamemode.MainGame
    
                    messageBack = {
                        code: MessageToUICode.StartGame,
                        contents: {
                            gamemode: this.gamemode.MainGame,
                            currentPlayer: this.currentPlayer,
                            targetPlayer: this.targetPlayer,
                            ships: {
                            [Player.P1]: this.p1Ships,
                            [Player.P2]: this.p2Ships     
                            },
                            boards: this.boards
                        }
                    }
                    return messageBack;
            default:
                //put error
                break;
        }
    }
}

class Message{
    constructor(){
        this.code = null;
        this.content = null;
}
}