---
title: "How to apply SOLID Principles"
description: "In this blog post, we explored the power of SOLID principles in improving the design and maintainability of code. By refactoring a complex class in an…"
pubDate: 2023-06-19T02:49:32+00:00
slug: "how-to-apply-solid-principles"
heroImage: "./pexels-photo-194096.jpeg"
categories: [".Net","Agile","C#","Software Development"]
tags: ["C#","DIP","LSP","OCP","Software Development","SOLID","solid-principles","SRP"]
wordpressId: 3133
---

SOLID principles are a set of five design principles that help developers create more maintainable, scalable and robust software. These principles are essential for building high-quality software that can adapt to changing requirements and business needs. In this blog post, we will explore how to apply SOLID principles to an e-commerce application in C#.

Let’s consider an example of e-commerce application that allows users to purchase products online. The application has a Product class that contains the product details such as name, description, price and quantity. The application also has a ShoppingCart class that allows users to add products to their cart and checkout.

```csharp
public class Product
{
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

public class ShoppingCart
{
    private List<Product> _products = new List<Product>();

    public void AddProduct(Product product)
    {
        _products.Add(product);
    }

    public decimal CalculateTotal()
    {
        decimal total = 0;
        foreach (var product in _products)
        {
            total += product.Price * product.Quantity;
        }
        return total;
    }

    public void Checkout()
    {
        // Process payment and send confirmation email
    }
}
```

This implementation violates several SOLID principles. Let’s see how we can refactor this code to apply each principle.

## Single Responsibility Principle (SRP)

The SRP states that a class should have only one reason to change. In our example, the ShoppingCart class has multiple responsibilities such as adding products, calculating the total, and checking out. We can refactor this code by creating separate classes for each responsbility.

```csharp
public class Product
{
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

public class ShoppingCart
{
    private List<Product> _products = new List<Product>();

    public void AddProduct(Product product)
    {
        _products.Add(product);
    }

    public decimal CalculateTotal()
    {
        decimal total = 0;
        foreach (var product in _products)
        {
            total += product.Price * product.Quantity;
        }
        return total;
    }
}

public class PaymentProcessor
{
    public void ProcessPayment(decimal amount)
    {
        // Process payment
    }
}

public class EmailService
{
    public void SendConfirmationEmail(string email)
    {
        // Send confirmation email
    }
}
```

## Open/Closed Principle (OCP)

The OCP states that a class should be open for extension but closed for modification. In our example, the ShoppingCart class is not closed for modification because it directly calculates the total and checks out. We can refactor this code by creating an interface for the ShoppingCart class and implementing it in a separate class.

```csharp
public interface IShoppingCart
{
    void AddProduct(Product product);
    decimal CalculateTotal();
}

public class ShoppingCart : IShoppingCart
{
    private List<Product> _products = new List<Product>();

    public void AddProduct(Product product)
    {
        _products.Add(product);
    }

    public decimal CalculateTotal()
    {
        decimal total = 0;
        foreach (var product in _products)
        {
            total += product.Price * product.Quantity;
        }
        return total;
    }
}

public class CheckoutService
{
    private readonly IShoppingCart _shoppingCart;
    private readonly PaymentProcessor _paymentProcessor;
    private readonly EmailService _emailService;

    public CheckoutService(IShoppingCart shoppingCart, PaymentProcessor paymentProcessor, EmailService emailService)
    {
        _shoppingCart = shoppingCart;
        _paymentProcessor = paymentProcessor;
        _emailService = emailService;
    }

    public void Checkout()
    {
        decimal total = _shoppingCart.CalculateTotal();
        _paymentProcessor.ProcessPayment(total);
        _emailService.SendConfirmationEmail("user@example.com");
    }
}
```

## Liskov Substitution Principle (LSP)

The LSP states that a subclass should be substitutable for its base class. In our example, the Product class is not substitutable because it does not have a common interface with other classes. We can refactor this code by creating an interface for the Product class.

