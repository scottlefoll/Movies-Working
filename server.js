const express = require('express');
const app = express();
// const router = express.Router();
// const bodyParser = require('body-parser');
// router.use('/', require('./swagger'));

app.use(express.json());
require('dotenv').config();

const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const coll = process.env.DB_COLLECTION;
const routes = require('./routes/movies-routes');

app.use('/api/movies', routes);
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

const { connect } = require('./db/db.js');

(async () => {
    try {
      const db = await connect(uri, dbName);
        app.locals.db = db;
        app.locals.uri = uri;
        app.use('/', routes);
        app.listen(port, () => {
            console.log(`Server listening at http://localhost:${port}`);
      });
    } catch (err) {
      console.error('Error starting server:', err);
    }
  })();

