---
title: "Learning TypeScript Part 5- Functions"
description: "Functions Just as in JavaScript functions can be created both as a named function or as an anonymous function. Similar to JavaScript TypeScript also…"
pubDate: 2016-06-29T16:25:18+00:00
updatedDate: 2016-07-05T05:36:25+00:00
slug: "learning-typescript-part-5-functions"
categories: ["TypeScript"]
tags: []
wordpressId: 729
---

## Functions

Just as in JavaScript functions can be created both as a named function or as an anonymous function. Similar to JavaScript TypeScript also captures variables.

```javascript
function add(x, y) {
	return x + y;
}

let myAdd = function (x, y) { return x + y };

/**Typing the function */
function add(x: number, y: number): number {
	return x + y;
}

let myAdd = function (x: number, y: number): number { return x + y };
```

### Contextual Typing

As you can see in the above example TypeScript compiler can figure out the type if you have types on one side of the equation but not the other.  
This is called contextual typing a form of inference.

### Optional Parameters

In JavaScript every parameter is optional but in TypeScript every parameter is required by default.  
The number of arguments given in the parameters must match no.of arguments passed

### Default Parameters

Even though TypeScript expects exact parameter list we can still be able to have optional parameters using the symbol ? But one catch is that all the optional parameters has to come in the end

```javascript
function build(firstName: string, lastName?: string) {
	return firstname + ' ' + lastName;
}

build('Bob'); //Ok
build('a', 'b', 'c'); //too many params
```

-   Optional parameters used as a default value if a parameter is not provided with a value
-   Optional parameters not necessarily should be placed at the end of the params list
-   Default parameters that comes after all required params are treated as optional

```javascript
function buildName(firstName: string, lastName = &quot;Smith&quot;) {
	return firstName + ' ' + lastName;
}

buildName('Bob'); //returns Bob Smith
buildName('Bob', 'Ryan') // returns Bob Ryan
```

### Rest params

Allows to pass any number of params

```javascript
function restParamDemo(firstName: string, ...restOfName: string[]) {
	return firstName + ' ' + restOfName.join(' ');
}

restParamDemo('Bob'); //Valid
restParamDemo('Bob', 'Some 2'); //Valid
restParamDemo('Bob', 'Some 2', 'Some 3'); //Valid
//would be valid for any number of params
```

### Lamdas

When using JavaScript you should be carefull while using ‘this’ keyword in callback. Lamdas can be used to capture this when function is created rather than when it is invoked

### Overloads

-   JavaScript is inherently very dynamic language. A function can return any type of objects from string, number etc to complex objects based on the input
-   But this will not allow us to describe a type of the function effectively
-   Overloads allows us to use multiple function types for the same function as a list of overloads
