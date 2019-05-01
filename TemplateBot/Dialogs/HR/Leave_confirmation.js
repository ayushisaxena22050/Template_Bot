var Leave_Confirmation =  {


    insertdata: (TypeOfLeave,NoofDays, StartingDate,EndDate) => {
        return new Promise((resolve,reject) => {
            var cardschema= {
    "type": "AdaptiveCard",
    "body": [
        {
            "type": "TextBlock",
            "size": "Medium",
            "weight": "Bolder",
            "text": "Please find details for your Leave Application:"
        },
        {
            "type": "FactSet",
            "facts": [
                {
                    "title": "Type of Leave",
                    "value": ""
                },
                {
                    "title": "No of days",
                    "value": "Backlog"
                },
                {
                    "title": "Starting Date",
                    "value": "Matt Hidinger"
                },
                {
                    "title":"End Date",
                    "value": "Not set"
                }
            ]
        }
    ],
    "actions": [
        {
            "type": "Action.Submit",
            "title": "Confirm",
        },
        {
            "type": "Action.Submit",
            "title": "Cancel",
        }
    ],
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "version": "1.0"
}
cardschema.body[1].facts[0].value = `${TypeOfLeave}`;
cardschema.body[1].facts[1].value = `${NoofDays}`;
cardschema.body[1].facts[2].value = `${StartingDate}`;
cardschema.body[1].facts[3].value = `${EndDate}`;
resolve(cardschema);
});
}
}


module.exports = Leave_Confirmation;