import verifySignUp from "../../middleware/VerifySignUp.js";
import { signup, login } from "../controllers/AuthController.js";

export default (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [verifySignUp.checkValidEmail, verifySignUp.checkValidPassword],
    signup
  );

  app.post("/api/auth/login", login);
};
