const { MongoClient } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const coll = process.env.DB_COLLECTION;


// GET /db
async function getDBList(req, res) {
    console.log('getDBList called');
    console.log('uri:', uri);
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const result = await client.db().admin().listDatabases();
      return result;
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
      await client.close();
    }
  }

// GET /movies
async function getMovies(req, res) {
    console.log('getMovies called');
    console.log('uri:', uri);
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const cursor = client.db(dbName).collection(coll).find();
        const result = await cursor.toArray();
        if (result.length === 0) {
        throw { statusCode: 404, message: 'No movies found' };
        }
        return result;
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        await client.close();
    }
}

// GET /movies/:id  ('gameofthrones_2011')
async function getMovieById(req, res, id) {
    console.log('getMovieById called');
    console.log('uri:', uri);
    const client = new MongoClient(uri);
        console.log('searching for id:', id);
    try {
        await client.connect();
        const result = await client.db(dbName).collection(coll).findOne({ _id: id });
        if (!result) {
            res.status(404).send('Movie not found: ' + id);
        }
        return result;
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        await client.close();
    }
}

// GET /title/:title (ie. 'game of thrones', case insensitive)
async function getMovieByTitle(req, res, title) {
    console.log('getMovieByTitle called');
    console.log('uri:', uri);
    console.log('title:', title);
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const result = await client
        .db(dbName)
        .collection(coll)
        .findOne({ Title: { $regex: new RegExp(`^${title}$`, 'i') } });
      if (!result || result.length === 0) {
        res.status(404).send('Movie not found: ' + title);
      } else {
        return result;
      }
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        await client.close();
    }
}

// GET /partial/:title (ie. 'game', case insensitive)
async function getMoviesByPartialTitle(req, res, title) {
    console.log('getMoviesByPartialTitle called');
    console.log('uri:', uri);
    console.log('title', title);
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const cursor = client
        .db(dbName)
        .collection(coll)
        .find({ Title: { $regex: title, $options: 'i' } })
        .sort({ Title: 1 });
      const result = await cursor.toArray();
      if (!result || result.length === 0) {
        res.status(404).send('No movies found matching: ' + title);
      } else {
        return result;
      }
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        await client.close();
    }
}

    // GET /director/:name (ie. 'john cameron', case insensitive)
  async function getMoviesByDirector(req, res, name) {
    console.log('getContactsByDirector called');
    console.log('uri:', uri);
    console.log('name', name);
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const cursor = client
        .db(dbName)
        .collection(coll)
        .find({ Director: { $regex: name, $options: 'i' } })
        .sort({ Director: 1 });
      const result = await cursor.toArray();
      if (!result || result.length === 0) {
        res.status(404).send('No movies found with Director matching: ' + name);
      } else {
        return result;
      }
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        await client.close();
    }
}

    // POST /create
  async function createMovie(req, res)
    {
        console.log('createMovie called');
        console.log('uri:', uri);
        const client = new MongoClient(uri);
        let _id;

        try
        {
            await client.connect();
            let {
                    _id,
                    Title,
                    Year,
                    Rated,
                    Released,
                    Runtime,
                    Genre,
                    Director,
                    Writer,
                    Actors,
                    Plot,
                    Language,
                    Country,
                    Awards,
                    Poster,
                    Metascore,
                    imdbRating,
                    imdbVotes,
                    imdbID,
                    Type,

                } = req.body;

                // create a unique ID
                _id = `${Title}_${Year}`.replace(/\s/g, '').toLowerCase();

                const newMovie =
                {
                    _id,
                    Title,
                    Year,
                    Rated,
                    Rated,
                    Released,
                    Runtime,
                    Genre,
                    Director,
                    Writer,
                    Actors,
                    Plot,
                    Language,
                    Country,
                    Awards,
                    Poster,
                    Metascore,
                    imdbRating,
                    imdbVotes,
                    imdbID,
                    Type,
                };
            const result = await client.db(dbName).collection(coll).insertOne(newMovie);
            if (result.insertedId) {
                const createdMovieId = result.insertedId;
                return res.status(201).json({
                  statusCode: 201,
                  message: 'Movie created successfully',
                  createdMovieId: createdMovieId.toString(),
                });
              } else {
                return res.status(500).json({
                  statusCode: 500,
                  message: 'Movie creation failed 1',
                  id: _id,
                });
              }
        } catch (err) {
                console.error(err);
                if (err.code === 11000) {
                    return res.status(400).json({
                    statusCode: 400,
                    message: 'Duplicate key violation. Movie creation failed',
                    id: _id,
                    keyValue: err.keyValue,
                    });
                } else {
                    return res.status(500).json({
                    statusCode: 500,
                    message: 'Movie creation failed 2',
                    id: _id,
                    });
                }
        } finally {
            await client.close();
        }
    }

