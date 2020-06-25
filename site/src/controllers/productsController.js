const fs = require("fs");
const path = require("path");
const glob = require("glob");
const {check, validationResult, body} = require("express-validator");

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const formatPrice = (price,discount) => toThousand((price*(1-(discount/100))).toFixed(2));

let productsController = {
    //Funciones
    productsFile: path.join(__dirname,"..","data","products.json"),     //Directorio del JSON de productos

    readJSONFile: () => JSON.parse(fs.readFileSync(productsController.productsFile, "utf-8")),   //Leo el JSON y lo parseo

    saveJSONFile: elem => fs.writeFileSync(productsController.productsFile, JSON.stringify(elem)),   //Sobreescribo el JSON

    searchProduct: id => {  //Busco y retorno un producto por su id
        let productos = productsController.readJSONFile();
        let productoEncontrado = null;
        productos.forEach(prod => {
            if (prod["id"] == id) {
                productoEncontrado = prod;
            }
        });
        return productoEncontrado; // Si no lo encuentro devuelvo null
    },

    getNewId: () => {   //Obtengo el id que le corresponde al nuevo producto
        const prods = productsController.readJSONFile();
        let lastId = 0;
        prods.forEach(producto => {
            if(producto.id > lastId) {
                lastId = producto.id;
            }
        });
        return lastId+=1;   //Retorno el id que le corresponde al nuevo producto
    },

    //Métodos para el router
    search: (req,res) => {      //Muestra los resultados de búsqueda
        const products = productsController.readJSONFile();
        let results = [];
		products.forEach(product => {
			if(product.name.toLowerCase().includes(req.query.keywords.toLowerCase().trim()) || product.description.toLowerCase().includes(req.query.keywords.toLowerCase().trim())){
				results.push(product);
			}
		});
		res.render("products/results", {results, toThousand, formatPrice, search: req.query.keywords});
    },

    root: (req,res) => {        //Muestra todos los productos
        const products = productsController.readJSONFile();
        res.render("products/products", {products, formatPrice, toThousand});
    },

    detail: (req,res) => {      //Muestra el detalle de un producto
        const product = productsController.searchProduct(req.params.id);
        res.render("products/productDetail", {product, formatPrice});
    },

    cart: (req,res) => {        //Muestra el carrito
        res.render("products/productCart");
    },

    orderHistory: (req,res) => {    //Historial de compra
        res.render("products/productOrderHistory");
    },

    orderHistoryDetail: (req,res) => {      //Detalle de historial de compra
        res.render("products/productOrderHistoryDetail");
    },

    list: (req,res) => {        //Lista todos los productos
        const products = productsController.readJSONFile();
        res.render("products/productList", {products});
    },

    create: (req,res) => {      //Formulario de carga de un producto
        const newId = productsController.getNewId();
        res.render("products/productAdd", {newId});
    },

    store: (req,res) => {       //Agrega un producto al JSON
        let errors = validationResult(req);
        if (typeof req.file === 'undefined') {
            let newError = {
               value: '',
               msg: 'Debe cargar una imagen de producto',
               param: 'image',
               location: 'files'
            }
            errors.errors.push(newError);
        };

        if (errors.isEmpty()) {
            let products = productsController.readJSONFile();
            products.push({
                id: productsController.getNewId(),
                name: req.body.name,
                category: req.body.category,
                price: parseFloat(req.body.price),
                discount: parseFloat(req.body.discount),
                stock: parseInt(req.body.stock),
                description: req.body.description.trim(),
                image: req.file.filename
            });
            productsController.saveJSONFile(products);
            res.redirect("/products");
        } else {
            res.render("products/productAdd", {errors: errors.errors, newId: productsController.getNewId()});
        }
    },

    edit: (req,res) => {        //Formulario de edición de un producto
        const product = productsController.searchProduct(req.params.id);
        res.render("products/productEdit", {product});
    },

    update: (req,res) => {      //Actualiza un producto del JSON
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            let products = productsController.readJSONFile();
            products.forEach(product => {
                if (product.id == req.params.id) {
                    product.name = req.body.name;
                    product.category = req.body.category;
                    product.price = parseFloat(req.body.price);
                    product.discount = parseFloat(req.body.discount);
                    product.stock = parseInt(req.body.stock);
                    product.description = req.body.description.trim();
                }
            });
            productsController.saveJSONFile(products);
            res.redirect("/products");
        } else {
            let product = {};
            let products = productsController.readJSONFile();
            products.forEach(prod => {
                if (prod.id == req.params.id) {
                    product = prod;
                }
            });
            res.render("products/productEdit", {errors: errors.errors, product})
        }
    },

    delete: (req,res) => {      //Elimina un producto del JSON
        const products = productsController.readJSONFile();
        const newProducts = products.filter(prod => prod.id != req.params.id);
        productsController.saveJSONFile(newProducts);
        const imageFile = glob.sync(path.join(__dirname, "..", "..", "public", "images", "products", `img-prod${req.params.id}.{jpg,jpeg,png}`));
        imageFile.forEach(file => fs.unlinkSync(file));
        res.redirect("/products");
    }
}

module.exports = productsController;