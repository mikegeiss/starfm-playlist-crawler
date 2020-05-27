import * as functions from 'firebase-functions';
import { StarFmCrawler, StarFmSong } from "./starfmcrawler";

const admin = require('firebase-admin');
admin.initializeApp();

export const starfmcrawler = functions.https.onRequest(async (request, response) => {
  const db = admin.firestore();
  const crawler = new StarFmCrawler();
  const songs: StarFmSong[] = await crawler.crawl();
  let counter = 0;
  songs.forEach((song) => {
    const docId = `${song.cDate}`;
    db.collection('playlist').doc(docId).get()
      .then((doc: any) => {
        if (doc.exists) {
          console.log(`already exists: ${docId} - ${song.artist} - ${song.song}`)
        }
        else {
          counter++;
          console.log(`add new document: ${docId} - ${song.artist} - ${song.song}`);
          db.collection('playlist').doc(docId).set(song).then(() => {
            // do nothing
          });
        }
      }).catch(console.error);

  });
  response.send(`Hello from Firebase!\n added ${counter} new tracks`);
});
