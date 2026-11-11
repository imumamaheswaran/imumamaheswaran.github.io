---
title: "Higher order functions for Array in JavaScript"
description: "In JavaScript Higher Order Functions are functions which operates on other functions by either taking them as an argument or by returning it. Higher Order…"
pubDate: 2016-07-30T15:28:21+00:00
updatedDate: 2016-08-08T13:44:31+00:00
slug: "higher-order-functions-for-array-in-javascript"
categories: ["JavaScript"]
tags: []
wordpressId: 791
---

In JavaScript Higher Order Functions are functions which operates on other functions by either taking them as an argument or by returning it. Higher Order Functions basically provides an abstraction over action.

Below are list of six higher order functions that I believe are most useful

## 1\. Array.prototype.forEach

Executes the provided callback for each items in the array.

```javascript
//lets assume we have all out groceries in the groceries.json file
var groceries = require('./groceries.json');

/**
 * 1. Array.protorype.forEach
 * Executes the provided callback for each items in the array.
 */

// print all names in the groceries list
groceries.forEach(function (item) {
 console.log(item.name);
});

/**
 * OutPut
 * ======
 * Coffee
 * Tea
 * Sandwich
 * Bagels
 * Cheeses
 * Eggs
 * Milk
 */
```

## 2\. Array.protoptype.filter

In JavaScript filter function provides subset of an array based on the condition provided by the callback function. For each value in the array if the callback function returned true then the value is included in the result otherwise it is excluded.

```javascript
//Select all diary groceries from the groceries list

var dairyGroceries = groceries.filter(grocery =&gt; grocery.type === 'Diary');

console.log(dairyGroceries);

/**
* Output
* [ { name: 'Cheeses', cost: 40, type: 'Diary' },
{ name: 'Eggs', cost: 50, type: 'Diary' },
{ name: 'Milk', cost: 100, type: 'Diary' } ]
*/
```

## 3\. Array.prototype.map

map is used to produce a new array with results of callback applied to each element in the array.

```javascript
// add a new variable to the groceries list indicating whether cost is high or low
var mappedGrocery = groceries.map(item =&gt; {
item.isCostly = item.cost &gt; 50
? true
: false;
return item;
});
console.log(mappedGrocery);
```

## 4\. Array.prototype.reduce

This method reduces the array by single value by applying the callback function in every element in the array.

```javascript
// Find the total cost of all items in the grocery list
var totalCost = groceries.reduce((previous, current) =&gt; previous + current.cost, 0);
console.log(totalCost); // prints 420
```

## 5\. Array.prototype.some

This method returns true if the given condition is satisfied for any of the items in array, otherwise it returns false.

```javascript
var isMilkAdded = groceries.some(item =&gt; item.name === 'Milk');
console.log(isMilkAdded);
```

## 6\. Array.prototype.every

This method returns true if the given condition is satisfied for every items in array, otherwise it returns false.

```javascript
var isAllGroceriesAbove10 = groceries.every(item =&gt; item.cost &gt; 20);
console.log(isAllGroceriesAbove10);
```

## Conclusion

These higher order functions becomes really power when you start combining them using chaining. As you can see from the examples you can do lot of things with few lines of code.
