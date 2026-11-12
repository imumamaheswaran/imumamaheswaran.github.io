---
title: "Understanding SOLID Principles: Liskov Substitution"
description: "Liskov substitution is one of the more complex facets of the SOLID principles. It requires a foundational knowledge of both contracts and variance to build…"
pubDate: 2021-02-26T15:39:37+00:00
updatedDate: 2022-02-15T19:46:08+00:00
slug: "understanding-solid-principles-liskov-substitution"
heroImage: "./img_20171210_160352.jpg"
categories: ["Agile","Software Development"]
tags: ["designpatterns","SOLID","solid-principles"]
wordpressId: 2447
---

This post is continuation of the SOLID principles series that I have been writing about on SOLID Principles.

Please make sure you read my other blogs on the topic

-   [**S**](/2020/11/22/understanding-solid-principles-single-responsibility/) [The Single Responsibility Principle](/2020/11/22/understanding-solid-principles-single-responsibility/)
-   [**O**](/2020/11/22/understanding-solid-principles-single-responsibility/) [The Open/Closed Principle](/2020/12/09/understanding-solid-principles-open-closed/)
-   [**L**](/2020/11/22/understanding-solid-principles-single-responsibility/) [The Liskov substitution principle](/2021/02/26/understanding-solid-principles-liskov-substitution/)
-   [**I**](/2020/11/22/understanding-solid-principles-single-responsibility/) [Interface Segregation](/2021/02/26/understanding-solid-principles-interface-segregation-dependency-injection/#interface-segregation)
-   [**D**](/2020/11/22/understanding-solid-principles-single-responsibility/) [Dependency Injection](/2021/02/26/understanding-solid-principles-interface-segregation-dependency-injection/#dependency-injection)

The Liskov substitution principle (LSP) is a set of rules for creating inheritance hierarchies in which the consumers of these classes can reliably use any class or subclass without breaking their code.

> If S is subtype of T, then objects of type T may be replaced with objects of type S, without breaking the program — Barbara Liskov

Let’s look at some practical examples to understand this further. Consider we have a base class called `ShippingStrategy` and it is being inherited by `WorldWideShippingStrategy` and it contains the following method

```csharp
decimal CalculateShippingCost(
    float packageWeightInKilograms,
    Size<float> packageDimensionsInInches,
    RegionInfo destination)
```

The only thing that this method shares between `ShippingStrategy` and `WorldWideShippingStrategy` is its signature. The implementation could be completely different between these two classes.

Let’s see the base class(`ShippingStrategy`) implementation

```csharp
public decimal CalculateShippingCost(
    float packageWeightInKilograms,
    Size<float> packageDimensionsInInches,
    RegionInfo destination)
{
    if (packageWeightInKilograms <= 0f)
        throw new Exception($"{nameof(packageWeightInKilograms)} must be positive and non zero");

    // Actual logic
    return default(decimal);
}
```

As you can see from the above code example the function has a precondition to make sure the `packageWeightInKilograms` is always positive and non zero. Preconditions are defined as all the conditions necessary for a method to run reliably and without fault.

Now let’s consider the `WorldWideShippingStrategy` implementation

```csharp
public decimal CalculateShippingCost(
    float packageWeightInKilograms,
    Size<float> packageDimensionsInInches,
    RegionInfo destination)
{
    if (packageWeightInKilograms <= 0f)
        throw new Exception($"{nameof(packageWeightInKilograms)} must be positive and non zero");

    if (destination == null)
        throw new Exception($"{nameof(destination)}, Destination must be provided");

    // Actual logic
    return default(decimal);
}
```

Now since we have added an additional precondition in this implementation if any consumer using the base type might assume that they can pass null to the destination parameter and if they try to use the `WorldWideShippingStrategy`their program would break.

This is the actual problem that LSP principle is trying to address using the following rules

#### Contract Rules

-   Preconditions cannot be strengthened in a subtype
-   Postconditions cannot be weakened in a subtype
-   Invariants — conditions that must remain true through the lifetime of an object

#### Variance Rules

-   There must be contravariance of the method arguments in the subtype.
-   There must be covariance of the return types in the subtype
-   No new exceptions can be thrown by the subtype unless they are part of the existing exception hierarchy

### Conclusion

Even though LSP might appear to be one of the complex principles among SOLID principles, once we understand the concepts of preconditions, postconditions and variance it becomes easier to grasp.

Hope this helps!!
