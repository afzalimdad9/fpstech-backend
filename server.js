const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Middleware
app.use(bodyParser.json());
var cors = require('cors');
app.use(cors());

app.get('/', (req, res) => {
  res.send("This is FPS Tech Backend Application");
});

const port = parseInt(process.env.PORT || "3001", 10);
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


//Import the Nodemailer library
const nodemailer = require('nodemailer');

const { MongoClient } = require('mongodb');
const mongo = require('mongodb');
// Connection URI
//const uri = 'mongodb://cluster0.bkrpyqe.mongodb.net:27017';
const dbName = 'fps_technology';
const dbuser = 'fpstech';
const dbpass = 'AhTPcuGYc4DBU7am';
const collectionName = 'products';

//const uri = "mongodb+srv://fpstech:AhTPcuGYc4DBU7am@cluster0.bkrpyqe.mongodb.net/admin?authSource=admin&replicaSet=atlas-fn6xcc-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true";

//Client mongo atlas details
const uri = "mongodb+srv://fpstech:fpstech@cluster0.thgd8ye.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('fps_technology');
    const collection = db.collection('products');

    // Find the first document in the collection
    const first = await collection.findOne();
    console.log(first);
  } finally {
    // Close the database connection when finished or an error occurs
    await client.close();
  }
}
run().catch(console.error);


/// Get all product list on 09.07.2024
app.get("/product-list", async (req, res) => {
  await client.connect();
  const db = client.db('fps_technology');
  const collection = db.collection('products');
  let plist = await collection.find().toArray();
  console.log("All product list", plist);
  res.json(plist).status(200);
});


///Get all CMS page list on 15.07.2024
app.get("/page-list", async (req, res) => {
  await client.connect();
  const db = client.db("fps_technology");
  const collection = db.collection('cms');
  let pageList = await collection.find().toArray();
  console.log("All page list", pageList);
  res.json(pageList).status(200);
})


///Get all category list on 16.07.2024
app.get("/cat-list", async (req, res) => {
  await client.connect();
  const db = client.db('fps_technology');
  const collection = db.collection('category');
  let catlist = await collection.find().toArray();
  console.log("All Cat list", catlist);
  res.json(catlist).status(200);
})


// Get a filtered product list list
app.get("/pdetails", async (req, res) => {
  const query = req.query.name;
  console.log("Query", query);
  await client.connect();
  const db = client.db('fps_technology');
  const collection = db.collection('products');
  // let results = await collection.find({"product_name": { $regex: '.*' + query + '.*'}})
  //   .limit(50)
  //   .toArray();
  let results = await collection.find({ "product_name": { $regex: query, $options: "i" } }).limit(10).toArray();
  console.log("Results", results);
  res.json(results).status(200);
});



// app.get("/products_details", async (req, res) => {
//   const query = req.query.prodId;
//   console.log("Query", query);
//   //const params = req.params.id;
//   //console.log("Params", params); 
//   var o_id = new mongo.ObjectId(query);
//   await client.connect();
//   const db = client.db('fps_technology');
//   const collection = db.collection('products');
//   let results = await collection.findOne({'_id': o_id});
//   console.log("Results", results);
//   res.json(results).status(200);
// });


app.get("/products_details", async (req, res) => {
  const query = req.query.prodId;
  console.log("Query", query);
  //const params = req.params.id;
  //console.log("Params", params); 
  var o_id = new mongo.ObjectId(query);
  await client.connect();
  const db = client.db('fps_technology');
  const collection = db.collection('products');
  //let results = await collection.findOne({'_id': o_id});

  //Perform $lookup aggregation to join orders with products
  const results = await db.collection("products")
    .aggregate([
      {
        $match: { _id: o_id }  // Filter for the specific product
      },
      {
        $lookup: {
          from: "product_reviews",
          localField: "_id",
          foreignField: "product_id",
          as: "reviewdetails",
        }

      },

      {
        $lookup: {
          from: "product_images",
          localField: "_id",
          foreignField: "product_id",
          as: "productimages",
        }

      },

    ])
    .toArray();

  console.log(results);
  console.log("Results", results);
  res.json(results).status(200);
});






