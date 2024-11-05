const mongoose = require('mongoose')

const products =mongoose.model("products",{
    Name:{
        type:String,
        require:true
    },
    Description:{
        type:String,
        require:true
    },
    Price:{
        type:String,
        require:true
    }
})

module.exports=products;