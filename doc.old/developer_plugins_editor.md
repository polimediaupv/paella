#Paella editor plugins

## paella.editor.EditorPlugin (extends paella.Plugin)

Base class of all Paella Editor plugins. It provides with the editor's basic interaction functions.

- onTrackSelected(newTrack): Paella Editor calls this function when the user switches the current track. The parameter 'newTrack' contains the new selected track, or null if the user has deselected the track.

- onSave(success): This function is called when the user selects the 'Save and close' or 'Save' option in the editor. This function must to call the 'success' callback parameter when the operation is complete.

- onDiscard(success): This function is called when the user selects the 'Discard and close' option in the editor. This function must to call the 'success' callback parameter when the operation is completed.

- contextHelpString(): It returns the plugin's context help string. The context help string is a brief text that explains the functionality of the plugin. It is shown in the editor right bar.



## paella.editor.TrackPlugin

- getTrackName(): Plugin visual configuration. Override: required. It returns the name of the track. It's recommendable to translate this name into the user language, using paella.dictionary.translate().

- getColor(): Plugin visual configuration. Override: optional. It returns the CSS color of the track. although the override of this function is optional, it is highly recommendable to do it and return a different color than the other installed tracks.

- getTextColor(): Plugin visual configuration. Override: optional. It returns the CSS color of the track's name text. Override it only if the color returned by getColor() makes difficult to read the track name.

- getTrackItems(): 

- allowResize()

- allowDrag()

- allowEditContent()

- onTrackChanged(id,start,end)

- onTrackContentChanged(id,content)

- onSelect(trackItemId)

- onUnselect()

- onDblClick(trackData)

- getTools()

- onToolSelected(toolName)

- getSettings()



## paella.editor.MainTrackPlugin (extends paella.editor.TrackPlugin)

- getTrackType()

- getTrackItems()



## paella.editor.RightBarPlugin

- getTabName()

- getContent()

- onLoadFinished()



## paella.editor.EditorToolbarPlugin

- getButtonName()

- getIcon()

- getOptions()

- onOptionSelected()




