const container = document.querySelector(".image-container")
const startButton = document.querySelector(".start-button")
const gameText = document.querySelector(".game-text")
const playTime = document.querySelector(".play-time")

const tileCount = 9;

let tiles = [];
const dragged = {
  el: null,
  class: null,
  index: null,
}
let isPlaying = false;
let timeInterval = null; 
let time = 0;

function play() {
  var audio = document.getElementById('audio_play');
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
    audio.currentTime = 0
  }
} 


//퍼즐이 다 맞춰지면 게임 종료
function checkStatus(){
  const currentList = [...container.children];
  const unMatchedList = currentList.filter((child, index) => Number(child.getAttribute("data-index")) !== index)
  if(unMatchedList.length === 0){
    gameText.style.display = "block";
    isPlaying = false;
    clearInterval(timeInterval)
  }
}

//게임 시작 구현
function setGame() {
  play();
  isPlaying = true;
  time = 0;
  container.innerHTML = "";
  gameText.style.display = 'none'
  clearInterval(timeInterval)

  tiles = createImageTiles();
  tiles.forEach(tile => container.appendChild(tile))
  setTimeout(()=>{
    container.innerHTML = "";
    shuffle(tiles).forEach(tile => container.appendChild(tile))
    timeInterval = setInterval(() => {
      playTime.innerText = time;
      time++;
    }, 1000)
  }, 2000)
}


  function createImageTiles(){
    const tempArray = [];
      Array(tileCount).fill().forEach((_, i) => {
        const li = document.createElement("li");
        li.setAttribute('data-index', i)
        li.setAttribute('draggable', 'true');
        li.classList.add(`list${i}`);
        tempArray.push(li)
      })
      return tempArray;
    }

//퍼즐이 맞춰질 때마다 index 숫자를 줄여서 이후 완성여부를 구현함
function shuffle(array){
  let index = array.length - 1;
  while(index > 0){
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]]
    index--;
  }
  return array;
}


// events

container.addEventListener('dragstart', e => {
  play();

  if(!isPlaying) return;
  const obj = e.target;
  dragged.el = obj;
  dragged.class = obj.className;
  dragged.index = [...obj.parentNode.children].indexOf(obj);
})
container.addEventListener('dragover', e => {
  e.preventDefault()
})
container.addEventListener('drop', e => {
  if(!isPlaying) return;
  const obj = e.target;

  if(obj.className !== dragged.class){
    let originPlace;
    let isLast = false;

    if(dragged.el.nextSibling){
      originPlace = dragged.el.nextSibling
    } else {
        originPlace = dragged.el.previousSibling
        isLast = true;
      }
      const droppedIndex = [...obj.parentNode.children].indexOf(obj);
      dragged.index > droppedIndex ? obj.before(dragged.el) : obj.after(dragged.el)
      isLast ? originPlace.after(obj) : originPlace.before(obj)
  }
  checkStatus();
})

startButton.addEventListener('click', () => {
  setGame()
})