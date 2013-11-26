if (! process.env.NODE_ENV) {
    console.error('[AGENT] NODE_ENV environment variable must be defined. Process will exit.');
    console.error('[AGENT] Please define environment name with "export NODE_ENV=development" for instance.');
    process.exit(0);
} else {
    switch(process.env.NODE_ENV){
        case 'development':
            console.log('[AGENT] This server is configured as a DEVELOPMENT server.');
            break;
        case 'production':
            console.log('[AGENT] This server is configured as a PRODUCTION server.');
            break;
        default:
            console.error('[AGENT] NODE_ENV environment variable value ("'+process.env.NODE_ENV+'") is not valid. Process will exit.');
            console.error('[AGENT] Please define environment name with "export NODE_ENV=development" for instance.');
            process.exit(0);
    }
}
