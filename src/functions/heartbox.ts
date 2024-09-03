import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

interface HeartBoxRequest {
    deviceId: number;
}

interface HeartBoxPollingRequest extends HeartBoxRequest {
}

interface HeartBoxPutRequest extends HeartBoxRequest {
}


export async function heartbox(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);
    try {
        const params = validateBaseParams(request.query);
        switch (request.method.toUpperCase()) {
            case 'GET':
                return handleGet(params);
            case 'PUT':
                return handlePut(params);
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

function handleGet(request: HeartBoxPollingRequest): HttpResponseInit {
    return {
        status: 200,
        jsonBody: {
            message: `Heartbox ${request.deviceId} polled`
        }
    };
}

function handlePut(request: HeartBoxPutRequest): HttpResponseInit {
    return {
        status: 200,
        jsonBody: {
            message: `Heartbox ${request.deviceId} updated`
        }
    };
}

app.http('heartbox', {
    methods: ['GET', 'PUT'],
    authLevel: 'function',
    handler: heartbox
});
