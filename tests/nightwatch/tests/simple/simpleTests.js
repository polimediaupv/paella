module.exports = {
  'Test Page Load' : function (browser) {
    browser
      .url(browser.launch_url)
      .waitForElementVisible('body', 1000)
      .assert.title('Paella-Standalone Example Repository')
      .end();
  }
};
