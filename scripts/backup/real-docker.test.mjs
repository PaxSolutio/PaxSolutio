import test from 'node:test';
import assert from 'node:assert/strict';
import {assertNoPublishedPorts} from './real-docker.mjs';
test('EXPOSE without any publication is accepted before and after start',()=>{
 assertNoPublishedPorts({},{});
 assertNoPublishedPorts({},{'5432/tcp':null});
});
test('requested host publication is refused regardless of address',()=>{
 for(const HostIp of ['127.0.0.1','0.0.0.0','::'])
  assert.throws(()=>assertNoPublishedPorts({'5432/tcp':[{HostIp,HostPort:'55432'}]},{}));
});
test('actual publication or ambiguous mapping fails closed',()=>{
 for(const value of [[],[{HostIp:'127.0.0.1',HostPort:'55432'}],{},''])
  assert.throws(()=>assertNoPublishedPorts({},{'5432/tcp':value}));
});
