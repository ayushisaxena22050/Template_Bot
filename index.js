// Import required pckages
const path = require('path');
const restify = require('restify');
// Import required bot services.
const {BotFrameworkAdapter,MemoryStorage,ConversationState,UserState} =require('botbuilder');
// Import required bot configuration.
const {BotConfiguration } =require('botframework-config');
// This bot's main dialog.
const{ TemplateBot } = require('./bot');
// Read botFilePath and botFileSecret from .env file
// Note: Ensure you have a .env file and include botFilePath and botFileSecret.
const ENV_FILE = path.join(__dirname,'.env');
require('dotenv').config({path : ENV_FILE});
// Get the .bot file path
const BOT_FILE = path.join(__dirname,(process.env.botFilePath || ''));
let botconfig;
try{
    // Read bot configuration from .bot file.
    botconfig = BotConfiguration.loadSync(BOT_FILE,process.env.botFileSecret);
} catch(err){
    console.log(`\nError reading .bot File.Please ensure you have valid botfilePath and botFileSecret set for your environment.`);
    console.log(`\n - The botFileSecret is available under appsettings for your azure Bot service bot.`);
    console.log(`\n -If you are running this bot locally,consider adding a .env file with botFilePath and botFileSecret.`);
    process.exit();
}
// For local development configuration as defined in .bot file.
const DEV_ENVIRONMENT ='development';
// bot name as defined in .bot file or from runtime.
const BOT_CONFIGURATION = (process.env.NODE_ENV || DEV_ENVIRONMENT);
//Create adapter:
const adapter =new BotFrameworkAdapter({
    appId: '',
    appPassword: ''
})
//Catch -all for Errors
adapter.onTurnError =async (context,error) =>{
    // This check writes out errors to console log
    console.error(`\n[onTurnError]: ${error}`)
    //Send a message to the user
    await context.sendActivity(`oops. Something went wrong!`);
    //Clear out State
    await conversationState.delete(context);
};
// Define a state store for your bot.
// A bot requires a state store to persist the dialog and user state between messages.
let conversationState ,userState;
// For local development, in-memory storage is used.
// CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
// is restarted, anything stored in memory will be gone.
const memoryStorage = new MemoryStorage();
conversationState =new ConversationState(memoryStorage);
userState = new UserState(memoryStorage)
// Create the main dialog.
let bot;
try{
    bot = new TemplateBot(conversationState,userState,botconfig);
}
catch(err){
    console.error(`[botInitializationError]: ${ err }`);
    process.exit();
}
// Create HTTP server
let server = restify.createServer();
server.listen(3978,function(){
    console.log(`\n${ server.name } listening to ${server.url}`);
    console.log(`\nGet BotFramework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open basic-bot.bot file in the Emulator`);
});
//Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages',(req,res) => {
    //Route received a request to adapter for a processing
    adapter.processActivity(req,res,async(turnContext)=>{
        //route to bot activity handler.
        await bot.onTurn(turnContext);
    });
})
