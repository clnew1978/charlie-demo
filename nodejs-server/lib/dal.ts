import Nano from 'nano';
import PouchDB from 'pouchdb';
import plugin from 'pouchdb-find';
PouchDB.plugin(plugin);
import { GraphQLError } from 'graphql';
import * as lodash from 'lodash';
import { v4 } from 'uuid';

import logger from './logger';
import { config } from '../environment';
import { Reservation, ReservationCreateInput, ReservationStatus, ReservationUpdateInput, UserType } from './common';

interface DemoDB {
    init(): Promise<void>;
    destroy(): Promise<void>;
    addReservation(reservation: ReservationCreateInput): Promise<Reservation>;
    listReservations(selector: any): Promise<Reservation[]>;
    updateReservation(input: ReservationUpdateInput): Promise<Reservation>;
}

class CouchDemoDB implements DemoDB {
    address: string;
    username: string;
    password: string;
    dbName: string;
    couchServer?: Nano.ServerScope;
    couchDBTable?: Nano.DocumentScope<any>;
    authInterval?: NodeJS.Timeout;

    constructor(_address: string, _username: string, _password: string, _dbName: string) {
        this.address = _address;
        this.username = _username;
        this.password = _password;
        this.dbName = _dbName;
    }

    async init() {
        this.couchServer = Nano({ url: this.address, requestDefaults: { timeout: 5000 } });
        await this.couchServer.auth(this.username, this.password);
        await this.couchServer.info();
        try {
            await this.couchServer.db.get(this.dbName);
        } catch {
            await this.couchServer.db.create(this.dbName);
        } finally {
            this.couchDBTable = this.couchServer.db.use(this.dbName);
        }
        const that = this;
        this.authInterval = setInterval(async () => {
            if (that.couchServer) {
                that.couchServer.auth(this.username, this.password)
            }
        }, 60 * 1000);
    }

    async destroy() {
        if (this.authInterval) {
            clearInterval(this.authInterval);
            delete this.authInterval;
        }
        delete this.couchDBTable;
        delete this.couchServer;
    }

    async addReservation(input: ReservationCreateInput): Promise<Reservation> {
        if (!this.couchServer || !this.couchDBTable) {
            logger.error('CouchDemoDB.addReservation: Database was initialized correctly.');
            throw new GraphQLError(
                'Database was initialized correctly.',
                { extensions: { code: 'Internal Server Error', http: { status: 500 } } }
            );
        }
        logger.debug('CouchDemoDB.addReservation: input(%j).', input);
        const document = JSON.parse(JSON.stringify(lodash.assign(
            { status: ReservationStatus.Created, arrivalTime: input.arrivalTime.getTime() },
            lodash.pick(input, ['guestName', 'guestPhone', 'tableSize'])
        )));
        const response = await this.couchDBTable.insert(document);
        logger.debug('CouchDemoDB.addReservation: done with result(%j).', response);
        if (!response.ok) {
            logger.error('CouchDemoDB.addReservation: insert failed.');
            throw new GraphQLError(
                'insert failed',
                { extensions: { code: 'Internal Server Error', http: { status: 500 } } }
            );
        }
        return {
            id: response.id,
            arrivalTime: new Date(document['arrivalTime']),
            ...lodash.pick(document, ['guestName', 'guestPhone', 'status', 'tableSize'])
        };
    }

    async listReservations(selector: any): Promise<Reservation[]> {
        if (!this.couchServer || !this.couchDBTable) {
            logger.error('CouchDemoDB.listReservations: Database was initialized correctly.');
            throw new GraphQLError(
                'Database was initialized correctly.',
                { extensions: { code: 'Internal Server Error', http: { status: 500 } } }
            );
        }
        logger.debug('CouchDemoDB.listReservations: selector(%j).', selector);
        const response = await this.couchDBTable.find({ selector });
        logger.debug('CouchDemoDB.listReservations: done with result(%j).', response)
        const retval: Reservation[] = [];
        response.docs.forEach(
            (doc: any) => {
                retval.push({
                    id: doc['_id'] as string,
                    arrivalTime: new Date(doc['arrivalTime'] as number),
                    ...lodash.pick(doc, ['guestName', 'guestPhone', 'status', 'tableSize'])
                })
            }
        );
        return retval;
    }

