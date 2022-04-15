const colors = require("tailwindcss/colors");

module.exports = {
  //purge: {
  //  enabled: true,
  //  content: [
  //    "./src/html/index.html",
  //    "./src/css/main.css",
  //    "./src/css/course.pcss",
  //  ],
  //},
  theme: {
    extend: {
      colors: Object.fromEntries(
        Object.entries(colors).map(([key, value]) => [
          key.toLocaleLowerCase(),
          value,
        ])
      ),
      fontFamily: {
        sans: ["Inter"],
      },
    },
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      visibility: ["disabled"],
    },
  },
};
