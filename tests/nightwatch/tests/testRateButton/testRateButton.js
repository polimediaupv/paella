module.exports = {
    'Test Page Load' : function (browser) {
      browser
        .url("http://localhost:8000/player/index.html?id=video-remote-1")
        .waitForElementVisible('body', 1000)
        .assert.visible('.play-icon')
        .click('.videoWrapper')
        .waitForElementNotVisible('.play-icon')

        .waitForElementVisible('#buttonPlugin8')
        .assert.visible('#buttonPlugin8')
        .click('#buttonPlugin8')

        .waitForElementVisible('#buttonPlugin9_container')
        .assert.visible('#buttonPlugin9_container')

        //Más?

        .end();
    }
  };