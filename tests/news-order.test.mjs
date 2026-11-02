import test from 'node:test';
import assert from 'node:assert/strict';
import { orderNewsPosts } from '../public/assets/news-order.js';
const rows=[
 {slug:'old',date:'2024-01-01T00:00:00Z',pinned:true},
 {slug:'unknown',date:null},
 {slug:'new',date:'2026-03-01T00:00:00Z'},
 {slug:'same-a',date:'2025-01-01T00:00:00Z'},
 {slug:'same-b',date:'2025-01-01T00:00:00Z'},
 {slug:'invalid',date:'not a date'}
];
test('news defaults to newest by publication date, with undated posts last and stable ties',()=>{
 assert.deepEqual(orderNewsPosts(rows).map(x=>x.slug),['new','same-a','same-b','old','unknown','invalid']);
 assert.deepEqual(rows.map(x=>x.slug),['old','unknown','new','same-a','same-b','invalid']);
});
test('oldest order remains chronological, does not prioritize pinned posts, and retains undated posts last',()=>{
 assert.deepEqual(orderNewsPosts(rows,'oldest').map(x=>x.slug),['old','same-a','same-b','new','unknown','invalid']);
});
