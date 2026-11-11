---
title: "MediatR Went Commercial: Replace It, Pay for It, or Write It Yourself in 50 Lines"
description: "MediatR is now $4,000/yr. Pin the MIT version, switch to source-generated Mediator, or write the whole thing yourself in fifty lines — with the code."
pubDate: 2026-09-09T06:25:51+00:00
updatedDate: 2026-09-12T12:20:01+00:00
slug: "mediatr-commercial-license-alternatives-migration"
heroImage: "./6128808470_2345e9f038_b.jpg"
categories: ["Software Development"]
tags: [".Net","AI","Artificial Intelligence","llm","technology"]
wordpressId: 3386
---

_This post contains an affiliate link. I earn a commission if you buy through it, and it does not change the price you pay or what I recommend. See my full disclosure._

If you read [my post on AutoMapper going commercial](/automapper-commercial-license-alternatives-migration/), this is the other half of the same announcement — and if your solution came from a Clean Architecture template, you are almost certainly paying both bills.

MediatR has around **484 million NuGet downloads**. It moved to a commercial licence at the same time as AutoMapper, under the same company. Here is what your options actually are, including the one most people underrate: writing the thing yourself, which is genuinely about fifty lines of code.

## What changed

Jimmy Bogard moved both **MediatR** and **AutoMapper** to commercial licensing under **Lucky Penny Software**. The announced pricing is a flat organisational fee covering the products:

| Tier | Monthly | Annual |
| --- | --- | --- |
| Small and medium business | $400 | **$4,000** |
| Large enterprise | $1,200 | **$12,000** |

As with AutoMapper: **versions published under MIT remain usable under MIT**, permanently. Licences are not retroactive, and nothing in your current build breaks.

**The combined bill is the part worth flagging.** If you have both AutoMapper and MediatR — the standard pairing in a Clean Architecture solution — you are looking at roughly **$8,000 a year at SMB pricing**. That is the number that turns this from a technical curiosity into a conversation with whoever owns your budget.

## First, be honest about what MediatR does for you

This matters more for MediatR than for AutoMapper, because a large share of MediatR usage is architecturally pointless.

MediatR is an in-process message dispatcher. You send a request, it finds the handler, it invokes it. The genuine benefits are:

1.  **Pipeline behaviours** — cross-cutting validation, logging, transactions, caching, wrapped around every handler in one place. This is the real value, and it is substantial.
2.  **Decoupling the caller from the handler** — a controller does not reference the handler type.
3.  **Notifications** — one event, several handlers.

If you use pipeline behaviours heavily, MediatR earns its place and you need a real replacement.

But there is a very common pattern where a controller does this:

```
public async Task<IActionResult> Get(Guid id)
    => Ok(await _mediator.Send(new GetUserQuery(id)));
```

…and `GetUserQueryHandler` is the only handler, has no behaviours around it, and exists purely so the controller can avoid injecting `IUserService`. That is not decoupling. It is indirection with extra files, and it makes “go to definition” stop working.

**If that is your codebase, the correct migration is deleting MediatR and injecting the service directly.** Do that assessment before you evaluate replacements — it is free and it might be the whole answer.

## The options

| Option | Effort | Cost | Keeps pipeline behaviours |
| --- | --- | --- | --- |
| **Stay on the MIT version** | None | Free | Yes |
| **Mediator (source-generated)** | Low — similar API | Free | Yes |
| **Write your own** | ~50 lines | Free | Yes, if you build it |
| **Wolverine** | High — different model | Free (check terms) | Different approach |
| **Delete it** | Varies | Free | N/A |
| **Buy the licence** | None | $4,000+/yr | Yes |

### Option 1: Pin to the MIT version

```
<PackageReference Include="MediatR" Version="[x.y.z]" />
```

Legitimate, free, and instant. MediatR is a small, stable library — the risk of freezing it is lower than for something like a serialiser or an HTTP client. You lose new .NET target support eventually, and that is about it.

Pin exactly, and comment why.

