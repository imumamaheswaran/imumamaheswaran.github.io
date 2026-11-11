---
title: "Beware of these in JavaScript!"
description: "All programming languages has good and bad parts. It is up to us as a developer to be aware of these bad parts and be prepared to cope. JavaScript has its…"
pubDate: 2016-08-03T16:04:27+00:00
updatedDate: 2016-09-06T07:35:13+00:00
slug: "beware-of-these-in-javascript"
categories: ["JavaScript"]
tags: ["bad parts","JavaScript"]
wordpressId: 840
---

All programming languages has good and bad parts. It is up to us as a developer to be aware of these bad parts and be prepared to cope.

JavaScript has its fair share of bad parts and few awful parts, but still pretty good language considering the fact that it was designed in 10 days.

So below are some of the bad parts which we need to be aware of. If you want to get a complete list of these issues please refer to **JavaScript: The Good Parts book**

## Global Variables

JavaScript dependence in its global variables is the worst of all features. Use of global variables degrades the reliability  of the programs that use them.

There are three ways to define to Global Variables

```javascript
// place var statement outside any function
var foo = value;

// adds directly to the global object
window.foo = value;

// use variable without declaring to promote
// it as a global variable.
// Also called implied global
foo = value;
```

## Semicolon Insertion

JavaScript engine is intelligent enough identify the statements without us inserting semicolon at the end of every statement. This mechanism however has an unexpected behavior with return statements.

```javascript
function getDog() {
 return
 {
 status: true
 };
}
console.log(getDog());
```

Lets consider the above code sample. All this function does is returning an object with property status. But when you run it you will receive an undefined error.

This is because the semicolon insertion makes return as a statement.So the function ends there.

To fix this all you need to do is remove the new line between the return and curly braces.

```javascript
function getDog() {
 return {
 status: true
 };
}
console.log(getDog()); // prints {status:true}
```

## typeof

typeof in JavaScript returns a string that identifies the type of its operand.

```javascript
console.log(typeof 98.6); // prints 'number'
console.log(typeof 'i am uma'); //prints 'string'
console.log(typeof {}); //prints object

/**
 * But if you try to check the type of a null value then
 */

console.log(typeof null); // prints object
/**
 * So if you want to check for nulls in your program you better
 * use the below one
 */
var given_value = null;

if (given_value === null) {
 // ...
}
```

## parseInt

parseInt is a function that converts string into an integer.

But what if the string contains a non digit character so instead of 10 what if the text contains ’10 litres’. Any traditional programer would expect it to throw error. But instead of throwing error javascript will stop when it sees a nondigit.

```javascript
var my_number = '10', another_number = '10 litres';

console.log(parseInt(my_number)); //prints 10
console.log(parseInt(another_number)); //prints 10
```

## Floating Point

Buckle Up for this one, **In JavaScript 0.1 + 0.2 is not equal to 0.3**. Even though there is a valid reason for JavaScript to produce this result still it violates the very basics that we learned in school.

The reason for this behavior is because of the IEEE standard for Binary Floating Point Arithmetic

```javascript
console.log(0.1 + 0.2); // prints 0.30000000000000004
```

## NaN

NaN is a special quantity in JavaScript to represents not a number. This value can be produced by converting a string to number.

```javascript
/**
 * Now lets say we want to check whether a value is NaN or not.
 * The first thing we would try is to use typeof since typeof can
 * return the type of a value
 */

console.log(typeof NaN); // prints number

/**
 * How can typeof NaN (not a number) be number. So clearly
 * typeof is not able to distinguish
 * between number and NaN.
 * and it turns out that NaN is not equal to itself
 *
 */

console.log(NaN === NaN); // prints false

/**
 * So in your program if you want to distinguish
* between NaN and numbers
 * you can use the isNaN function provided by JavaScript
 */
```
