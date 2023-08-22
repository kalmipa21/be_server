import express from "express";
import cors from "cors";
import { PORT } from "./src/configs/secret.js";
import r_users from "./src/routers/r_users.js";
import r_roles from "./src/routers/r_roles.js";
import r_categories from "./src/routers/r_categories.js";
import r_product from "./src/routers/r_products.js";
import r_checkout from "./src/routers/r_checkout.js";
import r_address from "./src/routers/r_address.js";

//Import Router
const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

//Router
app.use("/api/v1", r_users);
app.use("/api/v1", r_roles);
app.use("/api/v1", r_categories);
app.use("/api/v1", r_product);
app.use("/api/v1", r_checkout);
app.use("/api/v1", r_address);

// console.log("At", PORT);

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
