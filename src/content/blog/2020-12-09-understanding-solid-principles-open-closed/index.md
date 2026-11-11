---
title: "Understanding SOLID Principles: Open/Closed"
description: "This is the part 2 of the series of posts that I’m writing on the topic of solid principles"
pubDate: 2020-12-09T19:01:31+00:00
updatedDate: 2021-03-07T07:41:39+00:00
slug: "understanding-solid-principles-open-closed"
heroImage: "./img_20170729_140448.jpg"
categories: ["Agile","C#","Software Development"]
tags: ["Agile","closed","open","principles","SOLID"]
wordpressId: 2437
---

As beginners we would have all written code that is quite procedural, irrespective of the language we begin with. Beginners tend to use classes as storage mechanisms for methods, regardless of whether those methods truly belong together. There is no/lack of architecture to the code, and there are very few extension points. Any change in the requirement will result in modifying the existing code which could result in regression.

-   **S** [The Single Responsibility Principle](/2020/11/22/understanding-solid-principles-single-responsibility/)
-   **O** [The Open/Closed Principle](/2020/12/09/understanding-solid-principles-open-closed/)
-   **L** [The Liskov substitution principle](/2021/02/26/understanding-solid-principles-liskov-substitution/)
-   **I** [Interface Segregation](/2021/02/26/understanding-solid-principles-interface-segregation-dependency-injection/#interface-segregation)
-   **D** [Dependency Injection](/2021/02/26/understanding-solid-principles-interface-segregation-dependency-injection/#dependency-injection)

In our previous part we have seen [Single Responsibility Principle](/2020/11/22/understanding-solid-principles-single-responsibility/), which talked about god object and how you should refactor it for clarity. In this post let’s see about Open/Closed principle.

The name Open/Close principle may sound like a oxymoron. But lets look at the definition from Meyer

> Software entities should be open for extension, but closed for modification
> 
> Bertrand Meyer

**Open for extension** – This means that the behavior of the module can be extended. As the requirements of the application change, we are able to extend the module with new behaviors that satisfy those changes, In other words, we are able to change what the module does.

**Close for modification** – Extending the behavior of a module does not result in changes to the sources or binary code of the module. The binary executable version of the module, whether in a linkable library, a DLL, or a Java .jar, remains untouched.

## Extension Points

Classes that honor the OCP should be open to extension by containing defined extension points where future functionality can hook into the existing code and provide new behaviors.

If you looked at the code sample that from the [Single Responsibility Principle](/2020/11/22/understanding-solid-principles-single-responsibility/) the snippet that you see before refactoring is an example for no extension code.

If you allow changes to existing code there is a higher chance of regression and also when you change an existing interface it will have an impact on the client.

We can provide extension code using following concepts

-   Virtual Methods
-   Abstract Methods
-   Interface

### Virtual Methods

If we mark one of the member of class as virtual it becomes an extension. This type of extension is handled via inheritance. When your requirement for an existing class changes, you can just subclass the existing class and without modifying its source code you can change the behavior to satisfy new requirement

### Abstract Methods

Abstract is one another OOPS concept which we can use to provide extension points. By declaring a member as abstract you are leaving the implementation details to the inheriting class. Unlike virtual here we are not overriding an existing implementation, but rather delegating the implementation to sub class.

### Interface inheritance

The final type of extension point is interface inheritance. Here, the clients dependency on a class is replaced with the interface. Unlike other two methods when it comes to interface all the implementation details are client specific thus offer much more flexible.

Also this helps to keep inheritance hierarchies shallow, with few layers of subclassing.

## Closed for change

> Design and document for inheritance or else prohibit it
> 
> Joshua Bloch

If you are using inheritance then you must be aware that any class can be inherited and can be added with new functionality. But if we are allowing it we must have proper documentation for the class so as to protect and inform future programmers who extend the class.

If you are not expecting a class to be extended its better to restrict the extension by using the keyword **sealed**.

## Conclusion

Knowing that you add extension point is not sufficient, however. You also need to know when this is applicable. Identify the parts of the requirement that are likely to change or that are particularly troublesome to implement. So depending on the specific scenario the code can be rigid or it can be fluid, with myriad extension points.

## Reference

Adaptive Code Via C# – Gary Mclean Hall
