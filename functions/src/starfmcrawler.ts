import axios from "axios";

export class StarFmCrawler {

    private readonly STARFM_URL = "https://berlin.starfm.de/player/ajax/getCurrentSongList.php";

    public async crawl(): Promise<StarFmSong[]> {
        const response = await axios.get(this.STARFM_URL, { headers: { "Accept-Charset": "utf-8" } });
        const starfm: StarFmResult = (JSON.parse(response.data.substring(1, response.data.length - 2)));
        return Object.values(starfm.all);
    }
}

export interface StarFmResult {
    all: { [key: string]: StarFmSong }
}

export interface StarFmSong {
    soId: string,
    artist: string,
    song: string,
    cDate: string,
    image: string
}