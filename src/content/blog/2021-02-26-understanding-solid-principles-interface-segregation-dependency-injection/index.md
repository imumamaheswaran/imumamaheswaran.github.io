---
title: "Understanding SOLID Principles: Interface Segregation & Dependency Injection"
description: "This blogpost talks about interface segregation and dependency injection in solid principles"
pubDate: 2021-02-26T17:43:33+00:00
updatedDate: 2021-03-07T07:42:19+00:00
slug: "understanding-solid-principles-interface-segregation-dependency-injection"
heroImage: "./img_20170729_140003.jpg"
categories: ["Agile","Software Development"]
tags: []
wordpressId: 2456
---

## Interface Segregation

The interface is one of the key concept in object oriented programming. Interfaces represent boundaries between what client code requires and how that requirement is implemented. The interface segregation principle states that interfaces should be small.

-   **S** [The Single Responsibility Principle](/2020/11/22/understanding-solid-principles-single-responsibility/)
-   **O** [The Open/Closed Principle](/2020/12/09/understanding-solid-principles-open-closed/)
-   **L** [The Liskov substitution principle](/2021/02/26/understanding-solid-principles-liskov-substitution/)
-   **I** [Interface Segregation](/2021/02/26/understanding-solid-principles-interface-segregation-dependency-injection/#interface-segregation)
-   **D** [Dependency Injection](/2021/02/26/understanding-solid-principles-interface-segregation-dependency-injection/#dependency-injection)

Because whenever we create an interface every single properties, events and methods needs to be implemented as its entirety. So if we have large interfaces it does not makes sense to expect clients to implement all members irrespective of what the client actually needs

Consider you are creating a streaming application user interface,

```csharp
public interface IStreamingUser {
   Stream Play(String videoId);
   Stream Download(String videoId);
}
```

There are different kind of streaming users,

-   RegularUser can only see video
-   Premium user can see as well as download the video

```csharp
public class RegularUser : IStreamingUser {
  Stream Play(String videoId) {
     // actual code to stream video
  }
  Stream Download(String videoId) {
    throw new NotImplementedException("");
  }
}

public class PremiumUser : IStreamingUser {
  Stream Play(String videoId) {
     // actual code to stream video
  }
  Stream Download(String videoId) {
    // actual code to stream video
  }
}
```

As you can now see from the above example since the interface is not segregated properly we had to force RegularUser class to implement Download method.

Fixing using interface segregation

```csharp
interface IPlayable {
 void Play(String id);
}

interface IDownlodable {
 void Download(String id);
}

class RegularUser : IPlayable {
  void Play(String id) {
     //code
  }
}
class PremiumUser : IPlayable,IDownloadable {
  void Play(String id) {
     //code
  }
  void Download(String id) {
     //code
  }
}
```

Too often, interfaces are large facades behind which huge subystems are hidden, At a certain critical mass, interfaces lose the adaptability that makes them so fundamental to developing solid code

## Dependency Injection

Dependency injection (DI) is a very simple concept with a similarly simple implementation However this simplicity belies the importance of the pattern. DI is the glue which ties all the SOLID principles together.

Let’s take a look at below controller class

```csharp
public class TaskListController 
{
    private readonly ITaskService taskService;
    private readonly IObjectMapper mapper;
    public TaskListController()
    {
         this.taskService = new TaskService();
         this.mapper = new AutoMapper();
    }

}
```

This problems with above code

-   Not unit testable
-   Hard dependency to taskService and mapper
-   Lack of flexibility in providing alternative service implementations.

Improved design

```csharp
public class TaskListController 
{
    private readonly ITaskService taskService;
    private readonly IObjectMapper mapper;
    public TaskListController(ITaskService taskService,IObjectMapper mapper)
    {
         this.taskService = taskService;
         this.mapper = mapper;
    }

}
```

Now you can see we have removed all hard dependencies. Now we can use any tools like DI framework and define the object graph well in advance. Also when unit testing we can mock these constructor arguments.

## Conclusion

Hope you guys found this series on SOLID principles useful.
