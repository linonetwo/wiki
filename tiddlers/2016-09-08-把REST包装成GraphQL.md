---
layout: post
title: '把REST包装成GraphQL'
date: 2016-10-01 10:27:20 +0800
image: 'blog-author.jpg'
description: '作为一个 API 网关'
main-class: 'frontend'
color: '#66CCFF'
tags:
  - Redux
  - Apollo
  - React
  - graphQL
categories: Journal
twitter_text:
introduction: '介绍如何将现有的 RESTful API 包装成一个适合单页面应用的 GraphQL API'
---

## 摘要

从前端开发者的角度来看，GraphQL 是一个支持积极更新数据（Optimistic Update）、在 React 组件旁边声明式地取数据、数据所见即所得的数据层范式。由 Facebook 所推广的它，比起 RESTful API 有很多先进之处。本文以一个生产环境中的例子相伴，介绍了如何在不影响后端开发人员的情况下将现有的 RESTful API 包装成便于前端使用的 GraphQL API。

## 背景

在一个从外包人员处接手的前端项目中，我见到了许多有趣的遗迹，例如页面间复制黏贴的无用 import、许多后缀名加上 .bak 但与另一个页面无甚区别的古老页面、富有童趣的组件命名等。其中对 API 的使用尤为令人动容，大概是这样子：

```javascript
import * as Mapi from '../../lib/Mapi';

// ... 略去无关代码

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

看起来有点臃肿，因为里面有着大量的重复代码。  
看起来有点懵逼，因为我们无法看出 piedata 里面有啥。如果你它有比较深的层级，就很容易出 `Cannot read property 'machine' of undefined` 或者 `undefined is not an object`，特别是当你还上了 ES6 计算属性值，那 debug 时间就会变得有点长。

此外的问题还有很多，比如我得把数据的非空检查做在 UI 里。

```html
<View style="{styles.powerload}">
  <PowerLoad totalLoad={this.state.piedata && this.state.piedata.total ? this.state.piedata.total : 0}
  currentLoad={this.state.piedata && this.state.piedata.current ? this.state.piedata.current : 0}
  unit={this.state.piedata && this.state.piedata.unit ? this.state.piedata.unit : 'kw'} rate={this.state.piedata &&
  this.state.piedata.rate ? this.state.piedata.rate : '0%'} />
</View>
```

这里的问题在于我们把数据放在 state 里了，而 state 不像 props 一样能提供类型检查、在为空时提供默认值。

虽然配合使用 Redux 等数据流框架能解决大半，但既然要重构，就应该尽可能让这个重构迭代活得久一点 ———— 解决掉干扰开发人员理解代码的大问题。我最希望解决的其实是数据对于我的可见性问题：  
「我希望在写 UI 的时候能看到数据长啥样，而且最好数据能和我 UI 的结构长得一模一样，让绑定数据到 UI 上的过程轻松愉快。」

现状是，我每次绑定数据都得用 postman 请求一下后端看看返回的数据长啥样，然后我调用这个 API，并从返回的一大堆数据中取出部分几个我需要的绑在 UI 上，很有弱水三千取一瓢饮的风度。而因为业务的变更，我要在一个 UI 组件里同时使用好几个 API。  
而且我喜欢把常用词里的字母大写，例如 `deviceID`，而后端大叔喜欢小写，例如 `dviceId`。哦，老天爷，他拼写的时候漏了个 e！  
理想情况下，后端应该随着业务变动迅速跟进，把 API 拆分好，然后翻动宝宝取名大全给每个 API 起一个新的有意义的名字。但很明显，后端是不会放下他手头的一大堆事来配合你改造 API 的，毕竟凭什么数据要跟着 UI 来长脸呢，你以为你的 UI 很帅么？况且三天后需求又改了怎么办？让后端再重写 REST 端点么，他会用他的皮衣抽你的。

同时使用 Redux 和 GraphQL 解决了这些问题。

## 声明数据格式

过去，在 REST 中，我们按照业务将数据区分到不同的路径下，相当于依照你做第一个版本那会儿的业务需求，给每一堆数据取一个当时觉得通俗易懂的名字，然后希望以后在每个业务中使用一个：

```javascript
// 外包人员的古代写法
export function whoami() {
  return apiget('/api/account/whoami');
}

