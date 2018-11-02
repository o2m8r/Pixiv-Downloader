var casper = require('casper').create({
    logLevel: "info",
    verbose: true,
    onDie: function(){
        this.echo("Script done executing.");
    },
    onPageInitialized: function(){
        this.echo("Page initialized");
    },
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        //userAgent: 'Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; SCH-I535 Build/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30'
        //userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:59.0) Gecko/20100101 Firefox/59.0',
        userAgent: 'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36',
        webSecurityEnabled: false

    },
    waitTimeout: 200000
});

// TODO: Open pixiv site

casper.start("https://accounts.pixiv.net/login", function(){
    this.echo("Opening "+this.getCurrentUrl());
});

// TODO: Login to pixiv
casper.then(function(){
    this.echo(this.getCurrentUrl());
    this.echo("Entering credentials...");
    this.sendKeys('form input[autocomplete="username"]', 'INSERT_USERNAME_HERE', {keepFocus: true});
    this.sendKeys('form input[autocomplete="current-password"]', "INSERT_PASSWORD_HERE", {keepFocus: true});
    this.sendKeys('button.signup-form__submit', casper.page.event.key.Enter , {keepFocus: true});
});

casper.wait(5000); // 5 seconds wait para sa ajax response
// TODO: Check if login success


// TODO: Go to bookmarks
// TODO: Gather all pics
casper.thenOpen("https://www.pixiv.net/bookmark.php", function(){
    
    // TODO: Get the count of all bookmark pages
    var pageCount = this.page.evaluate(function() {
        var pages = document.querySelectorAll('ul.pagenum li').length;
        return document.querySelectorAll('ul.pagenum li')[pages-1].textContent;
    });

    // TODO: Add referer
    casper.then(function() {
        this.echo("Adding referer...");
        this.page.customHeaders = {
            "Referer" : "https://www.pixiv.net/"
        };
    });

    // print pages count
    this.echo("Bookmarks pages count: "+pageCount);

    // TODO: Get all the pics on each pages
    var bookmarkPage = new Array();
    bookmarkPage.push(this.getCurrentUrl());

    for(var i = 2; i <= pageCount; i++){
        bookmarkPage.push(this.getCurrentUrl()+"&p="+i);
    }
    

    casper.each(bookmarkPage, function(self, link){
        self.thenOpen(link, function(response){
            var imageLinks = this.page.evaluate(function(){
            var currentImgCount = document.querySelectorAll('div.imgbox img').length;
            var links = new Array();
            for(var i = 0; i <= currentImgCount-1; i++){
                // TODO: Edit all the pic links
                links.push("https://i.pximg.net/img-original/"+document.querySelectorAll('div.imgbox img')[i].src.substr(41,35)+".png");
            }
            return links;
            });
        this.echo("Current Bookmark")
        // TODO: Open i.pximg.net
        // TODO: Download every single pic
        casper.each(imageLinks, function(self, link){
            self.thenOpen(link, function(response){
                if(response.status === 200){
                    var fileName = this.getCurrentUrl().substr(57,11)+".png";
                    this.echo("Saving image --> "+fileName);
                    this.download(link, fileName);
                }else{
                    var jpgLink = "https://i.pximg.net/img-original/"+this.getCurrentUrl().substr(33,35)+".jpg";
                    casper.thenOpen(jpgLink, function(response){
                        if(response.status === 200){
                            var fileName = this.getCurrentUrl().substr(57,11)+".jpg";
                            this.echo("Saving image --> "+fileName);
                            this.download(jpgLink, fileName);
                        }else{
                            this.echo("Code: "+response.status);
                        }
                    });
                    
                }
            })
        });

        })
    });


   
    
    });
    
    
casper.run();

/*
https://www.pixiv.net/member.php?id=31428722  //profile

https://www.pixiv.net/bookmark.php?id=31428722&type=user // following

*/