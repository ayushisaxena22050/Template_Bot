// State Accessor Properties
const DIALOG_STATE_PROPERTY = 'dialogStatePropertyAccessor';
const USER_INFO_PROPERTY = 'userInfoPropertyAccessor';
const { ActivityTypes, MessageFactory} = require('botbuilder');
const { DialogSet, WaterfallDialog, Dialog, DialogTurnStatus } = require('botbuilder-dialogs');
const { HRDialog } = require('./Dialogs/HR');
const text =require('./Dialogs/text.js');
const HR_DIALOG ='hrDialog';// Dialog ID
class TemplateBot{
    constructor(conversationState, userState) {
    this.conversationState = conversationState;
    this.userState = userState;

    // Create our state property accessors.
    this.dialogStateAccessor = conversationState.createProperty(DIALOG_STATE_PROPERTY);
    this.userInfoAccessor = userState.createProperty(USER_INFO_PROPERTY);

    // Create our bot's dialog set, adding a main dialog and the three component dialogs.
    this.dialogs = new DialogSet(this.dialogStateAccessor)
        .add(new HRDialog('hrDialog'))
        .add(new WaterfallDialog('mainDialog', [
            this.promptForChoice.bind(this),
            this.startChildDialog.bind(this)
    ]));
    }
    async promptForChoice(step) {
        const menu = text.options;
        await step.context.sendActivity(MessageFactory.suggestedActions(menu, 'Please select an option!'));
        return Dialog.EndOfTurn;
    }
    
    async startChildDialog(step) {
        // Get the user's info.
        const user = await this.userInfoAccessor.get(step.context);
        // Check the user's input and decide which dialog to start.
        // Pass in the guest info when starting either of the child dialogs.
        switch (step.result) {
            case "HR":
                return await step.beginDialog(HR_DIALOG, user.guestInfo);
                break;
            case "Sales":
                return await step.context.sendActivity('Sales');
                break;
            case "It":
                return await step.context.sendActivity('It');
                break;
            case "Admin":
                return await step.context.sendActivity("Admin");
                break;
            default:
                await step.context.sendActivity("Sorry, I don't understand that command. Please choose an option from the list.");
                return await step.replaceDialog('mainDialog');
                break;
        }
    }
    
    async onTurn(turnContext){
       
        if (turnContext.activity.type === ActivityTypes.Message) {
            const user = await this.userInfoAccessor.get(turnContext, {});
            const dc = await this.dialogs.createContext(turnContext);
            const dialogTurnResult = await dc.continueDialog();
            if (dialogTurnResult.status === DialogTurnStatus.complete) {
                user.guestInfo = dialogTurnResult.result;
                await this.userInfoAccessor.set(turnContext, user);
                await dc.beginDialog('mainDialog');
            }
            if (!turnContext.responded){
                await dc.beginDialog('mainDialog');
            }
            // Save state changes
            await this.conversationState.saveChanges(turnContext);
            await this.userState.saveChanges(turnContext);
        }
        else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
            // Do we have any new members added to the conversation?
            if (turnContext.activity.membersAdded.length !== 0) {
                // Iterate over all new members added to the conversation
                for (var idx in turnContext.activity.membersAdded) {
                    // Greet anyone that was not the target (recipient) of this message.
                    // Since the bot is the recipient for events from the channel,
                    // context.activity.membersAdded === context.activity.recipient.Id indicates the
                    // bot was added to the conversation, and the opposite indicates this is a user.
                    if (turnContext.activity.membersAdded[idx].id !== turnContext.activity.recipient.id) {
                        // Send a "this is what the bot does" message.
                        const description = ["Hi! I am your AI assistant.How can I help you?"];
                        await turnContext.sendActivity(description.join(' '));
                    }
                }
            }
        }
    
    }
    }
module.exports.TemplateBot = TemplateBot