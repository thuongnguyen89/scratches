package si.ta.classes.entity

uses gw.api.system.database.SequenceUtil
uses gw.api.database.Query
uses gw.api.database.Relop

/**
* Training Lab
*/
class ABContactSummary {

    construct(externalID : int) {
        ExternalID = externalID
    }

    // Declared ExternalID property using getter and setter
    var _externalID : int

    property set ExternalID(id int) {
        if(id == 0) {
            this._externalID = SequenceUtil.next(1000, "abSummaryExternalID") as int
        } else {
            this._externalID = id
        }
    }

    property get ExternalID() : int {
        return this._externalID
    }

    var _contactID : String as ContactID
    var _name : String as Name
    var _numCheckingAccounts : String as NumCheckingAccounts
    var _assignedUserWorkload : int as AssignedUserWorkload

    @Param("abContact", "Input parameter of type entity.ABContact")
    function loadSummaryData(abContact: ABContact) : void {
        // TODO : Check null abContact
        this._name = abContact.DisplayName;
        this._contactID = abContact.PublicID;
        this._numCheckingAccounts = abContact.BankAccounts.countWhere(\account ->
        account.accountType == typekey.BankAccountType.TC_CHECKING)
        if(abContact.assignedUser != null) {
            var queryObj = Query.make(ABContact)
            queryObj.compare(ABContact#AssignedUser, Relop.Equals, abContact.AssignedUser)
            this._assignedUserWorkload = queryObj.select().Count
        } else {
            this._assignedUserWorkload = 0
        }
    }

    @Returns("A comma-delimited list of property value")
    function buildConcatenatedSummary() : String {
        return String.format("%s, %s, %s, %s, %s",
        {this._externalID, this._contactID, this._name, this._numCheckingAccounts, this._assignedUserWorkload})
    }

    function saveSummaryNote() : void {
        if(this._contactID != null) {
            var queryObj = Query.make(ABContact);
            queryObj.compare(ABContact#PublicID, Relop.Equals, this._contactID)
            var contact = queryObj.select().AtMostOneRow
            Transaction.runWithNewBundle(\newBundle -> {
                var note = new ContactNote()
                note.Subject = "ABcontact Summary"
                note.ContactNoteType = ContactNoteType.TC_GENERAL
                note.Body = "External ID:" + this._externalID + "\n" +
                    "Name:" + this._name + "\n" +
                    "Number of checking accounts:" + this._numberCheckingAccounts
                contact.addToContactNotes(note)
            }, "su")
        }
    }
}


/////////////////////////////////////////////////////////////////////////
//////////////////////////  VERIFICATION STEPS //////////////////////////
/////////////////////////////////////////////////////////////////////////

uses trainingApp.base.QueryUtil
uses si.ta.classes.entity.ABContactSummary
uses gw.api.database.Query
uses gw.api.database.Relop

// var contact = QueryUtil.findContact("ab:5")
var queryObj = Query.make(ABContact)
queryObj.compare(ABContact#PublicID, Relop.Equals, "ab:5")
var contact = queryObj.select().AtMostOneRow

var abContactSummary = new ABContactSummary(0)
abContactSummary.loadSummaryData(contact)
abContactSummary.saveSummaryNote()
print(abContactSummary.buildConcatenatedSummary())
