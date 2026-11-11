---
title: "Common mistakes that C# noobs do"
description: "Lets face it! all of us when we initially started programming have done some silly mistakes without understanding the language or a language feature…"
pubDate: 2017-08-07T13:40:48+00:00
updatedDate: 2020-06-14T09:49:54+00:00
slug: "common-problems-that-c-noobs-do"
heroImage: "./csharp-noobs-feature-image.jpg"
categories: ["C#"]
tags: [".Net","C#","Umamaheswaran"]
wordpressId: 1556
---

Lets face it! all of us when we  initially started programming have done some silly mistakes without understanding the language or a language feature properly. Most of  us C# developers learn these mistakes the hard way. And it’s part of the journey of any beginner level developer in their career. But at the same time it doesn’t mean every one have to learn the hard way. As the saying goes “**Standing on the shoulders of giants**” we see more farther than our predecessors, not because we have a better understanding, but because we are lifted up and borne aloft on their experience.

As developers, along with developing software we should also develop our skills to better ourselves and to avoid mistakes that we did in the past. So here I have compiled some of the common mistakes that beginner level C# developers do to help you avoid them in future. Please fee free to comment below some of your experience on the topic

## Use interfaces properly

I have seen several beginners who are not just new to C# developers but to programming itself do this, where they will declare an interface and will derive the interface in a class but they wont use the interface during instantiation. Don’t understand? let me explain with code!

Lets see a typical interface declaration

```csharp
public interface IMonitor
{
void Configure();
void Start();
void Stop();
}

public class ActivityMonitor:IMonitor
{
public void Configure()
{
//some code
}
public void Start()
{
//some code
}
public void Stop()
{
//some code
}
}
```

Now comes the important part of instantiating an object

```csharp
var wrongUse = new ActivityMonitor();
IMonitor correctUse = new ActivityMonitor();
```

In the above sample both statements are valid but there is one key difference. The first statement instantiates an **ActivityMonitor** Object directly which would work but if you try to assign a different implementation of **IMonitor** to the object it will fail in the compilation step.

```csharp
var wrongUse = new ActivityMonitor();
wrongUse= new OtherMonitor(); // error
IMonitor correctUse = new ActivityMonitor();
correctUse = new OtherMonitor(); // works
```

This is because if you want the polymorphism to occur you have to use interface type when you declare an instance.

## Know your defaults

In C# value types are not null be it an **int** or **DateTime** or any other types which inherits struct. On other hand a reference can always be null.

Value types can be made null only if you declared  it as an nullable(?) type explicitly. For example

```csharp
static List<int> alist;
static DateTime startTime;
private static void Main(string[] args)
{
Console.WriteLine(alist == null); //Prints true
Console.WriteLine(startTime == null);//Prints false
}
```

if you want to know the default of some type please use default() keyword.

## Reference types vs Value Types

If you don’t know the type that you are using is a value type or reference type you will run to issues constantly. Because when you assign one value to other it makes a copies the value. But reference types copies the reference alone any changes made to the newer value will change both the variables

```csharp
Point point1 = new Point(10, 20);
Point point2 = point1;
point2.X = 50;
Console.WriteLine(point1.X); // 10 (does this surprise you?)
Console.WriteLine(point2.X); // 50

Pen pen1 = new Pen(Color.Black);
Pen pen2 = pen1;
pen2.Color = Color.Blue;
Console.WriteLine(pen1.Color); // Blue (or does this surprise you?)
Console.WriteLine(pen2.Color); // Blue
```

The answer is always look at the type of the variable if it is a **struct** then its a value type, if its a **class** then its a reference type.

## Start Loving LINQ

C#3.0 was introduced on almost a decade ago on 2007. One of the most important feature on that release is LINQ(Language integrated query). It has fundamentally changed how we manipulate collections on C# with its SQL like syntax. But for some reasons lot of beginners find it difficult to get a grasp of LINQ because of its strange syntax.

Lot of programmers also think that its only use is in code that queries database. Even though database querying is one of primary uses of LINQ, it can work with any collection which implements **IEnumerable.** So far example, if you had an array of **Activities**, instead of writing

```csharp
var sum = 0;
foreach (var activity in activities)
{
if (activity.IsRun)
sum += activity.Count;
}
```

