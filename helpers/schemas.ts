import { object, ref, string } from "yup";

export const LoginSchema = object().shape({
  email: string()
    .email("Esse campo precisa ser um email")
    .required("Insira seu email"),
  password: string().required("Insira sua senha"),
});

export const RegisterSchema = object().shape({
  name: string().required("Name é obritório"),
  email: string()
    .email("Esse campo precisa ser um email")
    .required("Insira seu email"),
  password: string().required("Insira sua senha"),
  confirmPassword: string()
    .required("Confirme sua senha")
    .oneOf([ref("password")], "A senha precisa ser igual nos 2 campos"),
});
