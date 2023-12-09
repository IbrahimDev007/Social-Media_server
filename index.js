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

