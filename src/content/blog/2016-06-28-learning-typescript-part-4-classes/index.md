---
title: "Learning TypeScript Part 4 – Classes"
description: "Classes Traditional JavaScript uses prototype based inheritance as the basic means of building up reusable components. but this is bit different from the…"
pubDate: 2016-06-28T15:42:10+00:00
updatedDate: 2016-07-05T05:40:21+00:00
slug: "learning-typescript-part-4-classes"
categories: ["TypeScript"]
tags: []
wordpressId: 647
---

## Classes

Traditional JavaScript uses prototype based inheritance as the basic means of building up reusable components. but this is bit different from the object oriented approach to which we are most accustomed where classes inherit functionality and objects built from these classes. Starting ES6 JavaScript programmers will be able to build their applications using this object oriented approach.

### Simple Class

```javascript
class Vehicle {
	name: string;
	constructor(name: string) {
		this.name = name;
	}
	drive(distance) {
		console.log(`${this.name} moved ${distance} meters.`);
	}
}

let veh = new Vehicle('My Vehicle');
```

If you are a C# or Java programmer the syntax should look familiar to you. The keyword **class** is used to define a class

## Inheritance

In TypeScript we can use common object oriented patterns. One of the fundamental pattern in object oriented programming is inheritance.

Let us see how we can do inheritence with below example.

```javascript
class Bike extends Vehicle {
	constructor(name: string) {
		super(name);
	}

	drive(distance) {
		console.log('moving in two wheels');
		super.drive(distance);
	}
}

class Car extends Vehicle {
	constructor(name: string) {
		super(name);
		}
	drive(distance) {
		console.log('moving in four wheel');
		super.drive(distance);
	}
}

let hondo = new Bike('hondo');
let car: Vehicle = new Car('Tesla');
```

**extends** keyword is used to create a subclass

Car and Bike are the subclass the base class in Vehicle and the sub classes are able to access the base class features

## Modifiers

TypeScript has three modifiers public, private and protected

-   **public** is default
-   **private** cannot be accessed from outside of the class
-   **protected** modifier acts much like private with the exception that memebers declared. protected can also be accessed by instances of deriving class

## Parameter Properties

Parameter properties lets you to create and initialize a member in one place

Below is updated class definition of Vehicle using parameter properties

```javascript
class Vehicle {
	constructor(private name: string) { }
	drive(distance) {
		console.log(`${this.name} moved ${distance} meters.`);
	}
}
```

## Accessors

TypeScript supports getter and setter as a way of intercepting access to a member of an object. This gives you a way of having finer control over how a member is accessed on each object.

For example lets consider the below class

```javascript
class Employee {
	fullName: string;

}

let employee = new Employee();
employee.fullName = 'Bob Smith';
if (employee.fullName) {
	console.log(employee.fullName);
}
```

While allowing people randomly set fullname directly is pretty handy, this might get us in trouble if people can change names on a whim

```javascript
class Employee {
	private _fullName: string;

	get fullName(): string {
		return this._fullName;
	}

	set fullName(newName: string) {
		this._fullName = newName;
	}
}
```

## Static Properties

Static members are the members that are visible on the class itself rather than than on the instances.

```javascript
class Grid {
	static origin = { x: 0, y: 0 };
	constructor(parameters) {

	}
}
console.log(Grid.origin.x);
console.log(Grid.origin.y);
```

## Abstract Classes

Abstract classes are base classes from which other classes may be derived. but they may not be instantiated directly. Unlike an interface abstract class may contain implementation details for its members

**abstract** keyword is used to define Abstract Classes and abstract methods

Methods within **abstract** classes must be implemented by derived class

```javascript
abstract class Animal {
	abstract makeSound(): void;
	move(): void {
		console.log('roaming the earth');
	}
}
```
