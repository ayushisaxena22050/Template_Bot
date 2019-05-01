const { ComponentDialog,WaterfallDialog,TextPrompt,ChoicePrompt,ListStyle,DialogSet} =require('botbuilder-dialogs');

const initialId = 'main';
const text = require('./text.js');
const CHOICE ='choiceprompt';
const{RequestLeaveDialog}=require('./RequestLeaveDialog');
const REQUEST_LEAVE ='RequestLeaveDialog';

class HR extends ComponentDialog{
    constructor(id) {
        super(id);

        // ID of the child dialog that should be started anytime the component is started.
        this.initialDialogId = initialId;

        // Define the prompts used in this conversation flow.
        this.prompt=new ChoicePrompt(CHOICE);
        this.prompt.style=ListStyle.suggestedAction
        this.addDialog(this.prompt)
        this.dialogs = new DialogSet(this.dialogStateAccessor)
        .add(new RequestLeaveDialog(REQUEST_LEAVE))
        .add(this.prompt)
        
    
        // Define the conversation flow using a waterfall model.
        .add(new WaterfallDialog(initialId, [
            async function (step) {
                // Clear the guest information and prompt for the guest's name.
                return await step.prompt(CHOICE, {
                    prompt: 'Please choose an option.',
                    retryPrompt: 'Sorry, please choose a location from the list.',
                    choices: text.options,
                });
            },
            async function (step) {
                // const dc = await this.dialogs.createContext(step.context);
                // const user = await this.userInfoAccessor.get(step.context);
                if(step.result.value=='Request Leave'){
                    return await step.beginDialog(REQUEST_LEAVE);
                }
            }
        ]));
    }
   
}
exports.HRDialog =HR;
