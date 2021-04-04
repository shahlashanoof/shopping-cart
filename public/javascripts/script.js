

    function addToCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1
                $('#cart-count').html(count)

            }
            
        }
    })
}
function shipmentProcess(shipId){
    $.ajax({
        url:'/admin/shipment-process/'+shipId,
        method:'get',
        success:(response)=>{
            if(response.status){
            alert("SHIPPED SUCESSFULLY")
            //$(#ship).value='Shipped'
            document.getElementById('ship').innerHTML='Shipped'
        document.getElementById('ship').style.color="Grey"
      }
        }
    })
    
}
