import mongoose from 'mongoose';

/**
 * Database Connector
 * @param {Object} dbConfig - Database configurations
 * @param {Object} logger - Logging functions (info and error)
 */
const dbConnector = async (dbConfig, logger) => {
  const uri = `${dbConfig.baseUrl}/${dbConfig.dbName}?retryWrites=true&w=majority`;

  const options = {
    user: dbConfig.user,
    pass: dbConfig.password,
  };

  try {
    await mongoose.connect(uri, options);
    logger.info(`Successfully connected to MongoDB`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); 
  }
};

export default dbConnector;
