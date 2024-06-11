

let allLikeButton = document.querySelectorAll('.like-btn');

async function likeButton(productId,btn) {
    // console.log("like the product");
    try {
        let response = await axios({
            method: 'post',
            url: `/products/${productId}/like`,
            headers : {'X-Requested-With' : 'XMLHttpRequest'}
        
        })
        // Toggle the icon class and color
        // let heart = document.getElementById('heart');
        // if (heart.classList.contains('fa-regular')) {
        //     heart.classList.remove('fa-regular');
        //     heart.classList.add('fa-solid');
        //     heart.style.color = '#ff1f1f';
        // } else {
        //     heart.classList.remove('fa-solid');
        //     heart.classList.add('fa-regular');
        //     heart.style.color = '';
        // }
        // console.log(response);

    } catch (error) {
        window.location.replace('/login');
        console.error("Error liking the product:", error.message);
    }
}

for(let btn of allLikeButton) {
    btn.addEventListener('click', ()=> {
        let productId = btn.getAttribute('product-id');
        likeButton(productId,btn);
    })
}







