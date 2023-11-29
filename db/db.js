const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const coll = process.env.DB_COLLECTION;

async function connect(uri, dbName) {
  console.log('connect() function called');
  console.log("uri:", uri)
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected successfully to database');
    const db = client.db(dbName);
    return db;
  } catch (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }
}

async function close() {
    try {
      await client.close();
      console.log('Connection to database closed');
    } catch (err) {
      console.error('Error closing database connection:', err);
      throw err;
    }
  }

//  mongoose connect
// async function monConnect(uri) {
//     try {
//       await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//       console.log('Connected successfully to database using mongoose');
//       const db = mongoose.connection;
//       return db;
//     } catch (err) {
//       console.error('Error connecting to database:', err);
//       throw err;
//     }
//   }

// mongoose close
// async function monClose() {
//     try {
//       await mongoose.connection.close();
//       console.log('Connection to database closed');
//     } catch (err) {
//       console.error('Error closing database connection:', err);
//       throw err;
//     }
//   }

module.exports = { connect, close};

//  mongoose version
// module.exports = { monConnect, monClose };
