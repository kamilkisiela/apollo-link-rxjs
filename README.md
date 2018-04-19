# RxJS with ApolloLink

## Purpose

To use goods of RxJS in Apollo ecosystem

## Installation

```
yarn add apollo-link-rxjs
npm install --save apollo-link-rxjs
```

## Usage

The link accepts two options:

* `onResult`
* `onOperation`

Both are functions, that gets an `Observable` as an argument and returns an `Observable`.

The `onResult` transforms `FetchResult` (of ApolloLink) - the result of terminating link (links like HttpLink).
The `onOperation` transforms `Operation` (of ApolloLink)

```ts
import { execute, ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { rxjs } from 'apollo-link-rxjs';
// or RxjsLink and new RxjsLink(sameOptionsAsRxjs)
import { retry, tap } from 'rxjs/operators';
import gql from 'graphql-tag';

const operation = {
  query: gql`
    query hello {
      hello
    }
  `,
};

// regular Apollo link
const httpLink = new HttpLink({ uri: '/graphql' });

// RxJS !1one
const rxjsLink = rxjs({
  onResult(obs => obs.pipe(
    retry(3),
  )),
  onOperation(obs => obs.pipe(
    tap(operation => operation.setContext({
      includeExtensions: true
    }))
  ))
});

const link = ApolloLink.from([rxjsLink, httpLink]);

execute(link, operation).subscribe({
  next: result => {
    // calling the graphql endpoint less then 3 times succeed
    console.log(result);
  },
  error: error => {
    // calling the graphql endpoint 3 times failed
    console.log(error);
  }
});
```

> NOTE: Right now it's more like a Proof of Concept than the actual implementation
