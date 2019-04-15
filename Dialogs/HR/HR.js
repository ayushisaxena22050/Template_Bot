const { ComponentDialog,WaterfallDialog,TextPrompt} =require('botbuilder-dialogs');
const PROFILE_DIALOG = 'profileDialog';
const NAME_PROMPT ='nameprompt';
const DEPARTMENT ='department';
class HR extends ComponentDialog{
    constructor(dialogId,userProfileAccessor){
        super(dialogId);
        //validate what was passed in
        if(!dialogId) throw new Error('Missing Parameter. dialogId is required');
        if(!userProfileAccessor) throw new Error('Missing Parameter. userProfileAccessor required');
        //Add a waterfall dialog with two steps
        this.addDialog(new WaterfallDialog(PROFILE_DIALOG,[
            this.name_display.bind(this),
            this.name_store.bind(this),
            this.dept_display.bind(this),
            this.dept_store.bind(this)
        ]));
        //Add text prompt for name and department
        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new TextPrompt(DEPARTMENT));
        this.userProfileAccessor = userProfileAccessor;
    }
    async name_display(step){
        return await step.prompt(NAME_PROMPT,'what is your name?');
    }
    async name_store(step){
        const userProfile = await this.userProfileAccessor.get(step.context,{});
        userProfile.name = step.result;
        await this.userProfileAccessor.set(step.context,user);
        await step.prompt(DEPARTMENT,'What is your Department?')
    }
    async dept_display(step){
        const userProfile = await this.userProfileAccessor.get(step.context,{});
        userProfile.department = step.result;
        await this.userProfileAccessor.set(step.context,user);
    }
    async dept_store(step){
        const userProfile = await this.userProfileAccessor.get(step.context);
        // Display to the user their profile information and end dialog
        await step.context.sendActivity(`Hi ${ userProfile.name }, from ${ userProfile.department }, will gather information for you!`);
        return await step.endDialog();
    }
}
exports.HRDialog =HR;
