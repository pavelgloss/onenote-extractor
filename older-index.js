const axios = require('axios');
const qs = require('qs');
const express = require('express');
// import open from 'open';


const app = express();

const debuggingDoNotExchangeAuthCodeForToken = false;

// --- Azure AD Application Registration Details -------------------------------------


let accessToken = null;
// ---------------------------------------------------------------------------------



app.get('/microsoft-authorize', async (req, res) => {
    const authCode = req.query.code;
    console.log('authorize callback called, authCode: ', authCode);

    if (debuggingDoNotExchangeAuthCodeForToken) {

        return res.send(`
            <h1>Resolved auth code, but not exchanging auth code for token (debugging)</h1>
            <p>auth code: ${authCode}</p>
        `);
    }

    // extracts auth code from this sample url:
    // http:localhost/micorosoft-authorize?code=M.C509_BL2.2.U.0ed6f37d-b58a-2ad4-7f40-c4f3fca9c791&state=12345

    if (!authCode) {
        return res.status(400).send('Authorization code not found');
    }

    try {
        // Exchange the authorization code for an access token
        accessToken = await exchangeAuthCodeForAccessToken(authCode);
        console.log('Access token:', accessToken);

        // Now you can use the access token to access the user's OneNote data

        const notebooks = await getNotebooks(accessToken);
        for (const notebook of notebooks) {
            console.log(notebook.displayName + "    (id: " + notebook.id + ")");

            const sectionGroups = await getSectionGroups(accessToken, notebook.id);
            if (sectionGroups.length > 0) {
                console.log('  Section Groups:');
                for (const sectionGroup of sectionGroups) {
                    console.log('    ' + sectionGroup.displayName + "    (id: " + sectionGroup.id + ")");
                }
            }

            console.log('      Sections:');
            const sections = await getSections(accessToken, notebook.id);
            for (const section of sections) {
                console.log('        ' + section.displayName + "    (id: " + section.id + ")");

                // const pages = await getPages(accessToken, section.id);
                // for (const page of pages) {
                //     console.log('          ' + page.title + "    (id: " + page.id + ")");

            }
        }



        // render response with button to close window
        res.send(`
            <h1>Authorization successful</h1>
            <p>You can now close this window</p>
        `);

    } catch (error) {
        console.error('Error exchanging code for token:', error.response?.data || error.message);
        res.status(500).send('Failed to obtain access token');
    }
});




// ---------------------------------------------------------------------------------

(async () => {
    try {
        // change color of console text
        console.log('To authorize the app, open the following URL in your browser:');
        console.log('\x1b[36m%s\x1b[0m', getAuthUrl());

        console.log('some other message');


        // open(
        //     getAuthUrl()
        // );


        app.listen(3891, () => {
            console.log('Server for receiving authorization callbacks is running on http://localhost:3891');
        });



        // const notebooks = await getNotebooks(token);
        // console.log(notebooks);


    } catch (error) {
        console.error('Error:', error);
    }
})();