// PUT /update/:id
async function updateMovie(req, res, id) {
    // if the firstName or lastName fields are updated, then the _id should be updated.
    // in order to update the _id, I need to delete the existing contact and create a new one,
    // since _id is immutable (Should I actually do this?)

    console.log('updateMovie called');
    console.log('uri:', uri);
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const movieId = req.params.id; // get the ID of the contact to update from the request parameters
      //   if the id is not present, then build the id from the movie title and the year
        if (!movieId) {
            movieId = `${req.body.Title}_${req.body.Year}`.replace(/\s/g, '').toLowerCase();
        }
      // Dynamically build the updatedContact object based on the fields present in the request body
      const updateFields = {};
      for (const [key, value] of Object.entries(req.body)) {
        updateFields[key] = value;
      }
      const updatedMovie = { $set: updateFields };
      console.log('updateMovieId:', movieId);
      console.log('updatedMovie:', updatedMovie);
      const result = await client
        .db(dbName)
        .collection(coll)
        .findOneAndUpdate({ _id: movieId }, updatedMovie); // use findOneAndUpdate() to update the contact with the specified ID
      if (result.value) {
        res.send({ message: `Movie ${movieId} updated successfully` });
        //   if the update contained the Title and/or the Year fields, then the _id must be updated (is this kosher?)
        if (updateFields.Title || updateFields.Year) {
            await changeMovieId(movieId);
        }

      } else {
        res.status(404).send({ message: `Movie ${movieId} not found` });
      }
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
      await client.close();
    }
  }

    //  This function is for the internal use of the updateContact() function
    //  It creates a new _id if the firstName or lastName fields are changed
  async function changeMovieId(_id) {
    console.log('changeMovieId called');
    console.log('uri:', uri);
    const client = new MongoClient(uri);
    try {
      await client.connect();

      // find the old movie record by the _id parameter
      const oldMovie = await client.db(dbName).collection(coll).findOne({ _id });

      // check to make sure the "newMovieId" isn't the same and doesn't already exist
      newMovieId = oldMovie.Title.toLowerCase().replace(' ', '') + '_' + oldMovie.Year;
      if (newMovieId = _id || (await client.db(dbName).collection(coll).findOne({ _id: newMovieId }))) {
        return;
      }

      // create a new movie object with the updated _id based on the Title and Year fields
      const newMovie = {
            _id: oldMovie.Title.toLowerCase().replace(' ', '') + '_' + oldMovie.Year,
            Title: oldMovie.Title,
            Year: oldMovie.Year,
            Rated: oldMovie.Rated,
            Released: oldMovie.Released,
            Runtime: oldMovie.Runtime,
            Genre: oldMovie.Genre,
            Director: oldMovie.Director,
            Writer: oldMovie.Writer,
            Actors: oldMovie.Actors,
            Plot: oldMovie.Plot,
            Language: oldMovie.Language,
            Country: oldMovie.Country,
            Awards: oldMovie.Awards,
            Poster: oldMovie.Poster,
            Metascore: oldMovie.Metascore,
            imdbRating: oldMovie.imdbRating,
            imdbVotes: oldMovie.imdbVotes,
            imdbID: oldMovie.imdbID,
            Type: oldMovie.Type,
          };

      // insert the new movie object into the database
      const result = await client.db(dbName).collection(coll).insertOne(newMovie);
        //   if the insert was successful, delete the old contact record
        if (result.insertedCount === 1) {
            const createdMovie = result.ops[0];
            return res.status(201).json({
            statusCode: 201,
            message: 'Movie created successfully',
            data: createdMovie,
            });
        }
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Record creation failed. Duplicate key detected.',
              });
        } else {
            return res.status(500).json({
              statusCode: 500,
              message: 'Record creation failed. An internal server error occurred.',
            });
        }
    } finally {
        await client.close();
    }
  }

  // DELETE /delete/:id
  async function deleteMovie(req, res, id) {
    console.log('deleteMovie called');
    console.log('uri:', uri);
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const movieId = req.params.id; // get the ID of the contact to delete from the request parameters
      const result = await client
        .db(dbName)
        .collection(coll)
        .deleteOne({ _id: movieId }); // use deleteOne() method to delete the contact with the specified ID
      res.send({ message: `Movie ${movieId} deleted successfully` });
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      await client.close();
    }
  }


  module.exports = {
    getDBList,
    getMovies,
    getMovieById,
    getMovieByTitle,
    getMoviesByPartialTitle,
    getMoviesByDirector,
    createMovie,
    updateMovie,
    deleteMovie,
  };

  console.log('movies-controller.js is loaded!');

