---
title: "Beyond Microservices: Why Amazon’s Move to Monoliths Makes Sense"
description: "In this article, we explore the topic of monoliths vs. microservices and take a closer look at the arguments made in a recent Amazon blog post that…"
pubDate: 2023-05-05T05:48:36+00:00
slug: "beyond-microservices-why-amazons-move-to-monoliths-makes-sense"
heroImage: "./pd19-3-33049u.jpg"
categories: ["Software Development"]
tags: ["Amazon Web Services (AWS)","Cloud Computing","Containerization","DevOps","Maintainability","Microservices","Monoliths","Reliability","scalability","Software Architecture"]
wordpressId: 2979
---

In recent years, many companies have embraced the microservices architecture to develop their applications. Microservices architecture allows for building an application as a suite of small, independent services that communicate with each other using APIs. This approach offers several benefits such as faster deployment, independent scaling, and better fault tolerance. However, as Prime Video’s VQA team discovered, this approach is not always the best fit for every use case.

> Check out amazon’s article in this [link](https://www.primevideotech.com/video-streaming/scaling-up-the-prime-video-audio-video-monitoring-service-and-reducing-costs-by-90)
> 
> Amazon

The VQA team had developed a distributed system consisting of three major components: media conversion, defect detectors, and orchestration. However, they noticed some scaling bottlenecks and cost issues in their distributed system. For example, they were hitting a hard scaling limit at around 5% of the expected load and the overall cost of all the building blocks was too high to accept the solution at a large scale.

To address these issues, the VQA team revisited their architecture and decided to move from a microservices architecture to a monolith. They packed all of the components into a single process, eliminating the need for an S3 bucket as the intermediate storage for video frames because data transfer happened in the memory. They also implemented orchestration that controls components within a single instance.

This decision allowed the team to reuse a lot of code and quickly migrate to a new architecture. However, it also had some implications. For example, the number of detectors only scaled vertically because they all ran within the same instance. To overcome this problem, the team cloned the service multiple times, parametrizing each copy with a different subset of detectors. They also implemented a lightweight orchestration layer to distribute customer requests.

In conclusion, the VQA team’s decision to move from a microservices architecture to a monolith was driven by their specific use case. While microservices architecture offers several benefits, it is not always the best fit for every use case. It is essential to evaluate the trade-offs and make an informed decision that aligns with the project goals.
