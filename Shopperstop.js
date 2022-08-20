const express = require("express");
const path = require("path");
const Mongo = require("mongodb").MongoClient;
const app = express();
const port = process.env.PORT || 8888;
var objectid = require("mongodb").ObjectId;

const dburl = "mongodb://localhost:27017/student";

var db, cats;


/////setting up connection with mongodb//////////
Mongo.connect(dburl, (error, client) => {
    db = client.db("student");
    db.collection("cats").find({}).toArray((err, result) => {

        console.log(result);
        cats = result;

    });
});


///////convert url to json///////////
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

///////// giving path to pug files///////////////////
app.set('views', path.join(__dirname, "views"));

app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, "public")));


////////// rendering to the different pages/////////

app.get("/", (request, response) => {

    response.render("index", { title: "Home", cat: cats });

});

app.get("/cats", (request, response) => {

    response.render("cats", { title: "Cats Detail", cat: cats });

});
app.get("/cats/add", (request, response) => {

    response.render("addcats", { title: "Add Cats", cat: cats });

});



///////inserting the Data into mongo Db//////////////
app.post("/cats/add", (request, response) => {

    console.log(request.body);

    let name = request.body.name;
    let breed = request.body.breed;
    let description = request.body.description;

    let newcat = {
        "Name": name,
        "Breed": breed,
        "Description": description
    };

    db.collection("cats").insertOne(newcat, (error, result) => {
        if (error) throw error;
        refreshlink();
        response.redirect("/cats");


    });

});
//////// Deleting Data from the Table//////////////
app.get("/cats/delete", (request, response) => {

    let id = new objectid(request.query.catid);

    db.collection("cats").deleteOne({
            _id: id
        }, (error, result) => {
            if (error) throw error;
            refreshlink();
            response.redirect("/cats");
        }

    );

});


///////////edit Data from the Table////////////////
app.get("/cats/edit", (request, response) => {

    let id = new objectid(request.query.catid);
    db.collection("cats").findOne({
            _id: id
        }, (error, result) => {
            if (error) throw error;
            refreshlink();
            response.render("edit", { title: "Edit Cats", cat: cats, editcats: result });
        }

    );

});
/////updating data in the database////////////////////
app.post("/cats/edit/list", (request, response) => {

    console.log(request.body);
    let id = new objectid(request.body.id);
    let name = request.body.catname;
    let breed = request.body.catbreed;
    let description = request.body.catdescription;


    db.collection("cats").updateOne({
            _id: id
        }, {
            $set: {
                Name: name,
                Breed: breed,
                Description: description
            }
        }, { new: true },
        (error, result) => {
            if (error) throw error;
            refreshlink();
            response.redirect("/cats");
        }



    );



});







///////function to refresh & refelect the updated value////////////////////
function refreshlink() {
    db.collection("cats").find({}).toArray((err, result) => {

        cats = result;
    });

}



///////////checking the server/////////////////
app.listen(port, () => {

    console.log('Listening on http://localhost:${port}');
})