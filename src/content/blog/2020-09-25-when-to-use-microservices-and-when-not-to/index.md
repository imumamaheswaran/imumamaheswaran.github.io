---
title: "When to Use Microservices (And When Not To!)"
description: "One of the main problem in our industry is we focus on the tech tool, not the thing that the tech tool let’s you do. So when you say you want to use…"
pubDate: 2020-09-25T15:21:24+00:00
slug: "when-to-use-microservices-and-when-not-to"
heroImage: "./blogging-tips-linkedin-post-header.png"
categories: ["Software Development"]
tags: []
wordpressId: 2359
---

One of the main problem in our industry is we focus on the tech tool, not the thing that the tech tool let’s you do. So when you say you want to use microservice architecture, first you have to think what’s the thing it’s going to give you?

## What can microservices architectures give you?

-   More options to scale up applications
-   Independent deployability
-   Limiting the “blast radius” of failure

> Microservices architectures buy you options
> 
> James LEwis

One should use microservices as a means to obtain a desired outcome rather than for the sake of using a new technology

## Don’t use microservices as a default option

Microservices are not an on/off switch. There is significant cost in committing yourself to a microservice architecture. Once done it is very difficult move away from that architecture without a major rework of your solution.

Some of us feel microservice are suitable for distributed architecture, and it is! But it doesn’t mean a single process monolith architecture is not distributed… but actually it is. For example if you are reading data from a database on a separate computer, other than the webserver, that’s a distributed system as well. In lot of cases this is all you might need.

## Top reasons to introduce microservices

-   Zero-downtime independent deployability
-   Isolation of data and of processing around that data
-   Use microservices to reflect the organizational structure

## How to avoid a distributed monolith

Sometime when implementing microservices if we end up having to deploy service A if we want to update service B then we are violating one of the important trait of microservices “Independent Deployability”.

### Avoid this trap by

-   Create a deployment mechanism
-   Look for patterns
-   Decide if you want to merge those dependent services back together again
-   You might want to look at different ways to slice and dice them

## Why strive for independent deployment

It’s easier to limit the impact of each release with microservices. With a microservice architecture, if I am just deploying a single service, I can reduce the scope of that deployment and do it more effectively and efficiently.

As the team size increases it gets exponentially harder to coordinate a deployment

## Handling data

A lot of the complexity of breaking complex systems lies in the data. After extracting the microservice your need to understand what part of the the old database this system uses

## Handling People

> No matter what they tell you, it’s always a people problem
> 
> Gerald Weinberg

There has to be a willingness to change as an organization if you want to make the most out of using microservices

## Takeways

1.  Our Industry tends to focus on tech instead of the outcome, One should use microservices as a means to obtain a desired outcome rather than for the sake of using a new technology
2.  Microservices shouldn’t be the default option. If you think a service architecture could help, try it with one of the modules from a very simple monolith typology and let it evolve from there
3.  The reasons for using microservices are, Zero-downtime independent deployability, Isolation of data and of processing around that data. Use microservices to reflect the organizational structure

> This blog is to basically list of key points that were discussed between Martin Fowler and Sam Newman in a Youtube video.
> 
> GOTO CONFERENCES

Thanks for reading 🙏🙏🙏
