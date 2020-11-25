import PlayerContext from 'context/PlayerContextProvider';

import manifest from 'test-data/dual-video.json'; 
import manifest360 from 'test-data/video360.json';

import VideoContainer, {getStreams,getSupportedLayouts} from 'components/core/VideoContainer';

const { default: VideoPlayer } = require("./components/core/VideoPlayer");

 
function App() {

  let streamData = null;
  manifest360.streams.some(s => {
    if (s.content === "presenter") {
      streamData = s;
    }
    return streamData;
  })
  const streams = manifest.streams;
  //console.log(streamData);

  //const streams = getStreams(manifest.streams, ["presenter","presentation"]);
  const supportedLayouts = getSupportedLayouts(manifest.streams);
  const layout = supportedLayouts[2];

  console.log(supportedLayouts);
 
  

  return (
    <div className="App">
      <header className="App-header">
        <VideoContainer streamData={streams} layout={layout}></VideoContainer>
      </header>
    </div>
  );
}

export default App;