```csharp
public interface IProduct
{
    string Name { get; set; }
    string Description { get; set; }
    decimal Price { get; set; }
    int Quantity { get; set; }
}

public class Product : IProduct
{
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

public class ShoppingCart : IShoppingCart
{
    private List<IProduct> _products = new List<IProduct>();

    public void AddProduct(IProduct product)
    {
        _products.Add(product);
    }

    public decimal CalculateTotal()
    {
        decimal total = 0;
        foreach (var product in _products)
        {
            total += product.Price * product.Quantity;
        }
        return total;
    }
}
```

## Interface Segregation Principle (ISP)

The ISP states that a class should not be forced to implement interfaces it does not use. In our example, the PaymentProcessor class has a single method for processing payments, but it is forced to implement the IShoppingCart interface. We can refactor this code by creating a separate interface for the PaymentProcessor class.

```csharp
public interface IPaymentProcessor
{
    void ProcessPayment(decimal amount);
}

public class PaymentProcessor : IPaymentProcessor
{
    public void ProcessPayment(decimal amount)
    {
        // Process payment
    }
}

public class CheckoutService
{
    private readonly IShoppingCart _shoppingCart;
    private readonly IPaymentProcessor _paymentProcessor;
    private readonly EmailService _emailService;

    public CheckoutService(IShoppingCart shoppingCart, IPaymentProcessor paymentProcessor, EmailService emailService)
    {
        _shoppingCart = shoppingCart;
        _paymentProcessor = paymentProcessor;
        _emailService = emailService;
    }

    public void Checkout()
    {
        decimal total = _shoppingCart.CalculateTotal();
        _paymentProcessor.ProcessPayment(total);
        _emailService.SendConfirmationEmail("user@example.com");
    }
}
```

## Dependency Inversion Principle (DIP)

The DIP states that high-level modules should not depend on low-level modules, but both should depend on abstractions. In our example, the CheckoutService class depends on the ShoppingCart, PaymentProcessor, and EmailService classes, which are low-level modules. We can refactor this code by creating an interface for the CheckoutService class and injecting it into the high-level module.

```csharp
public interface ICheckoutService
{
    void Checkout();
}

public class CheckoutService : ICheckoutService
{
    private readonly IShoppingCart _shoppingCart;
    private readonly IPaymentProcessor _paymentProcessor;
    private readonly IEmailService _emailService;

    public CheckoutService(IShoppingCart shoppingCart, IPaymentProcessor paymentProcessor, IEmailService emailService)
    {
        _shoppingCart = shoppingCart;
        _paymentProcessor = paymentProcessor;
        _emailService = emailService;
    }

    public void Checkout()
    {
        decimal total = _shoppingCart.CalculateTotal();
        _paymentProcessor.ProcessPayment(total);
        _emailService.SendConfirmationEmail("user@example.com");
    }
}

public interface IEmailService
{
    void SendConfirmationEmail(string email);
}

public class EmailService : IEmailService
{
    public void SendConfirmationEmail(string email)
    {
        // Send confirmation email
    }
}
```

## Conclusion

In this blog post, we explored the application of SOLID principles to a complex class in an e-commerce application. By refactoring the initial code and adhering to the Single Responsibility Principle (SRP), Open/Closed Principle (OCP), Liskov Substitution Principle (LSP), Interface Segregation Principle (ISP), and Dependency Inversion Principle (DIP), we achieved a more modular, extensible, and maintainable codebase.

By separating responsibilities, depending on abstractions, and using interfaces, we improved the code’s design and flexibility. Adhering to SOLID principles helps us create software that is easier to understand, modify, and test, resulting in higher code quality and improved maintainability.

Remember, applying SOLID principles is an ongoing process that should be integrated into your development workflow. By embracing these principles, you can elevate the quality of your code and build robust software solutions that can adapt to changing requirements.
