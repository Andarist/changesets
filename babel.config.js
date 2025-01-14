module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: { node: 8 }
      }
    ]
  ],
  overrides: [
    { test: "**/*.ts", presets: ["@babel/preset-typescript"] },
    { test: "**/*.js", presets: ["@babel/preset-flow"] }
  ]
};
