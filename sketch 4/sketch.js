
let fireworks = [];
let stars = [];
let target = 80;
let chance = 300
let articles = []
let currentWords = {};
let drawingWords = false;
let wordObjects = [];



function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value.replace(/(<([^>]+)>)/gi, "");
}

async function retriveArticles() {
    let looking = true;
    let builtArticles = []
    articles = []
   
    while(looking) {
        let tag = prompt("Please enter a tag to search for")
        try{
            await fetch(`https://fc-api.fastcompany.com/api/v2/tag-featured-feed/fastcompany/${tag}`).then(response => 
                response.json().then(data => ({
                    data: data,
                    status: response.status
                })
            ).then(async res => {
                console.log(res.status, res.data);
                let top = res.data.top;
                for(let i = 0; i< top.length; i++){
                    await fetch(`https://fc-api.fastcompany.com/api/v1/id/fastcompany/${top[i].id}`)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        let post =  data.posts[0];
                        let content = post.content.transformed;
                        let body = "";
                        content.forEach(chunks => {
                            chunks.forEach(chunk => {
                                body += ` ${decodeHtml(chunk)}` //Strips html tags and deals with encoded unicode
                            })
                        })
                        console.log("simplified body", body)
                        let words = RiTa.tokenize(body);
                        let processedText = RiTa.concordance(body, {ignoreStopWords: true}) ;
                        let tokens = Object.keys(processedText);
                        tokens.forEach(token => {
                            console.log("Token",token);
                            if(RiTa.isPunctuation(token)) {
                                console.log("in here");
                                delete processedText[token];
                                console.log(processedText);
                            }
                        })
                        // words.forEach(word => {
                        //     processedText.push(RiTa.kwic(body, word, {ignorePunctuation: true}))
                        // })
                        console.log(processedText);
                        builtArticles.push({title: decodeHtml(post.title.rendered), body: body, processedText: processedText});
                    });
                }
                console.log("Built articles",builtArticles);
                looking = false;
            })
            .catch(err => {
                alert("Please choose another tag");
            }))
        }
        catch {
            alert("please try again");
        }
        
    }
    builtArticles.forEach(article => {
        console.log("in here");
        // articles.push(new Article(0,20,article.title,20));
        // currentWords = article.processedText;
        articles.push(new Article(Math.random() * 1400,Math.random() * 400,article.title,20, article.processedText, populateWords));
    })
    return builtArticles;
}

async function setup() {
    createCanvas(1400, 700);
    let builtArticles = await retriveArticles();
}

function populateWords(wordlist){
    let words = Object.keys(wordlist);
    drawingWords = true;
    words.forEach(word => {
        wordObjects.push(new Word(Math.random() * 1400,Math.random() * 400,word, wordlist[word]*8))
    })
    console
}

function draw() {
    background(0);
    if(drawingWords) {
        wordObjects.forEach(word => {
            word.show();
            word.update();
        })
    }
    else {
        articles.forEach(article => {
            console.log("trying to show", article.title);
            article.show();
            article.update();
        })
    }
    
}

//Fire firework on point
// function mousePressed(){
//     fireworks.push(new Firework(createVector(width/2,400),createVector(mouseX,mouseY)))
// }

// //Check for chance mods
function keyPressed() {
    if(keyCode === BACKSPACE){
        drawingWords = false;
    }
    else if(keyCode === ESCAPE){
        retriveArticles();
    }
}

// //Sends firework to random point.
// function sendFirework(){
//     console.log("firing");
//     fireworks.push(new Firework(createVector(width/2,400),createVector(Math.random() *1000 +200, 100)))
// }

// //Draws moon
// function moon() {
//     fill(255,255,255,230)
//     ellipse(1300,100,110,110);
//     fill(255,255,255,255)
//     ellipse(1300,100,100,100);
// }


// // class Wave {

// //     Wave(x,y,speed){
// //         this.x = x;
// //         this.y = y;
// //         this.speed = speed;
// //     }
// // }