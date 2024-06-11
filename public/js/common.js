

let allLikeButton = document.querySelectorAll('.like-btn');

async function likeButton(productId) {
    // console.log("like the product");
    try {
        let response = await axios({
            method: 'post',
            url: `/products/${productId}/like`,
            headers : {'X-Requested-With' : 'XMLHttpRequest'}
        
        })
        console.log(response);

    } catch (error) {
        window.location.replace('/login');
        console.error("Error liking the product:", error.message);
    }
}

for(let btn of allLikeButton) {
    btn.addEventListener('click', ()=> {
        let productId = btn.getAttribute('product-id');
        likeButton(productId);
    })
}