    async updateReservation(input: ReservationUpdateInput): Promise<Reservation> {
        if (!this.couchServer || !this.couchDBTable) {
            logger.error('CouchDemoDB.updateReservation: Database was initialized correctly.');
            throw new GraphQLError(
                'Database was initialized correctly.',
                { extensions: { code: 'Internal Server Error', http: { status: 500 } } }
            );
        }
        logger.debug('CouchDemoDB.updateReservation: input(%j).', input);
        const document = await this.couchDBTable.get(input.id);
        logger.debug('CouchDemoDB.updateReservation: current document(%j).', document);
        lodash.assign(
            document,
            { arrivalTime: input.arrivalTime.getTime(), ...lodash.omit(input, ['id', 'arrivalTime']) }
        );
        const response = await this.couchDBTable.insert(document);
        logger.debug('CouchDemoDB.updateReservation: done with result(%j).', response);
        if (!response.ok) {
            logger.error('CouchDemoDB.updateReservation: insert failed.');
            throw new GraphQLError(
                'insert failed',
                { extensions: { code: 'Internal Server Error', http: { status: 500 } } }
            );
        }
        return {
            id: response.id,
            arrivalTime: new Date(document['arrivalTime']),
            ...lodash.pick(document, ['guestName', 'guestPhone', 'status', 'tableSize'])
        };
    }
}

class PouchDemoDB implements DemoDB {
    dbName: string;
    pouchDB?: PouchDB.Database<{}>;

    constructor(_dbName: string) {
        this.dbName = _dbName;
    }

    async init() {
        this.pouchDB = new PouchDB(this.dbName);
        this.pouchDB.info();
    }

    async destroy() {
        if (this.pouchDB) {
            await this.pouchDB.close();
            this.pouchDB = undefined;
        }
    }

    async addReservation(reservation: ReservationCreateInput): Promise<Reservation> {
        if (!this.pouchDB) {
            logger.error('PouchDemoDB.addReservation: Database was initialized correctly.');
            throw new GraphQLError(
                'Database was initialized correctly.',
                { extensions: { code: 'Internal Server Error', http: { status: 500 } } }
            );
        }
        logger.debug('PouchDemoDB.addReservation: reservation(%j).', reservation);
        const document = JSON.parse(JSON.stringify(lodash.assign(
            { status: ReservationStatus.Created, _id: v4(), arrivalTime: reservation.arrivalTime.getTime() },
            lodash.pick(reservation, ['guestName', 'guestPhone', 'tableSize'])
        )));
        const response = await this.pouchDB.put(document);
        logger.debug('PouchDemoDB.addReservation: done with result(%j).', response);
        if (!response.ok) {
            logger.error('PouchDemoDB.addReservation: put failed.');
            throw new GraphQLError(
                'put failed',
                { extensions: { code: 'Internal Server Error', http: { status: 500 } } }
            );
        }
        return {
            id: response.id,
            arrivalTime: new Date(document['arrivalTime']),
            ...lodash.pick(document, ['guestName', 'guestPhone', 'tableSize', 'status'])
        };
    }

    async listReservations(selector: any): Promise<Reservation[]> {
        if (!this.pouchDB) {
            logger.error('PouchDemoDB.listReservations: Database was initialized correctly.');
            throw new GraphQLError(
                'Database was initialized correctly.',
                { extensions: { code: 'Internal Server Error', http: { status: 500 } } }
            );
        }
        logger.debug('PouchDemoDB.listReservations: selector(%j).', selector);
        const response = await this.pouchDB.find({ selector });
        logger.debug('CouchDemoDB.listReservations: done with result(%j).', response)
        const retval: Reservation[] = [];
        response.docs.forEach(
            (doc: any) => {
                retval.push({
                    id: doc._id as string,
                    arrivalTime: new Date(doc['arrivalTime'] as number),
                    ...lodash.pick(doc, ['guestName', 'guestPhone', 'status', 'tableSize'])
                })
            }
        );
        return retval;
    }

