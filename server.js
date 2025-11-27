import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import { engine } from "express-handlebars";
import { router } from "./routes.js";

// load env vars
dotenv.config();

// recreate dirname for es modules
const __filename = fileURLToPath(import.meta.url); // convert module url to path
const __dirname = path.dirname(__filename);        // get current folder

const app = express();

// register handlebars (.hbs)
app.engine(".hbs", engine({
  extname: ".hbs",                         // file extension
  defaultLayout: "main",                   // main layout wrapper
  layoutsDir: path.join(__dirname, "views/layouts"), // layouts folder
  partialsDir: path.join(__dirname, "views/partials"), // partial ui folder
}));

// set view engine
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views")); // main hbs views folder

// parse form + json + static assets
app.use(express.urlencoded({ extended: true })); // read form body
app.use(express.json());                         // read json body
app.use(express.static(path.join(__dirname, "public"))); // static files

// enable sessions
app.use(
  session({
    secret: "weatherapp-secret", // encrypt session
    resave: false,               // no resave if unchanged
    saveUninitialized: false,    // no empty sessions
  })
);

// expose session to views as {{session}}
app.use((request, response, next) => {
  response.locals.session = request.session;
  next();
});

// mount routes
app.use("/", router);

// global error fallback
app.use((error, request, response, next) => {
  console.error("server error:", error); // log it
  response.status(500).render("error-view", {
    title: "server error",
    message: "something went wrong.",
  });
});

// start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`weathertop running at port ${PORT}`); // server start log
});
