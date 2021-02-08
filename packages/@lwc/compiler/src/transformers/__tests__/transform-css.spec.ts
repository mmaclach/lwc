/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { TransformOptions } from '../../options';
import { transform } from '../transformer';

const TRANSFORMATION_OPTIONS: TransformOptions = {
    namespace: 'x',
    name: 'foo',
};

it('should throw when processing an invalid CSS file', async () => {
    await expect(transform(`<`, 'foo.css', TRANSFORMATION_OPTIONS)).rejects.toMatchObject({
        filename: 'foo.css',
        message: expect.stringContaining('foo.css:1:1: Unknown word'),
    });
});

it('should apply transformation for stylesheet file', async () => {
    const actual = `
        :host {
            color: red;
        }

        div {
            background-color: red;
        }
    `;
    const { code } = await transform(actual, 'foo.css', TRANSFORMATION_OPTIONS);

    expect(code).toContain('function stylesheet');
});

describe('custom properties', () => {
    it('should allow custom properties if allowDefinition is true', async () => {
        await expect(
            transform(`:host { --bg-color: red; }`, 'foo.css', {
                ...TRANSFORMATION_OPTIONS,
                stylesheetConfig: {
                    customProperties: { allowDefinition: true },
                },
            })
        ).resolves.toMatchObject({
            code: expect.any(String),
        });
    });

    it('should throw if custom properties are defined and allowDefinition is false', async () => {
        await expect(
            transform(`:host { --bg-color: red; }`, 'foo.css', {
                ...TRANSFORMATION_OPTIONS,
                stylesheetConfig: {
                    customProperties: { allowDefinition: false },
                },
            })
        ).rejects.toMatchObject({
            filename: 'foo.css',
            message: expect.stringContaining('Invalid definition of custom property "--bg-color"'),
        });
    });

    it('should not transform var functions if custom properties a resolved natively', async () => {
        const actual = `div { color: var(--bg-color); }`;
        const { code } = await transform(actual, 'foo.css', {
            ...TRANSFORMATION_OPTIONS,
            stylesheetConfig: {
                customProperties: { resolution: { type: 'native' } },
            },
        });

        expect(code).toContain('var(--bg-color)');
    });

    it('should transform var functions if custom properties a resolved via a module', async () => {
        const actual = `div { color: var(--bg-color); }`;
        const { code } = await transform(actual, 'foo.css', {
            ...TRANSFORMATION_OPTIONS,
            stylesheetConfig: {
                customProperties: {
                    resolution: { type: 'module', name: '@customProperties' },
                },
            },
        });

        expect(code).not.toContain('var(--bg-color)');
        expect(code).toContain('import varResolver from "@customProperties";');
    });

    it('should transform var functions properly when minification is enabled', async () => {
        const actual = `div { color: var(--bg-color); }`;
        const { code } = await transform(actual, 'foo.css', {
            ...TRANSFORMATION_OPTIONS,
            stylesheetConfig: {
                customProperties: {
                    resolution: { type: 'module', name: '@customProperties' },
                },
            },
            outputConfig: {
                minify: true,
            },
        });

        expect(code).not.toContain('var(--bg-color)');
        expect(code).toContain('import varResolver from "@customProperties";');
    });
});

describe('regressions', () => {
    it('should escape grave accents', async () => {
        const actual = `/* Comment with grave accents \`#\` */`;
        const { code } = await transform(actual, 'foo.css', TRANSFORMATION_OPTIONS);

        expect(code).not.toContain('/*');
    });

    it('should escape backslash', async () => {
        const actual = `.foo { content: "x\\x"; }`;
        const { code } = await transform(actual, 'foo.css', TRANSFORMATION_OPTIONS);

        expect(code).toContain('\\"x\\\\x\\"');
    });

    it('#689 - should not transform z-index in production', async () => {
        const actual = 'h1 { z-index: 100; } h2 { z-index: 500; }';

        const { code } = await transform(actual, 'foo.css', {
            ...TRANSFORMATION_OPTIONS,
            outputConfig: {
                minify: true,
            },
        });

        expect(code).toContain('z-index:100');
        expect(code).toContain('z-index:500');
    });
});
