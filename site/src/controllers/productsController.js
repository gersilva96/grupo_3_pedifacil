const fs = require("fs");
const path = require("path");
const glob = require("glob");
const {check, validationResult, body} = require("express-validator");
const db = require("../database/models");
const {Op} = require("sequelize");

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const formatPrice = (price,discount) => {
    let priceDot;
    if (discount == undefined) {
        priceDot = toThousand(price.toFixed(2));
    } else {
        priceDot = toThousand((price*(1-(discount/100))).toFixed(2));
    }
    let first = priceDot.slice(0,-3);
    let last = priceDot.slice(-3);
    let lastReplaced = last.replace(".", ",");
    return `$ ${first}${lastReplaced}`;
};

const productsController = {
    search: async (req, res) => {      //GET - Muestra los resultados de búsqueda
        try {
            const results = await db.Products.findAll({
                where: {
                    name: {
                        [Op.substring]: req.query.keywords
                    }
                }
            });
            res.render("products/results", {results, formatPrice, search: req.query.keywords, user: req.session.userLogged});
        } catch(error) {
            res.render("error", {message: error, user: req.session.userLogged});
        }
    },
    root: async (req, res) => {        //GET - Muestra todos los productos
        try {
            const products = await db.Products.findAll();
            if (req.query.success != undefined) {
                const success = "¡Gracias por tu compra!";
                res.render("products/products", {success, products, formatPrice, toThousand, user: req.session.userLogged});
            } else {
                res.render("products/products", {products, formatPrice, toThousand, user: req.session.userLogged});
            }
        } catch(error) {
            res.render("error", {message: error, user: req.session.userLogged});
        }
    },
    detail: async (req, res) => {      //GET - Muestra el detalle de un producto
        try {
            const product = await db.Products.findOne({
                where: {id: req.params.id},
                include: [{association: "user"}]
            });
            if (product.stock > 0) {
                product.price = parseFloat(product.price);
                res.render("products/productDetail", {product, formatPrice, user: req.session.userLogged});
            } else {
                res.render("error"), {user: req.session.userLogged};
            }
        } catch(error) {
            res.render("error", {message: error, user: req.session.userLogged});
        }
    },
    list: async (req, res) => {        //GET - Lista todos los productos - Debe haber un usuario logueado - Debe tener rol de vendedor
        try {
            const products = await db.Products.findAll({
                where: {
                    user_id: req.session.userLogged.id
                }
            });
            res.render("products/productList", {products, user: req.session.userLogged});
        } catch(error) {
            res.render("error", {message: error, user: req.session.userLogged});
        }
    },
    create: async (req, res) => {      //GET - Formulario de carga de un producto - Debe haber un usuario logueado - Debe tener rol de vendedor
        try {
            const categories = await db.Categories.findAll();
            res.render("products/productAdd", {categories, user: req.session.userLogged});
        } catch(error) {
            res.render("error", {message: error, user: req.session.userLogged});
        }
    },
    store: async (req, res) => {       //POST - Agrega un producto - Debe haber un usuario logueado - Debe tener rol de vendedor
        try {
            let errors = validationResult(req);
            if (typeof req.file === 'undefined') {
                let newError = {
                   value: '',
                   msg: 'Debe cargar una imagen de producto',
                   param: 'image',
                   location: 'files'
                }
                errors.errors.push(newError);
            }
            if (errors.isEmpty()) {
                const existsCode = await db.Products.findOne({
                    where: {
                        code: parseInt(req.body.code)
                    }
                });
                if (existsCode != null) {
                    const mensaje = "Ya existe un producto con el código ingresado";
                    const categories = await db.Categories.findAll();
                res.render("products/productAdd", {categories, mensaje, user: req.session.userLogged});
                } else {
                    await db.Products.create({
                        code: req.body.code,
                        name: req.body.name,
                        description: req.body.description,
                        price: parseFloat(req.body.price),
                        discount: parseFloat(req.body.discount),
                        stock: parseFloat(req.body.stock),
                        image: req.file.filename,
                        user_id: req.session.userLogged.id,
                        category_id: parseInt(req.body.category)
                    });
                    res.redirect("/products");
                }
            } else {
                const categories = await db.Categories.findAll();
                res.render("products/productAdd", {categories, errors: errors.errors, user: req.session.userLogged});
            }
        } catch(error) {
            res.render("error", {message: error, user: req.session.userLogged});
        }
    },
    edit: async (req, res) => {        //GET - Formulario de edición de un producto - Debe haber un usuario logueado - Debe tener rol de vendedor
        try {
            const categories = await db.Categories.findAll();
            const product = await db.Products.findOne({
                where: {
                    id: req.params.id
                }
            });
            if (product == undefined || (product != undefined && product.user_id != req.session.userLogged.id)) {
                const products = await db.Products.findAll({
                    where: {
                        user_id: req.session.userLogged.id
                    }
                });
                res.render("products/productList", {products, mensaje: "No podés editar un producto que no te pertenece", user: req.session.userLogged});
            } else {
                res.render("products/productEdit", {product, categories, user: req.session.userLogged});
            }
        } catch(error) {
            res.render("error", {message: error, user: req.session.userLogged});
        }
    },
    update: async (req, res) => {      //PUT - Actualiza un producto - Debe haber un usuario logueado - Debe tener rol de vendedor
        try {
            let errors = validationResult(req);
            const existsCode = await db.Products.findOne({
                where: {
                    code: parseInt(req.body.code)
                }
            });
            if (existsCode != null && existsCode.id != req.params.id) {
                let newError = {
                    value: '',
                    msg: 'Ya existe un producto con el código ingresado',
                    param: 'code',
                    location: 'body'
                };
                errors.errors.push(newError);
            }
            const productToEdit = await db.Products.findOne({
                where: {
                    id: req.params.id
                }
            });
            if (productToEdit == undefined) {
                const products = await db.Products.findAll({
                    where: {
                        user_id: req.session.userLogged.id
                    }
                });
                res.render("products/productList", {products, errors: [{msg: "No podés editar un producto que no te pertenece"}], user: req.session.userLogged});
            } else {
                if (productToEdit.user_id != req.session.userLogged.id) {
                    let newError = {
                        value: '',
                        msg: 'No podés editar un producto que no te pertenece'
                    };
                    errors.errors.push(newError);
                }
            }
            if (errors.isEmpty()) {
                await db.Products.update({
                    code: parseInt(req.body.code),
                    name: req.body.name,
                    description: req.body.description,
                    price: parseFloat(req.body.price),
                    discount: parseFloat(req.body.discount),
                    stock: parseInt(req.body.stock),
                    category_id: parseInt(req.body.category)
                }, {
                    where: {
                        id: req.params.id
                    }
                });
                res.redirect("/products");
            } else {
                const categories = await db.Categories.findAll();
                const product = await db.Products.findOne({
                    where: {
                        id: req.params.id
                    }
                });
                res.render("products/productEdit", {errors: errors.errors, product, categories, user: req.session.userLogged})
            }
        } catch(error) {
            res.render("error", {message: error, user: req.session.userLogged});
        }
    },
    delete: async (req, res) => {      //DELETE - Elimina un producto - Debe haber un usuario logueado - Debe tener rol de vendedor
        try {
            const product = await db.Products.findOne({
                where: {
                    id: req.params.id
                }
            });
            let otherSellerProduct = false;
            if (product == undefined || (product != undefined && product.user_id != req.session.userLogged.id)) {
                otherSellerProduct = true;
            }
            if (otherSellerProduct) {
                const products = await db.Products.findAll({
                    where: {
                        user_id: req.session.userLogged.id
                    }
                });
                res.render("products/productList", {mensaje: "No podés eliminar un producto que no te pertenece", products, user: req.session.userLogged});
            } else {
                await db.Products.update({
                    stock: 0
                }, {
                    where: {
                        id: req.params.id
                    }
                });
                res.redirect("/products");
            }
        } catch(error) {
            res.render("error", {message: error, user: req.session.userLogged});
        }
    }
};

module.exports = productsController;