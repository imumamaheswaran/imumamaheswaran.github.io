---
title: "Learning TypeScript Part 3 – Interfaces"
description: "Interfaces Interfaces are the most flexible way of describing types in TypeScript language. The only job of an interface in TypeScript is to describe a…"
pubDate: 2016-06-28T13:04:08+00:00
updatedDate: 2016-06-29T16:38:53+00:00
slug: "learning-typescript-part-3-interfaces"
categories: ["TypeScript"]
tags: []
wordpressId: 547
---

## Interfaces

Interfaces are the most flexible way of describing types in TypeScript language. The only job of an interface in TypeScript is to describe a type. While classes and functions will deal with implementation.

To define an interface use the keyword interface.

```javascript
interface IMovie {
 play(name: string): void;
}
```

## Roles of Interfaces

-   Describing an Object
-   Describing an Indexable Object
-   Ensuring Class instance Shape

### Describing an Object

In Javascript methods like $.ajax takes many arguments, but not necessarily we need to pass all the arguments whenever we use this method. TypeScript support this notion of optional properties to help you use these objects correctly.

```javascript
interface IMovieSettings {
 name: string;
 length?: number;
 genre?: string;
}

function playMovie(movie: IMovieSettings) {
 ...
}
```

If ? symbol is used after some of the member names then it means that the member is optional.

```javascript
playMovie({ name: 'The Hobbit' }); //OK
playMovie({ name: 'The Hobbit', length: '70 mins' }); // Invalid type for length
playMovie({ length: 70, genre: 'Adventure' }); // Property name is missing
```

### Describing an Indexable Object

Indexable types have an index signature that describes the types we can use to index in to the object, along with corresponding return types when indexing

```javascript
interface IMovies {
 [index: number]: string;
}
let movies: IMovies;
movies = [&amp;quot;The Hobbit&amp;quot;, &amp;quot;Lord of the Rings&amp;quot;, &amp;quot;Deadpool&amp;quot;];
```

### Ensuring Class Instance Shape

Let’s extend the IMovies example above

```javascript
interface IMovie {
 play(name: string): void;
 language: string;
}
```

we can implement this inrface  in a class using implements keyword

```javascript
class HollywoodMovie implements IMovie {
language = 'English';

play(name: string) {
console.log(name);
}
}
```

Now we can use an instance of Hollywoodmovie wherever a IMovie is expected.

```javascript
var movie: IMovie = new HollywoodMovie();
```

Similarly we can also use structural typing of TypeScript to implement the IMovie object literal.

```javascript
var movie = {
play: (name: string) =&amp;gt; { console.log(name) },
language: 'Any',
}
```
