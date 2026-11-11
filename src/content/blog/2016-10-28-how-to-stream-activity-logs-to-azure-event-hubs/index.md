---
title: "How to stream Activity Logs to Azure Event Hubs"
description: "Azure Introduction In this blog we are going to see how to stream activity logs of your azure subscription to a Event Hub. First create a service bus name…"
pubDate: 2016-10-28T14:05:20+00:00
updatedDate: 2016-12-20T04:00:25+00:00
slug: "how-to-stream-activity-logs-to-azure-event-hubs"
categories: ["Azure"]
tags: ["activity logs","Azure","event hubs"]
wordpressId: 1092
---

Azure

Introduction

In this blog we are going to see how to stream activity logs of your azure subscription to a Event Hub.

1.  First create a service bus name since this is required to export the Activity Log
2.  Go to Activity Logs page and click Export![azure-event-hub-step-2](./azure-event-hub-step-21.png)
3.  Enter the service bus name and policy![azure-event-hub-step-3](./azure-event-hub-step-31.png)
4.  Once the Export is done if you go to service bus resource you will not be able to see the event hubs since the new portal does not support that yet![azure-event-hub-step-4](./azure-event-hub-step-41.png)
5.  To view the event hub that is created  you need to go to the old portal
6.  In the old portal you should see the event hub with name ‘insights-operational-logs’![azure-event-hub-step-5](./azure-event-hub-step-51.png)

Conclusion

Once you create the event event you should be able to access it from other application using the proper connection string
