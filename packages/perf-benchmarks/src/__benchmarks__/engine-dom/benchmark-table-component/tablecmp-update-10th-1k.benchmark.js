/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createElement } from 'lwc';

import Table from 'benchmark/tableComponent';
import Store from 'benchmark/store';
import { insertComponent, destroyComponent } from 'benchmark/utils';

benchmark(`benchmark-table-component/update-10th/1k`, () => {
    let tableElement;
    let store;

    before(async () => {
        tableElement = createElement('benchmark-table-component', { is: Table });
        await insertComponent(tableElement);

        store = new Store();
        store.run();
        // eslint-disable-next-line require-atomic-updates
        tableElement.rows = store.data;
    });

    run(() => {
        store.update();
        tableElement.rows = store.data;
    });

    after(() => {
        destroyComponent(tableElement);
    });
});