export function pie() {
  return apiget('/api/data/index/pie');
}

export function entry() {
  return apiget('/api/info/entry');
}

export function districtPie(id) {
  return apiget(`/api/data/district/${id}/pie`);
}

export function siteOverview(id) {
  return apiget(`/api/data/site/${id}/overview`);
}

export function sitePie(id) {
  return apiget(`/api/data/site/${id}/pie`);
}

export function cabinetsSwitches(id) {
  return apiget(`/api/data/site/${id}/cabinets/switches`);
}

export function siteWarningQuantity(id) {
  return apiget(`/api/alarm/unread_quantity/site/${id}`);
}
```

在 GraphQL 中，我们将数据表示成一棵树，并能直接请求其中的任何一片叶子。  
与 REST 类似的是我们也能起通俗易懂的名字，不同的是现在不是对着一条路径幻想里面藏着什么数据，我们能直接观察更小粒度的数据，类似于这样：

```graphql
// 重构过的现代写法
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
# 战区信息，说明这个星球有哪些据点或子战区，战区有自己的伤亡比例饼图数据
# 同时也能表示据点的数据，可以包括伤亡比例饼图和运输线列表等数据
type PowerEntityType {
  id: Int!
  name: String!
  areaType: AreaType!

  # ↓ 比较无关紧要的信息
  address: String
  coordinate: String
  companyId: Int
  districtId: Int
  siteId: Int
  gatewayID: Int

  alarmInfos(pagesize: Int, pageIndex: Int, orderBy: OrderByType, fromTime: String, toTime: String, filterAlarmCode: String): [AlarmInfoType]
  unreadAlarm: Int
  pie: PieGraphType
  infos(siteID: Int!): [InfoType] # 显示一些「当日最大击杀」、「当月最大击杀」等信息
  wires(siteID: Int!): [WireType]
  cabinets(siteID: Int!): [CabinetType]
  children(areaType: AreaType, id: Int): [PowerEntityType]
}
```

我们可以从注释中看到每个数据类型和原有的 REST 端点之间的关系，一个数据类型可以由多个原有的 RESTful 数据源拼凑而来（例如集成多个微服务），也可以根据常识把一个 REST 数据源重构成多个数据类型，以方便三个月后，你重读这份代码时能理解她。

这样变换之后有两个直接好处: 一是你能直接看到数据源长啥样了！再也不用因为记不清每个数据端点有哪些字段而不停地用 Postman 发请求抓数据了。 二是它提供了静态类型检查，你能在写类型的时候想好每个类型都应该是什么样，然后把检查数据可用性的工作抛开，把精力集中在业务上……

还有两个间接好处：一是她写起来仿佛像在写 Flowtype 或 TypeScript，你现在连取数据都在加类型注解，几个月后当你开始学 Rust 语言的时候你会感到亲切得像到了家，21 分钟从入门到精通。 二是你可以在数据端点上加注释了，可以用「？？？」黑人问号操作符声明式地表达你对业务的困惑，也可以用「！」赛艇操作符描述某个数据项之不可或缺。

## GraphQL

上面我们用于声明类型的语言叫做 GraphQL，Github 正在将他们的 API 转移到 GraphQL 上，你可以先去查查它是咋写的。它一般写在一个 schema.js 文件中，大概长这样：

```javascript
// schema.js
export const typeDefinitions = `schema {
# /api/account/whoami
type UserType { # 声明自定义类型
  logined: Boolean # 所有自定义类型都是由一堆标量类型组合而成的
  username: String
  password: String
  token: String

  id: Int!
  name: String

  companyID: Int
  companyName: String
  departmentID: Int
  departmentName: String
  role: String # 嗯 ？？？
}
# ...略去其他类型声明
`;
```

↑ 它写在一个首行放在第一行的多行文本内，以方便看行号 debug。我们把它 export 为常量 typeDefinitions。  
在写完数据类型声明后，我们还要在 schema.js 中继续说明这些数据类型中的每个字段，它们对应的数据都要怎么获取。我们用「解析函数」做到这一点：

```javascript
// schema.js
export const resolvers = {
  // ...略去其他解析函数，代码以实物为准
  UserType: {
    logined({ token }, args, context) {
      return context.User.getLoginStatus(token); // context 中的 User 从何而来我们等一下再说，你只需要知道它是一个数据源
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
      return context.User.getMetaData('departmentId', token); // 注意我把 Id 改成了 ID ，蛤蛤蛤
    },
    departmentName({ token }, args, context) {
      return context.User.getMetaData('dpartmentName', token); // 注意我修复了 typo
    },
    role({ token }, args, context) {
      return context.User.getMetaData('role', token);
    },
  },
  // ...略去其他解析函数，代码以实物为准
};
```

我们可以看到，其实我们是为每个可能需要的字段都提供了一个函数作为数据源，而当我们在 UI 中需要某几个字段时，我们发出的请求就会触发这里的某几个函数，从而仅返回我们需要的那些字段对应的数据，然后这些数据经过类型检查后，返回到我们发出请求的 UI 那里。

在 UI 那里用起来大概是这种感觉：

```javascript
function mapStateToProps(state) {
  return {
    token: state.auth.getIn(['form', 'token']), // 我们从 Redux 里取出 API 需要的 token
  };
}

