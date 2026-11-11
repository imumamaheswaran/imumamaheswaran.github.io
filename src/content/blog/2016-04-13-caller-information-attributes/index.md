---
title: "Caller Information Attributes"
description: "Introduction .Net 4.5 introduced 3 new attributes: CallerFilePathAttribute, CallerLineNumberAttribute and CallerMemberAttribute which I think many of us…"
pubDate: 2016-04-13T16:27:46+00:00
updatedDate: 2016-06-13T13:26:35+00:00
slug: "caller-information-attributes"
categories: ["C#"]
tags: []
wordpressId: 70
---

# Introduction

.Net 4.5 introduced 3 new attributes: CallerFilePathAttribute, CallerLineNumberAttribute and CallerMemberAttribute which I think many of us might not even heard of. I came across this when I was reading Jon Skeet C# In Depth book.

# Feature

By using these caller info attributes we can obtain the information about the caller to a method. You can get below information through this feature

-   CallerFilePathAttribute – Full path of the source file that has the caller
-   CallerLineNumberAttribute – Line number in the source file
-   CallerMemberNameAttribute – Method or property name of the caller

All these attributes are available under System.Runtime.CompileServices. Just as with other C# attributes we can Omit the Attribute suffix from the name while using it

```csharp
	class Program
	{
		static void Main(string[] args)
		{
			ShowInfo();
			Console.Read();
		}

		public static void ShowInfo([CallerFilePath] string file = null, [CallerLineNumber] int line = 0, [CallerMemberName] string member = null)
		{
			Console.WriteLine($"{file}:{line} - {member}");
		}
	}
```

**Note: All these attributes must have a default value otherwise the compile will throw error.**

# Summary

This feature can come in very handy when we are doing logging in our application. Currently most of us will be using System.Diagnostics.StackTrace for building a stack trace to find out where the log information came from. But it is not advisable and may have performance implications.

Using this new feature logging can be done in a better way.
