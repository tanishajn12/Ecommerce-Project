



let allLikeButton = document.querySelectorAll('.like-btn');

async function likeButton() {
    // console.log("like the product");
    let response = await axios({
        method: 'post',
        url: `/products/${productId}/like`,

    })

    console.log(response);

}
for(let btn of allLikeButton) {
    btn.addEventListener('click', ()=> {
        // console.log(btn.getAttribute('product-id'));
        let productId = btn.getAttribute('product-id');
        likeButton();
    })
}







