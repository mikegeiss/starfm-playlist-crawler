import moment from 'moment';
import axios from 'axios';
import { loadStorage, updateStorage } from 'webtask-storage-async';

moment.locale('de');

const STARFM_URL = "https://berlin.starfm.de/player/ajax/getCurrentSongList.php";
const TIME_FORMAT = 'DD.MM.YYYY HH:mm:ss';
const SONGS_STORAGE_KEY = "songs";
module.exports = (context, callback) => {

  console.log('start');

  let logs = [];

  run().then(
    numberOfNewSongs => {
      callback(null, { success: `${numberOfNewSongs} neue Songs gefunden`, logs });
    },
    error => {
      callback(null, { error, logs });
    }
  );
  async function run() {
    let storage = await loadStorage(context.storage, SONGS_STORAGE_KEY);
    if (!storage) {
      storage = {};
    }

    const response = await axios.get(STARFM_URL, { headers: { "Accept-Charset": "utf-8" } });
    const starfm: StarFmResult = (JSON.parse(response.data.substring(1, response.data.length - 2)));
    let numberOfNewSongs = 0;
    try {
      const songs: Song[] = Object.values(starfm.all);
      songs.forEach((song) => {
        const [hour, minute, second] = song.cDate.split(":");
        const timestamp = moment()
          .set("hour", parseInt(hour, 10))
          .set("minute", parseInt(minute, 10))
          .set("second", parseInt(second, 10));
        if (!storage[timestamp.format(TIME_FORMAT)]) {
          const entry = `${song.artist} - ${song.song}`;
          storage[timestamp.format(TIME_FORMAT)] = entry;
          logs.push(`added: ${entry} (${timestamp.format(TIME_FORMAT)})`);
          numberOfNewSongs++;
        }
      })

      await updateStorage(context.storage, SONGS_STORAGE_KEY, storage);
      return numberOfNewSongs
    } catch (error) {
      console.error(error);
    }
  }

  function log(message: any) {
    logs.push(message);
  }
}

interface StarFmResult {
  all: { [key: string]: Song }
}
interface Song {
  soId: string,
  artist: string,
  song: string,
  cDate: string,
  image: string
}