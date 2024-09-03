import { app, HttpRequest, HttpResponseInit, InvocationContext, output, input, StorageQueueOutput, TableOutput } from "@azure/functions";
// import { TableClient } from "@azure/data-tables";

interface HeartBoxRequest {
    deviceId: number;
}

interface HeartBoxPollingRequest extends HeartBoxRequest {
}

interface HeartBoxPutRequest extends HeartBoxRequest {
}

function getPeerDeviceId(myDeviceId: number) {
    return myDeviceId === 0 ? 1 : 0;
}

export async function heartbox(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    // const connectionString = process.env.AzureWebJobsStorage;
    // const tableClient = TableClient.fromConnectionString(connectionString, 'heartbox');
    try {
        const params = validateBaseParams(request.query);

        switch (request.method.toUpperCase()) {
            case 'GET':
                return handleGet(params, context);
            case 'PUT':
                return handlePut(params, context);
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
                message: error.message
            }
        };
    }
};

function validateBaseParams(queryParams: URLSearchParams) {
    if (!queryParams.has('deviceId')) {
        throw new Error('Missing deviceId');
    }

    const deviceId = parseInt(queryParams.get('deviceId'));

    if (isNaN(deviceId)) {
        throw new Error('Invalid deviceId (NaN)');
    }

    return {
        deviceId,
    };
}

function handleGet(params: HeartBoxPollingRequest, context: InvocationContext/*, tableClient: TableClient*/): HttpResponseInit {
    // const deviceId = params.deviceId.toString();
    // const entities = context.extraInputs.get(tableInput);

    // let latestEntity = null;
    // for (const entity of entities) {
    //     if (entity.PartitionKey === deviceId) {
    //         if (!latestEntity || entity.RowKey > latestEntity.RowKey) {
    //             latestEntity = entity;
    //         }
    //     }
    // }
    
    return {
        status: 200,
        jsonBody: {
            message: `[device${params.deviceId}] polled`
        }
    };
}

function handlePut(params: HeartBoxPutRequest, context: InvocationContext/*, tableClient: TableClient*/): HttpResponseInit {
    
    // Set my peer's heartbox to 'on'
    const peerDeviceId = getPeerDeviceId(params.deviceId);

    context.extraOutputs.set(tableOutput, {
        PartitionKey: peerDeviceId.toString(),
        RowKey: new Date().toISOString(),
        status: 'on',
    });

    // TODO: Log this state change somewhere?
    
    return {
            status: 200,
            jsonBody: {
                message: `[device${params.deviceId}] set peer's state to 'on'`
        }
    };
}

// function handleDelete(params: HeartBoxRequest, context: InvocationContext/*, tableClient: TableClient*/): HttpResponseInit {}

// const tableInput = input.table({
//     tableName: 'heartbox',
//     connection: 'AzureWebJobsStorage',
//     filter: 'PartitionKey eq {deviceId}',
// });

const tableOutput = output.table({
    tableName: 'heartbox',
    connection: 'AzureWebJobsStorage',
});

app.http('heartbox', {
    methods: ['GET', 'PUT'],
    authLevel: 'function',
    // extraInputs: [table({connection: 'AzureWebJobsStorage',tableName: 'heartbox'})],
    extraOutputs: [tableOutput],
    handler: heartbox
});
