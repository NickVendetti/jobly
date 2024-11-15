// helpers/sql.test.js
const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("works: single field", function () {
    const result = sqlForPartialUpdate(
      { firstName: "John" },
      { firstName: "first_name" }
    );
    expect(result).toEqual({
      setCols: "\"first_name\"=$1",
      values: ["John"],
    });
  });

  test("works: multiple fields", function () {
    const result = sqlForPartialUpdate(
      { firstName: "John", age: 30 },
      { firstName: "first_name", age: "age" }
    );
    expect(result).toEqual({
      setCols: "\"first_name\"=$1, \"age\"=$2",
      values: ["John", 30],
    });
  });

  test("works: no jsToSql mappings", function () {
    const result = sqlForPartialUpdate(
      { firstName: "John", age: 30 },
      {}
    );
    expect(result).toEqual({
      setCols: "\"firstName\"=$1, \"age\"=$2",
      values: ["John", 30],
    });
  });
});