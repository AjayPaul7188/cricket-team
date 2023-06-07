const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Get list of player API
app.get("/players/", async (request, response) => {
  const getPlayersListQuery = `
    select *
    from 
    cricket_team
    order by
    player_id`;
  const playersList = await db.all(getPlayersListQuery);
  response.send(
    playersList.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//Create a new Player API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;

  const { playerId, playerName, jerseyNumber, role } = playerDetails;

  const addPlayerQuery = `
    insert into
    cricket_team(player_id, player_name, jersey_number, role)
    values (
        '${playerId}',
        '${playerName}',
        '${jerseyNumber}',
        '${role}'
    );`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//Get particular player details API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `
    select  *
    from
    cricket_team
    where
    player_id = ${playerId}`;
  const player = await db.get(getPlayerDetailsQuery);
  const playerCon = convertDbObjectToResponseObject(player);
  response.send(playerCon);
});

//Update player details API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerDetailsQuery = `
    update
     cricket_team
    set
        player_id='${playerId}',
        player_name='${playerName}',
        jersey_number='${jerseyNumber}',
        role='${role}'
    where
    player_id = ${playerId};`;
  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

//Delete Player API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    delete 
    from
    cricket_team
    where
    player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
