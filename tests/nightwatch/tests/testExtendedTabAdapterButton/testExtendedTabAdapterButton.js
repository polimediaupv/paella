module.exports = {
    'Test Page Load' : function (browser) {
      browser
        .url("http://localhost:8000/player/index.html?id=video-remote-1")
        .waitForElementVisible('body', 1000)
        .assert.visible('.play-icon')
        .click('.videoWrapper')
        .waitForElementNotVisible('.play-icon')

        .waitForElementVisible('#buttonPlugin14')
        .assert.visible('#buttonPlugin14')

        .click('#buttonPlugin14')
        .waitForElementVisible('.tabsContentContainer')
        .assert.visible('.tabsContentContainer')

        .click('#buttonPlugin14')
        .waitForElementNotVisible('.tabsContentContainer')
        .assert.hidden('.tabsContentContainer')

        .end();
    }
  };
