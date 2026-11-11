---
title: "How to do polymorphic  serialization/deserialization in C# System.Text.Json"
description: "In this blog post, you’ll see how to serialize and deserialize a hierarchy of objects polymorphically to have a cleaner json."
pubDate: 2022-07-29T18:34:33+00:00
updatedDate: 2022-07-30T07:24:31+00:00
slug: "how-to-do-polymorphic-serialization-deserialization-in-c-system-text-json"
heroImage: "./cropped-img_20170729_140425.jpg"
categories: ["Software Development"]
tags: ["C#","Deserialization","Json","polymorphic","Serialization","Software Development","System.Text.Json"]
wordpressId: 2777
---

Let’s say you have a hierarchy of models that you need to serialize and store it as a JSON string. The straight forward way to do this would be to use the `JsonSerializer` class. But if one of the child property is polymorphic its becomes little tricky. Let’s look at the following example

```csharp
public class ObjectMetadata
{
  public string ObjectName { get; set; }
  public List<BaseType> FieldMetadata {get; set;}
}

public class BaseFieldMetadata
{
  public string FieldName {get; set;}
  public string Description {get; set;}
}

public class StringFieldMetadata
{
  public int Length {get; set;}
}

public class IntFieldMetadata
{
  public int Min {get; set;}
  public int Max {get; set;}
}
```

In this example we have parent object `ObjectMetadata` and it has one property named `FieldMetadata`. This field metadata can be of any type depending on the scenario(ex: int, decimal, date, currency, string etc). And we will have different implementations for `BaseFieldMetadata` to handle different types.

Now let’s try to serialize this structure.

```csharp
var objectMetadata = new ObjectMetadata()
{
	ObjectName = "Account",
	FieldMetadata = new List<BaseType>()
	{
		new StringField()
		{
			FieldName = "Name",
			Length = 90
		},
		new IntField()
		{
			FieldName = "Age",
			MinValue = 10,
			MaxValue = 100
		}
	}
};
var jsonString = JsonSerializer.Serialize(@object);
Console.WriteLine(jsonString);
```

This will print the following

```javascript
{
    "ObjectName": "Account",
    "FieldMetadata": [{
            "FieldName": "Name",
            "Description": null
        }, {
            "FieldName": "Age",
            "Description": null
        }
    ]
}
```

## Serialization

You notice that it has ignored the properties of `StringFieldMetadata` and `IntFieldMetadata`. This is because the `JsonSerializer` only looks at the type of the declared property and tried to serialize the `BaseType` properties. If we want to make the serializer to look at the derived type we could do something like below.

```csharp
var jsonString = JsonSerializer.Serialize((object[])objectMetadata
.FieldMetadata
.ToArray());
Console.WriteLine(jsonString);
```

The above code will internally call `GetType()` method and figure out the exact type and will serialize the child properties as well.

```javascript
[{
        "Length": 90,
        "FieldName": "Name",
        "Description": null,
    }, {
        "MinValue": 10,
        "MaxValue": 100,
        "FieldName": "Age",
        "Description": null
    }
]
```

Now that we are properly able to serialize the model, if you try to deserialize the data you wont be able to. This is because once you have converted the model to json string we would have lost all the type information. And when try to deserialize the json string to model it will use the declared type `BaseType` and ignore the properties that belongs to the derived type.

## Deserialization

The only way that we can deserialize the JSON string to specific type polymorphically we have to store some metadata on the JSON which we can utilize during deserialization.

```csharp
public interface IFieldType
{
  string FieldType { get; }
}
```

Let’s use the above interface and implement this interface in our `BaseType` so that all derived class of the `BaseType` will have this property. Also assign this property with the name of the class like below

```csharp
public class ObjectMetadata
{
	public string ObjectName { get; set; }
	public List<BaseType> FieldMetadata { get; set; }
}

public class BaseType : IFieldType
{
	public string FieldName { get; set; }
	public string Description { get; set; }
	public string FieldType => nameof(BaseType);
}

public class StringField : BaseType
{
	public int Length { get; set; }
	public new string FieldType => nameof(StringField);
}

public class IntField : BaseType
{
	public int MinValue { get; set; }
	public int MaxValue { get; set; }
	public new string FieldType => nameof(IntField);
}
```

This will make sure that when we serialize the model we will have the type information as part of the json String like below

```javascript
{
    "ObjectName": "Account",
    "FieldMetadata": [{
            "Length": 90,
            "FieldType": "StringField",
            "FieldName": "Name",
            "Description": null
        }, {
            "MinValue": 10,
            "MaxValue": 100,
            "FieldType": "IntField",
            "FieldName": "Age",
            "Description": null
        }
    ]
}
```

Now we can use this property and write a custom deserialization logic to determine appropriate type. We would need to create a custom JsonConverter class to handle this.

```csharp
public class FieldMetadataConverter<T> : JsonConverter<T> where T : IFieldType
{
	private readonly IEnumerable<Type> _types;

	public FieldMetadataConverter()
	{
		var type = typeof(T);
		_types = AppDomain.CurrentDomain.GetAssemblies()
		.SelectMany(s => s.GetTypes())
		.Where(p => type.IsAssignableFrom(p) && p.IsClass && !p.IsAbstract);
	}
	public override T Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
	{
		if (reader.TokenType != JsonTokenType.StartObject)
			throw new JsonException();

		using (var jsonDocument = JsonDocument.ParseValue(ref reader))
		{
			if (!jsonDocument.RootElement.TryGetProperty(nameof(IFieldType.FieldType), out var typeProperty))
				throw new JsonException();
			var type = _types.FirstOrDefault(x => x.Name == typeProperty.GetString());
			if (type == null)
				throw new JsonException();
			var jsonString = jsonDocument.RootElement.GetRawText();
			var jsonObject = (T)JsonSerializer.Deserialize(jsonString, type, options);
			return jsonObject;
		}
	}

	public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options)
	{
		JsonSerializer.Serialize(writer, (object)value, options);
	}
}
```

We have to override the `Read()` and `Write()` method of JsonConvertor. As we have seen while writing we just have to cast the property to `object` and while reading we will check the `FieldType` property and get the appropriate type and cast to that type.

Hope you find this useful!

**Reference**

[https://docs.microsoft.com/en-us/dotnet/standard/serialization/system-text-json-polymorphism](https://docs.microsoft.com/en-us/dotnet/standard/serialization/system-text-json-polymorphism)
