import {
  ApolloLink,
  Observable as LinkObservable,
  FetchResult,
  Operation,
  NextLink,
} from 'apollo-link';
import { Observable, from, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

export type TransformFn<T> = (operation: Observable<T>) => Observable<T>;

export type OnOperation = TransformFn<Operation>;
export type OnResult = TransformFn<FetchResult>;
export interface Transforms {
  onOperation?: OnOperation;
  onResult?: OnResult;
}

export class RxjsLink extends ApolloLink {
  private onResult: OnResult;
  private onOperation: OnOperation;

  constructor(transforms: Transforms) {
    super();

    this.onOperation = transforms.onOperation
      ? transforms.onOperation
      : this.noop;
    this.onResult = transforms.onResult ? transforms.onResult : this.noop;
  }

  public request(
    operation: Operation,
    forward: NextLink,
  ): LinkObservable<FetchResult> {
    const operation$ = this.onOperation(of(operation));
    const result$ = this.onResult(
      operation$.pipe(mergeMap(op => from(forward(op)))),
    );

    return new LinkObservable(observer => {
      const sub = result$.subscribe(observer);

      return () => {
        if (!sub.closed) {
          sub.unsubscribe();
        }
      };
    });
  }

  private noop<T = any>(source: Observable<T>): Observable<T> {
    return source;
  }
}

export function rxjs(transforms: Transforms): RxjsLink {
  return new RxjsLink(transforms);
}
