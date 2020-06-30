import test from "ava";
import MemoryMongo from "../../../util/test-memory-mongo";
import MockExpressRequest from "mock-express-request";
import MockExpressResponse from "mock-express-response";
import { getSummary } from "../statistics.controller";
import {
  firstOrgId,
  organisations,
  people,
  members,
  archivedOpportunities,
  interestArchives,
} from "./statistics.fixture";
const { InterestArchive } = require("../../interest/interest");
const Member = require("../../member/member");
const ArchivedOpportunity = require("../../archivedOpportunity/archivedOpportunity");
const Organisation = require("../../organisation/organisation");
const Person = require("../../person/person");

test.before("Create a mock database and populate it with data ", async (t) => {
  t.context.memMongo = new MemoryMongo();
  await t.context.memMongo.start();

  await Organisation.create(organisations);
  await Person.create(people);
  await Member.create(members);
  await ArchivedOpportunity.create(archivedOpportunities);
  await InterestArchive.create(interestArchives);
});

test.after.always(async (t) => {
  await t.context.memMongo.stop();
});

test.serial(
  "Test getSummary returns correct volunteers and hours",
  async (t) => {
    const mockReq = new MockExpressRequest();
    const mockRes = new MockExpressResponse();

    mockReq.params = { orgId: firstOrgId, timeframe: "year" };

    await getSummary(mockReq, mockRes);
    const responseData = mockRes._getJSON();
    const expectedStatusCode = 200;

    const expectedData = {
      avgHoursPerVolunteer: 2.9583333333333335,
      totalHours: 5.916666666666667,
      totalVolunteers: 2,
    };

    t.assert(
      expectedStatusCode === mockRes.statusCode,
      "Status code should be 200 OK"
    );
    t.deepEqual(responseData, expectedData);
  }
);
