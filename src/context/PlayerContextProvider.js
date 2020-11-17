import React, { useState } from 'react';

const Context = React.createContext({});

export function PlayerContextProvider({children}) {
    const [playerContext,setPlayerContext] = useState({});

    return (
        <Context.Provider value={{playerContext,setPlayerContext}}>
            {children}
        </Context.Provider>    
    );
}

export default PlayerContextProvider;
