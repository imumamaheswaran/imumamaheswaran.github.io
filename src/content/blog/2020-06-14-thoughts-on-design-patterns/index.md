---
title: "Thoughts on design patterns"
description: "My opinions on design patterns and practices and things that you should keep in mind while choosing design patterns"
pubDate: 2020-06-14T13:35:50+00:00
updatedDate: 2020-07-04T14:26:56+00:00
slug: "thoughts-on-design-patterns"
heroImage: "./designpatterns.png"
categories: ["Agile","Software Development"]
tags: ["Software Development"]
wordpressId: 2197
---

Good design patterns are reusable collaborations between interfaces and classes that can be applied repeatedly in many different scenarios, across projects, platforms, languages and frameworks.

Design patterns were popularized by Gang of Four book almost 25 years ago. however it is still very relevant today even though some of the patterns have been re-classified as anti patterns.

> If your design attempts to satisfy everyone you will likely end up satisfying no one
> 
> UNKNOWN

Knowing these design patterns is certainly an important step, however to studying the applications of design patterns much more important. Implementing design patterns is much more nuanced and need to consider lot of tiny variants before deciding on the design pattern.

As with most notable practices, design patterns are another theoretical tool that it is better to know than not know. They can be overused and they are not always applicable, sometimes over complicating an otherwise simple solution with an explosion of classes,interface, indirection and abstraction.

In my experience design patterns tend to be either underused or overused. In some projects, there are not enough design patterns and the code suffers from a lack of structure. Other projects apply design patterns too liberally, adding un-accounted abstraction and complexity where the benefit is negligible. The balance is in finding the right places to apply the right patterns.

Note that these patterns and practices, just like all others are merely tools for you to use. deciding when and where to apply any pattern or practice is part of the art of software development. Overuse leads to code that is adaptive, but on too fine-grained a level to be appreciated or useful. Overuse also affects another key facet of code quality: readability. It is far more common for software to be developed in teams than as an individual pursuit. Thus, judiciously selecting when and where to apply each pattern is imperative to ensure that the code remains comprehensible in the future
