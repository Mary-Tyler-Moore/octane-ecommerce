import Route from "@ember/routing/route";

export default class MakeProductsRoute extends Route {
  constructor() {
    super(...arguments);
    this.getRequests();
  }
  async request(endpoint) {
    let api_key = `f20903322a38f6b9d98df6a117e26ef3`;
    try {
      return await (await fetch(
        `http://ws.audioscrobbler.com/2.0/?method=${endpoint}&api_key=${api_key}&format=json`
      )).json();
    } catch (e) {
      if (endpoint.includes("gettoptags")) {
        return { toptags: { tag: [] } };
      }
      return { topalbums: { album: [] } };
    }
  }

  async getAlbums({ mbid }) {
    return this.request(`artist.gettopalbums&mbid=${mbid}`);
  }

  async getTags({ mbid }) {
    return this.request(`artist.gettoptags&mbid=${mbid}`);
  }
  async getRequests() {
    try {
      let artistsObj = await this.request("chart.gettopartists");
      let albumsAndTags = await Promise.all(
        artistsObj.artists.artist.map(async artist => {
          return {
            tags: (await this.getTags(artist)) || { toptags: { tag: [] } },
            albums: (await this.getAlbums(artist)) || {
              topalbums: { album: [] }
            }
          };
        })
      );

      let products = [];
      albumsAndTags
        .filter(albumAndTag => !albumAndTag.albums.error)
        .forEach(({ albums, tags }) => {
          products.pushObjects(
            albums.topalbums.album.map(album => {
              return {
                price: `${Math.floor(
                  Math.random() * (50 * 100 - 1 * 100) + 1 * 100
                ) /
                  (1 * 100)}`,
                brand: albums.topalbums[`@attr`].artist,
                name: album.name,
                artwork: [album.image.lastObject[`#text`]],
                _tags: tags.toptags.tag.slice(0, 2).mapBy("name")
              };
            })
          );
        });
      console.log(JSON.stringify(products)); // eslint-disable-line no-console
    } catch (e) {
      console.log(e);
    }
  }
}
