export default function handleSignals() {
    process.on('SIGINT', () => {
        console.log('Received SIGINT. Exiting...');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('Received SIGTERM. Exiting...');
        process.exit(0);
    });
}
