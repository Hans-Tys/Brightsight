import esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import postcss from "postcss";
import chalk from "chalk";
import autoprefixer from "autoprefixer";
import { clean } from "esbuild-plugin-clean";
import chokidar from "chokidar";
import stylelint from "stylelint";
import { sync } from "resolve-glob";

// Set correct state by checking terminal parameters.
const prod = process.argv.includes("--prod");
const dev = process.argv.includes("--dev");
const watch = process.argv.includes("--watch");

// Set entrypoints.
const globalEntryPoints = sync(
  [
    "./src/scss/global.scss",
    "./src/scss/wysiwyg.scss",
    "./src/js/global.js",
  ]
);
const componentsEntryPoints = sync(
  [
    "./components/*/src/scss/**/*.scss",
    "./components/*/src/js/**/*.js",
    "!./components/*/src/scss/**/_*.scss"
  ]
);

// Set shared options.
const options = {
  bundle: true,
  logLevel: "info",
  format: "esm",
  splitting: true,
  minify: !watch,
  metafile: dev,
  sourcemap: !prod,
  treeShaking: true,
  target: "esnext",
  external: [
    "*.svg",
    "*.jpg",
    "*.jpeg",
    "*.gif",
    "*.png",
    "*.json",
    "*.eot",
    "*.ttf",
    "*.woff",
    "*.woff2",
    "./fonts/*",
    "/themes/custom/solitheme/dist/fonts/*",
  ],
}

// Set global options.
const globalOptions = {
  entryPoints: globalEntryPoints,
  outdir: "./dist",
  entryNames: "[ext]/[name]",
  chunkNames: "[name]",
  plugins: [
    clean({
      patterns: ["./dist/js/global.js", "./dist/js/global.js.map", "./dist/css/*"],
    }),
    sassPlugin({
      async transform(source) {
        const { css } = await postcss([autoprefixer]).process(source, { from: undefined });
        return css;
      },
    }),
  ],
};

// Set components options.
const componentsOptions = {
  entryPoints: componentsEntryPoints,
  outdir: "./components/",
  entryNames: "[name]/[name]",
  chunkNames: "[name]",
  plugins: [
    clean({
      patterns: ["./components/*/*.js", "./components/*/*.js.map", "./components/*/*.css.map"],
    }),
    sassPlugin({
      async transform(source) {
        const { css } = await postcss([autoprefixer]).process(source, { from: undefined });
        return css;
      },
    }),
  ],
};

// Directories to be watched.
const watchDirectories = [
  "src/**/*.scss",
  "components/*/src/scss/**/*.scss",
  "src/**/*.js",
  "components/*/src/js/**/*.js",
];

// Stylelint function.
const linter = () => {
  stylelint
    .lint({
      files: ["src/**/*.scss", "components/*/src/scss/**/*.scss"],
      formatter: 'string',
      console: true
    })
    .then(({ output, error}) => {
      console.log(output);
    })
    .catch(() => {
      console.log(chalk.bgRedBright("⚠️ Linting Failed! ⚠️"));
    });
};

// Print function.
const print = (color, text) => {
  console.log(eval(`chalk.${color}(text)`));
}

// Run build and check for watch.
Promise.all([
  esbuild.build({...options, ...globalOptions}),
  esbuild.build({...options, ...componentsOptions}),
]).then(() => {
  print("bgGreenBright", "⚡ Build complete! ⚡");

  if (watch) {
    (async () => {
      const ctxGlobal = await esbuild.context({...options, ...globalOptions});
      const ctxComponents = await esbuild.context({...options, ...componentsOptions});

      if (ctxGlobal || ctxComponents) {
        chokidar.watch(watchDirectories, { ignoreInitial: true })
          .on("all", (event, path) => {
           // linter();
            print("italic.blueBright", `🔨 Rebuilding ${path} (${event})`);

            return Promise.all([
              ctxGlobal.rebuild(),
              ctxComponents.rebuild(),
            ]).then(() => {
              print("cyanBright", "✔️️Rebuild done.️");
            }).catch(() => {
              print("bgRedBright", "⚠️ Rebuild Failed! ⚠️");
            });
          })
          .on("ready", () => {
            print("bold.yellowBright", "🔎 Watching for changes...");
          });
      }
    })();
  }
}).catch(() => {
  print("bgRedBright", "⚠️ Build Failed! ⚠️");
  process.exit(1);
});
