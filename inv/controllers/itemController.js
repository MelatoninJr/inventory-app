const Item = require("../models/item");
const Category = require("../models/category")
var async = require('async')
const { body, validationResult } = require("express-validator");
const item = require("../models/item");


exports.index = (req, res) => {
    async.parallel({

        item_count(callback) {
            Item.countDocuments({}, callback)
        },
        category_count(callback) {
            Category.countDocuments({}, callback)
        },

    },
    
    (err, results) => {
        res.render("index", {
            title: "Item Shop Home",
            error: err,
            data: results,
        })
    }
    )
};

// Display list of all books.
exports.item_list = (req, res) => {
    Item.find()
    .sort([["name", "ascending"]])
    .exec(function (err, list_items) {
      if (err) {
        console.log('error')
        return next(err);
      }
      // Successful, so render.
      res.render("item_list", {
        title: "Items List",
        list_items: list_items,
      });
    });

};

// Display detail page for a specific book.
exports.item_detail = (req, res, next) => {
    async.parallel(
      {
        item(callback) {
          Item.findById(req.params.id)
            .populate("category")
            .exec(callback);
        },

      },
      (err, results) => {
        if (err) {
          return next(err);
        }
        if (results.item == null) {
          // No results.
          const err = new Error("Book not found");
          err.status = 404;
          return next(err);
        }
        // Successful, so render.
        res.render("item_detail", {
          name: results.item.name,
          item: results.item,
        });
      }
    );
  };
  

// Display book create form on GET.
// Display book create form on GET.
exports.item_create_get = (req, res, next) => {
    // Get all authors and genres, which we can use for adding to our book.
    async.parallel(
      {
        categorys(callback) {
          Category.find(callback);
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }
        res.render("item_form", {
          title: "Create Item",
          categorys: results.categorys,
        });
      }
    );
  };
  

// Handle book create on POST.
exports.item_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
      if (!Array.isArray(req.body.category)) {
        req.body.category =
          typeof req.body.category === "undefined" ? [] : [req.body.category];
      }
      next();
    },
  
    // Validate and sanitize fields.
    body("name", "Name must not be empty.")
      .trim()
      .isLength({ min: 3 })
      .escape(),
    body("category", "Category must not be empty.")
      .trim()
      .escape(),
    body("description", "Description must not be empty.")
      .trim()
      .isLength({ min: 3 })
      .escape(),
      body("price", "Price must not be empty.")
      .trim()
      .escape(),
      body("stock", "Stock must not be empty.")
      .trim()
      .escape(),
      body("link", "Link must not be empty.")
      .trim()
      .escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a Book object with escaped and trimmed data.
      const item = new Item({
        name: req.body.name,
        category: req.body.category,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock,
        link: req.body.link,
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        console.log('error')
        // Get all authors and genres for form.
        async.parallel(
          {
            categorys(callback) {
              Category.find(callback);
            },
          },
          (err, results) => {
            if (err) {
              return next(err);
            }
  
            // Mark our selected genres as checked.
 
            res.render("item_form", {
              name: results.name,
              categorys: results.categorys,
              descriptions: results.descriptions,
              item,
              errors: errors.array(),
            });
          }
        );
        return;
      }
  
      // Data from form is valid. Save book.
      item.save((err) => {
        if (err) {
          return next(err);
        }
        // Successful: redirect to new book record.
        res.redirect(item.url);
      });
    },
  ];
  

// Display book delete form on GET.
exports.item_delete_get = function (req, res, next) {
    async.parallel(
      {
        item: function (callback) {
          Item.findById(req.params.id)
            .populate("category")
            .exec(callback);
        },

      },
      function (err, results) {
        if (err) {
          return next(err);
        }
        if (results.item == null) {
          // No results.
          res.redirect("/shop/items");
        }
        // Successful, so render.
        res.render("item_delete", {
          name: "Delete Item",
          item: results.item,
        });
      }
    );
  };

// Handle book delete on POST.
exports.item_delete_post = function (req, res, next) {
    // Assume the post has valid id (ie no validation/sanitization).
  
    async.parallel(
      {
        item: function (callback) {
          Item.findById(req.body.id)
            .populate("category")
            .exec(callback);
        },

      },
      function (err, results) {
        if (err) {
          return next(err);
        }
        // Success
 
          // Book has no BookInstance objects. Delete object and redirect to the list of books.
          Item.findByIdAndRemove(req.body.id, function deleteItem(err) {
            if (err) {
              return next(err);
            }
            // Success - got to books list.
            res.redirect("/shop/items");
          });
        
      }
    );
  };

// Display book update form on GET.
exports.item_update_get = function (req, res, next) {
    // Get book, authors and genres for form.
    async.parallel(
      {
        item: function (callback) {
          Item.findById(req.params.id)
            .populate("category")
            .exec(callback);
        },
        categorys: function (callback) {
          Category.find(callback);
        },

      },
      function (err, results) {
        if (err) {
          return next(err);
        }
        if (results.item == null) {
          // No results.
          var err = new Error("Book not found");
          err.status = 404;
          return next(err);
        }
        // Success.
        // Mark our selected genres as checked.
        for (
          var all_g_iter = 0;
          all_g_iter < results.categorys.length;
          all_g_iter++
        ) {

        }
        res.render("item_form", {
          name: "Update Item",
          categorys: results.categorys,
          descriptions: results.descriptions,
        });
      }
    );
  };

// Handle book update on POST.
exports.item_update_post = [
    // Convert the genre to an array.
    (req, res, next) => {
      if (!(req.body.category instanceof Array)) {
        if (typeof req.body.category === "undefined") req.body.category = [];
        else req.body.category = new Array(req.body.category);
      }
      next();
    },
  
    // Validate and sanitize fields.
    body("name", "Name must not be empty.")
      .trim()
      .isLength({ min: 3 })
      .escape(),
    body("category", "Category must not be empty.")
      .trim()
      .escape(),
    body("description", "Description must not be empty.")
      .trim()
      .isLength({ min: 3 })
      .escape(),
      body("price", "Price must not be empty.")
      .trim()
      .escape(),
      body("stock", "Stock must not be empty.")
      .trim()
      .escape(),
      body("link", "Link must not be empty.")
      .trim()
      .escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a Book object with escaped/trimmed data and old id.
      var item = new Item({
        name: req.body.name,
        category: req.body.category,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock,
        link: req.body.link,
        _id: req.params.id, // This is required, or a new ID will be assigned!
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
  
        // Get all authors and genres for form
        async.parallel(
          {
            categorys: function (callback) {
              Category.find(callback);
            },
  
          },
          function (err, results) {
            if (err) {
              return next(err);
            }
  
            // Mark our selected genres as checked.

            res.render("item_form", {
                name: results.name,
                categorys: results.categorys,
                descriptions: results.descriptions,
                item,
              errors: errors.array(),
            });
          }
        );
        return;
      } else {
        // Data from form is valid. Update the record.
        Item.findByIdAndUpdate(req.params.id, item, {}, function (err, theitem) {
          if (err) {
            return next(err);
          }
          // Successful - redirect to book detail page.
          res.redirect(theitem.url);
        });
      }
    },
  ];