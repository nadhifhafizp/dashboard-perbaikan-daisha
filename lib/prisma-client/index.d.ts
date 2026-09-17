
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model MasterDaisha
 * 
 */
export type MasterDaisha = $Result.DefaultSelection<Prisma.$MasterDaishaPayload>
/**
 * Model Ticket
 * 
 */
export type Ticket = $Result.DefaultSelection<Prisma.$TicketPayload>
/**
 * Model TicketDetail
 * 
 */
export type TicketDetail = $Result.DefaultSelection<Prisma.$TicketDetailPayload>
/**
 * Model DaishaType
 * 
 */
export type DaishaType = $Result.DefaultSelection<Prisma.$DaishaTypePayload>
/**
 * Model DaishaComponent
 * 
 */
export type DaishaComponent = $Result.DefaultSelection<Prisma.$DaishaComponentPayload>
/**
 * Model DaishaSymptom
 * 
 */
export type DaishaSymptom = $Result.DefaultSelection<Prisma.$DaishaSymptomPayload>
/**
 * Model SectionRequest
 * 
 */
export type SectionRequest = $Result.DefaultSelection<Prisma.$SectionRequestPayload>
/**
 * Model SectionRequestMaterial
 * 
 */
export type SectionRequestMaterial = $Result.DefaultSelection<Prisma.$SectionRequestMaterialPayload>
/**
 * Model Sparepart
 * 
 */
export type Sparepart = $Result.DefaultSelection<Prisma.$SparepartPayload>
/**
 * Model SparepartLog
 * 
 */
export type SparepartLog = $Result.DefaultSelection<Prisma.$SparepartLogPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more MasterDaishas
 * const masterDaishas = await prisma.masterDaisha.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more MasterDaishas
   * const masterDaishas = await prisma.masterDaisha.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.masterDaisha`: Exposes CRUD operations for the **MasterDaisha** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MasterDaishas
    * const masterDaishas = await prisma.masterDaisha.findMany()
    * ```
    */
  get masterDaisha(): Prisma.MasterDaishaDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ticket`: Exposes CRUD operations for the **Ticket** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tickets
    * const tickets = await prisma.ticket.findMany()
    * ```
    */
  get ticket(): Prisma.TicketDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ticketDetail`: Exposes CRUD operations for the **TicketDetail** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TicketDetails
    * const ticketDetails = await prisma.ticketDetail.findMany()
    * ```
    */
  get ticketDetail(): Prisma.TicketDetailDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.daishaType`: Exposes CRUD operations for the **DaishaType** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DaishaTypes
    * const daishaTypes = await prisma.daishaType.findMany()
    * ```
    */
  get daishaType(): Prisma.DaishaTypeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.daishaComponent`: Exposes CRUD operations for the **DaishaComponent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DaishaComponents
    * const daishaComponents = await prisma.daishaComponent.findMany()
    * ```
    */
  get daishaComponent(): Prisma.DaishaComponentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.daishaSymptom`: Exposes CRUD operations for the **DaishaSymptom** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DaishaSymptoms
    * const daishaSymptoms = await prisma.daishaSymptom.findMany()
    * ```
    */
  get daishaSymptom(): Prisma.DaishaSymptomDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sectionRequest`: Exposes CRUD operations for the **SectionRequest** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SectionRequests
    * const sectionRequests = await prisma.sectionRequest.findMany()
    * ```
    */
  get sectionRequest(): Prisma.SectionRequestDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sectionRequestMaterial`: Exposes CRUD operations for the **SectionRequestMaterial** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SectionRequestMaterials
    * const sectionRequestMaterials = await prisma.sectionRequestMaterial.findMany()
    * ```
    */
  get sectionRequestMaterial(): Prisma.SectionRequestMaterialDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sparepart`: Exposes CRUD operations for the **Sparepart** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Spareparts
    * const spareparts = await prisma.sparepart.findMany()
    * ```
    */
  get sparepart(): Prisma.SparepartDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sparepartLog`: Exposes CRUD operations for the **SparepartLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SparepartLogs
    * const sparepartLogs = await prisma.sparepartLog.findMany()
    * ```
    */
  get sparepartLog(): Prisma.SparepartLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    MasterDaisha: 'MasterDaisha',
    Ticket: 'Ticket',
    TicketDetail: 'TicketDetail',
    DaishaType: 'DaishaType',
    DaishaComponent: 'DaishaComponent',
    DaishaSymptom: 'DaishaSymptom',
    SectionRequest: 'SectionRequest',
    SectionRequestMaterial: 'SectionRequestMaterial',
    Sparepart: 'Sparepart',
    SparepartLog: 'SparepartLog',
    User: 'User'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "masterDaisha" | "ticket" | "ticketDetail" | "daishaType" | "daishaComponent" | "daishaSymptom" | "sectionRequest" | "sectionRequestMaterial" | "sparepart" | "sparepartLog" | "user"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      MasterDaisha: {
        payload: Prisma.$MasterDaishaPayload<ExtArgs>
        fields: Prisma.MasterDaishaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MasterDaishaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterDaishaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MasterDaishaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterDaishaPayload>
          }
          findFirst: {
            args: Prisma.MasterDaishaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterDaishaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MasterDaishaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterDaishaPayload>
          }
          findMany: {
            args: Prisma.MasterDaishaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterDaishaPayload>[]
          }
          create: {
            args: Prisma.MasterDaishaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterDaishaPayload>
          }
          createMany: {
            args: Prisma.MasterDaishaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MasterDaishaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterDaishaPayload>[]
          }
          delete: {
            args: Prisma.MasterDaishaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterDaishaPayload>
          }
          update: {
            args: Prisma.MasterDaishaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterDaishaPayload>
          }
          deleteMany: {
            args: Prisma.MasterDaishaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MasterDaishaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MasterDaishaUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterDaishaPayload>[]
          }
          upsert: {
            args: Prisma.MasterDaishaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterDaishaPayload>
          }
          aggregate: {
            args: Prisma.MasterDaishaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMasterDaisha>
          }
          groupBy: {
            args: Prisma.MasterDaishaGroupByArgs<ExtArgs>
            result: $Utils.Optional<MasterDaishaGroupByOutputType>[]
          }
          count: {
            args: Prisma.MasterDaishaCountArgs<ExtArgs>
            result: $Utils.Optional<MasterDaishaCountAggregateOutputType> | number
          }
        }
      }
      Ticket: {
        payload: Prisma.$TicketPayload<ExtArgs>
        fields: Prisma.TicketFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TicketFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TicketFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>
          }
          findFirst: {
            args: Prisma.TicketFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TicketFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>
          }
          findMany: {
            args: Prisma.TicketFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>[]
          }
          create: {
            args: Prisma.TicketCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>
          }
          createMany: {
            args: Prisma.TicketCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TicketCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>[]
          }
          delete: {
            args: Prisma.TicketDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>
          }
          update: {
            args: Prisma.TicketUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>
          }
          deleteMany: {
            args: Prisma.TicketDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TicketUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TicketUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>[]
          }
          upsert: {
            args: Prisma.TicketUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>
          }
          aggregate: {
            args: Prisma.TicketAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTicket>
          }
          groupBy: {
            args: Prisma.TicketGroupByArgs<ExtArgs>
            result: $Utils.Optional<TicketGroupByOutputType>[]
          }
          count: {
            args: Prisma.TicketCountArgs<ExtArgs>
            result: $Utils.Optional<TicketCountAggregateOutputType> | number
          }
        }
      }
      TicketDetail: {
        payload: Prisma.$TicketDetailPayload<ExtArgs>
        fields: Prisma.TicketDetailFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TicketDetailFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketDetailPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TicketDetailFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketDetailPayload>
          }
          findFirst: {
            args: Prisma.TicketDetailFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketDetailPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TicketDetailFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketDetailPayload>
          }
          findMany: {
            args: Prisma.TicketDetailFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketDetailPayload>[]
          }
          create: {
            args: Prisma.TicketDetailCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketDetailPayload>
          }
          createMany: {
            args: Prisma.TicketDetailCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TicketDetailCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketDetailPayload>[]
          }
          delete: {
            args: Prisma.TicketDetailDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketDetailPayload>
          }
          update: {
            args: Prisma.TicketDetailUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketDetailPayload>
          }
          deleteMany: {
            args: Prisma.TicketDetailDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TicketDetailUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TicketDetailUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketDetailPayload>[]
          }
          upsert: {
            args: Prisma.TicketDetailUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketDetailPayload>
          }
          aggregate: {
            args: Prisma.TicketDetailAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTicketDetail>
          }
          groupBy: {
            args: Prisma.TicketDetailGroupByArgs<ExtArgs>
            result: $Utils.Optional<TicketDetailGroupByOutputType>[]
          }
          count: {
            args: Prisma.TicketDetailCountArgs<ExtArgs>
            result: $Utils.Optional<TicketDetailCountAggregateOutputType> | number
          }
        }
      }
      DaishaType: {
        payload: Prisma.$DaishaTypePayload<ExtArgs>
        fields: Prisma.DaishaTypeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DaishaTypeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaTypePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DaishaTypeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaTypePayload>
          }
          findFirst: {
            args: Prisma.DaishaTypeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaTypePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DaishaTypeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaTypePayload>
          }
          findMany: {
            args: Prisma.DaishaTypeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaTypePayload>[]
          }
          create: {
            args: Prisma.DaishaTypeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaTypePayload>
          }
          createMany: {
            args: Prisma.DaishaTypeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DaishaTypeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaTypePayload>[]
          }
          delete: {
            args: Prisma.DaishaTypeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaTypePayload>
          }
          update: {
            args: Prisma.DaishaTypeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaTypePayload>
          }
          deleteMany: {
            args: Prisma.DaishaTypeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DaishaTypeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DaishaTypeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaTypePayload>[]
          }
          upsert: {
            args: Prisma.DaishaTypeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaTypePayload>
          }
          aggregate: {
            args: Prisma.DaishaTypeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDaishaType>
          }
          groupBy: {
            args: Prisma.DaishaTypeGroupByArgs<ExtArgs>
            result: $Utils.Optional<DaishaTypeGroupByOutputType>[]
          }
          count: {
            args: Prisma.DaishaTypeCountArgs<ExtArgs>
            result: $Utils.Optional<DaishaTypeCountAggregateOutputType> | number
          }
        }
      }
      DaishaComponent: {
        payload: Prisma.$DaishaComponentPayload<ExtArgs>
        fields: Prisma.DaishaComponentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DaishaComponentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaComponentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DaishaComponentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaComponentPayload>
          }
          findFirst: {
            args: Prisma.DaishaComponentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaComponentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DaishaComponentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaComponentPayload>
          }
          findMany: {
            args: Prisma.DaishaComponentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaComponentPayload>[]
          }
          create: {
            args: Prisma.DaishaComponentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaComponentPayload>
          }
          createMany: {
            args: Prisma.DaishaComponentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DaishaComponentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaComponentPayload>[]
          }
          delete: {
            args: Prisma.DaishaComponentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaComponentPayload>
          }
          update: {
            args: Prisma.DaishaComponentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaComponentPayload>
          }
          deleteMany: {
            args: Prisma.DaishaComponentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DaishaComponentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DaishaComponentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaComponentPayload>[]
          }
          upsert: {
            args: Prisma.DaishaComponentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaComponentPayload>
          }
          aggregate: {
            args: Prisma.DaishaComponentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDaishaComponent>
          }
          groupBy: {
            args: Prisma.DaishaComponentGroupByArgs<ExtArgs>
            result: $Utils.Optional<DaishaComponentGroupByOutputType>[]
          }
          count: {
            args: Prisma.DaishaComponentCountArgs<ExtArgs>
            result: $Utils.Optional<DaishaComponentCountAggregateOutputType> | number
          }
        }
      }
      DaishaSymptom: {
        payload: Prisma.$DaishaSymptomPayload<ExtArgs>
        fields: Prisma.DaishaSymptomFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DaishaSymptomFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaSymptomPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DaishaSymptomFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaSymptomPayload>
          }
          findFirst: {
            args: Prisma.DaishaSymptomFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaSymptomPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DaishaSymptomFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaSymptomPayload>
          }
          findMany: {
            args: Prisma.DaishaSymptomFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaSymptomPayload>[]
          }
          create: {
            args: Prisma.DaishaSymptomCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaSymptomPayload>
          }
          createMany: {
            args: Prisma.DaishaSymptomCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DaishaSymptomCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaSymptomPayload>[]
          }
          delete: {
            args: Prisma.DaishaSymptomDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaSymptomPayload>
          }
          update: {
            args: Prisma.DaishaSymptomUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaSymptomPayload>
          }
          deleteMany: {
            args: Prisma.DaishaSymptomDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DaishaSymptomUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DaishaSymptomUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaSymptomPayload>[]
          }
          upsert: {
            args: Prisma.DaishaSymptomUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DaishaSymptomPayload>
          }
          aggregate: {
            args: Prisma.DaishaSymptomAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDaishaSymptom>
          }
          groupBy: {
            args: Prisma.DaishaSymptomGroupByArgs<ExtArgs>
            result: $Utils.Optional<DaishaSymptomGroupByOutputType>[]
          }
          count: {
            args: Prisma.DaishaSymptomCountArgs<ExtArgs>
            result: $Utils.Optional<DaishaSymptomCountAggregateOutputType> | number
          }
        }
      }
      SectionRequest: {
        payload: Prisma.$SectionRequestPayload<ExtArgs>
        fields: Prisma.SectionRequestFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SectionRequestFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SectionRequestFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestPayload>
          }
          findFirst: {
            args: Prisma.SectionRequestFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SectionRequestFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestPayload>
          }
          findMany: {
            args: Prisma.SectionRequestFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestPayload>[]
          }
          create: {
            args: Prisma.SectionRequestCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestPayload>
          }
          createMany: {
            args: Prisma.SectionRequestCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SectionRequestCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestPayload>[]
          }
          delete: {
            args: Prisma.SectionRequestDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestPayload>
          }
          update: {
            args: Prisma.SectionRequestUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestPayload>
          }
          deleteMany: {
            args: Prisma.SectionRequestDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SectionRequestUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SectionRequestUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestPayload>[]
          }
          upsert: {
            args: Prisma.SectionRequestUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestPayload>
          }
          aggregate: {
            args: Prisma.SectionRequestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSectionRequest>
          }
          groupBy: {
            args: Prisma.SectionRequestGroupByArgs<ExtArgs>
            result: $Utils.Optional<SectionRequestGroupByOutputType>[]
          }
          count: {
            args: Prisma.SectionRequestCountArgs<ExtArgs>
            result: $Utils.Optional<SectionRequestCountAggregateOutputType> | number
          }
        }
      }
      SectionRequestMaterial: {
        payload: Prisma.$SectionRequestMaterialPayload<ExtArgs>
        fields: Prisma.SectionRequestMaterialFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SectionRequestMaterialFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestMaterialPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SectionRequestMaterialFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestMaterialPayload>
          }
          findFirst: {
            args: Prisma.SectionRequestMaterialFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestMaterialPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SectionRequestMaterialFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestMaterialPayload>
          }
          findMany: {
            args: Prisma.SectionRequestMaterialFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestMaterialPayload>[]
          }
          create: {
            args: Prisma.SectionRequestMaterialCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestMaterialPayload>
          }
          createMany: {
            args: Prisma.SectionRequestMaterialCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SectionRequestMaterialCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestMaterialPayload>[]
          }
          delete: {
            args: Prisma.SectionRequestMaterialDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestMaterialPayload>
          }
          update: {
            args: Prisma.SectionRequestMaterialUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestMaterialPayload>
          }
          deleteMany: {
            args: Prisma.SectionRequestMaterialDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SectionRequestMaterialUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SectionRequestMaterialUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestMaterialPayload>[]
          }
          upsert: {
            args: Prisma.SectionRequestMaterialUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionRequestMaterialPayload>
          }
          aggregate: {
            args: Prisma.SectionRequestMaterialAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSectionRequestMaterial>
          }
          groupBy: {
            args: Prisma.SectionRequestMaterialGroupByArgs<ExtArgs>
            result: $Utils.Optional<SectionRequestMaterialGroupByOutputType>[]
          }
          count: {
            args: Prisma.SectionRequestMaterialCountArgs<ExtArgs>
            result: $Utils.Optional<SectionRequestMaterialCountAggregateOutputType> | number
          }
        }
      }
      Sparepart: {
        payload: Prisma.$SparepartPayload<ExtArgs>
        fields: Prisma.SparepartFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SparepartFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SparepartFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartPayload>
          }
          findFirst: {
            args: Prisma.SparepartFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SparepartFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartPayload>
          }
          findMany: {
            args: Prisma.SparepartFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartPayload>[]
          }
          create: {
            args: Prisma.SparepartCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartPayload>
          }
          createMany: {
            args: Prisma.SparepartCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SparepartCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartPayload>[]
          }
          delete: {
            args: Prisma.SparepartDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartPayload>
          }
          update: {
            args: Prisma.SparepartUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartPayload>
          }
          deleteMany: {
            args: Prisma.SparepartDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SparepartUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SparepartUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartPayload>[]
          }
          upsert: {
            args: Prisma.SparepartUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartPayload>
          }
          aggregate: {
            args: Prisma.SparepartAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSparepart>
          }
          groupBy: {
            args: Prisma.SparepartGroupByArgs<ExtArgs>
            result: $Utils.Optional<SparepartGroupByOutputType>[]
          }
          count: {
            args: Prisma.SparepartCountArgs<ExtArgs>
            result: $Utils.Optional<SparepartCountAggregateOutputType> | number
          }
        }
      }
      SparepartLog: {
        payload: Prisma.$SparepartLogPayload<ExtArgs>
        fields: Prisma.SparepartLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SparepartLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SparepartLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartLogPayload>
          }
          findFirst: {
            args: Prisma.SparepartLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SparepartLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartLogPayload>
          }
          findMany: {
            args: Prisma.SparepartLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartLogPayload>[]
          }
          create: {
            args: Prisma.SparepartLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartLogPayload>
          }
          createMany: {
            args: Prisma.SparepartLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SparepartLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartLogPayload>[]
          }
          delete: {
            args: Prisma.SparepartLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartLogPayload>
          }
          update: {
            args: Prisma.SparepartLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartLogPayload>
          }
          deleteMany: {
            args: Prisma.SparepartLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SparepartLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SparepartLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartLogPayload>[]
          }
          upsert: {
            args: Prisma.SparepartLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparepartLogPayload>
          }
          aggregate: {
            args: Prisma.SparepartLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSparepartLog>
          }
          groupBy: {
            args: Prisma.SparepartLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<SparepartLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.SparepartLogCountArgs<ExtArgs>
            result: $Utils.Optional<SparepartLogCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    masterDaisha?: MasterDaishaOmit
    ticket?: TicketOmit
    ticketDetail?: TicketDetailOmit
    daishaType?: DaishaTypeOmit
    daishaComponent?: DaishaComponentOmit
    daishaSymptom?: DaishaSymptomOmit
    sectionRequest?: SectionRequestOmit
    sectionRequestMaterial?: SectionRequestMaterialOmit
    sparepart?: SparepartOmit
    sparepartLog?: SparepartLogOmit
    user?: UserOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type MasterDaishaCountOutputType
   */

  export type MasterDaishaCountOutputType = {
    tickets: number
  }

  export type MasterDaishaCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tickets?: boolean | MasterDaishaCountOutputTypeCountTicketsArgs
  }

  // Custom InputTypes
  /**
   * MasterDaishaCountOutputType without action
   */
  export type MasterDaishaCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterDaishaCountOutputType
     */
    select?: MasterDaishaCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MasterDaishaCountOutputType without action
   */
  export type MasterDaishaCountOutputTypeCountTicketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TicketWhereInput
  }


  /**
   * Count Type TicketCountOutputType
   */

  export type TicketCountOutputType = {
    details: number
  }

  export type TicketCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    details?: boolean | TicketCountOutputTypeCountDetailsArgs
  }

  // Custom InputTypes
  /**
   * TicketCountOutputType without action
   */
  export type TicketCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TicketCountOutputType
     */
    select?: TicketCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TicketCountOutputType without action
   */
  export type TicketCountOutputTypeCountDetailsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TicketDetailWhereInput
  }


  /**
   * Count Type DaishaTypeCountOutputType
   */

  export type DaishaTypeCountOutputType = {
    components: number
  }

  export type DaishaTypeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    components?: boolean | DaishaTypeCountOutputTypeCountComponentsArgs
  }

  // Custom InputTypes
  /**
   * DaishaTypeCountOutputType without action
   */
  export type DaishaTypeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaTypeCountOutputType
     */
    select?: DaishaTypeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DaishaTypeCountOutputType without action
   */
  export type DaishaTypeCountOutputTypeCountComponentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DaishaComponentWhereInput
  }


  /**
   * Count Type DaishaComponentCountOutputType
   */

  export type DaishaComponentCountOutputType = {
    symptoms: number
  }

  export type DaishaComponentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    symptoms?: boolean | DaishaComponentCountOutputTypeCountSymptomsArgs
  }

  // Custom InputTypes
  /**
   * DaishaComponentCountOutputType without action
   */
  export type DaishaComponentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaComponentCountOutputType
     */
    select?: DaishaComponentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DaishaComponentCountOutputType without action
   */
  export type DaishaComponentCountOutputTypeCountSymptomsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DaishaSymptomWhereInput
  }


  /**
   * Count Type SectionRequestCountOutputType
   */

  export type SectionRequestCountOutputType = {
    materials: number
  }

  export type SectionRequestCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    materials?: boolean | SectionRequestCountOutputTypeCountMaterialsArgs
  }

  // Custom InputTypes
  /**
   * SectionRequestCountOutputType without action
   */
  export type SectionRequestCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequestCountOutputType
     */
    select?: SectionRequestCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SectionRequestCountOutputType without action
   */
  export type SectionRequestCountOutputTypeCountMaterialsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SectionRequestMaterialWhereInput
  }


  /**
   * Count Type SparepartCountOutputType
   */

  export type SparepartCountOutputType = {
    logs: number
    requestMaterials: number
  }

  export type SparepartCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    logs?: boolean | SparepartCountOutputTypeCountLogsArgs
    requestMaterials?: boolean | SparepartCountOutputTypeCountRequestMaterialsArgs
  }

  // Custom InputTypes
  /**
   * SparepartCountOutputType without action
   */
  export type SparepartCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparepartCountOutputType
     */
    select?: SparepartCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SparepartCountOutputType without action
   */
  export type SparepartCountOutputTypeCountLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SparepartLogWhereInput
  }

  /**
   * SparepartCountOutputType without action
   */
  export type SparepartCountOutputTypeCountRequestMaterialsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SectionRequestMaterialWhereInput
  }


  /**
   * Models
   */

  /**
   * Model MasterDaisha
   */

  export type AggregateMasterDaisha = {
    _count: MasterDaishaCountAggregateOutputType | null
    _min: MasterDaishaMinAggregateOutputType | null
    _max: MasterDaishaMaxAggregateOutputType | null
  }

  export type MasterDaishaMinAggregateOutputType = {
    noDaisha: string | null
    namaDaisha: string | null
    ukuran: string | null
    seksi: string | null
  }

  export type MasterDaishaMaxAggregateOutputType = {
    noDaisha: string | null
    namaDaisha: string | null
    ukuran: string | null
    seksi: string | null
  }

  export type MasterDaishaCountAggregateOutputType = {
    noDaisha: number
    namaDaisha: number
    ukuran: number
    seksi: number
    _all: number
  }


  export type MasterDaishaMinAggregateInputType = {
    noDaisha?: true
    namaDaisha?: true
    ukuran?: true
    seksi?: true
  }

  export type MasterDaishaMaxAggregateInputType = {
    noDaisha?: true
    namaDaisha?: true
    ukuran?: true
    seksi?: true
  }

  export type MasterDaishaCountAggregateInputType = {
    noDaisha?: true
    namaDaisha?: true
    ukuran?: true
    seksi?: true
    _all?: true
  }

  export type MasterDaishaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MasterDaisha to aggregate.
     */
    where?: MasterDaishaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MasterDaishas to fetch.
     */
    orderBy?: MasterDaishaOrderByWithRelationInput | MasterDaishaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MasterDaishaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MasterDaishas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MasterDaishas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MasterDaishas
    **/
    _count?: true | MasterDaishaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MasterDaishaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MasterDaishaMaxAggregateInputType
  }

  export type GetMasterDaishaAggregateType<T extends MasterDaishaAggregateArgs> = {
        [P in keyof T & keyof AggregateMasterDaisha]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMasterDaisha[P]>
      : GetScalarType<T[P], AggregateMasterDaisha[P]>
  }




  export type MasterDaishaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MasterDaishaWhereInput
    orderBy?: MasterDaishaOrderByWithAggregationInput | MasterDaishaOrderByWithAggregationInput[]
    by: MasterDaishaScalarFieldEnum[] | MasterDaishaScalarFieldEnum
    having?: MasterDaishaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MasterDaishaCountAggregateInputType | true
    _min?: MasterDaishaMinAggregateInputType
    _max?: MasterDaishaMaxAggregateInputType
  }

  export type MasterDaishaGroupByOutputType = {
    noDaisha: string
    namaDaisha: string
    ukuran: string
    seksi: string
    _count: MasterDaishaCountAggregateOutputType | null
    _min: MasterDaishaMinAggregateOutputType | null
    _max: MasterDaishaMaxAggregateOutputType | null
  }

  type GetMasterDaishaGroupByPayload<T extends MasterDaishaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MasterDaishaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MasterDaishaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MasterDaishaGroupByOutputType[P]>
            : GetScalarType<T[P], MasterDaishaGroupByOutputType[P]>
        }
      >
    >


  export type MasterDaishaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    noDaisha?: boolean
    namaDaisha?: boolean
    ukuran?: boolean
    seksi?: boolean
    tickets?: boolean | MasterDaisha$ticketsArgs<ExtArgs>
    _count?: boolean | MasterDaishaCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["masterDaisha"]>

  export type MasterDaishaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    noDaisha?: boolean
    namaDaisha?: boolean
    ukuran?: boolean
    seksi?: boolean
  }, ExtArgs["result"]["masterDaisha"]>

  export type MasterDaishaSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    noDaisha?: boolean
    namaDaisha?: boolean
    ukuran?: boolean
    seksi?: boolean
  }, ExtArgs["result"]["masterDaisha"]>

  export type MasterDaishaSelectScalar = {
    noDaisha?: boolean
    namaDaisha?: boolean
    ukuran?: boolean
    seksi?: boolean
  }

  export type MasterDaishaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"noDaisha" | "namaDaisha" | "ukuran" | "seksi", ExtArgs["result"]["masterDaisha"]>
  export type MasterDaishaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tickets?: boolean | MasterDaisha$ticketsArgs<ExtArgs>
    _count?: boolean | MasterDaishaCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MasterDaishaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type MasterDaishaIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $MasterDaishaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MasterDaisha"
    objects: {
      tickets: Prisma.$TicketPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      noDaisha: string
      namaDaisha: string
      ukuran: string
      seksi: string
    }, ExtArgs["result"]["masterDaisha"]>
    composites: {}
  }

  type MasterDaishaGetPayload<S extends boolean | null | undefined | MasterDaishaDefaultArgs> = $Result.GetResult<Prisma.$MasterDaishaPayload, S>

  type MasterDaishaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MasterDaishaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MasterDaishaCountAggregateInputType | true
    }

  export interface MasterDaishaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MasterDaisha'], meta: { name: 'MasterDaisha' } }
    /**
     * Find zero or one MasterDaisha that matches the filter.
     * @param {MasterDaishaFindUniqueArgs} args - Arguments to find a MasterDaisha
     * @example
     * // Get one MasterDaisha
     * const masterDaisha = await prisma.masterDaisha.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MasterDaishaFindUniqueArgs>(args: SelectSubset<T, MasterDaishaFindUniqueArgs<ExtArgs>>): Prisma__MasterDaishaClient<$Result.GetResult<Prisma.$MasterDaishaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MasterDaisha that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MasterDaishaFindUniqueOrThrowArgs} args - Arguments to find a MasterDaisha
     * @example
     * // Get one MasterDaisha
     * const masterDaisha = await prisma.masterDaisha.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MasterDaishaFindUniqueOrThrowArgs>(args: SelectSubset<T, MasterDaishaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MasterDaishaClient<$Result.GetResult<Prisma.$MasterDaishaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MasterDaisha that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterDaishaFindFirstArgs} args - Arguments to find a MasterDaisha
     * @example
     * // Get one MasterDaisha
     * const masterDaisha = await prisma.masterDaisha.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MasterDaishaFindFirstArgs>(args?: SelectSubset<T, MasterDaishaFindFirstArgs<ExtArgs>>): Prisma__MasterDaishaClient<$Result.GetResult<Prisma.$MasterDaishaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MasterDaisha that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterDaishaFindFirstOrThrowArgs} args - Arguments to find a MasterDaisha
     * @example
     * // Get one MasterDaisha
     * const masterDaisha = await prisma.masterDaisha.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MasterDaishaFindFirstOrThrowArgs>(args?: SelectSubset<T, MasterDaishaFindFirstOrThrowArgs<ExtArgs>>): Prisma__MasterDaishaClient<$Result.GetResult<Prisma.$MasterDaishaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MasterDaishas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterDaishaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MasterDaishas
     * const masterDaishas = await prisma.masterDaisha.findMany()
     * 
     * // Get first 10 MasterDaishas
     * const masterDaishas = await prisma.masterDaisha.findMany({ take: 10 })
     * 
     * // Only select the `noDaisha`
     * const masterDaishaWithNoDaishaOnly = await prisma.masterDaisha.findMany({ select: { noDaisha: true } })
     * 
     */
    findMany<T extends MasterDaishaFindManyArgs>(args?: SelectSubset<T, MasterDaishaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MasterDaishaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MasterDaisha.
     * @param {MasterDaishaCreateArgs} args - Arguments to create a MasterDaisha.
     * @example
     * // Create one MasterDaisha
     * const MasterDaisha = await prisma.masterDaisha.create({
     *   data: {
     *     // ... data to create a MasterDaisha
     *   }
     * })
     * 
     */
    create<T extends MasterDaishaCreateArgs>(args: SelectSubset<T, MasterDaishaCreateArgs<ExtArgs>>): Prisma__MasterDaishaClient<$Result.GetResult<Prisma.$MasterDaishaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MasterDaishas.
     * @param {MasterDaishaCreateManyArgs} args - Arguments to create many MasterDaishas.
     * @example
     * // Create many MasterDaishas
     * const masterDaisha = await prisma.masterDaisha.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MasterDaishaCreateManyArgs>(args?: SelectSubset<T, MasterDaishaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MasterDaishas and returns the data saved in the database.
     * @param {MasterDaishaCreateManyAndReturnArgs} args - Arguments to create many MasterDaishas.
     * @example
     * // Create many MasterDaishas
     * const masterDaisha = await prisma.masterDaisha.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MasterDaishas and only return the `noDaisha`
     * const masterDaishaWithNoDaishaOnly = await prisma.masterDaisha.createManyAndReturn({
     *   select: { noDaisha: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MasterDaishaCreateManyAndReturnArgs>(args?: SelectSubset<T, MasterDaishaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MasterDaishaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MasterDaisha.
     * @param {MasterDaishaDeleteArgs} args - Arguments to delete one MasterDaisha.
     * @example
     * // Delete one MasterDaisha
     * const MasterDaisha = await prisma.masterDaisha.delete({
     *   where: {
     *     // ... filter to delete one MasterDaisha
     *   }
     * })
     * 
     */
    delete<T extends MasterDaishaDeleteArgs>(args: SelectSubset<T, MasterDaishaDeleteArgs<ExtArgs>>): Prisma__MasterDaishaClient<$Result.GetResult<Prisma.$MasterDaishaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MasterDaisha.
     * @param {MasterDaishaUpdateArgs} args - Arguments to update one MasterDaisha.
     * @example
     * // Update one MasterDaisha
     * const masterDaisha = await prisma.masterDaisha.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MasterDaishaUpdateArgs>(args: SelectSubset<T, MasterDaishaUpdateArgs<ExtArgs>>): Prisma__MasterDaishaClient<$Result.GetResult<Prisma.$MasterDaishaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MasterDaishas.
     * @param {MasterDaishaDeleteManyArgs} args - Arguments to filter MasterDaishas to delete.
     * @example
     * // Delete a few MasterDaishas
     * const { count } = await prisma.masterDaisha.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MasterDaishaDeleteManyArgs>(args?: SelectSubset<T, MasterDaishaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MasterDaishas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterDaishaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MasterDaishas
     * const masterDaisha = await prisma.masterDaisha.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MasterDaishaUpdateManyArgs>(args: SelectSubset<T, MasterDaishaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MasterDaishas and returns the data updated in the database.
     * @param {MasterDaishaUpdateManyAndReturnArgs} args - Arguments to update many MasterDaishas.
     * @example
     * // Update many MasterDaishas
     * const masterDaisha = await prisma.masterDaisha.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MasterDaishas and only return the `noDaisha`
     * const masterDaishaWithNoDaishaOnly = await prisma.masterDaisha.updateManyAndReturn({
     *   select: { noDaisha: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MasterDaishaUpdateManyAndReturnArgs>(args: SelectSubset<T, MasterDaishaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MasterDaishaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MasterDaisha.
     * @param {MasterDaishaUpsertArgs} args - Arguments to update or create a MasterDaisha.
     * @example
     * // Update or create a MasterDaisha
     * const masterDaisha = await prisma.masterDaisha.upsert({
     *   create: {
     *     // ... data to create a MasterDaisha
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MasterDaisha we want to update
     *   }
     * })
     */
    upsert<T extends MasterDaishaUpsertArgs>(args: SelectSubset<T, MasterDaishaUpsertArgs<ExtArgs>>): Prisma__MasterDaishaClient<$Result.GetResult<Prisma.$MasterDaishaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MasterDaishas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterDaishaCountArgs} args - Arguments to filter MasterDaishas to count.
     * @example
     * // Count the number of MasterDaishas
     * const count = await prisma.masterDaisha.count({
     *   where: {
     *     // ... the filter for the MasterDaishas we want to count
     *   }
     * })
    **/
    count<T extends MasterDaishaCountArgs>(
      args?: Subset<T, MasterDaishaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MasterDaishaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MasterDaisha.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterDaishaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MasterDaishaAggregateArgs>(args: Subset<T, MasterDaishaAggregateArgs>): Prisma.PrismaPromise<GetMasterDaishaAggregateType<T>>

    /**
     * Group by MasterDaisha.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterDaishaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MasterDaishaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MasterDaishaGroupByArgs['orderBy'] }
        : { orderBy?: MasterDaishaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MasterDaishaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMasterDaishaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MasterDaisha model
   */
  readonly fields: MasterDaishaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MasterDaisha.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MasterDaishaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tickets<T extends MasterDaisha$ticketsArgs<ExtArgs> = {}>(args?: Subset<T, MasterDaisha$ticketsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MasterDaisha model
   */
  interface MasterDaishaFieldRefs {
    readonly noDaisha: FieldRef<"MasterDaisha", 'String'>
    readonly namaDaisha: FieldRef<"MasterDaisha", 'String'>
    readonly ukuran: FieldRef<"MasterDaisha", 'String'>
    readonly seksi: FieldRef<"MasterDaisha", 'String'>
  }
    

  // Custom InputTypes
  /**
   * MasterDaisha findUnique
   */
  export type MasterDaishaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterDaisha
     */
    select?: MasterDaishaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterDaisha
     */
    omit?: MasterDaishaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterDaishaInclude<ExtArgs> | null
    /**
     * Filter, which MasterDaisha to fetch.
     */
    where: MasterDaishaWhereUniqueInput
  }

  /**
   * MasterDaisha findUniqueOrThrow
   */
  export type MasterDaishaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterDaisha
     */
    select?: MasterDaishaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterDaisha
     */
    omit?: MasterDaishaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterDaishaInclude<ExtArgs> | null
    /**
     * Filter, which MasterDaisha to fetch.
     */
    where: MasterDaishaWhereUniqueInput
  }

  /**
   * MasterDaisha findFirst
   */
  export type MasterDaishaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterDaisha
     */
    select?: MasterDaishaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterDaisha
     */
    omit?: MasterDaishaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterDaishaInclude<ExtArgs> | null
    /**
     * Filter, which MasterDaisha to fetch.
     */
    where?: MasterDaishaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MasterDaishas to fetch.
     */
    orderBy?: MasterDaishaOrderByWithRelationInput | MasterDaishaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MasterDaishas.
     */
    cursor?: MasterDaishaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MasterDaishas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MasterDaishas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MasterDaishas.
     */
    distinct?: MasterDaishaScalarFieldEnum | MasterDaishaScalarFieldEnum[]
  }

  /**
   * MasterDaisha findFirstOrThrow
   */
  export type MasterDaishaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterDaisha
     */
    select?: MasterDaishaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterDaisha
     */
    omit?: MasterDaishaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterDaishaInclude<ExtArgs> | null
    /**
     * Filter, which MasterDaisha to fetch.
     */
    where?: MasterDaishaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MasterDaishas to fetch.
     */
    orderBy?: MasterDaishaOrderByWithRelationInput | MasterDaishaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MasterDaishas.
     */
    cursor?: MasterDaishaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MasterDaishas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MasterDaishas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MasterDaishas.
     */
    distinct?: MasterDaishaScalarFieldEnum | MasterDaishaScalarFieldEnum[]
  }

  /**
   * MasterDaisha findMany
   */
  export type MasterDaishaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterDaisha
     */
    select?: MasterDaishaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterDaisha
     */
    omit?: MasterDaishaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterDaishaInclude<ExtArgs> | null
    /**
     * Filter, which MasterDaishas to fetch.
     */
    where?: MasterDaishaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MasterDaishas to fetch.
     */
    orderBy?: MasterDaishaOrderByWithRelationInput | MasterDaishaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MasterDaishas.
     */
    cursor?: MasterDaishaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MasterDaishas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MasterDaishas.
     */
    skip?: number
    distinct?: MasterDaishaScalarFieldEnum | MasterDaishaScalarFieldEnum[]
  }

  /**
   * MasterDaisha create
   */
  export type MasterDaishaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterDaisha
     */
    select?: MasterDaishaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterDaisha
     */
    omit?: MasterDaishaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterDaishaInclude<ExtArgs> | null
    /**
     * The data needed to create a MasterDaisha.
     */
    data: XOR<MasterDaishaCreateInput, MasterDaishaUncheckedCreateInput>
  }

  /**
   * MasterDaisha createMany
   */
  export type MasterDaishaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MasterDaishas.
     */
    data: MasterDaishaCreateManyInput | MasterDaishaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MasterDaisha createManyAndReturn
   */
  export type MasterDaishaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterDaisha
     */
    select?: MasterDaishaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MasterDaisha
     */
    omit?: MasterDaishaOmit<ExtArgs> | null
    /**
     * The data used to create many MasterDaishas.
     */
    data: MasterDaishaCreateManyInput | MasterDaishaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MasterDaisha update
   */
  export type MasterDaishaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterDaisha
     */
    select?: MasterDaishaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterDaisha
     */
    omit?: MasterDaishaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterDaishaInclude<ExtArgs> | null
    /**
     * The data needed to update a MasterDaisha.
     */
    data: XOR<MasterDaishaUpdateInput, MasterDaishaUncheckedUpdateInput>
    /**
     * Choose, which MasterDaisha to update.
     */
    where: MasterDaishaWhereUniqueInput
  }

  /**
   * MasterDaisha updateMany
   */
  export type MasterDaishaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MasterDaishas.
     */
    data: XOR<MasterDaishaUpdateManyMutationInput, MasterDaishaUncheckedUpdateManyInput>
    /**
     * Filter which MasterDaishas to update
     */
    where?: MasterDaishaWhereInput
    /**
     * Limit how many MasterDaishas to update.
     */
    limit?: number
  }

  /**
   * MasterDaisha updateManyAndReturn
   */
  export type MasterDaishaUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterDaisha
     */
    select?: MasterDaishaSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MasterDaisha
     */
    omit?: MasterDaishaOmit<ExtArgs> | null
    /**
     * The data used to update MasterDaishas.
     */
    data: XOR<MasterDaishaUpdateManyMutationInput, MasterDaishaUncheckedUpdateManyInput>
    /**
     * Filter which MasterDaishas to update
     */
    where?: MasterDaishaWhereInput
    /**
     * Limit how many MasterDaishas to update.
     */
    limit?: number
  }

  /**
   * MasterDaisha upsert
   */
  export type MasterDaishaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterDaisha
     */
    select?: MasterDaishaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterDaisha
     */
    omit?: MasterDaishaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterDaishaInclude<ExtArgs> | null
    /**
     * The filter to search for the MasterDaisha to update in case it exists.
     */
    where: MasterDaishaWhereUniqueInput
    /**
     * In case the MasterDaisha found by the `where` argument doesn't exist, create a new MasterDaisha with this data.
     */
    create: XOR<MasterDaishaCreateInput, MasterDaishaUncheckedCreateInput>
    /**
     * In case the MasterDaisha was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MasterDaishaUpdateInput, MasterDaishaUncheckedUpdateInput>
  }

  /**
   * MasterDaisha delete
   */
  export type MasterDaishaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterDaisha
     */
    select?: MasterDaishaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterDaisha
     */
    omit?: MasterDaishaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterDaishaInclude<ExtArgs> | null
    /**
     * Filter which MasterDaisha to delete.
     */
    where: MasterDaishaWhereUniqueInput
  }

  /**
   * MasterDaisha deleteMany
   */
  export type MasterDaishaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MasterDaishas to delete
     */
    where?: MasterDaishaWhereInput
    /**
     * Limit how many MasterDaishas to delete.
     */
    limit?: number
  }

  /**
   * MasterDaisha.tickets
   */
  export type MasterDaisha$ticketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    where?: TicketWhereInput
    orderBy?: TicketOrderByWithRelationInput | TicketOrderByWithRelationInput[]
    cursor?: TicketWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TicketScalarFieldEnum | TicketScalarFieldEnum[]
  }

  /**
   * MasterDaisha without action
   */
  export type MasterDaishaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterDaisha
     */
    select?: MasterDaishaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterDaisha
     */
    omit?: MasterDaishaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterDaishaInclude<ExtArgs> | null
  }


  /**
   * Model Ticket
   */

  export type AggregateTicket = {
    _count: TicketCountAggregateOutputType | null
    _min: TicketMinAggregateOutputType | null
    _max: TicketMaxAggregateOutputType | null
  }

  export type TicketMinAggregateOutputType = {
    idTiket: string | null
    noDaisha: string | null
    namaPelapor: string | null
    status: string | null
    waktuMasuk: Date | null
    waktuSelesai: Date | null
    catatan: string | null
  }

  export type TicketMaxAggregateOutputType = {
    idTiket: string | null
    noDaisha: string | null
    namaPelapor: string | null
    status: string | null
    waktuMasuk: Date | null
    waktuSelesai: Date | null
    catatan: string | null
  }

  export type TicketCountAggregateOutputType = {
    idTiket: number
    noDaisha: number
    namaPelapor: number
    status: number
    waktuMasuk: number
    waktuSelesai: number
    catatan: number
    _all: number
  }


  export type TicketMinAggregateInputType = {
    idTiket?: true
    noDaisha?: true
    namaPelapor?: true
    status?: true
    waktuMasuk?: true
    waktuSelesai?: true
    catatan?: true
  }

  export type TicketMaxAggregateInputType = {
    idTiket?: true
    noDaisha?: true
    namaPelapor?: true
    status?: true
    waktuMasuk?: true
    waktuSelesai?: true
    catatan?: true
  }

  export type TicketCountAggregateInputType = {
    idTiket?: true
    noDaisha?: true
    namaPelapor?: true
    status?: true
    waktuMasuk?: true
    waktuSelesai?: true
    catatan?: true
    _all?: true
  }

  export type TicketAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Ticket to aggregate.
     */
    where?: TicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tickets to fetch.
     */
    orderBy?: TicketOrderByWithRelationInput | TicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tickets
    **/
    _count?: true | TicketCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TicketMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TicketMaxAggregateInputType
  }

  export type GetTicketAggregateType<T extends TicketAggregateArgs> = {
        [P in keyof T & keyof AggregateTicket]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTicket[P]>
      : GetScalarType<T[P], AggregateTicket[P]>
  }




  export type TicketGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TicketWhereInput
    orderBy?: TicketOrderByWithAggregationInput | TicketOrderByWithAggregationInput[]
    by: TicketScalarFieldEnum[] | TicketScalarFieldEnum
    having?: TicketScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TicketCountAggregateInputType | true
    _min?: TicketMinAggregateInputType
    _max?: TicketMaxAggregateInputType
  }

  export type TicketGroupByOutputType = {
    idTiket: string
    noDaisha: string
    namaPelapor: string
    status: string
    waktuMasuk: Date
    waktuSelesai: Date | null
    catatan: string | null
    _count: TicketCountAggregateOutputType | null
    _min: TicketMinAggregateOutputType | null
    _max: TicketMaxAggregateOutputType | null
  }

  type GetTicketGroupByPayload<T extends TicketGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TicketGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TicketGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TicketGroupByOutputType[P]>
            : GetScalarType<T[P], TicketGroupByOutputType[P]>
        }
      >
    >


  export type TicketSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idTiket?: boolean
    noDaisha?: boolean
    namaPelapor?: boolean
    status?: boolean
    waktuMasuk?: boolean
    waktuSelesai?: boolean
    catatan?: boolean
    daisha?: boolean | MasterDaishaDefaultArgs<ExtArgs>
    details?: boolean | Ticket$detailsArgs<ExtArgs>
    _count?: boolean | TicketCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ticket"]>

  export type TicketSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idTiket?: boolean
    noDaisha?: boolean
    namaPelapor?: boolean
    status?: boolean
    waktuMasuk?: boolean
    waktuSelesai?: boolean
    catatan?: boolean
    daisha?: boolean | MasterDaishaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ticket"]>

  export type TicketSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idTiket?: boolean
    noDaisha?: boolean
    namaPelapor?: boolean
    status?: boolean
    waktuMasuk?: boolean
    waktuSelesai?: boolean
    catatan?: boolean
    daisha?: boolean | MasterDaishaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ticket"]>

  export type TicketSelectScalar = {
    idTiket?: boolean
    noDaisha?: boolean
    namaPelapor?: boolean
    status?: boolean
    waktuMasuk?: boolean
    waktuSelesai?: boolean
    catatan?: boolean
  }

  export type TicketOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"idTiket" | "noDaisha" | "namaPelapor" | "status" | "waktuMasuk" | "waktuSelesai" | "catatan", ExtArgs["result"]["ticket"]>
  export type TicketInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    daisha?: boolean | MasterDaishaDefaultArgs<ExtArgs>
    details?: boolean | Ticket$detailsArgs<ExtArgs>
    _count?: boolean | TicketCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TicketIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    daisha?: boolean | MasterDaishaDefaultArgs<ExtArgs>
  }
  export type TicketIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    daisha?: boolean | MasterDaishaDefaultArgs<ExtArgs>
  }

  export type $TicketPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Ticket"
    objects: {
      daisha: Prisma.$MasterDaishaPayload<ExtArgs>
      details: Prisma.$TicketDetailPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      idTiket: string
      noDaisha: string
      namaPelapor: string
      status: string
      waktuMasuk: Date
      waktuSelesai: Date | null
      catatan: string | null
    }, ExtArgs["result"]["ticket"]>
    composites: {}
  }

  type TicketGetPayload<S extends boolean | null | undefined | TicketDefaultArgs> = $Result.GetResult<Prisma.$TicketPayload, S>

  type TicketCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TicketFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TicketCountAggregateInputType | true
    }

  export interface TicketDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Ticket'], meta: { name: 'Ticket' } }
    /**
     * Find zero or one Ticket that matches the filter.
     * @param {TicketFindUniqueArgs} args - Arguments to find a Ticket
     * @example
     * // Get one Ticket
     * const ticket = await prisma.ticket.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TicketFindUniqueArgs>(args: SelectSubset<T, TicketFindUniqueArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ticket that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TicketFindUniqueOrThrowArgs} args - Arguments to find a Ticket
     * @example
     * // Get one Ticket
     * const ticket = await prisma.ticket.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TicketFindUniqueOrThrowArgs>(args: SelectSubset<T, TicketFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ticket that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketFindFirstArgs} args - Arguments to find a Ticket
     * @example
     * // Get one Ticket
     * const ticket = await prisma.ticket.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TicketFindFirstArgs>(args?: SelectSubset<T, TicketFindFirstArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ticket that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketFindFirstOrThrowArgs} args - Arguments to find a Ticket
     * @example
     * // Get one Ticket
     * const ticket = await prisma.ticket.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TicketFindFirstOrThrowArgs>(args?: SelectSubset<T, TicketFindFirstOrThrowArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tickets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tickets
     * const tickets = await prisma.ticket.findMany()
     * 
     * // Get first 10 Tickets
     * const tickets = await prisma.ticket.findMany({ take: 10 })
     * 
     * // Only select the `idTiket`
     * const ticketWithIdTiketOnly = await prisma.ticket.findMany({ select: { idTiket: true } })
     * 
     */
    findMany<T extends TicketFindManyArgs>(args?: SelectSubset<T, TicketFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ticket.
     * @param {TicketCreateArgs} args - Arguments to create a Ticket.
     * @example
     * // Create one Ticket
     * const Ticket = await prisma.ticket.create({
     *   data: {
     *     // ... data to create a Ticket
     *   }
     * })
     * 
     */
    create<T extends TicketCreateArgs>(args: SelectSubset<T, TicketCreateArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tickets.
     * @param {TicketCreateManyArgs} args - Arguments to create many Tickets.
     * @example
     * // Create many Tickets
     * const ticket = await prisma.ticket.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TicketCreateManyArgs>(args?: SelectSubset<T, TicketCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tickets and returns the data saved in the database.
     * @param {TicketCreateManyAndReturnArgs} args - Arguments to create many Tickets.
     * @example
     * // Create many Tickets
     * const ticket = await prisma.ticket.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tickets and only return the `idTiket`
     * const ticketWithIdTiketOnly = await prisma.ticket.createManyAndReturn({
     *   select: { idTiket: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TicketCreateManyAndReturnArgs>(args?: SelectSubset<T, TicketCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Ticket.
     * @param {TicketDeleteArgs} args - Arguments to delete one Ticket.
     * @example
     * // Delete one Ticket
     * const Ticket = await prisma.ticket.delete({
     *   where: {
     *     // ... filter to delete one Ticket
     *   }
     * })
     * 
     */
    delete<T extends TicketDeleteArgs>(args: SelectSubset<T, TicketDeleteArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ticket.
     * @param {TicketUpdateArgs} args - Arguments to update one Ticket.
     * @example
     * // Update one Ticket
     * const ticket = await prisma.ticket.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TicketUpdateArgs>(args: SelectSubset<T, TicketUpdateArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tickets.
     * @param {TicketDeleteManyArgs} args - Arguments to filter Tickets to delete.
     * @example
     * // Delete a few Tickets
     * const { count } = await prisma.ticket.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TicketDeleteManyArgs>(args?: SelectSubset<T, TicketDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tickets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tickets
     * const ticket = await prisma.ticket.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TicketUpdateManyArgs>(args: SelectSubset<T, TicketUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tickets and returns the data updated in the database.
     * @param {TicketUpdateManyAndReturnArgs} args - Arguments to update many Tickets.
     * @example
     * // Update many Tickets
     * const ticket = await prisma.ticket.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tickets and only return the `idTiket`
     * const ticketWithIdTiketOnly = await prisma.ticket.updateManyAndReturn({
     *   select: { idTiket: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TicketUpdateManyAndReturnArgs>(args: SelectSubset<T, TicketUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Ticket.
     * @param {TicketUpsertArgs} args - Arguments to update or create a Ticket.
     * @example
     * // Update or create a Ticket
     * const ticket = await prisma.ticket.upsert({
     *   create: {
     *     // ... data to create a Ticket
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ticket we want to update
     *   }
     * })
     */
    upsert<T extends TicketUpsertArgs>(args: SelectSubset<T, TicketUpsertArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tickets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketCountArgs} args - Arguments to filter Tickets to count.
     * @example
     * // Count the number of Tickets
     * const count = await prisma.ticket.count({
     *   where: {
     *     // ... the filter for the Tickets we want to count
     *   }
     * })
    **/
    count<T extends TicketCountArgs>(
      args?: Subset<T, TicketCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TicketCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ticket.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TicketAggregateArgs>(args: Subset<T, TicketAggregateArgs>): Prisma.PrismaPromise<GetTicketAggregateType<T>>

    /**
     * Group by Ticket.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TicketGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TicketGroupByArgs['orderBy'] }
        : { orderBy?: TicketGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TicketGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTicketGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Ticket model
   */
  readonly fields: TicketFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Ticket.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TicketClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    daisha<T extends MasterDaishaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MasterDaishaDefaultArgs<ExtArgs>>): Prisma__MasterDaishaClient<$Result.GetResult<Prisma.$MasterDaishaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    details<T extends Ticket$detailsArgs<ExtArgs> = {}>(args?: Subset<T, Ticket$detailsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TicketDetailPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Ticket model
   */
  interface TicketFieldRefs {
    readonly idTiket: FieldRef<"Ticket", 'String'>
    readonly noDaisha: FieldRef<"Ticket", 'String'>
    readonly namaPelapor: FieldRef<"Ticket", 'String'>
    readonly status: FieldRef<"Ticket", 'String'>
    readonly waktuMasuk: FieldRef<"Ticket", 'DateTime'>
    readonly waktuSelesai: FieldRef<"Ticket", 'DateTime'>
    readonly catatan: FieldRef<"Ticket", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Ticket findUnique
   */
  export type TicketFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * Filter, which Ticket to fetch.
     */
    where: TicketWhereUniqueInput
  }

  /**
   * Ticket findUniqueOrThrow
   */
  export type TicketFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * Filter, which Ticket to fetch.
     */
    where: TicketWhereUniqueInput
  }

  /**
   * Ticket findFirst
   */
  export type TicketFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * Filter, which Ticket to fetch.
     */
    where?: TicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tickets to fetch.
     */
    orderBy?: TicketOrderByWithRelationInput | TicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tickets.
     */
    cursor?: TicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tickets.
     */
    distinct?: TicketScalarFieldEnum | TicketScalarFieldEnum[]
  }

  /**
   * Ticket findFirstOrThrow
   */
  export type TicketFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * Filter, which Ticket to fetch.
     */
    where?: TicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tickets to fetch.
     */
    orderBy?: TicketOrderByWithRelationInput | TicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tickets.
     */
    cursor?: TicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tickets.
     */
    distinct?: TicketScalarFieldEnum | TicketScalarFieldEnum[]
  }

  /**
   * Ticket findMany
   */
  export type TicketFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * Filter, which Tickets to fetch.
     */
    where?: TicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tickets to fetch.
     */
    orderBy?: TicketOrderByWithRelationInput | TicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tickets.
     */
    cursor?: TicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tickets.
     */
    skip?: number
    distinct?: TicketScalarFieldEnum | TicketScalarFieldEnum[]
  }

  /**
   * Ticket create
   */
  export type TicketCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * The data needed to create a Ticket.
     */
    data: XOR<TicketCreateInput, TicketUncheckedCreateInput>
  }

  /**
   * Ticket createMany
   */
  export type TicketCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tickets.
     */
    data: TicketCreateManyInput | TicketCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Ticket createManyAndReturn
   */
  export type TicketCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * The data used to create many Tickets.
     */
    data: TicketCreateManyInput | TicketCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Ticket update
   */
  export type TicketUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * The data needed to update a Ticket.
     */
    data: XOR<TicketUpdateInput, TicketUncheckedUpdateInput>
    /**
     * Choose, which Ticket to update.
     */
    where: TicketWhereUniqueInput
  }

  /**
   * Ticket updateMany
   */
  export type TicketUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tickets.
     */
    data: XOR<TicketUpdateManyMutationInput, TicketUncheckedUpdateManyInput>
    /**
     * Filter which Tickets to update
     */
    where?: TicketWhereInput
    /**
     * Limit how many Tickets to update.
     */
    limit?: number
  }

  /**
   * Ticket updateManyAndReturn
   */
  export type TicketUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * The data used to update Tickets.
     */
    data: XOR<TicketUpdateManyMutationInput, TicketUncheckedUpdateManyInput>
    /**
     * Filter which Tickets to update
     */
    where?: TicketWhereInput
    /**
     * Limit how many Tickets to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Ticket upsert
   */
  export type TicketUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * The filter to search for the Ticket to update in case it exists.
     */
    where: TicketWhereUniqueInput
    /**
     * In case the Ticket found by the `where` argument doesn't exist, create a new Ticket with this data.
     */
    create: XOR<TicketCreateInput, TicketUncheckedCreateInput>
    /**
     * In case the Ticket was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TicketUpdateInput, TicketUncheckedUpdateInput>
  }

  /**
   * Ticket delete
   */
  export type TicketDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * Filter which Ticket to delete.
     */
    where: TicketWhereUniqueInput
  }

  /**
   * Ticket deleteMany
   */
  export type TicketDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tickets to delete
     */
    where?: TicketWhereInput
    /**
     * Limit how many Tickets to delete.
     */
    limit?: number
  }

  /**
   * Ticket.details
   */
  export type Ticket$detailsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TicketDetail
     */
    select?: TicketDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TicketDetail
     */
    omit?: TicketDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketDetailInclude<ExtArgs> | null
    where?: TicketDetailWhereInput
    orderBy?: TicketDetailOrderByWithRelationInput | TicketDetailOrderByWithRelationInput[]
    cursor?: TicketDetailWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TicketDetailScalarFieldEnum | TicketDetailScalarFieldEnum[]
  }

  /**
   * Ticket without action
   */
  export type TicketDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ticket
     */
    omit?: TicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
  }


  /**
   * Model TicketDetail
   */

  export type AggregateTicketDetail = {
    _count: TicketDetailCountAggregateOutputType | null
    _avg: TicketDetailAvgAggregateOutputType | null
    _sum: TicketDetailSumAggregateOutputType | null
    _min: TicketDetailMinAggregateOutputType | null
    _max: TicketDetailMaxAggregateOutputType | null
  }

  export type TicketDetailAvgAggregateOutputType = {
    idDetail: number | null
    qty: number | null
  }

  export type TicketDetailSumAggregateOutputType = {
    idDetail: number | null
    qty: number | null
  }

  export type TicketDetailMinAggregateOutputType = {
    idDetail: number | null
    idTiket: string | null
    komponen: string | null
    gejala: string | null
    tindakan: string | null
    qty: number | null
  }

  export type TicketDetailMaxAggregateOutputType = {
    idDetail: number | null
    idTiket: string | null
    komponen: string | null
    gejala: string | null
    tindakan: string | null
    qty: number | null
  }

  export type TicketDetailCountAggregateOutputType = {
    idDetail: number
    idTiket: number
    komponen: number
    gejala: number
    tindakan: number
    qty: number
    _all: number
  }


  export type TicketDetailAvgAggregateInputType = {
    idDetail?: true
    qty?: true
  }

  export type TicketDetailSumAggregateInputType = {
    idDetail?: true
    qty?: true
  }

  export type TicketDetailMinAggregateInputType = {
    idDetail?: true
    idTiket?: true
    komponen?: true
    gejala?: true
    tindakan?: true
    qty?: true
  }

  export type TicketDetailMaxAggregateInputType = {
    idDetail?: true
    idTiket?: true
    komponen?: true
    gejala?: true
    tindakan?: true
    qty?: true
  }

  export type TicketDetailCountAggregateInputType = {
    idDetail?: true
    idTiket?: true
    komponen?: true
    gejala?: true
    tindakan?: true
    qty?: true
    _all?: true
  }

  export type TicketDetailAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TicketDetail to aggregate.
     */
    where?: TicketDetailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TicketDetails to fetch.
     */
    orderBy?: TicketDetailOrderByWithRelationInput | TicketDetailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TicketDetailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TicketDetails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TicketDetails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TicketDetails
    **/
    _count?: true | TicketDetailCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TicketDetailAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TicketDetailSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TicketDetailMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TicketDetailMaxAggregateInputType
  }

  export type GetTicketDetailAggregateType<T extends TicketDetailAggregateArgs> = {
        [P in keyof T & keyof AggregateTicketDetail]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTicketDetail[P]>
      : GetScalarType<T[P], AggregateTicketDetail[P]>
  }




  export type TicketDetailGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TicketDetailWhereInput
    orderBy?: TicketDetailOrderByWithAggregationInput | TicketDetailOrderByWithAggregationInput[]
    by: TicketDetailScalarFieldEnum[] | TicketDetailScalarFieldEnum
    having?: TicketDetailScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TicketDetailCountAggregateInputType | true
    _avg?: TicketDetailAvgAggregateInputType
    _sum?: TicketDetailSumAggregateInputType
    _min?: TicketDetailMinAggregateInputType
    _max?: TicketDetailMaxAggregateInputType
  }

  export type TicketDetailGroupByOutputType = {
    idDetail: number
    idTiket: string
    komponen: string
    gejala: string
    tindakan: string
    qty: number
    _count: TicketDetailCountAggregateOutputType | null
    _avg: TicketDetailAvgAggregateOutputType | null
    _sum: TicketDetailSumAggregateOutputType | null
    _min: TicketDetailMinAggregateOutputType | null
    _max: TicketDetailMaxAggregateOutputType | null
  }

  type GetTicketDetailGroupByPayload<T extends TicketDetailGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TicketDetailGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TicketDetailGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TicketDetailGroupByOutputType[P]>
            : GetScalarType<T[P], TicketDetailGroupByOutputType[P]>
        }
      >
    >


  export type TicketDetailSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idDetail?: boolean
    idTiket?: boolean
    komponen?: boolean
    gejala?: boolean
    tindakan?: boolean
    qty?: boolean
    ticket?: boolean | TicketDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ticketDetail"]>

  export type TicketDetailSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idDetail?: boolean
    idTiket?: boolean
    komponen?: boolean
    gejala?: boolean
    tindakan?: boolean
    qty?: boolean
    ticket?: boolean | TicketDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ticketDetail"]>

  export type TicketDetailSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idDetail?: boolean
    idTiket?: boolean
    komponen?: boolean
    gejala?: boolean
    tindakan?: boolean
    qty?: boolean
    ticket?: boolean | TicketDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ticketDetail"]>

  export type TicketDetailSelectScalar = {
    idDetail?: boolean
    idTiket?: boolean
    komponen?: boolean
    gejala?: boolean
    tindakan?: boolean
    qty?: boolean
  }

  export type TicketDetailOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"idDetail" | "idTiket" | "komponen" | "gejala" | "tindakan" | "qty", ExtArgs["result"]["ticketDetail"]>
  export type TicketDetailInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ticket?: boolean | TicketDefaultArgs<ExtArgs>
  }
  export type TicketDetailIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ticket?: boolean | TicketDefaultArgs<ExtArgs>
  }
  export type TicketDetailIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ticket?: boolean | TicketDefaultArgs<ExtArgs>
  }

  export type $TicketDetailPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TicketDetail"
    objects: {
      ticket: Prisma.$TicketPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      idDetail: number
      idTiket: string
      komponen: string
      gejala: string
      tindakan: string
      qty: number
    }, ExtArgs["result"]["ticketDetail"]>
    composites: {}
  }

  type TicketDetailGetPayload<S extends boolean | null | undefined | TicketDetailDefaultArgs> = $Result.GetResult<Prisma.$TicketDetailPayload, S>

  type TicketDetailCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TicketDetailFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TicketDetailCountAggregateInputType | true
    }

  export interface TicketDetailDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TicketDetail'], meta: { name: 'TicketDetail' } }
    /**
     * Find zero or one TicketDetail that matches the filter.
     * @param {TicketDetailFindUniqueArgs} args - Arguments to find a TicketDetail
     * @example
     * // Get one TicketDetail
     * const ticketDetail = await prisma.ticketDetail.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TicketDetailFindUniqueArgs>(args: SelectSubset<T, TicketDetailFindUniqueArgs<ExtArgs>>): Prisma__TicketDetailClient<$Result.GetResult<Prisma.$TicketDetailPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TicketDetail that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TicketDetailFindUniqueOrThrowArgs} args - Arguments to find a TicketDetail
     * @example
     * // Get one TicketDetail
     * const ticketDetail = await prisma.ticketDetail.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TicketDetailFindUniqueOrThrowArgs>(args: SelectSubset<T, TicketDetailFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TicketDetailClient<$Result.GetResult<Prisma.$TicketDetailPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TicketDetail that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketDetailFindFirstArgs} args - Arguments to find a TicketDetail
     * @example
     * // Get one TicketDetail
     * const ticketDetail = await prisma.ticketDetail.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TicketDetailFindFirstArgs>(args?: SelectSubset<T, TicketDetailFindFirstArgs<ExtArgs>>): Prisma__TicketDetailClient<$Result.GetResult<Prisma.$TicketDetailPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TicketDetail that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketDetailFindFirstOrThrowArgs} args - Arguments to find a TicketDetail
     * @example
     * // Get one TicketDetail
     * const ticketDetail = await prisma.ticketDetail.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TicketDetailFindFirstOrThrowArgs>(args?: SelectSubset<T, TicketDetailFindFirstOrThrowArgs<ExtArgs>>): Prisma__TicketDetailClient<$Result.GetResult<Prisma.$TicketDetailPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TicketDetails that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketDetailFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TicketDetails
     * const ticketDetails = await prisma.ticketDetail.findMany()
     * 
     * // Get first 10 TicketDetails
     * const ticketDetails = await prisma.ticketDetail.findMany({ take: 10 })
     * 
     * // Only select the `idDetail`
     * const ticketDetailWithIdDetailOnly = await prisma.ticketDetail.findMany({ select: { idDetail: true } })
     * 
     */
    findMany<T extends TicketDetailFindManyArgs>(args?: SelectSubset<T, TicketDetailFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TicketDetailPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TicketDetail.
     * @param {TicketDetailCreateArgs} args - Arguments to create a TicketDetail.
     * @example
     * // Create one TicketDetail
     * const TicketDetail = await prisma.ticketDetail.create({
     *   data: {
     *     // ... data to create a TicketDetail
     *   }
     * })
     * 
     */
    create<T extends TicketDetailCreateArgs>(args: SelectSubset<T, TicketDetailCreateArgs<ExtArgs>>): Prisma__TicketDetailClient<$Result.GetResult<Prisma.$TicketDetailPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TicketDetails.
     * @param {TicketDetailCreateManyArgs} args - Arguments to create many TicketDetails.
     * @example
     * // Create many TicketDetails
     * const ticketDetail = await prisma.ticketDetail.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TicketDetailCreateManyArgs>(args?: SelectSubset<T, TicketDetailCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TicketDetails and returns the data saved in the database.
     * @param {TicketDetailCreateManyAndReturnArgs} args - Arguments to create many TicketDetails.
     * @example
     * // Create many TicketDetails
     * const ticketDetail = await prisma.ticketDetail.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TicketDetails and only return the `idDetail`
     * const ticketDetailWithIdDetailOnly = await prisma.ticketDetail.createManyAndReturn({
     *   select: { idDetail: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TicketDetailCreateManyAndReturnArgs>(args?: SelectSubset<T, TicketDetailCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TicketDetailPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TicketDetail.
     * @param {TicketDetailDeleteArgs} args - Arguments to delete one TicketDetail.
     * @example
     * // Delete one TicketDetail
     * const TicketDetail = await prisma.ticketDetail.delete({
     *   where: {
     *     // ... filter to delete one TicketDetail
     *   }
     * })
     * 
     */
    delete<T extends TicketDetailDeleteArgs>(args: SelectSubset<T, TicketDetailDeleteArgs<ExtArgs>>): Prisma__TicketDetailClient<$Result.GetResult<Prisma.$TicketDetailPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TicketDetail.
     * @param {TicketDetailUpdateArgs} args - Arguments to update one TicketDetail.
     * @example
     * // Update one TicketDetail
     * const ticketDetail = await prisma.ticketDetail.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TicketDetailUpdateArgs>(args: SelectSubset<T, TicketDetailUpdateArgs<ExtArgs>>): Prisma__TicketDetailClient<$Result.GetResult<Prisma.$TicketDetailPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TicketDetails.
     * @param {TicketDetailDeleteManyArgs} args - Arguments to filter TicketDetails to delete.
     * @example
     * // Delete a few TicketDetails
     * const { count } = await prisma.ticketDetail.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TicketDetailDeleteManyArgs>(args?: SelectSubset<T, TicketDetailDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TicketDetails.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketDetailUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TicketDetails
     * const ticketDetail = await prisma.ticketDetail.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TicketDetailUpdateManyArgs>(args: SelectSubset<T, TicketDetailUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TicketDetails and returns the data updated in the database.
     * @param {TicketDetailUpdateManyAndReturnArgs} args - Arguments to update many TicketDetails.
     * @example
     * // Update many TicketDetails
     * const ticketDetail = await prisma.ticketDetail.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TicketDetails and only return the `idDetail`
     * const ticketDetailWithIdDetailOnly = await prisma.ticketDetail.updateManyAndReturn({
     *   select: { idDetail: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TicketDetailUpdateManyAndReturnArgs>(args: SelectSubset<T, TicketDetailUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TicketDetailPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TicketDetail.
     * @param {TicketDetailUpsertArgs} args - Arguments to update or create a TicketDetail.
     * @example
     * // Update or create a TicketDetail
     * const ticketDetail = await prisma.ticketDetail.upsert({
     *   create: {
     *     // ... data to create a TicketDetail
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TicketDetail we want to update
     *   }
     * })
     */
    upsert<T extends TicketDetailUpsertArgs>(args: SelectSubset<T, TicketDetailUpsertArgs<ExtArgs>>): Prisma__TicketDetailClient<$Result.GetResult<Prisma.$TicketDetailPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TicketDetails.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketDetailCountArgs} args - Arguments to filter TicketDetails to count.
     * @example
     * // Count the number of TicketDetails
     * const count = await prisma.ticketDetail.count({
     *   where: {
     *     // ... the filter for the TicketDetails we want to count
     *   }
     * })
    **/
    count<T extends TicketDetailCountArgs>(
      args?: Subset<T, TicketDetailCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TicketDetailCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TicketDetail.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketDetailAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TicketDetailAggregateArgs>(args: Subset<T, TicketDetailAggregateArgs>): Prisma.PrismaPromise<GetTicketDetailAggregateType<T>>

    /**
     * Group by TicketDetail.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketDetailGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TicketDetailGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TicketDetailGroupByArgs['orderBy'] }
        : { orderBy?: TicketDetailGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TicketDetailGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTicketDetailGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TicketDetail model
   */
  readonly fields: TicketDetailFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TicketDetail.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TicketDetailClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    ticket<T extends TicketDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TicketDefaultArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TicketDetail model
   */
  interface TicketDetailFieldRefs {
    readonly idDetail: FieldRef<"TicketDetail", 'Int'>
    readonly idTiket: FieldRef<"TicketDetail", 'String'>
    readonly komponen: FieldRef<"TicketDetail", 'String'>
    readonly gejala: FieldRef<"TicketDetail", 'String'>
    readonly tindakan: FieldRef<"TicketDetail", 'String'>
    readonly qty: FieldRef<"TicketDetail", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * TicketDetail findUnique
   */
  export type TicketDetailFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TicketDetail
     */
    select?: TicketDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TicketDetail
     */
    omit?: TicketDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketDetailInclude<ExtArgs> | null
    /**
     * Filter, which TicketDetail to fetch.
     */
    where: TicketDetailWhereUniqueInput
  }

  /**
   * TicketDetail findUniqueOrThrow
   */
  export type TicketDetailFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TicketDetail
     */
    select?: TicketDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TicketDetail
     */
    omit?: TicketDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketDetailInclude<ExtArgs> | null
    /**
     * Filter, which TicketDetail to fetch.
     */
    where: TicketDetailWhereUniqueInput
  }

  /**
   * TicketDetail findFirst
   */
  export type TicketDetailFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TicketDetail
     */
    select?: TicketDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TicketDetail
     */
    omit?: TicketDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketDetailInclude<ExtArgs> | null
    /**
     * Filter, which TicketDetail to fetch.
     */
    where?: TicketDetailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TicketDetails to fetch.
     */
    orderBy?: TicketDetailOrderByWithRelationInput | TicketDetailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TicketDetails.
     */
    cursor?: TicketDetailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TicketDetails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TicketDetails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TicketDetails.
     */
    distinct?: TicketDetailScalarFieldEnum | TicketDetailScalarFieldEnum[]
  }

  /**
   * TicketDetail findFirstOrThrow
   */
  export type TicketDetailFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TicketDetail
     */
    select?: TicketDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TicketDetail
     */
    omit?: TicketDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketDetailInclude<ExtArgs> | null
    /**
     * Filter, which TicketDetail to fetch.
     */
    where?: TicketDetailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TicketDetails to fetch.
     */
    orderBy?: TicketDetailOrderByWithRelationInput | TicketDetailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TicketDetails.
     */
    cursor?: TicketDetailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TicketDetails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TicketDetails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TicketDetails.
     */
    distinct?: TicketDetailScalarFieldEnum | TicketDetailScalarFieldEnum[]
  }

  /**
   * TicketDetail findMany
   */
  export type TicketDetailFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TicketDetail
     */
    select?: TicketDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TicketDetail
     */
    omit?: TicketDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketDetailInclude<ExtArgs> | null
    /**
     * Filter, which TicketDetails to fetch.
     */
    where?: TicketDetailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TicketDetails to fetch.
     */
    orderBy?: TicketDetailOrderByWithRelationInput | TicketDetailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TicketDetails.
     */
    cursor?: TicketDetailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TicketDetails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TicketDetails.
     */
    skip?: number
    distinct?: TicketDetailScalarFieldEnum | TicketDetailScalarFieldEnum[]
  }

  /**
   * TicketDetail create
   */
  export type TicketDetailCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TicketDetail
     */
    select?: TicketDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TicketDetail
     */
    omit?: TicketDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketDetailInclude<ExtArgs> | null
    /**
     * The data needed to create a TicketDetail.
     */
    data: XOR<TicketDetailCreateInput, TicketDetailUncheckedCreateInput>
  }

  /**
   * TicketDetail createMany
   */
  export type TicketDetailCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TicketDetails.
     */
    data: TicketDetailCreateManyInput | TicketDetailCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TicketDetail createManyAndReturn
   */
  export type TicketDetailCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TicketDetail
     */
    select?: TicketDetailSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TicketDetail
     */
    omit?: TicketDetailOmit<ExtArgs> | null
    /**
     * The data used to create many TicketDetails.
     */
    data: TicketDetailCreateManyInput | TicketDetailCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketDetailIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TicketDetail update
   */
  export type TicketDetailUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TicketDetail
     */
    select?: TicketDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TicketDetail
     */
    omit?: TicketDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketDetailInclude<ExtArgs> | null
    /**
     * The data needed to update a TicketDetail.
     */
    data: XOR<TicketDetailUpdateInput, TicketDetailUncheckedUpdateInput>
    /**
     * Choose, which TicketDetail to update.
     */
    where: TicketDetailWhereUniqueInput
  }

  /**
   * TicketDetail updateMany
   */
  export type TicketDetailUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TicketDetails.
     */
    data: XOR<TicketDetailUpdateManyMutationInput, TicketDetailUncheckedUpdateManyInput>
    /**
     * Filter which TicketDetails to update
     */
    where?: TicketDetailWhereInput
    /**
     * Limit how many TicketDetails to update.
     */
    limit?: number
  }

  /**
   * TicketDetail updateManyAndReturn
   */
  export type TicketDetailUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TicketDetail
     */
    select?: TicketDetailSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TicketDetail
     */
    omit?: TicketDetailOmit<ExtArgs> | null
    /**
     * The data used to update TicketDetails.
     */
    data: XOR<TicketDetailUpdateManyMutationInput, TicketDetailUncheckedUpdateManyInput>
    /**
     * Filter which TicketDetails to update
     */
    where?: TicketDetailWhereInput
    /**
     * Limit how many TicketDetails to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketDetailIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TicketDetail upsert
   */
  export type TicketDetailUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TicketDetail
     */
    select?: TicketDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TicketDetail
     */
    omit?: TicketDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketDetailInclude<ExtArgs> | null
    /**
     * The filter to search for the TicketDetail to update in case it exists.
     */
    where: TicketDetailWhereUniqueInput
    /**
     * In case the TicketDetail found by the `where` argument doesn't exist, create a new TicketDetail with this data.
     */
    create: XOR<TicketDetailCreateInput, TicketDetailUncheckedCreateInput>
    /**
     * In case the TicketDetail was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TicketDetailUpdateInput, TicketDetailUncheckedUpdateInput>
  }

  /**
   * TicketDetail delete
   */
  export type TicketDetailDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TicketDetail
     */
    select?: TicketDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TicketDetail
     */
    omit?: TicketDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketDetailInclude<ExtArgs> | null
    /**
     * Filter which TicketDetail to delete.
     */
    where: TicketDetailWhereUniqueInput
  }

  /**
   * TicketDetail deleteMany
   */
  export type TicketDetailDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TicketDetails to delete
     */
    where?: TicketDetailWhereInput
    /**
     * Limit how many TicketDetails to delete.
     */
    limit?: number
  }

  /**
   * TicketDetail without action
   */
  export type TicketDetailDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TicketDetail
     */
    select?: TicketDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TicketDetail
     */
    omit?: TicketDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketDetailInclude<ExtArgs> | null
  }


  /**
   * Model DaishaType
   */

  export type AggregateDaishaType = {
    _count: DaishaTypeCountAggregateOutputType | null
    _avg: DaishaTypeAvgAggregateOutputType | null
    _sum: DaishaTypeSumAggregateOutputType | null
    _min: DaishaTypeMinAggregateOutputType | null
    _max: DaishaTypeMaxAggregateOutputType | null
  }

  export type DaishaTypeAvgAggregateOutputType = {
    id: number | null
  }

  export type DaishaTypeSumAggregateOutputType = {
    id: number | null
  }

  export type DaishaTypeMinAggregateOutputType = {
    id: number | null
    name: string | null
    seksi: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DaishaTypeMaxAggregateOutputType = {
    id: number | null
    name: string | null
    seksi: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DaishaTypeCountAggregateOutputType = {
    id: number
    name: number
    seksi: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DaishaTypeAvgAggregateInputType = {
    id?: true
  }

  export type DaishaTypeSumAggregateInputType = {
    id?: true
  }

  export type DaishaTypeMinAggregateInputType = {
    id?: true
    name?: true
    seksi?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DaishaTypeMaxAggregateInputType = {
    id?: true
    name?: true
    seksi?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DaishaTypeCountAggregateInputType = {
    id?: true
    name?: true
    seksi?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DaishaTypeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DaishaType to aggregate.
     */
    where?: DaishaTypeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DaishaTypes to fetch.
     */
    orderBy?: DaishaTypeOrderByWithRelationInput | DaishaTypeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DaishaTypeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DaishaTypes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DaishaTypes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DaishaTypes
    **/
    _count?: true | DaishaTypeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DaishaTypeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DaishaTypeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DaishaTypeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DaishaTypeMaxAggregateInputType
  }

  export type GetDaishaTypeAggregateType<T extends DaishaTypeAggregateArgs> = {
        [P in keyof T & keyof AggregateDaishaType]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDaishaType[P]>
      : GetScalarType<T[P], AggregateDaishaType[P]>
  }




  export type DaishaTypeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DaishaTypeWhereInput
    orderBy?: DaishaTypeOrderByWithAggregationInput | DaishaTypeOrderByWithAggregationInput[]
    by: DaishaTypeScalarFieldEnum[] | DaishaTypeScalarFieldEnum
    having?: DaishaTypeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DaishaTypeCountAggregateInputType | true
    _avg?: DaishaTypeAvgAggregateInputType
    _sum?: DaishaTypeSumAggregateInputType
    _min?: DaishaTypeMinAggregateInputType
    _max?: DaishaTypeMaxAggregateInputType
  }

  export type DaishaTypeGroupByOutputType = {
    id: number
    name: string
    seksi: string
    createdAt: Date
    updatedAt: Date
    _count: DaishaTypeCountAggregateOutputType | null
    _avg: DaishaTypeAvgAggregateOutputType | null
    _sum: DaishaTypeSumAggregateOutputType | null
    _min: DaishaTypeMinAggregateOutputType | null
    _max: DaishaTypeMaxAggregateOutputType | null
  }

  type GetDaishaTypeGroupByPayload<T extends DaishaTypeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DaishaTypeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DaishaTypeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DaishaTypeGroupByOutputType[P]>
            : GetScalarType<T[P], DaishaTypeGroupByOutputType[P]>
        }
      >
    >


  export type DaishaTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    seksi?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    components?: boolean | DaishaType$componentsArgs<ExtArgs>
    _count?: boolean | DaishaTypeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["daishaType"]>

  export type DaishaTypeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    seksi?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["daishaType"]>

  export type DaishaTypeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    seksi?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["daishaType"]>

  export type DaishaTypeSelectScalar = {
    id?: boolean
    name?: boolean
    seksi?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DaishaTypeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "seksi" | "createdAt" | "updatedAt", ExtArgs["result"]["daishaType"]>
  export type DaishaTypeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    components?: boolean | DaishaType$componentsArgs<ExtArgs>
    _count?: boolean | DaishaTypeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DaishaTypeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type DaishaTypeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $DaishaTypePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DaishaType"
    objects: {
      components: Prisma.$DaishaComponentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      seksi: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["daishaType"]>
    composites: {}
  }

  type DaishaTypeGetPayload<S extends boolean | null | undefined | DaishaTypeDefaultArgs> = $Result.GetResult<Prisma.$DaishaTypePayload, S>

  type DaishaTypeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DaishaTypeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DaishaTypeCountAggregateInputType | true
    }

  export interface DaishaTypeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DaishaType'], meta: { name: 'DaishaType' } }
    /**
     * Find zero or one DaishaType that matches the filter.
     * @param {DaishaTypeFindUniqueArgs} args - Arguments to find a DaishaType
     * @example
     * // Get one DaishaType
     * const daishaType = await prisma.daishaType.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DaishaTypeFindUniqueArgs>(args: SelectSubset<T, DaishaTypeFindUniqueArgs<ExtArgs>>): Prisma__DaishaTypeClient<$Result.GetResult<Prisma.$DaishaTypePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DaishaType that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DaishaTypeFindUniqueOrThrowArgs} args - Arguments to find a DaishaType
     * @example
     * // Get one DaishaType
     * const daishaType = await prisma.daishaType.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DaishaTypeFindUniqueOrThrowArgs>(args: SelectSubset<T, DaishaTypeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DaishaTypeClient<$Result.GetResult<Prisma.$DaishaTypePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DaishaType that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaTypeFindFirstArgs} args - Arguments to find a DaishaType
     * @example
     * // Get one DaishaType
     * const daishaType = await prisma.daishaType.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DaishaTypeFindFirstArgs>(args?: SelectSubset<T, DaishaTypeFindFirstArgs<ExtArgs>>): Prisma__DaishaTypeClient<$Result.GetResult<Prisma.$DaishaTypePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DaishaType that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaTypeFindFirstOrThrowArgs} args - Arguments to find a DaishaType
     * @example
     * // Get one DaishaType
     * const daishaType = await prisma.daishaType.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DaishaTypeFindFirstOrThrowArgs>(args?: SelectSubset<T, DaishaTypeFindFirstOrThrowArgs<ExtArgs>>): Prisma__DaishaTypeClient<$Result.GetResult<Prisma.$DaishaTypePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DaishaTypes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaTypeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DaishaTypes
     * const daishaTypes = await prisma.daishaType.findMany()
     * 
     * // Get first 10 DaishaTypes
     * const daishaTypes = await prisma.daishaType.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const daishaTypeWithIdOnly = await prisma.daishaType.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DaishaTypeFindManyArgs>(args?: SelectSubset<T, DaishaTypeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DaishaTypePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DaishaType.
     * @param {DaishaTypeCreateArgs} args - Arguments to create a DaishaType.
     * @example
     * // Create one DaishaType
     * const DaishaType = await prisma.daishaType.create({
     *   data: {
     *     // ... data to create a DaishaType
     *   }
     * })
     * 
     */
    create<T extends DaishaTypeCreateArgs>(args: SelectSubset<T, DaishaTypeCreateArgs<ExtArgs>>): Prisma__DaishaTypeClient<$Result.GetResult<Prisma.$DaishaTypePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DaishaTypes.
     * @param {DaishaTypeCreateManyArgs} args - Arguments to create many DaishaTypes.
     * @example
     * // Create many DaishaTypes
     * const daishaType = await prisma.daishaType.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DaishaTypeCreateManyArgs>(args?: SelectSubset<T, DaishaTypeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DaishaTypes and returns the data saved in the database.
     * @param {DaishaTypeCreateManyAndReturnArgs} args - Arguments to create many DaishaTypes.
     * @example
     * // Create many DaishaTypes
     * const daishaType = await prisma.daishaType.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DaishaTypes and only return the `id`
     * const daishaTypeWithIdOnly = await prisma.daishaType.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DaishaTypeCreateManyAndReturnArgs>(args?: SelectSubset<T, DaishaTypeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DaishaTypePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DaishaType.
     * @param {DaishaTypeDeleteArgs} args - Arguments to delete one DaishaType.
     * @example
     * // Delete one DaishaType
     * const DaishaType = await prisma.daishaType.delete({
     *   where: {
     *     // ... filter to delete one DaishaType
     *   }
     * })
     * 
     */
    delete<T extends DaishaTypeDeleteArgs>(args: SelectSubset<T, DaishaTypeDeleteArgs<ExtArgs>>): Prisma__DaishaTypeClient<$Result.GetResult<Prisma.$DaishaTypePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DaishaType.
     * @param {DaishaTypeUpdateArgs} args - Arguments to update one DaishaType.
     * @example
     * // Update one DaishaType
     * const daishaType = await prisma.daishaType.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DaishaTypeUpdateArgs>(args: SelectSubset<T, DaishaTypeUpdateArgs<ExtArgs>>): Prisma__DaishaTypeClient<$Result.GetResult<Prisma.$DaishaTypePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DaishaTypes.
     * @param {DaishaTypeDeleteManyArgs} args - Arguments to filter DaishaTypes to delete.
     * @example
     * // Delete a few DaishaTypes
     * const { count } = await prisma.daishaType.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DaishaTypeDeleteManyArgs>(args?: SelectSubset<T, DaishaTypeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DaishaTypes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaTypeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DaishaTypes
     * const daishaType = await prisma.daishaType.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DaishaTypeUpdateManyArgs>(args: SelectSubset<T, DaishaTypeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DaishaTypes and returns the data updated in the database.
     * @param {DaishaTypeUpdateManyAndReturnArgs} args - Arguments to update many DaishaTypes.
     * @example
     * // Update many DaishaTypes
     * const daishaType = await prisma.daishaType.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DaishaTypes and only return the `id`
     * const daishaTypeWithIdOnly = await prisma.daishaType.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DaishaTypeUpdateManyAndReturnArgs>(args: SelectSubset<T, DaishaTypeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DaishaTypePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DaishaType.
     * @param {DaishaTypeUpsertArgs} args - Arguments to update or create a DaishaType.
     * @example
     * // Update or create a DaishaType
     * const daishaType = await prisma.daishaType.upsert({
     *   create: {
     *     // ... data to create a DaishaType
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DaishaType we want to update
     *   }
     * })
     */
    upsert<T extends DaishaTypeUpsertArgs>(args: SelectSubset<T, DaishaTypeUpsertArgs<ExtArgs>>): Prisma__DaishaTypeClient<$Result.GetResult<Prisma.$DaishaTypePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DaishaTypes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaTypeCountArgs} args - Arguments to filter DaishaTypes to count.
     * @example
     * // Count the number of DaishaTypes
     * const count = await prisma.daishaType.count({
     *   where: {
     *     // ... the filter for the DaishaTypes we want to count
     *   }
     * })
    **/
    count<T extends DaishaTypeCountArgs>(
      args?: Subset<T, DaishaTypeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DaishaTypeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DaishaType.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaTypeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DaishaTypeAggregateArgs>(args: Subset<T, DaishaTypeAggregateArgs>): Prisma.PrismaPromise<GetDaishaTypeAggregateType<T>>

    /**
     * Group by DaishaType.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaTypeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DaishaTypeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DaishaTypeGroupByArgs['orderBy'] }
        : { orderBy?: DaishaTypeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DaishaTypeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDaishaTypeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DaishaType model
   */
  readonly fields: DaishaTypeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DaishaType.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DaishaTypeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    components<T extends DaishaType$componentsArgs<ExtArgs> = {}>(args?: Subset<T, DaishaType$componentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DaishaComponentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DaishaType model
   */
  interface DaishaTypeFieldRefs {
    readonly id: FieldRef<"DaishaType", 'Int'>
    readonly name: FieldRef<"DaishaType", 'String'>
    readonly seksi: FieldRef<"DaishaType", 'String'>
    readonly createdAt: FieldRef<"DaishaType", 'DateTime'>
    readonly updatedAt: FieldRef<"DaishaType", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DaishaType findUnique
   */
  export type DaishaTypeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaType
     */
    select?: DaishaTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaType
     */
    omit?: DaishaTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaTypeInclude<ExtArgs> | null
    /**
     * Filter, which DaishaType to fetch.
     */
    where: DaishaTypeWhereUniqueInput
  }

  /**
   * DaishaType findUniqueOrThrow
   */
  export type DaishaTypeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaType
     */
    select?: DaishaTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaType
     */
    omit?: DaishaTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaTypeInclude<ExtArgs> | null
    /**
     * Filter, which DaishaType to fetch.
     */
    where: DaishaTypeWhereUniqueInput
  }

  /**
   * DaishaType findFirst
   */
  export type DaishaTypeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaType
     */
    select?: DaishaTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaType
     */
    omit?: DaishaTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaTypeInclude<ExtArgs> | null
    /**
     * Filter, which DaishaType to fetch.
     */
    where?: DaishaTypeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DaishaTypes to fetch.
     */
    orderBy?: DaishaTypeOrderByWithRelationInput | DaishaTypeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DaishaTypes.
     */
    cursor?: DaishaTypeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DaishaTypes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DaishaTypes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DaishaTypes.
     */
    distinct?: DaishaTypeScalarFieldEnum | DaishaTypeScalarFieldEnum[]
  }

  /**
   * DaishaType findFirstOrThrow
   */
  export type DaishaTypeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaType
     */
    select?: DaishaTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaType
     */
    omit?: DaishaTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaTypeInclude<ExtArgs> | null
    /**
     * Filter, which DaishaType to fetch.
     */
    where?: DaishaTypeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DaishaTypes to fetch.
     */
    orderBy?: DaishaTypeOrderByWithRelationInput | DaishaTypeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DaishaTypes.
     */
    cursor?: DaishaTypeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DaishaTypes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DaishaTypes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DaishaTypes.
     */
    distinct?: DaishaTypeScalarFieldEnum | DaishaTypeScalarFieldEnum[]
  }

  /**
   * DaishaType findMany
   */
  export type DaishaTypeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaType
     */
    select?: DaishaTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaType
     */
    omit?: DaishaTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaTypeInclude<ExtArgs> | null
    /**
     * Filter, which DaishaTypes to fetch.
     */
    where?: DaishaTypeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DaishaTypes to fetch.
     */
    orderBy?: DaishaTypeOrderByWithRelationInput | DaishaTypeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DaishaTypes.
     */
    cursor?: DaishaTypeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DaishaTypes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DaishaTypes.
     */
    skip?: number
    distinct?: DaishaTypeScalarFieldEnum | DaishaTypeScalarFieldEnum[]
  }

  /**
   * DaishaType create
   */
  export type DaishaTypeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaType
     */
    select?: DaishaTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaType
     */
    omit?: DaishaTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaTypeInclude<ExtArgs> | null
    /**
     * The data needed to create a DaishaType.
     */
    data: XOR<DaishaTypeCreateInput, DaishaTypeUncheckedCreateInput>
  }

  /**
   * DaishaType createMany
   */
  export type DaishaTypeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DaishaTypes.
     */
    data: DaishaTypeCreateManyInput | DaishaTypeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DaishaType createManyAndReturn
   */
  export type DaishaTypeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaType
     */
    select?: DaishaTypeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaType
     */
    omit?: DaishaTypeOmit<ExtArgs> | null
    /**
     * The data used to create many DaishaTypes.
     */
    data: DaishaTypeCreateManyInput | DaishaTypeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DaishaType update
   */
  export type DaishaTypeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaType
     */
    select?: DaishaTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaType
     */
    omit?: DaishaTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaTypeInclude<ExtArgs> | null
    /**
     * The data needed to update a DaishaType.
     */
    data: XOR<DaishaTypeUpdateInput, DaishaTypeUncheckedUpdateInput>
    /**
     * Choose, which DaishaType to update.
     */
    where: DaishaTypeWhereUniqueInput
  }

  /**
   * DaishaType updateMany
   */
  export type DaishaTypeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DaishaTypes.
     */
    data: XOR<DaishaTypeUpdateManyMutationInput, DaishaTypeUncheckedUpdateManyInput>
    /**
     * Filter which DaishaTypes to update
     */
    where?: DaishaTypeWhereInput
    /**
     * Limit how many DaishaTypes to update.
     */
    limit?: number
  }

  /**
   * DaishaType updateManyAndReturn
   */
  export type DaishaTypeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaType
     */
    select?: DaishaTypeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaType
     */
    omit?: DaishaTypeOmit<ExtArgs> | null
    /**
     * The data used to update DaishaTypes.
     */
    data: XOR<DaishaTypeUpdateManyMutationInput, DaishaTypeUncheckedUpdateManyInput>
    /**
     * Filter which DaishaTypes to update
     */
    where?: DaishaTypeWhereInput
    /**
     * Limit how many DaishaTypes to update.
     */
    limit?: number
  }

  /**
   * DaishaType upsert
   */
  export type DaishaTypeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaType
     */
    select?: DaishaTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaType
     */
    omit?: DaishaTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaTypeInclude<ExtArgs> | null
    /**
     * The filter to search for the DaishaType to update in case it exists.
     */
    where: DaishaTypeWhereUniqueInput
    /**
     * In case the DaishaType found by the `where` argument doesn't exist, create a new DaishaType with this data.
     */
    create: XOR<DaishaTypeCreateInput, DaishaTypeUncheckedCreateInput>
    /**
     * In case the DaishaType was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DaishaTypeUpdateInput, DaishaTypeUncheckedUpdateInput>
  }

  /**
   * DaishaType delete
   */
  export type DaishaTypeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaType
     */
    select?: DaishaTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaType
     */
    omit?: DaishaTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaTypeInclude<ExtArgs> | null
    /**
     * Filter which DaishaType to delete.
     */
    where: DaishaTypeWhereUniqueInput
  }

  /**
   * DaishaType deleteMany
   */
  export type DaishaTypeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DaishaTypes to delete
     */
    where?: DaishaTypeWhereInput
    /**
     * Limit how many DaishaTypes to delete.
     */
    limit?: number
  }

  /**
   * DaishaType.components
   */
  export type DaishaType$componentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaComponent
     */
    select?: DaishaComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaComponent
     */
    omit?: DaishaComponentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaComponentInclude<ExtArgs> | null
    where?: DaishaComponentWhereInput
    orderBy?: DaishaComponentOrderByWithRelationInput | DaishaComponentOrderByWithRelationInput[]
    cursor?: DaishaComponentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DaishaComponentScalarFieldEnum | DaishaComponentScalarFieldEnum[]
  }

  /**
   * DaishaType without action
   */
  export type DaishaTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaType
     */
    select?: DaishaTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaType
     */
    omit?: DaishaTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaTypeInclude<ExtArgs> | null
  }


  /**
   * Model DaishaComponent
   */

  export type AggregateDaishaComponent = {
    _count: DaishaComponentCountAggregateOutputType | null
    _avg: DaishaComponentAvgAggregateOutputType | null
    _sum: DaishaComponentSumAggregateOutputType | null
    _min: DaishaComponentMinAggregateOutputType | null
    _max: DaishaComponentMaxAggregateOutputType | null
  }

  export type DaishaComponentAvgAggregateOutputType = {
    id: number | null
    daishaTypeId: number | null
  }

  export type DaishaComponentSumAggregateOutputType = {
    id: number | null
    daishaTypeId: number | null
  }

  export type DaishaComponentMinAggregateOutputType = {
    id: number | null
    daishaTypeId: number | null
    name: string | null
  }

  export type DaishaComponentMaxAggregateOutputType = {
    id: number | null
    daishaTypeId: number | null
    name: string | null
  }

  export type DaishaComponentCountAggregateOutputType = {
    id: number
    daishaTypeId: number
    name: number
    _all: number
  }


  export type DaishaComponentAvgAggregateInputType = {
    id?: true
    daishaTypeId?: true
  }

  export type DaishaComponentSumAggregateInputType = {
    id?: true
    daishaTypeId?: true
  }

  export type DaishaComponentMinAggregateInputType = {
    id?: true
    daishaTypeId?: true
    name?: true
  }

  export type DaishaComponentMaxAggregateInputType = {
    id?: true
    daishaTypeId?: true
    name?: true
  }

  export type DaishaComponentCountAggregateInputType = {
    id?: true
    daishaTypeId?: true
    name?: true
    _all?: true
  }

  export type DaishaComponentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DaishaComponent to aggregate.
     */
    where?: DaishaComponentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DaishaComponents to fetch.
     */
    orderBy?: DaishaComponentOrderByWithRelationInput | DaishaComponentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DaishaComponentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DaishaComponents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DaishaComponents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DaishaComponents
    **/
    _count?: true | DaishaComponentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DaishaComponentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DaishaComponentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DaishaComponentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DaishaComponentMaxAggregateInputType
  }

  export type GetDaishaComponentAggregateType<T extends DaishaComponentAggregateArgs> = {
        [P in keyof T & keyof AggregateDaishaComponent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDaishaComponent[P]>
      : GetScalarType<T[P], AggregateDaishaComponent[P]>
  }




  export type DaishaComponentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DaishaComponentWhereInput
    orderBy?: DaishaComponentOrderByWithAggregationInput | DaishaComponentOrderByWithAggregationInput[]
    by: DaishaComponentScalarFieldEnum[] | DaishaComponentScalarFieldEnum
    having?: DaishaComponentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DaishaComponentCountAggregateInputType | true
    _avg?: DaishaComponentAvgAggregateInputType
    _sum?: DaishaComponentSumAggregateInputType
    _min?: DaishaComponentMinAggregateInputType
    _max?: DaishaComponentMaxAggregateInputType
  }

  export type DaishaComponentGroupByOutputType = {
    id: number
    daishaTypeId: number
    name: string
    _count: DaishaComponentCountAggregateOutputType | null
    _avg: DaishaComponentAvgAggregateOutputType | null
    _sum: DaishaComponentSumAggregateOutputType | null
    _min: DaishaComponentMinAggregateOutputType | null
    _max: DaishaComponentMaxAggregateOutputType | null
  }

  type GetDaishaComponentGroupByPayload<T extends DaishaComponentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DaishaComponentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DaishaComponentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DaishaComponentGroupByOutputType[P]>
            : GetScalarType<T[P], DaishaComponentGroupByOutputType[P]>
        }
      >
    >


  export type DaishaComponentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    daishaTypeId?: boolean
    name?: boolean
    daishaType?: boolean | DaishaTypeDefaultArgs<ExtArgs>
    symptoms?: boolean | DaishaComponent$symptomsArgs<ExtArgs>
    _count?: boolean | DaishaComponentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["daishaComponent"]>

  export type DaishaComponentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    daishaTypeId?: boolean
    name?: boolean
    daishaType?: boolean | DaishaTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["daishaComponent"]>

  export type DaishaComponentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    daishaTypeId?: boolean
    name?: boolean
    daishaType?: boolean | DaishaTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["daishaComponent"]>

  export type DaishaComponentSelectScalar = {
    id?: boolean
    daishaTypeId?: boolean
    name?: boolean
  }

  export type DaishaComponentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "daishaTypeId" | "name", ExtArgs["result"]["daishaComponent"]>
  export type DaishaComponentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    daishaType?: boolean | DaishaTypeDefaultArgs<ExtArgs>
    symptoms?: boolean | DaishaComponent$symptomsArgs<ExtArgs>
    _count?: boolean | DaishaComponentCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DaishaComponentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    daishaType?: boolean | DaishaTypeDefaultArgs<ExtArgs>
  }
  export type DaishaComponentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    daishaType?: boolean | DaishaTypeDefaultArgs<ExtArgs>
  }

  export type $DaishaComponentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DaishaComponent"
    objects: {
      daishaType: Prisma.$DaishaTypePayload<ExtArgs>
      symptoms: Prisma.$DaishaSymptomPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      daishaTypeId: number
      name: string
    }, ExtArgs["result"]["daishaComponent"]>
    composites: {}
  }

  type DaishaComponentGetPayload<S extends boolean | null | undefined | DaishaComponentDefaultArgs> = $Result.GetResult<Prisma.$DaishaComponentPayload, S>

  type DaishaComponentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DaishaComponentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DaishaComponentCountAggregateInputType | true
    }

  export interface DaishaComponentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DaishaComponent'], meta: { name: 'DaishaComponent' } }
    /**
     * Find zero or one DaishaComponent that matches the filter.
     * @param {DaishaComponentFindUniqueArgs} args - Arguments to find a DaishaComponent
     * @example
     * // Get one DaishaComponent
     * const daishaComponent = await prisma.daishaComponent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DaishaComponentFindUniqueArgs>(args: SelectSubset<T, DaishaComponentFindUniqueArgs<ExtArgs>>): Prisma__DaishaComponentClient<$Result.GetResult<Prisma.$DaishaComponentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DaishaComponent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DaishaComponentFindUniqueOrThrowArgs} args - Arguments to find a DaishaComponent
     * @example
     * // Get one DaishaComponent
     * const daishaComponent = await prisma.daishaComponent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DaishaComponentFindUniqueOrThrowArgs>(args: SelectSubset<T, DaishaComponentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DaishaComponentClient<$Result.GetResult<Prisma.$DaishaComponentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DaishaComponent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaComponentFindFirstArgs} args - Arguments to find a DaishaComponent
     * @example
     * // Get one DaishaComponent
     * const daishaComponent = await prisma.daishaComponent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DaishaComponentFindFirstArgs>(args?: SelectSubset<T, DaishaComponentFindFirstArgs<ExtArgs>>): Prisma__DaishaComponentClient<$Result.GetResult<Prisma.$DaishaComponentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DaishaComponent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaComponentFindFirstOrThrowArgs} args - Arguments to find a DaishaComponent
     * @example
     * // Get one DaishaComponent
     * const daishaComponent = await prisma.daishaComponent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DaishaComponentFindFirstOrThrowArgs>(args?: SelectSubset<T, DaishaComponentFindFirstOrThrowArgs<ExtArgs>>): Prisma__DaishaComponentClient<$Result.GetResult<Prisma.$DaishaComponentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DaishaComponents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaComponentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DaishaComponents
     * const daishaComponents = await prisma.daishaComponent.findMany()
     * 
     * // Get first 10 DaishaComponents
     * const daishaComponents = await prisma.daishaComponent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const daishaComponentWithIdOnly = await prisma.daishaComponent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DaishaComponentFindManyArgs>(args?: SelectSubset<T, DaishaComponentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DaishaComponentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DaishaComponent.
     * @param {DaishaComponentCreateArgs} args - Arguments to create a DaishaComponent.
     * @example
     * // Create one DaishaComponent
     * const DaishaComponent = await prisma.daishaComponent.create({
     *   data: {
     *     // ... data to create a DaishaComponent
     *   }
     * })
     * 
     */
    create<T extends DaishaComponentCreateArgs>(args: SelectSubset<T, DaishaComponentCreateArgs<ExtArgs>>): Prisma__DaishaComponentClient<$Result.GetResult<Prisma.$DaishaComponentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DaishaComponents.
     * @param {DaishaComponentCreateManyArgs} args - Arguments to create many DaishaComponents.
     * @example
     * // Create many DaishaComponents
     * const daishaComponent = await prisma.daishaComponent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DaishaComponentCreateManyArgs>(args?: SelectSubset<T, DaishaComponentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DaishaComponents and returns the data saved in the database.
     * @param {DaishaComponentCreateManyAndReturnArgs} args - Arguments to create many DaishaComponents.
     * @example
     * // Create many DaishaComponents
     * const daishaComponent = await prisma.daishaComponent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DaishaComponents and only return the `id`
     * const daishaComponentWithIdOnly = await prisma.daishaComponent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DaishaComponentCreateManyAndReturnArgs>(args?: SelectSubset<T, DaishaComponentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DaishaComponentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DaishaComponent.
     * @param {DaishaComponentDeleteArgs} args - Arguments to delete one DaishaComponent.
     * @example
     * // Delete one DaishaComponent
     * const DaishaComponent = await prisma.daishaComponent.delete({
     *   where: {
     *     // ... filter to delete one DaishaComponent
     *   }
     * })
     * 
     */
    delete<T extends DaishaComponentDeleteArgs>(args: SelectSubset<T, DaishaComponentDeleteArgs<ExtArgs>>): Prisma__DaishaComponentClient<$Result.GetResult<Prisma.$DaishaComponentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DaishaComponent.
     * @param {DaishaComponentUpdateArgs} args - Arguments to update one DaishaComponent.
     * @example
     * // Update one DaishaComponent
     * const daishaComponent = await prisma.daishaComponent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DaishaComponentUpdateArgs>(args: SelectSubset<T, DaishaComponentUpdateArgs<ExtArgs>>): Prisma__DaishaComponentClient<$Result.GetResult<Prisma.$DaishaComponentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DaishaComponents.
     * @param {DaishaComponentDeleteManyArgs} args - Arguments to filter DaishaComponents to delete.
     * @example
     * // Delete a few DaishaComponents
     * const { count } = await prisma.daishaComponent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DaishaComponentDeleteManyArgs>(args?: SelectSubset<T, DaishaComponentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DaishaComponents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaComponentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DaishaComponents
     * const daishaComponent = await prisma.daishaComponent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DaishaComponentUpdateManyArgs>(args: SelectSubset<T, DaishaComponentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DaishaComponents and returns the data updated in the database.
     * @param {DaishaComponentUpdateManyAndReturnArgs} args - Arguments to update many DaishaComponents.
     * @example
     * // Update many DaishaComponents
     * const daishaComponent = await prisma.daishaComponent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DaishaComponents and only return the `id`
     * const daishaComponentWithIdOnly = await prisma.daishaComponent.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DaishaComponentUpdateManyAndReturnArgs>(args: SelectSubset<T, DaishaComponentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DaishaComponentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DaishaComponent.
     * @param {DaishaComponentUpsertArgs} args - Arguments to update or create a DaishaComponent.
     * @example
     * // Update or create a DaishaComponent
     * const daishaComponent = await prisma.daishaComponent.upsert({
     *   create: {
     *     // ... data to create a DaishaComponent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DaishaComponent we want to update
     *   }
     * })
     */
    upsert<T extends DaishaComponentUpsertArgs>(args: SelectSubset<T, DaishaComponentUpsertArgs<ExtArgs>>): Prisma__DaishaComponentClient<$Result.GetResult<Prisma.$DaishaComponentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DaishaComponents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaComponentCountArgs} args - Arguments to filter DaishaComponents to count.
     * @example
     * // Count the number of DaishaComponents
     * const count = await prisma.daishaComponent.count({
     *   where: {
     *     // ... the filter for the DaishaComponents we want to count
     *   }
     * })
    **/
    count<T extends DaishaComponentCountArgs>(
      args?: Subset<T, DaishaComponentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DaishaComponentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DaishaComponent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaComponentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DaishaComponentAggregateArgs>(args: Subset<T, DaishaComponentAggregateArgs>): Prisma.PrismaPromise<GetDaishaComponentAggregateType<T>>

    /**
     * Group by DaishaComponent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaComponentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DaishaComponentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DaishaComponentGroupByArgs['orderBy'] }
        : { orderBy?: DaishaComponentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DaishaComponentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDaishaComponentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DaishaComponent model
   */
  readonly fields: DaishaComponentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DaishaComponent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DaishaComponentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    daishaType<T extends DaishaTypeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DaishaTypeDefaultArgs<ExtArgs>>): Prisma__DaishaTypeClient<$Result.GetResult<Prisma.$DaishaTypePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    symptoms<T extends DaishaComponent$symptomsArgs<ExtArgs> = {}>(args?: Subset<T, DaishaComponent$symptomsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DaishaSymptomPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DaishaComponent model
   */
  interface DaishaComponentFieldRefs {
    readonly id: FieldRef<"DaishaComponent", 'Int'>
    readonly daishaTypeId: FieldRef<"DaishaComponent", 'Int'>
    readonly name: FieldRef<"DaishaComponent", 'String'>
  }
    

  // Custom InputTypes
  /**
   * DaishaComponent findUnique
   */
  export type DaishaComponentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaComponent
     */
    select?: DaishaComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaComponent
     */
    omit?: DaishaComponentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaComponentInclude<ExtArgs> | null
    /**
     * Filter, which DaishaComponent to fetch.
     */
    where: DaishaComponentWhereUniqueInput
  }

  /**
   * DaishaComponent findUniqueOrThrow
   */
  export type DaishaComponentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaComponent
     */
    select?: DaishaComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaComponent
     */
    omit?: DaishaComponentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaComponentInclude<ExtArgs> | null
    /**
     * Filter, which DaishaComponent to fetch.
     */
    where: DaishaComponentWhereUniqueInput
  }

  /**
   * DaishaComponent findFirst
   */
  export type DaishaComponentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaComponent
     */
    select?: DaishaComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaComponent
     */
    omit?: DaishaComponentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaComponentInclude<ExtArgs> | null
    /**
     * Filter, which DaishaComponent to fetch.
     */
    where?: DaishaComponentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DaishaComponents to fetch.
     */
    orderBy?: DaishaComponentOrderByWithRelationInput | DaishaComponentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DaishaComponents.
     */
    cursor?: DaishaComponentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DaishaComponents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DaishaComponents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DaishaComponents.
     */
    distinct?: DaishaComponentScalarFieldEnum | DaishaComponentScalarFieldEnum[]
  }

  /**
   * DaishaComponent findFirstOrThrow
   */
  export type DaishaComponentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaComponent
     */
    select?: DaishaComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaComponent
     */
    omit?: DaishaComponentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaComponentInclude<ExtArgs> | null
    /**
     * Filter, which DaishaComponent to fetch.
     */
    where?: DaishaComponentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DaishaComponents to fetch.
     */
    orderBy?: DaishaComponentOrderByWithRelationInput | DaishaComponentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DaishaComponents.
     */
    cursor?: DaishaComponentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DaishaComponents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DaishaComponents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DaishaComponents.
     */
    distinct?: DaishaComponentScalarFieldEnum | DaishaComponentScalarFieldEnum[]
  }

  /**
   * DaishaComponent findMany
   */
  export type DaishaComponentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaComponent
     */
    select?: DaishaComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaComponent
     */
    omit?: DaishaComponentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaComponentInclude<ExtArgs> | null
    /**
     * Filter, which DaishaComponents to fetch.
     */
    where?: DaishaComponentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DaishaComponents to fetch.
     */
    orderBy?: DaishaComponentOrderByWithRelationInput | DaishaComponentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DaishaComponents.
     */
    cursor?: DaishaComponentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DaishaComponents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DaishaComponents.
     */
    skip?: number
    distinct?: DaishaComponentScalarFieldEnum | DaishaComponentScalarFieldEnum[]
  }

  /**
   * DaishaComponent create
   */
  export type DaishaComponentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaComponent
     */
    select?: DaishaComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaComponent
     */
    omit?: DaishaComponentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaComponentInclude<ExtArgs> | null
    /**
     * The data needed to create a DaishaComponent.
     */
    data: XOR<DaishaComponentCreateInput, DaishaComponentUncheckedCreateInput>
  }

  /**
   * DaishaComponent createMany
   */
  export type DaishaComponentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DaishaComponents.
     */
    data: DaishaComponentCreateManyInput | DaishaComponentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DaishaComponent createManyAndReturn
   */
  export type DaishaComponentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaComponent
     */
    select?: DaishaComponentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaComponent
     */
    omit?: DaishaComponentOmit<ExtArgs> | null
    /**
     * The data used to create many DaishaComponents.
     */
    data: DaishaComponentCreateManyInput | DaishaComponentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaComponentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DaishaComponent update
   */
  export type DaishaComponentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaComponent
     */
    select?: DaishaComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaComponent
     */
    omit?: DaishaComponentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaComponentInclude<ExtArgs> | null
    /**
     * The data needed to update a DaishaComponent.
     */
    data: XOR<DaishaComponentUpdateInput, DaishaComponentUncheckedUpdateInput>
    /**
     * Choose, which DaishaComponent to update.
     */
    where: DaishaComponentWhereUniqueInput
  }

  /**
   * DaishaComponent updateMany
   */
  export type DaishaComponentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DaishaComponents.
     */
    data: XOR<DaishaComponentUpdateManyMutationInput, DaishaComponentUncheckedUpdateManyInput>
    /**
     * Filter which DaishaComponents to update
     */
    where?: DaishaComponentWhereInput
    /**
     * Limit how many DaishaComponents to update.
     */
    limit?: number
  }

  /**
   * DaishaComponent updateManyAndReturn
   */
  export type DaishaComponentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaComponent
     */
    select?: DaishaComponentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaComponent
     */
    omit?: DaishaComponentOmit<ExtArgs> | null
    /**
     * The data used to update DaishaComponents.
     */
    data: XOR<DaishaComponentUpdateManyMutationInput, DaishaComponentUncheckedUpdateManyInput>
    /**
     * Filter which DaishaComponents to update
     */
    where?: DaishaComponentWhereInput
    /**
     * Limit how many DaishaComponents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaComponentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * DaishaComponent upsert
   */
  export type DaishaComponentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaComponent
     */
    select?: DaishaComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaComponent
     */
    omit?: DaishaComponentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaComponentInclude<ExtArgs> | null
    /**
     * The filter to search for the DaishaComponent to update in case it exists.
     */
    where: DaishaComponentWhereUniqueInput
    /**
     * In case the DaishaComponent found by the `where` argument doesn't exist, create a new DaishaComponent with this data.
     */
    create: XOR<DaishaComponentCreateInput, DaishaComponentUncheckedCreateInput>
    /**
     * In case the DaishaComponent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DaishaComponentUpdateInput, DaishaComponentUncheckedUpdateInput>
  }

  /**
   * DaishaComponent delete
   */
  export type DaishaComponentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaComponent
     */
    select?: DaishaComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaComponent
     */
    omit?: DaishaComponentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaComponentInclude<ExtArgs> | null
    /**
     * Filter which DaishaComponent to delete.
     */
    where: DaishaComponentWhereUniqueInput
  }

  /**
   * DaishaComponent deleteMany
   */
  export type DaishaComponentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DaishaComponents to delete
     */
    where?: DaishaComponentWhereInput
    /**
     * Limit how many DaishaComponents to delete.
     */
    limit?: number
  }

  /**
   * DaishaComponent.symptoms
   */
  export type DaishaComponent$symptomsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaSymptom
     */
    select?: DaishaSymptomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaSymptom
     */
    omit?: DaishaSymptomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaSymptomInclude<ExtArgs> | null
    where?: DaishaSymptomWhereInput
    orderBy?: DaishaSymptomOrderByWithRelationInput | DaishaSymptomOrderByWithRelationInput[]
    cursor?: DaishaSymptomWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DaishaSymptomScalarFieldEnum | DaishaSymptomScalarFieldEnum[]
  }

  /**
   * DaishaComponent without action
   */
  export type DaishaComponentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaComponent
     */
    select?: DaishaComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaComponent
     */
    omit?: DaishaComponentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaComponentInclude<ExtArgs> | null
  }


  /**
   * Model DaishaSymptom
   */

  export type AggregateDaishaSymptom = {
    _count: DaishaSymptomCountAggregateOutputType | null
    _avg: DaishaSymptomAvgAggregateOutputType | null
    _sum: DaishaSymptomSumAggregateOutputType | null
    _min: DaishaSymptomMinAggregateOutputType | null
    _max: DaishaSymptomMaxAggregateOutputType | null
  }

  export type DaishaSymptomAvgAggregateOutputType = {
    id: number | null
    componentId: number | null
  }

  export type DaishaSymptomSumAggregateOutputType = {
    id: number | null
    componentId: number | null
  }

  export type DaishaSymptomMinAggregateOutputType = {
    id: number | null
    componentId: number | null
    description: string | null
  }

  export type DaishaSymptomMaxAggregateOutputType = {
    id: number | null
    componentId: number | null
    description: string | null
  }

  export type DaishaSymptomCountAggregateOutputType = {
    id: number
    componentId: number
    description: number
    _all: number
  }


  export type DaishaSymptomAvgAggregateInputType = {
    id?: true
    componentId?: true
  }

  export type DaishaSymptomSumAggregateInputType = {
    id?: true
    componentId?: true
  }

  export type DaishaSymptomMinAggregateInputType = {
    id?: true
    componentId?: true
    description?: true
  }

  export type DaishaSymptomMaxAggregateInputType = {
    id?: true
    componentId?: true
    description?: true
  }

  export type DaishaSymptomCountAggregateInputType = {
    id?: true
    componentId?: true
    description?: true
    _all?: true
  }

  export type DaishaSymptomAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DaishaSymptom to aggregate.
     */
    where?: DaishaSymptomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DaishaSymptoms to fetch.
     */
    orderBy?: DaishaSymptomOrderByWithRelationInput | DaishaSymptomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DaishaSymptomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DaishaSymptoms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DaishaSymptoms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DaishaSymptoms
    **/
    _count?: true | DaishaSymptomCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DaishaSymptomAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DaishaSymptomSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DaishaSymptomMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DaishaSymptomMaxAggregateInputType
  }

  export type GetDaishaSymptomAggregateType<T extends DaishaSymptomAggregateArgs> = {
        [P in keyof T & keyof AggregateDaishaSymptom]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDaishaSymptom[P]>
      : GetScalarType<T[P], AggregateDaishaSymptom[P]>
  }




  export type DaishaSymptomGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DaishaSymptomWhereInput
    orderBy?: DaishaSymptomOrderByWithAggregationInput | DaishaSymptomOrderByWithAggregationInput[]
    by: DaishaSymptomScalarFieldEnum[] | DaishaSymptomScalarFieldEnum
    having?: DaishaSymptomScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DaishaSymptomCountAggregateInputType | true
    _avg?: DaishaSymptomAvgAggregateInputType
    _sum?: DaishaSymptomSumAggregateInputType
    _min?: DaishaSymptomMinAggregateInputType
    _max?: DaishaSymptomMaxAggregateInputType
  }

  export type DaishaSymptomGroupByOutputType = {
    id: number
    componentId: number
    description: string
    _count: DaishaSymptomCountAggregateOutputType | null
    _avg: DaishaSymptomAvgAggregateOutputType | null
    _sum: DaishaSymptomSumAggregateOutputType | null
    _min: DaishaSymptomMinAggregateOutputType | null
    _max: DaishaSymptomMaxAggregateOutputType | null
  }

  type GetDaishaSymptomGroupByPayload<T extends DaishaSymptomGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DaishaSymptomGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DaishaSymptomGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DaishaSymptomGroupByOutputType[P]>
            : GetScalarType<T[P], DaishaSymptomGroupByOutputType[P]>
        }
      >
    >


  export type DaishaSymptomSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    componentId?: boolean
    description?: boolean
    component?: boolean | DaishaComponentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["daishaSymptom"]>

  export type DaishaSymptomSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    componentId?: boolean
    description?: boolean
    component?: boolean | DaishaComponentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["daishaSymptom"]>

  export type DaishaSymptomSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    componentId?: boolean
    description?: boolean
    component?: boolean | DaishaComponentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["daishaSymptom"]>

  export type DaishaSymptomSelectScalar = {
    id?: boolean
    componentId?: boolean
    description?: boolean
  }

  export type DaishaSymptomOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "componentId" | "description", ExtArgs["result"]["daishaSymptom"]>
  export type DaishaSymptomInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    component?: boolean | DaishaComponentDefaultArgs<ExtArgs>
  }
  export type DaishaSymptomIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    component?: boolean | DaishaComponentDefaultArgs<ExtArgs>
  }
  export type DaishaSymptomIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    component?: boolean | DaishaComponentDefaultArgs<ExtArgs>
  }

  export type $DaishaSymptomPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DaishaSymptom"
    objects: {
      component: Prisma.$DaishaComponentPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      componentId: number
      description: string
    }, ExtArgs["result"]["daishaSymptom"]>
    composites: {}
  }

  type DaishaSymptomGetPayload<S extends boolean | null | undefined | DaishaSymptomDefaultArgs> = $Result.GetResult<Prisma.$DaishaSymptomPayload, S>

  type DaishaSymptomCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DaishaSymptomFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DaishaSymptomCountAggregateInputType | true
    }

  export interface DaishaSymptomDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DaishaSymptom'], meta: { name: 'DaishaSymptom' } }
    /**
     * Find zero or one DaishaSymptom that matches the filter.
     * @param {DaishaSymptomFindUniqueArgs} args - Arguments to find a DaishaSymptom
     * @example
     * // Get one DaishaSymptom
     * const daishaSymptom = await prisma.daishaSymptom.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DaishaSymptomFindUniqueArgs>(args: SelectSubset<T, DaishaSymptomFindUniqueArgs<ExtArgs>>): Prisma__DaishaSymptomClient<$Result.GetResult<Prisma.$DaishaSymptomPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DaishaSymptom that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DaishaSymptomFindUniqueOrThrowArgs} args - Arguments to find a DaishaSymptom
     * @example
     * // Get one DaishaSymptom
     * const daishaSymptom = await prisma.daishaSymptom.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DaishaSymptomFindUniqueOrThrowArgs>(args: SelectSubset<T, DaishaSymptomFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DaishaSymptomClient<$Result.GetResult<Prisma.$DaishaSymptomPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DaishaSymptom that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaSymptomFindFirstArgs} args - Arguments to find a DaishaSymptom
     * @example
     * // Get one DaishaSymptom
     * const daishaSymptom = await prisma.daishaSymptom.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DaishaSymptomFindFirstArgs>(args?: SelectSubset<T, DaishaSymptomFindFirstArgs<ExtArgs>>): Prisma__DaishaSymptomClient<$Result.GetResult<Prisma.$DaishaSymptomPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DaishaSymptom that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaSymptomFindFirstOrThrowArgs} args - Arguments to find a DaishaSymptom
     * @example
     * // Get one DaishaSymptom
     * const daishaSymptom = await prisma.daishaSymptom.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DaishaSymptomFindFirstOrThrowArgs>(args?: SelectSubset<T, DaishaSymptomFindFirstOrThrowArgs<ExtArgs>>): Prisma__DaishaSymptomClient<$Result.GetResult<Prisma.$DaishaSymptomPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DaishaSymptoms that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaSymptomFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DaishaSymptoms
     * const daishaSymptoms = await prisma.daishaSymptom.findMany()
     * 
     * // Get first 10 DaishaSymptoms
     * const daishaSymptoms = await prisma.daishaSymptom.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const daishaSymptomWithIdOnly = await prisma.daishaSymptom.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DaishaSymptomFindManyArgs>(args?: SelectSubset<T, DaishaSymptomFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DaishaSymptomPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DaishaSymptom.
     * @param {DaishaSymptomCreateArgs} args - Arguments to create a DaishaSymptom.
     * @example
     * // Create one DaishaSymptom
     * const DaishaSymptom = await prisma.daishaSymptom.create({
     *   data: {
     *     // ... data to create a DaishaSymptom
     *   }
     * })
     * 
     */
    create<T extends DaishaSymptomCreateArgs>(args: SelectSubset<T, DaishaSymptomCreateArgs<ExtArgs>>): Prisma__DaishaSymptomClient<$Result.GetResult<Prisma.$DaishaSymptomPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DaishaSymptoms.
     * @param {DaishaSymptomCreateManyArgs} args - Arguments to create many DaishaSymptoms.
     * @example
     * // Create many DaishaSymptoms
     * const daishaSymptom = await prisma.daishaSymptom.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DaishaSymptomCreateManyArgs>(args?: SelectSubset<T, DaishaSymptomCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DaishaSymptoms and returns the data saved in the database.
     * @param {DaishaSymptomCreateManyAndReturnArgs} args - Arguments to create many DaishaSymptoms.
     * @example
     * // Create many DaishaSymptoms
     * const daishaSymptom = await prisma.daishaSymptom.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DaishaSymptoms and only return the `id`
     * const daishaSymptomWithIdOnly = await prisma.daishaSymptom.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DaishaSymptomCreateManyAndReturnArgs>(args?: SelectSubset<T, DaishaSymptomCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DaishaSymptomPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DaishaSymptom.
     * @param {DaishaSymptomDeleteArgs} args - Arguments to delete one DaishaSymptom.
     * @example
     * // Delete one DaishaSymptom
     * const DaishaSymptom = await prisma.daishaSymptom.delete({
     *   where: {
     *     // ... filter to delete one DaishaSymptom
     *   }
     * })
     * 
     */
    delete<T extends DaishaSymptomDeleteArgs>(args: SelectSubset<T, DaishaSymptomDeleteArgs<ExtArgs>>): Prisma__DaishaSymptomClient<$Result.GetResult<Prisma.$DaishaSymptomPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DaishaSymptom.
     * @param {DaishaSymptomUpdateArgs} args - Arguments to update one DaishaSymptom.
     * @example
     * // Update one DaishaSymptom
     * const daishaSymptom = await prisma.daishaSymptom.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DaishaSymptomUpdateArgs>(args: SelectSubset<T, DaishaSymptomUpdateArgs<ExtArgs>>): Prisma__DaishaSymptomClient<$Result.GetResult<Prisma.$DaishaSymptomPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DaishaSymptoms.
     * @param {DaishaSymptomDeleteManyArgs} args - Arguments to filter DaishaSymptoms to delete.
     * @example
     * // Delete a few DaishaSymptoms
     * const { count } = await prisma.daishaSymptom.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DaishaSymptomDeleteManyArgs>(args?: SelectSubset<T, DaishaSymptomDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DaishaSymptoms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaSymptomUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DaishaSymptoms
     * const daishaSymptom = await prisma.daishaSymptom.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DaishaSymptomUpdateManyArgs>(args: SelectSubset<T, DaishaSymptomUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DaishaSymptoms and returns the data updated in the database.
     * @param {DaishaSymptomUpdateManyAndReturnArgs} args - Arguments to update many DaishaSymptoms.
     * @example
     * // Update many DaishaSymptoms
     * const daishaSymptom = await prisma.daishaSymptom.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DaishaSymptoms and only return the `id`
     * const daishaSymptomWithIdOnly = await prisma.daishaSymptom.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DaishaSymptomUpdateManyAndReturnArgs>(args: SelectSubset<T, DaishaSymptomUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DaishaSymptomPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DaishaSymptom.
     * @param {DaishaSymptomUpsertArgs} args - Arguments to update or create a DaishaSymptom.
     * @example
     * // Update or create a DaishaSymptom
     * const daishaSymptom = await prisma.daishaSymptom.upsert({
     *   create: {
     *     // ... data to create a DaishaSymptom
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DaishaSymptom we want to update
     *   }
     * })
     */
    upsert<T extends DaishaSymptomUpsertArgs>(args: SelectSubset<T, DaishaSymptomUpsertArgs<ExtArgs>>): Prisma__DaishaSymptomClient<$Result.GetResult<Prisma.$DaishaSymptomPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DaishaSymptoms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaSymptomCountArgs} args - Arguments to filter DaishaSymptoms to count.
     * @example
     * // Count the number of DaishaSymptoms
     * const count = await prisma.daishaSymptom.count({
     *   where: {
     *     // ... the filter for the DaishaSymptoms we want to count
     *   }
     * })
    **/
    count<T extends DaishaSymptomCountArgs>(
      args?: Subset<T, DaishaSymptomCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DaishaSymptomCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DaishaSymptom.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaSymptomAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DaishaSymptomAggregateArgs>(args: Subset<T, DaishaSymptomAggregateArgs>): Prisma.PrismaPromise<GetDaishaSymptomAggregateType<T>>

    /**
     * Group by DaishaSymptom.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DaishaSymptomGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DaishaSymptomGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DaishaSymptomGroupByArgs['orderBy'] }
        : { orderBy?: DaishaSymptomGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DaishaSymptomGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDaishaSymptomGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DaishaSymptom model
   */
  readonly fields: DaishaSymptomFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DaishaSymptom.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DaishaSymptomClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    component<T extends DaishaComponentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DaishaComponentDefaultArgs<ExtArgs>>): Prisma__DaishaComponentClient<$Result.GetResult<Prisma.$DaishaComponentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DaishaSymptom model
   */
  interface DaishaSymptomFieldRefs {
    readonly id: FieldRef<"DaishaSymptom", 'Int'>
    readonly componentId: FieldRef<"DaishaSymptom", 'Int'>
    readonly description: FieldRef<"DaishaSymptom", 'String'>
  }
    

  // Custom InputTypes
  /**
   * DaishaSymptom findUnique
   */
  export type DaishaSymptomFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaSymptom
     */
    select?: DaishaSymptomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaSymptom
     */
    omit?: DaishaSymptomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaSymptomInclude<ExtArgs> | null
    /**
     * Filter, which DaishaSymptom to fetch.
     */
    where: DaishaSymptomWhereUniqueInput
  }

  /**
   * DaishaSymptom findUniqueOrThrow
   */
  export type DaishaSymptomFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaSymptom
     */
    select?: DaishaSymptomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaSymptom
     */
    omit?: DaishaSymptomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaSymptomInclude<ExtArgs> | null
    /**
     * Filter, which DaishaSymptom to fetch.
     */
    where: DaishaSymptomWhereUniqueInput
  }

  /**
   * DaishaSymptom findFirst
   */
  export type DaishaSymptomFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaSymptom
     */
    select?: DaishaSymptomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaSymptom
     */
    omit?: DaishaSymptomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaSymptomInclude<ExtArgs> | null
    /**
     * Filter, which DaishaSymptom to fetch.
     */
    where?: DaishaSymptomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DaishaSymptoms to fetch.
     */
    orderBy?: DaishaSymptomOrderByWithRelationInput | DaishaSymptomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DaishaSymptoms.
     */
    cursor?: DaishaSymptomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DaishaSymptoms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DaishaSymptoms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DaishaSymptoms.
     */
    distinct?: DaishaSymptomScalarFieldEnum | DaishaSymptomScalarFieldEnum[]
  }

  /**
   * DaishaSymptom findFirstOrThrow
   */
  export type DaishaSymptomFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaSymptom
     */
    select?: DaishaSymptomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaSymptom
     */
    omit?: DaishaSymptomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaSymptomInclude<ExtArgs> | null
    /**
     * Filter, which DaishaSymptom to fetch.
     */
    where?: DaishaSymptomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DaishaSymptoms to fetch.
     */
    orderBy?: DaishaSymptomOrderByWithRelationInput | DaishaSymptomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DaishaSymptoms.
     */
    cursor?: DaishaSymptomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DaishaSymptoms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DaishaSymptoms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DaishaSymptoms.
     */
    distinct?: DaishaSymptomScalarFieldEnum | DaishaSymptomScalarFieldEnum[]
  }

  /**
   * DaishaSymptom findMany
   */
  export type DaishaSymptomFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaSymptom
     */
    select?: DaishaSymptomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaSymptom
     */
    omit?: DaishaSymptomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaSymptomInclude<ExtArgs> | null
    /**
     * Filter, which DaishaSymptoms to fetch.
     */
    where?: DaishaSymptomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DaishaSymptoms to fetch.
     */
    orderBy?: DaishaSymptomOrderByWithRelationInput | DaishaSymptomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DaishaSymptoms.
     */
    cursor?: DaishaSymptomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DaishaSymptoms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DaishaSymptoms.
     */
    skip?: number
    distinct?: DaishaSymptomScalarFieldEnum | DaishaSymptomScalarFieldEnum[]
  }

  /**
   * DaishaSymptom create
   */
  export type DaishaSymptomCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaSymptom
     */
    select?: DaishaSymptomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaSymptom
     */
    omit?: DaishaSymptomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaSymptomInclude<ExtArgs> | null
    /**
     * The data needed to create a DaishaSymptom.
     */
    data: XOR<DaishaSymptomCreateInput, DaishaSymptomUncheckedCreateInput>
  }

  /**
   * DaishaSymptom createMany
   */
  export type DaishaSymptomCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DaishaSymptoms.
     */
    data: DaishaSymptomCreateManyInput | DaishaSymptomCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DaishaSymptom createManyAndReturn
   */
  export type DaishaSymptomCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaSymptom
     */
    select?: DaishaSymptomSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaSymptom
     */
    omit?: DaishaSymptomOmit<ExtArgs> | null
    /**
     * The data used to create many DaishaSymptoms.
     */
    data: DaishaSymptomCreateManyInput | DaishaSymptomCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaSymptomIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DaishaSymptom update
   */
  export type DaishaSymptomUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaSymptom
     */
    select?: DaishaSymptomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaSymptom
     */
    omit?: DaishaSymptomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaSymptomInclude<ExtArgs> | null
    /**
     * The data needed to update a DaishaSymptom.
     */
    data: XOR<DaishaSymptomUpdateInput, DaishaSymptomUncheckedUpdateInput>
    /**
     * Choose, which DaishaSymptom to update.
     */
    where: DaishaSymptomWhereUniqueInput
  }

  /**
   * DaishaSymptom updateMany
   */
  export type DaishaSymptomUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DaishaSymptoms.
     */
    data: XOR<DaishaSymptomUpdateManyMutationInput, DaishaSymptomUncheckedUpdateManyInput>
    /**
     * Filter which DaishaSymptoms to update
     */
    where?: DaishaSymptomWhereInput
    /**
     * Limit how many DaishaSymptoms to update.
     */
    limit?: number
  }

  /**
   * DaishaSymptom updateManyAndReturn
   */
  export type DaishaSymptomUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaSymptom
     */
    select?: DaishaSymptomSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaSymptom
     */
    omit?: DaishaSymptomOmit<ExtArgs> | null
    /**
     * The data used to update DaishaSymptoms.
     */
    data: XOR<DaishaSymptomUpdateManyMutationInput, DaishaSymptomUncheckedUpdateManyInput>
    /**
     * Filter which DaishaSymptoms to update
     */
    where?: DaishaSymptomWhereInput
    /**
     * Limit how many DaishaSymptoms to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaSymptomIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * DaishaSymptom upsert
   */
  export type DaishaSymptomUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaSymptom
     */
    select?: DaishaSymptomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaSymptom
     */
    omit?: DaishaSymptomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaSymptomInclude<ExtArgs> | null
    /**
     * The filter to search for the DaishaSymptom to update in case it exists.
     */
    where: DaishaSymptomWhereUniqueInput
    /**
     * In case the DaishaSymptom found by the `where` argument doesn't exist, create a new DaishaSymptom with this data.
     */
    create: XOR<DaishaSymptomCreateInput, DaishaSymptomUncheckedCreateInput>
    /**
     * In case the DaishaSymptom was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DaishaSymptomUpdateInput, DaishaSymptomUncheckedUpdateInput>
  }

  /**
   * DaishaSymptom delete
   */
  export type DaishaSymptomDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaSymptom
     */
    select?: DaishaSymptomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaSymptom
     */
    omit?: DaishaSymptomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaSymptomInclude<ExtArgs> | null
    /**
     * Filter which DaishaSymptom to delete.
     */
    where: DaishaSymptomWhereUniqueInput
  }

  /**
   * DaishaSymptom deleteMany
   */
  export type DaishaSymptomDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DaishaSymptoms to delete
     */
    where?: DaishaSymptomWhereInput
    /**
     * Limit how many DaishaSymptoms to delete.
     */
    limit?: number
  }

  /**
   * DaishaSymptom without action
   */
  export type DaishaSymptomDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DaishaSymptom
     */
    select?: DaishaSymptomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DaishaSymptom
     */
    omit?: DaishaSymptomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DaishaSymptomInclude<ExtArgs> | null
  }


  /**
   * Model SectionRequest
   */

  export type AggregateSectionRequest = {
    _count: SectionRequestCountAggregateOutputType | null
    _avg: SectionRequestAvgAggregateOutputType | null
    _sum: SectionRequestSumAggregateOutputType | null
    _min: SectionRequestMinAggregateOutputType | null
    _max: SectionRequestMaxAggregateOutputType | null
  }

  export type SectionRequestAvgAggregateOutputType = {
    id: number | null
    jumlah: number | null
  }

  export type SectionRequestSumAggregateOutputType = {
    id: number | null
    jumlah: number | null
  }

  export type SectionRequestMinAggregateOutputType = {
    id: number | null
    nomorRequest: string | null
    seksiPemohon: string | null
    picPemohon: string | null
    kontakPemohon: string | null
    namaBarang: string | null
    spesifikasi: string | null
    jumlah: number | null
    satuan: string | null
    urgensi: string | null
    catatan: string | null
    status: string | null
    alasanTolak: string | null
    picBengkel: string | null
    estimasi: string | null
    catatanAdmin: string | null
    dibuatOleh: string | null
    waktuDibuat: Date | null
    waktuUpdate: Date | null
    waktuSelesai: Date | null
  }

  export type SectionRequestMaxAggregateOutputType = {
    id: number | null
    nomorRequest: string | null
    seksiPemohon: string | null
    picPemohon: string | null
    kontakPemohon: string | null
    namaBarang: string | null
    spesifikasi: string | null
    jumlah: number | null
    satuan: string | null
    urgensi: string | null
    catatan: string | null
    status: string | null
    alasanTolak: string | null
    picBengkel: string | null
    estimasi: string | null
    catatanAdmin: string | null
    dibuatOleh: string | null
    waktuDibuat: Date | null
    waktuUpdate: Date | null
    waktuSelesai: Date | null
  }

  export type SectionRequestCountAggregateOutputType = {
    id: number
    nomorRequest: number
    seksiPemohon: number
    picPemohon: number
    kontakPemohon: number
    namaBarang: number
    spesifikasi: number
    jumlah: number
    satuan: number
    urgensi: number
    catatan: number
    status: number
    alasanTolak: number
    picBengkel: number
    estimasi: number
    catatanAdmin: number
    dibuatOleh: number
    waktuDibuat: number
    waktuUpdate: number
    waktuSelesai: number
    _all: number
  }


  export type SectionRequestAvgAggregateInputType = {
    id?: true
    jumlah?: true
  }

  export type SectionRequestSumAggregateInputType = {
    id?: true
    jumlah?: true
  }

  export type SectionRequestMinAggregateInputType = {
    id?: true
    nomorRequest?: true
    seksiPemohon?: true
    picPemohon?: true
    kontakPemohon?: true
    namaBarang?: true
    spesifikasi?: true
    jumlah?: true
    satuan?: true
    urgensi?: true
    catatan?: true
    status?: true
    alasanTolak?: true
    picBengkel?: true
    estimasi?: true
    catatanAdmin?: true
    dibuatOleh?: true
    waktuDibuat?: true
    waktuUpdate?: true
    waktuSelesai?: true
  }

  export type SectionRequestMaxAggregateInputType = {
    id?: true
    nomorRequest?: true
    seksiPemohon?: true
    picPemohon?: true
    kontakPemohon?: true
    namaBarang?: true
    spesifikasi?: true
    jumlah?: true
    satuan?: true
    urgensi?: true
    catatan?: true
    status?: true
    alasanTolak?: true
    picBengkel?: true
    estimasi?: true
    catatanAdmin?: true
    dibuatOleh?: true
    waktuDibuat?: true
    waktuUpdate?: true
    waktuSelesai?: true
  }

  export type SectionRequestCountAggregateInputType = {
    id?: true
    nomorRequest?: true
    seksiPemohon?: true
    picPemohon?: true
    kontakPemohon?: true
    namaBarang?: true
    spesifikasi?: true
    jumlah?: true
    satuan?: true
    urgensi?: true
    catatan?: true
    status?: true
    alasanTolak?: true
    picBengkel?: true
    estimasi?: true
    catatanAdmin?: true
    dibuatOleh?: true
    waktuDibuat?: true
    waktuUpdate?: true
    waktuSelesai?: true
    _all?: true
  }

  export type SectionRequestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SectionRequest to aggregate.
     */
    where?: SectionRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SectionRequests to fetch.
     */
    orderBy?: SectionRequestOrderByWithRelationInput | SectionRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SectionRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SectionRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SectionRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SectionRequests
    **/
    _count?: true | SectionRequestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SectionRequestAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SectionRequestSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SectionRequestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SectionRequestMaxAggregateInputType
  }

  export type GetSectionRequestAggregateType<T extends SectionRequestAggregateArgs> = {
        [P in keyof T & keyof AggregateSectionRequest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSectionRequest[P]>
      : GetScalarType<T[P], AggregateSectionRequest[P]>
  }




  export type SectionRequestGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SectionRequestWhereInput
    orderBy?: SectionRequestOrderByWithAggregationInput | SectionRequestOrderByWithAggregationInput[]
    by: SectionRequestScalarFieldEnum[] | SectionRequestScalarFieldEnum
    having?: SectionRequestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SectionRequestCountAggregateInputType | true
    _avg?: SectionRequestAvgAggregateInputType
    _sum?: SectionRequestSumAggregateInputType
    _min?: SectionRequestMinAggregateInputType
    _max?: SectionRequestMaxAggregateInputType
  }

  export type SectionRequestGroupByOutputType = {
    id: number
    nomorRequest: string
    seksiPemohon: string
    picPemohon: string
    kontakPemohon: string | null
    namaBarang: string
    spesifikasi: string | null
    jumlah: number
    satuan: string
    urgensi: string
    catatan: string | null
    status: string
    alasanTolak: string | null
    picBengkel: string | null
    estimasi: string | null
    catatanAdmin: string | null
    dibuatOleh: string
    waktuDibuat: Date
    waktuUpdate: Date
    waktuSelesai: Date | null
    _count: SectionRequestCountAggregateOutputType | null
    _avg: SectionRequestAvgAggregateOutputType | null
    _sum: SectionRequestSumAggregateOutputType | null
    _min: SectionRequestMinAggregateOutputType | null
    _max: SectionRequestMaxAggregateOutputType | null
  }

  type GetSectionRequestGroupByPayload<T extends SectionRequestGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SectionRequestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SectionRequestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SectionRequestGroupByOutputType[P]>
            : GetScalarType<T[P], SectionRequestGroupByOutputType[P]>
        }
      >
    >


  export type SectionRequestSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nomorRequest?: boolean
    seksiPemohon?: boolean
    picPemohon?: boolean
    kontakPemohon?: boolean
    namaBarang?: boolean
    spesifikasi?: boolean
    jumlah?: boolean
    satuan?: boolean
    urgensi?: boolean
    catatan?: boolean
    status?: boolean
    alasanTolak?: boolean
    picBengkel?: boolean
    estimasi?: boolean
    catatanAdmin?: boolean
    dibuatOleh?: boolean
    waktuDibuat?: boolean
    waktuUpdate?: boolean
    waktuSelesai?: boolean
    materials?: boolean | SectionRequest$materialsArgs<ExtArgs>
    _count?: boolean | SectionRequestCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sectionRequest"]>

  export type SectionRequestSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nomorRequest?: boolean
    seksiPemohon?: boolean
    picPemohon?: boolean
    kontakPemohon?: boolean
    namaBarang?: boolean
    spesifikasi?: boolean
    jumlah?: boolean
    satuan?: boolean
    urgensi?: boolean
    catatan?: boolean
    status?: boolean
    alasanTolak?: boolean
    picBengkel?: boolean
    estimasi?: boolean
    catatanAdmin?: boolean
    dibuatOleh?: boolean
    waktuDibuat?: boolean
    waktuUpdate?: boolean
    waktuSelesai?: boolean
  }, ExtArgs["result"]["sectionRequest"]>

  export type SectionRequestSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nomorRequest?: boolean
    seksiPemohon?: boolean
    picPemohon?: boolean
    kontakPemohon?: boolean
    namaBarang?: boolean
    spesifikasi?: boolean
    jumlah?: boolean
    satuan?: boolean
    urgensi?: boolean
    catatan?: boolean
    status?: boolean
    alasanTolak?: boolean
    picBengkel?: boolean
    estimasi?: boolean
    catatanAdmin?: boolean
    dibuatOleh?: boolean
    waktuDibuat?: boolean
    waktuUpdate?: boolean
    waktuSelesai?: boolean
  }, ExtArgs["result"]["sectionRequest"]>

  export type SectionRequestSelectScalar = {
    id?: boolean
    nomorRequest?: boolean
    seksiPemohon?: boolean
    picPemohon?: boolean
    kontakPemohon?: boolean
    namaBarang?: boolean
    spesifikasi?: boolean
    jumlah?: boolean
    satuan?: boolean
    urgensi?: boolean
    catatan?: boolean
    status?: boolean
    alasanTolak?: boolean
    picBengkel?: boolean
    estimasi?: boolean
    catatanAdmin?: boolean
    dibuatOleh?: boolean
    waktuDibuat?: boolean
    waktuUpdate?: boolean
    waktuSelesai?: boolean
  }

  export type SectionRequestOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nomorRequest" | "seksiPemohon" | "picPemohon" | "kontakPemohon" | "namaBarang" | "spesifikasi" | "jumlah" | "satuan" | "urgensi" | "catatan" | "status" | "alasanTolak" | "picBengkel" | "estimasi" | "catatanAdmin" | "dibuatOleh" | "waktuDibuat" | "waktuUpdate" | "waktuSelesai", ExtArgs["result"]["sectionRequest"]>
  export type SectionRequestInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    materials?: boolean | SectionRequest$materialsArgs<ExtArgs>
    _count?: boolean | SectionRequestCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SectionRequestIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type SectionRequestIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SectionRequestPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SectionRequest"
    objects: {
      materials: Prisma.$SectionRequestMaterialPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      nomorRequest: string
      seksiPemohon: string
      picPemohon: string
      kontakPemohon: string | null
      namaBarang: string
      spesifikasi: string | null
      jumlah: number
      satuan: string
      urgensi: string
      catatan: string | null
      status: string
      alasanTolak: string | null
      picBengkel: string | null
      estimasi: string | null
      catatanAdmin: string | null
      dibuatOleh: string
      waktuDibuat: Date
      waktuUpdate: Date
      waktuSelesai: Date | null
    }, ExtArgs["result"]["sectionRequest"]>
    composites: {}
  }

  type SectionRequestGetPayload<S extends boolean | null | undefined | SectionRequestDefaultArgs> = $Result.GetResult<Prisma.$SectionRequestPayload, S>

  type SectionRequestCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SectionRequestFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SectionRequestCountAggregateInputType | true
    }

  export interface SectionRequestDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SectionRequest'], meta: { name: 'SectionRequest' } }
    /**
     * Find zero or one SectionRequest that matches the filter.
     * @param {SectionRequestFindUniqueArgs} args - Arguments to find a SectionRequest
     * @example
     * // Get one SectionRequest
     * const sectionRequest = await prisma.sectionRequest.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SectionRequestFindUniqueArgs>(args: SelectSubset<T, SectionRequestFindUniqueArgs<ExtArgs>>): Prisma__SectionRequestClient<$Result.GetResult<Prisma.$SectionRequestPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SectionRequest that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SectionRequestFindUniqueOrThrowArgs} args - Arguments to find a SectionRequest
     * @example
     * // Get one SectionRequest
     * const sectionRequest = await prisma.sectionRequest.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SectionRequestFindUniqueOrThrowArgs>(args: SelectSubset<T, SectionRequestFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SectionRequestClient<$Result.GetResult<Prisma.$SectionRequestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SectionRequest that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionRequestFindFirstArgs} args - Arguments to find a SectionRequest
     * @example
     * // Get one SectionRequest
     * const sectionRequest = await prisma.sectionRequest.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SectionRequestFindFirstArgs>(args?: SelectSubset<T, SectionRequestFindFirstArgs<ExtArgs>>): Prisma__SectionRequestClient<$Result.GetResult<Prisma.$SectionRequestPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SectionRequest that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionRequestFindFirstOrThrowArgs} args - Arguments to find a SectionRequest
     * @example
     * // Get one SectionRequest
     * const sectionRequest = await prisma.sectionRequest.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SectionRequestFindFirstOrThrowArgs>(args?: SelectSubset<T, SectionRequestFindFirstOrThrowArgs<ExtArgs>>): Prisma__SectionRequestClient<$Result.GetResult<Prisma.$SectionRequestPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SectionRequests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionRequestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SectionRequests
     * const sectionRequests = await prisma.sectionRequest.findMany()
     * 
     * // Get first 10 SectionRequests
     * const sectionRequests = await prisma.sectionRequest.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sectionRequestWithIdOnly = await prisma.sectionRequest.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SectionRequestFindManyArgs>(args?: SelectSubset<T, SectionRequestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectionRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SectionRequest.
     * @param {SectionRequestCreateArgs} args - Arguments to create a SectionRequest.
     * @example
     * // Create one SectionRequest
     * const SectionRequest = await prisma.sectionRequest.create({
     *   data: {
     *     // ... data to create a SectionRequest
     *   }
     * })
     * 
     */
    create<T extends SectionRequestCreateArgs>(args: SelectSubset<T, SectionRequestCreateArgs<ExtArgs>>): Prisma__SectionRequestClient<$Result.GetResult<Prisma.$SectionRequestPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SectionRequests.
     * @param {SectionRequestCreateManyArgs} args - Arguments to create many SectionRequests.
     * @example
     * // Create many SectionRequests
     * const sectionRequest = await prisma.sectionRequest.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SectionRequestCreateManyArgs>(args?: SelectSubset<T, SectionRequestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SectionRequests and returns the data saved in the database.
     * @param {SectionRequestCreateManyAndReturnArgs} args - Arguments to create many SectionRequests.
     * @example
     * // Create many SectionRequests
     * const sectionRequest = await prisma.sectionRequest.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SectionRequests and only return the `id`
     * const sectionRequestWithIdOnly = await prisma.sectionRequest.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SectionRequestCreateManyAndReturnArgs>(args?: SelectSubset<T, SectionRequestCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectionRequestPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SectionRequest.
     * @param {SectionRequestDeleteArgs} args - Arguments to delete one SectionRequest.
     * @example
     * // Delete one SectionRequest
     * const SectionRequest = await prisma.sectionRequest.delete({
     *   where: {
     *     // ... filter to delete one SectionRequest
     *   }
     * })
     * 
     */
    delete<T extends SectionRequestDeleteArgs>(args: SelectSubset<T, SectionRequestDeleteArgs<ExtArgs>>): Prisma__SectionRequestClient<$Result.GetResult<Prisma.$SectionRequestPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SectionRequest.
     * @param {SectionRequestUpdateArgs} args - Arguments to update one SectionRequest.
     * @example
     * // Update one SectionRequest
     * const sectionRequest = await prisma.sectionRequest.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SectionRequestUpdateArgs>(args: SelectSubset<T, SectionRequestUpdateArgs<ExtArgs>>): Prisma__SectionRequestClient<$Result.GetResult<Prisma.$SectionRequestPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SectionRequests.
     * @param {SectionRequestDeleteManyArgs} args - Arguments to filter SectionRequests to delete.
     * @example
     * // Delete a few SectionRequests
     * const { count } = await prisma.sectionRequest.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SectionRequestDeleteManyArgs>(args?: SelectSubset<T, SectionRequestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SectionRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionRequestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SectionRequests
     * const sectionRequest = await prisma.sectionRequest.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SectionRequestUpdateManyArgs>(args: SelectSubset<T, SectionRequestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SectionRequests and returns the data updated in the database.
     * @param {SectionRequestUpdateManyAndReturnArgs} args - Arguments to update many SectionRequests.
     * @example
     * // Update many SectionRequests
     * const sectionRequest = await prisma.sectionRequest.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SectionRequests and only return the `id`
     * const sectionRequestWithIdOnly = await prisma.sectionRequest.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SectionRequestUpdateManyAndReturnArgs>(args: SelectSubset<T, SectionRequestUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectionRequestPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SectionRequest.
     * @param {SectionRequestUpsertArgs} args - Arguments to update or create a SectionRequest.
     * @example
     * // Update or create a SectionRequest
     * const sectionRequest = await prisma.sectionRequest.upsert({
     *   create: {
     *     // ... data to create a SectionRequest
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SectionRequest we want to update
     *   }
     * })
     */
    upsert<T extends SectionRequestUpsertArgs>(args: SelectSubset<T, SectionRequestUpsertArgs<ExtArgs>>): Prisma__SectionRequestClient<$Result.GetResult<Prisma.$SectionRequestPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SectionRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionRequestCountArgs} args - Arguments to filter SectionRequests to count.
     * @example
     * // Count the number of SectionRequests
     * const count = await prisma.sectionRequest.count({
     *   where: {
     *     // ... the filter for the SectionRequests we want to count
     *   }
     * })
    **/
    count<T extends SectionRequestCountArgs>(
      args?: Subset<T, SectionRequestCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SectionRequestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SectionRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionRequestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SectionRequestAggregateArgs>(args: Subset<T, SectionRequestAggregateArgs>): Prisma.PrismaPromise<GetSectionRequestAggregateType<T>>

    /**
     * Group by SectionRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionRequestGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SectionRequestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SectionRequestGroupByArgs['orderBy'] }
        : { orderBy?: SectionRequestGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SectionRequestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSectionRequestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SectionRequest model
   */
  readonly fields: SectionRequestFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SectionRequest.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SectionRequestClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    materials<T extends SectionRequest$materialsArgs<ExtArgs> = {}>(args?: Subset<T, SectionRequest$materialsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectionRequestMaterialPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SectionRequest model
   */
  interface SectionRequestFieldRefs {
    readonly id: FieldRef<"SectionRequest", 'Int'>
    readonly nomorRequest: FieldRef<"SectionRequest", 'String'>
    readonly seksiPemohon: FieldRef<"SectionRequest", 'String'>
    readonly picPemohon: FieldRef<"SectionRequest", 'String'>
    readonly kontakPemohon: FieldRef<"SectionRequest", 'String'>
    readonly namaBarang: FieldRef<"SectionRequest", 'String'>
    readonly spesifikasi: FieldRef<"SectionRequest", 'String'>
    readonly jumlah: FieldRef<"SectionRequest", 'Int'>
    readonly satuan: FieldRef<"SectionRequest", 'String'>
    readonly urgensi: FieldRef<"SectionRequest", 'String'>
    readonly catatan: FieldRef<"SectionRequest", 'String'>
    readonly status: FieldRef<"SectionRequest", 'String'>
    readonly alasanTolak: FieldRef<"SectionRequest", 'String'>
    readonly picBengkel: FieldRef<"SectionRequest", 'String'>
    readonly estimasi: FieldRef<"SectionRequest", 'String'>
    readonly catatanAdmin: FieldRef<"SectionRequest", 'String'>
    readonly dibuatOleh: FieldRef<"SectionRequest", 'String'>
    readonly waktuDibuat: FieldRef<"SectionRequest", 'DateTime'>
    readonly waktuUpdate: FieldRef<"SectionRequest", 'DateTime'>
    readonly waktuSelesai: FieldRef<"SectionRequest", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SectionRequest findUnique
   */
  export type SectionRequestFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequest
     */
    select?: SectionRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequest
     */
    omit?: SectionRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestInclude<ExtArgs> | null
    /**
     * Filter, which SectionRequest to fetch.
     */
    where: SectionRequestWhereUniqueInput
  }

  /**
   * SectionRequest findUniqueOrThrow
   */
  export type SectionRequestFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequest
     */
    select?: SectionRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequest
     */
    omit?: SectionRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestInclude<ExtArgs> | null
    /**
     * Filter, which SectionRequest to fetch.
     */
    where: SectionRequestWhereUniqueInput
  }

  /**
   * SectionRequest findFirst
   */
  export type SectionRequestFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequest
     */
    select?: SectionRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequest
     */
    omit?: SectionRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestInclude<ExtArgs> | null
    /**
     * Filter, which SectionRequest to fetch.
     */
    where?: SectionRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SectionRequests to fetch.
     */
    orderBy?: SectionRequestOrderByWithRelationInput | SectionRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SectionRequests.
     */
    cursor?: SectionRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SectionRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SectionRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SectionRequests.
     */
    distinct?: SectionRequestScalarFieldEnum | SectionRequestScalarFieldEnum[]
  }

  /**
   * SectionRequest findFirstOrThrow
   */
  export type SectionRequestFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequest
     */
    select?: SectionRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequest
     */
    omit?: SectionRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestInclude<ExtArgs> | null
    /**
     * Filter, which SectionRequest to fetch.
     */
    where?: SectionRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SectionRequests to fetch.
     */
    orderBy?: SectionRequestOrderByWithRelationInput | SectionRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SectionRequests.
     */
    cursor?: SectionRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SectionRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SectionRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SectionRequests.
     */
    distinct?: SectionRequestScalarFieldEnum | SectionRequestScalarFieldEnum[]
  }

  /**
   * SectionRequest findMany
   */
  export type SectionRequestFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequest
     */
    select?: SectionRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequest
     */
    omit?: SectionRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestInclude<ExtArgs> | null
    /**
     * Filter, which SectionRequests to fetch.
     */
    where?: SectionRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SectionRequests to fetch.
     */
    orderBy?: SectionRequestOrderByWithRelationInput | SectionRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SectionRequests.
     */
    cursor?: SectionRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SectionRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SectionRequests.
     */
    skip?: number
    distinct?: SectionRequestScalarFieldEnum | SectionRequestScalarFieldEnum[]
  }

  /**
   * SectionRequest create
   */
  export type SectionRequestCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequest
     */
    select?: SectionRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequest
     */
    omit?: SectionRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestInclude<ExtArgs> | null
    /**
     * The data needed to create a SectionRequest.
     */
    data: XOR<SectionRequestCreateInput, SectionRequestUncheckedCreateInput>
  }

  /**
   * SectionRequest createMany
   */
  export type SectionRequestCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SectionRequests.
     */
    data: SectionRequestCreateManyInput | SectionRequestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SectionRequest createManyAndReturn
   */
  export type SectionRequestCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequest
     */
    select?: SectionRequestSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequest
     */
    omit?: SectionRequestOmit<ExtArgs> | null
    /**
     * The data used to create many SectionRequests.
     */
    data: SectionRequestCreateManyInput | SectionRequestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SectionRequest update
   */
  export type SectionRequestUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequest
     */
    select?: SectionRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequest
     */
    omit?: SectionRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestInclude<ExtArgs> | null
    /**
     * The data needed to update a SectionRequest.
     */
    data: XOR<SectionRequestUpdateInput, SectionRequestUncheckedUpdateInput>
    /**
     * Choose, which SectionRequest to update.
     */
    where: SectionRequestWhereUniqueInput
  }

  /**
   * SectionRequest updateMany
   */
  export type SectionRequestUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SectionRequests.
     */
    data: XOR<SectionRequestUpdateManyMutationInput, SectionRequestUncheckedUpdateManyInput>
    /**
     * Filter which SectionRequests to update
     */
    where?: SectionRequestWhereInput
    /**
     * Limit how many SectionRequests to update.
     */
    limit?: number
  }

  /**
   * SectionRequest updateManyAndReturn
   */
  export type SectionRequestUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequest
     */
    select?: SectionRequestSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequest
     */
    omit?: SectionRequestOmit<ExtArgs> | null
    /**
     * The data used to update SectionRequests.
     */
    data: XOR<SectionRequestUpdateManyMutationInput, SectionRequestUncheckedUpdateManyInput>
    /**
     * Filter which SectionRequests to update
     */
    where?: SectionRequestWhereInput
    /**
     * Limit how many SectionRequests to update.
     */
    limit?: number
  }

  /**
   * SectionRequest upsert
   */
  export type SectionRequestUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequest
     */
    select?: SectionRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequest
     */
    omit?: SectionRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestInclude<ExtArgs> | null
    /**
     * The filter to search for the SectionRequest to update in case it exists.
     */
    where: SectionRequestWhereUniqueInput
    /**
     * In case the SectionRequest found by the `where` argument doesn't exist, create a new SectionRequest with this data.
     */
    create: XOR<SectionRequestCreateInput, SectionRequestUncheckedCreateInput>
    /**
     * In case the SectionRequest was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SectionRequestUpdateInput, SectionRequestUncheckedUpdateInput>
  }

  /**
   * SectionRequest delete
   */
  export type SectionRequestDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequest
     */
    select?: SectionRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequest
     */
    omit?: SectionRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestInclude<ExtArgs> | null
    /**
     * Filter which SectionRequest to delete.
     */
    where: SectionRequestWhereUniqueInput
  }

  /**
   * SectionRequest deleteMany
   */
  export type SectionRequestDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SectionRequests to delete
     */
    where?: SectionRequestWhereInput
    /**
     * Limit how many SectionRequests to delete.
     */
    limit?: number
  }

  /**
   * SectionRequest.materials
   */
  export type SectionRequest$materialsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequestMaterial
     */
    select?: SectionRequestMaterialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequestMaterial
     */
    omit?: SectionRequestMaterialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestMaterialInclude<ExtArgs> | null
    where?: SectionRequestMaterialWhereInput
    orderBy?: SectionRequestMaterialOrderByWithRelationInput | SectionRequestMaterialOrderByWithRelationInput[]
    cursor?: SectionRequestMaterialWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SectionRequestMaterialScalarFieldEnum | SectionRequestMaterialScalarFieldEnum[]
  }

  /**
   * SectionRequest without action
   */
  export type SectionRequestDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequest
     */
    select?: SectionRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequest
     */
    omit?: SectionRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestInclude<ExtArgs> | null
  }


  /**
   * Model SectionRequestMaterial
   */

  export type AggregateSectionRequestMaterial = {
    _count: SectionRequestMaterialCountAggregateOutputType | null
    _avg: SectionRequestMaterialAvgAggregateOutputType | null
    _sum: SectionRequestMaterialSumAggregateOutputType | null
    _min: SectionRequestMaterialMinAggregateOutputType | null
    _max: SectionRequestMaterialMaxAggregateOutputType | null
  }

  export type SectionRequestMaterialAvgAggregateOutputType = {
    id: number | null
    sectionRequestId: number | null
    qty: number | null
  }

  export type SectionRequestMaterialSumAggregateOutputType = {
    id: number | null
    sectionRequestId: number | null
    qty: number | null
  }

  export type SectionRequestMaterialMinAggregateOutputType = {
    id: number | null
    sectionRequestId: number | null
    namaKomponen: string | null
    qty: number | null
    keterangan: string | null
  }

  export type SectionRequestMaterialMaxAggregateOutputType = {
    id: number | null
    sectionRequestId: number | null
    namaKomponen: string | null
    qty: number | null
    keterangan: string | null
  }

  export type SectionRequestMaterialCountAggregateOutputType = {
    id: number
    sectionRequestId: number
    namaKomponen: number
    qty: number
    keterangan: number
    _all: number
  }


  export type SectionRequestMaterialAvgAggregateInputType = {
    id?: true
    sectionRequestId?: true
    qty?: true
  }

  export type SectionRequestMaterialSumAggregateInputType = {
    id?: true
    sectionRequestId?: true
    qty?: true
  }

  export type SectionRequestMaterialMinAggregateInputType = {
    id?: true
    sectionRequestId?: true
    namaKomponen?: true
    qty?: true
    keterangan?: true
  }

  export type SectionRequestMaterialMaxAggregateInputType = {
    id?: true
    sectionRequestId?: true
    namaKomponen?: true
    qty?: true
    keterangan?: true
  }

  export type SectionRequestMaterialCountAggregateInputType = {
    id?: true
    sectionRequestId?: true
    namaKomponen?: true
    qty?: true
    keterangan?: true
    _all?: true
  }

  export type SectionRequestMaterialAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SectionRequestMaterial to aggregate.
     */
    where?: SectionRequestMaterialWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SectionRequestMaterials to fetch.
     */
    orderBy?: SectionRequestMaterialOrderByWithRelationInput | SectionRequestMaterialOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SectionRequestMaterialWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SectionRequestMaterials from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SectionRequestMaterials.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SectionRequestMaterials
    **/
    _count?: true | SectionRequestMaterialCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SectionRequestMaterialAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SectionRequestMaterialSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SectionRequestMaterialMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SectionRequestMaterialMaxAggregateInputType
  }

  export type GetSectionRequestMaterialAggregateType<T extends SectionRequestMaterialAggregateArgs> = {
        [P in keyof T & keyof AggregateSectionRequestMaterial]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSectionRequestMaterial[P]>
      : GetScalarType<T[P], AggregateSectionRequestMaterial[P]>
  }




  export type SectionRequestMaterialGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SectionRequestMaterialWhereInput
    orderBy?: SectionRequestMaterialOrderByWithAggregationInput | SectionRequestMaterialOrderByWithAggregationInput[]
    by: SectionRequestMaterialScalarFieldEnum[] | SectionRequestMaterialScalarFieldEnum
    having?: SectionRequestMaterialScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SectionRequestMaterialCountAggregateInputType | true
    _avg?: SectionRequestMaterialAvgAggregateInputType
    _sum?: SectionRequestMaterialSumAggregateInputType
    _min?: SectionRequestMaterialMinAggregateInputType
    _max?: SectionRequestMaterialMaxAggregateInputType
  }

  export type SectionRequestMaterialGroupByOutputType = {
    id: number
    sectionRequestId: number
    namaKomponen: string
    qty: number
    keterangan: string | null
    _count: SectionRequestMaterialCountAggregateOutputType | null
    _avg: SectionRequestMaterialAvgAggregateOutputType | null
    _sum: SectionRequestMaterialSumAggregateOutputType | null
    _min: SectionRequestMaterialMinAggregateOutputType | null
    _max: SectionRequestMaterialMaxAggregateOutputType | null
  }

  type GetSectionRequestMaterialGroupByPayload<T extends SectionRequestMaterialGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SectionRequestMaterialGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SectionRequestMaterialGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SectionRequestMaterialGroupByOutputType[P]>
            : GetScalarType<T[P], SectionRequestMaterialGroupByOutputType[P]>
        }
      >
    >


  export type SectionRequestMaterialSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sectionRequestId?: boolean
    namaKomponen?: boolean
    qty?: boolean
    keterangan?: boolean
    sectionRequest?: boolean | SectionRequestDefaultArgs<ExtArgs>
    sparepart?: boolean | SparepartDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sectionRequestMaterial"]>

  export type SectionRequestMaterialSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sectionRequestId?: boolean
    namaKomponen?: boolean
    qty?: boolean
    keterangan?: boolean
    sectionRequest?: boolean | SectionRequestDefaultArgs<ExtArgs>
    sparepart?: boolean | SparepartDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sectionRequestMaterial"]>

  export type SectionRequestMaterialSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sectionRequestId?: boolean
    namaKomponen?: boolean
    qty?: boolean
    keterangan?: boolean
    sectionRequest?: boolean | SectionRequestDefaultArgs<ExtArgs>
    sparepart?: boolean | SparepartDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sectionRequestMaterial"]>

  export type SectionRequestMaterialSelectScalar = {
    id?: boolean
    sectionRequestId?: boolean
    namaKomponen?: boolean
    qty?: boolean
    keterangan?: boolean
  }

  export type SectionRequestMaterialOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sectionRequestId" | "namaKomponen" | "qty" | "keterangan", ExtArgs["result"]["sectionRequestMaterial"]>
  export type SectionRequestMaterialInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sectionRequest?: boolean | SectionRequestDefaultArgs<ExtArgs>
    sparepart?: boolean | SparepartDefaultArgs<ExtArgs>
  }
  export type SectionRequestMaterialIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sectionRequest?: boolean | SectionRequestDefaultArgs<ExtArgs>
    sparepart?: boolean | SparepartDefaultArgs<ExtArgs>
  }
  export type SectionRequestMaterialIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sectionRequest?: boolean | SectionRequestDefaultArgs<ExtArgs>
    sparepart?: boolean | SparepartDefaultArgs<ExtArgs>
  }

  export type $SectionRequestMaterialPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SectionRequestMaterial"
    objects: {
      sectionRequest: Prisma.$SectionRequestPayload<ExtArgs>
      sparepart: Prisma.$SparepartPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      sectionRequestId: number
      namaKomponen: string
      qty: number
      keterangan: string | null
    }, ExtArgs["result"]["sectionRequestMaterial"]>
    composites: {}
  }

  type SectionRequestMaterialGetPayload<S extends boolean | null | undefined | SectionRequestMaterialDefaultArgs> = $Result.GetResult<Prisma.$SectionRequestMaterialPayload, S>

  type SectionRequestMaterialCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SectionRequestMaterialFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SectionRequestMaterialCountAggregateInputType | true
    }

  export interface SectionRequestMaterialDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SectionRequestMaterial'], meta: { name: 'SectionRequestMaterial' } }
    /**
     * Find zero or one SectionRequestMaterial that matches the filter.
     * @param {SectionRequestMaterialFindUniqueArgs} args - Arguments to find a SectionRequestMaterial
     * @example
     * // Get one SectionRequestMaterial
     * const sectionRequestMaterial = await prisma.sectionRequestMaterial.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SectionRequestMaterialFindUniqueArgs>(args: SelectSubset<T, SectionRequestMaterialFindUniqueArgs<ExtArgs>>): Prisma__SectionRequestMaterialClient<$Result.GetResult<Prisma.$SectionRequestMaterialPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SectionRequestMaterial that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SectionRequestMaterialFindUniqueOrThrowArgs} args - Arguments to find a SectionRequestMaterial
     * @example
     * // Get one SectionRequestMaterial
     * const sectionRequestMaterial = await prisma.sectionRequestMaterial.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SectionRequestMaterialFindUniqueOrThrowArgs>(args: SelectSubset<T, SectionRequestMaterialFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SectionRequestMaterialClient<$Result.GetResult<Prisma.$SectionRequestMaterialPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SectionRequestMaterial that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionRequestMaterialFindFirstArgs} args - Arguments to find a SectionRequestMaterial
     * @example
     * // Get one SectionRequestMaterial
     * const sectionRequestMaterial = await prisma.sectionRequestMaterial.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SectionRequestMaterialFindFirstArgs>(args?: SelectSubset<T, SectionRequestMaterialFindFirstArgs<ExtArgs>>): Prisma__SectionRequestMaterialClient<$Result.GetResult<Prisma.$SectionRequestMaterialPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SectionRequestMaterial that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionRequestMaterialFindFirstOrThrowArgs} args - Arguments to find a SectionRequestMaterial
     * @example
     * // Get one SectionRequestMaterial
     * const sectionRequestMaterial = await prisma.sectionRequestMaterial.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SectionRequestMaterialFindFirstOrThrowArgs>(args?: SelectSubset<T, SectionRequestMaterialFindFirstOrThrowArgs<ExtArgs>>): Prisma__SectionRequestMaterialClient<$Result.GetResult<Prisma.$SectionRequestMaterialPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SectionRequestMaterials that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionRequestMaterialFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SectionRequestMaterials
     * const sectionRequestMaterials = await prisma.sectionRequestMaterial.findMany()
     * 
     * // Get first 10 SectionRequestMaterials
     * const sectionRequestMaterials = await prisma.sectionRequestMaterial.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sectionRequestMaterialWithIdOnly = await prisma.sectionRequestMaterial.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SectionRequestMaterialFindManyArgs>(args?: SelectSubset<T, SectionRequestMaterialFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectionRequestMaterialPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SectionRequestMaterial.
     * @param {SectionRequestMaterialCreateArgs} args - Arguments to create a SectionRequestMaterial.
     * @example
     * // Create one SectionRequestMaterial
     * const SectionRequestMaterial = await prisma.sectionRequestMaterial.create({
     *   data: {
     *     // ... data to create a SectionRequestMaterial
     *   }
     * })
     * 
     */
    create<T extends SectionRequestMaterialCreateArgs>(args: SelectSubset<T, SectionRequestMaterialCreateArgs<ExtArgs>>): Prisma__SectionRequestMaterialClient<$Result.GetResult<Prisma.$SectionRequestMaterialPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SectionRequestMaterials.
     * @param {SectionRequestMaterialCreateManyArgs} args - Arguments to create many SectionRequestMaterials.
     * @example
     * // Create many SectionRequestMaterials
     * const sectionRequestMaterial = await prisma.sectionRequestMaterial.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SectionRequestMaterialCreateManyArgs>(args?: SelectSubset<T, SectionRequestMaterialCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SectionRequestMaterials and returns the data saved in the database.
     * @param {SectionRequestMaterialCreateManyAndReturnArgs} args - Arguments to create many SectionRequestMaterials.
     * @example
     * // Create many SectionRequestMaterials
     * const sectionRequestMaterial = await prisma.sectionRequestMaterial.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SectionRequestMaterials and only return the `id`
     * const sectionRequestMaterialWithIdOnly = await prisma.sectionRequestMaterial.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SectionRequestMaterialCreateManyAndReturnArgs>(args?: SelectSubset<T, SectionRequestMaterialCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectionRequestMaterialPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SectionRequestMaterial.
     * @param {SectionRequestMaterialDeleteArgs} args - Arguments to delete one SectionRequestMaterial.
     * @example
     * // Delete one SectionRequestMaterial
     * const SectionRequestMaterial = await prisma.sectionRequestMaterial.delete({
     *   where: {
     *     // ... filter to delete one SectionRequestMaterial
     *   }
     * })
     * 
     */
    delete<T extends SectionRequestMaterialDeleteArgs>(args: SelectSubset<T, SectionRequestMaterialDeleteArgs<ExtArgs>>): Prisma__SectionRequestMaterialClient<$Result.GetResult<Prisma.$SectionRequestMaterialPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SectionRequestMaterial.
     * @param {SectionRequestMaterialUpdateArgs} args - Arguments to update one SectionRequestMaterial.
     * @example
     * // Update one SectionRequestMaterial
     * const sectionRequestMaterial = await prisma.sectionRequestMaterial.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SectionRequestMaterialUpdateArgs>(args: SelectSubset<T, SectionRequestMaterialUpdateArgs<ExtArgs>>): Prisma__SectionRequestMaterialClient<$Result.GetResult<Prisma.$SectionRequestMaterialPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SectionRequestMaterials.
     * @param {SectionRequestMaterialDeleteManyArgs} args - Arguments to filter SectionRequestMaterials to delete.
     * @example
     * // Delete a few SectionRequestMaterials
     * const { count } = await prisma.sectionRequestMaterial.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SectionRequestMaterialDeleteManyArgs>(args?: SelectSubset<T, SectionRequestMaterialDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SectionRequestMaterials.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionRequestMaterialUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SectionRequestMaterials
     * const sectionRequestMaterial = await prisma.sectionRequestMaterial.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SectionRequestMaterialUpdateManyArgs>(args: SelectSubset<T, SectionRequestMaterialUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SectionRequestMaterials and returns the data updated in the database.
     * @param {SectionRequestMaterialUpdateManyAndReturnArgs} args - Arguments to update many SectionRequestMaterials.
     * @example
     * // Update many SectionRequestMaterials
     * const sectionRequestMaterial = await prisma.sectionRequestMaterial.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SectionRequestMaterials and only return the `id`
     * const sectionRequestMaterialWithIdOnly = await prisma.sectionRequestMaterial.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SectionRequestMaterialUpdateManyAndReturnArgs>(args: SelectSubset<T, SectionRequestMaterialUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectionRequestMaterialPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SectionRequestMaterial.
     * @param {SectionRequestMaterialUpsertArgs} args - Arguments to update or create a SectionRequestMaterial.
     * @example
     * // Update or create a SectionRequestMaterial
     * const sectionRequestMaterial = await prisma.sectionRequestMaterial.upsert({
     *   create: {
     *     // ... data to create a SectionRequestMaterial
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SectionRequestMaterial we want to update
     *   }
     * })
     */
    upsert<T extends SectionRequestMaterialUpsertArgs>(args: SelectSubset<T, SectionRequestMaterialUpsertArgs<ExtArgs>>): Prisma__SectionRequestMaterialClient<$Result.GetResult<Prisma.$SectionRequestMaterialPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SectionRequestMaterials.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionRequestMaterialCountArgs} args - Arguments to filter SectionRequestMaterials to count.
     * @example
     * // Count the number of SectionRequestMaterials
     * const count = await prisma.sectionRequestMaterial.count({
     *   where: {
     *     // ... the filter for the SectionRequestMaterials we want to count
     *   }
     * })
    **/
    count<T extends SectionRequestMaterialCountArgs>(
      args?: Subset<T, SectionRequestMaterialCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SectionRequestMaterialCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SectionRequestMaterial.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionRequestMaterialAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SectionRequestMaterialAggregateArgs>(args: Subset<T, SectionRequestMaterialAggregateArgs>): Prisma.PrismaPromise<GetSectionRequestMaterialAggregateType<T>>

    /**
     * Group by SectionRequestMaterial.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionRequestMaterialGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SectionRequestMaterialGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SectionRequestMaterialGroupByArgs['orderBy'] }
        : { orderBy?: SectionRequestMaterialGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SectionRequestMaterialGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSectionRequestMaterialGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SectionRequestMaterial model
   */
  readonly fields: SectionRequestMaterialFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SectionRequestMaterial.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SectionRequestMaterialClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sectionRequest<T extends SectionRequestDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SectionRequestDefaultArgs<ExtArgs>>): Prisma__SectionRequestClient<$Result.GetResult<Prisma.$SectionRequestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    sparepart<T extends SparepartDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SparepartDefaultArgs<ExtArgs>>): Prisma__SparepartClient<$Result.GetResult<Prisma.$SparepartPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SectionRequestMaterial model
   */
  interface SectionRequestMaterialFieldRefs {
    readonly id: FieldRef<"SectionRequestMaterial", 'Int'>
    readonly sectionRequestId: FieldRef<"SectionRequestMaterial", 'Int'>
    readonly namaKomponen: FieldRef<"SectionRequestMaterial", 'String'>
    readonly qty: FieldRef<"SectionRequestMaterial", 'Int'>
    readonly keterangan: FieldRef<"SectionRequestMaterial", 'String'>
  }
    

  // Custom InputTypes
  /**
   * SectionRequestMaterial findUnique
   */
  export type SectionRequestMaterialFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequestMaterial
     */
    select?: SectionRequestMaterialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequestMaterial
     */
    omit?: SectionRequestMaterialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestMaterialInclude<ExtArgs> | null
    /**
     * Filter, which SectionRequestMaterial to fetch.
     */
    where: SectionRequestMaterialWhereUniqueInput
  }

  /**
   * SectionRequestMaterial findUniqueOrThrow
   */
  export type SectionRequestMaterialFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequestMaterial
     */
    select?: SectionRequestMaterialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequestMaterial
     */
    omit?: SectionRequestMaterialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestMaterialInclude<ExtArgs> | null
    /**
     * Filter, which SectionRequestMaterial to fetch.
     */
    where: SectionRequestMaterialWhereUniqueInput
  }

  /**
   * SectionRequestMaterial findFirst
   */
  export type SectionRequestMaterialFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequestMaterial
     */
    select?: SectionRequestMaterialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequestMaterial
     */
    omit?: SectionRequestMaterialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestMaterialInclude<ExtArgs> | null
    /**
     * Filter, which SectionRequestMaterial to fetch.
     */
    where?: SectionRequestMaterialWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SectionRequestMaterials to fetch.
     */
    orderBy?: SectionRequestMaterialOrderByWithRelationInput | SectionRequestMaterialOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SectionRequestMaterials.
     */
    cursor?: SectionRequestMaterialWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SectionRequestMaterials from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SectionRequestMaterials.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SectionRequestMaterials.
     */
    distinct?: SectionRequestMaterialScalarFieldEnum | SectionRequestMaterialScalarFieldEnum[]
  }

  /**
   * SectionRequestMaterial findFirstOrThrow
   */
  export type SectionRequestMaterialFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequestMaterial
     */
    select?: SectionRequestMaterialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequestMaterial
     */
    omit?: SectionRequestMaterialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestMaterialInclude<ExtArgs> | null
    /**
     * Filter, which SectionRequestMaterial to fetch.
     */
    where?: SectionRequestMaterialWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SectionRequestMaterials to fetch.
     */
    orderBy?: SectionRequestMaterialOrderByWithRelationInput | SectionRequestMaterialOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SectionRequestMaterials.
     */
    cursor?: SectionRequestMaterialWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SectionRequestMaterials from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SectionRequestMaterials.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SectionRequestMaterials.
     */
    distinct?: SectionRequestMaterialScalarFieldEnum | SectionRequestMaterialScalarFieldEnum[]
  }

  /**
   * SectionRequestMaterial findMany
   */
  export type SectionRequestMaterialFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequestMaterial
     */
    select?: SectionRequestMaterialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequestMaterial
     */
    omit?: SectionRequestMaterialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestMaterialInclude<ExtArgs> | null
    /**
     * Filter, which SectionRequestMaterials to fetch.
     */
    where?: SectionRequestMaterialWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SectionRequestMaterials to fetch.
     */
    orderBy?: SectionRequestMaterialOrderByWithRelationInput | SectionRequestMaterialOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SectionRequestMaterials.
     */
    cursor?: SectionRequestMaterialWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SectionRequestMaterials from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SectionRequestMaterials.
     */
    skip?: number
    distinct?: SectionRequestMaterialScalarFieldEnum | SectionRequestMaterialScalarFieldEnum[]
  }

  /**
   * SectionRequestMaterial create
   */
  export type SectionRequestMaterialCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequestMaterial
     */
    select?: SectionRequestMaterialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequestMaterial
     */
    omit?: SectionRequestMaterialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestMaterialInclude<ExtArgs> | null
    /**
     * The data needed to create a SectionRequestMaterial.
     */
    data: XOR<SectionRequestMaterialCreateInput, SectionRequestMaterialUncheckedCreateInput>
  }

  /**
   * SectionRequestMaterial createMany
   */
  export type SectionRequestMaterialCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SectionRequestMaterials.
     */
    data: SectionRequestMaterialCreateManyInput | SectionRequestMaterialCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SectionRequestMaterial createManyAndReturn
   */
  export type SectionRequestMaterialCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequestMaterial
     */
    select?: SectionRequestMaterialSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequestMaterial
     */
    omit?: SectionRequestMaterialOmit<ExtArgs> | null
    /**
     * The data used to create many SectionRequestMaterials.
     */
    data: SectionRequestMaterialCreateManyInput | SectionRequestMaterialCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestMaterialIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SectionRequestMaterial update
   */
  export type SectionRequestMaterialUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequestMaterial
     */
    select?: SectionRequestMaterialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequestMaterial
     */
    omit?: SectionRequestMaterialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestMaterialInclude<ExtArgs> | null
    /**
     * The data needed to update a SectionRequestMaterial.
     */
    data: XOR<SectionRequestMaterialUpdateInput, SectionRequestMaterialUncheckedUpdateInput>
    /**
     * Choose, which SectionRequestMaterial to update.
     */
    where: SectionRequestMaterialWhereUniqueInput
  }

  /**
   * SectionRequestMaterial updateMany
   */
  export type SectionRequestMaterialUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SectionRequestMaterials.
     */
    data: XOR<SectionRequestMaterialUpdateManyMutationInput, SectionRequestMaterialUncheckedUpdateManyInput>
    /**
     * Filter which SectionRequestMaterials to update
     */
    where?: SectionRequestMaterialWhereInput
    /**
     * Limit how many SectionRequestMaterials to update.
     */
    limit?: number
  }

  /**
   * SectionRequestMaterial updateManyAndReturn
   */
  export type SectionRequestMaterialUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequestMaterial
     */
    select?: SectionRequestMaterialSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequestMaterial
     */
    omit?: SectionRequestMaterialOmit<ExtArgs> | null
    /**
     * The data used to update SectionRequestMaterials.
     */
    data: XOR<SectionRequestMaterialUpdateManyMutationInput, SectionRequestMaterialUncheckedUpdateManyInput>
    /**
     * Filter which SectionRequestMaterials to update
     */
    where?: SectionRequestMaterialWhereInput
    /**
     * Limit how many SectionRequestMaterials to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestMaterialIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SectionRequestMaterial upsert
   */
  export type SectionRequestMaterialUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequestMaterial
     */
    select?: SectionRequestMaterialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequestMaterial
     */
    omit?: SectionRequestMaterialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestMaterialInclude<ExtArgs> | null
    /**
     * The filter to search for the SectionRequestMaterial to update in case it exists.
     */
    where: SectionRequestMaterialWhereUniqueInput
    /**
     * In case the SectionRequestMaterial found by the `where` argument doesn't exist, create a new SectionRequestMaterial with this data.
     */
    create: XOR<SectionRequestMaterialCreateInput, SectionRequestMaterialUncheckedCreateInput>
    /**
     * In case the SectionRequestMaterial was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SectionRequestMaterialUpdateInput, SectionRequestMaterialUncheckedUpdateInput>
  }

  /**
   * SectionRequestMaterial delete
   */
  export type SectionRequestMaterialDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequestMaterial
     */
    select?: SectionRequestMaterialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequestMaterial
     */
    omit?: SectionRequestMaterialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestMaterialInclude<ExtArgs> | null
    /**
     * Filter which SectionRequestMaterial to delete.
     */
    where: SectionRequestMaterialWhereUniqueInput
  }

  /**
   * SectionRequestMaterial deleteMany
   */
  export type SectionRequestMaterialDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SectionRequestMaterials to delete
     */
    where?: SectionRequestMaterialWhereInput
    /**
     * Limit how many SectionRequestMaterials to delete.
     */
    limit?: number
  }

  /**
   * SectionRequestMaterial without action
   */
  export type SectionRequestMaterialDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequestMaterial
     */
    select?: SectionRequestMaterialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequestMaterial
     */
    omit?: SectionRequestMaterialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestMaterialInclude<ExtArgs> | null
  }


  /**
   * Model Sparepart
   */

  export type AggregateSparepart = {
    _count: SparepartCountAggregateOutputType | null
    _avg: SparepartAvgAggregateOutputType | null
    _sum: SparepartSumAggregateOutputType | null
    _min: SparepartMinAggregateOutputType | null
    _max: SparepartMaxAggregateOutputType | null
  }

  export type SparepartAvgAggregateOutputType = {
    stokGudang: number | null
    minStok: number | null
  }

  export type SparepartSumAggregateOutputType = {
    stokGudang: number | null
    minStok: number | null
  }

  export type SparepartMinAggregateOutputType = {
    namaKomponen: string | null
    kategori: string | null
    stokGudang: number | null
    satuan: string | null
    minStok: number | null
    lokasi: string | null
  }

  export type SparepartMaxAggregateOutputType = {
    namaKomponen: string | null
    kategori: string | null
    stokGudang: number | null
    satuan: string | null
    minStok: number | null
    lokasi: string | null
  }

  export type SparepartCountAggregateOutputType = {
    namaKomponen: number
    kategori: number
    stokGudang: number
    satuan: number
    minStok: number
    lokasi: number
    _all: number
  }


  export type SparepartAvgAggregateInputType = {
    stokGudang?: true
    minStok?: true
  }

  export type SparepartSumAggregateInputType = {
    stokGudang?: true
    minStok?: true
  }

  export type SparepartMinAggregateInputType = {
    namaKomponen?: true
    kategori?: true
    stokGudang?: true
    satuan?: true
    minStok?: true
    lokasi?: true
  }

  export type SparepartMaxAggregateInputType = {
    namaKomponen?: true
    kategori?: true
    stokGudang?: true
    satuan?: true
    minStok?: true
    lokasi?: true
  }

  export type SparepartCountAggregateInputType = {
    namaKomponen?: true
    kategori?: true
    stokGudang?: true
    satuan?: true
    minStok?: true
    lokasi?: true
    _all?: true
  }

  export type SparepartAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sparepart to aggregate.
     */
    where?: SparepartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Spareparts to fetch.
     */
    orderBy?: SparepartOrderByWithRelationInput | SparepartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SparepartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Spareparts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Spareparts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Spareparts
    **/
    _count?: true | SparepartCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SparepartAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SparepartSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SparepartMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SparepartMaxAggregateInputType
  }

  export type GetSparepartAggregateType<T extends SparepartAggregateArgs> = {
        [P in keyof T & keyof AggregateSparepart]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSparepart[P]>
      : GetScalarType<T[P], AggregateSparepart[P]>
  }




  export type SparepartGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SparepartWhereInput
    orderBy?: SparepartOrderByWithAggregationInput | SparepartOrderByWithAggregationInput[]
    by: SparepartScalarFieldEnum[] | SparepartScalarFieldEnum
    having?: SparepartScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SparepartCountAggregateInputType | true
    _avg?: SparepartAvgAggregateInputType
    _sum?: SparepartSumAggregateInputType
    _min?: SparepartMinAggregateInputType
    _max?: SparepartMaxAggregateInputType
  }

  export type SparepartGroupByOutputType = {
    namaKomponen: string
    kategori: string
    stokGudang: number
    satuan: string
    minStok: number
    lokasi: string | null
    _count: SparepartCountAggregateOutputType | null
    _avg: SparepartAvgAggregateOutputType | null
    _sum: SparepartSumAggregateOutputType | null
    _min: SparepartMinAggregateOutputType | null
    _max: SparepartMaxAggregateOutputType | null
  }

  type GetSparepartGroupByPayload<T extends SparepartGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SparepartGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SparepartGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SparepartGroupByOutputType[P]>
            : GetScalarType<T[P], SparepartGroupByOutputType[P]>
        }
      >
    >


  export type SparepartSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    namaKomponen?: boolean
    kategori?: boolean
    stokGudang?: boolean
    satuan?: boolean
    minStok?: boolean
    lokasi?: boolean
    logs?: boolean | Sparepart$logsArgs<ExtArgs>
    requestMaterials?: boolean | Sparepart$requestMaterialsArgs<ExtArgs>
    _count?: boolean | SparepartCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sparepart"]>

  export type SparepartSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    namaKomponen?: boolean
    kategori?: boolean
    stokGudang?: boolean
    satuan?: boolean
    minStok?: boolean
    lokasi?: boolean
  }, ExtArgs["result"]["sparepart"]>

  export type SparepartSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    namaKomponen?: boolean
    kategori?: boolean
    stokGudang?: boolean
    satuan?: boolean
    minStok?: boolean
    lokasi?: boolean
  }, ExtArgs["result"]["sparepart"]>

  export type SparepartSelectScalar = {
    namaKomponen?: boolean
    kategori?: boolean
    stokGudang?: boolean
    satuan?: boolean
    minStok?: boolean
    lokasi?: boolean
  }

  export type SparepartOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"namaKomponen" | "kategori" | "stokGudang" | "satuan" | "minStok" | "lokasi", ExtArgs["result"]["sparepart"]>
  export type SparepartInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    logs?: boolean | Sparepart$logsArgs<ExtArgs>
    requestMaterials?: boolean | Sparepart$requestMaterialsArgs<ExtArgs>
    _count?: boolean | SparepartCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SparepartIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type SparepartIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SparepartPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Sparepart"
    objects: {
      logs: Prisma.$SparepartLogPayload<ExtArgs>[]
      requestMaterials: Prisma.$SectionRequestMaterialPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      namaKomponen: string
      kategori: string
      stokGudang: number
      satuan: string
      minStok: number
      lokasi: string | null
    }, ExtArgs["result"]["sparepart"]>
    composites: {}
  }

  type SparepartGetPayload<S extends boolean | null | undefined | SparepartDefaultArgs> = $Result.GetResult<Prisma.$SparepartPayload, S>

  type SparepartCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SparepartFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SparepartCountAggregateInputType | true
    }

  export interface SparepartDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Sparepart'], meta: { name: 'Sparepart' } }
    /**
     * Find zero or one Sparepart that matches the filter.
     * @param {SparepartFindUniqueArgs} args - Arguments to find a Sparepart
     * @example
     * // Get one Sparepart
     * const sparepart = await prisma.sparepart.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SparepartFindUniqueArgs>(args: SelectSubset<T, SparepartFindUniqueArgs<ExtArgs>>): Prisma__SparepartClient<$Result.GetResult<Prisma.$SparepartPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Sparepart that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SparepartFindUniqueOrThrowArgs} args - Arguments to find a Sparepart
     * @example
     * // Get one Sparepart
     * const sparepart = await prisma.sparepart.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SparepartFindUniqueOrThrowArgs>(args: SelectSubset<T, SparepartFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SparepartClient<$Result.GetResult<Prisma.$SparepartPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sparepart that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparepartFindFirstArgs} args - Arguments to find a Sparepart
     * @example
     * // Get one Sparepart
     * const sparepart = await prisma.sparepart.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SparepartFindFirstArgs>(args?: SelectSubset<T, SparepartFindFirstArgs<ExtArgs>>): Prisma__SparepartClient<$Result.GetResult<Prisma.$SparepartPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sparepart that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparepartFindFirstOrThrowArgs} args - Arguments to find a Sparepart
     * @example
     * // Get one Sparepart
     * const sparepart = await prisma.sparepart.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SparepartFindFirstOrThrowArgs>(args?: SelectSubset<T, SparepartFindFirstOrThrowArgs<ExtArgs>>): Prisma__SparepartClient<$Result.GetResult<Prisma.$SparepartPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Spareparts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparepartFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Spareparts
     * const spareparts = await prisma.sparepart.findMany()
     * 
     * // Get first 10 Spareparts
     * const spareparts = await prisma.sparepart.findMany({ take: 10 })
     * 
     * // Only select the `namaKomponen`
     * const sparepartWithNamaKomponenOnly = await prisma.sparepart.findMany({ select: { namaKomponen: true } })
     * 
     */
    findMany<T extends SparepartFindManyArgs>(args?: SelectSubset<T, SparepartFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SparepartPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Sparepart.
     * @param {SparepartCreateArgs} args - Arguments to create a Sparepart.
     * @example
     * // Create one Sparepart
     * const Sparepart = await prisma.sparepart.create({
     *   data: {
     *     // ... data to create a Sparepart
     *   }
     * })
     * 
     */
    create<T extends SparepartCreateArgs>(args: SelectSubset<T, SparepartCreateArgs<ExtArgs>>): Prisma__SparepartClient<$Result.GetResult<Prisma.$SparepartPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Spareparts.
     * @param {SparepartCreateManyArgs} args - Arguments to create many Spareparts.
     * @example
     * // Create many Spareparts
     * const sparepart = await prisma.sparepart.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SparepartCreateManyArgs>(args?: SelectSubset<T, SparepartCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Spareparts and returns the data saved in the database.
     * @param {SparepartCreateManyAndReturnArgs} args - Arguments to create many Spareparts.
     * @example
     * // Create many Spareparts
     * const sparepart = await prisma.sparepart.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Spareparts and only return the `namaKomponen`
     * const sparepartWithNamaKomponenOnly = await prisma.sparepart.createManyAndReturn({
     *   select: { namaKomponen: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SparepartCreateManyAndReturnArgs>(args?: SelectSubset<T, SparepartCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SparepartPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Sparepart.
     * @param {SparepartDeleteArgs} args - Arguments to delete one Sparepart.
     * @example
     * // Delete one Sparepart
     * const Sparepart = await prisma.sparepart.delete({
     *   where: {
     *     // ... filter to delete one Sparepart
     *   }
     * })
     * 
     */
    delete<T extends SparepartDeleteArgs>(args: SelectSubset<T, SparepartDeleteArgs<ExtArgs>>): Prisma__SparepartClient<$Result.GetResult<Prisma.$SparepartPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Sparepart.
     * @param {SparepartUpdateArgs} args - Arguments to update one Sparepart.
     * @example
     * // Update one Sparepart
     * const sparepart = await prisma.sparepart.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SparepartUpdateArgs>(args: SelectSubset<T, SparepartUpdateArgs<ExtArgs>>): Prisma__SparepartClient<$Result.GetResult<Prisma.$SparepartPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Spareparts.
     * @param {SparepartDeleteManyArgs} args - Arguments to filter Spareparts to delete.
     * @example
     * // Delete a few Spareparts
     * const { count } = await prisma.sparepart.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SparepartDeleteManyArgs>(args?: SelectSubset<T, SparepartDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Spareparts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparepartUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Spareparts
     * const sparepart = await prisma.sparepart.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SparepartUpdateManyArgs>(args: SelectSubset<T, SparepartUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Spareparts and returns the data updated in the database.
     * @param {SparepartUpdateManyAndReturnArgs} args - Arguments to update many Spareparts.
     * @example
     * // Update many Spareparts
     * const sparepart = await prisma.sparepart.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Spareparts and only return the `namaKomponen`
     * const sparepartWithNamaKomponenOnly = await prisma.sparepart.updateManyAndReturn({
     *   select: { namaKomponen: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SparepartUpdateManyAndReturnArgs>(args: SelectSubset<T, SparepartUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SparepartPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Sparepart.
     * @param {SparepartUpsertArgs} args - Arguments to update or create a Sparepart.
     * @example
     * // Update or create a Sparepart
     * const sparepart = await prisma.sparepart.upsert({
     *   create: {
     *     // ... data to create a Sparepart
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Sparepart we want to update
     *   }
     * })
     */
    upsert<T extends SparepartUpsertArgs>(args: SelectSubset<T, SparepartUpsertArgs<ExtArgs>>): Prisma__SparepartClient<$Result.GetResult<Prisma.$SparepartPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Spareparts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparepartCountArgs} args - Arguments to filter Spareparts to count.
     * @example
     * // Count the number of Spareparts
     * const count = await prisma.sparepart.count({
     *   where: {
     *     // ... the filter for the Spareparts we want to count
     *   }
     * })
    **/
    count<T extends SparepartCountArgs>(
      args?: Subset<T, SparepartCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SparepartCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Sparepart.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparepartAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SparepartAggregateArgs>(args: Subset<T, SparepartAggregateArgs>): Prisma.PrismaPromise<GetSparepartAggregateType<T>>

    /**
     * Group by Sparepart.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparepartGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SparepartGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SparepartGroupByArgs['orderBy'] }
        : { orderBy?: SparepartGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SparepartGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSparepartGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Sparepart model
   */
  readonly fields: SparepartFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Sparepart.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SparepartClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    logs<T extends Sparepart$logsArgs<ExtArgs> = {}>(args?: Subset<T, Sparepart$logsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SparepartLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    requestMaterials<T extends Sparepart$requestMaterialsArgs<ExtArgs> = {}>(args?: Subset<T, Sparepart$requestMaterialsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectionRequestMaterialPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Sparepart model
   */
  interface SparepartFieldRefs {
    readonly namaKomponen: FieldRef<"Sparepart", 'String'>
    readonly kategori: FieldRef<"Sparepart", 'String'>
    readonly stokGudang: FieldRef<"Sparepart", 'Int'>
    readonly satuan: FieldRef<"Sparepart", 'String'>
    readonly minStok: FieldRef<"Sparepart", 'Int'>
    readonly lokasi: FieldRef<"Sparepart", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Sparepart findUnique
   */
  export type SparepartFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sparepart
     */
    select?: SparepartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sparepart
     */
    omit?: SparepartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartInclude<ExtArgs> | null
    /**
     * Filter, which Sparepart to fetch.
     */
    where: SparepartWhereUniqueInput
  }

  /**
   * Sparepart findUniqueOrThrow
   */
  export type SparepartFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sparepart
     */
    select?: SparepartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sparepart
     */
    omit?: SparepartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartInclude<ExtArgs> | null
    /**
     * Filter, which Sparepart to fetch.
     */
    where: SparepartWhereUniqueInput
  }

  /**
   * Sparepart findFirst
   */
  export type SparepartFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sparepart
     */
    select?: SparepartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sparepart
     */
    omit?: SparepartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartInclude<ExtArgs> | null
    /**
     * Filter, which Sparepart to fetch.
     */
    where?: SparepartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Spareparts to fetch.
     */
    orderBy?: SparepartOrderByWithRelationInput | SparepartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Spareparts.
     */
    cursor?: SparepartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Spareparts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Spareparts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Spareparts.
     */
    distinct?: SparepartScalarFieldEnum | SparepartScalarFieldEnum[]
  }

  /**
   * Sparepart findFirstOrThrow
   */
  export type SparepartFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sparepart
     */
    select?: SparepartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sparepart
     */
    omit?: SparepartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartInclude<ExtArgs> | null
    /**
     * Filter, which Sparepart to fetch.
     */
    where?: SparepartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Spareparts to fetch.
     */
    orderBy?: SparepartOrderByWithRelationInput | SparepartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Spareparts.
     */
    cursor?: SparepartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Spareparts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Spareparts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Spareparts.
     */
    distinct?: SparepartScalarFieldEnum | SparepartScalarFieldEnum[]
  }

  /**
   * Sparepart findMany
   */
  export type SparepartFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sparepart
     */
    select?: SparepartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sparepart
     */
    omit?: SparepartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartInclude<ExtArgs> | null
    /**
     * Filter, which Spareparts to fetch.
     */
    where?: SparepartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Spareparts to fetch.
     */
    orderBy?: SparepartOrderByWithRelationInput | SparepartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Spareparts.
     */
    cursor?: SparepartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Spareparts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Spareparts.
     */
    skip?: number
    distinct?: SparepartScalarFieldEnum | SparepartScalarFieldEnum[]
  }

  /**
   * Sparepart create
   */
  export type SparepartCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sparepart
     */
    select?: SparepartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sparepart
     */
    omit?: SparepartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartInclude<ExtArgs> | null
    /**
     * The data needed to create a Sparepart.
     */
    data: XOR<SparepartCreateInput, SparepartUncheckedCreateInput>
  }

  /**
   * Sparepart createMany
   */
  export type SparepartCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Spareparts.
     */
    data: SparepartCreateManyInput | SparepartCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Sparepart createManyAndReturn
   */
  export type SparepartCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sparepart
     */
    select?: SparepartSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Sparepart
     */
    omit?: SparepartOmit<ExtArgs> | null
    /**
     * The data used to create many Spareparts.
     */
    data: SparepartCreateManyInput | SparepartCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Sparepart update
   */
  export type SparepartUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sparepart
     */
    select?: SparepartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sparepart
     */
    omit?: SparepartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartInclude<ExtArgs> | null
    /**
     * The data needed to update a Sparepart.
     */
    data: XOR<SparepartUpdateInput, SparepartUncheckedUpdateInput>
    /**
     * Choose, which Sparepart to update.
     */
    where: SparepartWhereUniqueInput
  }

  /**
   * Sparepart updateMany
   */
  export type SparepartUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Spareparts.
     */
    data: XOR<SparepartUpdateManyMutationInput, SparepartUncheckedUpdateManyInput>
    /**
     * Filter which Spareparts to update
     */
    where?: SparepartWhereInput
    /**
     * Limit how many Spareparts to update.
     */
    limit?: number
  }

  /**
   * Sparepart updateManyAndReturn
   */
  export type SparepartUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sparepart
     */
    select?: SparepartSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Sparepart
     */
    omit?: SparepartOmit<ExtArgs> | null
    /**
     * The data used to update Spareparts.
     */
    data: XOR<SparepartUpdateManyMutationInput, SparepartUncheckedUpdateManyInput>
    /**
     * Filter which Spareparts to update
     */
    where?: SparepartWhereInput
    /**
     * Limit how many Spareparts to update.
     */
    limit?: number
  }

  /**
   * Sparepart upsert
   */
  export type SparepartUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sparepart
     */
    select?: SparepartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sparepart
     */
    omit?: SparepartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartInclude<ExtArgs> | null
    /**
     * The filter to search for the Sparepart to update in case it exists.
     */
    where: SparepartWhereUniqueInput
    /**
     * In case the Sparepart found by the `where` argument doesn't exist, create a new Sparepart with this data.
     */
    create: XOR<SparepartCreateInput, SparepartUncheckedCreateInput>
    /**
     * In case the Sparepart was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SparepartUpdateInput, SparepartUncheckedUpdateInput>
  }

  /**
   * Sparepart delete
   */
  export type SparepartDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sparepart
     */
    select?: SparepartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sparepart
     */
    omit?: SparepartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartInclude<ExtArgs> | null
    /**
     * Filter which Sparepart to delete.
     */
    where: SparepartWhereUniqueInput
  }

  /**
   * Sparepart deleteMany
   */
  export type SparepartDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Spareparts to delete
     */
    where?: SparepartWhereInput
    /**
     * Limit how many Spareparts to delete.
     */
    limit?: number
  }

  /**
   * Sparepart.logs
   */
  export type Sparepart$logsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparepartLog
     */
    select?: SparepartLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SparepartLog
     */
    omit?: SparepartLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartLogInclude<ExtArgs> | null
    where?: SparepartLogWhereInput
    orderBy?: SparepartLogOrderByWithRelationInput | SparepartLogOrderByWithRelationInput[]
    cursor?: SparepartLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SparepartLogScalarFieldEnum | SparepartLogScalarFieldEnum[]
  }

  /**
   * Sparepart.requestMaterials
   */
  export type Sparepart$requestMaterialsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionRequestMaterial
     */
    select?: SectionRequestMaterialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SectionRequestMaterial
     */
    omit?: SectionRequestMaterialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionRequestMaterialInclude<ExtArgs> | null
    where?: SectionRequestMaterialWhereInput
    orderBy?: SectionRequestMaterialOrderByWithRelationInput | SectionRequestMaterialOrderByWithRelationInput[]
    cursor?: SectionRequestMaterialWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SectionRequestMaterialScalarFieldEnum | SectionRequestMaterialScalarFieldEnum[]
  }

  /**
   * Sparepart without action
   */
  export type SparepartDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sparepart
     */
    select?: SparepartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sparepart
     */
    omit?: SparepartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartInclude<ExtArgs> | null
  }


  /**
   * Model SparepartLog
   */

  export type AggregateSparepartLog = {
    _count: SparepartLogCountAggregateOutputType | null
    _avg: SparepartLogAvgAggregateOutputType | null
    _sum: SparepartLogSumAggregateOutputType | null
    _min: SparepartLogMinAggregateOutputType | null
    _max: SparepartLogMaxAggregateOutputType | null
  }

  export type SparepartLogAvgAggregateOutputType = {
    id: number | null
    qty: number | null
  }

  export type SparepartLogSumAggregateOutputType = {
    id: number | null
    qty: number | null
  }

  export type SparepartLogMinAggregateOutputType = {
    id: number | null
    namaKomponen: string | null
    tipe: string | null
    qty: number | null
    referensi: string | null
    keterangan: string | null
    tanggal: Date | null
  }

  export type SparepartLogMaxAggregateOutputType = {
    id: number | null
    namaKomponen: string | null
    tipe: string | null
    qty: number | null
    referensi: string | null
    keterangan: string | null
    tanggal: Date | null
  }

  export type SparepartLogCountAggregateOutputType = {
    id: number
    namaKomponen: number
    tipe: number
    qty: number
    referensi: number
    keterangan: number
    tanggal: number
    _all: number
  }


  export type SparepartLogAvgAggregateInputType = {
    id?: true
    qty?: true
  }

  export type SparepartLogSumAggregateInputType = {
    id?: true
    qty?: true
  }

  export type SparepartLogMinAggregateInputType = {
    id?: true
    namaKomponen?: true
    tipe?: true
    qty?: true
    referensi?: true
    keterangan?: true
    tanggal?: true
  }

  export type SparepartLogMaxAggregateInputType = {
    id?: true
    namaKomponen?: true
    tipe?: true
    qty?: true
    referensi?: true
    keterangan?: true
    tanggal?: true
  }

  export type SparepartLogCountAggregateInputType = {
    id?: true
    namaKomponen?: true
    tipe?: true
    qty?: true
    referensi?: true
    keterangan?: true
    tanggal?: true
    _all?: true
  }

  export type SparepartLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SparepartLog to aggregate.
     */
    where?: SparepartLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SparepartLogs to fetch.
     */
    orderBy?: SparepartLogOrderByWithRelationInput | SparepartLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SparepartLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SparepartLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SparepartLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SparepartLogs
    **/
    _count?: true | SparepartLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SparepartLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SparepartLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SparepartLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SparepartLogMaxAggregateInputType
  }

  export type GetSparepartLogAggregateType<T extends SparepartLogAggregateArgs> = {
        [P in keyof T & keyof AggregateSparepartLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSparepartLog[P]>
      : GetScalarType<T[P], AggregateSparepartLog[P]>
  }




  export type SparepartLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SparepartLogWhereInput
    orderBy?: SparepartLogOrderByWithAggregationInput | SparepartLogOrderByWithAggregationInput[]
    by: SparepartLogScalarFieldEnum[] | SparepartLogScalarFieldEnum
    having?: SparepartLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SparepartLogCountAggregateInputType | true
    _avg?: SparepartLogAvgAggregateInputType
    _sum?: SparepartLogSumAggregateInputType
    _min?: SparepartLogMinAggregateInputType
    _max?: SparepartLogMaxAggregateInputType
  }

  export type SparepartLogGroupByOutputType = {
    id: number
    namaKomponen: string
    tipe: string
    qty: number
    referensi: string | null
    keterangan: string | null
    tanggal: Date
    _count: SparepartLogCountAggregateOutputType | null
    _avg: SparepartLogAvgAggregateOutputType | null
    _sum: SparepartLogSumAggregateOutputType | null
    _min: SparepartLogMinAggregateOutputType | null
    _max: SparepartLogMaxAggregateOutputType | null
  }

  type GetSparepartLogGroupByPayload<T extends SparepartLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SparepartLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SparepartLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SparepartLogGroupByOutputType[P]>
            : GetScalarType<T[P], SparepartLogGroupByOutputType[P]>
        }
      >
    >


  export type SparepartLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    namaKomponen?: boolean
    tipe?: boolean
    qty?: boolean
    referensi?: boolean
    keterangan?: boolean
    tanggal?: boolean
    sparepart?: boolean | SparepartDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sparepartLog"]>

  export type SparepartLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    namaKomponen?: boolean
    tipe?: boolean
    qty?: boolean
    referensi?: boolean
    keterangan?: boolean
    tanggal?: boolean
    sparepart?: boolean | SparepartDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sparepartLog"]>

  export type SparepartLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    namaKomponen?: boolean
    tipe?: boolean
    qty?: boolean
    referensi?: boolean
    keterangan?: boolean
    tanggal?: boolean
    sparepart?: boolean | SparepartDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sparepartLog"]>

  export type SparepartLogSelectScalar = {
    id?: boolean
    namaKomponen?: boolean
    tipe?: boolean
    qty?: boolean
    referensi?: boolean
    keterangan?: boolean
    tanggal?: boolean
  }

  export type SparepartLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "namaKomponen" | "tipe" | "qty" | "referensi" | "keterangan" | "tanggal", ExtArgs["result"]["sparepartLog"]>
  export type SparepartLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sparepart?: boolean | SparepartDefaultArgs<ExtArgs>
  }
  export type SparepartLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sparepart?: boolean | SparepartDefaultArgs<ExtArgs>
  }
  export type SparepartLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sparepart?: boolean | SparepartDefaultArgs<ExtArgs>
  }

  export type $SparepartLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SparepartLog"
    objects: {
      sparepart: Prisma.$SparepartPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      namaKomponen: string
      tipe: string
      qty: number
      referensi: string | null
      keterangan: string | null
      tanggal: Date
    }, ExtArgs["result"]["sparepartLog"]>
    composites: {}
  }

  type SparepartLogGetPayload<S extends boolean | null | undefined | SparepartLogDefaultArgs> = $Result.GetResult<Prisma.$SparepartLogPayload, S>

  type SparepartLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SparepartLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SparepartLogCountAggregateInputType | true
    }

  export interface SparepartLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SparepartLog'], meta: { name: 'SparepartLog' } }
    /**
     * Find zero or one SparepartLog that matches the filter.
     * @param {SparepartLogFindUniqueArgs} args - Arguments to find a SparepartLog
     * @example
     * // Get one SparepartLog
     * const sparepartLog = await prisma.sparepartLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SparepartLogFindUniqueArgs>(args: SelectSubset<T, SparepartLogFindUniqueArgs<ExtArgs>>): Prisma__SparepartLogClient<$Result.GetResult<Prisma.$SparepartLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SparepartLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SparepartLogFindUniqueOrThrowArgs} args - Arguments to find a SparepartLog
     * @example
     * // Get one SparepartLog
     * const sparepartLog = await prisma.sparepartLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SparepartLogFindUniqueOrThrowArgs>(args: SelectSubset<T, SparepartLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SparepartLogClient<$Result.GetResult<Prisma.$SparepartLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SparepartLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparepartLogFindFirstArgs} args - Arguments to find a SparepartLog
     * @example
     * // Get one SparepartLog
     * const sparepartLog = await prisma.sparepartLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SparepartLogFindFirstArgs>(args?: SelectSubset<T, SparepartLogFindFirstArgs<ExtArgs>>): Prisma__SparepartLogClient<$Result.GetResult<Prisma.$SparepartLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SparepartLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparepartLogFindFirstOrThrowArgs} args - Arguments to find a SparepartLog
     * @example
     * // Get one SparepartLog
     * const sparepartLog = await prisma.sparepartLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SparepartLogFindFirstOrThrowArgs>(args?: SelectSubset<T, SparepartLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__SparepartLogClient<$Result.GetResult<Prisma.$SparepartLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SparepartLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparepartLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SparepartLogs
     * const sparepartLogs = await prisma.sparepartLog.findMany()
     * 
     * // Get first 10 SparepartLogs
     * const sparepartLogs = await prisma.sparepartLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sparepartLogWithIdOnly = await prisma.sparepartLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SparepartLogFindManyArgs>(args?: SelectSubset<T, SparepartLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SparepartLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SparepartLog.
     * @param {SparepartLogCreateArgs} args - Arguments to create a SparepartLog.
     * @example
     * // Create one SparepartLog
     * const SparepartLog = await prisma.sparepartLog.create({
     *   data: {
     *     // ... data to create a SparepartLog
     *   }
     * })
     * 
     */
    create<T extends SparepartLogCreateArgs>(args: SelectSubset<T, SparepartLogCreateArgs<ExtArgs>>): Prisma__SparepartLogClient<$Result.GetResult<Prisma.$SparepartLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SparepartLogs.
     * @param {SparepartLogCreateManyArgs} args - Arguments to create many SparepartLogs.
     * @example
     * // Create many SparepartLogs
     * const sparepartLog = await prisma.sparepartLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SparepartLogCreateManyArgs>(args?: SelectSubset<T, SparepartLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SparepartLogs and returns the data saved in the database.
     * @param {SparepartLogCreateManyAndReturnArgs} args - Arguments to create many SparepartLogs.
     * @example
     * // Create many SparepartLogs
     * const sparepartLog = await prisma.sparepartLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SparepartLogs and only return the `id`
     * const sparepartLogWithIdOnly = await prisma.sparepartLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SparepartLogCreateManyAndReturnArgs>(args?: SelectSubset<T, SparepartLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SparepartLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SparepartLog.
     * @param {SparepartLogDeleteArgs} args - Arguments to delete one SparepartLog.
     * @example
     * // Delete one SparepartLog
     * const SparepartLog = await prisma.sparepartLog.delete({
     *   where: {
     *     // ... filter to delete one SparepartLog
     *   }
     * })
     * 
     */
    delete<T extends SparepartLogDeleteArgs>(args: SelectSubset<T, SparepartLogDeleteArgs<ExtArgs>>): Prisma__SparepartLogClient<$Result.GetResult<Prisma.$SparepartLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SparepartLog.
     * @param {SparepartLogUpdateArgs} args - Arguments to update one SparepartLog.
     * @example
     * // Update one SparepartLog
     * const sparepartLog = await prisma.sparepartLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SparepartLogUpdateArgs>(args: SelectSubset<T, SparepartLogUpdateArgs<ExtArgs>>): Prisma__SparepartLogClient<$Result.GetResult<Prisma.$SparepartLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SparepartLogs.
     * @param {SparepartLogDeleteManyArgs} args - Arguments to filter SparepartLogs to delete.
     * @example
     * // Delete a few SparepartLogs
     * const { count } = await prisma.sparepartLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SparepartLogDeleteManyArgs>(args?: SelectSubset<T, SparepartLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SparepartLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparepartLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SparepartLogs
     * const sparepartLog = await prisma.sparepartLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SparepartLogUpdateManyArgs>(args: SelectSubset<T, SparepartLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SparepartLogs and returns the data updated in the database.
     * @param {SparepartLogUpdateManyAndReturnArgs} args - Arguments to update many SparepartLogs.
     * @example
     * // Update many SparepartLogs
     * const sparepartLog = await prisma.sparepartLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SparepartLogs and only return the `id`
     * const sparepartLogWithIdOnly = await prisma.sparepartLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SparepartLogUpdateManyAndReturnArgs>(args: SelectSubset<T, SparepartLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SparepartLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SparepartLog.
     * @param {SparepartLogUpsertArgs} args - Arguments to update or create a SparepartLog.
     * @example
     * // Update or create a SparepartLog
     * const sparepartLog = await prisma.sparepartLog.upsert({
     *   create: {
     *     // ... data to create a SparepartLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SparepartLog we want to update
     *   }
     * })
     */
    upsert<T extends SparepartLogUpsertArgs>(args: SelectSubset<T, SparepartLogUpsertArgs<ExtArgs>>): Prisma__SparepartLogClient<$Result.GetResult<Prisma.$SparepartLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SparepartLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparepartLogCountArgs} args - Arguments to filter SparepartLogs to count.
     * @example
     * // Count the number of SparepartLogs
     * const count = await prisma.sparepartLog.count({
     *   where: {
     *     // ... the filter for the SparepartLogs we want to count
     *   }
     * })
    **/
    count<T extends SparepartLogCountArgs>(
      args?: Subset<T, SparepartLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SparepartLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SparepartLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparepartLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SparepartLogAggregateArgs>(args: Subset<T, SparepartLogAggregateArgs>): Prisma.PrismaPromise<GetSparepartLogAggregateType<T>>

    /**
     * Group by SparepartLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparepartLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SparepartLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SparepartLogGroupByArgs['orderBy'] }
        : { orderBy?: SparepartLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SparepartLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSparepartLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SparepartLog model
   */
  readonly fields: SparepartLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SparepartLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SparepartLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sparepart<T extends SparepartDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SparepartDefaultArgs<ExtArgs>>): Prisma__SparepartClient<$Result.GetResult<Prisma.$SparepartPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SparepartLog model
   */
  interface SparepartLogFieldRefs {
    readonly id: FieldRef<"SparepartLog", 'Int'>
    readonly namaKomponen: FieldRef<"SparepartLog", 'String'>
    readonly tipe: FieldRef<"SparepartLog", 'String'>
    readonly qty: FieldRef<"SparepartLog", 'Int'>
    readonly referensi: FieldRef<"SparepartLog", 'String'>
    readonly keterangan: FieldRef<"SparepartLog", 'String'>
    readonly tanggal: FieldRef<"SparepartLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SparepartLog findUnique
   */
  export type SparepartLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparepartLog
     */
    select?: SparepartLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SparepartLog
     */
    omit?: SparepartLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartLogInclude<ExtArgs> | null
    /**
     * Filter, which SparepartLog to fetch.
     */
    where: SparepartLogWhereUniqueInput
  }

  /**
   * SparepartLog findUniqueOrThrow
   */
  export type SparepartLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparepartLog
     */
    select?: SparepartLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SparepartLog
     */
    omit?: SparepartLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartLogInclude<ExtArgs> | null
    /**
     * Filter, which SparepartLog to fetch.
     */
    where: SparepartLogWhereUniqueInput
  }

  /**
   * SparepartLog findFirst
   */
  export type SparepartLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparepartLog
     */
    select?: SparepartLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SparepartLog
     */
    omit?: SparepartLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartLogInclude<ExtArgs> | null
    /**
     * Filter, which SparepartLog to fetch.
     */
    where?: SparepartLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SparepartLogs to fetch.
     */
    orderBy?: SparepartLogOrderByWithRelationInput | SparepartLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SparepartLogs.
     */
    cursor?: SparepartLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SparepartLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SparepartLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SparepartLogs.
     */
    distinct?: SparepartLogScalarFieldEnum | SparepartLogScalarFieldEnum[]
  }

  /**
   * SparepartLog findFirstOrThrow
   */
  export type SparepartLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparepartLog
     */
    select?: SparepartLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SparepartLog
     */
    omit?: SparepartLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartLogInclude<ExtArgs> | null
    /**
     * Filter, which SparepartLog to fetch.
     */
    where?: SparepartLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SparepartLogs to fetch.
     */
    orderBy?: SparepartLogOrderByWithRelationInput | SparepartLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SparepartLogs.
     */
    cursor?: SparepartLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SparepartLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SparepartLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SparepartLogs.
     */
    distinct?: SparepartLogScalarFieldEnum | SparepartLogScalarFieldEnum[]
  }

  /**
   * SparepartLog findMany
   */
  export type SparepartLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparepartLog
     */
    select?: SparepartLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SparepartLog
     */
    omit?: SparepartLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartLogInclude<ExtArgs> | null
    /**
     * Filter, which SparepartLogs to fetch.
     */
    where?: SparepartLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SparepartLogs to fetch.
     */
    orderBy?: SparepartLogOrderByWithRelationInput | SparepartLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SparepartLogs.
     */
    cursor?: SparepartLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SparepartLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SparepartLogs.
     */
    skip?: number
    distinct?: SparepartLogScalarFieldEnum | SparepartLogScalarFieldEnum[]
  }

  /**
   * SparepartLog create
   */
  export type SparepartLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparepartLog
     */
    select?: SparepartLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SparepartLog
     */
    omit?: SparepartLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartLogInclude<ExtArgs> | null
    /**
     * The data needed to create a SparepartLog.
     */
    data: XOR<SparepartLogCreateInput, SparepartLogUncheckedCreateInput>
  }

  /**
   * SparepartLog createMany
   */
  export type SparepartLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SparepartLogs.
     */
    data: SparepartLogCreateManyInput | SparepartLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SparepartLog createManyAndReturn
   */
  export type SparepartLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparepartLog
     */
    select?: SparepartLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SparepartLog
     */
    omit?: SparepartLogOmit<ExtArgs> | null
    /**
     * The data used to create many SparepartLogs.
     */
    data: SparepartLogCreateManyInput | SparepartLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SparepartLog update
   */
  export type SparepartLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparepartLog
     */
    select?: SparepartLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SparepartLog
     */
    omit?: SparepartLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartLogInclude<ExtArgs> | null
    /**
     * The data needed to update a SparepartLog.
     */
    data: XOR<SparepartLogUpdateInput, SparepartLogUncheckedUpdateInput>
    /**
     * Choose, which SparepartLog to update.
     */
    where: SparepartLogWhereUniqueInput
  }

  /**
   * SparepartLog updateMany
   */
  export type SparepartLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SparepartLogs.
     */
    data: XOR<SparepartLogUpdateManyMutationInput, SparepartLogUncheckedUpdateManyInput>
    /**
     * Filter which SparepartLogs to update
     */
    where?: SparepartLogWhereInput
    /**
     * Limit how many SparepartLogs to update.
     */
    limit?: number
  }

  /**
   * SparepartLog updateManyAndReturn
   */
  export type SparepartLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparepartLog
     */
    select?: SparepartLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SparepartLog
     */
    omit?: SparepartLogOmit<ExtArgs> | null
    /**
     * The data used to update SparepartLogs.
     */
    data: XOR<SparepartLogUpdateManyMutationInput, SparepartLogUncheckedUpdateManyInput>
    /**
     * Filter which SparepartLogs to update
     */
    where?: SparepartLogWhereInput
    /**
     * Limit how many SparepartLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SparepartLog upsert
   */
  export type SparepartLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparepartLog
     */
    select?: SparepartLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SparepartLog
     */
    omit?: SparepartLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartLogInclude<ExtArgs> | null
    /**
     * The filter to search for the SparepartLog to update in case it exists.
     */
    where: SparepartLogWhereUniqueInput
    /**
     * In case the SparepartLog found by the `where` argument doesn't exist, create a new SparepartLog with this data.
     */
    create: XOR<SparepartLogCreateInput, SparepartLogUncheckedCreateInput>
    /**
     * In case the SparepartLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SparepartLogUpdateInput, SparepartLogUncheckedUpdateInput>
  }

  /**
   * SparepartLog delete
   */
  export type SparepartLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparepartLog
     */
    select?: SparepartLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SparepartLog
     */
    omit?: SparepartLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartLogInclude<ExtArgs> | null
    /**
     * Filter which SparepartLog to delete.
     */
    where: SparepartLogWhereUniqueInput
  }

  /**
   * SparepartLog deleteMany
   */
  export type SparepartLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SparepartLogs to delete
     */
    where?: SparepartLogWhereInput
    /**
     * Limit how many SparepartLogs to delete.
     */
    limit?: number
  }

  /**
   * SparepartLog without action
   */
  export type SparepartLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparepartLog
     */
    select?: SparepartLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SparepartLog
     */
    omit?: SparepartLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparepartLogInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    username: string | null
    password: string | null
    name: string | null
    role: string | null
    seksi: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    username: string | null
    password: string | null
    name: string | null
    role: string | null
    seksi: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    username: number
    password: number
    name: number
    role: number
    seksi: number
    description: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    username?: true
    password?: true
    name?: true
    role?: true
    seksi?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    username?: true
    password?: true
    name?: true
    role?: true
    seksi?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    username?: true
    password?: true
    name?: true
    role?: true
    seksi?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    username: string
    password: string
    name: string
    role: string
    seksi: string | null
    description: string | null
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    password?: boolean
    name?: boolean
    role?: boolean
    seksi?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    password?: boolean
    name?: boolean
    role?: boolean
    seksi?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    password?: boolean
    name?: boolean
    role?: boolean
    seksi?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    username?: boolean
    password?: boolean
    name?: boolean
    role?: boolean
    seksi?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "username" | "password" | "name" | "role" | "seksi" | "description" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      username: string
      password: string
      name: string
      role: string
      seksi: string | null
      description: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly username: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'String'>
    readonly seksi: FieldRef<"User", 'String'>
    readonly description: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const MasterDaishaScalarFieldEnum: {
    noDaisha: 'noDaisha',
    namaDaisha: 'namaDaisha',
    ukuran: 'ukuran',
    seksi: 'seksi'
  };

  export type MasterDaishaScalarFieldEnum = (typeof MasterDaishaScalarFieldEnum)[keyof typeof MasterDaishaScalarFieldEnum]


  export const TicketScalarFieldEnum: {
    idTiket: 'idTiket',
    noDaisha: 'noDaisha',
    namaPelapor: 'namaPelapor',
    status: 'status',
    waktuMasuk: 'waktuMasuk',
    waktuSelesai: 'waktuSelesai',
    catatan: 'catatan'
  };

  export type TicketScalarFieldEnum = (typeof TicketScalarFieldEnum)[keyof typeof TicketScalarFieldEnum]


  export const TicketDetailScalarFieldEnum: {
    idDetail: 'idDetail',
    idTiket: 'idTiket',
    komponen: 'komponen',
    gejala: 'gejala',
    tindakan: 'tindakan',
    qty: 'qty'
  };

  export type TicketDetailScalarFieldEnum = (typeof TicketDetailScalarFieldEnum)[keyof typeof TicketDetailScalarFieldEnum]


  export const DaishaTypeScalarFieldEnum: {
    id: 'id',
    name: 'name',
    seksi: 'seksi',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DaishaTypeScalarFieldEnum = (typeof DaishaTypeScalarFieldEnum)[keyof typeof DaishaTypeScalarFieldEnum]


  export const DaishaComponentScalarFieldEnum: {
    id: 'id',
    daishaTypeId: 'daishaTypeId',
    name: 'name'
  };

  export type DaishaComponentScalarFieldEnum = (typeof DaishaComponentScalarFieldEnum)[keyof typeof DaishaComponentScalarFieldEnum]


  export const DaishaSymptomScalarFieldEnum: {
    id: 'id',
    componentId: 'componentId',
    description: 'description'
  };

  export type DaishaSymptomScalarFieldEnum = (typeof DaishaSymptomScalarFieldEnum)[keyof typeof DaishaSymptomScalarFieldEnum]


  export const SectionRequestScalarFieldEnum: {
    id: 'id',
    nomorRequest: 'nomorRequest',
    seksiPemohon: 'seksiPemohon',
    picPemohon: 'picPemohon',
    kontakPemohon: 'kontakPemohon',
    namaBarang: 'namaBarang',
    spesifikasi: 'spesifikasi',
    jumlah: 'jumlah',
    satuan: 'satuan',
    urgensi: 'urgensi',
    catatan: 'catatan',
    status: 'status',
    alasanTolak: 'alasanTolak',
    picBengkel: 'picBengkel',
    estimasi: 'estimasi',
    catatanAdmin: 'catatanAdmin',
    dibuatOleh: 'dibuatOleh',
    waktuDibuat: 'waktuDibuat',
    waktuUpdate: 'waktuUpdate',
    waktuSelesai: 'waktuSelesai'
  };

  export type SectionRequestScalarFieldEnum = (typeof SectionRequestScalarFieldEnum)[keyof typeof SectionRequestScalarFieldEnum]


  export const SectionRequestMaterialScalarFieldEnum: {
    id: 'id',
    sectionRequestId: 'sectionRequestId',
    namaKomponen: 'namaKomponen',
    qty: 'qty',
    keterangan: 'keterangan'
  };

  export type SectionRequestMaterialScalarFieldEnum = (typeof SectionRequestMaterialScalarFieldEnum)[keyof typeof SectionRequestMaterialScalarFieldEnum]


  export const SparepartScalarFieldEnum: {
    namaKomponen: 'namaKomponen',
    kategori: 'kategori',
    stokGudang: 'stokGudang',
    satuan: 'satuan',
    minStok: 'minStok',
    lokasi: 'lokasi'
  };

  export type SparepartScalarFieldEnum = (typeof SparepartScalarFieldEnum)[keyof typeof SparepartScalarFieldEnum]


  export const SparepartLogScalarFieldEnum: {
    id: 'id',
    namaKomponen: 'namaKomponen',
    tipe: 'tipe',
    qty: 'qty',
    referensi: 'referensi',
    keterangan: 'keterangan',
    tanggal: 'tanggal'
  };

  export type SparepartLogScalarFieldEnum = (typeof SparepartLogScalarFieldEnum)[keyof typeof SparepartLogScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    username: 'username',
    password: 'password',
    name: 'name',
    role: 'role',
    seksi: 'seksi',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type MasterDaishaWhereInput = {
    AND?: MasterDaishaWhereInput | MasterDaishaWhereInput[]
    OR?: MasterDaishaWhereInput[]
    NOT?: MasterDaishaWhereInput | MasterDaishaWhereInput[]
    noDaisha?: StringFilter<"MasterDaisha"> | string
    namaDaisha?: StringFilter<"MasterDaisha"> | string
    ukuran?: StringFilter<"MasterDaisha"> | string
    seksi?: StringFilter<"MasterDaisha"> | string
    tickets?: TicketListRelationFilter
  }

  export type MasterDaishaOrderByWithRelationInput = {
    noDaisha?: SortOrder
    namaDaisha?: SortOrder
    ukuran?: SortOrder
    seksi?: SortOrder
    tickets?: TicketOrderByRelationAggregateInput
  }

  export type MasterDaishaWhereUniqueInput = Prisma.AtLeast<{
    noDaisha?: string
    AND?: MasterDaishaWhereInput | MasterDaishaWhereInput[]
    OR?: MasterDaishaWhereInput[]
    NOT?: MasterDaishaWhereInput | MasterDaishaWhereInput[]
    namaDaisha?: StringFilter<"MasterDaisha"> | string
    ukuran?: StringFilter<"MasterDaisha"> | string
    seksi?: StringFilter<"MasterDaisha"> | string
    tickets?: TicketListRelationFilter
  }, "noDaisha">

  export type MasterDaishaOrderByWithAggregationInput = {
    noDaisha?: SortOrder
    namaDaisha?: SortOrder
    ukuran?: SortOrder
    seksi?: SortOrder
    _count?: MasterDaishaCountOrderByAggregateInput
    _max?: MasterDaishaMaxOrderByAggregateInput
    _min?: MasterDaishaMinOrderByAggregateInput
  }

  export type MasterDaishaScalarWhereWithAggregatesInput = {
    AND?: MasterDaishaScalarWhereWithAggregatesInput | MasterDaishaScalarWhereWithAggregatesInput[]
    OR?: MasterDaishaScalarWhereWithAggregatesInput[]
    NOT?: MasterDaishaScalarWhereWithAggregatesInput | MasterDaishaScalarWhereWithAggregatesInput[]
    noDaisha?: StringWithAggregatesFilter<"MasterDaisha"> | string
    namaDaisha?: StringWithAggregatesFilter<"MasterDaisha"> | string
    ukuran?: StringWithAggregatesFilter<"MasterDaisha"> | string
    seksi?: StringWithAggregatesFilter<"MasterDaisha"> | string
  }

  export type TicketWhereInput = {
    AND?: TicketWhereInput | TicketWhereInput[]
    OR?: TicketWhereInput[]
    NOT?: TicketWhereInput | TicketWhereInput[]
    idTiket?: StringFilter<"Ticket"> | string
    noDaisha?: StringFilter<"Ticket"> | string
    namaPelapor?: StringFilter<"Ticket"> | string
    status?: StringFilter<"Ticket"> | string
    waktuMasuk?: DateTimeFilter<"Ticket"> | Date | string
    waktuSelesai?: DateTimeNullableFilter<"Ticket"> | Date | string | null
    catatan?: StringNullableFilter<"Ticket"> | string | null
    daisha?: XOR<MasterDaishaScalarRelationFilter, MasterDaishaWhereInput>
    details?: TicketDetailListRelationFilter
  }

  export type TicketOrderByWithRelationInput = {
    idTiket?: SortOrder
    noDaisha?: SortOrder
    namaPelapor?: SortOrder
    status?: SortOrder
    waktuMasuk?: SortOrder
    waktuSelesai?: SortOrderInput | SortOrder
    catatan?: SortOrderInput | SortOrder
    daisha?: MasterDaishaOrderByWithRelationInput
    details?: TicketDetailOrderByRelationAggregateInput
  }

  export type TicketWhereUniqueInput = Prisma.AtLeast<{
    idTiket?: string
    AND?: TicketWhereInput | TicketWhereInput[]
    OR?: TicketWhereInput[]
    NOT?: TicketWhereInput | TicketWhereInput[]
    noDaisha?: StringFilter<"Ticket"> | string
    namaPelapor?: StringFilter<"Ticket"> | string
    status?: StringFilter<"Ticket"> | string
    waktuMasuk?: DateTimeFilter<"Ticket"> | Date | string
    waktuSelesai?: DateTimeNullableFilter<"Ticket"> | Date | string | null
    catatan?: StringNullableFilter<"Ticket"> | string | null
    daisha?: XOR<MasterDaishaScalarRelationFilter, MasterDaishaWhereInput>
    details?: TicketDetailListRelationFilter
  }, "idTiket">

  export type TicketOrderByWithAggregationInput = {
    idTiket?: SortOrder
    noDaisha?: SortOrder
    namaPelapor?: SortOrder
    status?: SortOrder
    waktuMasuk?: SortOrder
    waktuSelesai?: SortOrderInput | SortOrder
    catatan?: SortOrderInput | SortOrder
    _count?: TicketCountOrderByAggregateInput
    _max?: TicketMaxOrderByAggregateInput
    _min?: TicketMinOrderByAggregateInput
  }

  export type TicketScalarWhereWithAggregatesInput = {
    AND?: TicketScalarWhereWithAggregatesInput | TicketScalarWhereWithAggregatesInput[]
    OR?: TicketScalarWhereWithAggregatesInput[]
    NOT?: TicketScalarWhereWithAggregatesInput | TicketScalarWhereWithAggregatesInput[]
    idTiket?: StringWithAggregatesFilter<"Ticket"> | string
    noDaisha?: StringWithAggregatesFilter<"Ticket"> | string
    namaPelapor?: StringWithAggregatesFilter<"Ticket"> | string
    status?: StringWithAggregatesFilter<"Ticket"> | string
    waktuMasuk?: DateTimeWithAggregatesFilter<"Ticket"> | Date | string
    waktuSelesai?: DateTimeNullableWithAggregatesFilter<"Ticket"> | Date | string | null
    catatan?: StringNullableWithAggregatesFilter<"Ticket"> | string | null
  }

  export type TicketDetailWhereInput = {
    AND?: TicketDetailWhereInput | TicketDetailWhereInput[]
    OR?: TicketDetailWhereInput[]
    NOT?: TicketDetailWhereInput | TicketDetailWhereInput[]
    idDetail?: IntFilter<"TicketDetail"> | number
    idTiket?: StringFilter<"TicketDetail"> | string
    komponen?: StringFilter<"TicketDetail"> | string
    gejala?: StringFilter<"TicketDetail"> | string
    tindakan?: StringFilter<"TicketDetail"> | string
    qty?: IntFilter<"TicketDetail"> | number
    ticket?: XOR<TicketScalarRelationFilter, TicketWhereInput>
  }

  export type TicketDetailOrderByWithRelationInput = {
    idDetail?: SortOrder
    idTiket?: SortOrder
    komponen?: SortOrder
    gejala?: SortOrder
    tindakan?: SortOrder
    qty?: SortOrder
    ticket?: TicketOrderByWithRelationInput
  }

  export type TicketDetailWhereUniqueInput = Prisma.AtLeast<{
    idDetail?: number
    AND?: TicketDetailWhereInput | TicketDetailWhereInput[]
    OR?: TicketDetailWhereInput[]
    NOT?: TicketDetailWhereInput | TicketDetailWhereInput[]
    idTiket?: StringFilter<"TicketDetail"> | string
    komponen?: StringFilter<"TicketDetail"> | string
    gejala?: StringFilter<"TicketDetail"> | string
    tindakan?: StringFilter<"TicketDetail"> | string
    qty?: IntFilter<"TicketDetail"> | number
    ticket?: XOR<TicketScalarRelationFilter, TicketWhereInput>
  }, "idDetail">

  export type TicketDetailOrderByWithAggregationInput = {
    idDetail?: SortOrder
    idTiket?: SortOrder
    komponen?: SortOrder
    gejala?: SortOrder
    tindakan?: SortOrder
    qty?: SortOrder
    _count?: TicketDetailCountOrderByAggregateInput
    _avg?: TicketDetailAvgOrderByAggregateInput
    _max?: TicketDetailMaxOrderByAggregateInput
    _min?: TicketDetailMinOrderByAggregateInput
    _sum?: TicketDetailSumOrderByAggregateInput
  }

  export type TicketDetailScalarWhereWithAggregatesInput = {
    AND?: TicketDetailScalarWhereWithAggregatesInput | TicketDetailScalarWhereWithAggregatesInput[]
    OR?: TicketDetailScalarWhereWithAggregatesInput[]
    NOT?: TicketDetailScalarWhereWithAggregatesInput | TicketDetailScalarWhereWithAggregatesInput[]
    idDetail?: IntWithAggregatesFilter<"TicketDetail"> | number
    idTiket?: StringWithAggregatesFilter<"TicketDetail"> | string
    komponen?: StringWithAggregatesFilter<"TicketDetail"> | string
    gejala?: StringWithAggregatesFilter<"TicketDetail"> | string
    tindakan?: StringWithAggregatesFilter<"TicketDetail"> | string
    qty?: IntWithAggregatesFilter<"TicketDetail"> | number
  }

  export type DaishaTypeWhereInput = {
    AND?: DaishaTypeWhereInput | DaishaTypeWhereInput[]
    OR?: DaishaTypeWhereInput[]
    NOT?: DaishaTypeWhereInput | DaishaTypeWhereInput[]
    id?: IntFilter<"DaishaType"> | number
    name?: StringFilter<"DaishaType"> | string
    seksi?: StringFilter<"DaishaType"> | string
    createdAt?: DateTimeFilter<"DaishaType"> | Date | string
    updatedAt?: DateTimeFilter<"DaishaType"> | Date | string
    components?: DaishaComponentListRelationFilter
  }

  export type DaishaTypeOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    seksi?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    components?: DaishaComponentOrderByRelationAggregateInput
  }

  export type DaishaTypeWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    name?: string
    AND?: DaishaTypeWhereInput | DaishaTypeWhereInput[]
    OR?: DaishaTypeWhereInput[]
    NOT?: DaishaTypeWhereInput | DaishaTypeWhereInput[]
    seksi?: StringFilter<"DaishaType"> | string
    createdAt?: DateTimeFilter<"DaishaType"> | Date | string
    updatedAt?: DateTimeFilter<"DaishaType"> | Date | string
    components?: DaishaComponentListRelationFilter
  }, "id" | "name">

  export type DaishaTypeOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    seksi?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DaishaTypeCountOrderByAggregateInput
    _avg?: DaishaTypeAvgOrderByAggregateInput
    _max?: DaishaTypeMaxOrderByAggregateInput
    _min?: DaishaTypeMinOrderByAggregateInput
    _sum?: DaishaTypeSumOrderByAggregateInput
  }

  export type DaishaTypeScalarWhereWithAggregatesInput = {
    AND?: DaishaTypeScalarWhereWithAggregatesInput | DaishaTypeScalarWhereWithAggregatesInput[]
    OR?: DaishaTypeScalarWhereWithAggregatesInput[]
    NOT?: DaishaTypeScalarWhereWithAggregatesInput | DaishaTypeScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"DaishaType"> | number
    name?: StringWithAggregatesFilter<"DaishaType"> | string
    seksi?: StringWithAggregatesFilter<"DaishaType"> | string
    createdAt?: DateTimeWithAggregatesFilter<"DaishaType"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DaishaType"> | Date | string
  }

  export type DaishaComponentWhereInput = {
    AND?: DaishaComponentWhereInput | DaishaComponentWhereInput[]
    OR?: DaishaComponentWhereInput[]
    NOT?: DaishaComponentWhereInput | DaishaComponentWhereInput[]
    id?: IntFilter<"DaishaComponent"> | number
    daishaTypeId?: IntFilter<"DaishaComponent"> | number
    name?: StringFilter<"DaishaComponent"> | string
    daishaType?: XOR<DaishaTypeScalarRelationFilter, DaishaTypeWhereInput>
    symptoms?: DaishaSymptomListRelationFilter
  }

  export type DaishaComponentOrderByWithRelationInput = {
    id?: SortOrder
    daishaTypeId?: SortOrder
    name?: SortOrder
    daishaType?: DaishaTypeOrderByWithRelationInput
    symptoms?: DaishaSymptomOrderByRelationAggregateInput
  }

  export type DaishaComponentWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    daishaTypeId_name?: DaishaComponentDaishaTypeIdNameCompoundUniqueInput
    AND?: DaishaComponentWhereInput | DaishaComponentWhereInput[]
    OR?: DaishaComponentWhereInput[]
    NOT?: DaishaComponentWhereInput | DaishaComponentWhereInput[]
    daishaTypeId?: IntFilter<"DaishaComponent"> | number
    name?: StringFilter<"DaishaComponent"> | string
    daishaType?: XOR<DaishaTypeScalarRelationFilter, DaishaTypeWhereInput>
    symptoms?: DaishaSymptomListRelationFilter
  }, "id" | "daishaTypeId_name">

  export type DaishaComponentOrderByWithAggregationInput = {
    id?: SortOrder
    daishaTypeId?: SortOrder
    name?: SortOrder
    _count?: DaishaComponentCountOrderByAggregateInput
    _avg?: DaishaComponentAvgOrderByAggregateInput
    _max?: DaishaComponentMaxOrderByAggregateInput
    _min?: DaishaComponentMinOrderByAggregateInput
    _sum?: DaishaComponentSumOrderByAggregateInput
  }

  export type DaishaComponentScalarWhereWithAggregatesInput = {
    AND?: DaishaComponentScalarWhereWithAggregatesInput | DaishaComponentScalarWhereWithAggregatesInput[]
    OR?: DaishaComponentScalarWhereWithAggregatesInput[]
    NOT?: DaishaComponentScalarWhereWithAggregatesInput | DaishaComponentScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"DaishaComponent"> | number
    daishaTypeId?: IntWithAggregatesFilter<"DaishaComponent"> | number
    name?: StringWithAggregatesFilter<"DaishaComponent"> | string
  }

  export type DaishaSymptomWhereInput = {
    AND?: DaishaSymptomWhereInput | DaishaSymptomWhereInput[]
    OR?: DaishaSymptomWhereInput[]
    NOT?: DaishaSymptomWhereInput | DaishaSymptomWhereInput[]
    id?: IntFilter<"DaishaSymptom"> | number
    componentId?: IntFilter<"DaishaSymptom"> | number
    description?: StringFilter<"DaishaSymptom"> | string
    component?: XOR<DaishaComponentScalarRelationFilter, DaishaComponentWhereInput>
  }

  export type DaishaSymptomOrderByWithRelationInput = {
    id?: SortOrder
    componentId?: SortOrder
    description?: SortOrder
    component?: DaishaComponentOrderByWithRelationInput
  }

  export type DaishaSymptomWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: DaishaSymptomWhereInput | DaishaSymptomWhereInput[]
    OR?: DaishaSymptomWhereInput[]
    NOT?: DaishaSymptomWhereInput | DaishaSymptomWhereInput[]
    componentId?: IntFilter<"DaishaSymptom"> | number
    description?: StringFilter<"DaishaSymptom"> | string
    component?: XOR<DaishaComponentScalarRelationFilter, DaishaComponentWhereInput>
  }, "id">

  export type DaishaSymptomOrderByWithAggregationInput = {
    id?: SortOrder
    componentId?: SortOrder
    description?: SortOrder
    _count?: DaishaSymptomCountOrderByAggregateInput
    _avg?: DaishaSymptomAvgOrderByAggregateInput
    _max?: DaishaSymptomMaxOrderByAggregateInput
    _min?: DaishaSymptomMinOrderByAggregateInput
    _sum?: DaishaSymptomSumOrderByAggregateInput
  }

  export type DaishaSymptomScalarWhereWithAggregatesInput = {
    AND?: DaishaSymptomScalarWhereWithAggregatesInput | DaishaSymptomScalarWhereWithAggregatesInput[]
    OR?: DaishaSymptomScalarWhereWithAggregatesInput[]
    NOT?: DaishaSymptomScalarWhereWithAggregatesInput | DaishaSymptomScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"DaishaSymptom"> | number
    componentId?: IntWithAggregatesFilter<"DaishaSymptom"> | number
    description?: StringWithAggregatesFilter<"DaishaSymptom"> | string
  }

  export type SectionRequestWhereInput = {
    AND?: SectionRequestWhereInput | SectionRequestWhereInput[]
    OR?: SectionRequestWhereInput[]
    NOT?: SectionRequestWhereInput | SectionRequestWhereInput[]
    id?: IntFilter<"SectionRequest"> | number
    nomorRequest?: StringFilter<"SectionRequest"> | string
    seksiPemohon?: StringFilter<"SectionRequest"> | string
    picPemohon?: StringFilter<"SectionRequest"> | string
    kontakPemohon?: StringNullableFilter<"SectionRequest"> | string | null
    namaBarang?: StringFilter<"SectionRequest"> | string
    spesifikasi?: StringNullableFilter<"SectionRequest"> | string | null
    jumlah?: IntFilter<"SectionRequest"> | number
    satuan?: StringFilter<"SectionRequest"> | string
    urgensi?: StringFilter<"SectionRequest"> | string
    catatan?: StringNullableFilter<"SectionRequest"> | string | null
    status?: StringFilter<"SectionRequest"> | string
    alasanTolak?: StringNullableFilter<"SectionRequest"> | string | null
    picBengkel?: StringNullableFilter<"SectionRequest"> | string | null
    estimasi?: StringNullableFilter<"SectionRequest"> | string | null
    catatanAdmin?: StringNullableFilter<"SectionRequest"> | string | null
    dibuatOleh?: StringFilter<"SectionRequest"> | string
    waktuDibuat?: DateTimeFilter<"SectionRequest"> | Date | string
    waktuUpdate?: DateTimeFilter<"SectionRequest"> | Date | string
    waktuSelesai?: DateTimeNullableFilter<"SectionRequest"> | Date | string | null
    materials?: SectionRequestMaterialListRelationFilter
  }

  export type SectionRequestOrderByWithRelationInput = {
    id?: SortOrder
    nomorRequest?: SortOrder
    seksiPemohon?: SortOrder
    picPemohon?: SortOrder
    kontakPemohon?: SortOrderInput | SortOrder
    namaBarang?: SortOrder
    spesifikasi?: SortOrderInput | SortOrder
    jumlah?: SortOrder
    satuan?: SortOrder
    urgensi?: SortOrder
    catatan?: SortOrderInput | SortOrder
    status?: SortOrder
    alasanTolak?: SortOrderInput | SortOrder
    picBengkel?: SortOrderInput | SortOrder
    estimasi?: SortOrderInput | SortOrder
    catatanAdmin?: SortOrderInput | SortOrder
    dibuatOleh?: SortOrder
    waktuDibuat?: SortOrder
    waktuUpdate?: SortOrder
    waktuSelesai?: SortOrderInput | SortOrder
    materials?: SectionRequestMaterialOrderByRelationAggregateInput
  }

  export type SectionRequestWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    nomorRequest?: string
    AND?: SectionRequestWhereInput | SectionRequestWhereInput[]
    OR?: SectionRequestWhereInput[]
    NOT?: SectionRequestWhereInput | SectionRequestWhereInput[]
    seksiPemohon?: StringFilter<"SectionRequest"> | string
    picPemohon?: StringFilter<"SectionRequest"> | string
    kontakPemohon?: StringNullableFilter<"SectionRequest"> | string | null
    namaBarang?: StringFilter<"SectionRequest"> | string
    spesifikasi?: StringNullableFilter<"SectionRequest"> | string | null
    jumlah?: IntFilter<"SectionRequest"> | number
    satuan?: StringFilter<"SectionRequest"> | string
    urgensi?: StringFilter<"SectionRequest"> | string
    catatan?: StringNullableFilter<"SectionRequest"> | string | null
    status?: StringFilter<"SectionRequest"> | string
    alasanTolak?: StringNullableFilter<"SectionRequest"> | string | null
    picBengkel?: StringNullableFilter<"SectionRequest"> | string | null
    estimasi?: StringNullableFilter<"SectionRequest"> | string | null
    catatanAdmin?: StringNullableFilter<"SectionRequest"> | string | null
    dibuatOleh?: StringFilter<"SectionRequest"> | string
    waktuDibuat?: DateTimeFilter<"SectionRequest"> | Date | string
    waktuUpdate?: DateTimeFilter<"SectionRequest"> | Date | string
    waktuSelesai?: DateTimeNullableFilter<"SectionRequest"> | Date | string | null
    materials?: SectionRequestMaterialListRelationFilter
  }, "id" | "nomorRequest">

  export type SectionRequestOrderByWithAggregationInput = {
    id?: SortOrder
    nomorRequest?: SortOrder
    seksiPemohon?: SortOrder
    picPemohon?: SortOrder
    kontakPemohon?: SortOrderInput | SortOrder
    namaBarang?: SortOrder
    spesifikasi?: SortOrderInput | SortOrder
    jumlah?: SortOrder
    satuan?: SortOrder
    urgensi?: SortOrder
    catatan?: SortOrderInput | SortOrder
    status?: SortOrder
    alasanTolak?: SortOrderInput | SortOrder
    picBengkel?: SortOrderInput | SortOrder
    estimasi?: SortOrderInput | SortOrder
    catatanAdmin?: SortOrderInput | SortOrder
    dibuatOleh?: SortOrder
    waktuDibuat?: SortOrder
    waktuUpdate?: SortOrder
    waktuSelesai?: SortOrderInput | SortOrder
    _count?: SectionRequestCountOrderByAggregateInput
    _avg?: SectionRequestAvgOrderByAggregateInput
    _max?: SectionRequestMaxOrderByAggregateInput
    _min?: SectionRequestMinOrderByAggregateInput
    _sum?: SectionRequestSumOrderByAggregateInput
  }

  export type SectionRequestScalarWhereWithAggregatesInput = {
    AND?: SectionRequestScalarWhereWithAggregatesInput | SectionRequestScalarWhereWithAggregatesInput[]
    OR?: SectionRequestScalarWhereWithAggregatesInput[]
    NOT?: SectionRequestScalarWhereWithAggregatesInput | SectionRequestScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"SectionRequest"> | number
    nomorRequest?: StringWithAggregatesFilter<"SectionRequest"> | string
    seksiPemohon?: StringWithAggregatesFilter<"SectionRequest"> | string
    picPemohon?: StringWithAggregatesFilter<"SectionRequest"> | string
    kontakPemohon?: StringNullableWithAggregatesFilter<"SectionRequest"> | string | null
    namaBarang?: StringWithAggregatesFilter<"SectionRequest"> | string
    spesifikasi?: StringNullableWithAggregatesFilter<"SectionRequest"> | string | null
    jumlah?: IntWithAggregatesFilter<"SectionRequest"> | number
    satuan?: StringWithAggregatesFilter<"SectionRequest"> | string
    urgensi?: StringWithAggregatesFilter<"SectionRequest"> | string
    catatan?: StringNullableWithAggregatesFilter<"SectionRequest"> | string | null
    status?: StringWithAggregatesFilter<"SectionRequest"> | string
    alasanTolak?: StringNullableWithAggregatesFilter<"SectionRequest"> | string | null
    picBengkel?: StringNullableWithAggregatesFilter<"SectionRequest"> | string | null
    estimasi?: StringNullableWithAggregatesFilter<"SectionRequest"> | string | null
    catatanAdmin?: StringNullableWithAggregatesFilter<"SectionRequest"> | string | null
    dibuatOleh?: StringWithAggregatesFilter<"SectionRequest"> | string
    waktuDibuat?: DateTimeWithAggregatesFilter<"SectionRequest"> | Date | string
    waktuUpdate?: DateTimeWithAggregatesFilter<"SectionRequest"> | Date | string
    waktuSelesai?: DateTimeNullableWithAggregatesFilter<"SectionRequest"> | Date | string | null
  }

  export type SectionRequestMaterialWhereInput = {
    AND?: SectionRequestMaterialWhereInput | SectionRequestMaterialWhereInput[]
    OR?: SectionRequestMaterialWhereInput[]
    NOT?: SectionRequestMaterialWhereInput | SectionRequestMaterialWhereInput[]
    id?: IntFilter<"SectionRequestMaterial"> | number
    sectionRequestId?: IntFilter<"SectionRequestMaterial"> | number
    namaKomponen?: StringFilter<"SectionRequestMaterial"> | string
    qty?: IntFilter<"SectionRequestMaterial"> | number
    keterangan?: StringNullableFilter<"SectionRequestMaterial"> | string | null
    sectionRequest?: XOR<SectionRequestScalarRelationFilter, SectionRequestWhereInput>
    sparepart?: XOR<SparepartScalarRelationFilter, SparepartWhereInput>
  }

  export type SectionRequestMaterialOrderByWithRelationInput = {
    id?: SortOrder
    sectionRequestId?: SortOrder
    namaKomponen?: SortOrder
    qty?: SortOrder
    keterangan?: SortOrderInput | SortOrder
    sectionRequest?: SectionRequestOrderByWithRelationInput
    sparepart?: SparepartOrderByWithRelationInput
  }

  export type SectionRequestMaterialWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: SectionRequestMaterialWhereInput | SectionRequestMaterialWhereInput[]
    OR?: SectionRequestMaterialWhereInput[]
    NOT?: SectionRequestMaterialWhereInput | SectionRequestMaterialWhereInput[]
    sectionRequestId?: IntFilter<"SectionRequestMaterial"> | number
    namaKomponen?: StringFilter<"SectionRequestMaterial"> | string
    qty?: IntFilter<"SectionRequestMaterial"> | number
    keterangan?: StringNullableFilter<"SectionRequestMaterial"> | string | null
    sectionRequest?: XOR<SectionRequestScalarRelationFilter, SectionRequestWhereInput>
    sparepart?: XOR<SparepartScalarRelationFilter, SparepartWhereInput>
  }, "id">

  export type SectionRequestMaterialOrderByWithAggregationInput = {
    id?: SortOrder
    sectionRequestId?: SortOrder
    namaKomponen?: SortOrder
    qty?: SortOrder
    keterangan?: SortOrderInput | SortOrder
    _count?: SectionRequestMaterialCountOrderByAggregateInput
    _avg?: SectionRequestMaterialAvgOrderByAggregateInput
    _max?: SectionRequestMaterialMaxOrderByAggregateInput
    _min?: SectionRequestMaterialMinOrderByAggregateInput
    _sum?: SectionRequestMaterialSumOrderByAggregateInput
  }

  export type SectionRequestMaterialScalarWhereWithAggregatesInput = {
    AND?: SectionRequestMaterialScalarWhereWithAggregatesInput | SectionRequestMaterialScalarWhereWithAggregatesInput[]
    OR?: SectionRequestMaterialScalarWhereWithAggregatesInput[]
    NOT?: SectionRequestMaterialScalarWhereWithAggregatesInput | SectionRequestMaterialScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"SectionRequestMaterial"> | number
    sectionRequestId?: IntWithAggregatesFilter<"SectionRequestMaterial"> | number
    namaKomponen?: StringWithAggregatesFilter<"SectionRequestMaterial"> | string
    qty?: IntWithAggregatesFilter<"SectionRequestMaterial"> | number
    keterangan?: StringNullableWithAggregatesFilter<"SectionRequestMaterial"> | string | null
  }

  export type SparepartWhereInput = {
    AND?: SparepartWhereInput | SparepartWhereInput[]
    OR?: SparepartWhereInput[]
    NOT?: SparepartWhereInput | SparepartWhereInput[]
    namaKomponen?: StringFilter<"Sparepart"> | string
    kategori?: StringFilter<"Sparepart"> | string
    stokGudang?: IntFilter<"Sparepart"> | number
    satuan?: StringFilter<"Sparepart"> | string
    minStok?: IntFilter<"Sparepart"> | number
    lokasi?: StringNullableFilter<"Sparepart"> | string | null
    logs?: SparepartLogListRelationFilter
    requestMaterials?: SectionRequestMaterialListRelationFilter
  }

  export type SparepartOrderByWithRelationInput = {
    namaKomponen?: SortOrder
    kategori?: SortOrder
    stokGudang?: SortOrder
    satuan?: SortOrder
    minStok?: SortOrder
    lokasi?: SortOrderInput | SortOrder
    logs?: SparepartLogOrderByRelationAggregateInput
    requestMaterials?: SectionRequestMaterialOrderByRelationAggregateInput
  }

  export type SparepartWhereUniqueInput = Prisma.AtLeast<{
    namaKomponen?: string
    AND?: SparepartWhereInput | SparepartWhereInput[]
    OR?: SparepartWhereInput[]
    NOT?: SparepartWhereInput | SparepartWhereInput[]
    kategori?: StringFilter<"Sparepart"> | string
    stokGudang?: IntFilter<"Sparepart"> | number
    satuan?: StringFilter<"Sparepart"> | string
    minStok?: IntFilter<"Sparepart"> | number
    lokasi?: StringNullableFilter<"Sparepart"> | string | null
    logs?: SparepartLogListRelationFilter
    requestMaterials?: SectionRequestMaterialListRelationFilter
  }, "namaKomponen">

  export type SparepartOrderByWithAggregationInput = {
    namaKomponen?: SortOrder
    kategori?: SortOrder
    stokGudang?: SortOrder
    satuan?: SortOrder
    minStok?: SortOrder
    lokasi?: SortOrderInput | SortOrder
    _count?: SparepartCountOrderByAggregateInput
    _avg?: SparepartAvgOrderByAggregateInput
    _max?: SparepartMaxOrderByAggregateInput
    _min?: SparepartMinOrderByAggregateInput
    _sum?: SparepartSumOrderByAggregateInput
  }

  export type SparepartScalarWhereWithAggregatesInput = {
    AND?: SparepartScalarWhereWithAggregatesInput | SparepartScalarWhereWithAggregatesInput[]
    OR?: SparepartScalarWhereWithAggregatesInput[]
    NOT?: SparepartScalarWhereWithAggregatesInput | SparepartScalarWhereWithAggregatesInput[]
    namaKomponen?: StringWithAggregatesFilter<"Sparepart"> | string
    kategori?: StringWithAggregatesFilter<"Sparepart"> | string
    stokGudang?: IntWithAggregatesFilter<"Sparepart"> | number
    satuan?: StringWithAggregatesFilter<"Sparepart"> | string
    minStok?: IntWithAggregatesFilter<"Sparepart"> | number
    lokasi?: StringNullableWithAggregatesFilter<"Sparepart"> | string | null
  }

  export type SparepartLogWhereInput = {
    AND?: SparepartLogWhereInput | SparepartLogWhereInput[]
    OR?: SparepartLogWhereInput[]
    NOT?: SparepartLogWhereInput | SparepartLogWhereInput[]
    id?: IntFilter<"SparepartLog"> | number
    namaKomponen?: StringFilter<"SparepartLog"> | string
    tipe?: StringFilter<"SparepartLog"> | string
    qty?: IntFilter<"SparepartLog"> | number
    referensi?: StringNullableFilter<"SparepartLog"> | string | null
    keterangan?: StringNullableFilter<"SparepartLog"> | string | null
    tanggal?: DateTimeFilter<"SparepartLog"> | Date | string
    sparepart?: XOR<SparepartScalarRelationFilter, SparepartWhereInput>
  }

  export type SparepartLogOrderByWithRelationInput = {
    id?: SortOrder
    namaKomponen?: SortOrder
    tipe?: SortOrder
    qty?: SortOrder
    referensi?: SortOrderInput | SortOrder
    keterangan?: SortOrderInput | SortOrder
    tanggal?: SortOrder
    sparepart?: SparepartOrderByWithRelationInput
  }

  export type SparepartLogWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: SparepartLogWhereInput | SparepartLogWhereInput[]
    OR?: SparepartLogWhereInput[]
    NOT?: SparepartLogWhereInput | SparepartLogWhereInput[]
    namaKomponen?: StringFilter<"SparepartLog"> | string
    tipe?: StringFilter<"SparepartLog"> | string
    qty?: IntFilter<"SparepartLog"> | number
    referensi?: StringNullableFilter<"SparepartLog"> | string | null
    keterangan?: StringNullableFilter<"SparepartLog"> | string | null
    tanggal?: DateTimeFilter<"SparepartLog"> | Date | string
    sparepart?: XOR<SparepartScalarRelationFilter, SparepartWhereInput>
  }, "id">

  export type SparepartLogOrderByWithAggregationInput = {
    id?: SortOrder
    namaKomponen?: SortOrder
    tipe?: SortOrder
    qty?: SortOrder
    referensi?: SortOrderInput | SortOrder
    keterangan?: SortOrderInput | SortOrder
    tanggal?: SortOrder
    _count?: SparepartLogCountOrderByAggregateInput
    _avg?: SparepartLogAvgOrderByAggregateInput
    _max?: SparepartLogMaxOrderByAggregateInput
    _min?: SparepartLogMinOrderByAggregateInput
    _sum?: SparepartLogSumOrderByAggregateInput
  }

  export type SparepartLogScalarWhereWithAggregatesInput = {
    AND?: SparepartLogScalarWhereWithAggregatesInput | SparepartLogScalarWhereWithAggregatesInput[]
    OR?: SparepartLogScalarWhereWithAggregatesInput[]
    NOT?: SparepartLogScalarWhereWithAggregatesInput | SparepartLogScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"SparepartLog"> | number
    namaKomponen?: StringWithAggregatesFilter<"SparepartLog"> | string
    tipe?: StringWithAggregatesFilter<"SparepartLog"> | string
    qty?: IntWithAggregatesFilter<"SparepartLog"> | number
    referensi?: StringNullableWithAggregatesFilter<"SparepartLog"> | string | null
    keterangan?: StringNullableWithAggregatesFilter<"SparepartLog"> | string | null
    tanggal?: DateTimeWithAggregatesFilter<"SparepartLog"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    username?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    role?: StringFilter<"User"> | string
    seksi?: StringNullableFilter<"User"> | string | null
    description?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrder
    role?: SortOrder
    seksi?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    username?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    role?: StringFilter<"User"> | string
    seksi?: StringNullableFilter<"User"> | string | null
    description?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
  }, "id" | "username">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrder
    role?: SortOrder
    seksi?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    username?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    role?: StringWithAggregatesFilter<"User"> | string
    seksi?: StringNullableWithAggregatesFilter<"User"> | string | null
    description?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type MasterDaishaCreateInput = {
    noDaisha: string
    namaDaisha: string
    ukuran: string
    seksi: string
    tickets?: TicketCreateNestedManyWithoutDaishaInput
  }

  export type MasterDaishaUncheckedCreateInput = {
    noDaisha: string
    namaDaisha: string
    ukuran: string
    seksi: string
    tickets?: TicketUncheckedCreateNestedManyWithoutDaishaInput
  }

  export type MasterDaishaUpdateInput = {
    noDaisha?: StringFieldUpdateOperationsInput | string
    namaDaisha?: StringFieldUpdateOperationsInput | string
    ukuran?: StringFieldUpdateOperationsInput | string
    seksi?: StringFieldUpdateOperationsInput | string
    tickets?: TicketUpdateManyWithoutDaishaNestedInput
  }

  export type MasterDaishaUncheckedUpdateInput = {
    noDaisha?: StringFieldUpdateOperationsInput | string
    namaDaisha?: StringFieldUpdateOperationsInput | string
    ukuran?: StringFieldUpdateOperationsInput | string
    seksi?: StringFieldUpdateOperationsInput | string
    tickets?: TicketUncheckedUpdateManyWithoutDaishaNestedInput
  }

  export type MasterDaishaCreateManyInput = {
    noDaisha: string
    namaDaisha: string
    ukuran: string
    seksi: string
  }

  export type MasterDaishaUpdateManyMutationInput = {
    noDaisha?: StringFieldUpdateOperationsInput | string
    namaDaisha?: StringFieldUpdateOperationsInput | string
    ukuran?: StringFieldUpdateOperationsInput | string
    seksi?: StringFieldUpdateOperationsInput | string
  }

  export type MasterDaishaUncheckedUpdateManyInput = {
    noDaisha?: StringFieldUpdateOperationsInput | string
    namaDaisha?: StringFieldUpdateOperationsInput | string
    ukuran?: StringFieldUpdateOperationsInput | string
    seksi?: StringFieldUpdateOperationsInput | string
  }

  export type TicketCreateInput = {
    idTiket: string
    namaPelapor: string
    status?: string
    waktuMasuk?: Date | string
    waktuSelesai?: Date | string | null
    catatan?: string | null
    daisha: MasterDaishaCreateNestedOneWithoutTicketsInput
    details?: TicketDetailCreateNestedManyWithoutTicketInput
  }

  export type TicketUncheckedCreateInput = {
    idTiket: string
    noDaisha: string
    namaPelapor: string
    status?: string
    waktuMasuk?: Date | string
    waktuSelesai?: Date | string | null
    catatan?: string | null
    details?: TicketDetailUncheckedCreateNestedManyWithoutTicketInput
  }

  export type TicketUpdateInput = {
    idTiket?: StringFieldUpdateOperationsInput | string
    namaPelapor?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    waktuMasuk?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuSelesai?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    daisha?: MasterDaishaUpdateOneRequiredWithoutTicketsNestedInput
    details?: TicketDetailUpdateManyWithoutTicketNestedInput
  }

  export type TicketUncheckedUpdateInput = {
    idTiket?: StringFieldUpdateOperationsInput | string
    noDaisha?: StringFieldUpdateOperationsInput | string
    namaPelapor?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    waktuMasuk?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuSelesai?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    details?: TicketDetailUncheckedUpdateManyWithoutTicketNestedInput
  }

  export type TicketCreateManyInput = {
    idTiket: string
    noDaisha: string
    namaPelapor: string
    status?: string
    waktuMasuk?: Date | string
    waktuSelesai?: Date | string | null
    catatan?: string | null
  }

  export type TicketUpdateManyMutationInput = {
    idTiket?: StringFieldUpdateOperationsInput | string
    namaPelapor?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    waktuMasuk?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuSelesai?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TicketUncheckedUpdateManyInput = {
    idTiket?: StringFieldUpdateOperationsInput | string
    noDaisha?: StringFieldUpdateOperationsInput | string
    namaPelapor?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    waktuMasuk?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuSelesai?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TicketDetailCreateInput = {
    komponen: string
    gejala: string
    tindakan: string
    qty: number
    ticket: TicketCreateNestedOneWithoutDetailsInput
  }

  export type TicketDetailUncheckedCreateInput = {
    idDetail?: number
    idTiket: string
    komponen: string
    gejala: string
    tindakan: string
    qty: number
  }

  export type TicketDetailUpdateInput = {
    komponen?: StringFieldUpdateOperationsInput | string
    gejala?: StringFieldUpdateOperationsInput | string
    tindakan?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
    ticket?: TicketUpdateOneRequiredWithoutDetailsNestedInput
  }

  export type TicketDetailUncheckedUpdateInput = {
    idDetail?: IntFieldUpdateOperationsInput | number
    idTiket?: StringFieldUpdateOperationsInput | string
    komponen?: StringFieldUpdateOperationsInput | string
    gejala?: StringFieldUpdateOperationsInput | string
    tindakan?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
  }

  export type TicketDetailCreateManyInput = {
    idDetail?: number
    idTiket: string
    komponen: string
    gejala: string
    tindakan: string
    qty: number
  }

  export type TicketDetailUpdateManyMutationInput = {
    komponen?: StringFieldUpdateOperationsInput | string
    gejala?: StringFieldUpdateOperationsInput | string
    tindakan?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
  }

  export type TicketDetailUncheckedUpdateManyInput = {
    idDetail?: IntFieldUpdateOperationsInput | number
    idTiket?: StringFieldUpdateOperationsInput | string
    komponen?: StringFieldUpdateOperationsInput | string
    gejala?: StringFieldUpdateOperationsInput | string
    tindakan?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
  }

  export type DaishaTypeCreateInput = {
    name: string
    seksi: string
    createdAt?: Date | string
    updatedAt?: Date | string
    components?: DaishaComponentCreateNestedManyWithoutDaishaTypeInput
  }

  export type DaishaTypeUncheckedCreateInput = {
    id?: number
    name: string
    seksi: string
    createdAt?: Date | string
    updatedAt?: Date | string
    components?: DaishaComponentUncheckedCreateNestedManyWithoutDaishaTypeInput
  }

  export type DaishaTypeUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    seksi?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    components?: DaishaComponentUpdateManyWithoutDaishaTypeNestedInput
  }

  export type DaishaTypeUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    seksi?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    components?: DaishaComponentUncheckedUpdateManyWithoutDaishaTypeNestedInput
  }

  export type DaishaTypeCreateManyInput = {
    id?: number
    name: string
    seksi: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DaishaTypeUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    seksi?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DaishaTypeUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    seksi?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DaishaComponentCreateInput = {
    name: string
    daishaType: DaishaTypeCreateNestedOneWithoutComponentsInput
    symptoms?: DaishaSymptomCreateNestedManyWithoutComponentInput
  }

  export type DaishaComponentUncheckedCreateInput = {
    id?: number
    daishaTypeId: number
    name: string
    symptoms?: DaishaSymptomUncheckedCreateNestedManyWithoutComponentInput
  }

  export type DaishaComponentUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    daishaType?: DaishaTypeUpdateOneRequiredWithoutComponentsNestedInput
    symptoms?: DaishaSymptomUpdateManyWithoutComponentNestedInput
  }

  export type DaishaComponentUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    daishaTypeId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    symptoms?: DaishaSymptomUncheckedUpdateManyWithoutComponentNestedInput
  }

  export type DaishaComponentCreateManyInput = {
    id?: number
    daishaTypeId: number
    name: string
  }

  export type DaishaComponentUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
  }

  export type DaishaComponentUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    daishaTypeId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
  }

  export type DaishaSymptomCreateInput = {
    description: string
    component: DaishaComponentCreateNestedOneWithoutSymptomsInput
  }

  export type DaishaSymptomUncheckedCreateInput = {
    id?: number
    componentId: number
    description: string
  }

  export type DaishaSymptomUpdateInput = {
    description?: StringFieldUpdateOperationsInput | string
    component?: DaishaComponentUpdateOneRequiredWithoutSymptomsNestedInput
  }

  export type DaishaSymptomUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    componentId?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
  }

  export type DaishaSymptomCreateManyInput = {
    id?: number
    componentId: number
    description: string
  }

  export type DaishaSymptomUpdateManyMutationInput = {
    description?: StringFieldUpdateOperationsInput | string
  }

  export type DaishaSymptomUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    componentId?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
  }

  export type SectionRequestCreateInput = {
    nomorRequest: string
    seksiPemohon: string
    picPemohon: string
    kontakPemohon?: string | null
    namaBarang: string
    spesifikasi?: string | null
    jumlah?: number
    satuan?: string
    urgensi?: string
    catatan?: string | null
    status?: string
    alasanTolak?: string | null
    picBengkel?: string | null
    estimasi?: string | null
    catatanAdmin?: string | null
    dibuatOleh: string
    waktuDibuat?: Date | string
    waktuUpdate?: Date | string
    waktuSelesai?: Date | string | null
    materials?: SectionRequestMaterialCreateNestedManyWithoutSectionRequestInput
  }

  export type SectionRequestUncheckedCreateInput = {
    id?: number
    nomorRequest: string
    seksiPemohon: string
    picPemohon: string
    kontakPemohon?: string | null
    namaBarang: string
    spesifikasi?: string | null
    jumlah?: number
    satuan?: string
    urgensi?: string
    catatan?: string | null
    status?: string
    alasanTolak?: string | null
    picBengkel?: string | null
    estimasi?: string | null
    catatanAdmin?: string | null
    dibuatOleh: string
    waktuDibuat?: Date | string
    waktuUpdate?: Date | string
    waktuSelesai?: Date | string | null
    materials?: SectionRequestMaterialUncheckedCreateNestedManyWithoutSectionRequestInput
  }

  export type SectionRequestUpdateInput = {
    nomorRequest?: StringFieldUpdateOperationsInput | string
    seksiPemohon?: StringFieldUpdateOperationsInput | string
    picPemohon?: StringFieldUpdateOperationsInput | string
    kontakPemohon?: NullableStringFieldUpdateOperationsInput | string | null
    namaBarang?: StringFieldUpdateOperationsInput | string
    spesifikasi?: NullableStringFieldUpdateOperationsInput | string | null
    jumlah?: IntFieldUpdateOperationsInput | number
    satuan?: StringFieldUpdateOperationsInput | string
    urgensi?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    alasanTolak?: NullableStringFieldUpdateOperationsInput | string | null
    picBengkel?: NullableStringFieldUpdateOperationsInput | string | null
    estimasi?: NullableStringFieldUpdateOperationsInput | string | null
    catatanAdmin?: NullableStringFieldUpdateOperationsInput | string | null
    dibuatOleh?: StringFieldUpdateOperationsInput | string
    waktuDibuat?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuSelesai?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    materials?: SectionRequestMaterialUpdateManyWithoutSectionRequestNestedInput
  }

  export type SectionRequestUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    nomorRequest?: StringFieldUpdateOperationsInput | string
    seksiPemohon?: StringFieldUpdateOperationsInput | string
    picPemohon?: StringFieldUpdateOperationsInput | string
    kontakPemohon?: NullableStringFieldUpdateOperationsInput | string | null
    namaBarang?: StringFieldUpdateOperationsInput | string
    spesifikasi?: NullableStringFieldUpdateOperationsInput | string | null
    jumlah?: IntFieldUpdateOperationsInput | number
    satuan?: StringFieldUpdateOperationsInput | string
    urgensi?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    alasanTolak?: NullableStringFieldUpdateOperationsInput | string | null
    picBengkel?: NullableStringFieldUpdateOperationsInput | string | null
    estimasi?: NullableStringFieldUpdateOperationsInput | string | null
    catatanAdmin?: NullableStringFieldUpdateOperationsInput | string | null
    dibuatOleh?: StringFieldUpdateOperationsInput | string
    waktuDibuat?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuSelesai?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    materials?: SectionRequestMaterialUncheckedUpdateManyWithoutSectionRequestNestedInput
  }

  export type SectionRequestCreateManyInput = {
    id?: number
    nomorRequest: string
    seksiPemohon: string
    picPemohon: string
    kontakPemohon?: string | null
    namaBarang: string
    spesifikasi?: string | null
    jumlah?: number
    satuan?: string
    urgensi?: string
    catatan?: string | null
    status?: string
    alasanTolak?: string | null
    picBengkel?: string | null
    estimasi?: string | null
    catatanAdmin?: string | null
    dibuatOleh: string
    waktuDibuat?: Date | string
    waktuUpdate?: Date | string
    waktuSelesai?: Date | string | null
  }

  export type SectionRequestUpdateManyMutationInput = {
    nomorRequest?: StringFieldUpdateOperationsInput | string
    seksiPemohon?: StringFieldUpdateOperationsInput | string
    picPemohon?: StringFieldUpdateOperationsInput | string
    kontakPemohon?: NullableStringFieldUpdateOperationsInput | string | null
    namaBarang?: StringFieldUpdateOperationsInput | string
    spesifikasi?: NullableStringFieldUpdateOperationsInput | string | null
    jumlah?: IntFieldUpdateOperationsInput | number
    satuan?: StringFieldUpdateOperationsInput | string
    urgensi?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    alasanTolak?: NullableStringFieldUpdateOperationsInput | string | null
    picBengkel?: NullableStringFieldUpdateOperationsInput | string | null
    estimasi?: NullableStringFieldUpdateOperationsInput | string | null
    catatanAdmin?: NullableStringFieldUpdateOperationsInput | string | null
    dibuatOleh?: StringFieldUpdateOperationsInput | string
    waktuDibuat?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuSelesai?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SectionRequestUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    nomorRequest?: StringFieldUpdateOperationsInput | string
    seksiPemohon?: StringFieldUpdateOperationsInput | string
    picPemohon?: StringFieldUpdateOperationsInput | string
    kontakPemohon?: NullableStringFieldUpdateOperationsInput | string | null
    namaBarang?: StringFieldUpdateOperationsInput | string
    spesifikasi?: NullableStringFieldUpdateOperationsInput | string | null
    jumlah?: IntFieldUpdateOperationsInput | number
    satuan?: StringFieldUpdateOperationsInput | string
    urgensi?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    alasanTolak?: NullableStringFieldUpdateOperationsInput | string | null
    picBengkel?: NullableStringFieldUpdateOperationsInput | string | null
    estimasi?: NullableStringFieldUpdateOperationsInput | string | null
    catatanAdmin?: NullableStringFieldUpdateOperationsInput | string | null
    dibuatOleh?: StringFieldUpdateOperationsInput | string
    waktuDibuat?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuSelesai?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SectionRequestMaterialCreateInput = {
    qty?: number
    keterangan?: string | null
    sectionRequest: SectionRequestCreateNestedOneWithoutMaterialsInput
    sparepart: SparepartCreateNestedOneWithoutRequestMaterialsInput
  }

  export type SectionRequestMaterialUncheckedCreateInput = {
    id?: number
    sectionRequestId: number
    namaKomponen: string
    qty?: number
    keterangan?: string | null
  }

  export type SectionRequestMaterialUpdateInput = {
    qty?: IntFieldUpdateOperationsInput | number
    keterangan?: NullableStringFieldUpdateOperationsInput | string | null
    sectionRequest?: SectionRequestUpdateOneRequiredWithoutMaterialsNestedInput
    sparepart?: SparepartUpdateOneRequiredWithoutRequestMaterialsNestedInput
  }

  export type SectionRequestMaterialUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    sectionRequestId?: IntFieldUpdateOperationsInput | number
    namaKomponen?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
    keterangan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SectionRequestMaterialCreateManyInput = {
    id?: number
    sectionRequestId: number
    namaKomponen: string
    qty?: number
    keterangan?: string | null
  }

  export type SectionRequestMaterialUpdateManyMutationInput = {
    qty?: IntFieldUpdateOperationsInput | number
    keterangan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SectionRequestMaterialUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    sectionRequestId?: IntFieldUpdateOperationsInput | number
    namaKomponen?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
    keterangan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SparepartCreateInput = {
    namaKomponen: string
    kategori?: string
    stokGudang?: number
    satuan: string
    minStok?: number
    lokasi?: string | null
    logs?: SparepartLogCreateNestedManyWithoutSparepartInput
    requestMaterials?: SectionRequestMaterialCreateNestedManyWithoutSparepartInput
  }

  export type SparepartUncheckedCreateInput = {
    namaKomponen: string
    kategori?: string
    stokGudang?: number
    satuan: string
    minStok?: number
    lokasi?: string | null
    logs?: SparepartLogUncheckedCreateNestedManyWithoutSparepartInput
    requestMaterials?: SectionRequestMaterialUncheckedCreateNestedManyWithoutSparepartInput
  }

  export type SparepartUpdateInput = {
    namaKomponen?: StringFieldUpdateOperationsInput | string
    kategori?: StringFieldUpdateOperationsInput | string
    stokGudang?: IntFieldUpdateOperationsInput | number
    satuan?: StringFieldUpdateOperationsInput | string
    minStok?: IntFieldUpdateOperationsInput | number
    lokasi?: NullableStringFieldUpdateOperationsInput | string | null
    logs?: SparepartLogUpdateManyWithoutSparepartNestedInput
    requestMaterials?: SectionRequestMaterialUpdateManyWithoutSparepartNestedInput
  }

  export type SparepartUncheckedUpdateInput = {
    namaKomponen?: StringFieldUpdateOperationsInput | string
    kategori?: StringFieldUpdateOperationsInput | string
    stokGudang?: IntFieldUpdateOperationsInput | number
    satuan?: StringFieldUpdateOperationsInput | string
    minStok?: IntFieldUpdateOperationsInput | number
    lokasi?: NullableStringFieldUpdateOperationsInput | string | null
    logs?: SparepartLogUncheckedUpdateManyWithoutSparepartNestedInput
    requestMaterials?: SectionRequestMaterialUncheckedUpdateManyWithoutSparepartNestedInput
  }

  export type SparepartCreateManyInput = {
    namaKomponen: string
    kategori?: string
    stokGudang?: number
    satuan: string
    minStok?: number
    lokasi?: string | null
  }

  export type SparepartUpdateManyMutationInput = {
    namaKomponen?: StringFieldUpdateOperationsInput | string
    kategori?: StringFieldUpdateOperationsInput | string
    stokGudang?: IntFieldUpdateOperationsInput | number
    satuan?: StringFieldUpdateOperationsInput | string
    minStok?: IntFieldUpdateOperationsInput | number
    lokasi?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SparepartUncheckedUpdateManyInput = {
    namaKomponen?: StringFieldUpdateOperationsInput | string
    kategori?: StringFieldUpdateOperationsInput | string
    stokGudang?: IntFieldUpdateOperationsInput | number
    satuan?: StringFieldUpdateOperationsInput | string
    minStok?: IntFieldUpdateOperationsInput | number
    lokasi?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SparepartLogCreateInput = {
    tipe: string
    qty: number
    referensi?: string | null
    keterangan?: string | null
    tanggal?: Date | string
    sparepart: SparepartCreateNestedOneWithoutLogsInput
  }

  export type SparepartLogUncheckedCreateInput = {
    id?: number
    namaKomponen: string
    tipe: string
    qty: number
    referensi?: string | null
    keterangan?: string | null
    tanggal?: Date | string
  }

  export type SparepartLogUpdateInput = {
    tipe?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
    referensi?: NullableStringFieldUpdateOperationsInput | string | null
    keterangan?: NullableStringFieldUpdateOperationsInput | string | null
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    sparepart?: SparepartUpdateOneRequiredWithoutLogsNestedInput
  }

  export type SparepartLogUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    namaKomponen?: StringFieldUpdateOperationsInput | string
    tipe?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
    referensi?: NullableStringFieldUpdateOperationsInput | string | null
    keterangan?: NullableStringFieldUpdateOperationsInput | string | null
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SparepartLogCreateManyInput = {
    id?: number
    namaKomponen: string
    tipe: string
    qty: number
    referensi?: string | null
    keterangan?: string | null
    tanggal?: Date | string
  }

  export type SparepartLogUpdateManyMutationInput = {
    tipe?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
    referensi?: NullableStringFieldUpdateOperationsInput | string | null
    keterangan?: NullableStringFieldUpdateOperationsInput | string | null
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SparepartLogUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    namaKomponen?: StringFieldUpdateOperationsInput | string
    tipe?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
    referensi?: NullableStringFieldUpdateOperationsInput | string | null
    keterangan?: NullableStringFieldUpdateOperationsInput | string | null
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    username: string
    password: string
    name: string
    role?: string
    seksi?: string | null
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUncheckedCreateInput = {
    id?: number
    username: string
    password: string
    name: string
    role?: string
    seksi?: string | null
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateInput = {
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    seksi?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    seksi?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateManyInput = {
    id?: number
    username: string
    password: string
    name: string
    role?: string
    seksi?: string | null
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    seksi?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    seksi?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type TicketListRelationFilter = {
    every?: TicketWhereInput
    some?: TicketWhereInput
    none?: TicketWhereInput
  }

  export type TicketOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MasterDaishaCountOrderByAggregateInput = {
    noDaisha?: SortOrder
    namaDaisha?: SortOrder
    ukuran?: SortOrder
    seksi?: SortOrder
  }

  export type MasterDaishaMaxOrderByAggregateInput = {
    noDaisha?: SortOrder
    namaDaisha?: SortOrder
    ukuran?: SortOrder
    seksi?: SortOrder
  }

  export type MasterDaishaMinOrderByAggregateInput = {
    noDaisha?: SortOrder
    namaDaisha?: SortOrder
    ukuran?: SortOrder
    seksi?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type MasterDaishaScalarRelationFilter = {
    is?: MasterDaishaWhereInput
    isNot?: MasterDaishaWhereInput
  }

  export type TicketDetailListRelationFilter = {
    every?: TicketDetailWhereInput
    some?: TicketDetailWhereInput
    none?: TicketDetailWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type TicketDetailOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TicketCountOrderByAggregateInput = {
    idTiket?: SortOrder
    noDaisha?: SortOrder
    namaPelapor?: SortOrder
    status?: SortOrder
    waktuMasuk?: SortOrder
    waktuSelesai?: SortOrder
    catatan?: SortOrder
  }

  export type TicketMaxOrderByAggregateInput = {
    idTiket?: SortOrder
    noDaisha?: SortOrder
    namaPelapor?: SortOrder
    status?: SortOrder
    waktuMasuk?: SortOrder
    waktuSelesai?: SortOrder
    catatan?: SortOrder
  }

  export type TicketMinOrderByAggregateInput = {
    idTiket?: SortOrder
    noDaisha?: SortOrder
    namaPelapor?: SortOrder
    status?: SortOrder
    waktuMasuk?: SortOrder
    waktuSelesai?: SortOrder
    catatan?: SortOrder
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type TicketScalarRelationFilter = {
    is?: TicketWhereInput
    isNot?: TicketWhereInput
  }

  export type TicketDetailCountOrderByAggregateInput = {
    idDetail?: SortOrder
    idTiket?: SortOrder
    komponen?: SortOrder
    gejala?: SortOrder
    tindakan?: SortOrder
    qty?: SortOrder
  }

  export type TicketDetailAvgOrderByAggregateInput = {
    idDetail?: SortOrder
    qty?: SortOrder
  }

  export type TicketDetailMaxOrderByAggregateInput = {
    idDetail?: SortOrder
    idTiket?: SortOrder
    komponen?: SortOrder
    gejala?: SortOrder
    tindakan?: SortOrder
    qty?: SortOrder
  }

  export type TicketDetailMinOrderByAggregateInput = {
    idDetail?: SortOrder
    idTiket?: SortOrder
    komponen?: SortOrder
    gejala?: SortOrder
    tindakan?: SortOrder
    qty?: SortOrder
  }

  export type TicketDetailSumOrderByAggregateInput = {
    idDetail?: SortOrder
    qty?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DaishaComponentListRelationFilter = {
    every?: DaishaComponentWhereInput
    some?: DaishaComponentWhereInput
    none?: DaishaComponentWhereInput
  }

  export type DaishaComponentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DaishaTypeCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    seksi?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DaishaTypeAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type DaishaTypeMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    seksi?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DaishaTypeMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    seksi?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DaishaTypeSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type DaishaTypeScalarRelationFilter = {
    is?: DaishaTypeWhereInput
    isNot?: DaishaTypeWhereInput
  }

  export type DaishaSymptomListRelationFilter = {
    every?: DaishaSymptomWhereInput
    some?: DaishaSymptomWhereInput
    none?: DaishaSymptomWhereInput
  }

  export type DaishaSymptomOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DaishaComponentDaishaTypeIdNameCompoundUniqueInput = {
    daishaTypeId: number
    name: string
  }

  export type DaishaComponentCountOrderByAggregateInput = {
    id?: SortOrder
    daishaTypeId?: SortOrder
    name?: SortOrder
  }

  export type DaishaComponentAvgOrderByAggregateInput = {
    id?: SortOrder
    daishaTypeId?: SortOrder
  }

  export type DaishaComponentMaxOrderByAggregateInput = {
    id?: SortOrder
    daishaTypeId?: SortOrder
    name?: SortOrder
  }

  export type DaishaComponentMinOrderByAggregateInput = {
    id?: SortOrder
    daishaTypeId?: SortOrder
    name?: SortOrder
  }

  export type DaishaComponentSumOrderByAggregateInput = {
    id?: SortOrder
    daishaTypeId?: SortOrder
  }

  export type DaishaComponentScalarRelationFilter = {
    is?: DaishaComponentWhereInput
    isNot?: DaishaComponentWhereInput
  }

  export type DaishaSymptomCountOrderByAggregateInput = {
    id?: SortOrder
    componentId?: SortOrder
    description?: SortOrder
  }

  export type DaishaSymptomAvgOrderByAggregateInput = {
    id?: SortOrder
    componentId?: SortOrder
  }

  export type DaishaSymptomMaxOrderByAggregateInput = {
    id?: SortOrder
    componentId?: SortOrder
    description?: SortOrder
  }

  export type DaishaSymptomMinOrderByAggregateInput = {
    id?: SortOrder
    componentId?: SortOrder
    description?: SortOrder
  }

  export type DaishaSymptomSumOrderByAggregateInput = {
    id?: SortOrder
    componentId?: SortOrder
  }

  export type SectionRequestMaterialListRelationFilter = {
    every?: SectionRequestMaterialWhereInput
    some?: SectionRequestMaterialWhereInput
    none?: SectionRequestMaterialWhereInput
  }

  export type SectionRequestMaterialOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SectionRequestCountOrderByAggregateInput = {
    id?: SortOrder
    nomorRequest?: SortOrder
    seksiPemohon?: SortOrder
    picPemohon?: SortOrder
    kontakPemohon?: SortOrder
    namaBarang?: SortOrder
    spesifikasi?: SortOrder
    jumlah?: SortOrder
    satuan?: SortOrder
    urgensi?: SortOrder
    catatan?: SortOrder
    status?: SortOrder
    alasanTolak?: SortOrder
    picBengkel?: SortOrder
    estimasi?: SortOrder
    catatanAdmin?: SortOrder
    dibuatOleh?: SortOrder
    waktuDibuat?: SortOrder
    waktuUpdate?: SortOrder
    waktuSelesai?: SortOrder
  }

  export type SectionRequestAvgOrderByAggregateInput = {
    id?: SortOrder
    jumlah?: SortOrder
  }

  export type SectionRequestMaxOrderByAggregateInput = {
    id?: SortOrder
    nomorRequest?: SortOrder
    seksiPemohon?: SortOrder
    picPemohon?: SortOrder
    kontakPemohon?: SortOrder
    namaBarang?: SortOrder
    spesifikasi?: SortOrder
    jumlah?: SortOrder
    satuan?: SortOrder
    urgensi?: SortOrder
    catatan?: SortOrder
    status?: SortOrder
    alasanTolak?: SortOrder
    picBengkel?: SortOrder
    estimasi?: SortOrder
    catatanAdmin?: SortOrder
    dibuatOleh?: SortOrder
    waktuDibuat?: SortOrder
    waktuUpdate?: SortOrder
    waktuSelesai?: SortOrder
  }

  export type SectionRequestMinOrderByAggregateInput = {
    id?: SortOrder
    nomorRequest?: SortOrder
    seksiPemohon?: SortOrder
    picPemohon?: SortOrder
    kontakPemohon?: SortOrder
    namaBarang?: SortOrder
    spesifikasi?: SortOrder
    jumlah?: SortOrder
    satuan?: SortOrder
    urgensi?: SortOrder
    catatan?: SortOrder
    status?: SortOrder
    alasanTolak?: SortOrder
    picBengkel?: SortOrder
    estimasi?: SortOrder
    catatanAdmin?: SortOrder
    dibuatOleh?: SortOrder
    waktuDibuat?: SortOrder
    waktuUpdate?: SortOrder
    waktuSelesai?: SortOrder
  }

  export type SectionRequestSumOrderByAggregateInput = {
    id?: SortOrder
    jumlah?: SortOrder
  }

  export type SectionRequestScalarRelationFilter = {
    is?: SectionRequestWhereInput
    isNot?: SectionRequestWhereInput
  }

  export type SparepartScalarRelationFilter = {
    is?: SparepartWhereInput
    isNot?: SparepartWhereInput
  }

  export type SectionRequestMaterialCountOrderByAggregateInput = {
    id?: SortOrder
    sectionRequestId?: SortOrder
    namaKomponen?: SortOrder
    qty?: SortOrder
    keterangan?: SortOrder
  }

  export type SectionRequestMaterialAvgOrderByAggregateInput = {
    id?: SortOrder
    sectionRequestId?: SortOrder
    qty?: SortOrder
  }

  export type SectionRequestMaterialMaxOrderByAggregateInput = {
    id?: SortOrder
    sectionRequestId?: SortOrder
    namaKomponen?: SortOrder
    qty?: SortOrder
    keterangan?: SortOrder
  }

  export type SectionRequestMaterialMinOrderByAggregateInput = {
    id?: SortOrder
    sectionRequestId?: SortOrder
    namaKomponen?: SortOrder
    qty?: SortOrder
    keterangan?: SortOrder
  }

  export type SectionRequestMaterialSumOrderByAggregateInput = {
    id?: SortOrder
    sectionRequestId?: SortOrder
    qty?: SortOrder
  }

  export type SparepartLogListRelationFilter = {
    every?: SparepartLogWhereInput
    some?: SparepartLogWhereInput
    none?: SparepartLogWhereInput
  }

  export type SparepartLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SparepartCountOrderByAggregateInput = {
    namaKomponen?: SortOrder
    kategori?: SortOrder
    stokGudang?: SortOrder
    satuan?: SortOrder
    minStok?: SortOrder
    lokasi?: SortOrder
  }

  export type SparepartAvgOrderByAggregateInput = {
    stokGudang?: SortOrder
    minStok?: SortOrder
  }

  export type SparepartMaxOrderByAggregateInput = {
    namaKomponen?: SortOrder
    kategori?: SortOrder
    stokGudang?: SortOrder
    satuan?: SortOrder
    minStok?: SortOrder
    lokasi?: SortOrder
  }

  export type SparepartMinOrderByAggregateInput = {
    namaKomponen?: SortOrder
    kategori?: SortOrder
    stokGudang?: SortOrder
    satuan?: SortOrder
    minStok?: SortOrder
    lokasi?: SortOrder
  }

  export type SparepartSumOrderByAggregateInput = {
    stokGudang?: SortOrder
    minStok?: SortOrder
  }

  export type SparepartLogCountOrderByAggregateInput = {
    id?: SortOrder
    namaKomponen?: SortOrder
    tipe?: SortOrder
    qty?: SortOrder
    referensi?: SortOrder
    keterangan?: SortOrder
    tanggal?: SortOrder
  }

  export type SparepartLogAvgOrderByAggregateInput = {
    id?: SortOrder
    qty?: SortOrder
  }

  export type SparepartLogMaxOrderByAggregateInput = {
    id?: SortOrder
    namaKomponen?: SortOrder
    tipe?: SortOrder
    qty?: SortOrder
    referensi?: SortOrder
    keterangan?: SortOrder
    tanggal?: SortOrder
  }

  export type SparepartLogMinOrderByAggregateInput = {
    id?: SortOrder
    namaKomponen?: SortOrder
    tipe?: SortOrder
    qty?: SortOrder
    referensi?: SortOrder
    keterangan?: SortOrder
    tanggal?: SortOrder
  }

  export type SparepartLogSumOrderByAggregateInput = {
    id?: SortOrder
    qty?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrder
    role?: SortOrder
    seksi?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrder
    role?: SortOrder
    seksi?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrder
    role?: SortOrder
    seksi?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type TicketCreateNestedManyWithoutDaishaInput = {
    create?: XOR<TicketCreateWithoutDaishaInput, TicketUncheckedCreateWithoutDaishaInput> | TicketCreateWithoutDaishaInput[] | TicketUncheckedCreateWithoutDaishaInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutDaishaInput | TicketCreateOrConnectWithoutDaishaInput[]
    createMany?: TicketCreateManyDaishaInputEnvelope
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
  }

  export type TicketUncheckedCreateNestedManyWithoutDaishaInput = {
    create?: XOR<TicketCreateWithoutDaishaInput, TicketUncheckedCreateWithoutDaishaInput> | TicketCreateWithoutDaishaInput[] | TicketUncheckedCreateWithoutDaishaInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutDaishaInput | TicketCreateOrConnectWithoutDaishaInput[]
    createMany?: TicketCreateManyDaishaInputEnvelope
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type TicketUpdateManyWithoutDaishaNestedInput = {
    create?: XOR<TicketCreateWithoutDaishaInput, TicketUncheckedCreateWithoutDaishaInput> | TicketCreateWithoutDaishaInput[] | TicketUncheckedCreateWithoutDaishaInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutDaishaInput | TicketCreateOrConnectWithoutDaishaInput[]
    upsert?: TicketUpsertWithWhereUniqueWithoutDaishaInput | TicketUpsertWithWhereUniqueWithoutDaishaInput[]
    createMany?: TicketCreateManyDaishaInputEnvelope
    set?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    disconnect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    delete?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    update?: TicketUpdateWithWhereUniqueWithoutDaishaInput | TicketUpdateWithWhereUniqueWithoutDaishaInput[]
    updateMany?: TicketUpdateManyWithWhereWithoutDaishaInput | TicketUpdateManyWithWhereWithoutDaishaInput[]
    deleteMany?: TicketScalarWhereInput | TicketScalarWhereInput[]
  }

  export type TicketUncheckedUpdateManyWithoutDaishaNestedInput = {
    create?: XOR<TicketCreateWithoutDaishaInput, TicketUncheckedCreateWithoutDaishaInput> | TicketCreateWithoutDaishaInput[] | TicketUncheckedCreateWithoutDaishaInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutDaishaInput | TicketCreateOrConnectWithoutDaishaInput[]
    upsert?: TicketUpsertWithWhereUniqueWithoutDaishaInput | TicketUpsertWithWhereUniqueWithoutDaishaInput[]
    createMany?: TicketCreateManyDaishaInputEnvelope
    set?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    disconnect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    delete?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    update?: TicketUpdateWithWhereUniqueWithoutDaishaInput | TicketUpdateWithWhereUniqueWithoutDaishaInput[]
    updateMany?: TicketUpdateManyWithWhereWithoutDaishaInput | TicketUpdateManyWithWhereWithoutDaishaInput[]
    deleteMany?: TicketScalarWhereInput | TicketScalarWhereInput[]
  }

  export type MasterDaishaCreateNestedOneWithoutTicketsInput = {
    create?: XOR<MasterDaishaCreateWithoutTicketsInput, MasterDaishaUncheckedCreateWithoutTicketsInput>
    connectOrCreate?: MasterDaishaCreateOrConnectWithoutTicketsInput
    connect?: MasterDaishaWhereUniqueInput
  }

  export type TicketDetailCreateNestedManyWithoutTicketInput = {
    create?: XOR<TicketDetailCreateWithoutTicketInput, TicketDetailUncheckedCreateWithoutTicketInput> | TicketDetailCreateWithoutTicketInput[] | TicketDetailUncheckedCreateWithoutTicketInput[]
    connectOrCreate?: TicketDetailCreateOrConnectWithoutTicketInput | TicketDetailCreateOrConnectWithoutTicketInput[]
    createMany?: TicketDetailCreateManyTicketInputEnvelope
    connect?: TicketDetailWhereUniqueInput | TicketDetailWhereUniqueInput[]
  }

  export type TicketDetailUncheckedCreateNestedManyWithoutTicketInput = {
    create?: XOR<TicketDetailCreateWithoutTicketInput, TicketDetailUncheckedCreateWithoutTicketInput> | TicketDetailCreateWithoutTicketInput[] | TicketDetailUncheckedCreateWithoutTicketInput[]
    connectOrCreate?: TicketDetailCreateOrConnectWithoutTicketInput | TicketDetailCreateOrConnectWithoutTicketInput[]
    createMany?: TicketDetailCreateManyTicketInputEnvelope
    connect?: TicketDetailWhereUniqueInput | TicketDetailWhereUniqueInput[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type MasterDaishaUpdateOneRequiredWithoutTicketsNestedInput = {
    create?: XOR<MasterDaishaCreateWithoutTicketsInput, MasterDaishaUncheckedCreateWithoutTicketsInput>
    connectOrCreate?: MasterDaishaCreateOrConnectWithoutTicketsInput
    upsert?: MasterDaishaUpsertWithoutTicketsInput
    connect?: MasterDaishaWhereUniqueInput
    update?: XOR<XOR<MasterDaishaUpdateToOneWithWhereWithoutTicketsInput, MasterDaishaUpdateWithoutTicketsInput>, MasterDaishaUncheckedUpdateWithoutTicketsInput>
  }

  export type TicketDetailUpdateManyWithoutTicketNestedInput = {
    create?: XOR<TicketDetailCreateWithoutTicketInput, TicketDetailUncheckedCreateWithoutTicketInput> | TicketDetailCreateWithoutTicketInput[] | TicketDetailUncheckedCreateWithoutTicketInput[]
    connectOrCreate?: TicketDetailCreateOrConnectWithoutTicketInput | TicketDetailCreateOrConnectWithoutTicketInput[]
    upsert?: TicketDetailUpsertWithWhereUniqueWithoutTicketInput | TicketDetailUpsertWithWhereUniqueWithoutTicketInput[]
    createMany?: TicketDetailCreateManyTicketInputEnvelope
    set?: TicketDetailWhereUniqueInput | TicketDetailWhereUniqueInput[]
    disconnect?: TicketDetailWhereUniqueInput | TicketDetailWhereUniqueInput[]
    delete?: TicketDetailWhereUniqueInput | TicketDetailWhereUniqueInput[]
    connect?: TicketDetailWhereUniqueInput | TicketDetailWhereUniqueInput[]
    update?: TicketDetailUpdateWithWhereUniqueWithoutTicketInput | TicketDetailUpdateWithWhereUniqueWithoutTicketInput[]
    updateMany?: TicketDetailUpdateManyWithWhereWithoutTicketInput | TicketDetailUpdateManyWithWhereWithoutTicketInput[]
    deleteMany?: TicketDetailScalarWhereInput | TicketDetailScalarWhereInput[]
  }

  export type TicketDetailUncheckedUpdateManyWithoutTicketNestedInput = {
    create?: XOR<TicketDetailCreateWithoutTicketInput, TicketDetailUncheckedCreateWithoutTicketInput> | TicketDetailCreateWithoutTicketInput[] | TicketDetailUncheckedCreateWithoutTicketInput[]
    connectOrCreate?: TicketDetailCreateOrConnectWithoutTicketInput | TicketDetailCreateOrConnectWithoutTicketInput[]
    upsert?: TicketDetailUpsertWithWhereUniqueWithoutTicketInput | TicketDetailUpsertWithWhereUniqueWithoutTicketInput[]
    createMany?: TicketDetailCreateManyTicketInputEnvelope
    set?: TicketDetailWhereUniqueInput | TicketDetailWhereUniqueInput[]
    disconnect?: TicketDetailWhereUniqueInput | TicketDetailWhereUniqueInput[]
    delete?: TicketDetailWhereUniqueInput | TicketDetailWhereUniqueInput[]
    connect?: TicketDetailWhereUniqueInput | TicketDetailWhereUniqueInput[]
    update?: TicketDetailUpdateWithWhereUniqueWithoutTicketInput | TicketDetailUpdateWithWhereUniqueWithoutTicketInput[]
    updateMany?: TicketDetailUpdateManyWithWhereWithoutTicketInput | TicketDetailUpdateManyWithWhereWithoutTicketInput[]
    deleteMany?: TicketDetailScalarWhereInput | TicketDetailScalarWhereInput[]
  }

  export type TicketCreateNestedOneWithoutDetailsInput = {
    create?: XOR<TicketCreateWithoutDetailsInput, TicketUncheckedCreateWithoutDetailsInput>
    connectOrCreate?: TicketCreateOrConnectWithoutDetailsInput
    connect?: TicketWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type TicketUpdateOneRequiredWithoutDetailsNestedInput = {
    create?: XOR<TicketCreateWithoutDetailsInput, TicketUncheckedCreateWithoutDetailsInput>
    connectOrCreate?: TicketCreateOrConnectWithoutDetailsInput
    upsert?: TicketUpsertWithoutDetailsInput
    connect?: TicketWhereUniqueInput
    update?: XOR<XOR<TicketUpdateToOneWithWhereWithoutDetailsInput, TicketUpdateWithoutDetailsInput>, TicketUncheckedUpdateWithoutDetailsInput>
  }

  export type DaishaComponentCreateNestedManyWithoutDaishaTypeInput = {
    create?: XOR<DaishaComponentCreateWithoutDaishaTypeInput, DaishaComponentUncheckedCreateWithoutDaishaTypeInput> | DaishaComponentCreateWithoutDaishaTypeInput[] | DaishaComponentUncheckedCreateWithoutDaishaTypeInput[]
    connectOrCreate?: DaishaComponentCreateOrConnectWithoutDaishaTypeInput | DaishaComponentCreateOrConnectWithoutDaishaTypeInput[]
    createMany?: DaishaComponentCreateManyDaishaTypeInputEnvelope
    connect?: DaishaComponentWhereUniqueInput | DaishaComponentWhereUniqueInput[]
  }

  export type DaishaComponentUncheckedCreateNestedManyWithoutDaishaTypeInput = {
    create?: XOR<DaishaComponentCreateWithoutDaishaTypeInput, DaishaComponentUncheckedCreateWithoutDaishaTypeInput> | DaishaComponentCreateWithoutDaishaTypeInput[] | DaishaComponentUncheckedCreateWithoutDaishaTypeInput[]
    connectOrCreate?: DaishaComponentCreateOrConnectWithoutDaishaTypeInput | DaishaComponentCreateOrConnectWithoutDaishaTypeInput[]
    createMany?: DaishaComponentCreateManyDaishaTypeInputEnvelope
    connect?: DaishaComponentWhereUniqueInput | DaishaComponentWhereUniqueInput[]
  }

  export type DaishaComponentUpdateManyWithoutDaishaTypeNestedInput = {
    create?: XOR<DaishaComponentCreateWithoutDaishaTypeInput, DaishaComponentUncheckedCreateWithoutDaishaTypeInput> | DaishaComponentCreateWithoutDaishaTypeInput[] | DaishaComponentUncheckedCreateWithoutDaishaTypeInput[]
    connectOrCreate?: DaishaComponentCreateOrConnectWithoutDaishaTypeInput | DaishaComponentCreateOrConnectWithoutDaishaTypeInput[]
    upsert?: DaishaComponentUpsertWithWhereUniqueWithoutDaishaTypeInput | DaishaComponentUpsertWithWhereUniqueWithoutDaishaTypeInput[]
    createMany?: DaishaComponentCreateManyDaishaTypeInputEnvelope
    set?: DaishaComponentWhereUniqueInput | DaishaComponentWhereUniqueInput[]
    disconnect?: DaishaComponentWhereUniqueInput | DaishaComponentWhereUniqueInput[]
    delete?: DaishaComponentWhereUniqueInput | DaishaComponentWhereUniqueInput[]
    connect?: DaishaComponentWhereUniqueInput | DaishaComponentWhereUniqueInput[]
    update?: DaishaComponentUpdateWithWhereUniqueWithoutDaishaTypeInput | DaishaComponentUpdateWithWhereUniqueWithoutDaishaTypeInput[]
    updateMany?: DaishaComponentUpdateManyWithWhereWithoutDaishaTypeInput | DaishaComponentUpdateManyWithWhereWithoutDaishaTypeInput[]
    deleteMany?: DaishaComponentScalarWhereInput | DaishaComponentScalarWhereInput[]
  }

  export type DaishaComponentUncheckedUpdateManyWithoutDaishaTypeNestedInput = {
    create?: XOR<DaishaComponentCreateWithoutDaishaTypeInput, DaishaComponentUncheckedCreateWithoutDaishaTypeInput> | DaishaComponentCreateWithoutDaishaTypeInput[] | DaishaComponentUncheckedCreateWithoutDaishaTypeInput[]
    connectOrCreate?: DaishaComponentCreateOrConnectWithoutDaishaTypeInput | DaishaComponentCreateOrConnectWithoutDaishaTypeInput[]
    upsert?: DaishaComponentUpsertWithWhereUniqueWithoutDaishaTypeInput | DaishaComponentUpsertWithWhereUniqueWithoutDaishaTypeInput[]
    createMany?: DaishaComponentCreateManyDaishaTypeInputEnvelope
    set?: DaishaComponentWhereUniqueInput | DaishaComponentWhereUniqueInput[]
    disconnect?: DaishaComponentWhereUniqueInput | DaishaComponentWhereUniqueInput[]
    delete?: DaishaComponentWhereUniqueInput | DaishaComponentWhereUniqueInput[]
    connect?: DaishaComponentWhereUniqueInput | DaishaComponentWhereUniqueInput[]
    update?: DaishaComponentUpdateWithWhereUniqueWithoutDaishaTypeInput | DaishaComponentUpdateWithWhereUniqueWithoutDaishaTypeInput[]
    updateMany?: DaishaComponentUpdateManyWithWhereWithoutDaishaTypeInput | DaishaComponentUpdateManyWithWhereWithoutDaishaTypeInput[]
    deleteMany?: DaishaComponentScalarWhereInput | DaishaComponentScalarWhereInput[]
  }

  export type DaishaTypeCreateNestedOneWithoutComponentsInput = {
    create?: XOR<DaishaTypeCreateWithoutComponentsInput, DaishaTypeUncheckedCreateWithoutComponentsInput>
    connectOrCreate?: DaishaTypeCreateOrConnectWithoutComponentsInput
    connect?: DaishaTypeWhereUniqueInput
  }

  export type DaishaSymptomCreateNestedManyWithoutComponentInput = {
    create?: XOR<DaishaSymptomCreateWithoutComponentInput, DaishaSymptomUncheckedCreateWithoutComponentInput> | DaishaSymptomCreateWithoutComponentInput[] | DaishaSymptomUncheckedCreateWithoutComponentInput[]
    connectOrCreate?: DaishaSymptomCreateOrConnectWithoutComponentInput | DaishaSymptomCreateOrConnectWithoutComponentInput[]
    createMany?: DaishaSymptomCreateManyComponentInputEnvelope
    connect?: DaishaSymptomWhereUniqueInput | DaishaSymptomWhereUniqueInput[]
  }

  export type DaishaSymptomUncheckedCreateNestedManyWithoutComponentInput = {
    create?: XOR<DaishaSymptomCreateWithoutComponentInput, DaishaSymptomUncheckedCreateWithoutComponentInput> | DaishaSymptomCreateWithoutComponentInput[] | DaishaSymptomUncheckedCreateWithoutComponentInput[]
    connectOrCreate?: DaishaSymptomCreateOrConnectWithoutComponentInput | DaishaSymptomCreateOrConnectWithoutComponentInput[]
    createMany?: DaishaSymptomCreateManyComponentInputEnvelope
    connect?: DaishaSymptomWhereUniqueInput | DaishaSymptomWhereUniqueInput[]
  }

  export type DaishaTypeUpdateOneRequiredWithoutComponentsNestedInput = {
    create?: XOR<DaishaTypeCreateWithoutComponentsInput, DaishaTypeUncheckedCreateWithoutComponentsInput>
    connectOrCreate?: DaishaTypeCreateOrConnectWithoutComponentsInput
    upsert?: DaishaTypeUpsertWithoutComponentsInput
    connect?: DaishaTypeWhereUniqueInput
    update?: XOR<XOR<DaishaTypeUpdateToOneWithWhereWithoutComponentsInput, DaishaTypeUpdateWithoutComponentsInput>, DaishaTypeUncheckedUpdateWithoutComponentsInput>
  }

  export type DaishaSymptomUpdateManyWithoutComponentNestedInput = {
    create?: XOR<DaishaSymptomCreateWithoutComponentInput, DaishaSymptomUncheckedCreateWithoutComponentInput> | DaishaSymptomCreateWithoutComponentInput[] | DaishaSymptomUncheckedCreateWithoutComponentInput[]
    connectOrCreate?: DaishaSymptomCreateOrConnectWithoutComponentInput | DaishaSymptomCreateOrConnectWithoutComponentInput[]
    upsert?: DaishaSymptomUpsertWithWhereUniqueWithoutComponentInput | DaishaSymptomUpsertWithWhereUniqueWithoutComponentInput[]
    createMany?: DaishaSymptomCreateManyComponentInputEnvelope
    set?: DaishaSymptomWhereUniqueInput | DaishaSymptomWhereUniqueInput[]
    disconnect?: DaishaSymptomWhereUniqueInput | DaishaSymptomWhereUniqueInput[]
    delete?: DaishaSymptomWhereUniqueInput | DaishaSymptomWhereUniqueInput[]
    connect?: DaishaSymptomWhereUniqueInput | DaishaSymptomWhereUniqueInput[]
    update?: DaishaSymptomUpdateWithWhereUniqueWithoutComponentInput | DaishaSymptomUpdateWithWhereUniqueWithoutComponentInput[]
    updateMany?: DaishaSymptomUpdateManyWithWhereWithoutComponentInput | DaishaSymptomUpdateManyWithWhereWithoutComponentInput[]
    deleteMany?: DaishaSymptomScalarWhereInput | DaishaSymptomScalarWhereInput[]
  }

  export type DaishaSymptomUncheckedUpdateManyWithoutComponentNestedInput = {
    create?: XOR<DaishaSymptomCreateWithoutComponentInput, DaishaSymptomUncheckedCreateWithoutComponentInput> | DaishaSymptomCreateWithoutComponentInput[] | DaishaSymptomUncheckedCreateWithoutComponentInput[]
    connectOrCreate?: DaishaSymptomCreateOrConnectWithoutComponentInput | DaishaSymptomCreateOrConnectWithoutComponentInput[]
    upsert?: DaishaSymptomUpsertWithWhereUniqueWithoutComponentInput | DaishaSymptomUpsertWithWhereUniqueWithoutComponentInput[]
    createMany?: DaishaSymptomCreateManyComponentInputEnvelope
    set?: DaishaSymptomWhereUniqueInput | DaishaSymptomWhereUniqueInput[]
    disconnect?: DaishaSymptomWhereUniqueInput | DaishaSymptomWhereUniqueInput[]
    delete?: DaishaSymptomWhereUniqueInput | DaishaSymptomWhereUniqueInput[]
    connect?: DaishaSymptomWhereUniqueInput | DaishaSymptomWhereUniqueInput[]
    update?: DaishaSymptomUpdateWithWhereUniqueWithoutComponentInput | DaishaSymptomUpdateWithWhereUniqueWithoutComponentInput[]
    updateMany?: DaishaSymptomUpdateManyWithWhereWithoutComponentInput | DaishaSymptomUpdateManyWithWhereWithoutComponentInput[]
    deleteMany?: DaishaSymptomScalarWhereInput | DaishaSymptomScalarWhereInput[]
  }

  export type DaishaComponentCreateNestedOneWithoutSymptomsInput = {
    create?: XOR<DaishaComponentCreateWithoutSymptomsInput, DaishaComponentUncheckedCreateWithoutSymptomsInput>
    connectOrCreate?: DaishaComponentCreateOrConnectWithoutSymptomsInput
    connect?: DaishaComponentWhereUniqueInput
  }

  export type DaishaComponentUpdateOneRequiredWithoutSymptomsNestedInput = {
    create?: XOR<DaishaComponentCreateWithoutSymptomsInput, DaishaComponentUncheckedCreateWithoutSymptomsInput>
    connectOrCreate?: DaishaComponentCreateOrConnectWithoutSymptomsInput
    upsert?: DaishaComponentUpsertWithoutSymptomsInput
    connect?: DaishaComponentWhereUniqueInput
    update?: XOR<XOR<DaishaComponentUpdateToOneWithWhereWithoutSymptomsInput, DaishaComponentUpdateWithoutSymptomsInput>, DaishaComponentUncheckedUpdateWithoutSymptomsInput>
  }

  export type SectionRequestMaterialCreateNestedManyWithoutSectionRequestInput = {
    create?: XOR<SectionRequestMaterialCreateWithoutSectionRequestInput, SectionRequestMaterialUncheckedCreateWithoutSectionRequestInput> | SectionRequestMaterialCreateWithoutSectionRequestInput[] | SectionRequestMaterialUncheckedCreateWithoutSectionRequestInput[]
    connectOrCreate?: SectionRequestMaterialCreateOrConnectWithoutSectionRequestInput | SectionRequestMaterialCreateOrConnectWithoutSectionRequestInput[]
    createMany?: SectionRequestMaterialCreateManySectionRequestInputEnvelope
    connect?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
  }

  export type SectionRequestMaterialUncheckedCreateNestedManyWithoutSectionRequestInput = {
    create?: XOR<SectionRequestMaterialCreateWithoutSectionRequestInput, SectionRequestMaterialUncheckedCreateWithoutSectionRequestInput> | SectionRequestMaterialCreateWithoutSectionRequestInput[] | SectionRequestMaterialUncheckedCreateWithoutSectionRequestInput[]
    connectOrCreate?: SectionRequestMaterialCreateOrConnectWithoutSectionRequestInput | SectionRequestMaterialCreateOrConnectWithoutSectionRequestInput[]
    createMany?: SectionRequestMaterialCreateManySectionRequestInputEnvelope
    connect?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
  }

  export type SectionRequestMaterialUpdateManyWithoutSectionRequestNestedInput = {
    create?: XOR<SectionRequestMaterialCreateWithoutSectionRequestInput, SectionRequestMaterialUncheckedCreateWithoutSectionRequestInput> | SectionRequestMaterialCreateWithoutSectionRequestInput[] | SectionRequestMaterialUncheckedCreateWithoutSectionRequestInput[]
    connectOrCreate?: SectionRequestMaterialCreateOrConnectWithoutSectionRequestInput | SectionRequestMaterialCreateOrConnectWithoutSectionRequestInput[]
    upsert?: SectionRequestMaterialUpsertWithWhereUniqueWithoutSectionRequestInput | SectionRequestMaterialUpsertWithWhereUniqueWithoutSectionRequestInput[]
    createMany?: SectionRequestMaterialCreateManySectionRequestInputEnvelope
    set?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
    disconnect?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
    delete?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
    connect?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
    update?: SectionRequestMaterialUpdateWithWhereUniqueWithoutSectionRequestInput | SectionRequestMaterialUpdateWithWhereUniqueWithoutSectionRequestInput[]
    updateMany?: SectionRequestMaterialUpdateManyWithWhereWithoutSectionRequestInput | SectionRequestMaterialUpdateManyWithWhereWithoutSectionRequestInput[]
    deleteMany?: SectionRequestMaterialScalarWhereInput | SectionRequestMaterialScalarWhereInput[]
  }

  export type SectionRequestMaterialUncheckedUpdateManyWithoutSectionRequestNestedInput = {
    create?: XOR<SectionRequestMaterialCreateWithoutSectionRequestInput, SectionRequestMaterialUncheckedCreateWithoutSectionRequestInput> | SectionRequestMaterialCreateWithoutSectionRequestInput[] | SectionRequestMaterialUncheckedCreateWithoutSectionRequestInput[]
    connectOrCreate?: SectionRequestMaterialCreateOrConnectWithoutSectionRequestInput | SectionRequestMaterialCreateOrConnectWithoutSectionRequestInput[]
    upsert?: SectionRequestMaterialUpsertWithWhereUniqueWithoutSectionRequestInput | SectionRequestMaterialUpsertWithWhereUniqueWithoutSectionRequestInput[]
    createMany?: SectionRequestMaterialCreateManySectionRequestInputEnvelope
    set?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
    disconnect?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
    delete?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
    connect?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
    update?: SectionRequestMaterialUpdateWithWhereUniqueWithoutSectionRequestInput | SectionRequestMaterialUpdateWithWhereUniqueWithoutSectionRequestInput[]
    updateMany?: SectionRequestMaterialUpdateManyWithWhereWithoutSectionRequestInput | SectionRequestMaterialUpdateManyWithWhereWithoutSectionRequestInput[]
    deleteMany?: SectionRequestMaterialScalarWhereInput | SectionRequestMaterialScalarWhereInput[]
  }

  export type SectionRequestCreateNestedOneWithoutMaterialsInput = {
    create?: XOR<SectionRequestCreateWithoutMaterialsInput, SectionRequestUncheckedCreateWithoutMaterialsInput>
    connectOrCreate?: SectionRequestCreateOrConnectWithoutMaterialsInput
    connect?: SectionRequestWhereUniqueInput
  }

  export type SparepartCreateNestedOneWithoutRequestMaterialsInput = {
    create?: XOR<SparepartCreateWithoutRequestMaterialsInput, SparepartUncheckedCreateWithoutRequestMaterialsInput>
    connectOrCreate?: SparepartCreateOrConnectWithoutRequestMaterialsInput
    connect?: SparepartWhereUniqueInput
  }

  export type SectionRequestUpdateOneRequiredWithoutMaterialsNestedInput = {
    create?: XOR<SectionRequestCreateWithoutMaterialsInput, SectionRequestUncheckedCreateWithoutMaterialsInput>
    connectOrCreate?: SectionRequestCreateOrConnectWithoutMaterialsInput
    upsert?: SectionRequestUpsertWithoutMaterialsInput
    connect?: SectionRequestWhereUniqueInput
    update?: XOR<XOR<SectionRequestUpdateToOneWithWhereWithoutMaterialsInput, SectionRequestUpdateWithoutMaterialsInput>, SectionRequestUncheckedUpdateWithoutMaterialsInput>
  }

  export type SparepartUpdateOneRequiredWithoutRequestMaterialsNestedInput = {
    create?: XOR<SparepartCreateWithoutRequestMaterialsInput, SparepartUncheckedCreateWithoutRequestMaterialsInput>
    connectOrCreate?: SparepartCreateOrConnectWithoutRequestMaterialsInput
    upsert?: SparepartUpsertWithoutRequestMaterialsInput
    connect?: SparepartWhereUniqueInput
    update?: XOR<XOR<SparepartUpdateToOneWithWhereWithoutRequestMaterialsInput, SparepartUpdateWithoutRequestMaterialsInput>, SparepartUncheckedUpdateWithoutRequestMaterialsInput>
  }

  export type SparepartLogCreateNestedManyWithoutSparepartInput = {
    create?: XOR<SparepartLogCreateWithoutSparepartInput, SparepartLogUncheckedCreateWithoutSparepartInput> | SparepartLogCreateWithoutSparepartInput[] | SparepartLogUncheckedCreateWithoutSparepartInput[]
    connectOrCreate?: SparepartLogCreateOrConnectWithoutSparepartInput | SparepartLogCreateOrConnectWithoutSparepartInput[]
    createMany?: SparepartLogCreateManySparepartInputEnvelope
    connect?: SparepartLogWhereUniqueInput | SparepartLogWhereUniqueInput[]
  }

  export type SectionRequestMaterialCreateNestedManyWithoutSparepartInput = {
    create?: XOR<SectionRequestMaterialCreateWithoutSparepartInput, SectionRequestMaterialUncheckedCreateWithoutSparepartInput> | SectionRequestMaterialCreateWithoutSparepartInput[] | SectionRequestMaterialUncheckedCreateWithoutSparepartInput[]
    connectOrCreate?: SectionRequestMaterialCreateOrConnectWithoutSparepartInput | SectionRequestMaterialCreateOrConnectWithoutSparepartInput[]
    createMany?: SectionRequestMaterialCreateManySparepartInputEnvelope
    connect?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
  }

  export type SparepartLogUncheckedCreateNestedManyWithoutSparepartInput = {
    create?: XOR<SparepartLogCreateWithoutSparepartInput, SparepartLogUncheckedCreateWithoutSparepartInput> | SparepartLogCreateWithoutSparepartInput[] | SparepartLogUncheckedCreateWithoutSparepartInput[]
    connectOrCreate?: SparepartLogCreateOrConnectWithoutSparepartInput | SparepartLogCreateOrConnectWithoutSparepartInput[]
    createMany?: SparepartLogCreateManySparepartInputEnvelope
    connect?: SparepartLogWhereUniqueInput | SparepartLogWhereUniqueInput[]
  }

  export type SectionRequestMaterialUncheckedCreateNestedManyWithoutSparepartInput = {
    create?: XOR<SectionRequestMaterialCreateWithoutSparepartInput, SectionRequestMaterialUncheckedCreateWithoutSparepartInput> | SectionRequestMaterialCreateWithoutSparepartInput[] | SectionRequestMaterialUncheckedCreateWithoutSparepartInput[]
    connectOrCreate?: SectionRequestMaterialCreateOrConnectWithoutSparepartInput | SectionRequestMaterialCreateOrConnectWithoutSparepartInput[]
    createMany?: SectionRequestMaterialCreateManySparepartInputEnvelope
    connect?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
  }

  export type SparepartLogUpdateManyWithoutSparepartNestedInput = {
    create?: XOR<SparepartLogCreateWithoutSparepartInput, SparepartLogUncheckedCreateWithoutSparepartInput> | SparepartLogCreateWithoutSparepartInput[] | SparepartLogUncheckedCreateWithoutSparepartInput[]
    connectOrCreate?: SparepartLogCreateOrConnectWithoutSparepartInput | SparepartLogCreateOrConnectWithoutSparepartInput[]
    upsert?: SparepartLogUpsertWithWhereUniqueWithoutSparepartInput | SparepartLogUpsertWithWhereUniqueWithoutSparepartInput[]
    createMany?: SparepartLogCreateManySparepartInputEnvelope
    set?: SparepartLogWhereUniqueInput | SparepartLogWhereUniqueInput[]
    disconnect?: SparepartLogWhereUniqueInput | SparepartLogWhereUniqueInput[]
    delete?: SparepartLogWhereUniqueInput | SparepartLogWhereUniqueInput[]
    connect?: SparepartLogWhereUniqueInput | SparepartLogWhereUniqueInput[]
    update?: SparepartLogUpdateWithWhereUniqueWithoutSparepartInput | SparepartLogUpdateWithWhereUniqueWithoutSparepartInput[]
    updateMany?: SparepartLogUpdateManyWithWhereWithoutSparepartInput | SparepartLogUpdateManyWithWhereWithoutSparepartInput[]
    deleteMany?: SparepartLogScalarWhereInput | SparepartLogScalarWhereInput[]
  }

  export type SectionRequestMaterialUpdateManyWithoutSparepartNestedInput = {
    create?: XOR<SectionRequestMaterialCreateWithoutSparepartInput, SectionRequestMaterialUncheckedCreateWithoutSparepartInput> | SectionRequestMaterialCreateWithoutSparepartInput[] | SectionRequestMaterialUncheckedCreateWithoutSparepartInput[]
    connectOrCreate?: SectionRequestMaterialCreateOrConnectWithoutSparepartInput | SectionRequestMaterialCreateOrConnectWithoutSparepartInput[]
    upsert?: SectionRequestMaterialUpsertWithWhereUniqueWithoutSparepartInput | SectionRequestMaterialUpsertWithWhereUniqueWithoutSparepartInput[]
    createMany?: SectionRequestMaterialCreateManySparepartInputEnvelope
    set?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
    disconnect?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
    delete?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
    connect?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
    update?: SectionRequestMaterialUpdateWithWhereUniqueWithoutSparepartInput | SectionRequestMaterialUpdateWithWhereUniqueWithoutSparepartInput[]
    updateMany?: SectionRequestMaterialUpdateManyWithWhereWithoutSparepartInput | SectionRequestMaterialUpdateManyWithWhereWithoutSparepartInput[]
    deleteMany?: SectionRequestMaterialScalarWhereInput | SectionRequestMaterialScalarWhereInput[]
  }

  export type SparepartLogUncheckedUpdateManyWithoutSparepartNestedInput = {
    create?: XOR<SparepartLogCreateWithoutSparepartInput, SparepartLogUncheckedCreateWithoutSparepartInput> | SparepartLogCreateWithoutSparepartInput[] | SparepartLogUncheckedCreateWithoutSparepartInput[]
    connectOrCreate?: SparepartLogCreateOrConnectWithoutSparepartInput | SparepartLogCreateOrConnectWithoutSparepartInput[]
    upsert?: SparepartLogUpsertWithWhereUniqueWithoutSparepartInput | SparepartLogUpsertWithWhereUniqueWithoutSparepartInput[]
    createMany?: SparepartLogCreateManySparepartInputEnvelope
    set?: SparepartLogWhereUniqueInput | SparepartLogWhereUniqueInput[]
    disconnect?: SparepartLogWhereUniqueInput | SparepartLogWhereUniqueInput[]
    delete?: SparepartLogWhereUniqueInput | SparepartLogWhereUniqueInput[]
    connect?: SparepartLogWhereUniqueInput | SparepartLogWhereUniqueInput[]
    update?: SparepartLogUpdateWithWhereUniqueWithoutSparepartInput | SparepartLogUpdateWithWhereUniqueWithoutSparepartInput[]
    updateMany?: SparepartLogUpdateManyWithWhereWithoutSparepartInput | SparepartLogUpdateManyWithWhereWithoutSparepartInput[]
    deleteMany?: SparepartLogScalarWhereInput | SparepartLogScalarWhereInput[]
  }

  export type SectionRequestMaterialUncheckedUpdateManyWithoutSparepartNestedInput = {
    create?: XOR<SectionRequestMaterialCreateWithoutSparepartInput, SectionRequestMaterialUncheckedCreateWithoutSparepartInput> | SectionRequestMaterialCreateWithoutSparepartInput[] | SectionRequestMaterialUncheckedCreateWithoutSparepartInput[]
    connectOrCreate?: SectionRequestMaterialCreateOrConnectWithoutSparepartInput | SectionRequestMaterialCreateOrConnectWithoutSparepartInput[]
    upsert?: SectionRequestMaterialUpsertWithWhereUniqueWithoutSparepartInput | SectionRequestMaterialUpsertWithWhereUniqueWithoutSparepartInput[]
    createMany?: SectionRequestMaterialCreateManySparepartInputEnvelope
    set?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
    disconnect?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
    delete?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
    connect?: SectionRequestMaterialWhereUniqueInput | SectionRequestMaterialWhereUniqueInput[]
    update?: SectionRequestMaterialUpdateWithWhereUniqueWithoutSparepartInput | SectionRequestMaterialUpdateWithWhereUniqueWithoutSparepartInput[]
    updateMany?: SectionRequestMaterialUpdateManyWithWhereWithoutSparepartInput | SectionRequestMaterialUpdateManyWithWhereWithoutSparepartInput[]
    deleteMany?: SectionRequestMaterialScalarWhereInput | SectionRequestMaterialScalarWhereInput[]
  }

  export type SparepartCreateNestedOneWithoutLogsInput = {
    create?: XOR<SparepartCreateWithoutLogsInput, SparepartUncheckedCreateWithoutLogsInput>
    connectOrCreate?: SparepartCreateOrConnectWithoutLogsInput
    connect?: SparepartWhereUniqueInput
  }

  export type SparepartUpdateOneRequiredWithoutLogsNestedInput = {
    create?: XOR<SparepartCreateWithoutLogsInput, SparepartUncheckedCreateWithoutLogsInput>
    connectOrCreate?: SparepartCreateOrConnectWithoutLogsInput
    upsert?: SparepartUpsertWithoutLogsInput
    connect?: SparepartWhereUniqueInput
    update?: XOR<XOR<SparepartUpdateToOneWithWhereWithoutLogsInput, SparepartUpdateWithoutLogsInput>, SparepartUncheckedUpdateWithoutLogsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type TicketCreateWithoutDaishaInput = {
    idTiket: string
    namaPelapor: string
    status?: string
    waktuMasuk?: Date | string
    waktuSelesai?: Date | string | null
    catatan?: string | null
    details?: TicketDetailCreateNestedManyWithoutTicketInput
  }

  export type TicketUncheckedCreateWithoutDaishaInput = {
    idTiket: string
    namaPelapor: string
    status?: string
    waktuMasuk?: Date | string
    waktuSelesai?: Date | string | null
    catatan?: string | null
    details?: TicketDetailUncheckedCreateNestedManyWithoutTicketInput
  }

  export type TicketCreateOrConnectWithoutDaishaInput = {
    where: TicketWhereUniqueInput
    create: XOR<TicketCreateWithoutDaishaInput, TicketUncheckedCreateWithoutDaishaInput>
  }

  export type TicketCreateManyDaishaInputEnvelope = {
    data: TicketCreateManyDaishaInput | TicketCreateManyDaishaInput[]
    skipDuplicates?: boolean
  }

  export type TicketUpsertWithWhereUniqueWithoutDaishaInput = {
    where: TicketWhereUniqueInput
    update: XOR<TicketUpdateWithoutDaishaInput, TicketUncheckedUpdateWithoutDaishaInput>
    create: XOR<TicketCreateWithoutDaishaInput, TicketUncheckedCreateWithoutDaishaInput>
  }

  export type TicketUpdateWithWhereUniqueWithoutDaishaInput = {
    where: TicketWhereUniqueInput
    data: XOR<TicketUpdateWithoutDaishaInput, TicketUncheckedUpdateWithoutDaishaInput>
  }

  export type TicketUpdateManyWithWhereWithoutDaishaInput = {
    where: TicketScalarWhereInput
    data: XOR<TicketUpdateManyMutationInput, TicketUncheckedUpdateManyWithoutDaishaInput>
  }

  export type TicketScalarWhereInput = {
    AND?: TicketScalarWhereInput | TicketScalarWhereInput[]
    OR?: TicketScalarWhereInput[]
    NOT?: TicketScalarWhereInput | TicketScalarWhereInput[]
    idTiket?: StringFilter<"Ticket"> | string
    noDaisha?: StringFilter<"Ticket"> | string
    namaPelapor?: StringFilter<"Ticket"> | string
    status?: StringFilter<"Ticket"> | string
    waktuMasuk?: DateTimeFilter<"Ticket"> | Date | string
    waktuSelesai?: DateTimeNullableFilter<"Ticket"> | Date | string | null
    catatan?: StringNullableFilter<"Ticket"> | string | null
  }

  export type MasterDaishaCreateWithoutTicketsInput = {
    noDaisha: string
    namaDaisha: string
    ukuran: string
    seksi: string
  }

  export type MasterDaishaUncheckedCreateWithoutTicketsInput = {
    noDaisha: string
    namaDaisha: string
    ukuran: string
    seksi: string
  }

  export type MasterDaishaCreateOrConnectWithoutTicketsInput = {
    where: MasterDaishaWhereUniqueInput
    create: XOR<MasterDaishaCreateWithoutTicketsInput, MasterDaishaUncheckedCreateWithoutTicketsInput>
  }

  export type TicketDetailCreateWithoutTicketInput = {
    komponen: string
    gejala: string
    tindakan: string
    qty: number
  }

  export type TicketDetailUncheckedCreateWithoutTicketInput = {
    idDetail?: number
    komponen: string
    gejala: string
    tindakan: string
    qty: number
  }

  export type TicketDetailCreateOrConnectWithoutTicketInput = {
    where: TicketDetailWhereUniqueInput
    create: XOR<TicketDetailCreateWithoutTicketInput, TicketDetailUncheckedCreateWithoutTicketInput>
  }

  export type TicketDetailCreateManyTicketInputEnvelope = {
    data: TicketDetailCreateManyTicketInput | TicketDetailCreateManyTicketInput[]
    skipDuplicates?: boolean
  }

  export type MasterDaishaUpsertWithoutTicketsInput = {
    update: XOR<MasterDaishaUpdateWithoutTicketsInput, MasterDaishaUncheckedUpdateWithoutTicketsInput>
    create: XOR<MasterDaishaCreateWithoutTicketsInput, MasterDaishaUncheckedCreateWithoutTicketsInput>
    where?: MasterDaishaWhereInput
  }

  export type MasterDaishaUpdateToOneWithWhereWithoutTicketsInput = {
    where?: MasterDaishaWhereInput
    data: XOR<MasterDaishaUpdateWithoutTicketsInput, MasterDaishaUncheckedUpdateWithoutTicketsInput>
  }

  export type MasterDaishaUpdateWithoutTicketsInput = {
    noDaisha?: StringFieldUpdateOperationsInput | string
    namaDaisha?: StringFieldUpdateOperationsInput | string
    ukuran?: StringFieldUpdateOperationsInput | string
    seksi?: StringFieldUpdateOperationsInput | string
  }

  export type MasterDaishaUncheckedUpdateWithoutTicketsInput = {
    noDaisha?: StringFieldUpdateOperationsInput | string
    namaDaisha?: StringFieldUpdateOperationsInput | string
    ukuran?: StringFieldUpdateOperationsInput | string
    seksi?: StringFieldUpdateOperationsInput | string
  }

  export type TicketDetailUpsertWithWhereUniqueWithoutTicketInput = {
    where: TicketDetailWhereUniqueInput
    update: XOR<TicketDetailUpdateWithoutTicketInput, TicketDetailUncheckedUpdateWithoutTicketInput>
    create: XOR<TicketDetailCreateWithoutTicketInput, TicketDetailUncheckedCreateWithoutTicketInput>
  }

  export type TicketDetailUpdateWithWhereUniqueWithoutTicketInput = {
    where: TicketDetailWhereUniqueInput
    data: XOR<TicketDetailUpdateWithoutTicketInput, TicketDetailUncheckedUpdateWithoutTicketInput>
  }

  export type TicketDetailUpdateManyWithWhereWithoutTicketInput = {
    where: TicketDetailScalarWhereInput
    data: XOR<TicketDetailUpdateManyMutationInput, TicketDetailUncheckedUpdateManyWithoutTicketInput>
  }

  export type TicketDetailScalarWhereInput = {
    AND?: TicketDetailScalarWhereInput | TicketDetailScalarWhereInput[]
    OR?: TicketDetailScalarWhereInput[]
    NOT?: TicketDetailScalarWhereInput | TicketDetailScalarWhereInput[]
    idDetail?: IntFilter<"TicketDetail"> | number
    idTiket?: StringFilter<"TicketDetail"> | string
    komponen?: StringFilter<"TicketDetail"> | string
    gejala?: StringFilter<"TicketDetail"> | string
    tindakan?: StringFilter<"TicketDetail"> | string
    qty?: IntFilter<"TicketDetail"> | number
  }

  export type TicketCreateWithoutDetailsInput = {
    idTiket: string
    namaPelapor: string
    status?: string
    waktuMasuk?: Date | string
    waktuSelesai?: Date | string | null
    catatan?: string | null
    daisha: MasterDaishaCreateNestedOneWithoutTicketsInput
  }

  export type TicketUncheckedCreateWithoutDetailsInput = {
    idTiket: string
    noDaisha: string
    namaPelapor: string
    status?: string
    waktuMasuk?: Date | string
    waktuSelesai?: Date | string | null
    catatan?: string | null
  }

  export type TicketCreateOrConnectWithoutDetailsInput = {
    where: TicketWhereUniqueInput
    create: XOR<TicketCreateWithoutDetailsInput, TicketUncheckedCreateWithoutDetailsInput>
  }

  export type TicketUpsertWithoutDetailsInput = {
    update: XOR<TicketUpdateWithoutDetailsInput, TicketUncheckedUpdateWithoutDetailsInput>
    create: XOR<TicketCreateWithoutDetailsInput, TicketUncheckedCreateWithoutDetailsInput>
    where?: TicketWhereInput
  }

  export type TicketUpdateToOneWithWhereWithoutDetailsInput = {
    where?: TicketWhereInput
    data: XOR<TicketUpdateWithoutDetailsInput, TicketUncheckedUpdateWithoutDetailsInput>
  }

  export type TicketUpdateWithoutDetailsInput = {
    idTiket?: StringFieldUpdateOperationsInput | string
    namaPelapor?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    waktuMasuk?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuSelesai?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    daisha?: MasterDaishaUpdateOneRequiredWithoutTicketsNestedInput
  }

  export type TicketUncheckedUpdateWithoutDetailsInput = {
    idTiket?: StringFieldUpdateOperationsInput | string
    noDaisha?: StringFieldUpdateOperationsInput | string
    namaPelapor?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    waktuMasuk?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuSelesai?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DaishaComponentCreateWithoutDaishaTypeInput = {
    name: string
    symptoms?: DaishaSymptomCreateNestedManyWithoutComponentInput
  }

  export type DaishaComponentUncheckedCreateWithoutDaishaTypeInput = {
    id?: number
    name: string
    symptoms?: DaishaSymptomUncheckedCreateNestedManyWithoutComponentInput
  }

  export type DaishaComponentCreateOrConnectWithoutDaishaTypeInput = {
    where: DaishaComponentWhereUniqueInput
    create: XOR<DaishaComponentCreateWithoutDaishaTypeInput, DaishaComponentUncheckedCreateWithoutDaishaTypeInput>
  }

  export type DaishaComponentCreateManyDaishaTypeInputEnvelope = {
    data: DaishaComponentCreateManyDaishaTypeInput | DaishaComponentCreateManyDaishaTypeInput[]
    skipDuplicates?: boolean
  }

  export type DaishaComponentUpsertWithWhereUniqueWithoutDaishaTypeInput = {
    where: DaishaComponentWhereUniqueInput
    update: XOR<DaishaComponentUpdateWithoutDaishaTypeInput, DaishaComponentUncheckedUpdateWithoutDaishaTypeInput>
    create: XOR<DaishaComponentCreateWithoutDaishaTypeInput, DaishaComponentUncheckedCreateWithoutDaishaTypeInput>
  }

  export type DaishaComponentUpdateWithWhereUniqueWithoutDaishaTypeInput = {
    where: DaishaComponentWhereUniqueInput
    data: XOR<DaishaComponentUpdateWithoutDaishaTypeInput, DaishaComponentUncheckedUpdateWithoutDaishaTypeInput>
  }

  export type DaishaComponentUpdateManyWithWhereWithoutDaishaTypeInput = {
    where: DaishaComponentScalarWhereInput
    data: XOR<DaishaComponentUpdateManyMutationInput, DaishaComponentUncheckedUpdateManyWithoutDaishaTypeInput>
  }

  export type DaishaComponentScalarWhereInput = {
    AND?: DaishaComponentScalarWhereInput | DaishaComponentScalarWhereInput[]
    OR?: DaishaComponentScalarWhereInput[]
    NOT?: DaishaComponentScalarWhereInput | DaishaComponentScalarWhereInput[]
    id?: IntFilter<"DaishaComponent"> | number
    daishaTypeId?: IntFilter<"DaishaComponent"> | number
    name?: StringFilter<"DaishaComponent"> | string
  }

  export type DaishaTypeCreateWithoutComponentsInput = {
    name: string
    seksi: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DaishaTypeUncheckedCreateWithoutComponentsInput = {
    id?: number
    name: string
    seksi: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DaishaTypeCreateOrConnectWithoutComponentsInput = {
    where: DaishaTypeWhereUniqueInput
    create: XOR<DaishaTypeCreateWithoutComponentsInput, DaishaTypeUncheckedCreateWithoutComponentsInput>
  }

  export type DaishaSymptomCreateWithoutComponentInput = {
    description: string
  }

  export type DaishaSymptomUncheckedCreateWithoutComponentInput = {
    id?: number
    description: string
  }

  export type DaishaSymptomCreateOrConnectWithoutComponentInput = {
    where: DaishaSymptomWhereUniqueInput
    create: XOR<DaishaSymptomCreateWithoutComponentInput, DaishaSymptomUncheckedCreateWithoutComponentInput>
  }

  export type DaishaSymptomCreateManyComponentInputEnvelope = {
    data: DaishaSymptomCreateManyComponentInput | DaishaSymptomCreateManyComponentInput[]
    skipDuplicates?: boolean
  }

  export type DaishaTypeUpsertWithoutComponentsInput = {
    update: XOR<DaishaTypeUpdateWithoutComponentsInput, DaishaTypeUncheckedUpdateWithoutComponentsInput>
    create: XOR<DaishaTypeCreateWithoutComponentsInput, DaishaTypeUncheckedCreateWithoutComponentsInput>
    where?: DaishaTypeWhereInput
  }

  export type DaishaTypeUpdateToOneWithWhereWithoutComponentsInput = {
    where?: DaishaTypeWhereInput
    data: XOR<DaishaTypeUpdateWithoutComponentsInput, DaishaTypeUncheckedUpdateWithoutComponentsInput>
  }

  export type DaishaTypeUpdateWithoutComponentsInput = {
    name?: StringFieldUpdateOperationsInput | string
    seksi?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DaishaTypeUncheckedUpdateWithoutComponentsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    seksi?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DaishaSymptomUpsertWithWhereUniqueWithoutComponentInput = {
    where: DaishaSymptomWhereUniqueInput
    update: XOR<DaishaSymptomUpdateWithoutComponentInput, DaishaSymptomUncheckedUpdateWithoutComponentInput>
    create: XOR<DaishaSymptomCreateWithoutComponentInput, DaishaSymptomUncheckedCreateWithoutComponentInput>
  }

  export type DaishaSymptomUpdateWithWhereUniqueWithoutComponentInput = {
    where: DaishaSymptomWhereUniqueInput
    data: XOR<DaishaSymptomUpdateWithoutComponentInput, DaishaSymptomUncheckedUpdateWithoutComponentInput>
  }

  export type DaishaSymptomUpdateManyWithWhereWithoutComponentInput = {
    where: DaishaSymptomScalarWhereInput
    data: XOR<DaishaSymptomUpdateManyMutationInput, DaishaSymptomUncheckedUpdateManyWithoutComponentInput>
  }

  export type DaishaSymptomScalarWhereInput = {
    AND?: DaishaSymptomScalarWhereInput | DaishaSymptomScalarWhereInput[]
    OR?: DaishaSymptomScalarWhereInput[]
    NOT?: DaishaSymptomScalarWhereInput | DaishaSymptomScalarWhereInput[]
    id?: IntFilter<"DaishaSymptom"> | number
    componentId?: IntFilter<"DaishaSymptom"> | number
    description?: StringFilter<"DaishaSymptom"> | string
  }

  export type DaishaComponentCreateWithoutSymptomsInput = {
    name: string
    daishaType: DaishaTypeCreateNestedOneWithoutComponentsInput
  }

  export type DaishaComponentUncheckedCreateWithoutSymptomsInput = {
    id?: number
    daishaTypeId: number
    name: string
  }

  export type DaishaComponentCreateOrConnectWithoutSymptomsInput = {
    where: DaishaComponentWhereUniqueInput
    create: XOR<DaishaComponentCreateWithoutSymptomsInput, DaishaComponentUncheckedCreateWithoutSymptomsInput>
  }

  export type DaishaComponentUpsertWithoutSymptomsInput = {
    update: XOR<DaishaComponentUpdateWithoutSymptomsInput, DaishaComponentUncheckedUpdateWithoutSymptomsInput>
    create: XOR<DaishaComponentCreateWithoutSymptomsInput, DaishaComponentUncheckedCreateWithoutSymptomsInput>
    where?: DaishaComponentWhereInput
  }

  export type DaishaComponentUpdateToOneWithWhereWithoutSymptomsInput = {
    where?: DaishaComponentWhereInput
    data: XOR<DaishaComponentUpdateWithoutSymptomsInput, DaishaComponentUncheckedUpdateWithoutSymptomsInput>
  }

  export type DaishaComponentUpdateWithoutSymptomsInput = {
    name?: StringFieldUpdateOperationsInput | string
    daishaType?: DaishaTypeUpdateOneRequiredWithoutComponentsNestedInput
  }

  export type DaishaComponentUncheckedUpdateWithoutSymptomsInput = {
    id?: IntFieldUpdateOperationsInput | number
    daishaTypeId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
  }

  export type SectionRequestMaterialCreateWithoutSectionRequestInput = {
    qty?: number
    keterangan?: string | null
    sparepart: SparepartCreateNestedOneWithoutRequestMaterialsInput
  }

  export type SectionRequestMaterialUncheckedCreateWithoutSectionRequestInput = {
    id?: number
    namaKomponen: string
    qty?: number
    keterangan?: string | null
  }

  export type SectionRequestMaterialCreateOrConnectWithoutSectionRequestInput = {
    where: SectionRequestMaterialWhereUniqueInput
    create: XOR<SectionRequestMaterialCreateWithoutSectionRequestInput, SectionRequestMaterialUncheckedCreateWithoutSectionRequestInput>
  }

  export type SectionRequestMaterialCreateManySectionRequestInputEnvelope = {
    data: SectionRequestMaterialCreateManySectionRequestInput | SectionRequestMaterialCreateManySectionRequestInput[]
    skipDuplicates?: boolean
  }

  export type SectionRequestMaterialUpsertWithWhereUniqueWithoutSectionRequestInput = {
    where: SectionRequestMaterialWhereUniqueInput
    update: XOR<SectionRequestMaterialUpdateWithoutSectionRequestInput, SectionRequestMaterialUncheckedUpdateWithoutSectionRequestInput>
    create: XOR<SectionRequestMaterialCreateWithoutSectionRequestInput, SectionRequestMaterialUncheckedCreateWithoutSectionRequestInput>
  }

  export type SectionRequestMaterialUpdateWithWhereUniqueWithoutSectionRequestInput = {
    where: SectionRequestMaterialWhereUniqueInput
    data: XOR<SectionRequestMaterialUpdateWithoutSectionRequestInput, SectionRequestMaterialUncheckedUpdateWithoutSectionRequestInput>
  }

  export type SectionRequestMaterialUpdateManyWithWhereWithoutSectionRequestInput = {
    where: SectionRequestMaterialScalarWhereInput
    data: XOR<SectionRequestMaterialUpdateManyMutationInput, SectionRequestMaterialUncheckedUpdateManyWithoutSectionRequestInput>
  }

  export type SectionRequestMaterialScalarWhereInput = {
    AND?: SectionRequestMaterialScalarWhereInput | SectionRequestMaterialScalarWhereInput[]
    OR?: SectionRequestMaterialScalarWhereInput[]
    NOT?: SectionRequestMaterialScalarWhereInput | SectionRequestMaterialScalarWhereInput[]
    id?: IntFilter<"SectionRequestMaterial"> | number
    sectionRequestId?: IntFilter<"SectionRequestMaterial"> | number
    namaKomponen?: StringFilter<"SectionRequestMaterial"> | string
    qty?: IntFilter<"SectionRequestMaterial"> | number
    keterangan?: StringNullableFilter<"SectionRequestMaterial"> | string | null
  }

  export type SectionRequestCreateWithoutMaterialsInput = {
    nomorRequest: string
    seksiPemohon: string
    picPemohon: string
    kontakPemohon?: string | null
    namaBarang: string
    spesifikasi?: string | null
    jumlah?: number
    satuan?: string
    urgensi?: string
    catatan?: string | null
    status?: string
    alasanTolak?: string | null
    picBengkel?: string | null
    estimasi?: string | null
    catatanAdmin?: string | null
    dibuatOleh: string
    waktuDibuat?: Date | string
    waktuUpdate?: Date | string
    waktuSelesai?: Date | string | null
  }

  export type SectionRequestUncheckedCreateWithoutMaterialsInput = {
    id?: number
    nomorRequest: string
    seksiPemohon: string
    picPemohon: string
    kontakPemohon?: string | null
    namaBarang: string
    spesifikasi?: string | null
    jumlah?: number
    satuan?: string
    urgensi?: string
    catatan?: string | null
    status?: string
    alasanTolak?: string | null
    picBengkel?: string | null
    estimasi?: string | null
    catatanAdmin?: string | null
    dibuatOleh: string
    waktuDibuat?: Date | string
    waktuUpdate?: Date | string
    waktuSelesai?: Date | string | null
  }

  export type SectionRequestCreateOrConnectWithoutMaterialsInput = {
    where: SectionRequestWhereUniqueInput
    create: XOR<SectionRequestCreateWithoutMaterialsInput, SectionRequestUncheckedCreateWithoutMaterialsInput>
  }

  export type SparepartCreateWithoutRequestMaterialsInput = {
    namaKomponen: string
    kategori?: string
    stokGudang?: number
    satuan: string
    minStok?: number
    lokasi?: string | null
    logs?: SparepartLogCreateNestedManyWithoutSparepartInput
  }

  export type SparepartUncheckedCreateWithoutRequestMaterialsInput = {
    namaKomponen: string
    kategori?: string
    stokGudang?: number
    satuan: string
    minStok?: number
    lokasi?: string | null
    logs?: SparepartLogUncheckedCreateNestedManyWithoutSparepartInput
  }

  export type SparepartCreateOrConnectWithoutRequestMaterialsInput = {
    where: SparepartWhereUniqueInput
    create: XOR<SparepartCreateWithoutRequestMaterialsInput, SparepartUncheckedCreateWithoutRequestMaterialsInput>
  }

  export type SectionRequestUpsertWithoutMaterialsInput = {
    update: XOR<SectionRequestUpdateWithoutMaterialsInput, SectionRequestUncheckedUpdateWithoutMaterialsInput>
    create: XOR<SectionRequestCreateWithoutMaterialsInput, SectionRequestUncheckedCreateWithoutMaterialsInput>
    where?: SectionRequestWhereInput
  }

  export type SectionRequestUpdateToOneWithWhereWithoutMaterialsInput = {
    where?: SectionRequestWhereInput
    data: XOR<SectionRequestUpdateWithoutMaterialsInput, SectionRequestUncheckedUpdateWithoutMaterialsInput>
  }

  export type SectionRequestUpdateWithoutMaterialsInput = {
    nomorRequest?: StringFieldUpdateOperationsInput | string
    seksiPemohon?: StringFieldUpdateOperationsInput | string
    picPemohon?: StringFieldUpdateOperationsInput | string
    kontakPemohon?: NullableStringFieldUpdateOperationsInput | string | null
    namaBarang?: StringFieldUpdateOperationsInput | string
    spesifikasi?: NullableStringFieldUpdateOperationsInput | string | null
    jumlah?: IntFieldUpdateOperationsInput | number
    satuan?: StringFieldUpdateOperationsInput | string
    urgensi?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    alasanTolak?: NullableStringFieldUpdateOperationsInput | string | null
    picBengkel?: NullableStringFieldUpdateOperationsInput | string | null
    estimasi?: NullableStringFieldUpdateOperationsInput | string | null
    catatanAdmin?: NullableStringFieldUpdateOperationsInput | string | null
    dibuatOleh?: StringFieldUpdateOperationsInput | string
    waktuDibuat?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuSelesai?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SectionRequestUncheckedUpdateWithoutMaterialsInput = {
    id?: IntFieldUpdateOperationsInput | number
    nomorRequest?: StringFieldUpdateOperationsInput | string
    seksiPemohon?: StringFieldUpdateOperationsInput | string
    picPemohon?: StringFieldUpdateOperationsInput | string
    kontakPemohon?: NullableStringFieldUpdateOperationsInput | string | null
    namaBarang?: StringFieldUpdateOperationsInput | string
    spesifikasi?: NullableStringFieldUpdateOperationsInput | string | null
    jumlah?: IntFieldUpdateOperationsInput | number
    satuan?: StringFieldUpdateOperationsInput | string
    urgensi?: StringFieldUpdateOperationsInput | string
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    alasanTolak?: NullableStringFieldUpdateOperationsInput | string | null
    picBengkel?: NullableStringFieldUpdateOperationsInput | string | null
    estimasi?: NullableStringFieldUpdateOperationsInput | string | null
    catatanAdmin?: NullableStringFieldUpdateOperationsInput | string | null
    dibuatOleh?: StringFieldUpdateOperationsInput | string
    waktuDibuat?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuSelesai?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SparepartUpsertWithoutRequestMaterialsInput = {
    update: XOR<SparepartUpdateWithoutRequestMaterialsInput, SparepartUncheckedUpdateWithoutRequestMaterialsInput>
    create: XOR<SparepartCreateWithoutRequestMaterialsInput, SparepartUncheckedCreateWithoutRequestMaterialsInput>
    where?: SparepartWhereInput
  }

  export type SparepartUpdateToOneWithWhereWithoutRequestMaterialsInput = {
    where?: SparepartWhereInput
    data: XOR<SparepartUpdateWithoutRequestMaterialsInput, SparepartUncheckedUpdateWithoutRequestMaterialsInput>
  }

  export type SparepartUpdateWithoutRequestMaterialsInput = {
    namaKomponen?: StringFieldUpdateOperationsInput | string
    kategori?: StringFieldUpdateOperationsInput | string
    stokGudang?: IntFieldUpdateOperationsInput | number
    satuan?: StringFieldUpdateOperationsInput | string
    minStok?: IntFieldUpdateOperationsInput | number
    lokasi?: NullableStringFieldUpdateOperationsInput | string | null
    logs?: SparepartLogUpdateManyWithoutSparepartNestedInput
  }

  export type SparepartUncheckedUpdateWithoutRequestMaterialsInput = {
    namaKomponen?: StringFieldUpdateOperationsInput | string
    kategori?: StringFieldUpdateOperationsInput | string
    stokGudang?: IntFieldUpdateOperationsInput | number
    satuan?: StringFieldUpdateOperationsInput | string
    minStok?: IntFieldUpdateOperationsInput | number
    lokasi?: NullableStringFieldUpdateOperationsInput | string | null
    logs?: SparepartLogUncheckedUpdateManyWithoutSparepartNestedInput
  }

  export type SparepartLogCreateWithoutSparepartInput = {
    tipe: string
    qty: number
    referensi?: string | null
    keterangan?: string | null
    tanggal?: Date | string
  }

  export type SparepartLogUncheckedCreateWithoutSparepartInput = {
    id?: number
    tipe: string
    qty: number
    referensi?: string | null
    keterangan?: string | null
    tanggal?: Date | string
  }

  export type SparepartLogCreateOrConnectWithoutSparepartInput = {
    where: SparepartLogWhereUniqueInput
    create: XOR<SparepartLogCreateWithoutSparepartInput, SparepartLogUncheckedCreateWithoutSparepartInput>
  }

  export type SparepartLogCreateManySparepartInputEnvelope = {
    data: SparepartLogCreateManySparepartInput | SparepartLogCreateManySparepartInput[]
    skipDuplicates?: boolean
  }

  export type SectionRequestMaterialCreateWithoutSparepartInput = {
    qty?: number
    keterangan?: string | null
    sectionRequest: SectionRequestCreateNestedOneWithoutMaterialsInput
  }

  export type SectionRequestMaterialUncheckedCreateWithoutSparepartInput = {
    id?: number
    sectionRequestId: number
    qty?: number
    keterangan?: string | null
  }

  export type SectionRequestMaterialCreateOrConnectWithoutSparepartInput = {
    where: SectionRequestMaterialWhereUniqueInput
    create: XOR<SectionRequestMaterialCreateWithoutSparepartInput, SectionRequestMaterialUncheckedCreateWithoutSparepartInput>
  }

  export type SectionRequestMaterialCreateManySparepartInputEnvelope = {
    data: SectionRequestMaterialCreateManySparepartInput | SectionRequestMaterialCreateManySparepartInput[]
    skipDuplicates?: boolean
  }

  export type SparepartLogUpsertWithWhereUniqueWithoutSparepartInput = {
    where: SparepartLogWhereUniqueInput
    update: XOR<SparepartLogUpdateWithoutSparepartInput, SparepartLogUncheckedUpdateWithoutSparepartInput>
    create: XOR<SparepartLogCreateWithoutSparepartInput, SparepartLogUncheckedCreateWithoutSparepartInput>
  }

  export type SparepartLogUpdateWithWhereUniqueWithoutSparepartInput = {
    where: SparepartLogWhereUniqueInput
    data: XOR<SparepartLogUpdateWithoutSparepartInput, SparepartLogUncheckedUpdateWithoutSparepartInput>
  }

  export type SparepartLogUpdateManyWithWhereWithoutSparepartInput = {
    where: SparepartLogScalarWhereInput
    data: XOR<SparepartLogUpdateManyMutationInput, SparepartLogUncheckedUpdateManyWithoutSparepartInput>
  }

  export type SparepartLogScalarWhereInput = {
    AND?: SparepartLogScalarWhereInput | SparepartLogScalarWhereInput[]
    OR?: SparepartLogScalarWhereInput[]
    NOT?: SparepartLogScalarWhereInput | SparepartLogScalarWhereInput[]
    id?: IntFilter<"SparepartLog"> | number
    namaKomponen?: StringFilter<"SparepartLog"> | string
    tipe?: StringFilter<"SparepartLog"> | string
    qty?: IntFilter<"SparepartLog"> | number
    referensi?: StringNullableFilter<"SparepartLog"> | string | null
    keterangan?: StringNullableFilter<"SparepartLog"> | string | null
    tanggal?: DateTimeFilter<"SparepartLog"> | Date | string
  }

  export type SectionRequestMaterialUpsertWithWhereUniqueWithoutSparepartInput = {
    where: SectionRequestMaterialWhereUniqueInput
    update: XOR<SectionRequestMaterialUpdateWithoutSparepartInput, SectionRequestMaterialUncheckedUpdateWithoutSparepartInput>
    create: XOR<SectionRequestMaterialCreateWithoutSparepartInput, SectionRequestMaterialUncheckedCreateWithoutSparepartInput>
  }

  export type SectionRequestMaterialUpdateWithWhereUniqueWithoutSparepartInput = {
    where: SectionRequestMaterialWhereUniqueInput
    data: XOR<SectionRequestMaterialUpdateWithoutSparepartInput, SectionRequestMaterialUncheckedUpdateWithoutSparepartInput>
  }

  export type SectionRequestMaterialUpdateManyWithWhereWithoutSparepartInput = {
    where: SectionRequestMaterialScalarWhereInput
    data: XOR<SectionRequestMaterialUpdateManyMutationInput, SectionRequestMaterialUncheckedUpdateManyWithoutSparepartInput>
  }

  export type SparepartCreateWithoutLogsInput = {
    namaKomponen: string
    kategori?: string
    stokGudang?: number
    satuan: string
    minStok?: number
    lokasi?: string | null
    requestMaterials?: SectionRequestMaterialCreateNestedManyWithoutSparepartInput
  }

  export type SparepartUncheckedCreateWithoutLogsInput = {
    namaKomponen: string
    kategori?: string
    stokGudang?: number
    satuan: string
    minStok?: number
    lokasi?: string | null
    requestMaterials?: SectionRequestMaterialUncheckedCreateNestedManyWithoutSparepartInput
  }

  export type SparepartCreateOrConnectWithoutLogsInput = {
    where: SparepartWhereUniqueInput
    create: XOR<SparepartCreateWithoutLogsInput, SparepartUncheckedCreateWithoutLogsInput>
  }

  export type SparepartUpsertWithoutLogsInput = {
    update: XOR<SparepartUpdateWithoutLogsInput, SparepartUncheckedUpdateWithoutLogsInput>
    create: XOR<SparepartCreateWithoutLogsInput, SparepartUncheckedCreateWithoutLogsInput>
    where?: SparepartWhereInput
  }

  export type SparepartUpdateToOneWithWhereWithoutLogsInput = {
    where?: SparepartWhereInput
    data: XOR<SparepartUpdateWithoutLogsInput, SparepartUncheckedUpdateWithoutLogsInput>
  }

  export type SparepartUpdateWithoutLogsInput = {
    namaKomponen?: StringFieldUpdateOperationsInput | string
    kategori?: StringFieldUpdateOperationsInput | string
    stokGudang?: IntFieldUpdateOperationsInput | number
    satuan?: StringFieldUpdateOperationsInput | string
    minStok?: IntFieldUpdateOperationsInput | number
    lokasi?: NullableStringFieldUpdateOperationsInput | string | null
    requestMaterials?: SectionRequestMaterialUpdateManyWithoutSparepartNestedInput
  }

  export type SparepartUncheckedUpdateWithoutLogsInput = {
    namaKomponen?: StringFieldUpdateOperationsInput | string
    kategori?: StringFieldUpdateOperationsInput | string
    stokGudang?: IntFieldUpdateOperationsInput | number
    satuan?: StringFieldUpdateOperationsInput | string
    minStok?: IntFieldUpdateOperationsInput | number
    lokasi?: NullableStringFieldUpdateOperationsInput | string | null
    requestMaterials?: SectionRequestMaterialUncheckedUpdateManyWithoutSparepartNestedInput
  }

  export type TicketCreateManyDaishaInput = {
    idTiket: string
    namaPelapor: string
    status?: string
    waktuMasuk?: Date | string
    waktuSelesai?: Date | string | null
    catatan?: string | null
  }

  export type TicketUpdateWithoutDaishaInput = {
    idTiket?: StringFieldUpdateOperationsInput | string
    namaPelapor?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    waktuMasuk?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuSelesai?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    details?: TicketDetailUpdateManyWithoutTicketNestedInput
  }

  export type TicketUncheckedUpdateWithoutDaishaInput = {
    idTiket?: StringFieldUpdateOperationsInput | string
    namaPelapor?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    waktuMasuk?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuSelesai?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
    details?: TicketDetailUncheckedUpdateManyWithoutTicketNestedInput
  }

  export type TicketUncheckedUpdateManyWithoutDaishaInput = {
    idTiket?: StringFieldUpdateOperationsInput | string
    namaPelapor?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    waktuMasuk?: DateTimeFieldUpdateOperationsInput | Date | string
    waktuSelesai?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    catatan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TicketDetailCreateManyTicketInput = {
    idDetail?: number
    komponen: string
    gejala: string
    tindakan: string
    qty: number
  }

  export type TicketDetailUpdateWithoutTicketInput = {
    komponen?: StringFieldUpdateOperationsInput | string
    gejala?: StringFieldUpdateOperationsInput | string
    tindakan?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
  }

  export type TicketDetailUncheckedUpdateWithoutTicketInput = {
    idDetail?: IntFieldUpdateOperationsInput | number
    komponen?: StringFieldUpdateOperationsInput | string
    gejala?: StringFieldUpdateOperationsInput | string
    tindakan?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
  }

  export type TicketDetailUncheckedUpdateManyWithoutTicketInput = {
    idDetail?: IntFieldUpdateOperationsInput | number
    komponen?: StringFieldUpdateOperationsInput | string
    gejala?: StringFieldUpdateOperationsInput | string
    tindakan?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
  }

  export type DaishaComponentCreateManyDaishaTypeInput = {
    id?: number
    name: string
  }

  export type DaishaComponentUpdateWithoutDaishaTypeInput = {
    name?: StringFieldUpdateOperationsInput | string
    symptoms?: DaishaSymptomUpdateManyWithoutComponentNestedInput
  }

  export type DaishaComponentUncheckedUpdateWithoutDaishaTypeInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    symptoms?: DaishaSymptomUncheckedUpdateManyWithoutComponentNestedInput
  }

  export type DaishaComponentUncheckedUpdateManyWithoutDaishaTypeInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
  }

  export type DaishaSymptomCreateManyComponentInput = {
    id?: number
    description: string
  }

  export type DaishaSymptomUpdateWithoutComponentInput = {
    description?: StringFieldUpdateOperationsInput | string
  }

  export type DaishaSymptomUncheckedUpdateWithoutComponentInput = {
    id?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
  }

  export type DaishaSymptomUncheckedUpdateManyWithoutComponentInput = {
    id?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
  }

  export type SectionRequestMaterialCreateManySectionRequestInput = {
    id?: number
    namaKomponen: string
    qty?: number
    keterangan?: string | null
  }

  export type SectionRequestMaterialUpdateWithoutSectionRequestInput = {
    qty?: IntFieldUpdateOperationsInput | number
    keterangan?: NullableStringFieldUpdateOperationsInput | string | null
    sparepart?: SparepartUpdateOneRequiredWithoutRequestMaterialsNestedInput
  }

  export type SectionRequestMaterialUncheckedUpdateWithoutSectionRequestInput = {
    id?: IntFieldUpdateOperationsInput | number
    namaKomponen?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
    keterangan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SectionRequestMaterialUncheckedUpdateManyWithoutSectionRequestInput = {
    id?: IntFieldUpdateOperationsInput | number
    namaKomponen?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
    keterangan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SparepartLogCreateManySparepartInput = {
    id?: number
    tipe: string
    qty: number
    referensi?: string | null
    keterangan?: string | null
    tanggal?: Date | string
  }

  export type SectionRequestMaterialCreateManySparepartInput = {
    id?: number
    sectionRequestId: number
    qty?: number
    keterangan?: string | null
  }

  export type SparepartLogUpdateWithoutSparepartInput = {
    tipe?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
    referensi?: NullableStringFieldUpdateOperationsInput | string | null
    keterangan?: NullableStringFieldUpdateOperationsInput | string | null
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SparepartLogUncheckedUpdateWithoutSparepartInput = {
    id?: IntFieldUpdateOperationsInput | number
    tipe?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
    referensi?: NullableStringFieldUpdateOperationsInput | string | null
    keterangan?: NullableStringFieldUpdateOperationsInput | string | null
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SparepartLogUncheckedUpdateManyWithoutSparepartInput = {
    id?: IntFieldUpdateOperationsInput | number
    tipe?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
    referensi?: NullableStringFieldUpdateOperationsInput | string | null
    keterangan?: NullableStringFieldUpdateOperationsInput | string | null
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SectionRequestMaterialUpdateWithoutSparepartInput = {
    qty?: IntFieldUpdateOperationsInput | number
    keterangan?: NullableStringFieldUpdateOperationsInput | string | null
    sectionRequest?: SectionRequestUpdateOneRequiredWithoutMaterialsNestedInput
  }

  export type SectionRequestMaterialUncheckedUpdateWithoutSparepartInput = {
    id?: IntFieldUpdateOperationsInput | number
    sectionRequestId?: IntFieldUpdateOperationsInput | number
    qty?: IntFieldUpdateOperationsInput | number
    keterangan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SectionRequestMaterialUncheckedUpdateManyWithoutSparepartInput = {
    id?: IntFieldUpdateOperationsInput | number
    sectionRequestId?: IntFieldUpdateOperationsInput | number
    qty?: IntFieldUpdateOperationsInput | number
    keterangan?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}