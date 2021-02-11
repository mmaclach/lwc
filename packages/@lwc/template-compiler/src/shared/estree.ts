import { BaseNode, Identifier, MemberExpression, Expression } from 'estree';

export function createIdentifier(
    name: string,
    config?: Partial<Omit<Identifier, 'type' | 'name'>>
): Identifier {
    return {
        type: 'Identifier',
        name,
        ...config,
    };
}

export function isIdentifier(node: BaseNode): node is Identifier {
    return node.type === 'Identifier';
}

export function createMemberExpression(
    object: Expression,
    property: Expression,
    config?: Partial<Omit<MemberExpression, 'type' | 'object' | 'property'>>
): MemberExpression {
    return {
        type: 'MemberExpression',
        object,
        property,
        computed: false,
        optional: false,
        ...config,
    };
}

export function isMemberExpression(node: BaseNode): node is MemberExpression {
    return node.type === 'MemberExpression';
}
