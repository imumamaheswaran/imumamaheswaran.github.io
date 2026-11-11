---
title: "My thoughts on using regions in C#"
description: "Coding practices are such a divisive topic in any software team. Each of us will have our own preferences. But when we are in a team we need to bend our…"
pubDate: 2017-02-25T14:24:04+00:00
updatedDate: 2017-03-02T12:45:40+00:00
slug: "my-thoughts-on-using-regions-in-c"
categories: ["C#"]
tags: ["C#","coding-practices","region"]
wordpressId: 1361
---

Coding practices are such a divisive topic in any software team. Each of us will have our own preferences. But when we are in a team we need to bend our preferences a little, to accommodate the generally accepted coding practices of that team.

Everyone will not agree on particular coding practice, but it’s important to discuss with your team and decide on a common approach to protect the team harmony.

Still there are some coding preferences people may feel strongly about. For me the use of #region is one of those things. Regions are a way to make your code collapsible in the editor. It’s basically a named hint you place in C# or VB.NET code to set a folding point.

The people who defend the regions say “It helps me organize the code”. This answer drives me crazy “Really?? It helps you organize??”.

Regions doesn’t organize your code; it helps you hide disorganized code. You can think of regions as putting Band-Aid on a cancer wound. Of Course Band-Aid may help in hiding the wound. But that is not going to cure the cancer. Classes, Namespaces and Libraries organizes the code not these pointless little regions. In my view regions can contribute to code smells like long methods, god object etc.

## Below are the down sides of region

-   Regions are just glorified comments. It has zero meaning to the compiler
-   Bad codes are usually hidden under regions. People tend to abuse the feature mostly to hide their own shortcomings
-   It’s not readable. By default, VS hides the code under region. Of course you can change that behavior in the options but then comes the question why do you put it in the first place if you don’t want the folding.
-   The Single Responsbility Principle suggests that any unit should have one task and one task only. The fact that you put regions indicates that you are having multiple responsibilities in that module

## Is there a good use for regions?

No. The only reason it’s still there is because of the legacy usage. It would be impossible to remove them without breaking the existing code bases.

The fact that the language or the IDE supports a feature doesn’t mean that it should be used daily.
