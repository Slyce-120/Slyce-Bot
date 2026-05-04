import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import chalk from 'chalk'
import fs from 'fs'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
import NodeCache from 'node-cache'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
const moduleCache = new NodeCache({ stdTTL: 300 });

/*⭑⭒━━━✦❘༻☾⋆⁺₊✧ˢᴸʸᶜᴱ✧₊⁺⋆☽༺❘✦━━━⭒⭑*/

global.zeus = ['12368910153'];
global.owner = [
  ['xxxxxxxxxxxx', 'xxxxx', true],
  ['12368910153', 'zeus', true],
  ['xxxxxxxxxxxx', 'xxxxx', true],
  ['xxxxxxxxxxxx', 'xxxxx', true],
  ['xxxxxxxxxxxx', 'xxxxx', true],
  ['xxxxxxxxxxxx', 'xxxxx', true]
];

global.mods = ['xxxxxxxxxxx', 'xxxxxxxxxxx', 'xxxxxxxxxxx']
global.prems = ['xxxxxxxxxxx', 'xxxxxxxxxxx', 'xxxxxxxxxxx']

/*⭑⭒━━━✦❘༻🩸 INFO BOT 🕊️༺❘✦━━━⭒⭑*/

global.nomepack = '𝑺𝑳𝒀𝑪𝑬 𝑩𝑶𝑻'
global.nomebot = '𝑺𝑳𝒀𝑪𝑬 𝑩𝑶𝑻'
global.wm = '𝑺𝑳𝒀𝑪𝑬 𝑩𝑶𝑻'
global.autore = '𝑺𝑳𝒀𝑪𝑬 𝑩𝑶𝑻'
global.dev = '𝑺𝑳𝒀𝑪𝑬'
global.testobot = `𝑺𝑳𝒀𝑪𝑬 𝑩𝑶𝑻`
global.versione = pkg.version
global.errore = '*ERRORE INATTESO*, UTILIZZA IL COMANDO .segnala (errore) per contattare lo sviluppatore. contatto diretto:+39 370 133 0693'

/*⭑⭒━━━✦❘༻🌐 LINK 🌐༺❘✦━━━⭒⭑*/

global.repobot ='https//wa.me/393701330693'
global.gruppo = ''
global.insta = ''

/*⭑⭒━━━✦❘༻ MODULI ༺❘✦━━━⭒⭑*/

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment

/*⭑⭒━━━✦❘🗝️ API KEYS 🌍༺❘✦━━━⭒⭑*/

global.APIKeys = { // le keys con scritto "varebot" vanno cambiate con keys valide
    spotifyclientid: 'varebot',
    spotifysecret: 'varebot',
    browserless: 'varebot',
    screenshotone: 'varebot',
    screenshotone_default: 'varebot',
    tmdb: 'varebot',
    gemini: 'varebot',
    ocrspace: 'varebot',
    assemblyai: 'varebot',
    google: 'varebot',
    googlex: 'varebot',
    googleCX: 'varebot',
    genius: 'varebot',
    unsplash: 'varebot',
    removebg: 'FEx4CYmYN1QRQWD1mbZp87jV',
    openrouter: 'varebot',
    lastfm: '36f859a1fc4121e7f0e931806507d5f9',
    sightengine_user: 'varebot',
    sightengine_secret: 'varebot'
};


/*⭑⭒━━━✦❘༻🪷 SISTEMA XP/EURO 💸༺❘✦━━━⭒⭑*/

global.multiplier = 1 // piu è alto piu è facile guardagnare euro e xp

/*⭑⭒━━━✦❘༻📦 RELOAD 📦༺❘✦━━━⭒⭑*/

let filePath = fileURLToPath(import.meta.url)
let fileUrl = pathToFileURL(filePath).href
const reloadConfig = async () => {
  const cached = moduleCache.get(fileUrl);
  if (cached) return cached;
  unwatchFile(filePath)
  console.log(chalk.bgHex('#3b0d95')(chalk.white.bold("File: 'config.js' Aggiornato")))
  const module = await import(`${fileUrl}?update=${Date.now()}`)
  moduleCache.set(fileUrl, module, { ttl: 300 });
  return module;
}
watchFile(filePath, reloadConfig)