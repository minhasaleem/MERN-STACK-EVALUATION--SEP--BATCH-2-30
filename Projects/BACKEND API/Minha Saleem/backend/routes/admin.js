var express = require('express');
const products = require('../models/model-product');
const multer = require('multer')
const path =require('path')
var router = express.Router();

router.post('/add',async(req,res)=>{
  try{
    const newdata = new products({
    Name:req.body.Name,
    Description:req.body.Description,
    Price:req.body.Price
    });
    newdata.save()
    res.json({
      status:"success",
      message:"successfully added",
      productName:newdata.Name
    });
  }catch(error){
    console.error('Error adding product:', error.message);
    res.status(500).json({
      status:"error",
      message:"failed to add",
      error:error.message,
    });
  }
  });

router.get('/get-products',async(req,res)=>{
  try{
    const getproducts = await products.find()
    res.json({
      status:"success",
      message:"successfully fetched",
      products:getproducts
    })
  }
  catch(error){
    console.error('Error fetching product:', error.message);
    res.status(500).json({
      status:"error",
      message:"failed to fetch",
      error:error.message,
    });
  }
  })

router.get('/get-productsbyId',async(req,res)=>{
  try{
    if(!req.body.id){
      return res.status(400).json({
        status:"error",
        message:"Product id is required"
      })
    }
    const getproduct = await products.findById({_id:req.body.id})
    if(!product){
       return res.status(404).json({
        status:"error",
        message:"Product was not found"
       })
    }
    console.log(getproduct);
    res.json({
      status:"success",
      product:getproduct
   })
  }
  catch(error){
    console.error('Error fetching product:', error.message);
    res.status(500).json({
      status:"error",
      message:"failed to fetch",
      error:error.message,
    });
  }
})

router.post('/update-products',async(req,res)=>{
  try{
    if(!req.body.id){
      return res.status(400).json({
        status:"error",
        message:"product id is required"
      })
    }
const updated=await products.findByIdAndUpdate(
  {_id:req.body.id},
  {Name:req.body.Name},
  {Description:req.body.Description},
  {Price:req.body.Price}
)
if(!updated){
  returnres.status(404).json({
    status: "error",
    message: "Product not found or not updated",
  });
}
res.json({
  status:"success",
  message:"successfully updated",
  updatedproduct:updated
})
}
catch(error){
  console.error('Error updating product:', error.message);
  res.status(500).json({
    status:"error",
    message:"failed to update",
    error:error.message,
  });
}
console.log(updated);
})

router.post('/delete-products',async(req,res)=>{
  try {
    if (!req.body.id) {
      return res.status(400).json({
        status: "error",
        message: "Product ID is required",
      });
    }
const deleted=await products.findByIdAndDelete(
  {_id:req.body.id},
)
if (!deleted) {
  return res.status(404).json({
    status: "error",
    message: "Product not found or already deleted",
  });
}
res.json({
  status:"success",
  message:"successfully deleted",
  updatedproduct:deleted
})
  }
catch (error) {
  console.error('Error deleting product:', error.message);
  res.status(500).json({
    status: "error",
    message: "Failed to delete product",
    error: error.message,
  });
}
})


const app = express();
// Configure Multer storage options
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images');
  },
  filename: (req, file, cb) => {
    // Use the original filename or customize it
    cb(null, Date.now() + path.extname(file.originalname)); // Appending the timestamp for uniqueness
  }
});
const upload = multer({ storage });
// Define the upload route
router.post('/uploads', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'fail',
      message: 'No file uploaded'
    });
  }
  if(req.file)
  res.json({
    status: 'success',
    message: 'File uploaded successfully',
    file: req.file // Include file details in the response if needed
  });
})

module.exports = router;
