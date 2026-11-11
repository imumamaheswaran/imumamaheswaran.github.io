---
title: ".NET multi platform app ui(MAUI)"
description: "In the blog post I explain about .NET MAUI a new multi platform app UI to support different workloads like mobile, desktops using .NET"
pubDate: 2020-07-03T17:49:27+00:00
slug: "net-multi-platform-app-ui-maui"
heroImage: "./maxresdefault.jpg"
categories: ["Software Development"]
tags: []
wordpressId: 2268
---

MAUI is the .NET Multi-platform App UI, a framework for building native device applications spanning mobile, tablet, and desktop. Announced at the Microsoft BUILD conference on May 19, .NET MAUI is basically evolution of the Xamarin.Forms tool kit. I hope you are aware how the next versions of .NET are focused on unifying elements that go into .NET to make one .NET. And that includes the UI stacks – including Xamarin! The evolution of Xamarin into .NET means that all UI stacks will be treated equally. And that leads to the .NET Multi-Platform App UI, letting you make a single project that covers Windows, OS/X, IOS and Android.

Read my previous [blog post](/2017/09/27/what-is-this-new-net-standard-thingy/) on why Microsoft want to pursue one .NET

## Features of .NET MAUI

-   Project structure is simplified into a single project for multiple platforms, with single-click deployment to desktop systems, emulators, simulators or physical devices.
-   Images fonts and translation files can be added to a single project, with native hooks set up automatically. Resources such as fonts images are housed in one location.
-   Access is provided to native, underlying operating systems APIs
-   It supports modern app patterns and supports both the existing MVVM and XAML patterns as well as future capabilities like Model-View-Update (MVC) with C# or even Blazor

### MVVM

This is the existing pattern that Xamarin.Forms and UWP apps are currently using

```xml
<StackLayout>
    <Label Text="Welcome to .NET MAUI!" />
    <Button Text="{Binding Text}" 
            Command="{Binding ClickCommand}" />
</StackLayout>
```

```csharp
public Command ClickCommand { get; }
public string Text { get; set; } = "Click me";
int count = 0;
void ExecuteClickCommand ()
{
    count++;
    Text = $"You clicked {count} times.";
}
```

### MVU

MAUI will enable developers to write fluent C# UI ad implement the increasingly popular Model-View-Update (MVU) pattern. MVU promotes one way flow of data and state management as well as code first development experience that rapidly updates the UI by applying only the necessary changes.

```csharp
readonly State<int> count = 0;

[Body]
View body() => new StackLayout
{
    new Label("Welcome to .NET MAUI!"),
    new Button(
        () => $"You clicked {count} times.",
        () => count.Value ++)
    )
};
```

## What about Xamarin.Forms?

Xamarin will be there. MAUI is a new Framework. You should not worry about applications you have in Xamarin, as of the information presented at Microsoft Build. In my opinion, the learning curve will be quite simple, and in addition they spoke about some tools to streamline the migration process.

## What is the time line?

.NET MAUI will ship in the same six-week cadence as Xamarin.Forms. Xamarin.iOS and Xamarin.Android are set to become part of .NET 6 as .NET for iOS and .NET for Android.

A new, major version of Xamarin.Forms is due later this year, with minor and services releases to follow every six weeks until .NET 6 is generally available in November 2021.

Thanks for reading!!
