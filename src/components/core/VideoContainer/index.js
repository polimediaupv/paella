import React, { useState, useEffect } from 'react';
import VideoPlayer from '../VideoPlayer';

// Returns as many streams as the requiredContent array indicates, or null if the 
// requirements of the streams are not met
export function getStreams(streams, requiredContent) {
    const foundStreams = [];
    const requiredStreams = Array.isArray(streams) ? streams.filter(s => {
        if (requiredContent.indexOf(s.content) !== -1 &&
            foundStreams.indexOf(s.content) === -1
        ) {
            foundStreams.push(s.content);
            return true;
        }
        else {
            return false;
        }
    }) : [];

    return requiredStreams.length === requiredContent.length ? requiredStreams : null;
}

// Returns the valid stream layouts available for the stream data
export function getSupportedLayouts(streams) {
    // TODO: Load this from the configuration
    const availableContent = [
        ["presenter"],
        ["presentation"],
        ["presenter","presentation"],
        ["presenter-2","presentation"],
        ["presenter","presenter-2"],
        ["presenter","presenter-2","presentation"]
    ];

    return availableContent.filter(c => getStreams(streams,c) !== null);
}

// TODO: layout is one of the layouts returned by getSupportedLayouts() with streams as parameter
export default function VideoContainer({ streamData, layout }) {
    const [streams,setStreams] = useState([]);
    //const layout = ["presenter","presentation"];

    console.log(streamData);
    console.log(layout);

    useEffect(() => {
        setStreams(getStreams(streamData,layout));
    }, [streamData, layout]);

    return (
        <>
            {
                streams && streams.length && streams.map((s,i) => {
                    console.log(s);
                    return <VideoPlayer streamData={s} key={i}></VideoPlayer>
                })
            }
        </>
    );
}