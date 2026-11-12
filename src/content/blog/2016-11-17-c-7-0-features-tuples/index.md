---
title: "C# 7.0 Features – Tuples"
description: "Now that VS 2017 RC is released with bunch of cool features along with refactoring support leveraging C# 7.0 features, Now is the best time to take a deep…"
pubDate: 2016-11-17T17:24:05+00:00
updatedDate: 2017-03-28T12:45:48+00:00
slug: "c-7-0-features-tuples"
categories: ["C#"]
tags: ["C#","C# Tuples","C#7.0","Tuple","Tuples"]
wordpressId: 1129
---

Now that [VS 2017 RC](https://www.visualstudio.com/vs/visual-studio-2017-rc/) is released with bunch of cool features along with refactoring support leveraging C# 7.0 features, Now is the best time to take a deep dive in C# 7.0 features.

We are going  start with one of the most exciting feature called Tuples.

## What is Tuples?

Tuples makes it easy to have multiple results, and pattern matching, which simplifies the code that is conditional on the shape of data.

Tuple are values types and their elements are simply public mutable fields. So there is no encapsulation.

Below code has two methods one methods sums all values in a array. another method counts all values in the array.

```csharp
class Program
 {
 static void Main(string[] args)
 {
 int[] values = { 1, 4, 2, 5, 6 };

 var sum = Sum(values);
 var count = Count(values);
 WriteLine($"Sum : {sum}, Count : {count}");
 Console.ReadKey();
 }

 static int Sum (int[] values)
 {
 var sum = 0;
 foreach(var v in values)
 {
 sum = sum + v;
 }
 return sum;
 }

 static int Count(int[] values)
 {
 var count = 0;
 foreach (var v in values)
 {
 count = count + 1;
 }
 return count;
 }
 }
```

Now lets use tuple to simplify the above code. To use tuples you need to install the [this](https://www.nuget.org/packages/System.ValueTuple) NuGet package

```csharp
class Program
 {
 static void Main(string[] args)
 {
 int[] values = { 1, 4, 2, 5, 6 };
 var result = Tally(values);
 WriteLine($"Sum : {result.Item1}, Count : {result.Item2}");
 Console.ReadKey();
 }

 static (int, int) Tally(int[] values)
 {
 var result = (0, 0);
 foreach (var v in values)
 {
 result = (result.Item1 + v, result.Item2+1);
 }
 return result;
 }
 }
```

So If you look at the above code you can see that the method Tally has an interesting signature going on

```csharp
static (int, int) Tally(int[] values)
```

This is how you would return a tuple from a method. you have to enclose the list of return types with parentheses . Inside the method you can declare a tuple variable using the same syntax only this time you have to specify the values.

```csharp
var result = (0, 0);
```

If you look closely in both statements we have not specified any name for the parameters. If we do not have a name for tuple compiler will automatically assign a name like Item1, Item2 etc

So in the code you can access the elements like below

```csharp
result = (result.Item1 + v, result.Item2+1);
```

We can name the tuple fields as we name any other field in C#

```csharp
static (int sum, int count) Tally(int[] values)
{
 var result = (s: 0, c: 0);
//....
}
```

### Deconstruction

Deconstructing declaration makes it possible to split a tuple into multiple parts and assign them to fresh variables

```csharp
(var sum, var count) = Tally(values);
```

There are multiple ways we can deconstruct Tuple

```csharp
(var sum, var count) = Tally(values);
(int sum1, int count1) = Tally(values);
var (sum2, count2) = Tally(values);
int sum3, count3;
(sum3, count3) = Tally(values); // assign already declared vars
```

As we already seen tuple are values types which means they can be used as a value just like we use int and string.

For example the below code uses Tuple as a Dictionary Key

```csharp
var dict = new Dictionary<(int, int), string>()
 {
 {(0,0),"Origin" },
 {(1,0),"X-Axis" },
 {(0,1),"Y-Axis" },
 {(1,1),"Plane" },
 };
```

## Conclusion

If you ever stumbled upon out parameter and async method problem Tuple would be your saviour. I can’t wait to start using this feature in my projects.
