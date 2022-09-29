module.exports = {
  parserOptions: {
    jsconfigRootDir: __dirname,
    project: "./jsconfig.json",
  },
  globals: {
    "cy": true,
    "Cypress": true
  }
};
