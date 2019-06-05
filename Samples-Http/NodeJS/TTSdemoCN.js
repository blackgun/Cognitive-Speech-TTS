// To install dependencies, run: npm install
const xmlbuilder = require('xmlbuilder');
// request-promise has a dependency on request
const rp = require('request-promise');
const fs = require('fs');
const readline = require('readline-sync');


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
function textToSpeech(accessToken, text) {
    // Create the SSML request.
    let xml_body = xmlbuilder.create('speak')
        .att('version', '1.0')
        .att('xml:lang', 'zh-CN')
        .ele('voice')
        .att('xml:lang', 'zh-CN')
        .att('name', 'zh-CN-XiaoxiaoNeural') // Short name for 'Microsoft Server Speech Text to Speech Voice (en-US, Guy24KRUS)'
        .txt(text)
        .end();
    // Convert the XML into a string to send in the TTS request.
    let body = xml_body.toString();

    let options = {
        method: 'POST',
        baseUrl: 'https://canadacentral.tts.speech.microsoft.com/',
        url: 'cognitiveservices/v1',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
            'User-Agent': 'Test',
            'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
            'Content-Type': 'application/ssml+xml'
        },
        body: body
    }

    let request = rp(options)
        .on('response', (response) => {
            if (response.statusCode === 200) {
                request.pipe(fs.createWriteStream('TTSOutputCN.wav'));
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
    // Prompts the user to input text.
    // const text = readline.question('What would you like to convert to speech? ');
    const text = '卡梅拉更喜欢听鸬鹚佩罗讲大海的故事。佩罗曾经游历过很多地方！尽管他说话有些夸张，但卡梅拉还是十分着迷这些美妙的故事。总有那么一天，我也要去看看大海。';
    console.log('start CN 1...');
    try {
        const accessToken = await getAccessToken(subscriptionKey);
        console.log('Token:',accessToken);
        await textToSpeech(accessToken, text);
    } catch (err) {
        console.log(`Something went wrong: ${err}`);
    }
}

// Run the application
main()
