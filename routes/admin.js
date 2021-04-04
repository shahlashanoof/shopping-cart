const { response } = require('express');
var express = require('express');
var router = express.Router();
const productHelpers=require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const verifyLogin=(req,res,next)=>{
  if(req.session.adminLogedIn){
    next()
  }else{
    res.redirect('/admin/login')
  }

}
/* GET users listing. */
router.get('/', function(req, res, next) {
  let admin=req.session.admin
  productHelpers.getAllProducts().then((products)=>{

    console.log(products)
    res.render('admin/view-products',{admin:true,products ,admin})

  })
  
});
router.get('/login',(req,res)=>{
  if(req.session.admin){
    res.redirect('/admin/')
  }else{
  res.render('admin/login',{"loginErr":req.session.adminLoginErr})
  req.session.adminLoginErr=false
 // res.redirect('/admin/login')
}
})
router.get('/signup',(req,res)=>{
  res.render('admin/signup')
})
router.post('/signup',(req,res)=>{
  productHelpers.doSignup(req.body).then((response)=>{
    //console.log(response)
    
    req.session.admin=response
    req.session.adminLogedIn=true
    res.redirect('/admin/')
  })
})
router.post('/login',(req,res)=>{
  productHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      
      req.session.admin=response.admin
      req.session.adminLogedIn=true
      res.redirect('/admin/')
    }else{
      req.session.adminLoginErr="Invalid username or password"
     res.redirect('/admin/login')
    }
  })
})
router.get('/logout',(req,res)=>{
req.session.admin=null
req.session.adminLogedIn=false
res.redirect('/admin/')
})
router.get('/add-product',verifyLogin,function(req,res){
  res.render('admin/add-product',{'admin':req.session.admin})

})
router.post('/add-product',verifyLogin,(req,res)=>{
console.log(req.body);
console.log(req.files.image);
productHelpers.addProduct(req.body,(id)=>{
  let image=req.files.image
  image.mv('./public/product-images/'+id+'.jpeg',(err,done)=>{
    if(!err){
      res.render('admin/add-product',{'admin':req.session.admin})

    }
    else
    console.log(err )
  })

})

})
router.get('/delete-product/:id',verifyLogin,(req,res)=>{
  let proId=req.params.id
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/',{'admin':req.session.admin})
  })

})
router.get('/edit-product/:id',verifyLogin,async(req,res)=>{
  let product=await productHelpers.getProductDetails(req.params.id)
  res.render('admin/edit-product',{product,'admin':req.session.admin})
})
router.post('/edit-product/:id',verifyLogin,(req,res)=>{
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin',{'admin':req.session.admin})
    if(req.files.image){
      let id=req.params.id
      let image=req.files.image
      image.mv('./public/product-images/'+id+'.jpeg')
    

    }
  })

})
router.get('/all-placed-orders',verifyLogin,(req,res,next)=>{
  productHelpers.getPlacedUserDetails().then((products)=>{

    console.log(products)
    res.render('admin/all-placed-orders',{admin:true,products,'admin':req.session.admin })

  })
  
})
router.get('/products-to-ship/:id',verifyLogin,async(req,res)=>{
  let products=await productHelpers.getShipmentProducts(req.params.id)
  res.render('admin/products-to-ship',{admin:true,products,'admin':req.session.admin})
})
router.get('/shipment-process/:id',(req,res,next)=>{
productHelpers.shipmentProcess(req.params.id).then((response)=>{
  console.log('aaaaaa');
 // res.json({status:true})
  res.redirect('/admin/all-placed-orders')
})
})
router.get('/all-users',verifyLogin,(req,res,next)=>{
  let admin=req.session.admin
  productHelpers.allusers().then((users)=>{

    console.log(users)
    res.render('admin/all-users',{admin:true,users ,admin})

  })
})



module.exports = router;
