import * as target from '../api.js';
import assert from 'power-assert';
import { Element } from "../html-element.js";

describe('api.js', () => {

    describe('#c()', () => {
        it('should convert className to a classMap property', () => {
            class Foo extends Element {}
            const vnode = target.c('x-foo', Foo, { className: 'foo' });
            assert.deepEqual(vnode.data.class, { foo: true });
        });

        it('should split classNames on white spaces', () => {
            class Foo extends Element {}
            const vnode = target.c('x-foo', Foo, { className: 'foo bar   baz' });
            assert.deepEqual(vnode.data.class, { foo: true, bar: true, baz: true });
        });

        it('should throw if the vnode contains both a computed className and a classMap', () => {
            class Foo extends Element {}
            assert.throws(() => {
                target.c('x-foo', Foo, {
                    className: 'foo',
                    classMap: { foo: true }
                });
            }, /className/);
        });
    });

    describe('#h()', () => {
        it('should convert className to a classMap property', () => {
            const vnode = target.h('p', { className: 'foo' }, []);
            assert.deepEqual(vnode.data.class, { foo: true });
        });

        it('should split classNames on white spaces', () => {
            const vnode = target.h('p', { className: 'foo bar   baz' }, []);
            assert.deepEqual(vnode.data.class, { foo: true, bar: true, baz: true });
        });

        it('should throw if the vnode contains both a computed className and a classMap', () => {
            assert.throws(() => {
                target.h('p', {
                    className: 'foo',
                    classMap: { foo: true }
                }, []);
            }, /className/);
        });
    });

    describe('#n()', () => {
        // TBD
    });

    describe('#i()', () => {
        it('should support various types', () => {
            assert.deepEqual(target.i([], () => null), [], 'empty array');
            assert.deepEqual(target.i(undefined, () => null), [], 'undefined');
            assert.deepEqual(target.i(null, () => null), [], 'null');
        });
        it('should support numeric keys', () => {
            assert.deepEqual(target.i([{key: 0}], () => null), [null], 'numeric key');
            assert.deepEqual(target.i([{key: 1}], () => null), [null], 'another numeric key');
        });
        it('should provide item and index', () => {
            const o = {x: 1};
            assert.deepEqual(target.i([o], (item, index) => {
                return { index, item };
            }), [{ index: 0, item: o }]);
        });
    });

    describe('#f()', () => {
        // TBD
    });

});
