---
title: "Is everything in JavaScript an Object or Function?"
description: "I think everyone would agree JavaScript is the most misunderstood language. It’s not just misunderstood by people who dislike it, but also by the people who…"
pubDate: 2016-12-19T13:02:42+00:00
slug: "is-everything-in-javascript-an-object-or-functions"
categories: ["JavaScript"]
tags: ["functions","JavaScript","objects vs functions"]
wordpressId: 1238
---

I think everyone would agree JavaScript is the most misunderstood language. It’s not just misunderstood by people who dislike it, but also by the people who likes it.

I kind of understand the confusion since JavaScript has both Good and Bad Parts. This blog is about one such misunderstanding.

Is everything in JavaScript objects? Yes! Well mostly except things like string, numbers, booleans etc. but today I was surprised to see some devs argue that everything in JavaScript is an Function.

Well I have below reasons why its not

1.  In JavaScript anything that is not primitive type (undefined, null, number, string, boolean) is an Object.
2.  Object instances can contain more instances which can be functions. That’s what we call a “method” (since it has an automatic `this` variable)
3.  Since you can’t “call” every Object instance, not every object is a function. To test this you can declare **var item = {}** and then try calling it **item()**. you will receive an error “_item is not a function_“
4.  In JavaScript functions are an instance of a class called **Function.** Which does inherits from Object. You can see this [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function) article for clarification

So the point is All Objects are not functions but all functions are an Object.

Thanks,
