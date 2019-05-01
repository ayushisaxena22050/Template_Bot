const { ComponentDialog,WaterfallDialog,TextPrompt,ChoicePrompt,ListStyle,DialogSet,DateTimePrompt} =require('botbuilder-dialogs');
const {CardFactory} =require('botbuilder')

const initialId = 'mainDialog';
const text = require('./text.js');
const CHOICE ='choiceprompt';
const DAYS ='Days';
const DATE ='Date';
var moment = require('moment');
const Confirmation=require('./Leave_confirmation.js');
class RequestLeaveDialog extends ComponentDialog{
    constructor(id) {
        super(id);

        // ID of the child dialog that should be started anytime the component is started.
        this.initialDialogId = initialId;

        // Define the prompts used in this conversation flow.
        this.prompt1=new ChoicePrompt(CHOICE);
        this.prompt1.style=ListStyle.suggestedAction
        this.addDialog(this.prompt1)
        this.addDialog(new TextPrompt(DAYS))
        this.addDialog(new DateTimePrompt(DATE),this.datevalidator);
        // Define the conversation flow using a waterfall model.
        this.addDialog(new WaterfallDialog(initialId, [
            async function (step) {
                step.values.employeeInfo = {};
                return await step.prompt(CHOICE, {
                    prompt: 'Which type of leave you want ?',
                    retryPrompt: 'Sorry, please choose a location from the list.',
                    choices: text.options2,
                });
            },
            async function (step) {
                // Save the name and prompt for the room number.
                step.values.employeeInfo.Leave_Type = step.result.value;
                return await step.prompt(DAYS,'How many days leaves you want to apply?')
            },
            async function (step){
            step.values.employeeInfo.No_Of_Days=step.result;
            if(step.values.employeeInfo.Leave_Type===text.options2[0]){
                    if(step.values.employeeInfo.No_Of_Days>3){
                        return await step.context.sendActivity('Sorry!! Sick Leave of more than 3 days is not allowed.')
                    }
                }else if(step.values.employeeInfo.Leave_Type===text.options2[2]){
                    if(step.values.employeeInfo.No_Of_Days>1){
                        return await step.context.sendActivity('Sorry!! Earned Leave of more than 1 days are not allowed.')
                    }
                }
                    else if(step.values.employeeInfo.Leave_Type===text.options2[1]){
                        if(step.values.employeeInfo.No_Of_Days>2){
                            return await step.context.sendActivity('Sorry!! Casual Leave of more than 2 days are not allowed.')
                        }
    
                    }
                

                return await step.prompt(DATE,'Please Mention Starting date of your leaves in YYYY-mm-dd format?')
            },
            async function (step){
                var Current_date=moment();
                var Starting_date=moment(step.result[0].value);
                var new_date = moment(Starting_date).format('YYYY-MM-DD');
                var End_date=Starting_date.add(step.values.employeeInfo.No_Of_Days,'days').format("YYYY-MM-DD");
                var date_diff =Starting_date.diff(Current_date,"days");
                var Leave_type=step.values.employeeInfo.Leave_Type;
                var No_Of_Days=step.values.employeeInfo.No_Of_Days;
                var card = await Confirmation.insertdata(Leave_type, No_Of_Days, new_date,End_date);
            
                if(step.values.employeeInfo.Leave_Type===text.options2[0]){
                    if(date_diff>3){
                        return await step.context.sendActivity(`Sorry you can't apply sick leave foe two days more than current date`)
                    }
                    else if(Starting_date>moment()){
                        await step.context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] })
                    }
                    else{
                        return await step.context.sendActivity(`You can't apply leave for back date.` );
                    }
                    
                    
                }else {
                    if(Starting_date>moment()){
                        await step.context.sendActivity({ text: 'asd',attachments: [CardFactory.adaptiveCard(card)] });
                }
                else{
                    return await step.context.sendActivity(`You can't apply leave for back date.` );
                }
                
            }   
            },
        async function (step){
            
        }
        ]));
    }
    async datevalidator(promptContext){
        console.log(promptContext)
        if (!promptContext.recognized.succeeded) {
            await promptContext.context.sendActivity(
                "I'm sorry, I do not understand. Please enter the date or time for your reservation.");
            return false;
        }
        
    }
   
}
exports.RequestLeaveDialog =RequestLeaveDialog;
