const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");
const axios = require('axios');
const Search = require('../models/search');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit'); // Import pdfkit
require('dotenv').config();
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
  try {
    const users = await Search.find();

    // Create PDF document
    const doc = new PDFDocument();

    // Set response headers for PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="users.pdf"');

    // Pipe PDF document to response
    doc.pipe(res);

    // Write PDF content
    doc.fontSize(12).text('Users Data\n\n');
    users.forEach(user => {
      doc.text(`fromPin: ${user.fromPin}, toPin: ${user.toPin}, distance: ${user.distance}\n`);
      // Add more fields if needed
    });

    // Finalize PDF document
    doc.end();
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).send('Error exporting data');
  }
});

// Export data to Excel
exports.exportEXCEL = catchAsyncErrors(async (req, res) => {
  try {
    const users = await Search.find();

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    // Define worksheet headers
    worksheet.columns = [
      { header: 'fromPin', key: 'fromPin', width: 20 },
      { header: 'toPin', key: 'toPin', width: 20 },
      { header: 'distance', key: 'distance', width: 20 },
   
    ];

    // Populate worksheet with user data
    users.forEach(user => {
      worksheet.addRow({
        fromPin: user.fromPin,
        toPin: user.toPin,
        distance: user.distance,
 
        // Add more fields as needed
      });
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="users.xlsx"');

    // Serialize workbook to response
    await workbook.xlsx.write(res);

    // End response
    res.end();
  } catch (error) {
    console.error('Error downloading users:', error);
    res.status(500).send('Error downloading users');
  }
});