
const { validationResult } = require('express-validator');
const User = require("../../models/user.js");
const bcryptjs = require("bcryptjs");

const controller = {
    register: (req,res) => res.render('users/register'),
    processRegister: (req, res) =>{
        const resultValidation = validationResult(req);
        /*return res.send(resultValidation.mapped())*/
        if(resultValidation.errors.length > 0){
            return res.render('users/register', {
                errors: resultValidation.mapped(),
                oldData: req.body
            });
        }

        let userInDB = User.findByField('email', req.body.email);

		if (userInDB) {
			return res.render('users/register', {
				errors: {
					email: {
						msg: 'Este email ya está registrado'
					}
				},
				oldData: req.body
			});
		}


        let userToCreate = {
            ...req.body,
            password: bcryptjs.hashSync(req.body.password, 10),
            image: req.file.filename
        }

        let userCreated = User.create(userToCreate);

        return res.redirect('/users/login')
    },

    login: (req,res) => res.render('users/login'),
    loginProcess: (req,res) => {
        let userToLogin = User.findByField('email', req.body.email);
		
		if(userToLogin) {
			let isOkThePassword = bcryptjs.compareSync(req.body.password, userToLogin.password);
			if (isOkThePassword) {
				delete userToLogin.password;
				req.session.userLogged = userToLogin;

				if(req.body.remember_user) {
					res.cookie('userEmail', req.body.email, { maxAge: (1000 * 60) * 60 })
				}

				return res.redirect('/user/profile');
			} 
			return res.render('userLoginForm', {
				errors: {
					email: {
						msg: 'Las credenciales son inválidas'
					}
				}
			});
        }
    }
}


module.exports = controller;