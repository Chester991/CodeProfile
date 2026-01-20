const logInfo = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] INFO: ${message}`);
};

const logError = (message, error = null) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR: ${message}`);
  if (error) {
    console.error(`[${timestamp}] Stack Trace:`, error);
  }
};

const logWarning = (message) => {
  const timestamp = new Date().toISOString();
  console.warn(`[${timestamp}] WARNING: ${message}`);
};

const logSuccess = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ✓ ${message}`);
};

export { logInfo, logError, logWarning, logSuccess };
