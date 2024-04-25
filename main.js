__path = process.cwd()
const express = require("express")
const router = express.Router();
const ytSearch = require('yt-search');
const yt = require('ytdl-core')
const fs = require('fs')
const axios = require('axios')
const cheerio = require('cheerio')
const g = require('assemblyai')

const fetch = require('node-fetch')
    const apikey = JSON.parse(fs.readFileSync(__dirname + '/registros.json'))
const esperar = async (tempo) => {
    return new Promise(funcao => setTimeout(funcao, tempo));
}

router.get('/start-sh', async (req, res) => {
           res.sendFile(__dirname + '/dostart.html')
})

router.get('/home', async (req, res) => {
	res.sendFile(__dirname + '/home.html')
})

router.get('/comandos', async (req, res) =>{
	res.sendFile(__dirname + '/comandos.html')
})

router.get('/attp', async (req, res, next) => {
       text = req.query.texto   
   hasil = 'https://xandy-api.cyclic.app/attp?texto=' + text
	  data = await fetch(hasil).then(v => v.buffer())   
         await fs.writeFileSync(__dirname+'/attp1.webp',data)
        res.sendFile(__dirname+'/attp1.webp')
})

router.get('/meufilme', async (req, res)=>{
  res.sendFile(__dirname + '/views/ITACOS.mp4')
})
router.get('/register', async (req, res) => {

  const key = req.query.apikey
  if(apikey.includes(key)){
    res.json({message: "erro: api key já registrada!"})
  }else{
    apikey.push(key)
      fs.writeFileSync(__dirname + '/registros.json', JSON.stringify(apikey))
    res.json({message: "sucesso, sua api key foi registrada agora volte e faça login"})
  }
})
router.get('/youtube', async (req, res)=>{
  const quero = req.query.q
  return new Promise(async (resolve, reject) => {
    try {
      const searchResults = await ytSearch(quero)
      const firstVideo = searchResults.videos[0]
            const id = firstVideo.videoId
            const yutub = yt.getInfo(`https://www.youtube.com/watch?v=${id}`)
            .then(async(data) => {
                let pormat = data.formats
                let video = []
                for (let i = 0; i < pormat.length; i++) {
                if (pormat[i].container == 'mp4' && pormat[i].hasVideo == true && pormat[i].hasAudio == true) {
                    let vid = pormat[i]
                    video.push(vid.url)
                }
               }
                const title = data.player_response.microformat.playerMicroformatRenderer.title.simpleText
                const thumb = data.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url
                const channel = data.player_response.microformat.playerMicroformatRenderer.ownerChannelName
                const views = data.player_response.microformat.playerMicroformatRenderer.viewCount
                const published = data.player_response.microformat.playerMicroformatRenderer.publishDate
                const result = {
                title: title,
                thumb: thumb,
                channel: channel,
                published: published,
                views: views,
                url: video[0]
                }
                const response = await axios.get(result.url, { responseType: 'arraybuffer' })
                const videoBase64 = Buffer.from(response.data, 'binary').toString('base64')
                const vide = {
                  url: result.url,
                  data: videoBase64,
                }
                res.json({ vide })
                return(result)
            })
            return(yutub)
    } catch (error) {
      console.log(error)
    }
})

})

router.get('/fala', async(req,res)=>{
 
res.json({response})
})

router.get('/transcrever', async(req, res)=>{
  const client = new g.AssemblyAI({
    apiKey: '286b8a431336478d8932ff40a0692271' 
  })
  const audioUrl =
  './tmp/audios/audio.mp3'

const config = {
  audio_url: audioUrl,
  language_code: 'pt'
}
const transcript = await client.transcripts.create(config)
    res.json({ transcript })
})
router.get('/attp', async (req, res) => {
  const texto = req.query.texto
 
})


const TMDB_API_KEY = '313071c73c4100a6996157af94de7207'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

