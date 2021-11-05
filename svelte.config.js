import svPreprocess from "svelte-preprocess";
import Path from "path";

import svAdapterNetlify from "@sveltejs/adapter-netlify";

import pcssImport from "postcss-import";
import pcssNested from "postcss-nested";
import pcssAutoprefixer from "autoprefixer";
import pcssTailwind from "tailwindcss";

export default {
  preprocess: svPreprocess({
    postcss: true,
    //postcss: {
    //  parser: "postcss-scss",
    //  plugins: [
    //    //pcssImport,
    //    //pcssNested,
    //    //pcssAutoprefixer,
    //    //pcssTailwind,
    //    //require("@tailwindcss/jit"),
    //  ],
    //},
  }),
  kit: {
    adapter: svAdapterNetlify(),
    files: {
      template: "src/template.html",
    },
    ssr: false,
    vite: {
      resolve: {
        extensions: [".ts", ".js"],
        alias: {
          "@hyperschedule": Path.resolve("src/js"),
          "@hyperschedule/view": Path.join(".", "src/js/view"),
          "@hyperschedule/model": Path.join(".", "src/js/model"),
          "@hyperschedule/css": Path.join(".", "src/css"),
        },
      },
    },
  },
};
