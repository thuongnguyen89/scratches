<%@ params(anABPerson: ABPerson) %>
taxID,$(anABPerson.TaxID);fullName,$(anABPerson.FullName)


/////////////////////////////////////////////////////////////////////////
//////////////////////////  VERIFICATION STEPS //////////////////////////
/////////////////////////////////////////////////////////////////////////
uses trainingApp.base.QueryUtil
uses si.ta.classes.entity.ABContactSummary
uses gw.api.database.Query
uses gw.api.database.Relop

var queryObj = Query.make(ABPerson)
queryObj.compare(ABPerson#PublicID, Relop.Equals, "ab:5")
var person = queryObj.select().AtMostOneRow

var payload = si.ta.gosutemplate.FraudTemplate.renderToString(person)
print(payload)