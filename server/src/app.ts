import express from "express";
import cookieSession from "cookie-session";
import cors from "cors";

import { currentUserRouter } from "./routes/current-user";
import { signupRouter } from "./routes/signup";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { borrowerProfileRouter } from "./routes/borrower-profile";
import { uploadRouter } from "./routes/upload";
import { applyLoanRouter } from "./routes/loan-apply";
import { salesLeadsRouter } from "./routes/sales-lead";
import { collectionRouter } from "./routes/collection";
import { disbursementRouter } from "./routes/disbursements";
import { sanctionLoansRouter } from "./routes/sanction/fetch-all-loans";
import { sanctionRouter } from "./routes/sanction/fetch-individual-loan";

const app = express();

app.set("trust proxy", true);
app.use(express.json());

app.use(
  cookieSession({
    signed: false,
    secure: false, 
  })
);

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true, 
  })
);
// app.use((req, res, next) => {
//   console.log("Incoming:", req.method, req.path);
//   next();
// });


app.use(currentUserRouter);
app.use(signupRouter);
app.use(signinRouter);
app.use(signoutRouter);

app.use(borrowerProfileRouter)
app.use(uploadRouter)
app.use(applyLoanRouter)

app.use(salesLeadsRouter)
app.use(collectionRouter)
app.use(disbursementRouter)
app.use(sanctionLoansRouter)
app.use(sanctionRouter)

export { app };