const MainPageData = gql`
  query MainPageData($token: String!) {
    # 我们声明我们要把 token 传到这里
    User(token: $token) {
      id
      logined
      name
      companyName
      departmentName # 我们声明我们在 UI 中会用到这些数据
      role
    }
  }
`;

const queryConfig = {
  options: ({ token }) => ({
    variables: { token }, // 我们配置 graphQL HOC 把它 props 中的 token 用起来
    pollInterval: 10000,
  }),
  props: ({ ownProps, data: { refetch, loading, User } }) => ({
    refetch,
    loading,
    User,
  }),
};

@connect(mapStateToProps) // Redux 经典用法
@graphql(MainPageData, queryConfig) // graphQL HOC
export default class Main extends Component {
  static propTypes = {
    // Apollo 的 @graphql 提供的
    loading: PropTypes.bool.isRequired,
    refetch: PropTypes.func.isRequired,
    // Redux 的 @connect 提供的
    token: PropTypes.string.isRequired,
    // 我们声明想要的数据
    User: PropTypes.object.isRequired,
  };

  static defaultProps = {
    User: {
      id: '',
      logined: false,
      name: '',
      companyId: '',
      companyName: '',
      departmentName: '',
      role: '',
    },
  };

  render() {
    // ...写你的 UI 去吧
  }
}
```

## 客户端 GraphQL 数据源

其实 GraphQL 数据端点，也就是 schema.js 里的那些数据类型，还有解析函数，本来应该是后端大叔来写的。然而后端大叔有家室，有自己的生活，你不应该为了你个人能更愉悦地写 UI 就去要求他放下生命中的诸多美好，我们不能那么残忍。

我们有更好的做法，也就是在我们的 UI 层和数据层之间插入一个简易的 GraphQL 数据端点作为中介。  
在这个中介处我们能将原本一次性返回一大坨数据的 API 拆成细粒度的数据类型，能修正后台返回的数据中的 typo，能检查数据是否为空，我们来看个例子：

```javascript
// REST2GraphQLInterface.js
// 以下大部分都是套路，你只需要修改 model 的部分
import ApolloClient, { printAST, addTypename, addQueryMerging } from 'apollo-client';

import { graphql } from 'graphql';

import { merge, mapValues } from 'lodash';
import { makeExecutableSchema } from './schemaGenerator';

import { typeDefinitions as rootSchema, resolvers as rootResolvers } from './schema';
import { User } from './models'; // 修改这个部分
import HouTaiDaShuConnector from './HouTaiDaShuConnector';

const typeDefs = [...rootSchema];
const resolvers = merge(rootResolvers);

const executableSchema = makeExecutableSchema({ typeDefs, resolvers });

const serverConnector = new HouTaiDaShuConnector();

const REST2GraphQLInterface = {
  query(GraphQLRequest) {
    return graphql(
      executableSchema,
      printAST(GraphQLRequest.query),
      undefined,
      {
        User: new User({ connector: serverConnector }), // 在这给你自己的 model 引入你自己的 connector
      },
      GraphQLRequest.variables
    );
  },
};

const client = new ApolloClient({
  networkInterface: addQueryMerging(REST2GraphQLInterface),
  queryTransformer: addTypename,
  shouldBatch: true,
});

