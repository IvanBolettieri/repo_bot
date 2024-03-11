// istanzio il nome
const Discord = require('discord.js');
//istanzio il client
const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"] //Aggiungere GUILD_VOICE_STATES
})

//chiave di accesso fornita dal sito per creare i bot di discord
//da aggiornare, è vecchia di un anno
client.login("MTA5MDYyMTYzNTMxNDMyMzU0Nw.GiUUQX.c8V7KhiG_PID9ntzYMGqAlP89r-E11YcgBT4Ho");


//check per vedere se è online 
client.on("ready", () => {
    console.log("ONLINE");
})

const { DisTube } = require("distube")

//Plugin facoltativi [Spotify - SoundCloud]
const { SpotifyPlugin } = require("@distube/spotify")
const { SoundCloudPlugin } = require("@distube/soundcloud")

// gestisco i plugin di spotify e soundcloud
const distube = new DisTube(client, {
    youtubeDL: false,
    plugins: [new SpotifyPlugin(), new SoundCloudPlugin()],
    leaveOnEmpty: true,
    leaveOnStop: true
});

// setto il messaggio !play usato per far partire il comanndo play
client.on("messageCreate", message => {
    if (message.content.startsWith("!play")) {
        // mi prendo il canale dove si trova il bot
        const voiceChannel = message.member.voice.channel
        // check presenza nel canale
        if (!voiceChannel) {
            return message.channel.send("Devi essere in un canale vocale")
        }

        // codice bot nella chat vocale = se il bot ha associato un id Utente vuol dire che è occupato
        const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
        if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
            return message.channel.send("Qualun'altro sta già ascoltando della musica")
        }

        //splitter per il link
        let args = message.content.split(/\s+/)
        // mi setto il link della canzone 
        let query = args.slice(1).join(" ")

        // check se ho usato il comando !play senza il link
        if (!query) {
            a
            return message.channel.send("Inserisci la canzone che vuoi ascoltre")
        }

        // mi richiamo il plugin con l'id del canale, l'entrata e la query con presente il link della canzone 
        distube.play(voiceChannelBot || voiceChannel, query, {
            member: message.member,
            textChannel: message.channel,
            message: message
        })
    }

    // comando !pause
    if (message.content == "!pause") {
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel) {
            return message.channel.send("Devi essere in un canale vocale")
        }


        // il bot è già occupato e non può essere richiamato il !pause
        const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
        if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
            return message.channel.send("Qualun'altro sta già ascoltando della musica")
        }

        // con questo try-catch gestisco l'errore della pausa in caso non vi è una canzone oppure la canzone è stata già stoppata 
        try {
            distube.pause(message)
                .catch(() => { return message.channel.send("Nessuna canzone in riproduzione o canzone già in pausa") })
        } catch {

            return message.channel.send("Nessuna canzone in riproduzione o canzone già in pausa")
        }

        // la canzone viene messa in pausa
        message.channel.send("Song paused")
    }


    // comando resume 
    if (message.content == "!resume") {
        const voiceChannel = message.member.voice.channel
        // check presenza bot in call vocale 
        if (!voiceChannel) {
            return message.channel.send("Devi essere in un canale vocale")
        }

        // il bot è già occupato e non può essere richiamato il !resume
        const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
        if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
            return message.channel.send("Qualun'altro sta già ascoltando della musica")
        }

        // qui controllo se vi è una canzone in riproduzione o se è già in riproduzione
        try {
            distube.resume(message)
                .catch(() => { return message.channel.send("Nessuna canzone in riproduzione o canzone già in riproduzione") })
        } catch {
            return message.channel.send("Nessuna canzone in riproduzione o canzone già in riproduzione")
        }

        // check passato, la canzone ri parte
        message.channel.send("Song resumed")
    }

    // qui creo il comando della cosa per aggiungere più canzoni in lista 
    if (message.content == "!queue") {
        const voiceChannel = message.member.voice.channel

        // check presenza in un canale
        if (!voiceChannel) {
            return message.channel.send("Devi essere in un canale vocale")
        }

        // check occupato
        const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
        if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
            return message.channel.send("Qualun'altro sta già ascoltando della musica")
        }


        // creo la lista richiamando il comando
        let queue = distube.getQueue(message)

        // check se la lista è vuota
        if (!queue) return message.channel.send("Coda vuota")

        // lunghezza della coda dei brani
        let totPage = Math.ceil(queue.songs.length / 10)

        // lunghezza di partenza
        let page = 1

        // creo la lista 
        let songsList = ""
        for (let i = 10 * (page - 1); i < 10 * page; i++) {
            if (queue.songs[i]) {
                songsList += `${i + 1}. **${queue.songs[i].name.length <= 100 ? queue.songs[i].name : `${queue.songs[i].name.slice(0, 100)}...`}** - ${queue.songs[i].formattedDuration}\r`
            }
        }


        // azioni custom del bot

        // ritorna tutta la lista con le canzoni
        let embed = new Discord.MessageEmbed()
            .addField("Queue", songsList)
            .setFooter(`Page ${page}/${totPage}`)

        // bottone per andare indietro
        let button1 = new Discord.MessageButton()
            .setLabel("Indietro")
            .setStyle("PRIMARY")
            .setCustomId("indietro")
            
        // bottone per andare avanti

        let button2 = new Discord.MessageButton()
            .setLabel("Avanti")
            .setStyle("PRIMARY")
            .setCustomId("avanti")

        if (page == 1) button1.setDisabled()
        if (page == totPage) button2.setDisabled()

        let row = new Discord.MessageActionRow()
            .addComponents(button1)
            .addComponents(button2)

        message.channel.send({ embeds: [embed], components: [row] })
            .then(msg => {
                const collector = msg.createMessageComponentCollector()

                collector.on("collect", i => {
                    i.deferUpdate()

                    if (i.user.id != message.author.id) return i.reply({ content: "Questo bottone non è tuo", ephemeral: true })

                    if (i.customId == "indietro") {
                        page--
                        if (page < 1) page = 1
                    }
                    if (i.customId == "avanti") {
                        page++
                        if (page > totPage) page = totPage
                    }

                    let songsList = ""
                    for (let i = 10 * (page - 1); i < 10 * page; i++) {
                        if (queue.songs[i]) {
                            songsList += `${i + 1}. **${queue.songs[i].name.length <= 100 ? queue.songs[i].name : `${queue.songs[i].name.slice(0, 100)}...`}** - ${queue.songs[i].formattedDuration}\r`
                        }
                    }

                    let embed = new Discord.MessageEmbed()
                        .addField("Queue", songsList)
                        .setFooter(`Page ${page}/${totPage}`)

                    let button1 = new Discord.MessageButton()
                        .setLabel("Indietro")
                        .setStyle("PRIMARY")
                        .setCustomId("indietro")

                    let button2 = new Discord.MessageButton()
                        .setLabel("Avanti")
                        .setStyle("PRIMARY")
                        .setCustomId("avanti")

                    if (page == 1) button1.setDisabled()
                    if (page == totPage) button2.setDisabled()

                    let row = new Discord.MessageActionRow()
                        .addComponents(button1)
                        .addComponents(button2)

                    msg.edit({ embeds: [embed], components: [row] })
                })
            })
    }

    if (message.content == "!skip") {
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel) {
            return message.channel.send("Devi essere in un canale vocale")
        }

        const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
        if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
            return message.channel.send("Qualun'altro sta già ascoltando della musica")
        }

        try {
            distube.skip(message)
                .catch(() => { return message.channel.send("Nessuna canzone in riproduzione o canzone successiva non presente") })
        } catch {
            return message.channel.send("Nessuna canzone in riproduzione o canzone successiva non presente")
        }

        message.channel.send("Song skipped")
    }

    if (message.content == "!previous") {
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel) {
            return message.channel.send("Devi essere in un canale vocale")
        }

        const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
        if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
            return message.channel.send("Qualun'altro sta già ascoltando della musica")
        }

        try {
            distube.previous(message)
                .catch(() => { return message.channel.send("Nessuna canzone in riproduzione o canzone precedente non presente") })
        } catch {
            return message.channel.send("Nessuna canzone in riproduzione o canzone precedente non presente")
        }

        message.channel.send("Previous song")
    }

    if (message.content == "!stop") {
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel) {
            return message.channel.send("Devi essere in un canale vocale")
        }

        const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
        if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
            return message.channel.send("Qualun'altro sta già ascoltando della musica")
        }

        try {
            distube.stop(message)
                .catch(() => { return message.channel.send("Nessuna canzone in riproduzione") })
        } catch {
            return message.channel.send("Nessuna canzone in riproduzione")
        }

        message.channel.send("Queue stopped")
    }
})

distube.on("addSong", (queue, song) => {
    let embed = new Discord.MessageEmbed()
        .setTitle("Song added")
        .addField("Song", song.name)

    queue.textChannel.send({ embeds: [embed] })
})

distube.on("playSong", (queue, song) => {
    let embed = new Discord.MessageEmbed()
        .setTitle("Playing song...")
        .addField("Song", song.name)
        .addField("Requested by", song.user.toString())

    queue.textChannel.send({ embeds: [embed] })
})

distube.on("searchNoResult", (message, query) => {
    message.channel.send("Canzone non trovata")
}) 