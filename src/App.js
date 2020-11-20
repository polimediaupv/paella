import PlayerContext from 'context/PlayerContextProvider';

import manifest from 'test-data/dual-video.json'; 
import manifest360 from 'test-data/video360.json';

const { default: VideoPlayer } = require("./components/core/VideoPlayer");

 
function App() {

  let streamData = null;
  manifest.streams.some(s => {
    if (s.content === "presenter") {
      streamData = s;
    }
    return streamData;
  })
  console.log(streamData);

  return (
    <div className="App">
      <header className="App-header">
        <PlayerContext>
          <VideoPlayer streamData={streamData}></VideoPlayer>
        </PlayerContext>
      </header>
    </div>
  );
}

export default App;
