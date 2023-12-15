const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 3000;
//midleware
app.use(cors());
app.use(express.json());
//mongodb client here 
const { MongoClient, ServerApiVersion, ObjectId, aggregate } = require('mongodb');
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

        // api
        // ----------
        //all user see
        app.get('/users', async (req, res) => {
            const users = await usersCollection.find().toArray()
            res.send(users)
        })
        //user data added
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
            const query = { email: email.toLowerCase() }
            const result = await usersCollection.findOne(query);
            res.send(result);
        })
        //user about updateDoc
        app.patch('/users/:id', async (req, res) => {
            const id = req.params.id;
            const Data = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = { $set: Data };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);

        })

        // -----------status------------
        // status add 
        app.post('/status', async (req, res) => {

            const status = req.body;
            console.log(status);
            const result = await postCollection.insertOne(status);
            res.send(result);
        });
        // status post 
        app.get('/status', async (req, res) => {
            const status = await postCollection.find().toArray()
            res.send(status);
        })

        //single status get
        app.get('/status/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const existingpost = await postCollection.findOne(filter);
                if (existingpost) {
                    res.send(existingpost);
                } else {
                    res.status(404).send({ error: 'Post not found' });
                }
            } catch (error) {
                console.error('Error retrieving post:', error);
                res.status(500).send({ error: 'Internal server error' });
            }
        })
        // ----add like at status----
        app.patch('/like/:id', async (req, res) => {
            const id = req.params.id;
            const post = await postCollection.findOne({ _id: new ObjectId(id) });
            const { like, userId } = req.body;

            try {
                let process;

                // Check if the 'like' field exists and is not null
                if (post && post.like !== undefined && post.like !== null) {
                    if (!like) {
                        // If like is true, add the userId to the likes array
                        process = await postCollection.updateOne(
                            { _id: new ObjectId(id) },
                            { $push: { like: new ObjectId(userId) } }
                        );
                    } else {
                        // If like is false, remove the userId from the likes array
                        process = await postCollection.updateOne(
                            { _id: new ObjectId(id) },
                            { $pull: { like: new ObjectId(userId) } }
                        );
                    }
                } else {
                    // If 'like' field is null or undefined, initialize it as an empty array
                    process = await postCollection.updateOne(
                        { _id: new ObjectId(id) },
                        { $set: { like: [userId] } }
                    );
                }

                console.log(process);
                res.send(process);
            } catch (error) {
                console.error('Error updating like:', error);
                res.status(500).send({ error: 'Internal server error' });
            }
        });

        //---add comment at status ----
        app.patch('/comment/:id', async (req, res) => {
            const Id = req.params.id;
            const commentData = req.body;
            const filter = { _id: new ObjectId(Id) };
            const update = { $push: { Comment: commentData } };
            const result = await postCollection.updateOne(filter, update);
            res.send(result);
        })


        //popular status with arggregate path
        app.get('/popular', async (req, res) => {

            //most interection 
            const mostInteractions = await postCollection.aggregate([
                {
                    $addFields: {
                        totalInteractions: {
                            $add: [
                                { $ifNull: [{ $size: { $ifNull: ['$like', []] } }, 0] },
                                { $ifNull: [{ $size: { $ifNull: ['$Comment', []] } }, 0] }
                            ]
                        }
                    }
                },
                { $sort: { totalInteractions: -1 } }
            ]).toArray();
            //most like
            const mostLikes = await postCollection.aggregate([
                {
                    $addFields: {
                        totalLikes: { $ifNull: [{ $size: { $ifNull: ['$like', []] } }, 0] }
                    }
                },
                { $sort: { totalLikes: -1 } }
            ]).toArray();
            //most comment
            const mostComments = await postCollection.aggregate([
                {
                    $addFields: {
                        totalComments: { $ifNull: [{ $size: { $ifNull: ['$Comment', []] } }, 0] }
                    }
                },
                { $sort: { totalComments: -1 } }
            ]).toArray();

            res.send({ mostInteractions, mostLikes, mostComments });
        });



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