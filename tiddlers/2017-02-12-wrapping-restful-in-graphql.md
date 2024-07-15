---
layout: post
title: 'Wrapping RESTful in GraphQL'
date: 2017-02-12 10:26:19 +0800
image: 'blog-author.jpg'
description: 'Work as an API Gateway'
main-class: 'frontend'
color: '#66CCFF'
tags:
  - Redux
  - Apollo
  - React
  - graphQL
categories: Journal
twitter_text:
introduction: 'introducting how to wrap existing RESTful API into a GraphQL API Gateway.'
---

## Abstraction

From frontend dev aspect of view, GraphQL is a data layer paradigm that supports declarative Optimistic Update, fetch data following with use, data WYSIWYG, etc. It truly has some advantage above RESTful API, I'm going to introduce how to wrap existing RESTful API into a GraphQL API Gateway, without bothering backend dev, using an example that has been production tested.

## Background

An outsourced project has some interesting relics, for example, it's API usage:

```javascript
import * as Mapi from '../../lib/Mapi';

// ...

  componentWillMount() {
    Mapi.districtPie(this.props.id)
      .then(json => {
        if (json.data.code === 0 && json.data.data !== undefined) {
          this.setState({
            districtPiedata: json.data.data,
          });
        }
      });
    Mapi.pie()
      .then(json => {
        if (json.data.code === 0) {
          this.setState({
            piedata: json.data.data,
          });
        }
      });
    Mapi.whoami()
      .then(json => {
        this.setState({ user: json.data.data });
      });
  }
```

Looks overstaffed, since there are tons of boilerplates but I still can't know what data is inside `piedata`. That's why I got some `Cannot read property 'machine' of undefined` and `undefined is not an object`.

There were other problems, for example, I need to null check deep nested data:

```html
<View style="{styles.powerload}">
  <PowerLoad totalLoad={this.state.piedata && this.state.piedata.total ? this.state.piedata.total : 0}
  currentLoad={this.state.piedata && this.state.piedata.current ? this.state.piedata.current : 0}
  unit={this.state.piedata && this.state.piedata.unit ? this.state.piedata.unit : 'kw'} rate={this.state.piedata &&
  this.state.piedata.rate ? this.state.piedata.rate : '0%'} />
</View>
```

The problem here is that he put his data inside components' state, while state can't offer type check (PropTypes) and initial value (defaultProps) like components' props.

Though using redux-saga, dva or so can solve this too, but they can't easily deal with the data-visibility problem: I want my data WYSIWYG, or say what I use is what I fetch.

I want to use `deviceID` but Uncle backend likes using `dviceId`, oh my backend, you misspelled device!

Well, using Redux and GraphQL solve all these problems.

## Declare Schema

In REST, we separate our data to a different path by their domain model or so. It actually depends on our alpha version demand, using names that used to fit our need. As we can see, sometimes in our beta version demand, we have to use more than three REST calls on a single page.

But if you declare your backend like this:

```graphql
// GraphQL Schema

# /api/account/whoami
type UserType {
  logined: Boolean
  username: String
  password: String
  token: String

  id: Int!
  name: String

  companyId: Int
  companyName: String
  departmentId: Int
  departmentName: String
  role: String
}


# /api/info/entry  /api/data/site/{id}/overview
# This model wraps two REST api
type PowerEntityType {
  id: Int!
  name: String!
  areaType: AreaType!

  # ↓ useless data in REST api
  address: String
  coordinate: String
  companyId: Int
  districtId: Int
  siteId: Int
  gatewayID: Int

  alarmInfos(pagesize: Int, pageIndex: Int, orderBy: OrderByType, fromTime: String, toTime: String, filterAlarmCode: String): [AlarmInfoType]
  unreadAlarm: Int
  pie: PieGraphType
  infos(siteID: Int!): [InfoType]
  wires(siteID: Int!): [WireType]
  cabinets(siteID: Int!): [CabinetType]
  children(areaType: AreaType, id: Int): [PowerEntityType]
}
```

Now every domain model can be a combination of plural microserver that export REST API.

There are two pros:

1. you can see what your data source have for you. I used to keep sending request wanted to know what returned JSON looks like, no more Postman!
2. It provides runtime type check, now you can focus on binding data, separating your concerns.

## How to build this gateway

Firstly you need a .graphql file to put your GraphQL Schema. You can separate schema into multiple files by yourself.

```javascript
// rootSchema.graphql
schema {
  query: RootQuery
  mutation: RootMutation
}

type RootQuery {
  Config: ConfigType
  User(token: String!): UserType
  Company(token: String!): CompanyType
}

# /api/account/whoami
type UserType { # looks like typescript or flowtype, without a "="
  logined: Boolean # your custom type are consisting of other custom type or Scalar type
  username: String
  password: String
  token: String

  id: Int!
  name: String

  companyID: Int
  companyName: String
  departmentID: Int
  departmentName: String
  role: String
}
# ...other type definations

```

