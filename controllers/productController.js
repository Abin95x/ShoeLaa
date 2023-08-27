const Admin = require("../models/adminModel")
const User = require("../models/userModel")
const Category = require("../models/categoryModel")
const Product = require("../models/productModel")
const mongoose = require('mongoose');
const fs = require('fs')
const path = require("path")
const sharp = require("sharp")




//list loading
const productsPerPage = 4; // Number of products per page

const loadProductList = async (req, res, next) => {
    try {
      
    const { page } = req.query;
    let condition = { blocked: false };
    const currentPage = parseInt(page) || 1
    const productsCount = await Product.countDocuments(condition);
    const totalPages = Math.ceil(productsCount / productsPerPage);
    // const products = await Product.find(condition
      const products = await Product.find(condition).populate('category')
      .skip((currentPage - 1) * productsPerPage)
      .limit(productsPerPage);
  
      res.render("productList", { products: products ,totalPages,currentPage,page});
    } catch (error) {
     next(error)
    }
  };
  
  
  //add product loading
  const loadProductAdd = async (req, res, next) => {
    try {
      const categoryData = await Category.find({ blocked: false })
  
      res.render("productAdd", { categoryData: categoryData })
  
    } catch (error) {
     next(error)
    }
  }
  
  //adding
  const addProduct = async (req, res, next) => {
    try {
      
      const resizeImg = []
      
      if (req.files && req.files.length > 0){
        for(let i=0 ; i < req.files.length ; i++){
          const resizedPath = path.join(__dirname, "../public/admin_assets/product/crop",req.files[i].filename)
          const destinationDir = path.dirname(resizedPath);
          fs.mkdirSync(destinationDir, { recursive: true });
          await sharp(req.files[i].path).
          resize(1000,800,{fit:"fill"}).
          toFile(resizedPath)
    
          resizeImg[i] = req.files[i].filename
        }
      }
  
      const Data = new Product({
        name: req.body.name,
        price: req.body.price,
        offerPrice: req.body.offerPrice,
        category: req.body.category,
        quantity: req.body.quantity,
        description: req.body.description,
        image: resizeImg,
        blocked: false,
  
      });
      
  
      const productData = await Data.save();
  
      if (productData) {
        res.redirect("/admin/productList");
      } else {
        res.render("productAdd", { message: "error" });
      }
    } catch (error) {
     next(error)
    }
  };
  
  //edit
  const loadProductEdit = async (req, res, next) => {
    try {
      const id = req.params.id
  
      const product = await Product.findOne({ _id: id }).populate('category')
      const category = await Category.find({ blocked: false })
  
      res.render("productEdit", { product, category })
  
    } catch (error) {
     next(error)
    }
  }
  
  const editProduct = async (req, res, next) => {
    try {
      var images = [];
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          images.push(req.files[i].filename);
        }
      }
  
      const id = req.params.id;
      
      const newName = req.body.name;
      const newPrice = req.body.price;
      const newDescri = req.body.description;
      const newCat = req.body.category;
      const newQuantity = req.body.quantity;
  
      const imageUpdate = await Product.findOneAndUpdate(
        { _id: id },
        { $push: { image: { $each: images } } }
      );
      
      const editedProduct = await Product.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            name: newName,
            price: newPrice,
            description: newDescri,
            category: newCat,
            quantity: newQuantity,
          },
        }
      );

      res.redirect(`/admin/productList?id=${id}`);
      
    } catch (err) {
      console.log(err.message);
    }
  };

  
  const deleteImage = async (req, res, next) => {
      try {
          const id = req.params.id;
          const image = req.params.image;
  
          // Delete the file from the server
          fs.unlink(path.join(__dirname, '../public/admin_assets/product', image), (err) => {
              if (err) {
                  console.error('Error deleting image:', err);
              } else {
                  console.log('Image deleted successfully');
              }
          });
  
          // Remove the image reference from the database
          const deleImg = await Product.updateOne({ _id: id }, { $pull: { image: image } });
  
          if (deleImg) {
              res.redirect(`/admin/productList?id=${id}`);
          }
  
      } catch (error) {
          next(error)
      }
  }
  
  
  
  
  
  const unlistProduct = async (req, res, next) => {
    try {
  
      const id = req.query.id
     
      const productData = await Product.findById({_id : id})
      if (productData.blocked === false) {
        await Product.updateOne({ _id: id }, { $set: { blocked: true } })
        res.redirect("/admin/productList")
      } else {
        await Product.updateOne({ _id: id }, { $set: { blocked: false } });
        res.redirect("/admin/productList")
      }
  
    } catch (error) {
     next(error)
    }
  }
  
  
  
  
  module.exports ={
    loadProductAdd,
    loadProductList,
    addProduct,
    loadProductEdit,
    editProduct,
    unlistProduct,
    deleteImage,
  }