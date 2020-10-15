const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs-extra");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zxfa1.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("services"));
app.use(fileUpload());

const port = 5000;

app.get("/", (req, res) => {
  res.send("hello i am working...");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const servicesCollection = client.db("creativeAgency").collection("services");
  const reviewCollection = client.db("creativeAgency").collection("review");

  const adminCollection = client.db("creativeAgency").collection("admin");
  const orderCollection = client.db("creativeAgency").collection("order");


//New Service Add
  app.post("/addService", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;    

    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };
    servicesCollection
      .insertOne({ name, email, title, description, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });


  //New order Add

  app.post("/addOrder", (req, res) => {
    // const name = req.body.name;
    // const email = req.body.email;
    // const orderFile = req.files.orderFile;
    // const projectDetail = req.body.projectDetail;
    // const price = req.body.price; 
    // const matchService = req.body.matchService;   

    // console.log(name, email, orderFile, projectDetail, price, matchService)
    // const newImg = file.data;
    // const encImg = newImg.toString("base64");

    // var image = {
    //   contentType: file.mimetype,
    //   size: file.size,
    //   img: Buffer.from(encImg, "base64"),
    // };

    const newOrderAdd = req.body;

    orderCollection
      .insertOne(newOrderAdd)
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  



  app.get("/services", (req, res) => {
    servicesCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
      // console.log(documents);
    });
  });


  app.post('/addReview', (req, res) => {
    const review = req.body;
    reviewCollection.insertOne(review)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })


  //Review

  app.get("/review", (req, res) => {
    reviewCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get('/serviceList', (req, res) => { 
    orderCollection.find({})      
    .toArray((err, documents) => {
      res.send(documents);
    })
  })

  //book service
  app.get('/bookService', (req, res) => { 
    orderCollection.find({email: req.query.email})      
    .toArray((err, documents) => {
      res.send(documents);
    })
  })



  //admin
  
  app.post("/addAdmin", (req, res) => {
    const admin = req.body;
    adminCollection
    .insertOne(admin)
    .then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get('/checkAdmin', (req, res) => { 
    // console.log(req.query.email)
    adminCollection.find({email: req.query.email})      
    .toArray((err, documents) => {
      res.send(documents.length > 0);
    })
  })


  app.get("/allOrder", (req, res) => {
    orderCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
      // console.log(documents);
    });
  });

});

app.listen(process.env.PORT || port);
