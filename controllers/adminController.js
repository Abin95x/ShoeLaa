const Admin = require("../models/adminModel")
const User = require("../models/userModel")
const Category = require("../models/categoryModel")
const Product = require("../models/productModel")
const Order = require("../models/orderModel")
const mongoose = require('mongoose');
const fs = require('fs')

//login-----------------------------------------------------------------------------------------------------
const adminLogin = async (req, res ,next) => {
  try {
    res.render("adminLogin")
  } catch (error) {
    next(error);
  }
}

const verifyAdmin = async (req, res ,next) => {
  try {

    const email = req.body.email
    const password = req.body.password

    const adminData = await Admin.findOne({ email: email })
    if (adminData) {
      if (password == adminData.password) {
        req.session.adminId = adminData._id
        res.redirect("/admin/home")
      }
      res.render("adminLogin", { message1: "wrong password" })
    } else {
      res.render("adminLogin", { message2: "invalid admin account" })
    }

  } catch (error) {
    next(error);
  }
}


//home
const home = async (req, res ,next) => {
  try {
    const orders = await Order.find({}).populate('products');  
    const orderCount = orders.length;
    const products = await Product.find({})
    const productsCount = products.length
    const category = await Category.find({})
    const categoryCount = category.length
    const moment = require('moment');


    const placedCount = await Order.find({ "products.status": "Placed" }).count();
    const deliveredCount = await Order.find({ "products.status": "Delivered" }).count();
    const cancelledCount = await Order.find({ "products.status": "cancelled" }).count();
    const returnedCount = await Order.find({ "products.status": "Returned"}).count();

  
      let currentDate = new Date();
      currentDate.setHours(0);
      currentDate.setMinutes(0);
      currentDate.setSeconds(0);
      currentDate.setMilliseconds(0);
    
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(currentDate);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
    
      const currentWeekRevenue = await Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
            date: { $gte: startOfWeek, $lte: endOfWeek },
          },
        },
        {
          $unwind: "$products",
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$products.totalPrice" }, 
            count: { $sum: 1 },
          },
        },
      ]);

      const totalRevenue = await Order.aggregate([
        {
          $match: { status: { $ne: "cancelled" } },
        },
        {
          $unwind: "$products"
        },
        {
          $group: { _id: null, total: { $sum: "$products.totalPrice" } },
        },
      ]);
      if (totalRevenue.length === 0) {
        totalRevenue.push({ _id: null, total: 0 });
      }
   
    if (currentWeekRevenue.length === 0) {
      currentWeekRevenue.push({ _id: null, total: 0, count: 0 });
    }
    let sales = [];
    let date = new Date();
    let year = date.getFullYear();
    let currentYear = new Date(year, 0, 1);
    let salesByYear = await Order.aggregate([
      {
        $unwind: "$products"
      },
      {
        $match: {
          "products.status": { $ne: "cancelled" }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%m", date: "$createdAt" } },
          total: { $sum: "$products.totalPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    
    for (let i = 1; i <= 12; i++) {
      let result = true;
      for (let j = 0; j < salesByYear.length; j++) {
        result = false;
        if (salesByYear[j]._id == i) {
          sales.push(salesByYear[j]);
          break;
        } else {
          result = true;
        }
      }
      if (result) sales.push({ _id: i, total: 0, count: 0 });
    }
    let salesData = [];
    for (let i = 0; i < sales.length; i++) {
      salesData.push(sales[i].total);
    }
    
    
    res.render("home", {
      orderCount,
      productsCount,
      categoryCount,
      orders,
      placedCount,
      cancelledCount,
      deliveredCount,
      returnedCount,
      currentWeekRevenue,
      totalRevenue,
      salesData,
      moment: moment

    }); 
  } catch (error) {
    next(error);
  }
};


//user Management------------------------------------------------------------------------------------------------

const userManage = async (req, res) => {
  try {
    const users = await User.find({})
    res.render("userManagement", { users })
  } catch (error) {
    console.log(error.message)
  }
}

//user block unblock
const userBlock = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById(id);
    if (userData.isBlock === false) {
      await User.updateOne({ _id: id }, { $set: { isBlock: true } });
      res.redirect("/admin/userManage");
    } else {
      await User.updateOne({ _id: id }, { $set: { isBlock: false } });
      res.redirect("/admin/userManage");
    }
  } catch (err) {
    console.log(err.message);
  }
};

const logout = async(req,res,next) => {
  try{
    req.session.destroy();
    res.redirect('/admin/adminLogin')
  }catch(error){
    next(error)
  }
}














module.exports = {
  adminLogin,
  verifyAdmin,
  home,
  userManage,
  userBlock,
  logout,
 
  

}