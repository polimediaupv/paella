#JavaScript OOP - Creation

For defining a new classes for making new plugins or adding new features to the paella core, we must use this sintaxis:

```javascript
Class (<CLASSNAME>, <PARENT>, {<OUR CODE>});
```

As we can see in the examples:

- ZoomPlugin (EventDrivenPlugin):
```javascript
Class ("paella.ZoomPlugin", paella.EventDrivenPlugin, {...});
```

- ui_controls (DomNode):
```javascript
Class ("paella.TimeControl", paella.DomNode, {...});
```