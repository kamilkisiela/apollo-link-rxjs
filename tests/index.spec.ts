import {
  ApolloLink,
  execute,
  Observable as LinkObservable,
  Operation,
} from 'apollo-link';
import { retry, tap } from 'rxjs/operators';
import gql from 'graphql-tag';

import { rxjs } from '../src/index';

test('should be able to retry', (done: jest.DoneCallback) => {
  let count = 0;

  const mockLink = new ApolloLink(() => {
    return new LinkObservable(observer => {
      setTimeout(() => {
        count++;

        if (count < 3) {
          observer.error(new Error('failed'));
        } else {
          count = 0;
          observer.next({
            data: {
              test: {
                succeed: true,
              },
            },
          });
        }

        observer.complete();
      });
    });
  });

  const rxjsLink = rxjs({
    onResult: result$ => result$.pipe(retry(2)),
  });

  const link = ApolloLink.from([rxjsLink, mockLink]);

  execute(link, {
    query: gql`
      query test {
        test {
          succeed
        }
      }
    `,
  }).subscribe({
    next: result => {
      expect(result).toEqual({
        data: {
          test: {
            succeed: true,
          },
        },
      });
      done();
    },
    error: error => {
      done.fail(error);
    },
  });
});

test('should be able to setContext', (done: jest.DoneCallback) => {
  const mockLink = new ApolloLink((operation: Operation) => {
    return new LinkObservable(observer => {
      const ctx = operation.getContext();

      setTimeout(() => {
        observer.next({
          data: {
            test: {
              succeed: ctx.succeed || false,
            },
          },
        });
      });
    });
  });

  const rxjsLink = rxjs({
    onOperation: operation$ =>
      operation$.pipe(
        tap(op =>
          op.setContext({
            succeed: true,
          }),
        ),
      ),
  });

  const link = ApolloLink.from([rxjsLink, mockLink]);

  execute(link, {
    query: gql`
      query test {
        test {
          succeed
        }
      }
    `,
  }).subscribe({
    next: result => {
      expect(result).toEqual({
        data: {
          test: {
            succeed: true,
          },
        },
      });
      done();
    },
    error: error => {
      done.fail(error);
    },
  });
});
