---
title: "AutoMapper Went Commercial: Your Four Options and How to Migrate"
description: "AutoMapper moved to a commercial licence at $4,000/yr. Your four real options, with migration steps for Mapperly, Mapster and hand-written mapping."
pubDate: 2026-09-12T12:22:31+00:00
slug: "automapper-commercial-license-alternatives-migration"
heroImage: "./umamaheswaran-6aa543a69af71.png"
categories: [".Net","Software Development"]
tags: [".Net","AI","Artificial Intelligence","C#","ChatGPT","llm","Software Development","technology"]
wordpressId: 3384
---

_This post contains an affiliate link. I earn a commission if you buy through it, and it does not change the price you pay or what I recommend. See my full disclosure._

AutoMapper has been the default object mapper in .NET for over a decade. It has more than **1.1 billion NuGet downloads**, which makes it one of the most widely installed packages in the entire ecosystem. In 2025 it moved to a commercial licence.

If you are reading this, you are probably doing one of three things: working out whether your team owes money, working out what to replace it with, or trying to explain to a manager why a mapping library now has a line item. This post covers all three.

## What changed

AutoMapper’s creator, Jimmy Bogard, announced that AutoMapper — along with **MediatR** — would move to a commercial model under a new company, **Lucky Penny Software**. His open-source work had been sponsored by a former employer; when that support ended, sustained maintenance needed a funding model.

The announced pricing:

| Tier | Monthly | Annual |
| --- | --- | --- |
| Small and medium business | $400 | **$4,000** |
| Large enterprise | $1,200 | **$12,000** |

Two things to be clear about, because there is a lot of panic on this topic that is not warranted:

-   **Versions already published under MIT remain usable under MIT.** Licences are not retroactive. If your build is pinned to an MIT-licensed release, nothing has changed for you legally and nothing stops working. `[CONFIRM: name the exact last MIT version here after checking your lock file.]`
-   **This is not per-developer pricing.** Unlike the FluentAssertions change, which is $129.95 per seat, this is a flat organisational fee. For a 40-developer company that is arguably cheaper than the per-seat model. For a 4-person startup it is a lot of money for object mapping.

That second point drives the whole decision. **The bigger your team, the more reasonable $4,000 looks. The smaller your team, the more absurd it looks.** Size your response to your organisation, not to the internet’s outrage.

## The uncomfortable question first

Before you pick a replacement, ask whether you need a mapper at all.

AutoMapper’s most common use is turning an entity into a DTO with the same property names. That is this:

```
public static class UserMappings
{
    public static UserDto ToDto(this User user) => new()
    {
        Id        = user.Id,
        Email     = user.Email,
        FullName  = $"{user.FirstName} {user.LastName}",
        CreatedAt = user.CreatedAt,
    };
}
```

Eight lines, no dependency, no configuration, no licence, and it shows up in “find usages”. It is debuggable, it fails at compile time rather than at runtime, and a new team member understands it instantly.

The standard objection is that this does not scale to hundreds of types. That is true, and it is exactly what the source generators below are for. But be honest about which situation you are in: **plenty of codebases carry AutoMapper for a few dozen flat, same-name mappings**, and for those the correct migration is deleting the dependency, not replacing it.

## The four options

| Option | Migration effort | Cost | Runtime behaviour |
| --- | --- | --- | --- |
| **Stay on the MIT version** | None | Free | Unchanged, frozen |
| **Mapperly** | Mechanical, file-by-file | Free (Apache 2.0) | Compile-time generated |
| **Mapster** | Moderate | Free (MIT) | Runtime-compiled delegates |
| **Hand-written mapping** | Manual but simple | Free | Plain C# |
| **Buy the licence** | None | $4,000+/yr | Unchanged, supported |

### Option 1: Stay on the MIT version

The zero-effort answer, and legitimate for a codebase in maintenance mode.

```
<PackageReference Include="AutoMapper" Version="[x.y.z]" />
```

Use bracket syntax to pin exactly, so no routine dependency bump walks you across the licence boundary. If you use Central Package Management, pin it in `Directory.Packages.props`.

Leave a comment saying why, or a future teammate will helpfully upgrade it:

```
<!-- Pinned: AutoMapper versions after this one require a commercial
     licence ($4,000/yr SMB). Do not upgrade. See ADR-015.
     Migration target: Mapperly. -->
```

**What you give up:** new .NET target framework support, performance work, and bug fixes. For a stable service that is not much. For a codebase that will move to the next few .NET versions, you are deferring the decision, not making it.

### Option 2: Mapperly — the emerging default

