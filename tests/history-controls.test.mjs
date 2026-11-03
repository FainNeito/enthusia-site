import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

for (const kind of ['changelog', 'timeline']) {
  test(`${kind} order controls default to newest and retain active filters`, async () => {
    let component;
    const orders = [];
    class Controller { setState(patch) { this.state = { ...this.state, ...patch }; } }
    const window = {
      DesignController: Controller,
      EnthusiaDesign: { mount(Component) { component = new Component(); } },
      EnthusiaHistoryOrder(order) { orders.push(order); },
      EnthusiaDesignModel: kind === 'timeline' ? [['ch2', 'update']] : [['2026', ['world'], 'update']]
    };
    const source = await readFile(new URL(`../public/assets/exact-controls/${kind}.js`, import.meta.url), 'utf8');
    vm.runInNewContext(source, { window });
    let values = component.renderVals();
    assert.equal(values.oNew, 'true');
    assert.equal(values.oOld, 'false');
    if (kind === 'timeline') values.pick_update();
    else values.pa_world();
    values = component.renderVals();
    values.goOld();
    values = component.renderVals();
    assert.equal(values.oOld, 'true');
    assert.equal(kind === 'timeline' ? values.f_update : values.a_world, kind === 'timeline' ? 'false' : 'true');
    values.goNew();
    assert.deepEqual(orders, ['oldest', 'newest']);
    assert.equal(component.renderVals().oNew, 'true');
  });
}
