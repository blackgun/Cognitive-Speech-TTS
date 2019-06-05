// To install dependencies, run: npm install
const xmlbuilder = require('xmlbuilder');
// request-promise has a dependency on request
const rp = require('request-promise');
const readline = require('readline-sync');
const fs = require('fs');

// Gets an access token.
function getAccessToken(subscriptionKey) {
    let options = {
        method: 'POST',
        uri: 'https://canadacentral.api.cognitive.microsoft.com/sts/v1.0/issueToken',
        headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey
        }
    }
    return rp(options);
}

// Converts text to speech using the input from readline.
function listVoice(accessToken) {

    let options = {
        method: 'GET',
        baseUrl: 'https://canadacentral.tts.speech.microsoft.com',
        url: '/cognitiveservices/voices/list',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
        }
    }

    let request = rp(options)
        .on('response', (response) => {
            if (response.statusCode === 200) {
                request.pipe(fs.createWriteStream('VoiceList.json'));
                console.log('\nYour file is ready.\n')
            }
        });
    return request;

};

// Use async and await to get the token before attempting
// to convert text to speech.
async function main() {
    // Reads subscription key from env variable.
    // You can replace this with a string containing your subscription key. If
    // you prefer not to read from an env variable.
    // e.g. const subscriptionKey = "your_key_here";

    // const subscriptionKey = process.env.SPEECH_SERVICE_KEY;
    const subscriptionKey = "be86a5b9816d49b89cd3e5d55538c8af";

    if (!subscriptionKey) {
        throw new Error('Environment variable for your subscription key is not set.')
    };

    try {
        const accessToken = await getAccessToken(subscriptionKey);
        console.log('Token:',accessToken);
        await listVoice(accessToken);
    } catch (err) {
        console.log(`Something went wrong: ${err}`);
    }
}

// Run the application
main()
