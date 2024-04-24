const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");
const axios = require('axios');
const Search = require('../models/search');
const excelJS = require("exceljs");
const fs = require('fs');
const path = require('path');
const API_KEY = process.env.API_KEY


exports.index = catchAsyncErrors((req,res)=>{
   res.render('index',{title: "Home page"});
});

exports.search = catchAsyncErrors(async(req,res)=>{
    const { fromPin, toPin } = req.body;

    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${fromPin}&destinations=${toPin}&key=${API_KEY}`);
      
      if (!response.data || !response.data.rows || !response.data.rows[0] || !response.data.rows[0].elements || !response.data.rows[0].elements[0]) {
        return res.status(400).send('Invalid PIN codes or no route found');
      }

      const distance = response.data.rows[0].elements[0].distance.text;
  
      const search = new Search({ fromPin, toPin, distance });
      await search.save();

      res.render('result', { fromPin, toPin, distance });
    } catch (error) {
      console.error(error);
      res.status(500).send('Requested data is not available');
    }
});

exports.viewAll = catchAsyncErrors(async (req,res)=>{
    const search = await Search.find();
    res.render('viewAll',{distances:search});
})

exports.exportPDF = catchAsyncErrors(async (req, res) => { 
    res.send("In progress...")
});

// Export data to Excel
exports.exportEXCEL = catchAsyncErrors(async (req, res) => { 
    res.send("In progress...")
});