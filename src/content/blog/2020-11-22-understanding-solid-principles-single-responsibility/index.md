---
title: "Understanding SOLID Principles:  Single Responsibility"
description: "If your code is not adaptive enough, You process cannot be agile enough.. To make your code more adaptive learn SOLID Principles"
pubDate: 2020-11-22T18:39:38+00:00
updatedDate: 2021-03-07T07:40:13+00:00
slug: "understanding-solid-principles-single-responsibility"
heroImage: "./img_20170729_140425.jpg"
categories: ["Agile","C#","Software Development"]
tags: ["adaptive code","Agile","C#","Single Responsibility Principle","Software Development","SOLID","SRP"]
wordpressId: 2377
---

Agile methodology is not just an alternative to more rigid process like waterfall, but a reaction to them. The aim of agile is to embrace change as the necessary part of the contract between client and developer.

> If your code is not adaptive enough, Your process cannot be agile enough
> 
> UMAMAHESWARAN

When the sole purpose of agile being adaptability, As developers should strive to ensure that their code is maintainable, readable, tested and more importantly adaptive to change. SOLID is the acronym for a set of practices that, when implemented together makes the code adaptive to change.

-   **S** The Single Responsibility Principle
-   **O** [The Open/Closed Principle](/2020/12/09/understanding-solid-principles-open-closed/)
-   **L** [The Liskov substitution principle](/2021/02/26/understanding-solid-principles-liskov-substitution/)
-   **I** [Interface Segregation](/2021/02/26/understanding-solid-principles-interface-segregation-dependency-injection/#interface-segregation)
-   **D** [Dependency Injection](/2021/02/26/understanding-solid-principles-interface-segregation-dependency-injection/#dependency-injection)

Each of these principles is a worthy practice by itself that any software developer would do well to learn. When used in collaboration these patterns give code a completely different structure. Lets explore SRP

## Single Responsibility Principle

The single responsibility principle (SRP) instructs developers to write code that has one and only one reason to change. If a class has more than one reason to change, it has more than one responsibility . Classes with more than a single responsibility should be broken down into smaller classes, each of which should have only one responsibility and reason to change.

To achieve single responsibility you have to identify classes that have too many responsibilities and use delegation and abstraction to refactor the code to achieve single responsibility.

What do I mean by one reason to change? Lets look at an example of a **TradeProcessor** to better explain the problem.

```csharp
namespace SalesProcessor
{
	public class TradeProcessor
	{
		public void ProcessTrades(Stream stream)
		{
			// read rows
			var lines = new List<string>();
			using (var reader = new StreamReader(stream))
			{
				string line;
				while ((line = reader.ReadLine()) != null)
				{
					lines.Add(line);
				}
			}

			var trades = new List<TradeRecord>();

			var lineCount = 1;
			foreach (var fields in lines.Select(line => line.Split(new[] { ',' })))
			{
				if (fields.Length != 3)
				{
					WriteLine("WARN: Line {0} malformed. Only {1} field(s) found.", lineCount, fields.Length);
					continue;
				}

				if (fields[0].Length != 6)
				{
					WriteLine("WARN: Trade currencies on line {0} malformed: '{1}'", lineCount, fields[0]);
					continue;
				}

				if (!int.TryParse(fields[1], out var tradeAmount))
				{
					WriteLine("WARN: Trade amount on line {0} not a valid integer: '{1}'", lineCount, fields[1]);
				}

				if (!decimal.TryParse(fields[2], out var tradePrice))
				{
					WriteLine("WARN: Trade price on line {0} not a valid decimal: '{1}'", lineCount, fields[2]);
				}

				var sourceCurrencyCode = fields[0].Substring(0, 3);
				var destinationCurrencyCode = fields[0].Substring(3, 3);

				// calculate values
				var trade = new TradeRecord
				{
					SourceCurrency = sourceCurrencyCode,
					DestinationCurrency = destinationCurrencyCode,
					Lots = tradeAmount / LotSize,
					Price = tradePrice
				};

				trades.Add(trade);

				lineCount++;
			}

			using (var connection = new SqlConnection("Data Source=(local);Initial Catalog=TradeDatabase;Integrated Security=True;"))
			{
				connection.Open();
				using (var transaction = connection.BeginTransaction())
				{
					foreach (var trade in trades)
					{
						var command = connection.CreateCommand();
						command.Transaction = transaction;
						command.CommandType = System.Data.CommandType.StoredProcedure;
						command.CommandText = "dbo.insert_trade";
						command.Parameters.AddWithValue("@sourceCurrency", trade.SourceCurrency);
						command.Parameters.AddWithValue("@destinationCurrency", trade.DestinationCurrency);
						command.Parameters.AddWithValue("@lots", trade.Lots);
						command.Parameters.AddWithValue("@price", trade.Price);

						command.ExecuteNonQuery();
					}

					transaction.Commit();
				}
				connection.Close();
			}

			WriteLine("INFO: {0} trades processed", trades.Count);
		}

		private static float LotSize = 100000f;
	}
	internal class TradeRecord
	{
		internal string DestinationCurrency;
		internal float Lots;
		internal decimal Price;
		internal string SourceCurrency;
	}
}
```

This class is trying to achieve following

1.  It reads every line from a **Stream** and stores each line in a list of strings.
2.  It parses out individual fields from each line and stores them in a more structured list of Trade-Record instances.
3.  The parsing includes some validation and some logging to the console.
4.  Each **TradeRecord** is enumerated, and a stored procedure is called to insert the trades into a database

The responsibilities of the **TradeProcessor** are **reading streams**, **parsing string**, validating fields, logging and database insertion. The SRP states that this class should only have single reason to change, However the reality of the **TradeProcessor** is that it will change under the following circumstances

-   When you decide not to use a **Stream** for input but instead read the trades from a remote call to a web service.
-   When the format of the input data changes, perhaps with the addition of an extra field indicating the broker for the transaction
-   When the validation rules of the input data change
-   When the way in which you log warnings, errors and information changes. If you are using a hosted web service, writing to the console would not be a viable option.
-   When the database changes in some way — perhaps the insert\_trade stored procedure requires a new parameter for the broker, too, or you decide not to store the data in a relation database and opt for document storage or the database is moved behind a web service that you must call.

For each of these changes, this class would have to be modified.

## Refactoring for clarity

This class not only has too many responsibilities it has a single method that has too many responsibilities, So first you split this method into multiple methods.

```csharp
public void ProcessTrades(Stream stream)
{
	var lines = ReadTradeData(stream);
	var trades = ParseTrades(lines);
	StoreTrades(trades);
}
```

Let’s looks at ReadTradeData,

```csharp
private IEnumerable<string> ReadTradeData(Stream stream)
{
	var tradeData = new List<string>();
	using (var reader = new StreamReader(stream))
	{
		string line;
		while ((line = reader.ReadLine()) != null)
		{
			tradeData.Add(line);
		}
	}
	return tradeData;
}
```

This is exactly the same code that we have in the original code, but it simply been encapsulated in a method which returns list of string.

Let’s look at ParseTrades method

This method has changed little from the original implementation because it, too, delegates some tasks to other methods.

```csharp
private IEnumerable<TradeRecord> ParseTrades(IEnumerable<string> tradeData)
{
	var trades = new List<TradeRecord>();
	var lineCount = 1;
	foreach (var line in tradeData)
	{
		var fields = line.Split(new char[] { ',' });

		if (!ValidateTradeData(fields, lineCount))
		{
			continue;
		}

		var trade = MapTradeDataToTradeRecord(fields);

		trades.Add(trade);

		lineCount++;
	}

	return trades;
}
```

This method delegates validation and mapping responsibilities to other methods. Without this delegation, this section of the process would still be too complex and it would retain too many responsibilities.

```csharp
private bool ValidateTradeData(string[] fields, int currentLine)
{
	if (fields.Length != 3)
	{
		LogMessage("WARN: Line {0} malformed. Only {1} field(s) found.", currentLine, fields.Length);
		return false;
	}

	if (fields[0].Length != 6)
	{
		LogMessage("WARN: Trade currencies on line {0} malformed: '{1}'", currentLine, fields[0]);
		return false;
	}

	int tradeAmount;
	if (!int.TryParse(fields[1], out tradeAmount))
	{
		LogMessage("WARN: Trade amount on line {0} not a valid integer: '{1}'", currentLine, fields[1]);
		return false;
	}

	decimal tradePrice;
	if (!decimal.TryParse(fields[2], out tradePrice))
	{
		LogMessage("WARN: Trade price on line {0} not a valid decimal: '{1}'", currentLine, fields[2]);
		return false;
	}

	return true;
}

private void LogMessage(string message, params object[] args)
{
	Console.WriteLine(message, args);
}

private TradeRecord MapTradeDataToTradeRecord(string[] fields)
{
	var sourceCurrencyCode = fields[0].Substring(0, 3);
	var destinationCurrencyCode = fields[0].Substring(3, 3);
	var tradeAmount = int.Parse(fields[1]);
	var tradePrice = decimal.Parse(fields[2]);

	var trade = new TradeRecord
	{
		SourceCurrency = sourceCurrencyCode,
		DestinationCurrency = destinationCurrencyCode,
		Lots = tradeAmount / LotSize,
		Price = tradePrice
	};

	return trade;
}
```

And finally the StoreTrades method

```csharp
private void StoreTrades(IEnumerable<TradeRecord> trades)
{
	using (var connection = new System.Data.SqlClient.SqlConnection("Data Source=(local);Initial Catalog=TradeDatabase;Integrated Security=True;"))
	{
		connection.Open();
		using (var transaction = connection.BeginTransaction())
		{
			foreach (var trade in trades)
			{
				var command = connection.CreateCommand();
				command.Transaction = transaction;
				command.CommandType = System.Data.CommandType.StoredProcedure;
				command.CommandText = "dbo.insert_trade";
				command.Parameters.AddWithValue("@sourceCurrency", trade.SourceCurrency);
				command.Parameters.AddWithValue("@destinationCurrency", trade.DestinationCurrency);
				command.Parameters.AddWithValue("@lots", trade.Lots);
				command.Parameters.AddWithValue("@price", trade.Price);

				command.ExecuteNonQuery();
			}

			transaction.Commit();
		}
		connection.Close();
	}

	LogMessage("INFO: {0} trades processed", trades.Count());
}
```

Now if you compare this with the previous implementation it is a clear improvement. However what we really achieved is more readability. This new code is no way more adaptable than the previous code you still need to change the **TradeProcessor** class for any of the previously mentioned circumstances. To achieve achieve adaptability you need abstraction.

## Refactoring for abstraction

In this step we will introduce several abstractions that will allow us to handle any change request for this class. The next task is to split each responsibility into different classes and place them behind interfaces.

```csharp
 public class TradeProcessor
    {
        public TradeProcessor(ITradeDataProvider tradeDataProvider, ITradeParser tradeParser, ITradeStorage tradeStorage)
        {
            this.tradeDataProvider = tradeDataProvider;
            this.tradeParser = tradeParser;
            this.tradeStorage = tradeStorage;
        }

        public void ProcessTrades()
        {
            var lines = tradeDataProvider.GetTradeData();
            var trades = tradeParser.Parse(lines);
            tradeStorage.Persist(trades);
        }

        private readonly ITradeDataProvider tradeDataProvider;
        private readonly ITradeParser tradeParser;
        private readonly ITradeStorage tradeStorage;
    }
```

The TradeProcessor class not looks significantly different from previous implementation. It no longer contains the implementation details for the whole process but instead contains the blueprint for the process. This class models the process of transferring trade data from one format to another. This is its only responsibility, its only concern, and the only reason that this class should change. If the process itself changes, this class will change to reflect it. But if you decide you no longer want to retrieve data from a Stream, log on to the console, or store the trades in a database, this class remains as is.

```csharp
using System.Collections.Generic;
using System.IO;

using SingleResponsibilityPrinciple.Contracts;

namespace SingleResponsibilityPrinciple
{
    public class StreamTradeDataProvider : ITradeDataProvider
    {
        public StreamTradeDataProvider(Stream stream)
        {
            this.stream = stream;
        }

        public IEnumerable<string> GetTradeData()
        {
            var tradeData = new List<string>();
            using (var reader = new StreamReader(stream))
            {
                string line;
                while ((line = reader.ReadLine()) != null)
                {
                    tradeData.Add(line);
                }
            }
            return tradeData;
        }

        private readonly Stream stream;
    }
}
```

```csharp
using System.Collections.Generic;

using SingleResponsibilityPrinciple.Contracts;

namespace SingleResponsibilityPrinciple
{
    public class SimpleTradeParser : ITradeParser
    {
        private readonly ITradeValidator tradeValidator;
        private readonly ITradeMapper tradeMapper;

        public SimpleTradeParser(ITradeValidator tradeValidator, ITradeMapper tradeMapper)
        {
            this.tradeValidator = tradeValidator;
            this.tradeMapper = tradeMapper;
        }

        public IEnumerable<TradeRecord> Parse(IEnumerable<string> tradeData)
        {
            var trades = new List<TradeRecord>();
            var lineCount = 1;
            foreach (var line in tradeData)
            {
                var fields = line.Split(new char[] { ',' });

                if (!tradeValidator.Validate(fields))
                {
                    continue;
                }

                var trade = tradeMapper.Map(fields);

                trades.Add(trade);

                lineCount++;
            }

            return trades;
        }
    }
}
```

```csharp
using SingleResponsibilityPrinciple.Contracts;

namespace SingleResponsibilityPrinciple
{
    public class SimpleTradeValidator : ITradeValidator
    {
        private readonly ILogger logger;

        public SimpleTradeValidator(ILogger logger)
        {
            this.logger = logger;
        }

        public bool Validate(string[] tradeData)
        {
            if (tradeData.Length != 3)
            {
                logger.LogWarning("Line malformed. Only {0} field(s) found.", tradeData.Length);
                return false;
            }

            if (tradeData[0].Length != 6)
            {
                logger.LogWarning("Trade currencies malformed: '{0}'", tradeData[0]);
                return false;
            }

            int tradeAmount;
            if (!int.TryParse(tradeData[1], out tradeAmount))
            {
                logger.LogWarning("Trade not a valid integer: '{0}'", tradeData[1]);
                return false;
            }

            decimal tradePrice;
            if (!decimal.TryParse(tradeData[2], out tradePrice))
            {
                logger.LogWarning("Trade price not a valid decimal: '{0}'", tradeData[2]);
                return false;
            }

            return true;
        }
    }
}
```

Now if you refer the back to the list of circumstances, this new version allows you to implement each one without touching the existing classes.

## Examples

**Scenario 1:** Instead of Stream your business team asks you read data from a web service

**Solution:** Create new implementation for **ITradeDataProvider**

Scenario 2: A a new field is added to the data format

**Solution:** Change the implementation for **ITradeDataValidator**, **ITradeDataMapper** and **ITradeStorage**

**Scenario 3:** The validation rules changes

**Solution:** Edit the **ITradeDataValidator** implementation

**Scenario 4:** Your architect asks you to use document db instead of relation database

**Solution:** Create new implementation for **ITradeStorage**

## Conclusion

I hope this blog clears your doubts regarding the **SRP** and convinces you that by combining abstractions via interfaces and continuous refactoring you can make your code more adaptive while also adhering to the Single Responsibility Principle

## Reference

Adaptive Code Via C# – Gary Mclean Hall
