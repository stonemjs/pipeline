[**Pipeline Documentation v0.0.41**](../../README.md) • **Docs**

***

[Pipeline Documentation v0.0.41](../../modules.md) / [definitions](../README.md) / Container

# Interface: Container

Represents a container that resolves dependencies.

## Template

The type of the resolved object.

This container is responsible for dependency injection, allowing the retrieval of instances by key or constructor.
It provides methods to resolve and check the existence of dependencies.

## Properties

### has()

> **has**: (`key`) => `boolean`

Checks if a dependency with the specified key or constructor function exists in the container.

#### Parameters

• **key**: `string` \| `Function`

The key or constructor used to identify the dependency.

#### Returns

`boolean`

A boolean indicating whether the dependency exists.

#### Defined in

[definitions.ts:93](https://github.com/stonemjs/pipeline/blob/cd2c1fe6f2982b63b3356203b0c87edf8640b155/src/definitions.ts#L93)

***

### resolve()

> **resolve**: \<`T`\>(`key`) => `T`

Resolves a dependency by its key or constructor function.

#### Type Parameters

• **T**

The type of the resolved instance.

#### Parameters

• **key**: `string` \| `Function`

The key or constructor used to resolve the dependency.

#### Returns

`T`

The resolved object instance of type `T`.

#### Defined in

[definitions.ts:85](https://github.com/stonemjs/pipeline/blob/cd2c1fe6f2982b63b3356203b0c87edf8640b155/src/definitions.ts#L85)
