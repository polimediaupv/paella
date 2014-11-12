#JAVASCRIPT DYNAMIC CAST

The concept of the dynamic cast is very close to the [JavaScript Inheritance](oop_inheritance.md) in another section of this documentation. As you will see in the next code we can use this type of casting for to know if our object has any methods or if its belongs to one class.

for example:

```javascript
Class ("ns.A", {
        initialize:function() {...},
		sayHello:function() {...}
});

Class ("ns.B", ns.A, {
		sayGoodBye:function(){...}
});

// TO KNOW THE CLASS OF "obj" AND MAKE SOMETHING DEPENDING OF THE CLASS
function doSomething ( obj ) {
	var is_nsB = dynamic_cast("ns.B", obj);
	var is_nsA = dynamic_cast("ns.A", obj);

	if(is_nsB) {obj.sayGoodBye();}

	if(is_nsA) {obj.sayHello();}

}
```