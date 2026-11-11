---
title: "How to use Redis as your primary database"
description: "Recently, I got chance to work with Redis and realized that redis is not just a cache solution it can serve as your primary database. Traditional databases…"
pubDate: 2021-07-22T08:05:11+00:00
slug: "how-to-use-redis-as-your-primary-database"
heroImage: "./whatsapp-image-2020-05-24-at-9.09.42-pm.jpeg"
categories: ["Software Development"]
tags: ["Azure","Database","Index","Indexes","Redis"]
wordpressId: 2480
---

Recently, I got chance to work with Redis and realized that redis is not just a cache solution it can serve as your primary database. Traditional databases store their data on disk, even though most databases have an embedded cache on RAM to optimize query performances. Most of the time we end up using some caching solution like in memory or Redis to get sub millisecond performances.

It’s easy to conceptualize your tables as redis data structures. For example Hash can serve as your table, Sorted Set can be used to build secondary indexes. Let’s see some of the basic database operations in the context of redis for storing and querying list of employees

## Inserting data

You can use Hashmaps to store each record of your table. Each hashmaps will need to be suffixed with an identifier like `employees::1`

```text
HSET employees::1 name Arivu salary 100000 age 30
ZADD employees::name Arivu:1
ZADD employees::salary 100000:1

HSET employees::2 name Uma salary 300000 age 31
ZADD employees::name Uma:2
ZADD employees::salary 300000:2

HSET employees::3 name Jane salary 100000 age 25
ZADD employees::name Jane:3
ZADD employees::salary 100000:3

HSET employees::4 name Zakir salary 150000 age 28
ZADD employees::name Zakir:4
ZADD employees::salary 150000:4
```

The above commands will also work for updating the data. It basically creates employees with 4 records while also updating the respective indexes. In the above example we are indexing only two fields. Unlike traditional database in Redis we have to take care of keeping the indexes up to date.

## Querying data

If you want to query by the primary key

```text
HGETALL employees::1
```

If you want to query by secondary indexes. For example lets query by salary > 150000

```text
ZRANGEBYSCORE employees::salary 150000
Output
======
1) "1"
2) "3"
3) "4"
```

Now you can do a HGETALL for all these ids.

If you want to query using some advanced queries with AND OR logic. I suggest you to explore ZINTERSTORE/ZUNIONSTORE in redis.

Sorting data

Once you know the relevant hashmaps that needs to be return to the client, You can use the SORT function to sort the employees data based on some field

Result returned after querying

```text
1) "1"
2) "3"
3) "4"
```

Store the results in a SET

```text
SADD result 1 2 3 4
```

Sort the data

```text
SORT result by employees::*->name ALPHA GET employees::*->name
Output
1) "Arivu"
2) "Jane"
3) "Uma"
4) "Zakir"
```

## Conclusion

As you can see that redis is definitely capable of serving as a primary database and also with Amazon and AWS offers Managed redis instances its even easier to use Redis as your primary datastore.

Hope you find this useful.
