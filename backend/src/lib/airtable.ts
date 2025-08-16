import Airtable from 'airtable';
import { env } from '../config/env';
import logger from '../utils/logger';

// Check if Airtable is configured
const isAirtableConfigured = () => {
  return !!(env.AIRTABLE_API_KEY && env.AIRTABLE_BASE_ID && env.AIRTABLE_TABLE_NAME);
};

// Initialize Airtable base (only if configured)
let airtable: any = null;
let table: any = null;

if (isAirtableConfigured()) {
  try {
    airtable = new Airtable({
      apiKey: env.AIRTABLE_API_KEY,
    }).base(env.AIRTABLE_BASE_ID);
    
    table = airtable(env.AIRTABLE_TABLE_NAME);
    logger.info('✅ Airtable configured and initialized');
  } catch (error) {
    logger.warn('⚠️ Failed to initialize Airtable:', error);
  }
} else {
  logger.warn('⚠️ Airtable not configured - API key, base ID, or table name missing');
}

// Type for Airtable records
export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

// Result type for Airtable operations
export interface AirtableResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch all records from the configured Airtable table
 * @returns Promise<AirtableResult<AirtableRecord[]>> - Success result with records or error
 */
export async function getAllAirtableRecords(): Promise<
  AirtableResult<AirtableRecord[]>
> {
  if (!isAirtableConfigured() || !table) {
    return {
      success: false,
      error: 'Airtable not configured',
    };
  }

  try {
    logger.info(
      `📊 Fetching all records from Airtable table: ${env.AIRTABLE_TABLE_NAME}`
    );

    // Fetch all records from the table
    const records = await table.select().all();

    // Transform records to our interface format
    const transformedRecords: AirtableRecord[] = records.map((record) => ({
      id: record.id,
      fields: record.fields,
      createdTime: record._rawJson.createdTime,
    }));

    logger.info(
      `✅ Successfully fetched ${transformedRecords.length} records from Airtable`
    );

    return {
      success: true,
      data: transformedRecords,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error occurred';
    logger.error('❌ Failed to fetch Airtable records:', {
      error: errorMessage,
      table: env.AIRTABLE_TABLE_NAME,
      baseId: env.AIRTABLE_BASE_ID,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Fetch a single record by ID
 * @param recordId - The Airtable record ID
 * @returns Promise<AirtableResult<AirtableRecord>> - Success result with record or error
 */
export async function getAirtableRecord(
  recordId: string
): Promise<AirtableResult<AirtableRecord>> {
  if (!isAirtableConfigured() || !table) {
    return {
      success: false,
      error: 'Airtable not configured',
    };
  }

  try {
    logger.info(`📊 Fetching Airtable record: ${recordId}`);

    const record = await table.find(recordId);

    const transformedRecord: AirtableRecord = {
      id: record.id,
      fields: record.fields,
      createdTime: record._rawJson.createdTime,
    };

    logger.info(`✅ Successfully fetched Airtable record: ${recordId}`);

    return {
      success: true,
      data: transformedRecord,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error occurred';
    logger.error('❌ Failed to fetch Airtable record:', {
      error: errorMessage,
      recordId,
      table: env.AIRTABLE_TABLE_NAME,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Create a new record in Airtable
 * @param fields - The fields to create the record with
 * @returns Promise<AirtableResult<AirtableRecord>> - Success result with created record or error
 */
export async function createAirtableRecord(
  fields: Record<string, any>
): Promise<AirtableResult<AirtableRecord>> {
  if (!isAirtableConfigured() || !table) {
    return {
      success: false,
      error: 'Airtable not configured',
    };
  }

  try {
    logger.info(
      `📝 Creating new Airtable record with fields:`,
      Object.keys(fields)
    );

    const record = await table.create(fields);

    const transformedRecord: AirtableRecord = {
      id: record.id,
      fields: record.fields,
      createdTime: record._rawJson.createdTime,
    };

    logger.info(`✅ Successfully created Airtable record: ${record.id}`);

    return {
      success: true,
      data: transformedRecord,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error occurred';
    logger.error('❌ Failed to create Airtable record:', {
      error: errorMessage,
      fields: Object.keys(fields),
      table: env.AIRTABLE_TABLE_NAME,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Update an existing record in Airtable
 * @param recordId - The Airtable record ID to update
 * @param fields - The fields to update
 * @returns Promise<AirtableResult<AirtableRecord>> - Success result with updated record or error
 */
export async function updateAirtableRecord(
  recordId: string,
  fields: Record<string, any>
): Promise<AirtableResult<AirtableRecord>> {
  if (!isAirtableConfigured() || !table) {
    return {
      success: false,
      error: 'Airtable not configured',
    };
  }

  try {
    logger.info(`📝 Updating Airtable record: ${recordId}`);

    const record = await table.update(recordId, fields);

    const transformedRecord: AirtableRecord = {
      id: record.id,
      fields: record.fields,
      createdTime: record._rawJson.createdTime,
    };

    logger.info(`✅ Successfully updated Airtable record: ${recordId}`);

    return {
      success: true,
      data: transformedRecord,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error occurred';
    logger.error('❌ Failed to update Airtable record:', {
      error: errorMessage,
      recordId,
      table: env.AIRTABLE_TABLE_NAME,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Delete a record from Airtable
 * @param recordId - The Airtable record ID to delete
 * @returns Promise<AirtableResult<boolean>> - Success result or error
 */
export async function deleteAirtableRecord(
  recordId: string
): Promise<AirtableResult<boolean>> {
  if (!isAirtableConfigured() || !table) {
    return {
      success: false,
      error: 'Airtable not configured',
    };
  }

  try {
    logger.info(`🗑️ Deleting Airtable record: ${recordId}`);

    await table.destroy(recordId);

    logger.info(`✅ Successfully deleted Airtable record: ${recordId}`);

    return {
      success: true,
      data: true,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error occurred';
    logger.error('❌ Failed to delete Airtable record:', {
      error: errorMessage,
      recordId,
      table: env.AIRTABLE_TABLE_NAME,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Test Airtable connection
 * @returns Promise<AirtableResult<boolean>> - Success result or error
 */
export async function testAirtableConnection(): Promise<
  AirtableResult<boolean>
> {
  if (!isAirtableConfigured() || !table) {
    return {
      success: false,
      error: 'Airtable not configured',
    };
  }

  try {
    logger.info('🔍 Testing Airtable connection...');

    // Try to fetch a single record to test connection
    const records = await table.select({ maxRecords: 1 }).all();

    logger.info('✅ Airtable connection test successful');

    return {
      success: true,
      data: true,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error occurred';
    logger.error('❌ Airtable connection test failed:', {
      error: errorMessage,
      table: env.AIRTABLE_TABLE_NAME,
      baseId: env.AIRTABLE_BASE_ID,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Export all functions as default for convenience
export default {
  getAllAirtableRecords,
  getAirtableRecord,
  createAirtableRecord,
  updateAirtableRecord,
  deleteAirtableRecord,
  testAirtableConnection,
};
