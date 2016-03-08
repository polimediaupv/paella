#JAVASCRIPT INHERITANCE

For inherit our classes we are going to use a specific sintaxis based on the prototype from Sam Stephenson and Alex Arnell's inheritance implementation.

We can see how to do so in the code below:

```javascript
Class ("ns.A", {
        initialize:function() {
        },

        sayHello:function() {
                console.log("Hello");
        }
});

Class ("ns.B", ns.A, {
        sayHello:function() {
                this.parent();
                console.log("from ns.B");
        }
});

var b = new ns.B();

b.sayHello();

// HELLO
// from ns.B
```

##Sintaxis

```javascript
Class (<STRING_CLASSNAME>,<PARENT_NAME>,{<CODE>});
```
