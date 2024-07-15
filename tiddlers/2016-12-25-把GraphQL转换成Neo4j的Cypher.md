---
layout: post
title: '把GraphQL转换成Neo4j的Cypher'
date: 2016-12-25 13:27:20 +0800
image: 'blog-author.jpg'
description: '不用写数据库请求'
main-class: 'backend'
color: '#D6BA32'
tags:
  - Redux
  - Apollo
  - React
  - graphQL
  - WIP
categories: Journal
twitter_text:
introduction: '介绍如何用现有的 GraphQL API 自动高效地从 Neo4j 数据库中获取数据'
---

## 摘要

从后端开发者的角度来看，GraphQL 是一个特会逼逼（N+1 Problem）、只暴露单一数据端点、提供图状数据（Graph）的数据层范式。由 Facebook 所推广的它，比起 RESTful API 有很多难写的地方。本文将简述由 GraphQL 自动生成数据库请求的一些方案，并重点介绍常用的图论数据库查询语言 Cypher 是怎么从同构的 GraphQL 中生成出来的。

```graphql
loli(id: $loliId) {
  properties {
    name,
    age,
    address(edge: ":address", addressId: $addressId) {
      properties {
        line
      }
    }
  }
}
```

↓

```cypher
MATCH (loli:LOLI {id: {loliId}}) OPTIONAL MATCH (loli)<-[:address]->(address:address {addressId: {addressId}}) RETURN *
```

## 背景

GraphQL 的好处是它能使前端声明式地请求数据，降低 SAM 模式的前端工程中，数据请求类 Action 对单一数据流的污染。由此我们知道，通过应用 GraphQL，后端可以默默帮前端承担更多的活，有利于培养男人之间的友谊。但如果长此以往，前端是不忍心的。因此为了不让前端不忍心，后端可以采取一些方案由 GraphQL 自动生成数据库请求，除了可以在项目初期减轻开发压力，也能通过避免 N+1 问题来减轻数据库的压力。

## 总结

对内容有任何疑问，可以加 China GraphQL User Group 群 302490951 交流。比如有同志看我以前写了篇 Relay 的教程就问我 Relay 好不好用，我都知无不言：「难用啊，所以现在我改用 ApolloStack 了」

## 参考文献（以下文献基本都太监了）

[Naive parser from graphql to cypher query.](https://github.com/JamesKyburz/graphql2cypher)

[An optimized neo4j query resolver for Facebook's GraphQL](https://github.com/jhwoodward/neo4j-graphQL)

[A Neo4j server extension that provides a GraphQL API to Neo4j](https://github.com/neo4j-contrib/neo4j-graphql)
