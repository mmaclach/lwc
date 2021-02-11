/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    TemplateIdentifier,
    TemplateExpression,
    IRNode,
    IRText,
    IRElement,
    HTMLElement,
    HTMLText,
} from './types';

export interface NodeVisitor<T extends IRNode> {
    enter?: (element: T) => void;
    exit?: (element: T) => void;
}

export interface Visitor {
    text?: NodeVisitor<IRText>;
    element?: NodeVisitor<IRElement>;
}

export function createElement(tag: string, original: HTMLElement): IRElement {
    return {
        type: 'element',
        __original: original,

        tag,
        attrsList: [],
        children: [],
    };
}

export function createText(original: HTMLText, value: string | TemplateExpression): IRText {
    return {
        type: 'text',
        __original: original,
        value,
    };
}

export function isElement(node: IRNode): node is IRElement {
    return node.type === 'element';
}

export function isCustomElement(node: IRNode): boolean {
    return !!(node as IRElement).component;
}

export function traverse(node: IRNode, visitor: Visitor): void {
    const { enter, exit }: NodeVisitor<any> = visitor[node.type] || {};

    if (enter) {
        enter(node);
    }

    if (isElement(node)) {
        for (const child of node.children) {
            traverse(child, visitor);
        }
    }

    if (exit) {
        exit(node);
    }
}

export function isComponentProp(identifier: TemplateIdentifier, root: IRNode): boolean {
    const { name } = identifier;
    let current: IRNode | undefined = root;

    // Walking up the AST and checking for each node to find if the identifer name is identical to
    //  an iteration variable.
    while (current !== undefined) {
        if (isElement(current)) {
            const { forEach, forOf } = current;

            if (
                forEach?.item.name === name ||
                forEach?.index?.name === name ||
                forOf?.iterator.name === name
            ) {
                return false;
            }
        }

        current = current.parent;
    }

    // The identifier is bound to a component property if no match is found after reaching to AST
    // root.
    return true;
}
