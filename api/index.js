import path from "path";
import fs from "fs";
import { Buffer } from "buffer";

import noCache from "nocache";
import express from "express";
import { v4 } from "uuid";
import { contentSecurityPolicy } from "helmet";
import * as cheerio from "cheerio";

const app = express();

app.use("/docs", express.static(path.join(import.meta.dirname, "../docs")));

var statics = express.static(path.join(import.meta.dirname, "../dist"));

// Don't serve index.html
function staticDir() {
  return function (req, res, next) {
    if (req.path !== "/") {
      return statics(req, res, next);
    }

    return next();
  };
}

app.use(staticDir());

// Even though index.html is static, we don't want to cache it
// since the service worker does regardless of the header cache settings
// (otherwise upgrades sometimes require an extra refresh)
app.use(noCache());

app.use(function (req, res, next) {
  res.locals.nonce = Buffer.from(v4(), "binary").toString("base64");
  next();
});

app.use(
  contentSecurityPolicy({
    // Specify directives as normal.
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'strict-dynamic'",
        function (req, res) {
          return "'nonce-" + res.locals.nonce + "'";
        },
      ],
      styleSrc: [
        function (req, res) {
          return "'nonce-" + res.locals.nonce + "'";
        },
        "http:",
        "https:",
      ],
      fontSrc: ["'self'", "data:"],
      imgSrc: ["'self'", "https://www.gravatar.com"],
      // sandbox: ['allow-forms', 'allow-scripts'],
      reportUri: "/report-violation",
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameSrc: ["https://js.stripe.com"],
    },

    // Set to true if you only want browsers to report errors, not block them.
    // You may also set this to a function(req, res) in order to decide dynamically
    // whether to use reportOnly mode, e.g., to allow for a dynamic kill switch.
    reportOnly: false,
  }),
);

const html = fs.readFileSync(
  path.join(import.meta.dirname, "../dist/index.html"),
  "utf-8",
);
const $ = cheerio.load(html);

const styles = $("style");
const links = $('link[rel="stylesheet"]');
const scripts = $("script");

app.all("/*", (req, res) => {
  styles.attr("nonce", res.locals.nonce);
  links.attr("nonce", res.locals.nonce);
  scripts.attr("nonce", res.locals.nonce);

  res.send($.html());
});
//For example in Express you may want to use: res.send(noncifiedHTML);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Financier frontend listening on port ${port}!`);
});
