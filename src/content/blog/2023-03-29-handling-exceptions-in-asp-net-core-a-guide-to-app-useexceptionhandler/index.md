---
title: "Handling Exceptions in ASP.NET Core: A Guide to app.UseExceptionHandler"
description: "Exception handling is an essential part of building robust and reliable applications. ASP.NET Core provides developers with various approaches to handle…"
pubDate: 2023-03-29T15:26:52+00:00
updatedDate: 2023-04-03T10:07:24+00:00
slug: "handling-exceptions-in-asp-net-core-a-guide-to-app-useexceptionhandler"
heroImage: "./pexels-photo-1888015.jpeg"
categories: [".Net","C#"]
tags: ["C#","dotnet-core","exception","exception-handling"]
wordpressId: 2902
---

In .NET Core, `app.UseExceptionHandler` is a middleware method that is used to handle exceptions that are thrown during the processing of an HTTP request in an ASP.NET Core application.

When an exception is thrown during the processing of a request, the middleware pipeline can be configured to catch and handle the exception by using `app.UseExceptionHandler`. This middleware will catch any unhandled exceptions that occur during the processing of the request and generate an error response to the client.

`app.UseExceptionHandler` should be placed early in the middleware pipeline, so that it can catch exceptions that occur in subsequent middleware components. When an exception is caught by this middleware, it can log the exception details, generate a custom error response, or perform other actions as required.

Here’s an example of how `app.UseExceptionHandler` can be used to handle exceptions in an ASP.NET Core application:

```csharp
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    // Enable exception handling middleware
    app.UseExceptionHandler("/Error");

    // Add other middleware components here

    // Use the default routing middleware
    app.UseRouting();

    // Use the endpoint routing middleware
    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    });
}
```

In this example, `app.UseExceptionHandler` is used to enable exception handling middleware, and any unhandled exceptions will be handled by the `/Error` endpoint. After that, other middleware components are added to the pipeline, and then the routing and endpoint routing middleware are added.

## Advantage over Global Exception Handler and Exception Attribute

There are a few advantages of using `app.UseExceptionHandler` middleware to handle exceptions in an ASP.NET Core application, as compared to using a global exception handler or an exception attribute.

1.  Centralized error handling: `app.UseExceptionHandler` allows you to handle exceptions in a centralized location, instead of scattering error handling logic throughout your application. This can make it easier to maintain and update your error handling logic.
2.  Ability to handle exceptions from all middleware components: Unlike a global exception handler or an exception attribute, `app.UseExceptionHandler` can handle exceptions that occur in any middleware component in the pipeline, including third-party middleware components.
3.  Customizable error response: `app.UseExceptionHandler` allows you to customize the error response that is returned to the client, such as by returning a JSON response with specific error details. This can make it easier for clients to understand and handle errors that occur.
4.  Separation of concerns: By using `app.UseExceptionHandler`, you can separate error handling concerns from other application logic. This can make your code more maintainable and easier to understand.

That being said, global exception handling and exception attributes also have their own advantages, such as being able to handle exceptions in specific parts of the application or providing more fine-grained control over error handling. The approach you choose will depend on the specific needs of your application.

## ExceptionHandler in action

Here’s an example of how to use `app.UseExceptionHandler` with a custom `ErrorController` to handle exceptions in an ASP.NET Core application:

1.  First, create a new controller named `ErrorController`:

```csharp
public class ErrorController : ControllerBase
{
    [Route("/error")]
    public IActionResult Error()
    {
        var context = HttpContext.Features.Get<IExceptionHandlerFeature>();

        var exception = context.Error;

        // Log the exception here if needed

        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "An unexpected error occurred",
            Detail = exception.Message
        };

        return StatusCode(StatusCodes.Status500InternalServerError, problemDetails);
    }
}
```

This controller defines an action method named `Error`, which is responsible for handling exceptions. It uses the `IExceptionHandlerFeature` feature to retrieve the exception that occurred, logs the exception (if needed), and creates a `ProblemDetails` object with the error details. Finally, it returns a 500 Internal Server Error response with the `ProblemDetails` object.

2.  Next, add the `app.UseExceptionHandler` middleware to the `Configure` method in your `Startup` class:

```csharp
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    // Add exception handling middleware
    app.UseExceptionHandler("/error");

    // Add other middleware components here

    // Use the default routing middleware
    app.UseRouting();

    // Use the endpoint routing middleware
    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    });
}
```

This code adds the `app.UseExceptionHandler` middleware to the pipeline, with the `/error` endpoint as the error handling path. When an exception occurs, the middleware will catch it and redirect the request to the `Error` action method in the `ErrorController`.

3.  Finally, you can throw an exception in one of your controller actions to test the error handling:

```csharp
[HttpGet]
public IActionResult TestException()
{
    throw new Exception("This is a test exception");
}
```

When this action method is called, it will throw an exception, which will be caught by the `app.UseExceptionHandler` middleware. The middleware will then redirect the request to the `Error` action method in the `ErrorController`, which will return a 500 Internal Server Error response with the error details.

## How to handle different exception types

To make the `ErrorController` handle different types of errors, you can modify the `Error` action method to inspect the type of exception that occurred and return an appropriate error response.

Here’s an updated example of the `ErrorController` that handles different types of exceptions:

```csharp
public class ErrorController : ControllerBase
{
    [Route("/error")]
    public IActionResult Error()
    {
        var context = HttpContext.Features.Get<IExceptionHandlerFeature>();

        var exception = context.Error;

        // Log the exception here if needed

        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "An unexpected error occurred",
            Detail = exception.Message
        };

        if (exception is UnauthorizedAccessException)
        {
            problemDetails.Status = StatusCodes.Status401Unauthorized;
            problemDetails.Title = "Unauthorized access";
        }
        else if (exception is NotFoundException)
        {
            problemDetails.Status = StatusCodes.Status404NotFound;
            problemDetails.Title = "Resource not found";
        }
        // Add additional cases for other exception types as needed

        return StatusCode(problemDetails.Status.Value, problemDetails);
    }
}
```

In this example, the `Error` action method inspects the type of exception that occurred and sets the `Status`, `Title`, and `Detail` properties of the `ProblemDetails` object accordingly. For example, if an `UnauthorizedAccessException` occurs, the action method sets the `Status` to 401 Unauthorized and the `Title` to “Unauthorized access”. Similarly, if a `NotFoundException` occurs, the action method sets the `Status` to 404 Not Found and the `Title` to “Resource not found”. Additional cases can be added for other exception types as needed.

## Conclusion

Handling exceptions is a crucial aspect of building reliable and resilient applications. ASP.NET Core provides several ways to handle exceptions, including the `app.UseExceptionHandler` middleware, global exception handling, and exception filters. By using these approaches, you can centralize error handling, customize error responses, and improve application reliability. Additionally, creating a custom `ErrorController` enables you to handle different types of exceptions in a centralized location and return appropriate error responses based on the type of exception that occurred.