////Get product list category wise on 18.06.2024
app.get("/cat-product-list", async (req, res) => {
  const getcatname = req.query.catgoryname;
  console.log("Category name", getcatname);
  await client.connect();
  const db = client.db("fps_technology");
  const collection = db.collection("products");
  console.log("Category name", getcatname);
  let results = await collection.find({ 'product_cat': getcatname }).toArray();
  console.log("All product", results);
  //res.json(results).status(200);
  ///Pagination
  const page = parseInt(req.query.page) || 1;
  //console.log("Page Number", page); return;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedItems = results.slice(startIndex, endIndex);
  const totalPages = Math.ceil(results.length / limit);
  console.log("Paginated object", paginatedItems);
  console.log("Total pages", totalPages);

  res.json({
    page,
    limit,
    totalPages,
    totalItems: results.length,
    items: paginatedItems
  });



})

///Get product tags list
app.get("/tag-product-list", async (req, res) => {
  const getPtag = req.query.tagname;
  console.log("Tag name", getPtag);
  await client.connect();
  const db = client.db("fps_technology");
  const collection = db.collection("products");
  let results = await collection.find({ 'product_tags': getPtag }).limit(100).toArray();
  console.log("All tags product", results);
  res.json(results).status(200);
})


///Get product tags list
app.get("/tag-product-list_new", async (req, res) => {
  const getPtag = req.query.tagname;
  console.log("Tag name", getPtag);
  await client.connect();
  const db = client.db("fps_technology");
  const collection = db.collection("products");
  let results = await collection.find({ 'product_tags': getPtag }).toArray();
  console.log("All tags product", results);
  //res.json(results).status(200);

  ///Pagination
  const page = parseInt(req.query.page) || 1;
  //console.log("Page Number", page); return;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedItems = results.slice(startIndex, endIndex);
  const totalPages = Math.ceil(results.length / limit);
  console.log("Paginated object", paginatedItems);
  console.log("Total pages", totalPages);
  res.json({
    page,
    limit,
    totalPages,
    totalItems: results.length,
    items: paginatedItems
  });
})



////Filter Category data
app.get("/filter-cat-product-list", async (req, res) => {
  const getcatname = req.query.catgoryname;
  console.log("Category name", getcatname);
  const getFilterVal = req.query.filterVal;
  console.log("Filter Data", getFilterVal);

  await client.connect();
  const db = client.db("fps_technology");
  const collection = db.collection("products");
  console.log("Category name", getcatname);

  if (getFilterVal == 'rating') {
    await client.connect();
    let results = await collection.find({ 'product_cat': getcatname }).sort({ 'prod_rating': -1 }).toArray();
    console.log("All product", results);
    res.json(results).status(200);
  }

  if (getFilterVal == 'lowtoheigh') {
    let results = await collection.find({ 'product_cat': getcatname }).sort({ 'prod_price': 1 }).toArray();
    console.log("All product", results);
    res.json(results).status(200);
  }
  if (getFilterVal == 'hightolow') {
    let results = await collection.find({ 'product_cat': getcatname }).sort({ 'prod_price': -1 }).toArray();
    console.log("All product", results);
    res.json(results).status(200);
  }

  if (getFilterVal == 'latest') {
    let results = await collection.find({ 'product_cat': getcatname }).sort({ '_id': -1 }).toArray();
    console.log("All product", results);
    res.json(results).status(200);
  }

})



///show per page data
////Filter Category data
app.get("/perpage-cat-product-list", async (req, res) => {
  const getcatname = req.query.catgoryname;
  console.log("Category name", getcatname);
  const getFilterPage = parseInt(req.query.perpage);
  console.log("Filter Data", getFilterPage);

  await client.connect();
  const db = client.db("fps_technology");
  const collection = db.collection("products");
  console.log("Category name", getcatname);

  let results = await collection.find({ 'product_cat': getcatname }).limit(getFilterPage).toArray();
  console.log("All product", results);
  //res.json(results).status(200);
  const page = parseInt(req.query.page) || 1;
  //console.log("Page Number", page); return;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedItems = results.slice(startIndex, endIndex);
  const totalPages = Math.ceil(results.length / limit);
  console.log("Paginated object", paginatedItems);
  console.log("Total pages", totalPages);
  res.json({
    page,
    limit,
    totalPages,
    totalItems: results.length,
    items: paginatedItems
  });


})





