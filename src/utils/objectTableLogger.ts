/**
 * Utility function to log object contents in a tabulated format
 */

/**
 * Logs the contents of an object/hash in a tabulated format with columns:
 * - Key Name
 * - Key Value
 * - Data Type
 *
 * @param obj - The object/hash to inspect
 * @param heading - Optional heading for the table
 */
export function logObjectTable(obj: any, heading?: string): void {
  if (!obj || typeof obj !== 'object') {
    console.log('Invalid object provided to logObjectTable');
    return;
  }

  // Create table data
  const tableData: Array<{
    'Key Name': string;
    'Key Value': string;
    'Data Type': string;
  }> = [];

  // Process each key-value pair
  Object.entries(obj).forEach(([key, value]) => {
    let valueStr: string;
    let dataType: string;

    // Handle different data types for display
    if (value === null) {
      valueStr = 'null';
      dataType = 'null';
    } else if (value === undefined) {
      valueStr = 'undefined';
      dataType = 'undefined';
    } else if (typeof value === 'string') {
      valueStr = `"${value}"`;
      dataType = 'string';
    } else if (typeof value === 'number') {
      valueStr = value.toString();
      dataType = 'number';
    } else if (typeof value === 'boolean') {
      valueStr = value.toString();
      dataType = 'boolean';
    } else if (typeof value === 'bigint') {
      valueStr = value.toString() + 'n';
      dataType = 'bigint';
    } else if (typeof value === 'function') {
      valueStr = '[Function]';
      dataType = 'function';
    } else if (Array.isArray(value)) {
      valueStr = `[Array(${value.length})]`;
      dataType = 'array';
    } else if (value instanceof Date) {
      valueStr = value.toISOString();
      dataType = 'Date';
    } else if (typeof value === 'object') {
      valueStr = `[Object]`;
      dataType = 'object';
    } else {
      valueStr = String(value);
      dataType = typeof value;
    }

    // // Truncate long values for better display
    // if (valueStr.length > 100) {
    //   valueStr = valueStr.substring(0, 97) + '...';
    // }

    tableData.push({
      'Key Name': key,
      'Key Value': valueStr,
      'Data Type': dataType
    });
  });

  // Print heading if provided
  if (heading) {
    console.log(`\n=== ${heading} ===`);
  }

  // Log the table
  if (tableData.length === 0) {
    console.log('Object is empty');
  } else {
    console.table(tableData);
  }

  // Print separator if heading was provided
  if (heading) {
    console.log('='.repeat(heading.length + 8));
  }
}

/**
 * Extended version that shows nested objects in more detail
 *
 * @param obj - The object/hash to inspect
 * @param heading - Optional heading for the table
 * @param maxDepth - Maximum depth to traverse for nested objects (default: 2)
 */
export function logObjectTableDetailed(obj: any, heading?: string, maxDepth: number = 2): void {
  if (!obj || typeof obj !== 'object') {
    console.log('Invalid object provided to logObjectTableDetailed');
    return;
  }

  const tableData: Array<{
    'Key Name': string;
    'Key Value': string;
    'Data Type': string;
    'Size/Length': string;
  }> = [];

  function processValue(value: any, depth: number = 0): { valueStr: string; dataType: string; sizeInfo: string } {
    let valueStr: string;
    let dataType: string;
    let sizeInfo: string = '';

    if (value === null) {
      valueStr = 'null';
      dataType = 'null';
    } else if (value === undefined) {
      valueStr = 'undefined';
      dataType = 'undefined';
    } else if (typeof value === 'string') {
      valueStr = `"${value}"`;
      dataType = 'string';
      sizeInfo = `${value.length} chars`;
    } else if (typeof value === 'number') {
      valueStr = value.toString();
      dataType = 'number';
    } else if (typeof value === 'boolean') {
      valueStr = value.toString();
      dataType = 'boolean';
    } else if (typeof value === 'bigint') {
      valueStr = value.toString() + 'n';
      dataType = 'bigint';
    } else if (typeof value === 'function') {
      valueStr = '[Function]';
      dataType = 'function';
    } else if (Array.isArray(value)) {
      if (depth < maxDepth && value.length > 0) {
        const preview = value.slice(0, 3).map(item => {
          const processed = processValue(item, depth + 1);
          return processed.valueStr;
        }).join(', ');
        valueStr = `[${preview}${value.length > 3 ? ', ...' : ''}]`;
      } else {
        valueStr = `[Array(${value.length})]`;
      }
      dataType = 'array';
      sizeInfo = `${value.length} items`;
    } else if (value instanceof Date) {
      valueStr = value.toISOString();
      dataType = 'Date';
    } else if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (depth < maxDepth && keys.length > 0) {
        const preview = keys.slice(0, 3).map(key => {
          const processed = processValue(value[key], depth + 1);
          return `${key}: ${processed.valueStr}`;
        }).join(', ');
        valueStr = `{ ${preview}${keys.length > 3 ? ', ...' : ''} }`;
      } else {
        valueStr = `[Object]`;
      }
      dataType = 'object';
      sizeInfo = `${keys.length} props`;
    } else {
      valueStr = String(value);
      dataType = typeof value;
    }

    // Truncate long values for better display
    if (valueStr.length > 80) {
      valueStr = valueStr.substring(0, 77) + '...';
    }

    return { valueStr, dataType, sizeInfo };
  }

  // Process each key-value pair
  Object.entries(obj).forEach(([key, value]) => {
    const processed = processValue(value);

    tableData.push({
      'Key Name': key,
      'Key Value': processed.valueStr,
      'Data Type': processed.dataType,
      'Size/Length': processed.sizeInfo
    });
  });

  // Print heading if provided
  if (heading) {
    console.log(`\n=== ${heading} ===`);
  }

  // Log the table
  if (tableData.length === 0) {
    console.log('Object is empty');
  } else {
    console.table(tableData);
  }

  // Print separator if heading was provided
  if (heading) {
    console.log('='.repeat(heading.length + 8));
  }
}

/**
 * Quick helper to log transaction objects specifically
 */
export function logTransactionTable(tx: any, heading: string = 'Transaction Object'): void {
  logObjectTableDetailed(tx, heading, 1);
}

/**
 * Quick helper to log receipt objects specifically
 */
export function logReceiptTable(receipt: any, heading: string = 'Transaction Receipt'): void {
  logObjectTableDetailed(receipt, heading, 1);
}
