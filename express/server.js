// 'use strict';
// const express = require('express');
// const serverless = require('serverless-http');




// const cors =require( "cors");
// const ytdl =require( "ytdl");
// const requestPromise =require( "request-promise");
// const prettyMs =require( "pretty-ms");
// const app = express()
//   .use(cors({
//     origin: '*',
//   }))
//   .get('/', (req, res) => {
//     res.sendFile(process.cwd() + "/index.html");
//     // res.send('ok boomer');
//   })
//   .get('/search/', async ({ query }, response) => {
//     const items = await search({ Text: query.q });
//     response.json(items);
//   })
//   .get("/stream/", async ({ query }, response) => {
//     ytdl(query.url, {
//       quality: "highestaudio"
//     }).pipe(response)
//   })
//   .get('/download/', async ({ query }, response) => {
//     const itemInfo = await ytdl.getInfo(query.url, {
//       lang: 'ar',
//     });
//     response.json({
//       stream: itemInfo.formats.filter(b => b.hasAudio).sort((a, b) => b.audioBitrate - a.audioBitrate)[0].url,
//       related: itemInfo.related_videos.map(video => {
//         return ({
//           url: 'https://youtube.com/watch?v=' + video.id,
//           title: video.title,
//           duration: prettyMs(video.length_seconds * 1000, { colonNotation: true }),
//           thumbnail: video.thumbnails[0].url,
//           author: video.author.name
//         });
//       })
//     });
//   })
//   .listen(process.env.PORT || 3000);
// module.exports = app;
// module.exports.handler = serverless(app);
async function search({ Text }) {
  return new Promise(async (Resolve, Reject) => {
    var Assets = JSON.parse(await requestPromise('https://www.youtube.com/results?pbj=1&sp=EgIQAQ%253D%253D&search_query=' + encodeURI(Text).split(' ').join('+'), {
      headers: {
        'x-youtube-client-name': '1',
        'x-youtube-client-version': '2.20200304.01.00',
        'cookie': 'PREF=hl=ar&gl=sa'
      }
    }))[1].response.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents,
      Tracks = Assets.filter(Track => Track.videoRenderer && Track.videoRenderer.publishedTimeText).map(Track => {
        var { title, thumbnail, videoId, publishedTimeText, lengthText, viewCountText, ownerText, channelThumbnailSupportedRenderers } = Track.videoRenderer;
        return {
          duration: lengthText.simpleText,
          url: 'https://youtube.com/watch?v=' + videoId,
          thumbnail: thumbnail.thumbnails[0].url,
          title: title.runs[0].text,
          author: ownerText.runs[0].text
        }
      });
    Resolve(Tracks);
  });
}



































'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const cors =require( "cors");
const ytdl =require( "ytdl");
const requestPromise =require( "request-promise");
const prettyMs =require( "pretty-ms");
const router = express.Router();
router
.use(cors({
    origin: '*',
  }))
  .get('/', (req, res) => {
    res.sendFile(process.cwd() + "/index.html");
    // res.send('ok boomer');
  })
  .get('/search/', async ({ query }, response) => {
    const items = await search({ Text: query.q });
    response.json(items);
  })
  .get("/stream/", async ({ query }, response) => {
    ytdl(query.url, {
      quality: "lowestaudio"
    }).pipe(response)
  })
  .get('/download/', async ({ query }, response) => {
    const itemInfo = await ytdl.getInfo(query.url, {
      lang: 'ar',
    });
    response.json({
      stream: itemInfo.formats.filter(b => b.hasAudio).sort((a, b) => b.audioBitrate - a.audioBitrate)[0].url,
      related: itemInfo.related_videos.map(video => {
        return ({
          url: 'https://youtube.com/watch?v=' + video.id,
          title: video.title,
          duration: prettyMs(video.length_seconds * 1000, { colonNotation: true }),
          thumbnail: video.thumbnails[0].url,
          author: video.author.name
        });
      })
    });
  });

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);


