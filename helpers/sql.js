const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

/**
 * Generates a partial SQL "UPDATE" statement.
 * 
 * this function takes in an object of data to update and maps it to SQL 'SET' syntax
 * for dynamic column updating, useful when you only need to update specific fields.
 * 
 * @param {Object} dataToUpdate - An object with the data fields to update e.g., '{name: "NewName", age: 30}' 
 * @param {Object} jsToSql - An object mapping JavaScript field names to database column names,
 *                          e.g., '{ firstName: "first_name", age: "age" }'
 * @returns {Object} - An object with 'setCols' for the SQL column assignments and 'values' array for SQL parameters
 *
 *  @example
 * sqlForPartialUpdate({firstName: "John"}, {firstName: "first_name"});
 * // Returns: { setCols: "\"first_name\"=$1", values: ["John"] }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