[Mapperly](https://github.com/riok/mapperly) is a **source generator**. You declare a partial mapper class, and Mapperly writes the mapping code at compile time. There is no runtime reflection, no configuration scanning at startup, and no runtime cost at all — the generated code is what you would have written by hand.

It has around **31 million downloads**, it is Apache 2.0, it is actively developed, and it has been adopted as the default mapper by major frameworks. Of all the alternatives, it is the one that has clearly absorbed the AutoMapper refugees.

```
using Riok.Mapperly.Abstractions;

[Mapper]
public partial class UserMapper
{
    public partial UserDto ToDto(User user);
}
```

That is it. Mapperly generates the body. Register it as a singleton, or make the methods static and skip DI entirely.

**Why the compile-time model is the real win.** AutoMapper’s characteristic failure is a runtime one: you add a property to a DTO, nobody adds the mapping, and the field is silently `null` in production until a customer notices. Mapperly **will not compile** if a target property has no source. That single behavioural difference is worth more than the licence saving.

Custom logic uses ordinary C#:

```
[Mapper]
public partial class UserMapper
{
    [MapProperty(nameof(User.FirstName), nameof(UserDto.FullName))]
    public partial UserDto ToDto(User user);

    private string BuildFullName(User user) => $"{user.FirstName} {user.LastName}";
}
```

**Migrating from AutoMapper Profiles.** The work is mechanical, one Profile at a time:

1.  For each `Profile`, create a `[Mapper]` partial class.
2.  Turn each `CreateMap<TSource, TDest>()` into a `partial` method declaration.
3.  Translate `ForMember(...)` calls into `[MapProperty]` attributes or private helper methods.
4.  Compile. Mapperly’s diagnostics will tell you about every unmapped property — treat those warnings as the migration checklist.
5.  Replace `IMapper` injections with your new mapper type.

For a typical service with 30–80 maps across a handful of Profile classes, budget half a day to a day. The compiler drives the whole thing, which is what makes it safe.

**What to watch:** `ForMember` with complex inline lambdas does not always translate cleanly, and Mapperly is stricter than AutoMapper by design. Expect to write a few private helper methods. That strictness is the feature — it just means the migration surfaces mappings that were quietly wrong.

### Option 3: Mapster

[Mapster](https://github.com/MapsterMapper/Mapster) is MIT licensed with roughly **79 million downloads** — a larger install base than Mapperly. It compiles mapping delegates at runtime, and is substantially faster than AutoMapper for simple property-to-property work.

```
var dto = user.Adapt<UserDto>();
```

Configuration is fluent and will feel familiar coming from AutoMapper:

```
TypeAdapterConfig<User, UserDto>
    .NewConfig()
    .Map(dest => dest.FullName, src => $"{src.FirstName} {src.LastName}");
```

**Why it is not my first recommendation despite being more widely installed:** Mapster keeps AutoMapper’s fundamental weakness. Configuration is still resolved at runtime, so a missing mapping is still a runtime surprise rather than a build failure. Its development activity has also been less consistent than Mapperly’s — and having just been through one dependency going sideways, “how healthy is this project” deserves weight.

Mapster does offer a source-generator mode via `Mapster.Tool`, but with about 500,000 downloads against Mapperly’s 31 million, it is clearly the less-travelled path.

Choose Mapster if you want the smallest possible diff and the fluent style. Choose Mapperly if you want compile-time safety.

### Option 4: Buy the licence

Worth stating plainly, because the internet’s reflex is that paying is defeat. It is not.

$4,000 a year is roughly a day of senior developer time per month. If your team has 200 mappings across a large solution, a support relationship matters to your compliance people, and your engineers have higher-value work, **buying the licence is the rational choice**. Migration is not free — it costs days of engineering plus regression risk.

Buy it if: you have a large existing investment in AutoMapper, your organisation values a vendor to escalate to, and $4,000 is a rounding error against your engineering budget.

Do not buy it if: you have a few dozen flat mappings you could delete entirely, or you are a small team where $4,000 is real money.

## My recommendation

**For most teams: Mapperly.** It is free, actively developed, faster than what you have, and it converts your silent runtime mapping bugs into build errors. The migration is mechanical and compiler-guided.

**For small codebases with simple mappings: delete the dependency.** Write the extension methods. You will not miss it.

**For large enterprises: buy the licence,** or budget a proper migration project rather than trying to do it in the gaps.

**For anything in maintenance mode: pin and move on.** Just write down why.

> **Rebuilding your architecture rather than just swapping a package?** [Dometrain’s Clean Architecture in .NET](https://dometrain.com/course/getting-started-clean-architecture-in-dotnet/?ref=umamaheswaran-m-q28vq2) is the most thorough treatment of this I have found. _(Affiliate link.)_

## This keeps happening — so build a policy

AutoMapper is not an isolated case. Over the last two years: **FluentAssertions** moved to $129.95 per developer per year, **MediatR** went commercial alongside AutoMapper, **MassTransit** announced a commercial v9, and **ImageSharp** and **IdentityServer** did the same earlier. Between them these sit in a very large share of .NET solutions.

If your project came from a Clean Architecture template, you very likely have **both AutoMapper and MediatR** — roughly **$8,000 a year** at SMB pricing for two libraries that mostly move objects around.

The pattern is not going away, and it is not unreasonable: maintainers of critical infrastructure want to get paid for maintaining it. What has changed is your job. **Licence terms are now a dependency you track**, alongside versions and CVEs.

Three habits worth adopting:

1.  **Audit your licence exposure.** Know which of your top 20 dependencies is one release from a change.
2.  **Pin majors deliberately.** An unpinned major version is now a commercial risk as well as a stability one.
3.  **Record the decision.** One ADR per affected package, ten minutes each, saves a repeated argument.

I have written up the [FluentAssertions migration](/2025/01/16/exploring-alternatives-to-fluent-assertions-in-net-testing/) separately, and the MediatR one is next.

## Summary

-   AutoMapper moved to a commercial licence under Lucky Penny Software: **$4,000/yr SMB, $12,000/yr enterprise** — a flat organisational fee, not per seat.
-   **MIT-licensed versions stay MIT.** Pinning is legitimate and free.
-   **Mapperly** is the strongest replacement: Apache 2.0, source-generated, zero runtime cost, and it turns missing mappings into compile errors.
-   **Mapster** has a larger install base and an easier diff, but keeps the runtime-configuration weakness.
-   For simple flat mappings, **delete the mapper** and write extension methods.
-   Buying the licence is a legitimate choice for large teams, not a failure.

_Migrated a large solution off AutoMapper? I would like to hear how many mappings turned out to be silently wrong once the compiler could see them._
