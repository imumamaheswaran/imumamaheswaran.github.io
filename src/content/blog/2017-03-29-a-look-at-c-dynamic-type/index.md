---
title: "A look at C# dynamic type"
description: "A brief look at C# dynamic types"
pubDate: 2017-03-29T16:36:57+00:00
updatedDate: 2017-03-30T04:34:02+00:00
slug: "a-look-at-c-dynamic-type"
categories: ["C#"]
tags: ["C#","dynamic"]
wordpressId: 1368
---

Even though dynamic keyword was introduced in C# 4.0. I have never used it so far in any of my code. I have seen some of colleagues use it, but I was always able to point out how we can do the same thing static types.

I always thought dynamic typing is a bit like unsafe code. Many developers will have no need for it, or will use very rarely. As far as I have researched it looks like it’ll give a huge productivity boost for the developers dealing with Microsoft Office, either by making their existing code simpler or by allowing radically different approaches to solve their problems. I personally never had an experience in working with Microsoft Office APIs or just COM in general. But you can’t predict what novel uses the community may come up with in the future. So its always good to learn at-least a little bit about any technologies Just in Case. With that lets dive in to dynamic type.

## What is dynamic type?

In C# dynamic is a type which helps us bye pass compile time type checking. Instead types will be resolved at run time. You would declare dynamic type just like you would declare any other types in C# there will be no special syntax. Below are main rules of dynamic

-   Any CLR type can be converted to dynamic implicitly
-   Any expression which results in a dynamic type can be converted to CLR type implicitly
-   Expression that use a value of type dynamic are usually evaluated dynamically
-   The static type of a dynamically evaluated expression is usually deemed to be dynamic

Below example demonstrates all the above points

```csharp
 // CLR type converts to dynamic type
 // using implicit conversion
 dynamic items = new List<string>
 {
 "First",
 "Second",
 "Third"
 };
 dynamic valueToAdd = "!";
 foreach (var item in items)
 {
 //dynamic type converts to CLR type
 //implicitly without any cast
 string result = item + valueToAdd;
 WriteLine(result);
 }
//Outputs
//=======
//First!
//Second!
//Third!
```

Now what would happen if you wanted to add an integer instead of string with the List<string>

```csharp
// CLR type converts to dynamic type
 // using implicit conversion
 dynamic items = new List<string>
 {
 "First",
 "Second",
 "Third"
 };
 dynamic valueToAdd = 2;
 foreach (var item in items)
 {
 //dynamic type converts to CLR type
 //implicitly without any cast
 string result = item + valueToAdd; //Concatenation
 WriteLine(result);
 }
```

```text
//Outputs
//=======
//First2
//Second2
//Third2
```

If you were using static typing you would have needed to change the declaration of valueToAdd from string to int. What if you changed the items to be integers as well? Let’s try that one simple change, as shown in the following listing.

```csharp
// CLR type converts to dynamic type
// using implicit conversion
dynamic items = new List<int> { 1, 2, 3 };
dynamic valueToAdd = 2;
foreach (var item in items)
{
//dynamic type converts to CLR type
//implicitly without any cast
string result = item + valueToAdd;
WriteLine(result);
}
```

Oops! You’re still trying to convert the result of the addition to a string. The only conversions that are allowed are the same ones that are present in c# normally. So there’s no conversion from int to string. The result is a run time exception.

## RunTimeBinderException is the new NullReferenceException

If you are going to use dynamic type lot you are bound come across the exception RunTimeBinderException. In the previous example anyways you can fix it by changing the result type to dynamic, so that the conversion isn’t required.

You can write the same example with all the variables as dynamic like below

```csharp
 dynamic items = new List<int> { 1, 2, 3 };
 dynamic valueToAdd = 2;
 foreach (var item in items)
 {
 WriteLine(item + valueToAdd);
 }
```

## Conclusion

There are several open source projects which uses dynamic typing to great effect are Massive by Rob Connery, Dapper, Json.Net.

Other areas where dynamic types would be helpful is Working with Excel, calling into Python, and using normal Managed .NET types in a more flexible way.

## Reference

C# In Depth by Jon Skeet