### Option 2: Mediator — the source-generated near-drop-in

[Mediator](https://github.com/martinothamar/Mediator) by Martin Othamar is the closest thing to a straight swap. It implements the same pattern using a **source generator** instead of runtime reflection, and its API deliberately mirrors MediatR’s. The `Mediator.Abstractions` package has around **11 million downloads**, so this is a well-travelled path rather than an experiment.

```
// Registration
services.AddMediator(options =>
{
    options.ServiceLifetime = ServiceLifetime.Scoped;
});
```

Your handlers look almost identical:

```
public sealed record GetUserQuery(Guid Id) : IRequest<UserDto>;

public sealed class GetUserQueryHandler : IRequestHandler<GetUserQuery, UserDto>
{
    public ValueTask<UserDto> Handle(GetUserQuery query, CancellationToken ct)
        => ValueTask.FromResult(/* ... */);
}
```

**The differences to plan for:**

-   **`ValueTask` instead of `Task`** in handler signatures. This is the bulk of the mechanical work, and the compiler finds every one.
-   **Handler discovery is compile-time.** A request with no handler is a build error, not a runtime exception. Strictly better.
-   **Pipeline behaviours exist** but registration differs — check the docs against your existing behaviours.
-   Performance is significantly better, since dispatch is generated rather than reflected. For most applications this is irrelevant, but it is free.

For a typical solution, migration is: swap the package, change `Task` to `ValueTask` in handler signatures, adjust registration, port behaviours. A day’s work on a large codebase, and the compiler leads.

### Option 3: Write it yourself

This is the option people dismiss and should not. If you use MediatR for request/response dispatch with a couple of behaviours, **the whole thing is about fifty lines** and you will never think about its licence again.

```
public interface IRequest<TResponse> { }

public interface IRequestHandler<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    Task<TResponse> Handle(TRequest request, CancellationToken ct);
}

public interface IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    Task<TResponse> Handle(
        TRequest request,
        Func<Task<TResponse>> next,
        CancellationToken ct);
}

public interface ISender
{
    Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken ct = default);
}

public sealed class Sender(IServiceProvider services) : ISender
{
    public Task<TResponse> Send<TResponse>(
        IRequest<TResponse> request,
        CancellationToken ct = default)
    {
        var requestType = request.GetType();

        var handlerType = typeof(IRequestHandler<,>)
            .MakeGenericType(requestType, typeof(TResponse));

        var handler = services.GetRequiredService(handlerType);

        var behaviorType = typeof(IPipelineBehavior<,>)
            .MakeGenericType(requestType, typeof(TResponse));

        var behaviors = services
            .GetServices(behaviorType)
            .Cast<object>()
            .Reverse()
            .ToArray();

        Func<Task<TResponse>> pipeline = () => (Task<TResponse>)handlerType
            .GetMethod(nameof(IRequestHandler<IRequest<TResponse>, TResponse>.Handle))!
            .Invoke(handler, [request, ct])!;

        foreach (var behavior in behaviors)
        {
            var next = pipeline;
            var method = behaviorType.GetMethod("Handle")!;
            pipeline = () => (Task<TResponse>)method
                .Invoke(behavior, [request, next, ct])!;
        }

        return pipeline();
    }
}
```

Register it:

```
services.AddScoped<ISender, Sender>();
services.Scan(scan => scan          // Scrutor, or register by hand
    .FromAssemblyOf<GetUserQuery>()
    .AddClasses(c => c.AssignableTo(typeof(IRequestHandler<,>)))
    .AsImplementedInterfaces()
    .WithScopedLifetime());
```

**Your existing handlers work unchanged** — the interfaces are the same shape as MediatR’s, so this is often a namespace change and nothing more.

**The honest trade-offs.** This version uses reflection for dispatch, so it is slower than MediatR’s cached approach and much slower than a source generator — fine for the vast majority of web applications, where a database round trip dwarfs it, but measure before using it on a hot path. You also own it now: no notifications, no streaming, no community, and if it breaks it is yours to fix. That is a real cost, and it is roughly one afternoon of understanding versus $4,000 a year forever.

Cache the reflection in a `ConcurrentDictionary` keyed on request type if you care about the overhead. That is another ten lines.

### Option 4: Wolverine

[WolverineFx](https://github.com/JasperFx/wolverine) (~8 million downloads) is a more ambitious option: a full command bus and message handling framework with built-in persistence, durable outbox, and messaging transports. It does not want to be a MediatR shim — it wants to own your messaging architecture.

Consider it if you were already thinking about durable messaging or an outbox pattern, and this licence change is the trigger to do it properly. Do **not** pick it as a drop-in replacement; it is a bigger commitment than the problem in front of you. Check its current licensing terms yourself before adopting — that is now table stakes for any dependency.

### Option 5: Buy the licence

Same logic as AutoMapper. If you have hundreds of handlers, heavy use of pipeline behaviours, notifications and streaming, and your organisation wants a vendor relationship, then $4,000 a year against the cost of a migration project is straightforward arithmetic. Paying is not a failure.

Note that the licence covers the Lucky Penny products together, so if you are paying for AutoMapper anyway, the marginal cost of keeping MediatR may be zero. **Check what your licence actually covers before migrating one and paying for the other** — that would be the worst of both outcomes.

## My recommendation

Work down this list and stop at the first one that fits:

1.  **Are you using pipeline behaviours?** If no — delete MediatR and inject your services directly. This is more codebases than people admit.
2.  **Do you want the smallest safe change?** → **Mediator** (source-generated). Familiar API, compile-time safety, better performance, free.
3.  **Is your usage simple and do you like owning your infrastructure?** → **Write the fifty lines.** Your handlers will not change.
4.  **Large solution, heavy MediatR investment, budget available?** → **Buy the licence**, especially if you are already licensing AutoMapper.
5.  **Already planning a move to durable messaging?** → look at **Wolverine**, as a deliberate architectural decision rather than a package swap.

What I would not do is leave an unpinned MediatR reference in a commercial codebase and hope.

> **Rebuilding how your application is structured rather than swapping a package?** [Dometrain’s Clean Architecture Deep Dive](https://dometrain.com/course/deep-dive-clean-architecture-in-dotnet/?ref=umamaheswaran-m-q28vq2) goes deeper on this than anything else I know of. _(Affiliate link.)_

## The pattern behind all of this

This is the fourth major .NET package to commercialise in about two years — after [FluentAssertions](/2025/01/16/exploring-alternatives-to-fluent-assertions-in-net-testing/), [AutoMapper](/automapper-commercial-license-alternatives-migration/), and alongside MassTransit’s commercial v9, with ImageSharp and IdentityServer before them.

The lesson is not to avoid open source. It is that **licence terms belong in your dependency review**, next to version and CVE checks. Audit your top dependencies for licence risk, pin majors deliberately, and write down each decision in an ADR.

There is also a design lesson worth taking. The libraries that hurt most to replace are the ones whose abstractions leaked furthest into your code. MediatR is easy to leave if you used it for dispatch and painful if `IMediator` is referenced in four hundred files. **The cheapest insurance against the next licence change is keeping third-party types at the edges of your architecture** — which is what you should have been doing anyway.

## Summary

-   MediatR is commercial under Lucky Penny Software: **$4,000/yr SMB, $12,000/yr enterprise**, flat organisational pricing, shared with AutoMapper.
-   **MIT versions remain MIT.** Pinning is free and legitimate.
-   **A large share of MediatR usage adds no value** — check whether you can simply delete it.
-   **Mediator** (source-generated, ~11M downloads) is the closest drop-in; main change is `Task` → `ValueTask`.
-   **Writing your own is ~50 lines** and your existing handlers keep working.
-   **Wolverine** is a bigger architectural move, not a shim.
-   If you already license AutoMapper, **check whether MediatR is included** before migrating it.

_If you deleted MediatR rather than replacing it, I would like to know how many handlers turned out to be one-line pass-throughs._
