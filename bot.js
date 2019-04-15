const { ActivityTypes,CardFactory,MessageFactory } = require('botbuilder');
const{ DialogSet,DialogTurnStatus } = require('botbuilder-dialogs');
const { HRDialog } = require('./Dialogs/HR');
const HR_DIALOG ='hrDialog';
// State Accessor Properties
const DIALOG_STATE_PROPERTY = 'dialogState';
const USER_PROFILE_PROPERTY = 'userProfileProperty';
class TemplateBot{
    constructor(conversationState, userState, botconfig) {
        if (!conversationState) throw new Error('Missing parameter.  conversationState is required');
        if (!userState) throw new Error('Missing parameter.  userState is required');
        if (!botconfig) throw new Error('Missing parameter.  botConfig is required');
        // Create the property accessors for user and conversation state
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);
        this.dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);
        // Create top-level dialog(s)
        this.dialogs = new DialogSet(this.dialogState);
        // Add the Greeting dialog to the set
        this.dialogs.add(new HRDialog(HR_DIALOG, this.userProfileAccessor));

        this.conversationState = conversationState;
        this.userState = userState;
    }
    async buttons(context,list){
        var reply = MessageFactory.suggestedActions(list)
        await context.sendActivity(reply)
    }
    
    async onTurn(context){
        const dc = await this.dialogs.createContext(context);
        if(context.activity.text=='HR'){
            await dc.beginDialog(HR_DIALOG);
        }
        if(context.activity.type ===ActivityTypes.ConversationUpdate){
            if(context.activity.membersAdded.length!==0){
                for(var idx in context.activity.membersAdded){
                    if(context.activity.membersAdded[idx].id !== context.activity.recipient.id){
                        var options =['HR','Sales','Admin','It']
                        await context.sendActivity('Hi! How may I help you?')
                        await  this.buttons(context,options)
                    }
                }
            }
        }
    }
}
module.exports.TemplateBot = TemplateBot