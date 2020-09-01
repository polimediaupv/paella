module.exports = {
    'Test Play Button' : function (browser) {
      browser
        .url("http://localhost:8000/player/index.html?id=video-remote-1")
        .waitForElementVisible('body', 1000)
        .assert.visible('.play-icon')
        .click('.videoWrapper') //Es la div que recibe el click
        .waitForElementNotVisible('.play-icon')
        .assert.hidden('.play-icon')
        .end();
    }
  };

  