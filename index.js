const Alexa = require('ask-sdk-core');

const SKILL_NAME = 'Splurge Stopper';

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = `Welcome to Splurge Stopper! Ask me why you shouldn't spend a certain amount of money on something.`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(SKILL_NAME, speechText)
            .getResponse();
    }
};

const CalculateIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'CalculateIntent';
    },
    handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request.intent.slots;

        const invalidDollars = slots.dollars && slots.dollars.value === '?';
        const invalidCents = slots.cents && slots.cents.value === '?';
        if (invalidDollars || invalidCents) {
            const speechText = `Sorry, I didn't understand the amount. Can you try again?`;
            return handlerInput.responseBuilder
                .speak(speechText)
                .withSimpleCard(SKILL_NAME, speechText)
                .getResponse();
        }

        const dollars = slots.dollars && slots.dollars.value ? parseInt(slots.dollars.value, 10) : 0;
        const cents = slots.cents && slots.cents.value ? parseInt(slots.cents.value, 10) : 0;

        if ((!dollars && !cents) || dollars < 0 || cents < 0) {
            const speechText = `It's free! Go ahead, and buy it.`;
            return handlerInput.responseBuilder
                .speak(speechText)
                .withSimpleCard(SKILL_NAME, speechText)
                .getResponse();
        }

        const currentAmount = dollars + cents / 100;
        const growthRate = 1.06;
        const periods = [10, 20, 30, 40];
        let futureAmounts = '';
        periods.forEach((years, index) => {
           const lastPeriod = index === periods.length - 1;
           const futureDollars = currentAmount * growthRate ** years;
           const futureAmount = futureDollars >= 1.0 ? Math.round(futureDollars) : Math.floor(futureDollars * 100);
           let currency = futureDollars >= 1.0 ? 'dollar' : 'cent';
           if (futureAmount !== 1) {
               currency += 's';
           }
           futureAmounts += `${lastPeriod ? ' or' : ''} <emphasis>${futureAmount} ${currency}</emphasis> in ${years} years${lastPeriod ? '' : ','}`;
        });

        const speechText = `Because if you invest it instead, you might have about${futureAmounts}.`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard(SKILL_NAME, speechText)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = `You can ask me something like: why shouldn't I spend 80 dollars on fancy socks?`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(SKILL_NAME, speechText)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard(SKILL_NAME, speechText)
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
     .addRequestHandlers(LaunchRequestHandler,
                         CalculateIntentHandler,
                         HelpIntentHandler,
                         CancelAndStopIntentHandler)
     .lambda();
