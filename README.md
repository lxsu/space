space
=====

Presentation
Jag har skrivit grunden till ett spaceship-spel. Detta är alltså egentligen inte något som är ett färdigt spel, utan finns som grund för de som vill bygga vidare på idén. Hela tanken bakom spelet är att det skall ritas upp en ny karaktär för varje klient. Grunden innebär att objekten, skeppen, är av samma form och för varje besökare så dyker det upp ett nytt skepp på skärmen. Vidareutvecklingen till detta kan vara något som en smårolig chatt, där varje objekt kan skapa pratbubbler och genom dem kommunicera. Eller att man skapar objekt som antingen kan fördärva objekten eller som skall förstöras AV objekten.

Installation
För att installera spelet, krävs det helt enkelt att du först och främst tankar ner det från github:
	
	git clone https://github.com/Rojo13/space.git

Därefter laddar du upp mappen space, alternativt enbart innehållet till din FTP. Spelet kommer med serverinställningar som kanske inte är optimala eller fungerar korrekt. Detta kan komma att bli något du får uppdatera i koden.

För att uppdatera dessa inställningar, får du redigera i ./js/main.js. Längst ner i filen finner du 

    //anslut till websocket
    var websocket = new WebSocket('ws://dela.no-ip.biz:1341/', 'broadcast-protocol');

Denna adress kan du ändra för att få spelet att fungera bättre, OM det är så att du anser att det fungerar dåligt som det kommer.