////Filter Category data
app.get("/tagfilter-cat-product-list", async (req, res) => {
  const getcatname = req.query.tagname;
  console.log("Category name", getcatname);
  const getFilterVal = req.query.filterVal;
  console.log("Filter Data", getFilterVal);

  await client.connect();
  const db = client.db("fps_technology");
  const collection = db.collection("products");
  console.log("Category name", getcatname);

  if (getFilterVal == 'rating') {
    await client.connect();
    let results = await collection.find({ 'product_tags': getcatname }).sort({ 'prod_rating': -1 }).toArray();
    console.log("All product", results);
    //res.json(results).status(200);

    const page = parseInt(req.query.page) || 1;
    //console.log("Page Number", page); return;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedItems = results.slice(startIndex, endIndex);
    const totalPages = Math.ceil(results.length / limit);
    console.log("Paginated object", paginatedItems);
    console.log("Total pages", totalPages);
    res.json({
      page,
      limit,
      totalPages,
      totalItems: results.length,
      items: paginatedItems
    });
  }

  if (getFilterVal == 'lowtoheigh') {
    let results = await collection.find({ 'product_tags': getcatname }).sort({ 'prod_price': 1 }).toArray();
    console.log("All product", results);
    //res.json(results).status(200);

    const page = parseInt(req.query.page) || 1;
    //console.log("Page Number", page); return;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedItems = results.slice(startIndex, endIndex);
    const totalPages = Math.ceil(results.length / limit);
    console.log("Paginated object", paginatedItems);
    console.log("Total pages", totalPages);
    res.json({
      page,
      limit,
      totalPages,
      totalItems: results.length,
      items: paginatedItems
    });
  }
  if (getFilterVal == 'hightolow') {
    let results = await collection.find({ 'product_tags': getcatname }).sort({ 'prod_price': -1 }).toArray();
    console.log("All product", results);
    //res.json(results).status(200);

    const page = parseInt(req.query.page) || 1;
    //console.log("Page Number", page); return;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedItems = results.slice(startIndex, endIndex);
    const totalPages = Math.ceil(results.length / limit);
    console.log("Paginated object", paginatedItems);
    console.log("Total pages", totalPages);
    res.json({
      page,
      limit,
      totalPages,
      totalItems: results.length,
      items: paginatedItems
    });
  }

  if (getFilterVal == 'latest') {
    let results = await collection.find({ 'product_tags': getcatname }).sort({ '_id': -1 }).toArray();
    console.log("All product", results);
    //res.json(results).status(200);
    const page = parseInt(req.query.page) || 1;
    //console.log("Page Number", page); return;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedItems = results.slice(startIndex, endIndex);
    const totalPages = Math.ceil(results.length / limit);
    console.log("Paginated object", paginatedItems);
    console.log("Total pages", totalPages);
    res.json({
      page,
      limit,
      totalPages,
      totalItems: results.length,
      items: paginatedItems
    });
  }

})


///show per page data
////Filter Category data
app.get("/tagperpage-cat-product-list", async (req, res) => {
  const getcatname = req.query.tagname;
  console.log("Category name", getcatname);
  const getFilterPage = parseInt(req.query.perpage);
  console.log("Filter Data", getFilterPage);

  await client.connect();
  const db = client.db("fps_technology");
  const collection = db.collection("products");
  console.log("Category name", getcatname);

  let results = await collection.find({ 'product_tags': getcatname }).limit(getFilterPage).toArray();
  console.log("All product", results);
  //res.json(results).status(200);

  const page = parseInt(req.query.page) || 1;
  //console.log("Page Number", page); return;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedItems = results.slice(startIndex, endIndex);
  const totalPages = Math.ceil(results.length / limit);
  console.log("Paginated object", paginatedItems);
  console.log("Total pages", totalPages);
  res.json({
    page,
    limit,
    totalPages,
    totalItems: results.length,
    items: paginatedItems
  });


})