router.get('/movie', async (req, res) => {
  try {
    const movieName = req.query.q
    const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: movieName,
        language: 'pt-BR'
      },
    });

    const firstResult = response.data.results[0];
    if (!firstResult) {
      res.json({ error: 'Nenhum resultado encontrado' });
      return;
    }

    const movieInfo = {
      title: firstResult.title,
      image: `${TMDB_IMAGE_BASE_URL}${firstResult.poster_path}`,
      runtime: firstResult.runtime,
      date: firstResult.release_date,
      description: firstResult.overview,
    };

    res.json(movieInfo);
  } catch (error) {
    console.error('Erro ao pesquisar informações do filme:', error);
    res.status(500).json({ error: 'Erro ao pesquisar informações do filme' });
  }
});

router.get('/pinterest', async (req, res) => {
  try {
    const searchTerm = req.query.q // parâmetro de pesquisa, padrão é 'gatos'

    // Realiza a solicitação HTTP para o Pinterest
    const response = await axios.get(`https://www.pinterest.com/search/pins/?q=${searchTerm}`);

    // Carrega o HTML da página
    const j = cheerio.load(response.data);

    // Exemplo: Extrair títulos dos resultados da pesquisa
    const titles = [];
    j('h2').each((index, element) => {
      titles.push(j(element).text());
    });

    res.json({ searchTerm, titles });
  } catch (error) {
    console.error('Erro ao realizar scraping no Pinterest:', error);
    res.status(500).json({ error: 'Erro ao realizar scraping no Pinterest' });
  }
})


router.get('/playaudio', async (req, res)=>{
  const quero = req.query.quero
  async function ytPlayMp3(query) {
    return new Promise(async (resolve, reject) => {
        try {
          const searchResults = await ytSearch(query)
          const firstVideo = searchResults.videos[0]
                const id = firstVideo.videoId
                const yutub = yt.getInfo(`https://www.youtube.com/watch?v=${id}`)
                .then((data) => {
                    let pormat = data.formats
                    let audio = []
                    let video = []
                    for (let i = 0; i < pormat.length; i++) {
                    if (pormat[i].mimeType == 'audio/webm; codecs=\"opus\"') {
                        let aud = pormat[i]
                        audio.push(aud.url)
                    }
                    }
                    const title = data.player_response.microformat.playerMicroformatRenderer.title.simpleText
                    const thumb = data.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url
                    const channel = data.player_response.microformat.playerMicroformatRenderer.ownerChannelName
                    const views = data.player_response.microformat.playerMicroformatRenderer.viewCount
                    const published = data.player_response.microformat.playerMicroformatRenderer.publishDate
                    const result = {
                    status: true,
                    code: 200,
                    creator: '@only_fxc7',
                    title: title,
                    thumb: thumb,
                    channel: channel,
                    published: published,
                    views: views,
                    url: audio[0]
                    }
                    res.json(result)
                    return(result)
                })
                 resolve(yutub)
                return(yutub)
               
        } catch (error) {
          console.log(error)
        }
    })
}
ytPlayMp3(quero)
})

