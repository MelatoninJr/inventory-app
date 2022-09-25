const Category = require("../models/category");
const Item = require("../models/item")
const async = require('async')
const { body, validationResult } = require("express-validator");


// Display list of all Genre.
exports.category_list = (req, res) => {
    Category.find()
    .sort([["name", "ascending"]])
    .exec(function (err, list_categories) {
      if (err) {
        console.log('error')
        return next(err);
      }
      // Successful, so render.
      res.render("category_list", {
        title: "Category List",
        list_categories: list_categories,
      });
    });

};

// Display detail page for a specific Genre.
// Display detail page for a specific Genre.
exports.category_detail = (req, res, next) => {
    async.parallel(
      {
        genre(callback) {
          Category.findById(req.params.id).exec(callback);
        },
  
        category_items(callback) {
          Item.find({ category: req.params.id }).exec(callback);
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }
        if (results.category == null) {
          // No results.
          const err = new Error("Genre not found");
          err.status = 404;
          return next(err);
        }
        // Successful, so render
        res.render("category_detail", {
          name: "Category Detail",
          category: results.category,
          category_items: results.category_items,
        });
      }
    );
  };

  // Display Genre create form on GET.
exports.category_create_get = (req, res, next) => {
    res.render("category_form", { title: "Create Category" });
  };
  

// Display Genre create form on GET.
// Handle Genre create on POST.
exports.category_create_post = [
    // Validate and sanitize the name field.
    body("name", "Category name required").trim().isLength({ min: 1 }).escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a genre object with escaped and trimmed data.
      const category = new Category({ 
        name: req.body.name,
        description: req.body.description
    });
  

      category.save((err) => {
        if (err) {
            console.log(err)
          return next(err);
        }
        // Genre saved. Redirect to genre detail page.
        res.redirect(category.url);
      });
    },
  ];
  


  

// Display Genre delete form on GET.
exports.category_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre delete GET");
};

// Handle Genre delete on POST.
exports.category_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre delete POST");
};

// Display Genre update form on GET.
exports.category_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
};

// Handle Genre update on POST.
exports.category_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
};