///Save Quotes data on 17.06.2024
app.post('/quote_save', async (req, res) => {
  //console.log("Req", req);
  //console.log("Res", res);
  //console.log("This is test"); 
  var name = req.body.qname;
  var email = req.body.email;
  var country = req.body.country;
  var contact = req.body.contact;
  var message = req.body.message;

  // Access the hidden field value
  var productName = req.body.productName;
  var quotesID = req.body.quotesID;
  console.log('Hidden Field Value:', productName);

  var data = {
    "name": name,
    "email": email,
    "country": country,
    "contact": contact,
    "message": message,
    "productName": productName,
    "quotesID": quotesID
  }
  //console.log("Quotes data", data); return;
  await client.connect();
  const db = client.db('fps_technology');
  console.log("DB", db);
  const collection = db.collection('quotes');

  db.collection('quotes').insertOne(data, function (err, collection) {
    if (err) throw err;
    console.log("Record inserted Successfully");

  });

  // Create a transporter object
  const transporter = nodemailer.createTransport({
    ///Local setup
    // host: 'mail.sleekinfo.com',
    // port: 587,  ///Local server
    // secure: false, // local
    // auth: {
    //   user: 'rakeshk@sleekinfo.com',
    //   pass: '^MW@7KjRbz&VU9mL',
    // }

    ///server setup
    host: 'smtppro.zoho.com',
    port: 465,  ///Local server
    secure: true, // local
    auth: {
      user: 'info@shopfpsonline.com',
      pass: 'TechMech@789',
    }

  });

  // Read the HTML template
  //const emailTemplate = fs.readFileSync(path.join(__dirname, 'emailTemplate.html'), 'utf-8');
  const emailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div class="email-container" style="width: 100%;max-width: 700px; margin: 40px 15px;">
        <h3 style="margin: 0; color: #000000; font-size: 18px;text-transform: capitalize;font-weight: 700;">Dear ${name},</h3>
        <p style="font-size: 16px;font-weight: 500;margin: 15px 0;text-transform: capitalize;  color: #000000;">your quote request recived sucessfully with below details.</p>
        <h2 style="margin: 0; color: #000000;font-size: 20px;text-transform: capitalize;background-color: #efe5e561;display: inline-block;padding: 10px;border-radius: 5px;">Customer Details</h2>
        <div class="email-dtl" style="margin-top: 20px;">
            <table style=" background-color: #efe5e561;width: 300px;border-radius: 10px;padding: 15px 20px;">
                <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Name:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${name}</td>
                </tr>
                <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Email:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${email}</td>
                </tr>
                <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Country:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${country}</td>
                </tr>
                <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Contact:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${contact}</td>
                </tr>
				
				<tr>
                <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Part:</td>
                <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${productName}</td>
               </tr>
				<tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Message:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${message}</td>
                </tr>
            </table>
        </div>
        <p style="font-size: 16px;font-weight: 500;margin: 15px 0;text-transform: capitalize;  color: #000000;">
        This e-mail is sent as confirmation for quote request on FPS Online</p>
    </div>
</body>
</html>`;



  const emailTemplateAdmin = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div class="email-container" style="width: 100%;max-width: 700px; margin: 40px 15px;">
        <h3 style="margin: 0; color: #000000; font-size: 18px;text-transform: capitalize;font-weight: 700;">Hello Admin,</h3>
        <p style="font-size: 16px;font-weight: 500;margin: 15px 0;text-transform: capitalize;  color: #000000;">You have received a quote request from ${name}</p>
        <h2 style="margin: 0; color: #000000;font-size: 20px;text-transform: capitalize;background-color: #efe5e561;display: inline-block;padding: 10px;border-radius: 5px;">Customer Details</h2>
        <div class="email-dtl" style="margin-top: 20px;">
            <table style=" background-color: #efe5e561;width: 300px;border-radius: 10px;padding: 15px 20px;">
                <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Name:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${name}</td>
                </tr>
                <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Email:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${email}</td>
                </tr>
                <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Country:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${country}</td>
                </tr>
                <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Contact:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${contact}</td>
                </tr>
				 
				 <tr>
					<td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Part:</td>
					<td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${productName}</td>
				 </tr>
				
				 <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Message:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${message}</td>
                </tr>
            </table>
        </div>
        <p style="font-size: 16px;font-weight: 500;margin: 15px 0;text-transform: capitalize;  color: #000000;">
        This e-mail is sent as confirmation for quote request on FPS Online</p>
    </div>
</body>
</html>`;

  // List of recipients
  const recipients = [email, 'devteam@sleekinfosolutions.com'];
  console.log("Recepits list", recipients);


  // Configure the mailoptions object
  const mailOptions = {
    //from: 'Shop FPS <info@fpstechnologies.in>',
    from: {
      name: 'FPS Technologies',
      address: 'info@shopfpsonline.com'
    },
    to: email,
    //to: recipients.join(','),
    subject: `New Quote Request [S${quotesID}] Received from ${name}, ${country} Successfully`,
    //text: 'That was easy!'
    html: emailTemplate // HTML body
  };
  //console.log("Mail options", mailOptions); 

  const mailOptionsAdmin = {
    //from: 'Shop FPS <info@fpstechnologies.in>',
    from: {
      name: 'FPS Technologies',
      address: 'info@shopfpsonline.com'
    },
    to: 'info@shopfpsonline.com',
    //to: 'devteam@sleekinfosolutions.com',
    //to: recipients.join(','),
    subject: `New Quote Request [S${quotesID}] Received from ${name}, ${country} Successfully`,
    //text: 'That was easy!'
    html: emailTemplateAdmin // HTML body
  };
  //console.log("Mail options", mailOptions); 

  // Send the email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Email sent to customer:', info.response);
    }
  });


  //Send the email to Admin
  transporter.sendMail(mailOptionsAdmin, function (error, info) {
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Email sent to Admin:', info.response);
    }
  });

  //return res.redirect('signup_success.html'); 
  console.log("All data", data);
  res.json(data).status(200);

})



