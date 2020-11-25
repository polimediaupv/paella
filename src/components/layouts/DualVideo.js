import React, { useState, useEffect } from 'react';
import VideoPlayer from 'components/core/VideoPlayer';
import {getStreams} from 'components/core/VideoContainer';

export function allowDualVideo({ streams, content }) {
    const validStreams = getStreams(streams, content);
    return validStreams === 2;
}

export default function DualVideo({ streams, content }) {
    const [streamsToShow, setStreamsToShow] = useState([]);

    useEffect(() => {
        if (allowDualVideo(streams,content)) {
            setStreamsToShow(getStreams(streams, content));
        }
        else {
            console.error(`Invalid number of streams`);
        }
    }, [content,streams]);

    return (
        <>
            <div>
                { streamsToShow.map((s,i) => {
                    return <VideoPlayer 
                                key={i}
                                streamData={s}></VideoPlayer>
                }) }
            </div>
        </>
    )
}
