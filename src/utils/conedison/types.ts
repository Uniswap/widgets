export type Address = string
export type AddressTo<T> = Record<Address, T>
export type Mutable<T> = { -readonly [P in keyof T]: T[P] }
export type Nullable<T> = T | null
export type Nullish<T> = Nullable<T> | undefined
export type Primitive = number | string | boolean | bigint | symbol | null | undefined
