// (c) 2024 Josh Spicer <hello@joshspicer.com>
// https://joshspicer.com/heartbox

import { app, HttpRequest, HttpResponseInit, InvocationContext, output, input } from "@azure/functions";
import moment from 'moment';

interface StateTransition {
    PartitionKey: string;
    RowKey: string; // Timestamp
    Status: string;
}

interface HeartBoxRequest {
    deviceId: number;
    verbose?: boolean;
}

// The device always sends THEIR deviceId
// Eg: Box 1 with append ?deviceId=1 to every request
function getPeerDeviceId(myDeviceId: number) {
    return myDeviceId === 0 ? 1 : 0;
}

export async function heartbox(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    // const connectionString = process.env.AzureWebJobsStorage;
    // const tableClient = TableClient.fromConnectionString(connectionString, 'heartbox');
    try {
        const params = parseAndValidateParams(request.query);
        switch (request.method.toUpperCase()) {
            case 'GET':
                // Polls my state and my peer's state
                // If ?verbose=true is set, also return a list of all past states for both participants
                return handleGet(params, context);
            case 'PUT':
                // Sets the peer's heartbox to 'on'
                return handlePut(params, context);
            case 'DELETE':
                // Sets the peer's heartbox to 'off'
                return handleDelete(params, context);
            default:
                return {
                    status: 405,
                    jsonBody: {
                        message: 'Method Not Allowed'
                    }
                };
        }
    } catch (error: any) {
        return {
            status: 400,
            jsonBody: {
                message: 'message' in error ? error.message : error?.toString()
            }
        };
    }
};

function parseAndValidateParams(queryParams: URLSearchParams) {
    if (!queryParams.has('deviceId')) {
        throw new Error('Missing deviceId');
    }

    const deviceId = parseInt(queryParams.get('deviceId'));
    const verbose = queryParams.get('verbose') === 'true'

    if (isNaN(deviceId)) {
        throw new Error('Invalid deviceId (NaN)');
    }

    return {
        deviceId,
        verbose,
    };
}

function handleGet(params: HeartBoxRequest, context: InvocationContext/*, tableClient: TableClient*/): HttpResponseInit {
    const { deviceId, verbose } = params;

    const device0 = context.extraInputs.get(device0Input) as StateTransition[];
    const device1 = context.extraInputs.get(device1Input) as StateTransition[];

    context.debug(`device0: ${JSON.stringify(device0)}`);
    context.debug(`device1: ${JSON.stringify(device1)}`);

    let device0LastState: StateTransition | undefined = undefined;
    for (const state of device0) {
        if (device0LastState === undefined || new Date(state.RowKey) > new Date(device0LastState.RowKey)) {
            device0LastState = state;
        }
    }

    let device1LastState: StateTransition | undefined = undefined;
    for (const state of device1) {
        if (device1LastState === undefined || new Date(state.RowKey) > new Date(device1LastState.RowKey)) {
            device1LastState = state;
        }
    }

    const transitions = { transitions: { device0, device1 } };

    const self = deviceId === 0 ? device0LastState : device1LastState;
    const peer = deviceId === 0 ? device1LastState : device0LastState;
    context.log(`[device${deviceId}] Polled self=${self.Status}, peer=${peer.Status}`);

    const selfAgo = moment(self.RowKey).fromNow();
    const peerAgo = moment(peer.RowKey).fromNow();
    context.log(`[device${deviceId}] Self was set on '${self.RowKey}' (${selfAgo})`);
    context.log(`[device${deviceId}] Peer was set on '${peer.RowKey}' (${peerAgo})`);

    return verbose ? {
        status: 200,
        jsonBody: {
            ...transitions,
            self: {
                ...self,
                lastChanged: selfAgo,
            },
            peer: {
                ...peer,
                lastChanged: peerAgo
            }
        },
    } : { status: 200, body: `${self.Status},${peer.Status}` }
}

function handlePut(params: HeartBoxRequest, context: InvocationContext/*, tableClient: TableClient*/): HttpResponseInit {
    // Set my peer's heartbox to 'on'
    // TODO: Reject if peer is already on
    const peerDeviceId = getPeerDeviceId(params.deviceId);
    context.extraOutputs.set(tableOutput, {
        PartitionKey: peerDeviceId.toString(),
        RowKey: new Date().toISOString(),
        Status: 'on',
    });

    return {
        status: 200,
        jsonBody: {
            message: `Device '${params.deviceId}' set peer '${peerDeviceId}' state to 'on'`
        }
    };
}

function handleDelete(params: HeartBoxRequest, context: InvocationContext/*, tableClient: TableClient*/): HttpResponseInit {
    // Set my peer's heartbox to 'off
    // TODO: Reject if peer is already off
    const peerDeviceId = getPeerDeviceId(params.deviceId);
    context.extraOutputs.set(tableOutput, {
        PartitionKey: peerDeviceId.toString(),
        RowKey: new Date().toISOString(),
        Status: 'off',
    });

    return {
        status: 200,
        jsonBody: {
            message: `Device '${params.deviceId}' set peer '${peerDeviceId}' state to 'off'`
        }
    };
}

const device0Input = input.table({
    tableName: 'heartbox',
    connection: 'AzureWebJobsStorage',
    filter: `PartitionKey eq '0'`,
});

const device1Input = input.table({
    tableName: 'heartbox',
    connection: 'AzureWebJobsStorage',
    filter: `PartitionKey eq '1'`,
});

const tableOutput = output.table({
    tableName: 'heartbox',
    connection: 'AzureWebJobsStorage',
});

app.http('heartbox', {
    methods: ['GET', 'PUT', 'DELETE'],
    authLevel: 'function',
    extraInputs: [device0Input, device1Input],
    extraOutputs: [tableOutput],
    handler: heartbox
});
