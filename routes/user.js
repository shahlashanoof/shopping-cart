const { response } = require('express');
var express = require('express');
var router = express.Router();
const productHelpers=require('../helpers/product-helpers');
const userHelpers=require('../helpers/user-helpers')
const verifyLogin=(req,res,next)=>{
  if(req.session.userLogedIn){
    next()
  }else{
    res.redirect('/login')
  }

}
/* GET home page. */
router.get('/', async function(req, res, next) {
  let user=req.session.user
  //console.log(user)
  let cartCount=null

  if(req.session.user){
  cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products)=>{
   // console.log(products)
    res.render('users/view-products',{products ,user,cartCount})

  })
  

});
router.get('/login',(req,res)=>{
  if(req.session.user){
    res.redirect('/')
  }else{
  res.render('users/login',{"loginErr":req.session.userLoginErr})
  req.session.userLoginErr=false
}
})
router.get('/signup',(req,res)=>{
  res.render('users/signup')
})
router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    //console.log(response)
    
    req.session.user=response
    req.session.userLogedIn=true
    res.redirect('/')
  })
})
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      
      req.session.user=response.user
      req.session.userLogedIn=true
      res.redirect('/')
    }else{
      req.session.userLoginErr="Invalid username or password"
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
req.session.user=null
req.session.userLogedIn=false
res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
  totalValue=0
  if(products.length>0){
  totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  }
 //console.log(products)
  res.render('users/cart',{products,'user':req.session.user,totalValue})
})
router.get('/add-to-cart/:id',(req,res)=>{
  console.log("api call")
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    //res.redirect('/')
    res.json({status:true})
  })
}),
router.post('/change-product-quantity',(req,res,next)=>{
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
     response.total=await userHelpers.getTotalAmount(req.body.user)
    res.json(response)


  })
}),
router.post('/remove-from-cart',(req,res,next)=>{
  userHelpers.removeItemFromCart(req.body).then((response)=>{
    res.json(response)

  })
}),
router.get('/place-order',verifyLogin,async(req,res)=>{
 let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('users/place-order',{total,'user':req.session.user})

}),
router.post('/place-order',async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true})

    }else{
      userHelpers.generateRazorPay(orderId,totalPrice).then((response)=>{
        res.json(response)

      })
    }
    

  })
  console.log(req.body)
}),
router.get('/order-placed',verifyLogin,(req,res)=>{
  let details=userHelpers.getUserOrders(req.session.user._id)
  userHelpers.saveToAdminDb(req.session.user._id,details)
  res.render('users/order-placed',{'user':req.session.user})
}),
router.get('/delivery-details',verifyLogin,async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  res.render('users/delivery-details',{'user':req.session.user,orders})
}),
router.get('/view-order-products/:id',verifyLogin,async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  res.render('users/view-order-products',{'user':req.session.user,products})

}),
router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log('Payment success');
      res.json({status:true})
    })

  }).catch((err)=>{
    console.log(err )
    res.json({status:false,errMsg:''})
  })
})



module.exports = router;
