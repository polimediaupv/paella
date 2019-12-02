module.exports = {
    'Test Page Load' : function (browser) {
      browser
        .url("http://localhost:8000/player/index.html?id=video-remote-1")
        .waitForElementVisible('body', 1000)
        .assert.visible('.play-icon')
        .click('.videoWrapper')
        .waitForElementNotVisible('.play-icon')

        .waitForElementVisible('#buttonPlugin5')
        .assert.visible('#buttonPlugin5')
        .click('#buttonPlugin5')

        .waitForElementVisible('.frameContainer')
        .assert.visible('.frameContainer')

        .useXpath()
        .frame(0)
        .waitForElementVisible("//h1[contains(text(), 'Paella Player')]")
        .assert.visible("//h1[contains(text(), 'Paella Player')]")
        .frame(null)
        .useCss()

        .end();
    }
  };