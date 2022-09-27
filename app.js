const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

// Get Movie API
app.get("/movies/", async (request, response) => {
  const getMovieQuery = `SELECT
      movie_name
    FROM
      movie
    ORDER BY
      movie_id;`;
  const movieArray = await db.all(getMovieQuery);
  const objectMovieArray = movieArray.map((moviename) => {
    return convertDbObjectToResponseObject(moviename);
  });
  response.send(objectMovieArray);
});

// API 2

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `INSERT INTO
      movie (director_id,movie_name,lead_actor)
    VALUES
      (
        ${directorId},
       '${movieName}',
       '${leadActor}'
        
      );`;

  const dbResponse = await db.run(addMovieQuery);

  response.send("Movie Successfully Added");
});

//API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  const movieObjectModifed = convertDbObjectToResponseObject(movie);
  response.send(movieObjectModifed);
});

module.exports = initializeDBAndServer;

//API 4