you could just write

```csharp
var sum = (from account in activities
where account.IsRun
select account.Count).Sum();
```

I know this is a simple example but with the power of LINQ you can easily replace dozens of statements with a single LINQ statement in an iterative loop in your code. There are also few things that you need to be aware of there could be trade off in certain scenarios when it comes to performance. I would suggest use LINQ when you can predict amount of data that you will iterate through. And always do a performance comparison with normal for loop and LINQ.

## Stop nesting exceptions

I’m guilty of doing this in the initial part of my career in the name of exception of handling. beginners tend to add try catch to every single method that they right and most of these exception block will have throw at the catch block. In some cases they may add a log there too. but if all you are going to do is throw back to the caller why catch it in the first place?

```csharp
public class DeliveryComponent
{
public void Order()
{
try
{
Pay();
}
catch (Exception ex)
{

}
}
private void Pay()
{
try
{
DoTransaction();
}
catch (Exception ex)
{
throw;
}
}
private void DoTransaction()
{
try
{
//some code
}
catch (Exception ex)
{
throw;
}
}
}
```

More than that this will add a performance overhead to the program. Most of the time it is enough to put the try-catch in the upper level of the function like below.

You will want to handle exception in the lower only if you want to explicitly handle the exception and do some operations like retrying, logging etc.

```csharp
public class DeliveryComponent
{
public void Order()
{
try
{
Pay();
}
catch (Exception)
{
// ignored
}
}
private void Pay()
{
DoTransaction();
}
private void DoTransaction()
{
//some code
}
}
```

## Use using statement whenever possible

Memory management is a huge problem in programming When you are using resources like Sql connection, File streams, Network socket etc. C# provides a convenient way to call the Dispose method whenever you are finished with an object and avoid memory leaks.

In efficient way

```csharp
var con = new SqlConnection("");
con.Open();
//some operation
con.Close();
```

Efficient way

```csharp
using (var con = new SqlConnection(""))
{
con.Open();
}
```

Use constraints on your generics

Generics are one of the coolest features of C#. Some beginner level devs may use generics but have no idea about how to put constraints on the generics so that your generic type will not be misused.

For example consider the below example

```csharp
public interface IActivityRepository<T>
{
bool Insert(T activity);
bool Update(T activity);
T Get(int id);
bool Delete(int id);
}
```

From the code you can see IActivityRepository accepts any type and tries to insert them in database. But its obvious that IActivityRepository expects a reference type. but some developer may try to do the following

```csharp
public class ValueActivityRepository : IActivityRepository<int>
{
public bool Insert(int activity)
{
//some code
}

public bool Update(int activity)
{
//some code
}

public int Get(int id)
{
//some code
}

public bool Delete(int id)
{
//some code
}
}
```

As you can see this is not the intended purpose of that interface. So you can add constraints to make sure the right kind of type is substituted as T.

```csharp
public interface IActivityRepository<T>
where T : class, IActivity, new()
{
bool Insert(T activity);
bool Update(T activity);
T Get(int id);
bool Delete(int id);
}
```

The above code makes sure that the generic type T must be a implementation of IActivity

## Exceptions: Let’s not push it under the rug. Be Explicit

C# is a statically typed language. This allows C# to pin point errors during the compilation step itself where a faulty type conversion will be detected much quickly. when you are doing explicit type conversion in C# you have two ways to follow. One will throw an exception on error and one will not.

Lets see them

```csharp
object account = new CurrentAccount();
//METHOD 1
SavingsAccount account2 =(SavingsAccount)account;

//METHOD 2
SavingsAccount account3 = account as SavingsAccount;
```

In the above example the first method will throw an exception immediately. But the second will just assign account3 with null and which can possibly be consumed by some other method and will throw a NullReferenceException which possible surface at much later time which makes is difficult to track down.

## Conclusion

C# is a very powerful and flexible language which supports multiple paradigm of programming. With any tool or language which is as powerful as C# there is always going to be caveats. The best thing that we can do is to learn from your mistakes and avoiding these common problems will make you a better programmer.

Please comment below if you want to add any other common mistakes that C# devs do and also check out my other articles on [C#](/category/c/)
