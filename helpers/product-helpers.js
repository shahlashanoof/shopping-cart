var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
var objectId=require('mongodb').ObjectId
const { response } = require('express')
module.exports={
    doSignup:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
          adminData.Password= await bcrypt.hash(adminData.Password,10)
          db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data)=>{
            resolve(data.ops[0])
          })
    
    
    
        })
       
      },
      doLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
          let loginStatus=false
          let response={}
          let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:'admin@gmail.com'})
          if(admin){
            bcrypt.compare(adminData.Password,admin.Password).then((status)=>{
              if(status){
                console.log("login success")
                response.admin=admin
                response.status=true
                resolve(response)
              }else{
                console.log("login failed")
                resolve({status:false})
              }
    
            })
    
          }else{
            console.log('login failed')
            resolve({status:false})
          }
        })
      },
    addProduct:(product,callback)=>{
        console.log(product)
        db.get().collection('product').insertOne(product).then((data)=>{
            console.log(data)
            callback(data.ops[0]._id)

        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:objectId(proId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })

    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    name:proDetails.name,
                    description:proDetails.description,
                    price:proDetails.price,
                    category:proDetails.category
                }
            }).then((_response)=>{
                resolve()
            })
        })

    },
    getPlacedUserDetails:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.SHIP_COLLECTION).find().toArray()
            console.log("aaa",products);
            resolve(products)
        })
    },
    getShipmentProducts:(shipId)=>{
        return new Promise(async(resolve,reject)=>{
            let shipItems=await db.get().collection(collection.SHIP_COLLECTION).aggregate([
              {
                $match:{_id:objectId(shipId)}
              },
              {
                $unwind:'$products'
              },
              {
                $project:{
                  item:'$products.item',
                  quantity:'$products.quantity'
                }
              },
              {
                $lookup:{
                  from:collection.PRODUCT_COLLECTION,
                  localField:'item',
                  foreignField:'_id',
                  as:'product'
                }
              },
              {
               $project:{
                 item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
               } 
      
              }
              
      
            ]).toArray()
            console.log(shipItems)
            resolve(shipItems)
          })

    },
    shipmentProcess:(shipId)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:objectId(shipId)},
            {
                $set:{
                    status:'shipped'
                }

            }
            ).then((response)=>{
              db.get().collection(collection.SHIP_COLLECTION).updateOne({_id:objectId(shipId)},{
                $set:{
                  status:'shipped'
                }
              })
                resolve({status:true})
            })
        })
    },
    allusers:()=>{
      return new Promise(async(resolve,reject)=>{
        let users=await db.get().collection(collection.USER_COLLECTION).find().toArray()
        resolve(users)
      })
    }

}