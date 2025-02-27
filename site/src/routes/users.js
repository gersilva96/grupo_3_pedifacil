const express = require("express");
const router = express.Router();

//Middlewares
const uploadAvatarUser = require("../middlewares/uploadAvatarUser");    //Valida que el archivo que se suba sea una imagen png, jpg o jpeg
const usersValidations = require("../middlewares/usersValidations");    //Valida los campos del formulario de login y registro de un usuario
const loggedUser = require("../middlewares/loggedUser");        //Valida que exista un usuario logueado en la sesión
const notLoggedUser = require("../middlewares/notLoggedUser");  //Valida que no exista un usuario logueado en la sesión
const isBuyer = require("../middlewares/isBuyer");    //Valida que el usuario logueado sea comprador

const usersController = require("../controllers/usersController");

router.get("/profile", loggedUser, usersController.profile);    //GET - Muestra el perfil de un usuario - Debe haber un usuario logueado

router.get("/profile/edit", loggedUser, usersController.edit);  //GET - Muestra el formulario de edición de datos de un usuario - Debe haber un usuario logueado
router.put("/:id/edit", loggedUser, uploadAvatarUser.uploadFile, usersValidations.updateUser,  usersController.update);    //PUT - Actualiza la información de un usuario - Debe haber un usuario logueado

router.get("/login", notLoggedUser, usersController.login);     //GET - Muestra el formulario de Login - No debe haber un usuario logueado
router.post("/login", usersValidations.loginUser, usersController.processLogin);     //POST - Loguea a un usuario

router.post("/logout", loggedUser, usersController.logout); //POST - Cierra la sesión del usuario logueado - Debe haber un usuario logueado

router.get("/register", notLoggedUser, usersController.register);   //GET - Muestra el formulario de Registro - No debe haber un usuario logueado
router.post("/register", usersValidations.registerUser, usersController.create);    //POST - Registra a un nuevo usuario

router.get("/purchase-history", loggedUser, isBuyer, usersController.purchaseHistory);  //GET - Historial de compra - Debe haber un usuario logueado - Debe tener rol de comprador
router.get("/purchase-history-detail/:number", loggedUser, isBuyer, usersController.purchaseHistoryDetail); //GET - Detalle de historial de compra - Debe haber un usuario logueado - Debe tener rol de comprador

module.exports = router;