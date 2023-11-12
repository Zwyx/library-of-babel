onmessage = (e: MessageEvent<string>) => {
	console.info("Message received from main script");
	const workerResult = `Result: ${e.data}`;
	console.info("Posting message back to main script");
	postMessage(workerResult);
};
