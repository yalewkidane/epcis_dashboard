import neo4j from 'neo4j-driver';

import envJS from '../config/env';



const uri = 'bolt://'+envJS.NEO4J_SERVER+':'+envJS.NEO4J_PORT;
const user = envJS.NEO4J_USER;
const password = envJS.NEO4J_PASSWORD;

console.log(uri)
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

export default driver;

