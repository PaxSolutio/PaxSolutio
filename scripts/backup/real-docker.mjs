// Dedicated one-use containers. No host mounts, Docker socket, published ports or persistent logs.
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs';import {createHash} from 'node:crypto';
export const IMAGE='public.ecr.aws/supabase/postgres@sha256:c141fd17ac6a76c4323e90b3aee8ff1a23d2e89e547c2b963cfadc309c079cc2';
export const PURPOSE='paxsolutio-real-backup-20261105';
export function assertNoPublishedPorts(hostBindings,actualPorts){
 assert.equal(Object.keys(hostBindings??{}).length,0);
 // An image EXPOSE appears after start as "5432/tcp": null. This is not
 // a host binding. Every non-null publication (even an empty list) fails.
 assert(Object.values(actualPorts??{}).every(bindings=>bindings===null));
}
export function docker(args,input,encoding='utf8',onFailure) {
 try{return execFileSync('docker',args,{input,encoding,timeout:180000,maxBuffer:48*1024*1024,stdio:['pipe','pipe','pipe']});}
 catch(e){try{onFailure?.(e.stderr);}finally{e.stdout?.fill?.(0);e.stderr?.fill?.(0);}throw Error('ISOLATED_DOCKER_OPERATION_FAILED');}
}
export function inspect(id,run,kind){
 assert(/^[a-f0-9]{64}$/.test(id));assert(/^[a-f0-9]{16}$/.test(run));assert(['export','restore'].includes(kind));
 const x=JSON.parse(docker(['inspect',id]))[0];
 assert.equal(x.Config.Labels['paxsolutio.purpose'],PURPOSE);assert.equal(x.Config.Labels['paxsolutio.run'],run);assert.equal(x.Config.Labels['paxsolutio.kind'],kind);
 assert.equal(x.Config.Image,IMAGE);assert.equal(x.Image,IMAGE.split('@')[1]);assert.equal(x.HostConfig.NetworkMode,kind==='restore'?'none':'bridge');
 assertNoPublishedPorts(x.HostConfig.PortBindings,x.NetworkSettings.Ports);
 assert.equal(x.HostConfig.RestartPolicy.Name,'no');assert.equal(x.HostConfig.LogConfig.Type,'none');assert.equal(x.HostConfig.Privileged,false);assert.equal(x.HostConfig.ReadonlyRootfs,true);
 assert.equal(x.Config.User,'postgres');assert(!x.HostConfig.Binds?.length);assert(x.Mounts.every(m=>m.Type==='tmpfs'));
 assert(x.HostConfig.CapDrop.includes('ALL'));assert(x.HostConfig.SecurityOpt.includes('no-new-privileges'));
 return x;
}
export async function create(run,kind){
 assert(/^[a-f0-9]{16}$/.test(run));assert(['export','restore'].includes(kind));
 const command=kind==='export'?'exec sleep 1800':"initdb -D /tmp/checkdb -A trust --no-locale >/tmp/init.log 2>&1 && exec postgres -D /tmp/checkdb -c listen_addresses='' -c unix_socket_directories=/tmp -c logging_collector=on -c log_directory=/tmp -c log_filename=private-postgres.log -c log_min_error_statement=panic -c log_error_verbosity=terse -c shared_buffers=32MB";
 const id=docker(['create','--pull','never','--name',`pax-backup-${kind}-${run}`,'--label',`paxsolutio.purpose=${PURPOSE}`,'--label',`paxsolutio.run=${run}`,'--label',`paxsolutio.kind=${kind}`,'--network',kind==='restore'?'none':'bridge','--read-only','--user','postgres','--cap-drop','ALL','--security-opt','no-new-privileges','--log-driver','none','--memory','768m','--memory-swap','768m','--cpus','1','--pids-limit','128','--tmpfs','/tmp:rw,mode=1777,size=536870912','--tmpfs','/var/lib/postgresql/data:rw,mode=700,size=1048576','--entrypoint','/bin/bash',IMAGE,'-c',command]).trim();
 try{assert.equal(inspect(id,run,kind).State.Status,'created');docker(['start',id]);
  if(kind==='restore'){for(let i=0;i<80;i++){try{docker(['exec',id,'pg_isready','-h','/tmp','-U','postgres']);return id;}catch{await new Promise(r=>setTimeout(r,250));}}throw Error('RESTORE_DATABASE_NOT_READY');}
  return id;
 }catch(e){remove(id,run,kind);throw e;}
}
export function remove(id,run,kind){inspect(id,run,kind);docker(['rm','-f','-v',id]);}
export function localSql(id,run,query){inspect(id,run,'restore');return docker(['exec','-i',id,'psql','-X','-h','/tmp','-U','postgres','-d','restore_check','-v','ON_ERROR_STOP=1','-At','-q'],query).trim();}
export function remoteDump(id,run,s,snapshot){
 inspect(id,run,'export');assert(/^[0-9A-F-]+$/i.test(snapshot));
 const ca=fs.readFileSync(new URL('./supabase-prod-ca-2021.crt',import.meta.url));assert.equal(createHash('sha256').update(ca).digest('hex'),'700723581420dd1ac98fd7e9ac529f0ef210eadcaf87fc868a3ad7d114c2f3b7');
 docker(['exec','-i',id,'/bin/bash','-c','cat /etc/ssl/certs/ca-certificates.crt > /tmp/provider-ca.crt && cat >> /tmp/provider-ca.crt'],ca);
 // Password travels only over stdin; neither command arguments nor Docker Config.Env contain it.
 const args=['exec','-i',id,'/bin/bash','-c','IFS= read -r PGPASSWORD; export PGPASSWORD; export PGSSLMODE=verify-full PGSSLROOTCERT=/tmp/provider-ca.crt; export PGOPTIONS="-c default_transaction_read_only=on -c statement_timeout=120000 -c lock_timeout=5000"; exec pg_dump "$@"','pg_dump','-h',s.host,'-p','5432','-U',s.user,'-d','postgres','--no-password','--format=custom','--snapshot='+snapshot,'--lock-wait-timeout=5s'];
 if(s.temporaryRole){assert.equal(s.expectedRole,'cli_login_supabase_read_only_user');args.push('--role=supabase_read_only_user');}
 const input=Buffer.from(s.password+'\n');try{const dump=docker(args,input,null);if(dump.subarray(0,5).toString()!=='PGDMP'){dump.fill(0);throw Error('INVALID_CUSTOM_DUMP');}return dump;}finally{input.fill(0);}
}
