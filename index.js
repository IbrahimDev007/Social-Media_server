const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 3000;
//midleware
app.use(cors());
app.use(express.json());
//mongodb client here 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { Console } = require('console');
// const uri = `mongodb://127.0.0.1:27017`;
const uri = process.env.URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // api
        // ----------




    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Social_Media IS RUNNING')
})

app.listen(port, () => {
    console.log(`Social_Media IS RUNNING ${port}`);
})