#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Item = require('./models/item')
var Category = require('./models/category')



var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var categorys = []
var items = []



function categoryCreate(name, description, link, cb) {
  categorydetail = {
    name: name,
    description: description,
    link: link
  }
  var category = new Category(categorydetail)
  category.save(function (err) {
    if(err) {
      return;
    }
    console.log('New Category:' + category);
    categorys.push(category)
    cb(null, category)
  })


}



function itemCreate(name, description, category, price, stock, link) {

  itemdetail = {
    name: name,
    description: description,
    category: category,
    price: price,
    stock: stock,
    link: link
  }


  var item = new Item(itemdetail);
  item.save(function (err) {
    if(err) {
      console.log('error')
      return
    }
    console.log('New Item: ' + item)
    items.push(item)
  });
}

function createCategorys(cb) {
  async.series([
    function(callback) {
      categoryCreate("Electric Type", "Features only Electric pokémon", "/Pikachu", callback);
    },
    function(callback) {
      categoryCreate("Water/Ice Type", "Features combination water types", "/Piplup", callback);
    },
    function(callback) {
      categoryCreate("Normal Type", "Features normal type pokémon", "/Snorlax", callback);
    },



  ], cb)
}

function createItems(cb) {
  async.parallel([
    function(callback) {
      itemCreate("Pikachu", "Friendly Pikachu Plushie", categorys[0], 39.99, 42, "https://www.pokemoncenter.com/products/images/P7730/701-29237/P7730_701-29237_01_full.jpg", callback)
    },
    function(callback) {
      itemCreate("Piplup", "Squishy Penguin Friend", categorys[1], 22.79, 8, "https://www.pokemoncenter.com/products/images/P8020/701-29490/P8020_701-29490_01_full.jpg", callback)
    },
    function(callback) {
      itemCreate("Snorlax", "He loves to eat everything", categorys[2], 44.99, 2, "https://target.scene7.com/is/image/Target/GUEST_faefc03d-8494-49f5-a12b-3705a9a248b8?wid=800&hei=800&qlt=80&fmt=pjpeg", callback)
    },


  ], cb)
}







async.series([
  createCategorys,
  createItems
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('ItemInnstances: '+items);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});




