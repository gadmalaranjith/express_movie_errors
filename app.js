const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertMovieObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertDirectorObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
//get all movies
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

// get one movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetails = `
    SELECT *
    FROM movie
    WHERE 
        movie_id=${movieId};`;
  const movie = await db.get(getMovieDetails);
  response.send(convertMovieObjectToResponseObject(movie));
});

//post movie
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieDetails = `
        INSERT INTO
        movie(director_id, movie_name, lead_actor)
        VALUES
        (${directorId},'${movieName}','${leadActor}')
    `;
  await db.run(postMovieDetails);
  response.send("Movie Successfully Added");
});

// update movie
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieDetails = `
    UPDATE 
        movie
    SET
        director_id=${directorId},
        movie_name='${movieName}',
        lead_actor='${leadActor}'
    WHERE
        movie_id=${movieId};
    `;
  await db.run(updateMovieDetails);
  resource.send("Movie Details Updated");
});
//delete
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
    DELETE FROM
        movie
    WHERE
        movie_id=${movieId}; 
    `;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

//get directors
app.get("/directors/", async (request, response) => {
  const { directorId, directorName } = request.body;
  const getDirectorDetails = `
    SELECT
        *
    FROM director;
    `;
  const directorsArray = await db.all(getDirectorDetails);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDirectorObjectToResponseObject(eachDirector)
    )
  );
});
//get movies of director
app.get("/movies/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesDetails = `
    SELECT
        movie_name
    FROM
        movie
    WHERE 
        director_id=${directorId};        
    `;
  const directorMovies = await db.all(getDirectorMoviesDetails);
  response.send(
    directorMovies.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
