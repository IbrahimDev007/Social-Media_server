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
        const usersCollection = client.db("SocialApp").collection("UserDb");
        const postCollection = client.db("SocialApp").collection("PostDb");
        const aboutCollection = client.db("SocialApp").collection("AboutDb");

        // api
        // ----------

        app.get('/users', async (req, res) => {
            const users = await usersCollection.find().toArray()
            res.send(users)
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);

            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }

            const result = await usersCollection.insertOne(user);
            res.send(result);
        });
        // user info get
        app.get('/users/about/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await usersCollection.findOne(query);
            res.send(result);
        })
        //user about updateDoc
        app.patch('/users/:id', async (req, res) => {
            const id = req.params.id;
            const Data = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    // name: "Luis swift",
                    // email: "luisswift123@gmail.com",
                    // university: null,
                    // adress: null
                    Data

                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);

        })


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