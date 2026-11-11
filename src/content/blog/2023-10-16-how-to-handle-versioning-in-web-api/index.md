---
title: "How to Handle Versioning in Web API"
description: "Versioning is an indispensable facet of the software development process. As your Web API evolves and new features get added, old ones might become…"
pubDate: 2023-10-16T14:07:08+00:00
slug: "how-to-handle-versioning-in-web-api"
heroImage: "./large_2001_0569.jpg"
categories: [".Net","asp.net"]
tags: [".NET development","API evolution","ASP.NET Core","backward compatibility","Best Practices","Header versioning","MediaType versioning","Query String versioning","URI versioning","versioning","Web API"]
wordpressId: 3202
---

Versioning is an indispensable facet of the software development process. As your Web API evolves and new features get added, old ones might become deprecated or undergo substantial changes. Introducing these changes without a strategy can break existing clients and services that depend on your API. That’s where versioning comes into play.

In this article, we will explore different strategies to handle versioning in Web APIs, focusing primarily on ASP.NET Web API.

### Why Versioning?

1.  **Backward Compatibility**: Older clients can continue to use the version they are compatible with.
2.  **Smooth Transitions**: Clients get ample time to migrate from an older version to a newer one.
3.  **Clear Communication**: Indicates API maturity and provides clear information about changes and updates.

### Strategies for Versioning

#### 1\. URI Versioning

This is the most straightforward approach. The version information is directly embedded into the API’s URI.

_Example_:

-   `https://api.example.com/v1/products`
-   `https://api.example.com/v2/products`

**Pros**:

-   Easy to implement.
-   Explicit, making it clear for consumers.

**Cons**:

-   Not RESTful (theoretically, URIs should represent resources, not versions).
-   Might lead to redundant routes.

#### 2\. Query String Versioning

Here, the version information is passed as a query parameter in the URL.

_Example_:

-   `https://api.example.com/products?version=1`
-   `https://api.example.com/products?version=2`

**Pros**:

-   Easy to implement and read.
-   Allows the URI to remain consistent.

**Cons**:

-   Can become cluttered if there are many query parameters.

#### 3\. Header Versioning

With this method, the version information is transmitted in the HTTP header.

_Example_:  
Using a custom header:

-   `api-version: 1`
-   `api-version: 2`

Or using the Accept header:

-   `Accept: application/vnd.example.v1+json`
-   `Accept: application/vnd.example.v2+json`

**Pros**:

-   Clean URLs.
-   More RESTful compared to URI versioning.
-   Provides flexibility, especially using media type versioning.

**Cons**:

-   Not as explicit; clients need to know which header to set.

#### 4\. MediaType Versioning (Accept Header)

This involves sending the version information in the Accept header.

_Example_:

-   `Accept: application/vnd.myapi.v1+json`
-   `Accept: application/vnd.myapi.v2+json`

**Pros**:

-   Highly flexible.
-   Adheres to REST principles.

**Cons**:

-   More complicated than other methods.

### Which Strategy to Choose?

The strategy you select will depend on your project’s requirements and the preferences of your development team:

-   If you prefer clean and explicit URLs, go for **URI versioning**.
-   For a blend of clean URIs and the simplicity of not messing with headers, **query string versioning** is a good choice.
-   If you’d rather not alter the URL and are comfortable with headers, choose **header versioning**.
-   For a more RESTful approach, and if you’re dealing with various media types, **MediaType versioning** might be best.

### Implementing Versioning in ASP.NET Web API

Let’s break down the versioning approaches for ASP.NET Core Web API in a more detailed manner:

### 1\. **URI Versioning**

#### Step-by-Step Implementation:

1.  **Organize Controllers by Version**:

-   Create separate folders or namespaces for each version, for clarity.
-   For our example, we’ll create `V1` and `V2` folders.

1.  **Define Controllers**:

**V1**:

```csharp
[ApiController]
[Route("api/v1/products")]
public class ProductsV1Controller : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("Version 1 products.");
    }
}
```

**V2**:

```csharp
[ApiController]
[Route("api/v2/products")]
public class ProductsV2Controller : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("Version 2 products with additional features.");
    }
}
```

3.  **Testing**: Navigate to `/api/v1/products` and `/api/v2/products` to see the respective version outputs.

### 2\. **Query String Versioning**

#### Step-by-Step Implementation:

1.  **Install Necessary Package**:

```bash
Install-Package Microsoft.AspNetCore.Mvc.Versioning
```

2.  **Configure Versioning**:

In `Startup.cs` within `ConfigureServices`:

```csharp
services.AddApiVersioning(o => 
{
    o.DefaultApiVersion = new ApiVersion(1, 0);
    o.ReportApiVersions = true;
    o.ApiVersionReader = new QueryStringApiVersionReader("version");
});
```

3.  **Define Controllers**:

Use the `[ApiVersion]` attribute to define which versions each controller supports.

**V1**:

```csharp
[ApiController]
[Route("api/products")]
[ApiVersion("1.0")]
public class ProductsV1Controller : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("Version 1 products.");
    }
}
```

**V2**:

```csharp
[ApiController]
[Route("api/products")]
[ApiVersion("2.0")]
public class ProductsV2Controller : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("Version 2 products with additional features.");
    }
}
```

4.  **Testing**: Access versions via `/api/products?version=1.0` and `/api/products?version=2.0`.

### 3\. **Header Versioning**

#### Step-by-Step Implementation:

1.  **Configure Versioning**:

In `Startup.cs`:

```csharp
services.AddApiVersioning(o => 
{
    o.ApiVersionReader = new HeaderApiVersionReader("api-version");
});
```

2.  **Define Controllers**:

Similar to the Query String method. Just set up your controllers with the `[ApiVersion]` attribute.

3.  **Testing**:

Use a tool like Postman or use `curl` to send requests. Set a header with the key `api-version` and values `1.0` or `2.0`.

### 4\. **MediaType Versioning (Accept Header)**

#### Step-by-Step Implementation:

1.  **Configure Versioning**:

In `Startup.cs`:

```csharp
services.AddApiVersioning(o => 
{
    o.ApiVersionReader = new MediaTypeApiVersionReader();
});
```

2.  **Define Controllers**:

Just as with the previous methods, use the `[ApiVersion]` attribute to define versions.

3.  **Testing**:

Send a request setting the Accept header to `application/vnd.yourcompany.v1+json` for version 1, and `application/vnd.yourcompany.v2+json` for version 2.

In all these methods, you can further enhance versioning by using the `ApiVersionNeutral` attribute for actions or controllers that don’t need versioning, or by combining multiple versioning methods using the `ApiVersionReader.Combine()` method.

Remember to always update documentation for your API consumers whenever a new version is released.
