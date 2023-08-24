import fs from "fs";
import { parseStringPromise } from "xml2js";
import createCsvWriter from "csv-writer";

async function main() {
  try {
    const xml = await fs.promises.readFile("./junit.xml", "utf-8");

    const { testsuites } = await parseStringPromise(xml);
    const testcases = testsuites.testsuite[0].testcase;

    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: "./test-results/junit.csv",
      header: [
        { id: "name", title: "Name" },
        { id: "status", title: "Status" },
      ],
      fieldDelimiter: ";",
    });

    const records = testcases.map((testcase: any) => {
      return {
        name: testcase.$.name,
        status: testcase.failure ? "failed" : "passed",
      };
    });

    await csvWriter.writeRecords(records);

    console.log("Done");
  } catch (err) {
    console.log(err);
  }
}

main();