export default client;
```

然后把 Redux 的 Provider 换成 GraphQL 会员专享的 ApolloProvider：  
从

```javascript
<Provider store={store}>{/* 你的根组件 */}</Provider>
```

变成

```javascript
<ApolloProvider client={client} store={store}>
  {/* 你的根组件 */}
</ApolloProvider>
```

这样，取数据的链条就大致串起来了，你会发现数据是这么流动的：  
后台大叔的 RESTful API -> connector -> Model -> resolver functions（解析函数） -> executableSchema -> REST2GraphQLInterface -> ApolloClient -> Redux -> 你的 UI 的 props -> 你的 UI

## connector 和 Model 是什么？

刚刚我们看到，在创建 REST2GraphQLInterface 的时候，我们这么写：

```javascript
  User: new User({ connector: serverConnector }), // 在这给你自己的 model 引入你自己的 connector
```

其中 User 是一个 Model。  
为什么要这么写呢？  
其实所有数据的获取，即对后台大叔 RESTful API 的请求，我们都可以放在解析函数里搞，但是我们这样会写一大堆重复的代码，而且对于每一点小小的数据我们都要 fetch 一次，很浪费资源，一种弱水三千取一瓢饮的概念。  
所以我们抽象出一层 Model：

```javascript
// models.js
export class User {
  constructor({ connector }) {
    this.connector = connector;
    this.metaData = {};
  }

  async getLoginStatus(token) {
    try {
      // 在这边可以做一些缓存
      const meta = await this.getAllMetaData();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getAllMetaData(token) {
    const metaData = await this.connector.get('/api/account/whoami', token);
    // 这是一种比较 naive 的缓存方案，我有一种精妙的解决方案，但这里空间太小我写不下了。
    this.metaData[token] = metaData;
    return this.metaData[token];
  }

  getMetaData(field, token) {
    return this.getAllMetaData(token).then(meta =>
      has(meta, field) ? meta[field] : Promise.reject(new Error(MODEL_DONT_HAVE_THIS_FIELD + ' : ' + field))
    );
  }
}
```

而如果我们想让 Model 专注在数据缓存和数据清洗上，我们就得把网络请求的部分抽象出去，抽象成 connector：

```javascript
// HouTaiDaShuConnector.js
export default class HouTaiDaShuConnector {
  get(route, token) {
    const tokenWithPrefix = `${/\?/.test(route) ? '&' : '?'}token=${token}`;
    return Promise.try(() =>
      fetch(`${HouTaiDaShuPATH}/${route}${tokenWithPrefix}`, {
        method: 'GET',
        headers: {},
      })
    )
      .then(checkStatus)
      .then(response => response.json())
      .then(json => {
        if (json.code !== 0) {
          return Promise.reject(json.message);
        }
        return json.data;
      });
  }
}
```

由此，我们就能很方便地通过切换 connector 来切换我们是连接到内网架设的测试服务器还是连接到外网的生产服务器上，而不影响 Model、Schema 里的逻辑 （当然事实上还是会影响的，因为你连到测试服务器上就是为了更新代码适配最新的业务）

## 总结

由此我们在客户端建立了一个轻量的 GraphQL 服务器，作为我们与后台的中介。根据生产过程中的测试，这对于性能并没有可见的影响，好的缓存逻辑甚至能加速页面的加载。  
使用了这项技术后，数据的获取不是写在 `componentWillMount()` 里，不是深藏在 Redux 的 Reducer 里，不是隐居在 redux-saga 的生成器里，而是切切实实地深入基层，就在我们的 UI 旁，爱屋及乌，一石二鸟，所见即所得，腰柔易推倒。

而这种 client-side-graphql-server 的做法也很适合控制 IOT 设备，毕竟在 IOT 设备中架设 server-side-graphql-server 是不现实的，而用 RESTful API 去写物联网控制会显得较为臃肿，在客户端将这些数据转变为 GraphQL 是一条可行的道路。

对内容有任何疑问，可以加 China GraphQL User Group 群 302490951 交流。比如有同志看我以前写了篇 Relay 的教程就问我 Relay 好不好用，我都知无不言：「难用啊，所以现在我改用 ApolloStack 了」

## 参考及思路讨论

[Wrapping a REST API in GraphQL apollo-client issue #379](https://github.com/apollostack/apollo-client/issues/379)