router.get('/playvid', async (req, res, next) => {
 const quero = req.query.quero
  async function ytPlayMp4(query) {
    return new Promise(async (resolve, reject) => {
        try {
          const searchResults = await ytSearch(quero)
          const firstVideo = searchResults.videos[0]
                const id = firstVideo.videoId
                const yutub = yt.getInfo(`https://www.youtube.com/watch?v=${id}`)
                .then((data) => {
                    let pormat = data.formats
                    let video = []
                    for (let i = 0; i < pormat.length; i++) {
                    if (pormat[i].container == 'mp4' && pormat[i].hasVideo == true && pormat[i].hasAudio == true) {
                        let vid = pormat[i]
                        video.push(vid.url)
                    }
                   }
                    const title = data.player_response.microformat.playerMicroformatRenderer.title.simpleText
                    const thumb = data.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url
                    const channel = data.player_response.microformat.playerMicroformatRenderer.ownerChannelName
                    const views = data.player_response.microformat.playerMicroformatRenderer.viewCount
                    const published = data.player_response.microformat.playerMicroformatRenderer.publishDate
                    const result = {
                    title: title,
                    thumb: thumb,
                    channel: channel,
                    published: published,
                    views: views,
                    url: video[0]
                    }
                    res.json(result)
                    return(result)
                })
                return(yutub)
        } catch (error) {
          console.log(error)
        }
    })
}
ytPlayMp4(quero)
})
router.get('/play', async (req, res, next) => {
 const quero = req.query.q
  async function ytPlayMp4(query) {
    return new Promise(async (resolve, reject) => {
        try {
          const searchResults = await ytSearch(quero)
          const firstVideo = searchResults.videos[0]
                const id = firstVideo.videoId
                const yutub = yt.getInfo(`https://www.youtube.com/watch?v=${id}`)
                .then((data) => {
                    let pormat = data.formats
                    let video = []
                    for (let i = 0; i < pormat.length; i++) {
                    if (pormat[i].container == 'mp4' && pormat[i].hasVideo == true && pormat[i].hasAudio == true) {
                        let vid = pormat[i]
                        video.push(vid.url)
                    }
                   }
                    let audio = []
                    for (let i = 0; i < pormat.length; i++) {
                    if (pormat[i].mimeType == 'audio/webm; codecs=\"opus\"') {
                        let aud = pormat[i]
                        audio.push(aud.url)
                    }
                    }
        const firstVideo = searchResults.videos[0]
			
                    const title = data.player_response.microformat.playerMicroformatRenderer.title.simpleText
                    const thumb = data.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url
                    const channel = data.player_response.microformat.playerMicroformatRenderer.ownerChannelName
                    const views = data.player_response.microformat.playerMicroformatRenderer.viewCount
                    const published = data.player_response.microformat.playerMicroformatRenderer.publishDate
                    const result = {
                    title: title,
                    thumb: thumb,
                    channel: channel,
                    published: published,
                    views: views,
                    urlvideo: video[0],
	            urlaudio: audio[0],
			    url: `https://www.youtube.com/watch?v=${firstVideo.videoId}`
                    }
                    res.json(result)
                    return(result)
                })
		resolve(yutub)
                return(yutub)
        } catch (error) {
          console.log(error)
        }
    })
}
ytPlayMp4(quero)
})
router.get(`/`, async(req, res) => {
res.sendFile(__dirname + '/login.html')
})
router.get('/fazfigu', async (req, res)=>{
  if(fs.existsSync('./tmp/imagem.webp')){
    res.sendFile(__dirname+'/tmp/imagem.webp')
  }else{
    res.sendFile(__dirname+'/imagens/erro.webp')
  }
})
router.get('/fazfiguw', async (req, res)=>{
res.json({"link": "http://localhost:1406/fazfigu"})
})
router.get('/figu/:lin(*)', (req, res) => {
    const link = req.params.lin; 
    res.json({ link });
})
  const numerosPossiveis = require('./link.js');
const { existsSync } = require("fs");
  function escolherNumeroAleatorio() {
    const indiceAleatorio = Math.floor(Math.random() * numerosPossiveis.length);
    return numerosPossiveis[indiceAleatorio];
  }
  router.get('/memes', (req, res) => {
    const meme = escolherNumeroAleatorio();
    const respostaJson = {
      meme
    };
    res.json(respostaJson);
  });

  router.get('/yt', async (req, res) => {
    const query = req.query.query;
  
    try {
      const searchResults = await ytSearch(query);
  
        const firstVideo = searchResults.videos[0]
        const videoInfo = {
          channel: firstVideo.author.name,
          views: firstVideo.views,
          title: firstVideo.title,
          thumb: firstVideo.image,
          url: `https://www.youtube.com/watch?v=${firstVideo.videoId}`
        };
  
        res.json(videoInfo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao realizar a pesquisa no YouTube.' });
    }
  });
  

module.exports = router
