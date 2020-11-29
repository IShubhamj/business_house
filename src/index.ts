import * as readline from "readline";

const readLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

class BusinessHome {
  totalChances: number = 10;
  totalPlayers: number = 0;
  cells: string[];
  diceOutputs: number[];
  players = [];
  cellsMap = [];
  initialAmount: number = 1000;

  // Reading inputs from console
  inputs = () => {
    return new Promise((resolve, reject) => {
      readLine.question("Number of Players ", (players) => {
        if (isNaN(parseInt(players, 10)) || parseInt(players, 10) < 2) {
          reject("Please enter min number 2 or more");
        } else {
          this.totalPlayers = parseInt(players, 10);
        }
        readLine.question("Cell position and type ", (cellPositions) => {
          this.cells = cellPositions.split(",").map((element) => {
            if (element === "E" || "T" || "H" || "J") {
              return element;
            }
            reject("Valid cell types are E, T, H, J");
          });
          readLine.question("Dice outputs ", (diceOutputs) => {
            this.diceOutputs = diceOutputs.split(",").map((element) => {
              if (
                isNaN(parseInt(element, 10)) ||
                parseInt(element, 10) < 2 ||
                parseInt(element, 10) > 12
              ) {
                reject("Please enter number between 2 to 12");
              }
              return parseInt(element, 10);
            });
            readLine.close();
            resolve(null);
          });
        });
      });
    });
  };

  createPlayersMap = () => {
    // Mapping players initial data on given number of players
    for (let i = 1; i <= this.totalPlayers; i++) {
      this.players.push({
        name: i,
        balance: this.initialAmount,
        hotelsOwned: 0,
        position: 0,
      });
    }
  };

  // Mapping cell config with its behaviour
  createCellsMap = () => {
    this.cellsMap = this.cells.map((cell) => {
      switch (cell) {
        case "E":
          return {
            type: "Empty",
            value: null,
          };
        case "J":
          return {
            type: "Jail",
            value: 150,
          };
        case "H":
          return {
            type: "Hotel",
            ownedBy: null,
            value: 200,
            rent: 50
          };
        case "T":
          return {
            type: "Treasure",
            value: 200,
          };
      }
    });
  };

  // Actual game play
  playGame = () => {
    let round = 1;
    let dice = 0;
    do {
      for (const player of this.players) {
        // maintaining player current position on board
        player.position += this.diceOutputs[dice];
        // reset active position if user completes current circuit
        if (player.position >= this.cellsMap.length) {
          player.position -= this.cellsMap.length;
        }
        const activeCell = this.cellsMap[player.position];
        const { balance } = player;
        const { type } = activeCell;
        // Operations on cell types
        switch (type) {
          case "Treasure":
            player.balance += activeCell.value;
            break;
          case "Jail":
            player.balance -= activeCell.value;
            break;
          case "Hotel":
            if (activeCell.ownedBy === null && balance >= 200) {
              player.balance -= activeCell.value;
              activeCell.ownedBy = player.name;
              player.hotelsOwned++;
            } else if (
              activeCell.ownedBy !== player.name &&
              balance >= activeCell.rent
            ) {
              player.balance -= activeCell.rent;
              this.players[activeCell.ownedBy - 1].balance += activeCell.rent;
            }
        }
        dice++;
      }
      round++;
    } while (dice < this.diceOutputs.length);
    this.tally(this.players);
  };

  // Tally results
  tally = (players: any) => {
    players.forEach(({ name, balance, hotelsOwned }) => {
      console.log(
        `Player-${name} has total worth ${balance + hotelsOwned * 200}`
      );
    });
  };

  // Main class
  main = async () => {
    await this.inputs();
    this.createPlayersMap();
    this.createCellsMap();
    this.playGame();
  };
}

const businessHome = new BusinessHome(); // Object instance
businessHome.main(); // Execution start
