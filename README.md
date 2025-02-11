# charlie-demo

## charlie demo for interview-quiz.docx

To run client with react and server with nodejs, please run npm install in folder nodejs-server and react-client.
Then in the folder build, run npm run build-react-nodejs
Build result will be put in the folder dist
Run node server.bundle.js under the dist folder, a server(<http://127.0.0.1:27321/>) will be launched.
No need to launch a real CouchDB instance, the server will use a memory PouchDB database for mock data if it failed to connect the CouchDB.
Relevant config please see the file: config.json.
If need change these variables, please set an environment variable with the same name.
Varialbes - couchDBAddress, couchDBUserName, couchDBPassword and dbName - are for CouchDB settings.
Variables - baseV0URL, serverAddress and serverPort - are for the http server settings.
The variable - baseV0URL - is to set the root path for the backend APIs.
A docker image can be built by file: dockerfile-nodejs
