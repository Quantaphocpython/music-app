const $=document.querySelector.bind(document)
const $$=document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = "player"

const player=$('.player')
const heading =$('header h2')
const cdThumb=$('.cd-thumb')
const audio=$('#audio')
const cd=$('.cd')
const playBtn=$('.btn-toggle-play')
const progress=$('#progress')
const nextBtn=$('.btn-next')
const prevBtn=$('.btn-prev')
const randomBtn=$('.btn-random')
const indexPlayed=[]
const repeatBtn=$('.btn-repeat')
const playList=$('.playlist')
const menuBtn=$('.dashboard__icon')

const app={
    currentIndex: 0,
    isPlaying: false,
    isRandom:false,
    isRepeat:false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs:[
        {
            name: "Making My Way",
            singer: "Sơn Tùng",
            path: "./song/song1.mp3",
            image: "./img/anh1.jpg"
        },
        {
            name: "Vết Mưa",
            singer: "Vũ Cát Tường",
            path: "./song/song2.mp3",
            image: "./img/anh2.jpg"
        },
        {
            name: "Hẹn ngày mai yêu",
            singer: "Long Cao",
            path: "./song/song3.mp3",
            image: "./img/anh3.jpg"
        },
        {
            name: "Chạy Ngay Đi",
            singer: "Sơn Tùng",
            path: "./song/song4.mp3",
            image: "./img/anh4.jpg"
        },
        {
            name: "Mơ",
            singer: "Vũ Cát Tường",
            path: "./song/song5.mp3",
            image: "./img/anh5.jpg"
        },
        {
            name: "Nơi Này Có Anh",
            singer: "Sơn Tùng",
            path: "./song/song6.mp3",
            image: "./img/anh6.jpg"
        },
        {
            name: "Xin Lỗi",
            singer: "Nguyên Hà",
            path: "./song/song7.mp3",
            image: "./img/anh7.jpg"
        },
        {
            name: "Như Một Giấc Mơ",
            singer: "Mỹ Tâm",
            path: "./song/song8.mp3",
            image: "./img/anh8.jpg"
        },

        
    ],
    setConfig:function(key,value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config))
    },
    render:function(){
        const htmls=this.songs.map((song,index)=> {
            return `
            <div class="song ${index===this.currentIndex ? 'active' :''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                 <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>    
            `
        })
        playList.innerHTML =htmls.join('')
    },
    defineProperty : function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        }
        )
    },
    handleEvents : function() {
        const _this = this
        const cdWidth=cd.offsetWidth

        // xử lí CD quay/ dừng
        const cdThumbAnimate=cdThumb.animate([
            {transform:"rotate(360deg)"}
        ], {
            duration: 10000,
            iterations:Infinity
        })
        cdThumbAnimate.pause()

        // xử lí phóng to/ thu nhỏ cd
        document.onscroll = function() {
            const scrollTop = window.scrollY
            const newCdWidth=cdWidth-scrollTop
            
            cd.style.width=newCdWidth > 0 ? newCdWidth+'px': 0
            cd.style.opacity=newCdWidth / cdWidth 
        }

        // xử lí khi click play
        playBtn.onclick=function() {
            if(_this.isPlaying) {
                audio.pause()
            }
            else {
                 audio.play()
            }
        }

        //khi  song dc play 
        audio.onplay=function() {
            _this.isPlaying=true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        // khi song pause
        audio.onpause=function() {
            _this.isPlaying=false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        //khi tiến độ bài hát thay đổi
        audio.ontimeupdate=function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime/audio.duration * 100)
                progress.value=progressPercent 
            }
        }

        //sử lí khi tua
        progress.oninput=function(e) {
            const seekTime=audio.duration/100*e.target.value
            audio.currentTime=seekTime
        }

        // khi next song
        nextBtn.onclick=function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            }
            else {
                _this.nextSong()
            }
            audio.play()
            _this.render() 
            _this.scrollToActiveSong()
        }
        // khi previous song
        prevBtn.onclick=function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            }
            else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // xử lí bật/tắt random
        randomBtn.onclick=function(e) {
            _this.isRandom=!_this.isRandom
            _this.setConfig('isRandom',_this.isRandom)
            randomBtn.classList.toggle('active',_this.isRandom)
        }

        // xử lí lặp song
        repeatBtn.onclick=function(e) {
            _this.isRepeat=!_this.isRepeat
            _this.setConfig('isRepeat',_this.isRepeat)
            repeatBtn.classList.toggle('active',_this.isRepeat)
        }

        // xử lí next song khi audio ended
        audio.onended=function() {
            _this.playOnEnded()
            audio.play()
        }
        // lắng nghe hành vi click vào playlist
        playList.onclick=function(e) {
            // xử lí khi click vào song
            const songNode=e.target.closest('.song:not(.active)')
            const optionNode=e.target.closest('.song:not(.option)')
            if(songNode || !optionNode) {
                //xử lí khi click vào song
                if(songNode) {
                    _this.currentIndex=Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                    
                }
                if(optionNode) {
                    //xử lí với option
                }
            }
        }
        menuBtn.onclick=function(){
            if( playList.getAttribute('style')=='display:block;') {
                playList.setAttribute('style', 'display:none;')
            }
            else {
                playList.setAttribute('style', 'display:block;');
                menuBtn.classList.add('active');
            }
        }
    
    },

    scrollToActiveSong : function() {
        $('.song.active').scrollIntoView({
            behavior:'smooth',
            block:this.currentIndex<6 ? 'end' :'center',
        }) 
        
    },

    loadCurrentSong : function(){
        heading.textContent=this.currentSong.name
        cdThumb.style.backgroundImage=`url('${this.currentSong.image}')`
        audio.src=this.currentSong.path
    },
    loadConfig:function(config){
        this.isRandom=this.config.isRandom
        this.isRepeat=this.config.isRepeat
    },
    nextSong : function(){
        this.currentIndex++
        if(this.currentIndex>=this.songs.length) {
            this.currentIndex=0
        }
        this.loadCurrentSong()
    },
    prevSong : function(){
        this.currentIndex--
        if(this.currentIndex<0) {
            this.currentIndex=this.songs.length-1
        }
        this.loadCurrentSong()
    },
    playRandomSong:function(){
        let newIndex
        do {
            newIndex=Math.floor(Math.random()*this.songs.length)
        } while(this.currentIndex === newIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },   
    playOnEnded:function(){
        indexPlayed.push(this.currentIndex)
        if(this.isRandom) {
            let newIndex,a=true
            while(a) {
                newIndex=Math.floor(Math.random()*this.songs.length)
                if(!indexPlayed.includes(newIndex)) {
                    a=false
                }
                this.currentIndex=newIndex
                this.loadCurrentSong()
            }
            if(indexPlayed.length===this.songs.length) {
                indexPlayed=[]
            }
        } 
        else if(this.isRepeat) {
            audio.play()
        }
        else {
            this.nextSong()
        }
    },
   

    start:function() {
        //gán cấu hình từ config vào object
        this.loadConfig()

        //Định nghĩa các thuộc tính cho object
        this.defineProperty()

        // lắng nghe các sự kiện trong dom events
        this.handleEvents()

        // tai thong tin bai hat dau tien
        this.loadCurrentSong()

        this.render()

        //Hiển thị trạng thái ban đầu của button repeat và random
        randomBtn.classList.toggle('active',this.isRandom)
        repeatBtn.classList.toggle('active',this.isRepeat)
    }
}
app.start()
