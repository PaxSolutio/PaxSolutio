import type {Access, Audit, Project} from "./model";
import {fixture, TrackingError} from "./model";
export interface Repository {
  list(actor:string):Promise<Project[]>; get(id:string,actor:string):Promise<Project|null>;
  save(p:Project,expected:number,actor:string,action:string):Promise<void>;
  history(id:string,actor:string):Promise<Audit[]>;
  rotate(a:Access,actor:string):Promise<void>; revoke(id:string,actor:string):Promise<void>;
  access(hash:string,reference:string|null):Promise<Access|null>; active(id:string):Promise<{access:Access;project:Project}|null>;
  consume(keys:string[],now:number):Promise<boolean>;
}
export class FixtureRepository implements Repository {
  async list(){return [fixture()];}async get(id:string){return id===fixture().id?fixture():null;}
  async history(){return [];}async save():Promise<void>{throw new TrackingError(423,"Démonstration en lecture seule.");}
  async rotate():Promise<void>{throw new TrackingError(423,"Démonstration en lecture seule.");}async revoke():Promise<void>{throw new TrackingError(423,"Démonstration en lecture seule.");}
  async access(){return null;}async active(){return null;}async consume(){return false;}
}
