const express = require("express");
const router = express.Router();

require("dotenv").config();
const nodemailer = require("nodemailer");

const { body, validationResult } = require("express-validator");

router.get("/", (req, res) => {
    res.render("pages/index", {
        erros: [],
        dados: {}
    });
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.post(
    "/enviar",
    [
        body("nome")
         .trim()
        .notEmpty()
          .withMessage("Digite seu nome."),

        body("email")
         .trim()
           .notEmpty()
         .withMessage("Digite seu e-mail.")
        .bail()
        .isEmail()
         .withMessage("Digite um e-mail válido."),

        body("telefone")
         .trim()
        .notEmpty()
         .withMessage("Digite seu telefone."),

        body("assunto")
         .trim()
        .notEmpty()
         .withMessage("Digite o assunto."),

        body("mensagem")
        .trim()
        .notEmpty()
        .withMessage("Digite sua mensagem.")
    ],
    async (req, res) => {
        const resultado = validationResult(req);

        if (!resultado.isEmpty()) {
            return res.status(400).render("pages/index", {
                erros: resultado.array(),
                dados: req.body
            });
        }

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
             replyTo: req.body.email,
             subject: req.body.assunto,
             text:
                    "Nome: " + req.body.nome +
                    "\nE-mail: " + req.body.email +
                    "\nTelefone: " + req.body.telefone +
                    "\nAssunto: " + req.body.assunto +
                    "\n\nMensagem:\n" + req.body.mensagem
            });

            res.send("E-mail enviado com sucesso! Confira sua caixa de entrada.");
        } catch (erro) {
            console.error("Erro ao enviar o e-mail:", erro.message);

            res.status(500).send(
                "Não foi possível enviar o e-mail. Veja as suas configurações."
            );
        }
    }
);

module.exports = router;