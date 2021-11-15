const express = require("express");
const exphbs = require("express-handlebars");

const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const app = express();
const port = process.env.PORT || "8000";
const body_parser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieEncrypter = require("./cookie");
const secretKey = "foobarbaz1234567foobarbaz1234567";
const cookieParams = {
  httpOnly: true,
  signed: true,
  sameSite: "none",
  secure: true,
  // maxAge: 1000 * 60 * 60, // 3600 * 1000 millieSeconds
};
app.use(cookieParser(secretKey));
app.use(cookieEncrypter(secretKey));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
//app.set("view engine", "html");
app.use(express.static(path.join(__dirname, "public")));
app.use(body_parser.urlencoded({ extended: false }));
let authorized = false;
const auth = function (req, res, next) {
  // ignore for signin and signout paths
  if (req.path == "/login" || req.path == "/register") {
    return next();
  }

  if (req.signedCookies.cookie && req.signedCookies.cookie.auth) {
    authorized = true;
    return next();
  } else {
    authorized = false;
    return next();
  }
};
// register auth middleware
app.use(auth);
app.get("/", (req, res) => {
  try {
    let rawdata = fs.readFileSync(
      path.resolve(__dirname, "balloonatic-quotes.json")
    );
    let quotes = JSON.parse(rawdata);
    res.render("index", { data: quotes.quotes, authorized: authorized });
  } catch (err) {
    res.render("genaralerror", { authorized: authorized });
  }
});

//product
app.get("/product", (req, res) => {
  try {
    let rawdata = fs.readFileSync(
      path.resolve(__dirname, "balloonatic-products.json")
    );
    let products = JSON.parse(rawdata);
    res.render("product", { data: products, authorized: authorized });
  } catch (err) {
    res.render("genaralerror", { authorized: authorized });
  }
});

app.get("/search", (req, res) => {
  let category = req.query.category;
  try {
    let rawdata = fs.readFileSync(
      path.resolve(__dirname, "balloonatic-products.json")
    );
    let filterProducts = {
      products: [],
    };
    let products = JSON.parse(rawdata);
    for (let i = 0; i < products.products.length; i++) {
      if (products.products[i].category == category) {
        filterProducts.products.push(products.products[i]);
      }
    }
    res.render("product", { data: filterProducts, authorized: authorized });
  } catch (err) {
    res.render("genaralerror", { authorized: authorized });
  }
});

//signin
app.get("/login", (req, res) => {
  res.render("login", { errors: [], authorized: authorized });
});

app.post("/login", async (req, res) => {
  const e = req.body;
  let userName = e.email;
  let password = e.password;
  if (!userName) {
    return res.render("login", {
      errors: [{ param: "Error", msg: "Email Address is Required." }],
      e,
      authorized: authorized,
    });
  }
  if (!password) {
    return res.render("login", {
      errors: [{ param: "Error", msg: "Password is Required." }],
      e,
      authorized: authorized,
    });
  }
  try {
    let rawdata = fs.readFileSync(
      path.resolve(__dirname, "balloonatic-users.json")
    );
    let user = JSON.parse(rawdata);
    let flag = 0;
    for (let i = 0; i < user.users.length; i++) {
      if (
        user.users[i].email == userName &&
        user.users[i].password == password
      ) {
        flag = 1;
        break;
      }
    }
    if (flag) {
      let setCookie = {
        auth: true,
      };
      res.cookie("cookie", setCookie, cookieParams);
      res.redirect("/");
    } else {
      return res.render("login", {
        errors: [{ param: "Error", msg: "Email or Password is incorrect." }],
        e,
        authorized: authorized,
      });
    }
  } catch (err) {
    res.render("genaralerror", { authorized: authorized });
  }
});

//logout
app.get("/logout", (req, res) => {
  res.clearCookie("cookie");
  authorized = false;
  res.redirect("/");
});

//signup
app.get("/register", (req, res) => {
  res.render("register", { errors: [], authorized: authorized });
});

app.post("/register", async (req, res) => {
  const e = req.body;
  let firstName = e.first_name;
  let lastName = e.last_name;
  let email = e.email;
  let address = e.address;
  let city = e.city;
  let postalCode = e.zipcode;
  let phone = e.phone;
  let state = e.state;
  let password = e.password;
  let confirmPassword = e.confirm_password;

  if (!firstName) {
    return res.render("register", {
      errors: [{ param: "Error", msg: "First Name is Required." }],
      e,
      authorized: authorized,
    });
  }
  if (firstName.length > 25) {
    return res.render("register", {
      errors: [{ param: "Error", msg: "First Name max-length 25." }],
      e,
      authorized: authorized,
    });
  }

  if (!lastName) {
    return res.render("register", {
      errors: [{ param: "Error", msg: "Last Name is Required." }],
      e,
      authorized: authorized,
    });
  }

  if (lastName.length > 25) {
    return res.render("register", {
      errors: [{ param: "Error", msg: "Last Name max-length 25." }],
      e,
      authorized: authorized,
    });
  }

  if (!email) {
    return res.render("register", {
      errors: [{ param: "Error", msg: "Email is Required." }],
      e,
      authorized: authorized,
    });
  }
  const emailRegexp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegexp.test(email)) {
    return res.render("register", {
      success: [{ param: "Error", msg: "Please Enter valid email address" }],
      e,
      authorized: authorized,
      errors: [],
    });
  }

  if (address.length > 30) {
    return res.render("register", {
      errors: [{ param: "Error", msg: "Address max-length 30." }],
      e,
      authorized: authorized,
    });
  }

  if (!password) {
    return res.render("register", {
      errors: [{ param: "Error", msg: "Password is Required." }],
      e,
      authorized: authorized,
    });
  }
  if (!confirmPassword) {
    return res.render("register", {
      errors: [{ param: "Error", msg: "confirmPassword is Required." }],
      e,
      authorized: authorized,
    });
  }
  if (confirmPassword != password) {
    return res.render("register", {
      errors: [
        { param: "Error", msg: "Password and Confirm Password must be same." },
      ],
      e,
      authorized: authorized,
    });
  }

  try {
    let rawdata = fs.readFileSync(
      path.resolve(__dirname, "balloonatic-users.json")
    );
    let user = JSON.parse(rawdata);
    for (let i = 0; i < user.users.length; i++) {
      if (user.users[i].email == email) {
        return res.render("register", {
          errors: [{ param: "Error", msg: "User already registered" }],
          e,
          authorized: authorized,
        });
      }
    }
    let obj = {
      users: user.users,
    };
    let entity = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      address: address,
      city: city,
      state_code: state,
      postalcode: postalCode,
      password: password,
    };
    obj.users.push(entity);
    fs.writeFile("balloonatic-users.json", JSON.stringify(obj), function (err) {
      if (err) throw err;
      console.log("complete");
    });
    res.redirect("/login");
  } catch (err) {
    console.log(err);
    res.render("genaralerror", { authorized: authorized });
  }
});

//contact
app.get("/contact", (req, res) => {
  res.render("contact", { authorized: authorized, errors: [], success: [] });
});

//about
app.get("/aboutus", (req, res) => {
  res.render("aboutus", { authorized: authorized });
});

app.use(function (req, res, next) {
  res.status(404);

  // respond with html page

  // respond with json
  res.render("error", { authorized: authorized });
});

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
