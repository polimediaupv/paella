
import VideoCanvas from './VideoCanvas';

export default function VideoPlayer({ streamData }) {
    let source = null;

    // TODO: Create a hook to select and collect the video stream data
    if (streamData.sources.mp4) {
        let bestSource = 0;
        streamData.sources.mp4.forEach(s => {
            if (s.res.h > bestSource) {
                source = s;
                bestSource = s.res.h;
            }
        })
    }

    console.log(source);

    return (
        <>
            <VideoCanvas src={source.src} canvas={streamData.canvas}></VideoCanvas>
        </>
    )
}
