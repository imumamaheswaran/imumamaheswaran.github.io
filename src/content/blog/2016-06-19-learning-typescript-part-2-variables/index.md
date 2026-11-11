---
title: "Learning TypeScript Part 2 -Variables"
description: "let and const are two new keywords introduced in the ECMAScript 6 (ES6, a.k.a. ES 2015) . Since TypeScript is the superscript of JavaScript the uses of let…"
pubDate: 2016-06-19T02:51:26+00:00
updatedDate: 2016-06-29T16:39:18+00:00
slug: "learning-typescript-part-2-variables"
categories: ["TypeScript"]
tags: []
wordpressId: 411
---

let and const are two new keywords introduced in the ECMAScript 6 (ES6, a.k.a. ES 2015) . Since TypeScript is the superscript of JavaScript the uses of let and const are already accessible in the language.

let is similar to var but it helps to avoid some of the common problems with var

const is similar to let plus is prevents the re-assignment of any variables.

## var conundrum

var in JavaScript has some odd scoping rules when compared to other languages. var declarations are accessible within their containing function, module, namespace or global scope regardless of the containing block.

In other words JavaScript doesn’t have the concept of block scoping.

```javascript
function callvalue(init) {
 if (init) {
 var x = 10;
 return x;
 }
 return x;
}

callvalue(true); //returns 10

callvalue(false); //returns undefined
```

### Other quirks with vars

Allows multiple declarations of the same variable in same scope

Variable Capturing :  JavaScript always captures variables, not values

## let

As we pointed our in the above section var have some problems which is why we should use let.

```javascript
 let x = 10; 
```

As you can see let are declared in the same way as var’s, but the difference is not in the syntax but in semantics.

### Block Scoping

Unlike var’s let uses block scoping or lexical scoping. For example the below code sample will throw error

```javascript
function callvalue(init) {
 if (init) {
 var x = 10;
 return x;
 }
 // Error x doesnt exist here
 return x;
}
```

Note: You can use variables before its declared in TypeScript but the catch is that it is illegal to use variables before declaring in TypeScript. If we are targetting ES6 compatible runtime this will throw a run time error.

```javascript
let x = 10;
let x = 20; // error: can't re-declare 'x' in the same scope
```

var allows for re-declaration of variables TypeScript wont

```javascript
function some() {
 let x = 100;
 var x = 100; // error: can't have both declarations of 'x'
}
```

## const

const declarations are similar to let but their value cannot be changed once its declared but all the scope rules that applies to let applies const too.

One catch to const though is its not immutable, its mutable. i.e you can’t reassign them but you can change the values.

```javascript
const obj = {
 name: &quot;Uma&quot;
};

// left hand side cannot be a constant
obj = {
 name: &quot;Mahes&quot;
}

// valid assignment
obj.name = &quot;Mahes&quot;;
```

## Destructuring

The destructuring assignment statement is used to extract data from arrays or objects into distinct variables.

### Array Destructuring

```javascript
let fullname = [&quot;Umamaheswaran&quot;,&quot;Manivannan&quot;];

let [firstname, lastname] = fullname;

console.log(firstname); // outputs Umamaheswaran

console.log(lastname); // outputs Manivannan
```

### Object Destructuring

```javascript
let fullname = {
 firstname: &quot;Uma&quot;,
 middlename: &quot;M&quot;,
 lastname: &quot;Mani&quot;
}

let {firstname, lastname} = fullname;
```

### Property renaming

```javascript
let {firstname: givenname, lastname: surname} = fullname;
```

the above line is equal to

```javascript
let givenname = fullname.firstname;
let surname = fullname.lastname;
```

### Default Values

This feature allows us to assign a default value if a value is undefined

```javascript
function myfunction(input: { a: string, b?: number }) {
 let {a, b = 100} = input;
}
```

In the above function in the input parameter v is declared as optional. If there are no values passed to b let keyword assigns them a default value of 100.

### Function declarations

Destructuring also works for functions

```javascript
function f({a, b} = {a: &quot;&quot;, b: 0}): void {
// ...
}
f();
```

## Conclusion

In the blog we have seen about variable declarations and its related features in the next blog we will look into interfaces and classes