///Contact form submit added on 12.08.2024
app.post('/contact_save', async (req, res) => {
  //console.log("Req", req);
  //console.log("Res", res);
  //console.log("This is test"); 
  var name = req.body.uname;
  var email = req.body.email;
  var country = req.body.country;
  var contact = req.body.contact;
  var message = req.body.message

  var data = {
    "name": name,
    "email": email,
    "country": country,
    "contact": contact,
    "message": message
  }
  //console.log("Conatct data", data); return;

  // await client.connect();
  // const db = client.db('fps_technology');
  // console.log("DB", db);
  // const collection = db.collection('quotes');

  // db.collection('quotes').insertOne(data,function(err, collection){ 
  //   if (err) throw err; 
  //   console.log("Record inserted Successfully"); 

  // }); 

  // Create a transporter object
  const transporter = nodemailer.createTransport({
    ///Local setup
    // host: 'mail.sleekinfo.com',
    // port: 587,  ///Local server
    // secure: false, // local
    // auth: {
    //   user: 'rakeshk@sleekinfo.com',
    //   pass: '^MW@7KjRbz&VU9mL',
    // }

    ///server setup
    host: 'smtppro.zoho.com',
    port: 465,  ///Local server
    secure: true, // local
    auth: {
      user: 'info@shopfpsonline.com',
      pass: 'TechMech@789',
    }

  });

  // Read the HTML template
  //const emailTemplate = fs.readFileSync(path.join(__dirname, 'emailTemplate.html'), 'utf-8');
  const emailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div class="email-container" style="width: 100%;max-width: 700px; margin: 40px 15px;">
        <h3 style="margin: 0; color: #000000; font-size: 18px;text-transform: capitalize;font-weight: 700;">Dear ${name},</h3>
        <p style="font-size: 16px;font-weight: 500;margin: 15px 0;text-transform: capitalize;  color: #000000;">your quote request recived sucessfully with below details.</p>
        <h2 style="margin: 0; color: #000000;font-size: 20px;text-transform: capitalize;background-color: #efe5e561;display: inline-block;padding: 10px;border-radius: 5px;">Customer Details</h2>
        <div class="email-dtl" style="margin-top: 20px;">
            <table style=" background-color: #efe5e561;width: 300px;border-radius: 10px;padding: 15px 20px;">
                <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Name:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${name}</td>
                </tr>
                <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Email:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${email}</td>
                </tr>
                <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Country:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${country}</td>
                </tr>
                <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Contact:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${contact}</td>
                </tr>
				<tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Part:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">Contact</td>
                </tr>
				<tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Message:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${message}</td>
                </tr>
            </table>
        </div>
        <p style="font-size: 16px;font-weight: 500;margin: 15px 0;text-transform: capitalize;  color: #000000;">
        This e-mail is sent as confirmation for quote request on FPS Online</p>
    </div>
</body>
</html>`;



  const emailTemplateAdmin = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div class="email-container" style="width: 100%;max-width: 700px; margin: 40px 15px;">
        <h3 style="margin: 0; color: #000000; font-size: 18px;text-transform: capitalize;font-weight: 700;">Hello Admin,</h3>
        <p style="font-size: 16px;font-weight: 500;margin: 15px 0;text-transform: capitalize;  color: #000000;">A new quote request received with below details.</p>
        <h2 style="margin: 0; color: #000000;font-size: 20px;text-transform: capitalize;background-color: #efe5e561;display: inline-block;padding: 10px;border-radius: 5px;">Customer Details</h2>
        <div class="email-dtl" style="margin-top: 20px;">
            <table style=" background-color: #efe5e561;width: 300px;border-radius: 10px;padding: 15px 20px;">
                <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Name:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${name}</td>
                </tr>
                <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Email:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${email}</td>
                </tr>
                <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Country:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${country}</td>
                </tr>
                <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Contact</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${contact}</td>
                </tr>
                <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Part:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">Contact</td>
                </tr>
				 <tr>
                    <td style="font-weight: 700;font-size: 16px;width: 30%; color: #000000;text-transform: capitalize;">Message:</td>
                    <td style="font-size: 16px;font-weight: 500;width: 70%; color: #000000;">${message}</td>
                </tr>
            </table>
        </div>
        <p style="font-size: 16px;font-weight: 500;margin: 15px 0;text-transform: capitalize;  color: #000000;">
        This e-mail is sent as confirmation for quote request on FPS Online</p>
    </div>
</body>
</html>`;

  // List of recipients
  const recipients = [email, 'devteam@sleekinfosolutions.com'];
  console.log("Recepits list", recipients);


  // Configure the mailoptions object
  const mailOptions = {
    //from: 'Shop FPS <info@fpstechnologies.in>',
    from: {
      name: 'FPS Technologies',
      address: 'info@shopfpsonline.com'
    },
    to: email,
    //to: recipients.join(','),
    subject: `New Quote Request Received from ${name}, ${country} Successfully`,
    //text: 'That was easy!'
    html: emailTemplate // HTML body
  };
  //console.log("Mail options", mailOptions); 

  const mailOptionsAdmin = {
    //from: 'Shop FPS <info@fpstechnologies.in>',
    from: {
      name: 'FPS Technologies',
      address: 'info@shopfpsonline.com'
    },
    to: 'info@shopfpsonline.com',
    //to: recipients.join(','),
    subject: `New Quote Request Received from ${name}, ${country} Successfully`,
    //text: 'That was easy!'
    html: emailTemplateAdmin // HTML body
  };
  //console.log("Mail options", mailOptions); 

  // Send the email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Email sent to customer:', info.response);
    }
  });


  //Send the email to Admin
  transporter.sendMail(mailOptionsAdmin, function (error, info) {
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Email sent to Admin:', info.response);
    }
  });

  //return res.redirect('signup_success.html'); 
  console.log("All data", data);
  res.json(data).status(200);

}) 
