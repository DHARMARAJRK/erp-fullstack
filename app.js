const API = "http://localhost:3000";
let cart = [];

// 👉 Add Product
async function addProduct() {
    const data = {
        name: name.value,
        carton: Number(carton.value),
        bottlesPerCarton: Number(bpc.value),
        looseBottles: Number(loose.value),
        price: Number(price.value)
    };

    await fetch(API + "/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    loadProducts();
}

// 👉 Load Products
async function loadProducts() {
    const res = await fetch(API + "/products");
    const data = await res.json();

    const list = document.getElementById("products");
    list.innerHTML = "";

    data.forEach(p => {
        const total =
            p.carton * p.bottlesPerCarton + p.looseBottles;

        list.innerHTML += `
        <li onclick='addToCart(${JSON.stringify(p)})'>
        ${p.name} | Stock: ${total} | Price: ${p.price}
        </li>`;
    });
}

// 👉 Cart
function addToCart(product) {
    cart.push({ ...product, qty: 1 });
    renderCart();
}

function renderCart() {
    const list = document.getElementById("cart");
    let total = 0;

    list.innerHTML = "";

    cart.forEach(item => {
        total += item.price * item.qty;
        list.innerHTML += `<li>${item.name} x${item.qty}</li>`;
    });

    document.getElementById("total").innerText = "Total: " + total;
}

// 👉 Checkout
async function checkout() {
    for (let item of cart) {
        await fetch(API + "/sale", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ name: item.name, qty: item.qty })
        });
    }

    alert("Sale complete");
    cart = [];
    renderCart();
    loadProducts();
}

// 👉 Invoice
async function downloadInvoice() {
    let total = cart.reduce((a, b) => a + b.price * b.qty, 0);

    const res = await fetch(API + "/invoice", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ items: cart, total })
    });

    const blob = await res.blob();
    window.open(URL.createObjectURL(blob));
}

// INIT
loadProducts();