const Admin = require("../models/adminModel")
const User = require("../models/userModel")
const Category = require("../models/categoryModel")
const Product = require("../models/productModel")
const mongoose = require('mongoose');
const fs = require('fs')


//category Management-

const categoryLoad = async (req, res , next) => {
    try {
      const categories = await Category.find({})
      res.render("categoryManagement", { categories })
    } catch (error) {
      next(error)
    }
  }
  //add category
  const addCategory = async (req, res , next) => {
    try {
      const name = req.body.name;
      const categories = await Category.find({})
  
      if (name.trim().length === 0) {
        res.redirect("/admin/categoryManagement");
      } else {
        const existingCategory = await Category.findOne({
          name: { $regex: new RegExp(`^${name}$`, "i") }, // Case-sensitive uniqueness check
        });
  
        if (existingCategory) {
          res.render("categoryManagement",{message:"cannot be added",categories});
        } else {
          const categoryData = new Category({ name: name });
  
          const addData = await categoryData.save();
          res.redirect("/admin/categoryManagement");
        }
      }
    } catch (error) {
      next(error)
    }
  };
  
  
  const categoryUnlist = async (req, res , next) => {
    try {
      const id = req.query.id;
      const categoryData = await Category.findById(id);
      if (categoryData.blocked === false) {
        await Category.updateOne({ _id: id }, { $set: { blocked: true } });
        res.redirect("/admin/categoryManagement");
      } else {
        await Category.updateOne({ _id: id }, { $set: { blocked: false } });
        res.redirect("/admin/categoryManagement");
      }
  
    } catch (error) {
      next(error)
    }
  }
  
  const getCategoryEdit = async (req, res , next) => {
    const { id } = req.query;
    try {
      const category = await Category.findById(id);
      if (category) {
        return res.render("categoryEdit", { category })
      }
      return res.redirect('/admin/categoryManagement')
    } catch (error) {
      console.log(error);
    }
  }
  
  const categoryEdit = async (req, res, next) => {
    try {
      const id = req.body._id
       const categoryName = req.body.categoryName.trim();
       
       if (!categoryName) {
        const categories = await Category.find({})
        res.render("categoryManagement", { categories ,message2:"cannot add spaces..."})
       }else{
        const editData = await Category.findByIdAndUpdate(id, { $set: { name: req.body.categoryName } }, { new: true })
        res.redirect('/admin/categoryManagement')
       }
      
      
    } catch (error) {
      console.log(error);
    }
  }

  module.exports = {
    categoryLoad,
    addCategory,
    categoryUnlist,
    getCategoryEdit,
    categoryEdit,
  }