    async updateReservation(input: ReservationUpdateInput): Promise<Reservation> {
        if (!this.pouchDB) {
            logger.error('PouchDemoDB.updateReservation: Database was initialized correctly.');
            throw new GraphQLError(
                'Database was initialized correctly.',
                { extensions: { code: 'Internal Server Error', http: { status: 500 } } }
            );
        }
        logger.debug('PouchDemoDB.updateReservation: input(%j).', input);
        const document: any = await this.pouchDB.get(input.id);
        logger.debug('CouchDemoDB.updateReservation: current document(%j).', document);
        lodash.assign(
            document,
            { arrivalTime: input.arrivalTime.getTime(), ...lodash.omit(input, ['id', 'arrivalTime']) }
        );
        const response = await this.pouchDB.put(document);
        logger.debug('PouchDemoDB.updateReservation: done with result(%j).', response);
        if (!response.ok) {
            logger.error('PouchDemoDB.updateReservation: put failed.');
            throw new GraphQLError(
                'put failed',
                { extensions: { code: 'Internal Server Error', http: { status: 500 } } }
            );
        }
        return {
            id: response.id,
            arrivalTime: new Date(document['arrivalTime']),
            ...lodash.pick(document, ['guestName', 'guestPhone', 'tableSize', 'status'])
        };
    }
}

let demoDB: DemoDB | null = null;

export async function initDB() {
    if (demoDB !== null) {
        logger.error('initDB: database already initialized');
        return;
    }
    logger.info('initDB: database initializing...');
    try {
        // try to create couchdb
        const _nanoDB = new CouchDemoDB(config.couchDBAddress, config.couchDBUserName, config.couchDBPassword, config.dbName);
        await _nanoDB.init();
        demoDB = _nanoDB;
        logger.info('initDB: database initialized.');
        return;
    } catch (err) {
        logger.error('initDB: database initialize couchdb failed with error(%s).', err);
    }
    try {
        // try to use pouchdb
        const _pouchDB = new PouchDemoDB(config.dbName);
        await _pouchDB.init();
        demoDB = _pouchDB;
        logger.info('initDB: database initialized.');
        return;
    } catch (err) {
        logger.error('initDB: database initialize pouchdb failed with error(%s).', err);
    }
    logger.error('initDB: failed to initialize database');
    throw new Error('failed');
}

export async function destroyDB() {
    logger.debug('destroyDB: database destroying..');
    if (demoDB === null) {
        logger.error('destroyDB: database already destroyed');
        return;
    }
    await demoDB.destroy();
    demoDB = null;
    logger.debug('destroyDB: database destroyed.');
}

// TODO add validation for creating reservatoin
export async function addReservation(input: ReservationCreateInput): Promise<Reservation> {
    if (demoDB === null) {
        logger.error('addReservation: database was not initialized correctly.');
        throw new GraphQLError(
            'Database was initialized correctly.',
            { extensions: { code: 'Internal Server Error', http: { status: 500 } } }
        );
    }
    logger.debug('addReservation: input(%j).', input);
    return demoDB.addReservation(input);
}

export async function listReservations(selector: any): Promise<Reservation[]> {
    if (demoDB === null) {
        logger.error('listReservations: database was not initialized correctly.');
        throw new GraphQLError(
            'Database was initialized correctly.',
            { extensions: { code: 'Internal Server Error', http: { status: 500 } } }
        );
    }
    logger.debug('listReservations: selector(%j).', selector);
    return demoDB.listReservations(selector);
}

// TODO add validation for updating reservatoin
export async function updateReservation(input: ReservationUpdateInput, userType: UserType): Promise<Reservation> {
    if (demoDB === null) {
        logger.error('updateReservation: database was not initialized correctly.');
        throw new GraphQLError(
            'Database was initialized correctly.',
            { extensions: { code: 'Internal Server Error', http: { status: 500 } } }
        );
    }
    logger.debug('updateReservation: input(%j).', input);
    return demoDB.updateReservation(input);
}
