---
title: "Dynamic objects in C#"
description: "Dynamic objects in C# are objects that can have properties and methods added to them at runtime, as opposed to traditional objects which have a fixed set of…"
pubDate: 2023-01-01T15:38:39+00:00
slug: "dynamic-objectd-in-c"
heroImage: "./pexels-photo-192136.jpeg"
categories: ["Software Development"]
tags: ["C#","dotnet","Software Development"]
wordpressId: 2817
---

Dynamic objects in C# are objects that can have properties and methods added to them at runtime, as opposed to traditional objects which have a fixed set of properties and methods defined at compile time. There are a few different ways to create dynamic objects in C#, including the `dynamic` keyword and the `ExpandoObject` class.

Here’s and example of using the `dynamic` keyword to create a dynamic object:

```csharp
dynamic obj = new ExpandoObject();
obj.Name = "John Smith";
obj.Age = 30;

console.WriteLine($"Name: {obj.Name}, Age: {obj.Age}");
```

In the example above, we create a dynamic object using the `ExpandoObject` class, which is part of the `System.Dynamic` namespace. We then add a `Name` and `Age` property to the object, and print them out.

Here’s an example of using the `ExpandoObject` class to create a more powerful and flexible dynamic object:

```csharp
dynamic obj = new MyDynamicObject();
obj.Name = "John Smith";
obj.Age = 30;

console.WriteLine($"Name: {obj.Name}, Age: {obj.Age}");

public class MyDynamicObject : DynamicObject
{
    private Dictionary<string, object> _properties = new Dictionary<string, object>();

    public override bool TrySetMember(SetMemberBinder binder, object value)
    {
        _properties[binder.Name] = value;
        return true;
    }

    public override bool TryGetMember(GetMemberBinder binder, out object result)
    {
        return _properties.TryGetValue(binder.Name, out result);
    }
}
```

In the example above, we define a `MyDynamicObject` class that inherits from `DynamicObject`, and overrides the `TrySetMember` and `TryGetMember` methods. These methods allow us to add and retrieve properties from the object at runtime.

Dynamic objects can be useful in a variety of situations, such as when you need to work with data that has a flexible schema, or when you want to add properties and methods to an object at runtime based on user input. However, it’s important to keep in mind that using dynamic objects can make your code less predictable and more difficult to debug, so it’s usually best to use them sparingly. The `ExpandoObject` is a more powerful and flexible option than the `dynamic` keyword, but it may be more complex to use in some cases.

## dynamic vs expando

-   `dynamic` is a type, whereas `ExpandoObject` is a class: The `dynamic` keyword is a type that can be used to declare a variable. When you declare a variable as `dynamic`, you can assign any value to it at runtime. The `ExpandoObject` class, on the other hand, is a class that you can use to create a dynamic object
-   `dynamic` objects are resolved at runtime, whereas `ExpandoObject` objects are resolved at runtime and compile time: When you use the `dynamic` keyword, the compiler does not check the type of the object at compile time. Instead, the type is resolved at runtime, which can make it more difficult to catch errors. The `ExpandoObject`, on the other hand, is resolved at both runtime and compile time, which means that the compiler can catch some errors that might occur when using the object.
-   `dynamic` objects have limited functionality, whereas `ExpandoObject` objects have more functionality: The `dynamic` keyword is limited to the functionality provided by the .NET runtime. This means that you cannot add your own methods or properties to a `dynamic` object. The `ExpandoObject`, on the other hand, is part of the `System.Dynamic` namespace, which provides a number of classes and methods for working with dynamic objects. This means that you can use the `ExpandoObject` to create more powerful and flexible dynamic objects.

## Conclusion

In general, the `ExpandoObject` is a more powerful and flexible option than the `dynamic` keyword, since it provides more functionality and is resolved at both runtime and compile time. However, the `dynamic` keyword can be a simpler and more lightweight option in some cases, particularly when you don’t need the additional functionality provided by the `ExpandoObject`.
