if (process.env.NODE_ENV === "production") {
  require("./selfxssWarning");
}

import "angular";

import "lato-webfont/fonts/lato-hairline-webfont.woff";
import "lato-webfont/fonts/lato-thin-webfont.woff";
import "lato-webfont/fonts/lato-light-webfont.woff";
import "lato-webfont/fonts/lato-regular-webfont.woff";
import "lato-webfont/fonts/lato-medium-webfont.woff";
import "lato-webfont/fonts/lato-semibold-webfont.woff";
import "lato-webfont/fonts/lato-bold-webfont.woff";
import "lato-webfont/fonts/lato-heavy-webfont.woff";
import "lato-webfont/fonts/lato-black-webfont.woff";

import "../styles/app.scss";

import "./app.module";
import "./app.controllers";
import "./app.directives";
import "./app.filters";
import "./app.services";

if ("serviceWorker" in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
