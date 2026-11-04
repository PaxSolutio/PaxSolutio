import test from 'node:test';
import assert from 'node:assert/strict';
import {commercialPrice,commercialCopy} from '../../src/lib/commercial-pricing.ts';
for(const amount of [750,16999,3499,1,891.25])test(`catalogue EUR ${amount} unchanged TTC`,()=>{
 const price=commercialPrice({price_from:amount,currency:'EUR',price_label:'HT'});
 assert.equal(price.amount,amount);assert.equal(price.tax,'TTC');assert.match(price.text,/TTC$/);
});
for(const amount of [null,undefined,NaN,Infinity,-1,0])test('missing/unreliable price '+amount,()=>assert.equal(commercialPrice({price_from:amount,currency:'EUR'}).text,'Sur devis'));
test('no silent foreign currency conversion',()=>assert.equal(commercialPrice({price_from:750,currency:'USD'}).amount,null));
test('new owner decision does not require missing legacy tax/terms fields',()=>assert.equal(commercialPrice({price_from:750,currency:'EUR'}).amount,750));
test('old narrative price cannot override current catalogue',()=>assert.equal(commercialCopy('À partir de 1 € ; 3 places',true),'Tarif du catalogue ci-dessus ; 3 places'));

import {isReadOnlyPreview,previewRequestAllowed} from '../../src/lib/preview-safety.ts';
test('Preview default remains closed for administrative reads',()=>{for(const p of ['/admin','/admin/offres','/api/admin/offers'])assert.equal(previewRequestAllowed('GET',p),false)});
test('Explicit read-only recipe passes administrative GET to unchanged DAL',()=>{for(const p of ['/admin/login','/admin/offres','/api/admin/offers'])assert.equal(previewRequestAllowed('GET',p,true),true)});
test('Every Preview mutation is refused even during authorized admin recipe',()=>{for(const m of ['POST','PATCH','PUT','DELETE'])for(const p of ['/','/api/leads','/api/admin/offers','/api/payments/paypal/create-order'])assert.equal(previewRequestAllowed(m,p,true),false)});
test('Financial and non-administrative APIs remain closed',()=>{for(const p of ['/api/payments/paypal/config','/api/cron/intelligence','/api/test.png'])assert.equal(previewRequestAllowed('GET',p,true),false)});
test('Production and local default cannot activate Preview restrictions',()=>{assert.equal(isReadOnlyPreview('production'),false);assert.equal(isReadOnlyPreview('development'),false);assert.equal(isReadOnlyPreview('preview'),true)});
