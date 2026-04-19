const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const PDFDocument = require("pdfkit");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

let products = [];
let sales = [];

// 👉 Add Product (Liquor style)
app.post("/add-product", (req, res) => {
    const { name, carton, bottlesPerCarton, looseBottles, price } = req.body;

    products.push({
        name,
        carton,
        bottlesPerCarton,
        looseBottles,
        price
    });

    res.send({ message: "Product added" });
});

// 👉 Get Products
app.get("/products", (req, res) => {
    res.send(products);
});

// 👉 Sell bottles (carton logic)
function sellBottle(product, qty) {
    let total =
        product.carton * product.bottlesPerCarton +
        product.looseBottles;

    if (total >= qty) {
        total -= qty;

        product.carton = Math.floor(total / product.bottlesPerCarton);
        product.looseBottles = total % product.bottlesPerCarton;

        return true;
    }
    return false;
}

// 👉 Sale
app.post("/sale", (req, res) => {
    const { name, qty } = req.body;

    let product = products.find(p => p.name === name);

    if (product && sellBottle(product, qty)) {
        sales.push({ name, qty, price: product.price });
        res.send({ message: "Sale done" });
    } else {
        res.status(400).send({ message: "Not enough stock" });
    }
});

// 👉 Sales list
app.get("/sales", (req, res) => {
    res.send(sales);
});

// 👉 Invoice PDF
app.post("/invoice", (req, res) => {
    const { items, total } = req.body;

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");

    doc.pipe(res);

    doc.fontSize(20).text("SUNDEEP Liquor Shop", { align: "center" });
    doc.text("--------------------------------");

    items.forEach(item => {
        doc.text(`${item.name} x${item.qty} = ${item.price * item.qty}`);
    });

    doc.text("--------------------------------");
    doc.text(`TOTAL: ${total}`, { align: "right" });

    doc.end();
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});