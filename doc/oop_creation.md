#Paella JavaScript OOP - Creation

For defining a new classes for making new plugins or adding new features to the paella core, we must use this sintaxis:

if the new class has not parent:

```javascript
Class (<CLASSNAME>, {<OUR CODE>});
```

if the new class has parent:
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

##Variable Declaration

For declarate our variables inside new classes we are going to declare only basic types (number, string, boolean) in the class implementation and the "object" types inside class's constructor. If not object variables will be set as static ones.