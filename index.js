const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ctdrv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send('Hello DB working')
});

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const serviceCollection = client.db("NetBoost").collection("services");
    const adminCollection = client.db("NetBoost").collection("admin");
    const orderCollection = client.db("NetBoost").collection("orders");
    const reviewCollection = client.db("NetBoost").collection("reviews");

    app.post('/addServices', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const description = req.body.description;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ name, description, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })



    });

    app.get('/services', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
                console.log(err)
            })
    });

    app.post('/deleteService', (req, res) => {
        const id = req.body.id;

        serviceCollection.deleteOne({ _id: ObjectId(id) })
            .then((result) => {
                res.send(result.deletedCount > 0);
            })
            .catch((error) => {
                console.log(error)
            });
    });

    app.post('/addAdmin', (req, res) => {
        const name = req.body.name;
        const email = req.body.email;

        adminCollection.insertOne({ name, email })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    app.post('/addOrder', (req, res) => {
        const data = req.body;
        const email = req.body.email;

        console.log(req.body)
        orderCollection.insertOne(data)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    app.post('/getOrders', (req, res) => {
        const email = req.body.email;
        const isAdmin = req.body.isAdmin;
        let filter = {};

        if (!isAdmin) {
            filter.email = email
        }
        orderCollection.find(filter)
            .toArray((err, documents) => {
                res.send(documents);
                console.log(err);
            })
    });


    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0)
            })
    });



    app.patch('/update/:id', (req, res) =>{
        orderCollection.updateOne({_id: ObjectId(req.params.id)},
        {
          $set: {status: req.body.value}
        })
        .then(result => {
          res.send(result.matchedCount > 0)
        })
     
      });

      app.post('/addReview', (req, res) => {
        const data = req.body;
        console.log(req.body)
        reviewCollection.insertOne(data)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });


    app.post('/getReviews', (req, res) => {
        const email = req.body.email;
        const isHome = req.body.isAdmin;
        let filter = {};

        if (!isHome) {
            filter.email = email
        }
        reviewCollection.find(filter)
            .toArray((err, documents) => {
                res.send(documents);
                console.log(err);
            })
    });


});
app.listen(process.env.PORT || port);