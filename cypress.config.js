const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: 'd69456',
  viewportHeight:1080,
  viewportWidth: 1920,
  video: true,
  env:{
    username: 'cytest555@yopmail.com',
    password: 'test123',
    apiUrl:  'https://conduit-api.bondaracademy.com'
  },
  e2e: {
    browser: 'chrome',
    watchForFileChanges: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'https://conduit.bondaracademy.com/',
    specPattern: 'cypress/e2e/**/*.spec.{js,jsx,ts,tsx}'
  },
});