↑ We will load this later by babel-plugin-static-fs

We use apollo graphql to set up GraphQL server, type definitions will perform type checking and self-document, etc. it needs resolvers to actually fetch data:

```javascript
// resolvers.js
export const resolvers = {
  // ...
  UserType: {
    logined({ token }, args, context) {
      return context.User.getLoginStatus(token); // context.User is a domain model, containing a data source
    },
    username({ token }, args, context) {
      return context.User.getUserName(token);
    },
    password({ token }, args, context) {
      return context.User.getPassWord(token);
    },
    token({ token }, args, context) {
      return token;
    },
    id({ token }, args, context) {
      return context.User.getMetaData('id', token);
    },
    name({ token }, args, context) {
      return context.User.getMetaData('name', token);
    },
    companyID({ token }, args, context) {
      return context.User.getMetaData('companyId', token);
    },
    companyName({ token }, args, context) {
      return context.User.getMetaData('companyName', token);
    },
    departmentID({ token }, args, context) {
      return context.User.getMetaData('departmentId', token); // Note that I use ID instead of Id here!
    },
    departmentName({ token }, args, context) {
      return context.User.getMetaData('dpartmentName', token); // Note that I fix type here!
    },
    role({ token }, args, context) {
      return context.User.getMetaData('role', token);
    },
  },
  // ...
};
```

We offer each field in type definitions a resolver function. When we query some field in our UI component, the query will trigger some of these functions, thus return data we actually need. Data will be type checked, return to our UI component.

## Cache

Since we are wrapping REST API, which will unload tons of data to our GraphQL gateway, some parts of data are useless to a query but useful to next query. We need to do some caching, which will deal with the N+1 problem at the same time.

You can simply cache your data at [Connector level](http://dev.apollodata.com/tools/graphql-tools/connectors.html), set up a 100ms or higher expire time, which is far enough for a single GraphQL query. Or you can use different expire time for different domain model, cache near-static data for 5min or longer is safe for my project.

In GraphQL-REST gateway case, [data loader](https://github.com/facebook/dataloader) is a good reference but can't be used directly, since it batch query into an array.

```javascript
// offical example
myLoader.load('A');
myLoader.load('B');
myLoader.load('A');

// > [ 'A', 'B', 'A' ]
```

But not all your REST API supports array style query batching. (one of my statistic API does, but I haven't tried this yet)

## Set up

Here is a set up boilerplate.

```javascript
// index.js
import { readFileSync } from 'fs';
import { join } from 'path';

import { merge } from 'lodash';

import { makeExecutableSchema } from 'graphql-tools';

import { Power51Connector, EZConnector } from './connectors';
import { User, Config, PowerEntity, FortuneCookie } from './models';
import rootResolvers from './resolvers';

// ↓ this will be inline by babel-plugin-static-fs
const rootSchema = readFileSync(join(__dirname, './typeDefinations/rootSchema.graphql'), 'utf8');

export const typeDefs = [rootSchema];
export const resolvers = merge(rootResolvers);

export const executableSchema = makeExecutableSchema({ typeDefs, resolvers });

type power51ConfigType = {
  url: string,
};

type ezConfigType = {
  url: string,
  appKey: string,
};

type contextConfigType = {
  power51Config: power51ConfigType,
  ezConfig: ezConfigType,
};

export const getDefaultContext = ({ power51Config, ezConfig }: contextConfigType) => {
  // ↓ where I use fetch API to fetch data
  const serverConnector = new Power51Connector(power51Config);
  const ezConnector = new EZConnector(ezConfig);

  return {
    // ↓ set up domain models, these Objects are where context.User.xxx comes from
    Config: new Config({ connector: serverConnector }),
    User: new User({ connector: serverConnector }),
    PowerEntity: new PowerEntity({ connector: serverConnector, ezConnector }),
    FortuneCookie: new FortuneCookie(),
  };
};
```

Note that if you want to use this code both on server-side, web-side and React-Native side, you need to babel it by `babel-preset-react-native-stage-0` and never use other preset, since React-Native is doing something tricky to speed up their app, thus they don't use some babel helpers that babel-preset-stage-x will use.

## Conclusion

GraphQL is a paradigm that extremely delightful when building a gateway. In this paper I introduce the reason why I need to wrap REST APIs, then I show that each model in GraphQL can be built by composing several REST APIs. Finally, I give a boilerplate to set up your gateway. As you may feel, setting up an REST-GraphQL gateway is quite similar to set up a simple and naive GraphQL server, the main difference is that you will use fetch API instead of database API.

## Reference

Translated and mutated from linonetwo's [把 REST 包装成 GraphQL](http://onetwo.ren/%E6%8A%8AREST%E5%8C%85%E8%A3%85%E6%88%90GraphQL/)
